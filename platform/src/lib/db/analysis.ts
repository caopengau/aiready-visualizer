import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { doc, getTableName } from './client';
import type { Analysis } from './types';
import { updateRepositoryScore } from './repositories';

export async function createAnalysis(analysis: Analysis): Promise<Analysis> {
  const TABLE_NAME = getTableName();
  const item = {
    PK: `ANALYSIS#${analysis.repoId}`,
    SK: analysis.timestamp,
    GSI2PK: `ANALYSIS#${analysis.repoId}`,
    GSI2SK: analysis.timestamp,
    ...analysis,
    createdAt: analysis.createdAt || new Date().toISOString(),
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

  // Only update repository score if analysis is completed
  if (analysis.status === 'completed') {
    await updateRepositoryScore(analysis.repoId, analysis.aiScore);
  }

  return analysis;
}

export async function listRepositoryAnalyses(
  repoId: string,
  limit = 20
): Promise<Analysis[]> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `ANALYSIS#${repoId}` },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items || []) as Analysis[];
}

export async function getLatestAnalysis(
  repoId: string,
  includeIncomplete = false
): Promise<Analysis | null> {
  const TABLE_NAME = getTableName();

  // If we only want completed ones, we can't easily query by status + timestamp in DDB without a GSI
  // But we can query the latest few and pick the first completed one
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `ANALYSIS#${repoId}` },
      ScanIndexForward: false,
      Limit: 10, // Fetch latest 10 to find a completed one
    })
  );

  const items = (result.Items || []) as Analysis[];

  if (includeIncomplete) {
    return items[0] || null;
  }

  return items.find((a) => a.status === 'completed') || items[0] || null;
}

export async function updateAnalysisStatus(params: {
  repoId: string;
  timestamp: string;
  status: 'completed' | 'failed';
  aiScore?: number;
  breakdown?: any;
  summary?: any;
  error?: string;
  commitHash?: string;
}): Promise<void> {
  const TABLE_NAME = getTableName();
  const UpdateExpression =
    'SET #s = :s, aiScore = :ais, breakdown = :b, summary = :sum, #err = :e, updatedAt = :t';
  const ExpressionAttributeNames = {
    '#s': 'status',
    '#err': 'error',
  };
  const ExpressionAttributeValues = {
    ':s': params.status,
    ':ais': params.aiScore || 0,
    ':b': params.breakdown || {},
    ':sum': params.summary || {},
    ':e': params.error || null,
    ':t': new Date().toISOString(),
  };

  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ANALYSIS#${params.repoId}`, SK: params.timestamp },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    })
  );

  if (params.status === 'completed' && params.aiScore !== undefined) {
    await updateRepositoryScore(
      params.repoId,
      params.aiScore,
      params.commitHash
    );
  }
}

export async function saveMetricPoints(params: {
  repoId: string;
  timestamp: string;
  metrics: Record<string, number>;
  runId: string;
}): Promise<void> {
  const TABLE_NAME = getTableName();
  const promises = Object.entries(params.metrics).map(([type, value]) => {
    return doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `REPO#${params.repoId}`,
          SK: `METRIC#${type}#${params.timestamp}`,
          type,
          value,
          runId: params.runId,
          timestamp: params.timestamp,
          GSI3PK: `METRIC#${type}`,
          GSI3SK: params.timestamp,
          GSI4PK: `METRIC#${params.repoId}#${type}`,
          GSI4SK: params.timestamp,
        },
      })
    );
  });

  await Promise.all(promises);
}

export async function getRepositoryMetrics(params: {
  repoId: string;
  metricType?: string;
  limit?: number;
}): Promise<any[]> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `REPO#${params.repoId}`,
        ':prefix': params.metricType
          ? `METRIC#${params.metricType}#`
          : 'METRIC#',
      },
      ScanIndexForward: true, // Chronological order
      Limit: params.limit || 100,
    })
  );
  return result.Items || [];
}

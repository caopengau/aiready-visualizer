import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { reportMeteredUsage } from '../lib/billing';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  const { userId, mutationId } = event.detail; // Expecting userId or stripeSubscriptionItemId

  if (!userId) {
    console.error('Missing userId in mutation event');
    return;
  }

  try {
    // 1. Fetch the user's Stripe Subscription Item ID for Mutation Tax
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `METADATA`,
      },
    });

    const response = await docClient.send(getCommand);
    const item = response.Item;
    const subscriptionItemId = item?.stripeMutationSubscriptionItemId;
    const coEvolutionOptIn = item?.coEvolutionOptIn;

    if (coEvolutionOptIn) {
      console.log(
        `User ${userId} has opted into co-evolution. Mutation tax waived for mutation ${mutationId}.`
      );
      return;
    }

    if (!subscriptionItemId) {
      console.warn(
        `No Stripe subscription item found for user ${userId}. Mutation tax will not be reported.`
      );
      return;
    }

    // 2. Report 1 unit ($1.00) to Stripe
    await reportMeteredUsage(subscriptionItemId, 1);

    console.log(
      `Mutation tax reported for mutation ${mutationId} (User: ${userId})`
    );
  } catch (error) {
    console.error('Error reporting mutation tax:', error);
    throw error;
  }
};

import { Agent } from 'mastra';
import { z } from 'zod';

export const RiskAssessmentAgent = new Agent({
  name: 'Risk Assessment Agent',
  instructions: `
    You are an expert software architect specialized in analyzing the risk of automated code refactorings.
    Your goal is to evaluate a set of code metrics and determine if it's safe to apply an automated fix.

    Consider the following risk factors:
    1. linesChanged: More changes increase risk.
    2. filesAffected: High blast radius increases risk.
    3. cognitiveLoad: High complexity makes it harder to verify the fix.
    4. testabilityIndex: Low testability makes it dangerous to refactor.
    5. dependencyHealth: Fragmented imports increase the chance of side effects.

    Output a JSON object with:
    - riskLevel: 'low' | 'medium' | 'high' | 'critical'
    - autoApprove: boolean (true only for 'low' risk)
    - reasoning: string
  `,
  model: {
    provider: 'openai',
    name: 'gpt-4o',
  },
});

export const RiskSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  autoApprove: z.boolean(),
  reasoning: z.string(),
});

export type RiskAssessment = z.infer<typeof RiskSchema>;

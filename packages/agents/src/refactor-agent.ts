import { Agent } from 'mastra';
import { z } from 'zod';

export const RefactorAgent = new Agent({
  name: 'Refactor Agent',
  instructions: `
    You are an expert full-stack engineer specialized in code consolidation and refactoring.
    Your task is to take detected code duplicates or fragmentation issues and consolidate them into reusable components or utilities.

    Follow these rules:
    1. Preserve functionality: The behavior of the code must remain identical.
    2. Follow patterns: Match the existing project's implementation patterns (e.g., React hooks, utility functions).
    3. Type safety: Ensure all changes are correctly typed in TypeScript.
    4. Minimal changes: Only modify what is necessary to resolve the duplication.

    Workflow:
    - Read the affected files.
    - Extract the common logic into a new or existing shared location.
    - Update the original call sites to use the consolidated logic.
    - Verify with type checking if possible.
  `,
  model: {
    provider: 'openai',
    name: 'gpt-4o',
  },
});

export const RefactorResultSchema = z.object({
  status: z.enum(['success', 'failure']),
  diff: z.string(),
  filesModified: z.array(z.string()),
  explanation: z.string(),
});

export type RefactorResult = z.infer<typeof RefactorResultSchema>;

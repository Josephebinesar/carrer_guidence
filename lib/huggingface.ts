/**
 * lib/huggingface.ts
 * Backward-compatibility shim. New code should import from @/lib/ai.
 */
export { queryHuggingFace, buildInterviewPrompt } from './ai';
export type { AIMessage as HFMessage } from './ai';

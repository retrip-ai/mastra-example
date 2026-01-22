import { useMemo } from 'react';
import type { NetworkDataPart } from '@mastra/ai-sdk';
import type { SourceData } from '@/components/chat/renderers/types';

interface NetworkDataResult {
    /** Reasoning/thinking text from the network steps */
    reasoning: string | null;
    /** Sources extracted from web-search step */
    sources: SourceData[] | null;
    /** Whether network has completed output */
    hasOutput: boolean;
    /** The final output text */
    output: string | null;
}

/**
 * Hook to extract structured data from network execution parts.
 * Parses reasoning, sources, and output from agent network data.
 * 
 * @param networkData - Network execution data from data-network part
 * @returns Structured network data including reasoning, sources, and output
 * 
 * @example
 * ```tsx
 * const { reasoning, sources, hasOutput, output } = useNetworkData(part.data);
 * 
 * if (reasoning) {
 *   return <Reasoning text={reasoning} />;
 * }
 * ```
 */
export function useNetworkData(
    networkData: NetworkDataPart['data'] | undefined
): NetworkDataResult {
    return useMemo(() => {
        if (!networkData) {
            return {
                reasoning: null,
                sources: null,
                hasOutput: false,
                output: null,
            };
        }

        // Extract reasoning from steps
        const stepWithTask = networkData.steps?.find(
            (s) => (s as { task?: { reason?: string } }).task?.reason
        ) as { task: { reason: string } } | undefined;
        const reasoning = stepWithTask?.task?.reason || null;

        // Extract sources from web-search step
        const webSearchStep = networkData.steps?.find(
            (step) => step.name === 'web-search' && step.output
        );
        let sources: SourceData[] | null = null;
        if (webSearchStep?.output) {
            const output = webSearchStep.output as { sources?: SourceData[] };
            sources = output.sources && output.sources.length > 0 ? output.sources : null;
        }

        // Extract output in order of priority:
        // 1. networkData.output (top-level, available when network finishes)
        // 2. step.output from completed steps
        // 3. step.task.text from running steps (streaming text)
        let output = networkData.output !== undefined && networkData.output !== null ? String(networkData.output) : null;

        // If no top-level output, search through steps
        if (!output && networkData.steps) {
            // Iterate through steps in reverse order to get the most recent output
            for (let i = networkData.steps.length - 1; i >= 0; i--) {
                const step = networkData.steps[i];
                
                // Check step.output first (completed steps)
                if (step.output !== undefined && step.output !== null) {
                    const stepOutput = String(step.output);
                    if (stepOutput.trim()) {
                        output = stepOutput;
                        break;
                    }
                }
                
                // Check step.task.text (streaming/running steps)
                const task = step as { task?: { text?: string } };
                if (task.task?.text) {
                    const taskText = task.task.text;
                    if (taskText.trim()) {
                        output = taskText;
                        break;
                    }
                }
            }
        }

        const hasOutput = output !== null && output.trim() !== '';

        return {
            reasoning,
            sources,
            hasOutput,
            output,
        };
    }, [networkData]);
}

/**
 * Hook to detect if text is duplicate reasoning from network data.
 * Used to avoid showing the same reasoning twice.
 * 
 * @param text - Text to check
 * @param networkReasoning - Reasoning from network data
 * @param isStreaming - Whether the message is currently streaming
 * @param isLastMessage - Whether this is the last message
 */
export function useIsDuplicateReasoning(
    text: string,
    networkReasoning: string | null,
    isStreaming: boolean,
    isLastMessage: boolean
): boolean {
    return useMemo(() => {
        if (!isStreaming || !isLastMessage) return false;
        return networkReasoning !== null && text === networkReasoning;
    }, [text, networkReasoning, isStreaming, isLastMessage]);
}

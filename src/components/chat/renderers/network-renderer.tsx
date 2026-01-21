import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { MessageResponse } from '@/components/ai-elements/message';
import { NetworkExecution } from '@/components/ai-elements/network-execution';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { useNetworkData } from '@/hooks/use-network-data';
import { toolUIRegistry } from './tool-ui-registry';
import type { MessageRenderer, NetworkPart, RendererProps } from './types';
import { isNetworkPart } from './types';

/**
 * Extract tool results that have custom UI components registered
 * Searches network steps for toolResults and matches against toolUIRegistry
 */
function extractToolUIFromNetwork(networkData: NetworkPart['data']): Array<{
    Component: FC<{ data: unknown }>;
    data: unknown;
    toolName: string;
}> {
    if (!networkData?.steps) return [];

    const results: Array<{
        Component: FC<{ data: unknown }>;
        data: unknown;
        toolName: string;
    }> = [];

    for (const step of networkData.steps) {
        const task = step as { task?: { toolResults?: Array<{ toolName?: string; result?: unknown }> } };
        const toolResults = task.task?.toolResults;
        if (!toolResults) continue;

        for (const result of toolResults) {
            if (!result.toolName) continue;

            const componentMatch = toolUIRegistry.getComponent(result.toolName, result.result);
            if (componentMatch) {
                results.push({
                    Component: componentMatch.Component,
                    data: componentMatch.data,
                    toolName: result.toolName,
                });
            }
        }
    }

    return results;
}

/**
 * Network Renderer Component
 * Renders agent network execution with reasoning, sources, and fallback output
 * Uses useNetworkData hook for data extraction
 */
const NetworkRendererComponent = memo<RendererProps<NetworkPart>>(
    ({ part, partIndex, isLastMessage, status, hasTextPart }) => {
        const networkData = part.data;
        const isStreaming = status === 'streaming';

        // Use hook for structured data extraction
        const { reasoning, sources, hasOutput, output } = useNetworkData(networkData);

        // Extract tool results that have custom UI components
        const toolUIResults = useMemo(() => extractToolUIFromNetwork(networkData), [networkData]);

        // Apply fallback only when:
        // 1. No text part in the message
        // 2. Stream finished (status === 'ready')
        // 3. Is the last message
        // 4. Network data has output
        const shouldShowFallback = !hasTextPart && status === 'ready' && isLastMessage && hasOutput;

        if (shouldShowFallback) {
            return (
                <div className="space-y-2" key={partIndex}>
                    {/* Show reasoning if exists */}
                    {reasoning && (
                        <Reasoning isStreaming={false}>
                            <ReasoningTrigger />
                            <ReasoningContent>{reasoning}</ReasoningContent>
                        </Reasoning>
                    )}
                    {/* Tool UI components from registry */}
                    {toolUIResults.map(({ Component, data, toolName }, index) => (
                        <Component data={data} key={`${toolName}-${index}`} />
                    ))}
                    {/* NetworkExecution for technical details */}
                    <NetworkExecution data={networkData} isStreaming={false} />
                    {/* Show sources if they exist */}
                    {sources && sources.length > 0 && (
                        <Sources>
                            <SourcesTrigger count={sources.length} />
                            <SourcesContent>
                                {sources.map((source, i) => (
                                    <Source
                                        description={source.description}
                                        href={source.url}
                                        key={i}
                                        lastUpdated={source.lastUpdated}
                                        title={source.title}
                                    />
                                ))}
                            </SourcesContent>
                        </Sources>
                    )}
                    {/* Show response text at the end */}
                    {output && <MessageResponse>{output}</MessageResponse>}
                </div>
            );
        }

        return (
            <div className="space-y-2" key={partIndex}>
                {/* Show reasoning if exists */}
                {reasoning && (
                    <Reasoning isStreaming={isStreaming}>
                        <ReasoningTrigger />
                        <ReasoningContent>{reasoning}</ReasoningContent>
                    </Reasoning>
                )}
                {/* Tool UI components from registry */}
                {toolUIResults.map(({ Component, data, toolName }, index) => (
                    <Component data={data} key={`${toolName}-${index}`} />
                ))}
                {/* NetworkExecution for technical details */}
                <NetworkExecution data={networkData} isStreaming={isStreaming} />
                {/* Show sources if they exist */}
                {sources && sources.length > 0 && (
                    <Sources>
                        <SourcesTrigger count={sources.length} />
                        <SourcesContent>
                            {sources.map((source, i) => (
                                <Source
                                    description={source.description}
                                    href={source.url}
                                    key={i}
                                    lastUpdated={source.lastUpdated}
                                    title={source.title}
                                />
                            ))}
                        </SourcesContent>
                    </Sources>
                )}
            </div>
        );
    }
);

NetworkRendererComponent.displayName = 'NetworkRenderer';

/**
 * Network Renderer definition for the registry
 */
export const networkRenderer: MessageRenderer<NetworkPart> = {
    type: 'data-network',
    canRender: isNetworkPart,
    Component: NetworkRendererComponent as unknown as React.FC<RendererProps>,
    priority: 15,
};


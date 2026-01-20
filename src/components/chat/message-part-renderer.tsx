import type { NetworkDataPart } from '@mastra/ai-sdk';
import type { ToolUIPart } from 'ai';
import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationCarousel,
	InlineCitationCarouselContent,
	InlineCitationCarouselHeader,
	InlineCitationCarouselIndex,
	InlineCitationCarouselItem,
	InlineCitationCarouselNext,
	InlineCitationCarouselPrev,
	InlineCitationSource,
} from '@/components/ai-elements/inline-citation';
import { MessageResponse } from '@/components/ai-elements/message';
import { NetworkExecution } from '@/components/ai-elements/network-execution';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from '@/components/ai-elements/tool';

interface MessagePartRendererProps {
	part: {
		type: string;
		[key: string]: unknown;
	};
	partIndex: number;
	isLastMessage: boolean;
	status: 'ready' | 'streaming' | 'submitted' | 'error';
	hasTextPart: boolean;
	allParts: Array<{
		type: string;
		[key: string]: unknown;
	}>;
}

export function MessagePartRenderer({
	part,
	partIndex,
	isLastMessage,
	status,
	hasTextPart,
	allParts,
}: MessagePartRendererProps) {
	// Extract sources from message parts (Perplexity Sonar format)
	const extractWebSearchSources = (): Array<{
		url: string;
		title?: string;
		description?: string;
		lastUpdated?: string;
	}> | null => {
		const sources: Array<{
			url: string;
			title?: string;
			description?: string;
			lastUpdated?: string;
		}> = [];

		for (const p of allParts) {
			// Mastra sends sources as "source-url" type when sendSources: true
			if (p.type === 'source-url') {
				const sourceData = p as {
					type: string;
					url?: string;
					title?: string;
					description?: string;
					lastUpdated?: string;
					sourceId?: string;
				};
				if (sourceData.url) {
					sources.push({
						url: sourceData.url,
						title: sourceData.title || undefined,
						description: sourceData.description || undefined,
						lastUpdated: sourceData.lastUpdated || undefined,
					});
				}
			}

			// AI SDK sends sources as parts with type "source"
			if (p.type === 'source') {
				const sourceData = (p as any).source || p;
				if (sourceData?.url) {
					sources.push({
						url: sourceData.url,
						title: sourceData.title || undefined,
						description: sourceData.description || undefined,
						lastUpdated: sourceData.lastUpdated || undefined,
					});
				}
			}
		}

		return sources.length > 0 ? sources : null;
	};

	// Extract sources from data-network step (web-search tool in Agent Network)
	const extractSourcesFromNetwork = (
		networkData: NetworkDataPart['data']
	): Array<{ url: string; title?: string; description?: string; lastUpdated?: string }> | null => {
		const webSearchStep = networkData.steps?.find(
			(step) => step.name === 'web-search' && step.output
		);

		if (!webSearchStep?.output) return null;

		const output = webSearchStep.output as {
			sources?: Array<{
				url: string;
				title?: string;
				description?: string;
				lastUpdated?: string;
			}>;
		};

		return output.sources && output.sources.length > 0 ? output.sources : null;
	};

	// Text content
	if (part.type === 'text' && 'text' in part) {
		const text = part.text as string;
		if (!text || text.trim() === '') return null;

		// Extract sources for citation parsing
		const webSources = extractWebSearchSources();

		// Check if text contains citations [1], [2], etc.
		const hasCitations = /\[\d+\]/.test(text);

		// If we have citations and sources, render with InlineCitation
		if (hasCitations && webSources && webSources.length > 0) {
			const parts = text.split(/(\[\d+\])/);

			return (
				<div className="space-y-2" key={partIndex}>
					<div>
						{parts.map((part, index) => {
							const citationMatch = part.match(/\[(\d+)\]/);
							if (citationMatch) {
								const citationNumber = Number.parseInt(citationMatch[1], 10) - 1;
								const citation = webSources[citationNumber];

								if (citation) {
									return (
										<InlineCitation key={index}>
											<InlineCitationCard>
												<InlineCitationCardTrigger sources={[citation.url]} />
												<InlineCitationCardBody>
													<InlineCitationCarousel>
														<InlineCitationCarouselHeader>
															<InlineCitationCarouselPrev />
															<InlineCitationCarouselNext />
															<InlineCitationCarouselIndex />
														</InlineCitationCarouselHeader>
														<InlineCitationCarouselContent>
															<InlineCitationCarouselItem>
																<InlineCitationSource
																	title={citation.title || new URL(citation.url).hostname}
																	url={citation.url}
																/>
															</InlineCitationCarouselItem>
														</InlineCitationCarouselContent>
													</InlineCitationCarousel>
												</InlineCitationCardBody>
											</InlineCitationCard>
										</InlineCitation>
									);
								}
							}
							return <span key={index}>{part}</span>;
						})}
					</div>
					{/* Show sources list at the bottom */}
					<Sources>
						<SourcesTrigger count={webSources.length} />
						<SourcesContent>
							{webSources.map((source, i) => (
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
				</div>
			);
		}

		// Durante streaming, verificar si este texto es el razonamiento duplicado
		if (status === 'streaming' && isLastMessage) {
			const networkPart = allParts.find((p) => p.type === 'data-network') as any;
			const reasoningText = networkPart?.data?.steps?.find((s: any) => s.task?.reason)?.task
				?.reason;

			// Si el texto coincide con el reasoning, no renderizarlo (ya está en Reasoning component)
			if (reasoningText && text === reasoningText) {
				return null;
			}
		}

		return <MessageResponse key={partIndex}>{text}</MessageResponse>;
	}

	// Reasoning/thinking content - only show during streaming on the last message
	if (part.type === 'reasoning' && 'text' in part) {
		// Only render reasoning if we're streaming and this is the last message
		if (status !== 'streaming' || !isLastMessage) {
			return null;
		}
		const text = part.text as string;
		return (
			<Reasoning isStreaming={status === 'streaming'} key={partIndex}>
				<ReasoningTrigger />
				<ReasoningContent>{text}</ReasoningContent>
			</Reasoning>
		);
	}

	// Network execution (agent networks)
	if (part.type === 'data-network' && 'data' in part) {
		const networkPart = part as NetworkDataPart;
		const networkData = networkPart.data;

		// Extraer el razonamiento del primer step con task.reason
		const stepWithTask = networkData.steps?.find((s) => (s as any).task?.reason) as
			| { task: { reason: string } }
			| undefined;
		const reasoningText = stepWithTask?.task?.reason;

		// Extraer sources del step web-search si existe
		const networkSources = extractSourcesFromNetwork(networkData);

		// Solo aplicar fallback si:
		// 1. No hay text part en el mensaje
		// 2. El stream termino (status === 'ready')
		// 3. Es el ultimo mensaje (isLastMessage === true)
		// 4. El data-network tiene output
		if (!hasTextPart && status === 'ready' && isLastMessage && networkData.output) {
			return (
				<div className="space-y-2" key={partIndex}>
					{/* Mostrar reasoning si existe */}
					{reasoningText && (
						<Reasoning isStreaming={false}>
							<ReasoningTrigger />
							<ReasoningContent>{reasoningText}</ReasoningContent>
						</Reasoning>
					)}
					{/* NetworkExecution para detalles técnicos */}
					<NetworkExecution data={networkData} isStreaming={false} />
					{/* Mostrar sources si existen */}
					{networkSources && networkSources.length > 0 && (
						<Sources>
							<SourcesTrigger count={networkSources.length} />
							<SourcesContent>
								{networkSources.map((source, i) => (
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
					{/* Mostrar el texto de la respuesta al final */}
					<MessageResponse>{String(networkData.output)}</MessageResponse>
				</div>
			);
		}

		return (
			<div className="space-y-2" key={partIndex}>
				{/* Mostrar reasoning si existe (solo estará presente durante/después del streaming, no al recargar) */}
				{reasoningText && (
					<Reasoning isStreaming={status === 'streaming'}>
						<ReasoningTrigger />
						<ReasoningContent>{reasoningText}</ReasoningContent>
					</Reasoning>
				)}
				{/* NetworkExecution para detalles técnicos */}
				<NetworkExecution data={networkData} isStreaming={status === 'streaming'} />
				{/* Mostrar sources si existen */}
				{networkSources && networkSources.length > 0 && (
					<Sources>
						<SourcesTrigger count={networkSources.length} />
						<SourcesContent>
							{networkSources.map((source, i) => (
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

	// Dynamic tool (network execution results from memory)
	if (part.type === 'dynamic-tool' && 'output' in part) {
		const dynamicPart = part as {
			type: 'dynamic-tool';
			toolCallId: string;
			toolName: string;
			state: string;
			input: unknown;
			output: {
				childMessages?: Array<{
					type: 'tool' | 'text';
					toolCallId?: string;
					toolName?: string;
					args?: Record<string, unknown>;
					toolOutput?: Record<string, unknown>;
					content?: string;
				}>;
				result?: string;
			};
		};

		return (
			<div className="space-y-2" key={partIndex}>
				{dynamicPart.output?.childMessages?.map((child, childIndex) => {
					if (child.type === 'tool') {
						// Special handling for web-search tool - show Sources component instead of Tool
						if (child.toolName === 'web-search' && child.toolOutput) {
							const webSearchOutput = child.toolOutput as {
								text?: string;
								sources?: Array<{
									url: string;
									title?: string;
									description?: string;
									lastUpdated?: string;
								}>;
							};

							if (webSearchOutput.sources && webSearchOutput.sources.length > 0) {
								return (
									<Sources key={childIndex}>
										<SourcesTrigger count={webSearchOutput.sources.length} />
										<SourcesContent>
											{webSearchOutput.sources.map((source, i) => (
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
								);
							}
							return null;
						}

						// Default tool rendering for other tools
						return (
							<Tool key={childIndex}>
								<ToolHeader
									state="output-available"
									title={child.toolName || 'Tool'}
									type={`tool-${child.toolName}`}
								/>
								<ToolContent>
									{child.args && <ToolInput input={child.args} />}
									{child.toolOutput && (
										<ToolOutput errorText={undefined} output={child.toolOutput} />
									)}
								</ToolContent>
							</Tool>
						);
					}
					if (child.type === 'text' && child.content) {
						return <MessageResponse key={childIndex}>{child.content}</MessageResponse>;
					}
					return null;
				})}
			</div>
		);
	}

	// Tool calls (tool-{toolKey})
	if (part.type.startsWith('tool-')) {
		const toolPart = part as ToolUIPart;

		// Special handling for web-search tool to render ONLY sources
		if (toolPart.type === 'tool-web-search' && toolPart.output) {
			const output = toolPart.output as {
				text?: string;
				sources?: Array<{
					url: string;
					title?: string;
					description?: string;
					lastUpdated?: string;
				}>;
			};

			// Solo renderizar sources, NO el texto (que tiene citas [1], [2])
			// El texto es contexto interno, la respuesta del agente viene después
			return (
				<div className="space-y-2" key={partIndex}>
					{output.sources && output.sources.length > 0 && (
						<Sources>
							<SourcesTrigger count={output.sources.length} />
							<SourcesContent>
								{output.sources.map((source, i) => (
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

		// Default tool rendering para otros tools
		return (
			<Tool key={partIndex}>
				<ToolHeader
					state={toolPart.state}
					title={toolPart.type.replace('tool-', '')}
					type={toolPart.type}
				/>
				<ToolContent>
					{toolPart.input !== undefined && toolPart.input !== null && (
						<ToolInput input={toolPart.input as any} />
					)}
					{(toolPart.output || toolPart.errorText) && (
						<ToolOutput errorText={toolPart.errorText} output={toolPart.output as any} />
					)}
				</ToolContent>
			</Tool>
		);
	}

	return null;
}

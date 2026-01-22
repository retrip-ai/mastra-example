import { memo } from 'react';
import { isWeatherData, WeatherCard } from '@/components/chat/tools/weather-card';
import { toolUIRegistry } from './tool-ui-registry';
import type { MessageRenderer, RendererProps, ToolPart } from './types';
import { isToolPart } from './types';

/**
 * Weather Renderer Component
 * Renders weather tool output in a specialized card format
 * Uses toolUIRegistry for consistent tool ID matching
 */
const WeatherRendererComponent = memo<RendererProps<ToolPart>>(({ part }) => {
    // Support both Vercel AI SDK 'result' and mapped 'output' properties
    const output = part.output || (part as unknown as { result: unknown }).result;

    // Only render if we have valid weather data
    if (!output || !isWeatherData(output)) return null;

    return <WeatherCard data={output} />;
});

WeatherRendererComponent.displayName = 'WeatherRenderer';

/**
 * Weather Renderer definition for the registry
 * Uses high priority to override generic tool renderer
 */
export const weatherRenderer: MessageRenderer<ToolPart> = {
    type: 'tool-call',
    // High priority to override generic tool renderer
    priority: 50,
    canRender: (part) => {
        if (!isToolPart(part)) return false;

        const toolPart = part as unknown as { toolName?: string; name?: string };
        const name = toolPart.toolName || toolPart.name;

        // Use registry to check if this tool has custom UI registered
        return toolUIRegistry.hasCustomUI(name);
    },
    Component: WeatherRendererComponent as unknown as React.FC<RendererProps>,
};


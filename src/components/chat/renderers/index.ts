/**
 * Renderer Registry and Exports
 *
 * This module provides a composable system for rendering message parts.
 * All renderers are registered in a central registry and can be extended.
 *
 * ## Adding a new Tool UI
 *
 * To add a custom UI for a new tool, use the toolUIRegistry:
 *
 * ```tsx
 * import { toolUIRegistry } from './renderers';
 * import { MyToolCard, isMyToolData } from '@/components/ai-elements/my-tool-card';
 *
 * toolUIRegistry.register({
 *     toolIds: ['my-tool-id'],
 *     Component: MyToolCard,
 *     isValidOutput: isMyToolData,
 * });
 * ```
 *
 * The component will automatically render in both streaming and history contexts.
 */

export { dynamicToolRenderer } from './dynamic-tool-renderer';
export { networkRenderer } from './network-renderer';
export { reasoningRenderer } from './reasoning-renderer';
// Export registries
export { RendererRegistry, rendererRegistry } from './registry';
// Export individual renderers
export { textRenderer } from './text-renderer';
export { toolRenderer } from './tool-renderer';
export { type ToolUIRegistration, ToolUIRegistry, toolUIRegistry } from './tool-ui-registry';
// Export types
export * from './types';
export { weatherRenderer } from './weather-renderer';

import { isWeatherData, WeatherCard } from '@/components/chat/tools/weather-card';
import { dynamicToolRenderer } from './dynamic-tool-renderer';
import { networkRenderer } from './network-renderer';
import { reasoningRenderer } from './reasoning-renderer';
// Import for registration
import { rendererRegistry } from './registry';
import { textRenderer } from './text-renderer';
import { toolRenderer } from './tool-renderer';
// Import tool UI registry and register default tool UIs
import { toolUIRegistry } from './tool-ui-registry';
import type { MessageRenderer } from './types';
import { weatherRenderer } from './weather-renderer';

// Register all default renderers (cast to base type for registry)
rendererRegistry.register(textRenderer as MessageRenderer);
rendererRegistry.register(reasoningRenderer as MessageRenderer);
rendererRegistry.register(networkRenderer as MessageRenderer);
rendererRegistry.register(toolRenderer as MessageRenderer);
rendererRegistry.register(dynamicToolRenderer as MessageRenderer);
rendererRegistry.register(weatherRenderer as MessageRenderer);

// Register default tool UI components
// These automatically render in both streaming and history contexts
toolUIRegistry.register({
	toolIds: ['get-weather', 'weatherTool'],
	Component: WeatherCard,
	isValidOutput: isWeatherData,
});

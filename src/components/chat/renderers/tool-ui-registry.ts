import type { FC } from 'react';

/**
 * Tool UI Registration
 *
 * Defines a custom UI component for a specific tool.
 *
 * @example
 * ```tsx
 * toolUIRegistry.register({
 *     toolIds: ['get-weather', 'weatherTool'],
 *     Component: WeatherCard,
 *     isValidOutput: isWeatherData,
 * });
 * ```
 */
export interface ToolUIRegistration<TOutput = unknown> {
    /** Tool IDs this component handles (supports multiple for the same tool) */
    toolIds: string[];
    /** React component that renders the tool output */
    Component: FC<{ data: TOutput }>;
    /** Type guard to validate the output data before rendering */
    isValidOutput: (output: unknown) => output is TOutput;
}

/**
 * ToolUIRegistry - Central registry for tool-specific UI components
 *
 * Maps tool IDs to custom React components for rendering tool outputs.
 * Components registered here automatically render in both:
 * - Streaming context (via network-renderer)
 * - History context (via dynamic-tool-renderer)
 *
 * @example
 * ```tsx
 * // Register a custom UI for a tool
 * toolUIRegistry.register({
 *     toolIds: ['my-tool-id'],
 *     Component: MyToolCard,
 *     isValidOutput: isMyToolData,
 * });
 *
 * // Check if a tool has custom UI
 * if (toolUIRegistry.hasCustomUI('my-tool-id')) {
 *     const Component = toolUIRegistry.getComponent('my-tool-id', output);
 *     if (Component) return <Component data={output} />;
 * }
 * ```
 */
export class ToolUIRegistry {
    private registrations = new Map<string, ToolUIRegistration>();

    /**
     * Register a custom UI component for one or more tool IDs
     */
    register<T>(registration: ToolUIRegistration<T>): void {
        for (const toolId of registration.toolIds) {
            this.registrations.set(toolId, registration as ToolUIRegistration);
        }
    }

    /**
     * Get the component for a tool if output is valid
     * Returns null if no registration exists or output validation fails
     */
    getComponent(
        toolName: string | undefined,
        output: unknown
    ): { Component: FC<{ data: unknown }>; data: unknown } | null {
        if (!toolName) return null;

        const registration = this.registrations.get(toolName);
        if (!registration) return null;

        if (!registration.isValidOutput(output)) return null;

        return {
            Component: registration.Component as FC<{ data: unknown }>,
            data: output,
        };
    }

    /**
     * Check if a tool has a custom UI component registered
     */
    hasCustomUI(toolName: string | undefined): boolean {
        if (!toolName) return false;
        return this.registrations.has(toolName);
    }

    /**
     * Get all registered tool IDs
     */
    getRegisteredToolIds(): string[] {
        return Array.from(this.registrations.keys());
    }

    /**
     * Unregister a tool UI by ID
     */
    unregister(toolId: string): void {
        this.registrations.delete(toolId);
    }
}

/**
 * Singleton instance of the tool UI registry
 */
export const toolUIRegistry = new ToolUIRegistry();

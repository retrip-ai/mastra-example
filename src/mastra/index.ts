import { networkRoute } from '@mastra/ai-sdk';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import { destinationsAgent } from './agents/destinations-agent';
import { routingAgent } from './agents/routing-agent';
import { weatherAgent } from './agents/weather-agent';
import { weatherWorkflow } from './workflows/weather-workflow';

export const mastra = new Mastra({
	agents: {
		weatherAgent,
		destinationsAgent,
		routingAgent,
	},
	workflows: {
		weatherWorkflow,
	},
	storage: new LibSQLStore({
		id: 'mastra-storage',
		url: 'file:./mastra.db',
	}),
	logger: new PinoLogger({
		name: 'Mastra',
		level: 'info',
	}),
	server: {
		cors: {
			origin: '*',
			allowMethods: ['*'],
			allowHeaders: ['*'],
		},
		middleware: [
			{
				path: '/chat',
				handler: async (c, next) => {
					// Read body and populate requestContext with webSearchEnabled
					const body = await c.req.json();
					const webSearchEnabled = body?.webSearchEnabled ?? false;

					// Get or create requestContext
					const requestContext = c.get('requestContext') || new Map();
					requestContext.set('webSearchEnabled', webSearchEnabled);
					c.set('requestContext', requestContext);

					await next();
				},
			},
		],
		apiRoutes: [
			networkRoute({
				path: '/chat',
				agent: 'routingAgent',
			}),
		],
	},
});

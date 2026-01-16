import { MastraReactProvider } from "@mastra/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { SearchXIcon } from "lucide-react";
import { Header } from "../components/header";
import { ThemeProvider } from "../components/theme-provider";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
} from "../components/ui/empty";
import { Button } from "../components/ui/button";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

const MASTRA_BASE_URL =
	import.meta.env.VITE_MASTRA_URL || "http://localhost:4111";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Travel Assistant - Mastra AI Chat",
			},
			{
				name: "description",
				content: "Real-time AI Travel Assistant Demo. Built with Mastra, TanStack Start, and AI SDK. Features agent networks, streaming responses, and dynamic UI.",
			},
			// Open Graph / Facebook
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "Travel Assistant - Mastra AI Chat",
			},
			{
				property: "og:description",
				content: "Real-time AI Travel Assistant Demo. Built with Mastra, TanStack Start, and AI SDK.",
			},
			{
				property: "og:image",
				content: "/og-image.png",
			},
			{
				property: "og:image:width",
				content: "1200",
			},
			{
				property: "og:image:height",
				content: "1200",
			},
			// Twitter
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Travel Assistant - Mastra AI Chat",
			},
			{
				name: "twitter:description",
				content: "Real-time AI Travel Assistant Demo. Built with Mastra, TanStack Start, and AI SDK.",
			},
			{
				name: "twitter:image",
				content: "/og-image.png",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function NotFound() {
	return (
		<div className="flex h-[calc(100vh-72px)] items-center justify-center p-6">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<SearchXIcon />
					</EmptyMedia>
					<EmptyTitle>Page not found</EmptyTitle>
					<EmptyDescription>
						The page you're looking for doesn't exist or has been moved.
					</EmptyDescription>
				</EmptyHeader>
				<Button asChild>
					<Link to="/">Go back home</Link>
				</Button>
			</Empty>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<MastraReactProvider baseUrl={MASTRA_BASE_URL}>
					<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
						<Header />
						{children}
					</ThemeProvider>
				</MastraReactProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

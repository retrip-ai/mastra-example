import { MastraReactProvider } from '@mastra/react';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { SearchXIcon } from 'lucide-react';
import { Suspense } from 'react';
import { MASTRA_BASE_URL } from '@/lib/constants';
import { threadsQueryOptions } from '@/lib/mastra-queries';
import { AppSidebar } from '../components/app-sidebar';
import { PageTitleProvider, usePageTitle } from '../components/page-title-context';
import { ThemeProvider } from '../components/theme-provider';
import { Button } from '../components/ui/button';
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '../components/ui/empty';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(threadsQueryOptions());
	},
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'Assistant - Mastra AI Chat',
			},
			{
				name: 'description',
				content:
					'Real-time AI Assistant Demo. Built with Mastra, TanStack Start, and AI SDK. Features agent networks, streaming responses, and dynamic UI.',
			},
			// Open Graph / Facebook
			{
				property: 'og:type',
				content: 'website',
			},
			{
				property: 'og:title',
				content: 'Assistant - Mastra AI Chat',
			},
			{
				property: 'og:description',
				content:
					'Real-time AI Assistant Demo. Built with Mastra, TanStack Start, and AI SDK.',
			},
			{
				property: 'og:image',
				content: '/og-image.png',
			},
			{
				property: 'og:image:width',
				content: '1200',
			},
			{
				property: 'og:image:height',
				content: '1200',
			},
			// Twitter
			{
				name: 'twitter:card',
				content: 'summary_large_image',
			},
			{
				name: 'twitter:title',
				content: 'Assistant - Mastra AI Chat',
			},
			{
				name: 'twitter:description',
				content:
					'Real-time AI Assistant Demo. Built with Mastra, TanStack Start, and AI SDK.',
			},
			{
				name: 'twitter:image',
				content: '/og-image.png',
			},
		],
		links: [
			{
				rel: 'stylesheet',
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

function MobileHeader() {
	const { title } = usePageTitle();

	return (
		<header className="absolute top-0 left-0 z-10 flex h-12 items-center gap-2 px-4 max-md:bg-background/80 max-md:backdrop-blur-sm max-md:border-b max-md:border-border/50 max-md:w-full">
			<SidebarTrigger />
			{title && (
				<span className="hidden max-md:block text-sm font-medium truncate">
					{title}
				</span>
			)}
		</header>
	);
}

function RootDocument() {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<MastraReactProvider baseUrl={MASTRA_BASE_URL}>
					<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
						<PageTitleProvider>
							<SidebarProvider>
								<Suspense
									fallback={
										<aside className="flex h-full w-64 flex-col border-r bg-background">
											<div className="p-4 text-sm text-muted-foreground">Loading...</div>
										</aside>
									}
								>
									<AppSidebar />
								</Suspense>
								<SidebarInset className="flex flex-col h-svh">
									<MobileHeader />
									<main className="flex-1 min-h-0">
										<Outlet />
									</main>
								</SidebarInset>
							</SidebarProvider>
						</PageTitleProvider>
					</ThemeProvider>
				</MastraReactProvider>
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
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

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { ChatEmptyState, ChatInput, ChatLayout } from '@/components/chat';
import { usePageTitle } from '@/components/page-title-context';
import { useChatNavigation } from '@/hooks/use-chat-navigation';

export const Route = createFileRoute('/')({
	loader: () => {
		return { threadId: uuidv4() };
	},
	component: HomePage,
});

const suggestions = [
	'Where can I travel for a beach vacation?',
	"What's the weather like in Tokyo?",
	'Recommend me a mountain destination',
	'Best places to visit in Europe',
];

function HomePage() {
	const { threadId } = Route.useLoaderData();
	const [inputValue, setInputValue] = useState('');
	const [searchEnabled, setSearchEnabled] = useState(false);
	const { navigateToChat } = useChatNavigation();
	const { setTitle } = usePageTitle();

	useEffect(() => {
		setTitle('New Agent');
	}, [setTitle]);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!inputValue.trim()) return;

			navigateToChat(threadId, inputValue, searchEnabled);
		},
		[inputValue, navigateToChat, threadId, searchEnabled]
	);

	const handleSuggestionClick = useCallback(
		(suggestion: string) => {
			navigateToChat(threadId, suggestion, searchEnabled);
		},
		[navigateToChat, threadId, searchEnabled]
	);

	return (
		<ChatLayout>
			<ChatEmptyState />

			<div className="shrink-0 space-y-4 pb-2 px-2">
				<Suggestions>
					{suggestions.map((suggestion) => (
						<Suggestion
							key={suggestion}
							onClick={() => handleSuggestionClick(suggestion)}
							suggestion={suggestion}
						/>
					))}
				</Suggestions>

				<ChatInput
					disabled={!inputValue.trim()}
					onChange={setInputValue}
					onSearchEnabledChange={setSearchEnabled}
					onSubmit={handleSubmit}
					searchEnabled={searchEnabled}
					value={inputValue}
				/>
			</div>
		</ChatLayout>
	);
}

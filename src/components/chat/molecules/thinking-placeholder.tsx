
import { BrainIcon } from 'lucide-react';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/utils';

interface ThinkingPlaceholderProps {
    className?: string;
}

export function ThinkingPlaceholder({ className }: ThinkingPlaceholderProps) {
    return (
        <div className={cn("flex w-full items-center gap-2 text-muted-foreground text-sm", className)}>
            <BrainIcon className="size-4" />
            <Shimmer duration={2}>Trabajando...</Shimmer>
        </div>
    );
}

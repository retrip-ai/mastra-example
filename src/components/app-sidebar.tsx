'use client';

import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Moon, PlusIcon, SearchIcon, Sun, Trash2Icon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useTheme } from '@/components/theme-provider';
import { useDeleteThread } from '@/hooks/use-delete-thread';
import { useThreads } from '@/hooks/use-threads';

export function AppSidebar() {
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const { setTheme } = useTheme();
    const { isMobile, setOpenMobile } = useSidebar();

    // Obtener threadId actual de la ruta (si existe)
    const currentThreadId = 'threadId' in params ? params.threadId : undefined;

    // useSuspenseQuery: los datos siempre están disponibles (prefetch en loader)
    const { data: threads } = useThreads();

    // Eliminar thread
    const deleteThread = useDeleteThread();

    // Estado para búsqueda
    const [searchQuery, setSearchQuery] = useState('');

    // Estado para el diálogo de confirmación
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

    // Filtrar threads por título
    const filteredThreads = useMemo(() => {
        if (!threads) return [];
        if (!searchQuery.trim()) return threads;

        const query = searchQuery.toLowerCase();
        return threads.filter((thread) => (thread.title || 'Untitled').toLowerCase().includes(query));
    }, [threads, searchQuery]);

    const handleNewChat = useCallback(() => {
        navigate({ to: '/' });
        if (isMobile) {
            setOpenMobile(false);
        }
    }, [navigate, isMobile, setOpenMobile]);

    const handleDeleteClick = useCallback((e: React.MouseEvent, threadId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setThreadToDelete(threadId);
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!threadToDelete) return;

        // Si estamos eliminando el thread actual, redirigir a home
        if (threadToDelete === currentThreadId) {
            navigate({ to: '/' });
        }
        deleteThread.mutate(threadToDelete);
        setDeleteDialogOpen(false);
        setThreadToDelete(null);
    }, [threadToDelete, currentThreadId, navigate, deleteThread]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setThreadToDelete(null);
    }, []);

    return (
        <>
            <Sidebar variant="floating">
                <SidebarHeader className="gap-3 p-2">
                    <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <SidebarInput
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button className="w-full justify-start" onClick={handleNewChat} variant="outline">
                        <PlusIcon className="mr-2 size-4" />
                        New Agent
                    </Button>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {filteredThreads.length > 0 ? (
                                    filteredThreads.map((thread) => (
                                        <SidebarMenuItem key={thread.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={currentThreadId === thread.id}
                                                className="h-auto py-3 px-3"
                                            >
                                                <Link
                                                    params={{ threadId: thread.id }}
                                                    to="/chat/$threadId"
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            setOpenMobile(false);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                        <span className="truncate text-sm font-medium">
                                                            {thread.title || 'Untitled'}
                                                        </span>
                                                        <span className="truncate text-xs text-muted-foreground">
                                                            {thread.createdAt
                                                                ? formatDistanceToNow(new Date(thread.createdAt), {
                                                                    addSuffix: true,
                                                                    locale: es,
                                                                })
                                                                : ''}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </SidebarMenuButton>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={deleteThread.isPending}
                                                onClick={(e) => handleDeleteClick(e, thread.id)}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 size-7 opacity-0 group-hover/menu-item:opacity-100 transition-opacity"
                                            >
                                                <Trash2Icon className="size-3" />
                                            </Button>
                                        </SidebarMenuItem>
                                    ))
                                ) : searchQuery ? (
                                    <Empty className="py-8">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <SearchIcon />
                                            </EmptyMedia>
                                            <EmptyTitle>No results found</EmptyTitle>
                                            <EmptyDescription>
                                                Try a different search term
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No conversations yet
                                    </div>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="p-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <Sun className="size-4 mr-2 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute ml-0 size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span className="ml-6">Theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                            <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarFooter>
            </Sidebar>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La conversación y todos sus mensajes serán
                            eliminados permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

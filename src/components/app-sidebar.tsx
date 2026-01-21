'use client';

import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
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
import { Button } from '@/components/ui/button';
import { useDeleteThread } from '@/hooks/use-delete-thread';
import { useThreads } from '@/hooks/use-threads';

export function AppSidebar() {
    const navigate = useNavigate();
    const params = useParams({ strict: false });

    // Obtener threadId actual de la ruta (si existe)
    const currentThreadId = 'threadId' in params ? params.threadId : undefined;

    // useSuspenseQuery: los datos siempre están disponibles (prefetch en loader)
    const { data: threads } = useThreads();

    // Eliminar thread
    const deleteThread = useDeleteThread();

    // Estado para el diálogo de confirmación
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

    const handleNewChat = useCallback(() => {
        navigate({ to: '/' });
    }, [navigate]);

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
            <Sidebar variant='floating'>
                <SidebarHeader className="border-b p-4">
                    <Button className="w-full justify-start" onClick={handleNewChat} variant="outline">
                        <PlusIcon className="mr-2 size-4" />
                        New Agent
                    </Button>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {threads && threads.length > 0 ? (
                                    threads.map((thread) => (
                                        <SidebarMenuItem key={thread.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={currentThreadId === thread.id}
                                                className="h-auto py-3 px-3"
                                            >
                                                <Link params={{ threadId: thread.id }} to="/chat/$threadId">
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
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No conversations yet
                                    </div>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
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
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

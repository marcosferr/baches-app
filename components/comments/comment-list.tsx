"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { Trash2, Edit, Send, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ApiService } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface CommentListProps {
  reportId: string;
  reportAuthorId?: string;
}

export function CommentList({ reportId, reportAuthorId }: CommentListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const commentsList = await ApiService.getCommentsByReportId(reportId);
      setComments(commentsList);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await ApiService.createComment({
        report_id: reportId,
        text: newComment.trim(),
      });

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido publicado.",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "No se pudo publicar tu comentario. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.text.trim()) return;

    try {
      const updatedComment = await ApiService.updateComment(
        editingComment.id,
        editingComment.text.trim()
      );

      setComments((prev) =>
        prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
      );
      setEditingComment(null);
      toast({
        title: "Comentario actualizado",
        description: "Tu comentario ha sido actualizado.",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu comentario. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await ApiService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const canEditDelete = (comment: Comment) => {
    if (!session?.user) return false;
    // User can edit/delete their own comments
    if (comment.userId === session.user.id) return true;
    // Report author can delete (but not edit) comments on their report
    if (reportAuthorId === session.user.id) return true;
    // Admins can edit/delete any comment
    if (session.user.role === "admin") return true;

    return false;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comentarios</h3>

      {session ? (
        <div className="space-y-4">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Enviar comentario
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-muted p-4 text-sm">
          <AlertTriangle className="mb-2 h-5 w-5 text-amber-500" />
          <p>Debes iniciar sesión para comentar en este reporte.</p>
        </div>
      )}

      <Separator className="my-6" />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={comment.user.avatar || undefined}
                    alt={comment.user.name}
                  />
                  <AvatarFallback>
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{comment.user.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    {canEditDelete(comment) && (
                      <div className="flex gap-2">
                        {comment.userId === session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditingComment({
                                id: comment.id,
                                text: comment.text,
                              })
                            }
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingComment?.id === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingComment.text}
                        onChange={(e) =>
                          setEditingComment({
                            ...editingComment,
                            text: e.target.value,
                          })
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingComment(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleUpdateComment}
                          disabled={!editingComment.text.trim()}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.text}</p>
                  )}
                </div>
              </div>
              <Separator className="my-4" />
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comentario será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteComment(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

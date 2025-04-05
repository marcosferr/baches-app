"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { ApiService } from "@/lib/api-service";
import Link from "next/link";
import type { Comment } from "@/types";

interface ReportCommentsProps {
  reportId: string;
}

export function ReportComments({ reportId }: ReportCommentsProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const fetchedComments = await ApiService.getCommentsByReportId(
          reportId
        );
        setComments(fetchedComments);
      } catch (error) {
        toast({
          title: "Error al cargar comentarios",
          description:
            "No se pudieron cargar los comentarios. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [reportId, toast]);

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await ApiService.createComment({
        report_id: reportId,
        text: newComment,
      });

      setComments([...comments, comment]);
      setNewComment("");

      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al enviar comentario",
        description:
          "No se pudo enviar tu comentario. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comentarios</h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-muted-foreground">
            Cargando comentarios...
          </div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-muted/40 p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage
                    src={comment.user?.avatar}
                    alt={comment.user?.name}
                  />
                  <AvatarFallback>
                    {comment.user?.name ? getInitials(comment.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.user?.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(
                        comment.createdAt?.toString() || comment.date_created
                      )}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg bg-muted/40 py-8 text-center">
          <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No hay comentarios aún</h3>
          <p className="text-sm text-muted-foreground">
            Sé el primero en comentar sobre este reporte.
          </p>
        </div>
      )}

      <Separator />

      {session ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Añade un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      ) : (
        <div className="rounded-md bg-muted p-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p>
              Debes{" "}
              <Link href="/login" className="font-medium underline">
                iniciar sesión
              </Link>{" "}
              para comentar en este reporte.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

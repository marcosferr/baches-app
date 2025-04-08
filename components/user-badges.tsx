"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiService } from "@/lib/api-service";
import { UserBadgeDTO } from "@/types";
import { Loader2 } from "lucide-react";

interface UserBadgesProps {
  userId?: string;
  limit?: number;
  showTitle?: boolean;
}

export function UserBadges({ userId, limit = 10, showTitle = true }: UserBadgesProps) {
  const [badges, setBadges] = useState<UserBadgeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const userBadges = await ApiService.getUserBadges();
        setBadges(userBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Mis Insignias</CardTitle>
          <CardDescription>
            Insignias ganadas por tu actividad en la plataforma
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-lg" />
            ))}
          </div>
        ) : badges.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {badges.slice(0, limit).map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center justify-center rounded-lg border p-3 text-center"
              >
                <div className="mb-2 text-4xl">{badge.icon}</div>
                <div className="text-sm font-medium">{badge.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 text-4xl">🏆</div>
            <p className="text-sm text-muted-foreground">
              Aún no has ganado ninguna insignia. ¡Sigue participando!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserBadgesList({ badges }: { badges: UserBadgeDTO[] }) {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-2 text-4xl">🏆</div>
        <p className="text-sm text-muted-foreground">
          Aún no has ganado ninguna insignia. ¡Sigue participando!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center justify-center rounded-lg border p-3 text-center"
        >
          <div className="mb-2 text-4xl">{badge.icon}</div>
          <div className="text-sm font-medium">{badge.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

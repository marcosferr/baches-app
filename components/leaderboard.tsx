"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiService } from "@/lib/api-service";
import { LEADERBOARD_CATEGORIES, LeaderboardEntryDTO } from "@/types";
import { Loader2 } from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

interface LeaderboardProps {
  limit?: number;
}

export function Leaderboard({ limit = 5 }: LeaderboardProps) {
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(
    Object.keys(LEADERBOARD_CATEGORIES)[0]
  );

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setIsLoading(true);
        const data = await ApiService.getAllLeaderboards(limit);
        setLeaderboards(data);
      } catch (error) {
        console.error("Error fetching leaderboards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboards();
  }, [limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Clasificación</CardTitle>
        <CardDescription>
          Los mejores ciudadanos reportando baches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex w-full flex-wrap">
            {Object.entries(LEADERBOARD_CATEGORIES).map(([key, category]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-1"
              >
                <span>{category.icon}</span>
                <span className="hidden md:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          ) : (
            Object.entries(LEADERBOARD_CATEGORIES).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="space-y-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {category.description}
                    </h4>
                  </div>

                  {leaderboards
                    .find((lb) => lb.category === key)
                    ?.entries.map(
                      (entry: LeaderboardEntryDTO, index: number) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 rounded-lg border p-2"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                            {index + 1}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.user.avatar || undefined} />
                            <AvatarFallback>
                              {getInitials(entry.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{entry.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Puntuación: {entry.score}
                            </div>
                          </div>
                          <div className="text-2xl">{entry.categoryIcon}</div>
                        </div>
                      )
                    )}

                  {(!leaderboards.find((lb) => lb.category === key)?.entries ||
                    leaderboards.find((lb) => lb.category === key)?.entries
                      .length === 0) && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="mb-2 text-4xl">{category.icon}</div>
                      <p className="text-sm text-muted-foreground">
                        No hay datos para esta categoría aún
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

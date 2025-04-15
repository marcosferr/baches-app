// app/ranking/page.tsx
import { Suspense } from "react";
import { getUsersByReportCount } from "@/lib/actions/leaderboard-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function RankingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-2"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        ))}
    </div>
  );
}

async function UserReportRanking() {
  const rankedUsers = await getUsersByReportCount(10);

  return (
    <div className="space-y-4">
      {rankedUsers.map((user, index) => (
        <div
          key={user.id}
          className="flex items-center gap-3 rounded-lg border p-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
            {index + 1}
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              Reportes: {user.reportCount}
            </div>
          </div>
          {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
        </div>
      ))}
    </div>
  );
}

export default function RankingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Ranking de Usuarios</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ranking por Reportes</CardTitle>
          <CardDescription>
            Los usuarios con mayor número de reportes creados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<RankingSkeleton />}>
            <UserReportRanking />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

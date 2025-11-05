import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";

export type UITask = {
  id: string;
  title: string;
  phoneNumber: string;
  status: TaskStatus;
  createdAt: string;
  siteId?: string;
  sectors?: any[]; // now includes [{sector, requiredTypes, currentIndex, status}]
  sectorProgress?: Record<string, { done: number; total: number }>;
};

export function TaskCard({
  task,
  onPreview,
}: {
  task: UITask;
  onPreview: (taskId: string) => void;
}) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
    DONE: "bg-green-100 text-green-800 border-green-300",
    FAILED: "bg-red-100 text-red-800 border-red-300",
  };

  const prettyStatus = (s: TaskStatus) =>
    s === "PENDING"
      ? "Pending"
      : s === "IN_PROGRESS"
      ? "In Progress"
      : s === "DONE"
      ? "Completed"
      : "Failed";

  // Normalize sectors to [{ sector, status }]
  const sectors = Array.isArray(task.sectors)
    ? task.sectors.map((s: any) =>
        typeof s === "object" && s !== null
          ? { sector: Number(s.sector), status: s.status || "PENDING" }
          : { sector: Number(s), status: "PENDING" }
      )
    : [];

  const sortedSectors = sectors.sort((a, b) => a.sector - b.sector);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <CardTitle className="text-base font-semibold min-w-0 truncate">
            {task.title}
          </CardTitle>
          <Badge
            className={`${statusColors[task.status]} ml-auto font-medium border`}
          >
            {prettyStatus(task.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="break-all">
            <span className="font-medium text-foreground">Job Id:</span>{" "}
            {task.id}
          </div>
          <div className="break-all">
            <span className="font-medium text-foreground">Phone:</span>{" "}
            {task.phoneNumber}
          </div>
          <div>
            <span className="font-medium text-foreground">Created:</span>{" "}
            {new Date(task.createdAt).toLocaleString()}
          </div>
          {task.siteId && (
            <div className="break-all">
              <span className="font-medium text-foreground">Site ID:</span>{" "}
              {task.siteId}
            </div>
          )}
        </div>

        {/* Sector badges with status */}
        {sortedSectors.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-foreground font-medium">Sectors</div>
            <div className="flex flex-wrap gap-2">
              {sortedSectors.map((s) => (
                <Badge
                  key={s.sector}
                  className={`${statusColors[s.status || "PENDING"]} border`}
                >
                  S{s.sector} • {prettyStatus(s.status as TaskStatus)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <Button size="sm" onClick={() => onPreview(task.id)}>
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

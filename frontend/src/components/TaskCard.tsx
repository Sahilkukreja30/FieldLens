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
  sectors?: any[]; // can be number[] or [{ sector, requiredTypes, currentIndex, status }]
  sectorProgress?: Record<string, { done: number; total: number }>;
};

export function TaskCard({
  task,
  onPreview,
}: {
  task: UITask;
  onPreview: (taskId: string) => void;
}) {
  const statusClass: Record<TaskStatus, string> = {
    PENDING: "bg-warning text-warning-foreground",
    IN_PROGRESS: "bg-info text-info-foreground",
    DONE: "bg-success text-success-foreground",
    FAILED: "bg-destructive text-destructive-foreground",
  };

  const prettyStatus = (s: TaskStatus) =>
    s === "PENDING"
      ? "Pending"
      : s === "IN_PROGRESS"
      ? "In Progress"
      : s === "DONE"
      ? "Completed"
      : "Failed";

  const hasProgress =
    task.sectorProgress && Object.keys(task.sectorProgress).length > 0;

  // Handle both array of numbers and array of objects
  const sectorNumbers: number[] = Array.isArray(task.sectors)
    ? task.sectors.map((s: any) =>
        typeof s === "object" && s !== null ? Number(s.sector) : Number(s)
      )
    : [];

  const sortedSectors = sectorNumbers.filter(Boolean).sort((a, b) => a - b);

  // Build chip data
  const chips = sortedSectors.map((s) => {
    const sp = task.sectorProgress?.[String(s)];
    let label = `S${s}`;
    if (sp && sp.total > 0) {
      const pct = Math.round((sp.done / sp.total) * 100);
      label = `${label} • ${pct}%`;
    }
    return { sector: s, label };
  });

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <CardTitle className="text-base font-semibold min-w-0 truncate">
            {task.title}
          </CardTitle>
          <Badge className={`${statusClass[task.status]} ml-auto`}>
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

        {/* Sector badges */}
        {sortedSectors.length > 0 && (
          <div className="mt-2">
            <div className="mb-1 text-foreground font-medium">Sectors</div>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Badge
                  key={c.sector}
                  variant={hasProgress ? "default" : "secondary"}
                  className={
                    hasProgress
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : ""
                  }
                >
                  {c.label}
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

// src/components/TaskCard.tsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Eye, Archive } from "lucide-react";
import { downloadJobZip, type BackendJob } from "@/lib/api";

type Props = {
  job: BackendJob;
  onPreview: (jobId: string) => void;
};

function allSectorsDone(job: BackendJob): boolean {
  if (Array.isArray(job.sectors) && job.sectors.length) {
    return job.sectors.every((s) => s.status === "DONE");
  }
  // legacy single-sector
  return job.status === "DONE";
}

export default function TaskCard({ job, onPreview }: Props) {
  const [sectorForZip, setSectorForZip] = useState<string>("");

  const sectorList = useMemo(() => {
    if (Array.isArray(job.sectors) && job.sectors.length) {
      return job.sectors.map((s) => s.sector).sort((a, b) => a - b);
    }
    return typeof job.sector === "number" ? [job.sector] : [];
  }, [job]);

  const jobDone = allSectorsDone(job);
  const anyDoneSectors = useMemo(() => {
    if (Array.isArray(job.sectors) && job.sectors.length) {
      return job.sectors.filter((s) => s.status === "DONE").map((s) => s.sector);
    }
    return job.status === "DONE" && typeof job.sector === "number" ? [job.sector] : [];
  }, [job]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Site: {job.siteId ?? "—"}</CardTitle>
          <div className="text-xs text-muted-foreground">{job.workerPhone}</div>
        </div>
        <div className="text-xs">
          {Array.isArray(job.sectors) ? (
            <span>{job.sectors.length} sector(s)</span>
          ) : (
            <span>Sector: {typeof job.sector === "number" ? job.sector : "—"}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="text-sm">
          Status:&nbsp;
          {Array.isArray(job.sectors) && job.sectors.length ? (
            <span>
              {job.sectors.map((s) => (
                <span key={s.sector} className="mr-2">
                  <b>Sec {s.sector}</b>: {s.status}
                </span>
              ))}
            </span>
          ) : (
            <b>{job.status}</b>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onPreview(job.id)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          {/* Export ZIP controls */}
          {jobDone ? (
            <Button size="sm" onClick={() => downloadJobZip(job.id)}>
              <Archive className="w-4 h-4 mr-2" />
              Export ZIP (All)
            </Button>
          ) : anyDoneSectors.length > 0 ? (
            <div className="flex items-center gap-2">
              <Select value={sectorForZip} onValueChange={setSectorForZip}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Export sector…" />
                </SelectTrigger>
                <SelectContent>
                  {anyDoneSectors.map((sec) => (
                    <SelectItem key={sec} value={String(sec)}>
                      Sector {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!sectorForZip}
                onClick={() => downloadJobZip(job.id, Number(sectorForZip))}
              >
                <Archive className="w-4 h-4 mr-2" />
                Export ZIP
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

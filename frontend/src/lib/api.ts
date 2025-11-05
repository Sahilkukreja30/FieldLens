import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  withCredentials: true,
});

// -------- Types --------
export type BackendJob = {
  id: string;
  workerPhone: string;
  siteId?: string;
  sectors?: Array<{
    sector: number;
    requiredTypes: string[];
    currentIndex: number;
    status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  }>;
  // legacy single-sector fields (may be absent when multi-sector is used)
  sector?: number;
  requiredTypes?: string[];
  currentIndex?: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  createdAt?: string | null;
};

export type PhotoItem = {
  id: string;
  jobId: string;
  type: string;
  s3Key?: string;
  s3Url?: string;
  sector?: number; // optional, derived from key filename otherwise
  fields?: Record<string, any>;
  checks?: Record<string, any>;
  status?: string;
  reason?: string[];
};

export type JobDetail = {
  job: any;         // keep flexible (supports both old & new shapes)
  photos: PhotoItem[];
};

// -------- Helpers --------
function buildQuery(params?: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

// -------- API --------
export async function fetchJobs(): Promise<BackendJob[]> {
  const { data } = await api.get("/jobs");
  return data;
}

export async function fetchJobDetail(id: string, sector?: number): Promise<JobDetail> {
  const { data } = await api.get(`/jobs/${id}${buildQuery({ sector })}`);
  return data;
}

export async function createJob(input: {
  workerPhone: string;
  siteId: string;
  sector: number;
}): Promise<BackendJob> {
  const { data } = await api.post("/jobs", input);
  return data;
}

// ------- Exports (sector-aware) -------
export async function downloadJobXlsx(id: string, sector?: number) {
  const { data } = await api.get(`/jobs/${id}/export.xlsx${buildQuery({ sector })}`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = sector ? `job_${id}_sector_${sector}.xlsx` : `job_${id}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadJobXlsxWithImages(id: string, sector?: number) {
  const { data } = await api.get(`/jobs/${id}/export_with_images.xlsx${buildQuery({ sector })}`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = sector ? `job_${id}_sector_${sector}_with_images.xlsx` : `job_${id}_with_images.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadJobZip(id: string, sector?: number) {
  const { data } = await api.get(`/jobs/${encodeURIComponent(id)}/export.zip${buildQuery({ sector })}`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([data], { type: "application/zip" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = sector ? `job_${id}_sector_${sector}.zip` : `job_${id}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

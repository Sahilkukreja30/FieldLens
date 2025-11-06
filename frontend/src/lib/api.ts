import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Job types from backend
// Add to BackendJob
export type BackendJob = {
  id: string;
  workerPhone: string;
  requiredTypes: string[];
  currentIndex: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  sector?: number;          // legacy (single)
  createdAt?: string | null;
  // NEW
  siteId?: string;
  sectors?: number[];       // merged list
};




export type PhotoItem = {
  id: string;
  jobId: string;
  type: string;
  s3Url: string;
  fields?: Record<string, any>;
  checks?: Record<string, any>;
  status?: string;
  reason?: string[];
};

export type JobDetail = {
  job: {
    _id: string;
    workerPhone: string;
    requiredTypes: string[];
    currentIndex: number;
    status: string;
    sector?: number;
    macId?:string,
    rsnId?:string,
    azimuthDeg?:string,
    createdAt?: string | null;
    siteId?: string;
    sectors?: number[];
  };
  photos: PhotoItem[];
};
// ---------------- API FUNCTIONS ----------------

export async function fetchJobs(): Promise<BackendJob[]> {
  const { data } = await api.get("/jobs");
  console.log(data);
  
  return data;
}

export async function fetchJobDetail(id: string) {
  const { data } = await api.get(`/jobs/${id}`);
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

export async function downloadSectorExcel(jobId: string, sector?: number) {
  const { data } = await api.get(`/exports/sector.xlsx`, {
    params: sector != null ? { jobId, sector } : { jobId },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  const suffix = sector != null ? `_sec${sector}` : "";
  link.href = url;
  link.setAttribute("download", `job_${jobId}${suffix}_sector.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
export async function downloadJobXlsx(id: string) {
  const { data } = await api.get(`/jobs/${id}/export.xlsx`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `job_${id}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
export async function downloadJobZip(
  jobId: string,
  opts?: { sector?: number }
): Promise<void> {
  // Build URL using the page origin so it works on Vercel too
  const url = new URL(`/api/jobs/${jobId}/export.zip`, window.location.origin);
  if (typeof opts?.sector === "number") {
    url.searchParams.set("sector", String(opts.sector));
  }

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    // Surface backend errors (e.g., 404 when no photos for sector)
    let msg = `Export failed: ${res.status} ${res.statusText}`;
    try {
      const json = await res.clone().json();
      if (json?.detail) msg = `Export failed: ${json.detail}`;
    } catch {}
    throw new Error(msg);
  }

  // Try to extract filename from Content-Disposition; fallback to sensible name
  const disp = res.headers.get("Content-Disposition") || "";
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(disp);
  const fallback = typeof opts?.sector === "number"
    ? `job_${jobId}_sec${opts.sector}.zip`
    : `job_${jobId}.zip`;
  const filename = decodeURIComponent((match?.[1] || match?.[2] || fallback).trim());

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function deleteJob(jobId: string, opts?: { purgeFiles?: boolean }) {
  const url = new URL(`/api/jobs/${jobId}`, window.location.origin);
  if (opts?.purgeFiles) url.searchParams.set("purge_files", "true");

  const res = await fetch(url.toString(), { method: "DELETE" });
  if (!res.ok) {
    let msg = `Delete failed: ${res.status} ${res.statusText}`;
    try {
      const json = await res.clone().json();
      if (json?.detail) msg = `Delete failed: ${json.detail}`;
    } catch {}
    throw new Error(msg);
  }
}



export async function downloadJobXlsxWithImages(id: string) {
  const { data } = await api.get(`/jobs/${id}/export_with_images.xlsx`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `job_${id}_with_images.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function getSectorTemplate(sector: number) {
  const { data } = await api.get(`/jobs/templates/sector/${sector}`);
  return data as {
    requiredTypes: string[];
    labels: Record<string, string>;
    sector: number;
  };
}

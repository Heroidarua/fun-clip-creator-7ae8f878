import { apiBase } from "@/lib/api-base";
import { postJson, type YoutubeInfo } from "@/services/youtubeDownloader";

export interface YoutubeJobStatus {
  success: boolean;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export async function checkYoutubeJobStatus(jobId: string): Promise<YoutubeJobStatus> {
  const res = await fetch(`${apiBase()}/api/youtube/status?jobId=${jobId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Erro ao consultar status do download.");
  }
  return res.json();
}

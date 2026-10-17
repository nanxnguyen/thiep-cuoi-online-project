export const GZIP_BUDGET: number;
export function workerBudget(rawBytes: number, gzipBytes: number): { ok: boolean; message: string };

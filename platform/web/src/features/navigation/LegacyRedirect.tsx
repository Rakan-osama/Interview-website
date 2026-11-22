import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";

type LegacyTarget = { path: string };
export function LegacyRedirect({ fallback = null }: { fallback?: ReactNode }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const legacyKey = params.get("question");
  const legacyView = params.get("view");
  const { data, isError } = useQuery({ queryKey: ["legacy-route", legacyKey, legacyView], queryFn: () => apiRequest<LegacyTarget>(`/legacy/resolve?${params.toString()}`), enabled: Boolean(legacyKey || legacyView), retry: false });
  useEffect(() => { if (data?.path) navigate(data.path, { replace: true }); }, [data, navigate]);
  if (!legacyKey && !legacyView) return fallback;
  if (isError) return <div className="page-state">This legacy link is no longer valid.</div>;
  return <div className="page-state">Redirecting to the current page…</div>;
}

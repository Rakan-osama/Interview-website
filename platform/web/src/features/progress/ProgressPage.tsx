import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError, apiRequest, ensureCsrfCookie } from "../../shared/api/client";

type Summary = { completedLessons: number; totalLessons: number; averageScore: number; bookmarkedLessons: number };
type LegacyProgress = { attempts: Record<string, unknown>; drafts: Record<string, string>; bookmarks: string[] };
type ImportTotals = {
  attempts: number; drafts: number; bookmarks: number; unique_lessons: number;
  mapped_lessons: number; unmapped_lessons: number; already_imported?: boolean;
};

function readLegacyProgress(): LegacyProgress | null {
  try {
    const raw = localStorage.getItem("backend-lab-v1");
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LegacyProgress>;
    if (!value.attempts || !value.drafts || !Array.isArray(value.bookmarks)) return null;
    return { attempts: value.attempts, drafts: value.drafts, bookmarks: value.bookmarks };
  } catch {
    return null;
  }
}

export default function ProgressPage() {
  const legacyProgress = readLegacyProgress();
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: () => apiRequest<Summary>("/me/dashboard"), retry: false });
  const importer = useMutation({
    mutationFn: async (apply: boolean) => {
      if (!legacyProgress) throw new Error("No valid browser progress was found.");
      await ensureCsrfCookie();
      return apiRequest<ImportTotals>("/legacy-progress/import", {
        method: "POST", body: JSON.stringify({ progress: legacyProgress, apply }),
      });
    },
    onSuccess: (_, applied) => { if (applied) void summary.refetch(); },
  });
  const unauthorized = summary.error instanceof ApiError && summary.error.status === 401;

  return <div className="page" dir="ltr">
    <header><span className="muted">Learner state</span><h1>Progress and migration</h1></header>
    {unauthorized ? <section className="card"><h2>Sign in to sync progress</h2><p>Your browser data stays on this device until you sign in.</p><Link className="button" to="/login">Sign in</Link></section> :
      <section className="grid" aria-label="Progress summary">
        <Metric label="Completed lessons" value={`${summary.data?.completedLessons ?? 0} / ${summary.data?.totalLessons ?? 0}`} />
        <Metric label="Average score" value={`${summary.data?.averageScore ?? 0} / 100`} />
        <Metric label="Bookmarks" value={String(summary.data?.bookmarkedLessons ?? 0)} />
      </section>}
    <section className="card import-card">
      <h2>Import progress from the old website</h2>
      <p>Preview first. Import is idempotent, so the same browser data is never duplicated.</p>
      {!legacyProgress && <p className="muted">No valid <code>backend-lab-v1</code> browser data was found.</p>}
      <div className="button-row">
        <button className="button secondary" disabled={!legacyProgress || importer.isPending || unauthorized} onClick={() => importer.mutate(false)}>Preview import</button>
        <button className="button" disabled={!legacyProgress || importer.isPending || unauthorized || !importer.data || importer.data.unmapped_lessons > 0} onClick={() => importer.mutate(true)}>Import now</button>
      </div>
      {importer.data && <ImportPreview totals={importer.data} />}
      {importer.isError && <p className="error" role="alert">{importer.error instanceof ApiError && importer.error.status === 401 ? "Sign in before importing." : importer.error.message}</p>}
    </section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="card"><p>{label}</p><h2>{value}</h2></article>;
}

function ImportPreview({ totals }: { totals: ImportTotals }) {
  return <div className="import-preview" role="status">
    <p><strong>{totals.mapped_lessons}</strong> of <strong>{totals.unique_lessons}</strong> lessons mapped.</p>
    <p>{totals.attempts} attempts, {totals.drafts} drafts, and {totals.bookmarks} bookmarks.</p>
    {totals.unmapped_lessons > 0 && <p className="error">{totals.unmapped_lessons} lesson identifiers could not be mapped. Import is blocked to prevent data loss.</p>}
    {totals.already_imported && <p>This exact data was already imported.</p>}
  </div>;
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Lesson, Track } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";

type DraftState = {
  answer: string;
  version: number | null;
  completed: boolean;
};

type SaveDraftVariables = {
  lessonId: string;
  answer: string;
  version: number | null;
};

export function usePersistedLessonAnswer(lesson: Lesson | undefined, trackSlug: string) {
  const queryClient = useQueryClient();
  const activeLessonId = useRef<string | undefined>(undefined);
  const [answer, setAnswer] = useState("");
  const [persistedAnswer, setPersistedAnswer] = useState("");
  const [draftVersion, setDraftVersion] = useState<number | null>(null);

  const saveDraft = useMutation({
    mutationFn: ({ lessonId, answer: nextAnswer, version }: SaveDraftVariables) =>
      apiRequest<DraftState>(`/lessons/${lessonId}/draft`, {
        method: "PUT",
        body: JSON.stringify({ answer: nextAnswer, version }),
      }),
    onSuccess: (saved, variables) => {
      if (activeLessonId.current === variables.lessonId) {
        setPersistedAnswer(saved.answer);
        setDraftVersion(saved.version);
      }
      updateLessonProgress(queryClient, trackSlug, variables.lessonId, saved);
    },
  });

  useEffect(() => {
    if (!lesson || activeLessonId.current === lesson.id) return;
    activeLessonId.current = lesson.id;
    setAnswer(lesson.learnerState.answer);
    setPersistedAnswer(lesson.learnerState.answer);
    setDraftVersion(lesson.learnerState.draftVersion);
    saveDraft.reset();
  }, [lesson, saveDraft]);

  useEffect(() => {
    if (!lesson || activeLessonId.current !== lesson.id || answer === persistedAnswer || saveDraft.isPending) return;
    const timeout = window.setTimeout(() => {
      saveDraft.mutate({ lessonId: lesson.id, answer, version: draftVersion });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [answer, draftVersion, lesson, persistedAnswer, saveDraft]);

  const saveStatus: "waiting" | "saving" | "saved" | "error" = saveDraft.isPending
    ? "saving"
    : saveDraft.isError
      ? "error"
      : answer === persistedAnswer
        ? "saved"
        : "waiting";

  const saveNow = () => {
    if (!lesson || answer === persistedAnswer || saveDraft.isPending) return;
    saveDraft.mutate({ lessonId: lesson.id, answer, version: draftVersion });
  };

  return { answer, setAnswer, saveNow, saveStatus, saveError: saveDraft.error };
}

function updateLessonProgress(
  queryClient: ReturnType<typeof useQueryClient>,
  trackSlug: string,
  lessonId: string,
  saved: DraftState,
) {
  queryClient.setQueryData<Track>(["track", trackSlug], (track) => track ? {
    ...track,
    lessons: track.lessons.map((item) => item.id === lessonId ? { ...item, completed: saved.completed } : item),
  } : track);
  queryClient.setQueriesData<Lesson>({ queryKey: ["lesson", trackSlug] }, (lesson) =>
    lesson?.id === lessonId ? {
      ...lesson,
      completed: saved.completed,
      learnerState: { ...lesson.learnerState, answer: saved.answer, draftVersion: saved.version, completed: saved.completed },
    } : lesson,
  );
  void queryClient.invalidateQueries({ queryKey: ["tracks"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

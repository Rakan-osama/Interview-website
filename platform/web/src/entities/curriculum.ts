export type RubricCriterion = {
  id: string;
  label: string;
  weight: number;
  terms: string[];
};

export type LessonSummary = {
  id: string;
  slug: string;
  legacyKey: string | null;
  title: string;
  objective: string;
  sortOrder: number;
  completed: boolean;
};

export type Track = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  category: string;
  lessons: LessonSummary[];
};

export type Lesson = LessonSummary & {
  explanation: string;
  plainExplanation: string;
  interviewQuestion: string;
  modelAnswer: string;
  pitfall: string;
  code: string | null;
  solution: string | null;
  rubric: RubricCriterion[];
  track: Pick<Track, "id" | "slug" | "title" | "titleAr">;
};

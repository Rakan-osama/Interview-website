import type { Assessment } from "./assessment";

export type EvidenceGroup = string[] | { aliases: string[] };
export type RubricCriterion = {
  id: string;
  label: string;
  description: string;
  claimIds: string[];
  evidenceGroups: EvidenceGroup[];
  weight: number;
  position: number;
  terms?: string[];
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
  titleAr?: string | null;
  description: string;
  category: string;
  lessons: LessonSummary[];
};

export type CodeExample = { language: string; label: string; code: string; walkthrough: string; expectedResult?: string };
export type GuidedQuestion = { question: string; answer: string };
export type MechanismStep = { title: string; description: string };
export type FailureMode = { cause: string; symptom: string; prevention: string; recovery: string; monitoring: string };
export type ConceptContent = {
  schemaVersion: number;
  summary: string;
  definition: string;
  guidedQuestions?: GuidedQuestion[];
  mechanismSteps?: MechanismStep[];
  mechanism?: string;
  whenToUse: string[];
  whenNotToUse: string[];
  productionScenarios?: Array<{ context: string; decision: string; constraints: string }>;
  failureModes?: FailureMode[];
  useCases?: string[];
  tradeOffs?: string[];
  codeExamples: CodeExample[];
  glossary?: Array<{ term: string; definition: string }>;
  verificationChecklist?: string[];
  reviewStatus?: "draft" | "automated_verified" | "editorial_reviewed" | "needs_update";
  reviewedAt?: string;
};
export type LessonVisual = {
  id: string;
  kind: "pipeline" | "data-flow" | "sequence" | "state-machine" | "architecture" | "comparison" | "entity-relationship" | "transaction-timeline" | "flow" | "state";
  schemaVersion?: number;
  layout?: string;
  title: string;
  caption: string;
  altText: string;
  data: {
    nodes: Array<{ id: string; label: string; group?: string }>;
    edges: Array<{ from: string; to: string; label?: string }>;
    annotations?: Array<{ label: string; text: string }>;
  };
};
export type LearningSource = {
  id?: string;
  title: string;
  url: string;
  publisher: string;
  applicableVersion?: string | null;
  sectionLocator?: string | null;
  reviewedAt?: string;
  isPrimary?: boolean;
};

export type CompetencyLesson = LessonSummary & { track: { slug: string; title: string } };
export type CompetencyModule = {
  id: string; key: string; title: string; summary: string; position: number;
  progress: { completed: number; total: number };
  lessons?: CompetencyLesson[];
};
export type Competency = {
  id: string; slug: string; title: string; summary: string; outcomes: string[]; position: number;
  progress: { completed: number; total: number; percentage: number };
  modules: CompetencyModule[];
};

export type Lesson = LessonSummary & {
  explanation: string;
  plainExplanation: string;
  interviewQuestion: string;
  modelAnswer: string;
  pitfall: string;
  code: string | null;
  solution: string | null;
  practicalExample: string;
  commonMistake: string;
  referenceSolution: string;
  concepts: Array<{ id?: string; slug: string; title: string; group: string; intro: string; content?: ConceptContent }>;
  learningConcept: { id?: string; slug: string; title: string; group: string; intro: string; content: ConceptContent } | null;
  sources: LearningSource[];
  rubric: RubricCriterion[];
  interview: { scenario: string; question: string; answerStructure: string[]; modelAnswer: string };
  codeExamples: CodeExample[];
  visuals: LessonVisual[];
  questionBrief: {
    context: string;
    task: string;
    requirements: Array<{ id: string; title: string; explanation: string; evidenceGroups: EvidenceGroup[]; claimIds: string[]; weight: number }>;
    answerStructure: string[];
    successDefinition: string;
  };
  learnerState: { answer: string; draftVersion: number | null; completed: boolean; assessment: Assessment | null };
  track: Pick<Track, "id" | "slug" | "title" | "titleAr">;
};

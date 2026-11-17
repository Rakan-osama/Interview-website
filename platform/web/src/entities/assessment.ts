export type CriterionAssessment = {
  criterionId: string;
  met: boolean;
  score: number;
  evidence: string;
  feedback: string;
};

export type Assessment = {
  id: string;
  status: "pending" | "completed" | "fallback" | "failed";
  overallScore: number | null;
  criteria: CriterionAssessment[];
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  confidence: number | null;
};

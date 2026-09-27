export type Lesson = {
  title: string;
  symptom: string;
  rootCause: string;
  prevention: string;
  verification: string;
};

export type BrowserEvidence = {
  route: string;
  designSource: string;
  viewport: 390 | 1280;
  parityPercent: number;
  consoleErrors: number;
  horizontalOverflow: boolean;
  brokenImages: number;
  evidence: string;
};

export function parseNameStatus(output: string): Array<{ status: string; paths: string[] }>;
export function classifyChangedFiles(paths: string[]): { design: string[]; frontend: string[]; backend: string[]; needsSecurityReview: boolean };
export function nextStage(status?: string): string;
export function appendVerifiedLessons(guide: string, lessons: Lesson[]): string;
export function buildCodexArgs(input: { root: string; schema: string; output: string; prompt: string; role: string }): string[];
export type AgentName = "codex" | "claude" | "opencode";
export function detectAgent(env?: Record<string, string | undefined>, parentCommand?: string): AgentName | null;
export function ancestorCommands(psOutput: string, startPid: number): string;
export function buildAgentInvocation(input: {
  agent: AgentName;
  root: string;
  schema: string;
  schemaText: string;
  output: string;
  prompt: string;
  role: string;
}): { command: string; args: string[]; writesOutput: boolean };
export function parseAgentResult(agent: AgentName, stdout: string): unknown;
export function validatePlan<T>(plan: T): T;
export function shouldRunSecurity(paths: string[], changedContents?: Map<string, string>): boolean;
export function validateReview<T>(report: T, options?: { requireSeo?: boolean; routes?: string[] }): T;
export function validateSitemap(xml: string): string[];
export function collectChangedPaths(outputs: string[]): string[];
export function createRunId(date?: Date): string;
export function formatRunRow(run: Record<string, unknown>): string;
export function buildPrompt(role: string, context: Record<string, unknown>): string;

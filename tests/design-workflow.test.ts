import assert from "node:assert/strict";
import test from "node:test";

import {
  appendVerifiedLessons,
  ancestorCommands,
  buildAgentInvocation,
  buildCodexArgs,
  buildPrompt,
  classifyChangedFiles,
  collectChangedPaths,
  createRunId,
  detectAgent,
  formatRunRow,
  nextStage,
  parseAgentResult,
  parseNameStatus,
  shouldRunSecurity,
  validatePlan,
  validateReview,
  validateSitemap,
} from "../scripts/design-workflow.mjs";

test("parseNameStatus preserves rename sources and destinations", () => {
  assert.deepEqual(
    parseNameStatus("M\tdesign/A.dc.html\nR100\tdesign/Old.dc.html\tdesign/New.dc.html\n"),
    [
      { status: "M", paths: ["design/A.dc.html"] },
      { status: "R100", paths: ["design/Old.dc.html", "design/New.dc.html"] },
    ],
  );
});

test("classifyChangedFiles enables backend security for every server trust boundary", () => {
  const result = classifyChangedFiles([
    "design/Trang Chu.dc.html",
    "app/page.tsx",
    "app/api/public/invitations/route.ts",
    "supabase/migrations/202609270001_test.sql",
  ]);

  assert.deepEqual(result.design, ["design/Trang Chu.dc.html"]);
  assert.deepEqual(result.frontend, ["app/page.tsx"]);
  assert.deepEqual(result.backend, [
    "app/api/public/invitations/route.ts",
    "supabase/migrations/202609270001_test.sql",
  ]);
  assert.equal(result.needsSecurityReview, true);
});

test("nextStage resumes after the last completed workflow stage", () => {
  assert.equal(nextStage(undefined), "analyzing");
  assert.equal(nextStage("planned"), "implementing");
  assert.equal(nextStage("implemented"), "verifying");
  assert.equal(nextStage("verified"), "security");
  assert.equal(nextStage("security-passed"), "qc");
  assert.equal(nextStage("qc-passed"), "preview");
  assert.equal(nextStage("previewed"), "production-confirmation");
  assert.equal(nextStage("deployed"), "done");
});

test("appendVerifiedLessons writes reusable lessons once under a numbered section", () => {
  const guide = "# Guide\n\n## 6. Sai lầm đã gặp và cách phòng tránh\n";
  const lesson = {
    title: "Bỏ sót logic trong renderVals",
    symptom: "Trang thiếu nội dung động.",
    rootCause: "Chỉ đọc markup.",
    prevention: "Đọc cả script text/x-dc.",
    verification: "Đối chiếu mọi giá trị động với runtime.",
  };

  const once = appendVerifiedLessons(guide, [lesson]);
  const twice = appendVerifiedLessons(once, [lesson]);

  assert.match(once, /### Bỏ sót logic trong renderVals/);
  assert.equal(twice, once);
  assert.equal((once.match(/Sai lầm đã gặp và cách phòng tránh/g) ?? []).length, 1);
});

test("buildCodexArgs isolates planning and review from implementation writes", () => {
  const common = { root: "/repo", schema: "/repo/schema.json", output: "/tmp/out.json", prompt: "Do the task" };
  const plan = buildCodexArgs({ ...common, role: "plan" });
  const implementation = buildCodexArgs({ ...common, role: "implementation" });
  const qc = buildCodexArgs({ ...common, role: "qc" });

  assert.deepEqual(plan.slice(0, 2), ["exec", "--ephemeral"]);
  assert.equal(plan[plan.indexOf("--sandbox") + 1], "read-only");
  assert.equal(implementation[implementation.indexOf("--sandbox") + 1], "workspace-write");
  assert.equal(qc[qc.indexOf("--sandbox") + 1], "read-only");
  assert.ok(plan.includes("--output-schema"));
  assert.ok(!implementation.includes("--dangerously-bypass-approvals-and-sandbox"));
});

test("detectAgent automatically follows the calling AI environment", () => {
  assert.equal(detectAgent({ CLAUDECODE: "1", CODEX_THREAD_ID: "nested" }), "claude");
  assert.equal(detectAgent({ OPENCODE: "1" }), "opencode");
  assert.equal(detectAgent({ CODEX_THREAD_ID: "thread" }), "codex");
  assert.equal(detectAgent({}, "/usr/local/bin/opencode run"), "opencode");
  assert.equal(detectAgent({}), null);
});

test("ancestorCommands follows only the process that launched the workflow", () => {
  const processes = [
    "1 0 /sbin/launchd",
    "20 1 /usr/local/bin/opencode",
    "30 20 npm run design",
    "40 30 node scripts/design-workflow.mjs",
    "99 1 /usr/local/bin/claude",
  ].join("\n");
  assert.equal(ancestorCommands(processes, 40), "node scripts/design-workflow.mjs\nnpm run design\n/usr/local/bin/opencode\n/sbin/launchd");
});

test("agent adapters keep one prompt and avoid dangerous bypass flags", () => {
  const input = {
    root: "/repo",
    schema: "/repo/schema.json",
    schemaText: '{"type":"object"}',
    output: "/tmp/out.json",
    prompt: "Do the task",
    role: "implementation",
  };
  const codex = buildAgentInvocation({ ...input, agent: "codex" });
  const claude = buildAgentInvocation({ ...input, agent: "claude" });
  const opencode = buildAgentInvocation({ ...input, agent: "opencode" });

  assert.equal(codex.command, "codex");
  assert.equal(claude.command, "claude");
  assert.ok(claude.args.includes("--json-schema"));
  assert.equal(opencode.command, "opencode");
  assert.deepEqual(opencode.args.slice(0, 4), ["run", "--format", "json", "--agent"]);
  for (const invocation of [codex, claude, opencode]) {
    assert.ok(invocation.args.some((arg) => arg.includes("Do the task")));
    assert.ok(!invocation.args.some((arg) => arg.includes("dangerously")));
  }
});

test("agent output adapters normalize Claude and OpenCode JSON", () => {
  assert.deepEqual(
    parseAgentResult("claude", JSON.stringify({ structured_output: { status: "PLAN_READY" } })),
    { status: "PLAN_READY" },
  );
  assert.deepEqual(
    parseAgentResult("opencode", [
      JSON.stringify({ type: "step_start" }),
      JSON.stringify({ type: "text", part: { text: '{"status":"PLAN_READY"}' } }),
    ].join("\n")),
    { status: "PLAN_READY" },
  );
});

test("validatePlan rejects undecided or placeholder plans", () => {
  const base = {
    status: "PLAN_READY",
    summary: "Port the changed page",
    designFiles: ["design/A.dc.html"],
    affectedRoutes: ["/a"],
    files: { create: [], modify: ["app/a/page.tsx"], delete: [] },
    reuse: ["SiteHeader"],
    tasks: [{ title: "Port", files: ["app/a/page.tsx"], action: "Match design", verification: "Compare at 390px" }],
    tests: ["npm test"],
    seo: ["Lighthouse SEO 100"],
    performance: ["Performance >= 90"],
    security: [],
    decisions: [],
  };

  assert.doesNotThrow(() => validatePlan(base));
  assert.throws(() => validatePlan({ ...base, summary: "TBD" }), /placeholder/i);
  assert.throws(() => validatePlan({ ...base, status: "NEEDS_DECISION", decisions: ["Choose route"] }), /decision/i);
  assert.throws(() => validatePlan({ ...base, affectedRoutes: [] }), /affectedRoutes/);
});

test("shouldRunSecurity detects path and Server Action trust boundaries", () => {
  assert.equal(shouldRunSecurity(["app/page.tsx"], new Map()), false);
  assert.equal(shouldRunSecurity(["app/actions.ts"], new Map([["app/actions.ts", '"use server";\n']])), true);
  assert.equal(shouldRunSecurity(["lib/server/auth.ts"], new Map()), true);
});

test("validateReview requires real SEO evidence and blocks security findings", () => {
  const browserEvidence = [390, 1280].map((viewport) => ({
    route: "/a",
    designSource: "design/A.dc.html",
    viewport,
    parityPercent: 100,
    consoleErrors: 0,
    horizontalOverflow: false,
    brokenImages: 0,
    evidence: `.design-workflow/runs/test/browser-${viewport}.png`,
  }));
  const qc = { kind: "QC", status: "PASS", summary: "Clean", findings: [], checks: ["Lighthouse SEO: 100", "Performance: 92", "Accessibility: 97", "Best Practices: 96"], browserEvidence, lessons: [] };
  assert.doesNotThrow(() => validateReview(qc, { requireSeo: true }));
  assert.throws(() => validateReview({ ...qc, checks: ["Lighthouse SEO: 99"] }, { requireSeo: true }), /SEO 100/);
  assert.throws(() => validateReview({ ...qc, checks: ["Lighthouse SEO: 100", "Performance: 89", "Accessibility: 97", "Best Practices: 96"] }, { requireSeo: true }), /Performance/);
  assert.throws(() => validateReview({ ...qc, browserEvidence: browserEvidence.slice(0, 1) }, { requireSeo: true }), /390px and 1280px/i);
  assert.throws(() => validateReview({ ...qc, browserEvidence: browserEvidence.map((entry) => ({ ...entry, parityPercent: 99 })) }, { requireSeo: true }), /parity 100/i);

  const security = {
    kind: "SECURITY",
    status: "PASS",
    summary: "Unsafe",
    findings: [{ severity: "High", location: "app/api/x", problem: "Missing auth", requiredFix: "Require user" }],
    checks: [],
    browserEvidence: [],
    lessons: [],
  };
  assert.throws(() => validateReview(security, { requireSeo: false }), /security finding/i);
});

test("validateSitemap accepts public HTTPS paths and rejects unsafe entries", () => {
  const xml = "<urlset><url><loc>https://moc-wedding.netlify.app/</loc></url><url><loc>https://moc-wedding.netlify.app/templates/song-hy</loc></url></urlset>";
  assert.deepEqual(validateSitemap(xml), ["/", "/templates/song-hy"]);
  assert.throws(() => validateSitemap("<loc>http://localhost:3000/</loc>"), /localhost/);
  assert.throws(() => validateSitemap("<loc>https://moc-wedding.netlify.app/account</loc>"), /private/);
});

test("collectChangedPaths merges git name-status and untracked output", () => {
  assert.deepEqual(
    collectChangedPaths(["M\tdesign/A.dc.html\nD\tdesign/B.dc.html\n", "design/New.dc.html\n"]),
    ["design/A.dc.html", "design/B.dc.html", "design/New.dc.html"],
  );
});

test("run ids and process rows are stable and markdown-safe", () => {
  assert.equal(createRunId(new Date("2026-09-27T08:09:10.000Z")), "20260927-080910");
  assert.match(formatRunRow({ id: "r1", createdAt: "2026-09-27T08:09:10.000Z", designFiles: ["a|b"], status: "qc-passed", previewUrl: "https://preview" }), /a\\\|b/);
});

test("QC prompt requires real browser comparison at both viewports", () => {
  const prompt = buildPrompt("qc", {
    runId: "r1",
    planPath: "/repo/plan.json",
    changedFiles: ["app/a/page.tsx"],
    artifactDir: "/repo/.design-workflow/runs/r1",
  });

  assert.match(prompt, /browser/i);
  assert.match(prompt, /390/);
  assert.match(prompt, /1280/);
  assert.match(prompt, /parityPercent[\s\S]*100/);
  assert.match(prompt, /Guide-convert-html-design-to-code\.md/);
});

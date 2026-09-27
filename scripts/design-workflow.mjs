#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW_DIR = join(ROOT, ".design-workflow");
const RUNS_DIR = join(WORKFLOW_DIR, "runs");
const STATE_PATH = join(WORKFLOW_DIR, "latest.json");

const BACKEND_PATTERNS = [
  /^app\/api\//,
  /^lib\/server\//,
  /^supabase\//,
  /^netlify\/functions\//,
  /(^|\/)(middleware|proxy)\.[cm]?[jt]s$/,
  /(^|\/)(auth|security|rate-limit|env|donate-webhook)\.[cm]?[jt]s$/,
];

const FRONTEND_PATTERNS = [/^app\//, /^components\//, /^lib\//, /^public\//];

export function parseNameStatus(output) {
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split("\t");
      return { status, paths };
    });
}

export function classifyChangedFiles(paths) {
  const unique = [...new Set(paths)].sort();
  const design = unique.filter((path) => path.startsWith("design/"));
  const backend = unique.filter((path) => BACKEND_PATTERNS.some((pattern) => pattern.test(path)));
  const frontend = unique.filter(
    (path) => !design.includes(path) && !backend.includes(path) && FRONTEND_PATTERNS.some((pattern) => pattern.test(path)),
  );

  return { design, frontend, backend, needsSecurityReview: backend.length > 0 };
}

export function nextStage(status) {
  return {
    undefined: "analyzing",
    planned: "implementing",
    implemented: "verifying",
    verified: "security",
    "security-passed": "qc",
    "security-skipped": "qc",
    "qc-passed": "preview",
    previewed: "production-confirmation",
    deployed: "done",
  }[String(status)] ?? "analyzing";
}

export function appendVerifiedLessons(guide, lessons) {
  let result = guide;
  if (!/^## (?:\d+\. )?Sai lầm đã gặp và cách phòng tránh$/m.test(result)) {
    result = `${result.trimEnd()}\n\n## Sai lầm đã gặp và cách phòng tránh\n`;
  }

  for (const lesson of lessons) {
    if (!lesson?.title || result.includes(`### ${lesson.title}`)) continue;
    result += `\n### ${lesson.title}\n- Dấu hiệu: ${lesson.symptom}\n- Root cause: ${lesson.rootCause}\n- Cách phòng tránh: ${lesson.prevention}\n- Cách kiểm chứng: ${lesson.verification}\n`;
  }

  return result;
}

export function buildCodexArgs({ root, schema, output, prompt, role }) {
  const sandbox = role === "implementation" ? "workspace-write" : "read-only";
  return [
    "exec",
    "--ephemeral",
    "--json",
    "-C",
    root,
    "--sandbox",
    sandbox,
    "--output-schema",
    schema,
    "--output-last-message",
    output,
    prompt,
  ];
}

export function detectAgent(env = {}, parentCommand = "") {
  if (env.CLAUDECODE || env.CLAUDE_CODE_ENTRYPOINT || /(?:^|\/)claude(?:\s|$)/i.test(parentCommand)) return "claude";
  if (env.OPENCODE || /(?:^|\/)opencode(?:\s|$)/i.test(parentCommand)) return "opencode";
  if (env.CODEX_SESSION_ID || env.CODEX_THREAD_ID || /(?:^|\/)codex(?:\s|$)/i.test(parentCommand)) return "codex";
  return null;
}

export function ancestorCommands(psOutput, startPid) {
  const processes = new Map();
  for (const line of psOutput.split("\n")) {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (match) processes.set(Number(match[1]), { parent: Number(match[2]), command: match[3] });
  }
  const commands = [];
  const visited = new Set();
  let pid = startPid;
  while (pid && !visited.has(pid) && processes.has(pid)) {
    visited.add(pid);
    const process = processes.get(pid);
    commands.push(process.command);
    pid = process.parent;
  }
  return commands.join("\n");
}

export function buildAgentInvocation({ agent, root, schema, schemaText, output, prompt, role }) {
  if (agent === "codex") {
    return { command: "codex", args: buildCodexArgs({ root, schema, output, prompt, role }), writesOutput: true };
  }
  if (agent === "claude") {
    return {
      command: "claude",
      args: [
        "-p",
        prompt,
        "--output-format",
        "json",
        "--json-schema",
        schemaText,
        "--no-session-persistence",
        "--permission-mode",
        role === "implementation" ? "acceptEdits" : "plan",
      ],
      writesOutput: false,
    };
  }
  if (agent === "opencode") {
    const schemaPrompt = `${prompt}\n\nYour final response must be only JSON matching this schema:\n${schemaText}`;
    return {
      command: "opencode",
      args: ["run", "--format", "json", "--agent", role === "implementation" ? "build" : "plan", ...(role === "implementation" ? ["--auto"] : []), schemaPrompt],
      writesOutput: false,
    };
  }
  throw new Error(`Unsupported AI agent: ${agent}`);
}

function parseJsonText(value) {
  if (typeof value !== "string") return value;
  return JSON.parse(value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
}

export function parseAgentResult(agent, stdout) {
  if (agent === "claude") {
    const envelope = parseJsonText(stdout);
    return parseJsonText(envelope.structured_output ?? envelope.result ?? envelope);
  }
  if (agent === "opencode") {
    const texts = stdout.split("\n").filter(Boolean).flatMap((line) => {
      try {
        const event = JSON.parse(line);
        return [event.part?.text, event.text, event.result, event.message?.content].filter((value) => typeof value === "string");
      } catch {
        return [];
      }
    });
    for (const candidate of [...texts].reverse()) {
      try { return parseJsonText(candidate); } catch {}
    }
    return parseJsonText(texts.join(""));
  }
  return parseJsonText(stdout);
}

export function validatePlan(plan) {
  if (plan?.status === "NEEDS_DECISION" || plan?.decisions?.length) {
    throw new Error(`Plan needs a user decision: ${(plan?.decisions ?? []).join("; ")}`);
  }
  if (plan?.status !== "PLAN_READY") throw new Error("Planner did not return PLAN_READY.");
  if (/\b(?:TBD|TODO|FIXME)\b/i.test(JSON.stringify(plan))) {
    throw new Error("Plan contains a placeholder (TBD/TODO/FIXME).");
  }
  for (const [field, value] of Object.entries({ affectedRoutes: plan.affectedRoutes, tasks: plan.tasks, tests: plan.tests })) {
    if (!Array.isArray(value) || value.length === 0) throw new Error(`Plan field ${field} must not be empty.`);
  }
  return plan;
}

export function shouldRunSecurity(paths, changedContents = new Map()) {
  if (classifyChangedFiles(paths).needsSecurityReview) return true;
  return paths.some((path) => {
    const source = changedContents.get(path) ?? "";
    return /["']use server["']|server-only|cookies\(|SUPABASE_SERVICE_ROLE|service[_-]?role/i.test(source);
  });
}

function score(checks, label) {
  const match = checks.join("\n").match(new RegExp(`${label}\\s*:\\s*(\\d+)`, "i"));
  return match ? Number(match[1]) : null;
}

export function validateReview(report, { requireSeo = false, routes = [] } = {}) {
  if (!report || !["SECURITY", "QC"].includes(report.kind)) throw new Error("Invalid review kind.");
  if (report.status !== "PASS") throw new Error(`${report.kind} review did not pass: ${report.status}`);

  const blocking = (report.findings ?? []).filter((finding) => ["Critical", "High", "Medium"].includes(finding.severity));
  if (blocking.length) throw new Error(`${report.kind.toLowerCase()} security finding blocks the workflow: ${blocking[0].problem}`);

  if (report.kind === "QC") {
    if (requireSeo && score(report.checks ?? [], "Lighthouse SEO") !== 100) {
      throw new Error("QC requires Lighthouse SEO 100 evidence.");
    }
    const minimums = { Performance: 90, Accessibility: 95, "Best Practices": 95 };
    for (const [label, minimum] of Object.entries(minimums)) {
      const actual = score(report.checks ?? [], label);
      if (actual === null || actual < minimum) throw new Error(`QC requires ${label} >= ${minimum} evidence.`);
    }

    const evidence = report.browserEvidence ?? [];
    const routesToCheck = routes.length ? routes : [...new Set(evidence.map((entry) => entry.route))];
    for (const route of routesToCheck) {
      const routeEvidence = evidence.filter((entry) => entry.route === route);
      const viewports = new Set(routeEvidence.map((entry) => entry.viewport));
      if (!viewports.has(390) || !viewports.has(1280)) {
        throw new Error(`Browser verification for ${route} must include 390px and 1280px.`);
      }
      for (const entry of routeEvidence) {
        if (entry.parityPercent !== 100) throw new Error(`Browser parity 100 is required for ${route}.`);
        if (entry.consoleErrors !== 0 || entry.horizontalOverflow || entry.brokenImages !== 0 || !entry.evidence) {
          throw new Error(`Browser evidence failed for ${route} at ${entry.viewport}px.`);
        }
      }
    }
  }

  return report;
}

export function validateSitemap(xml) {
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => new URL(match[1]));
  if (!urls.length) throw new Error("Sitemap contains no URLs.");
  const paths = [];
  for (const url of urls) {
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") throw new Error("Sitemap contains localhost.");
    if (url.protocol !== "https:") throw new Error("Sitemap URLs must use HTTPS.");
    if (/^\/(?:studio|invite|account|api)(?:\/|$)/.test(url.pathname)) throw new Error(`Sitemap contains private route ${url.pathname}.`);
    paths.push(`${url.pathname}${url.search}`);
  }
  return [...new Set(paths)];
}

export function collectChangedPaths(outputs) {
  const paths = [];
  for (const output of outputs) {
    for (const line of output.split("\n").filter(Boolean)) {
      const parts = line.split("\t");
      if (/^[A-Z?]/.test(parts[0]) && parts.length > 1) paths.push(...parts.slice(1));
      else paths.push(line.trim());
    }
  }
  return [...new Set(paths.filter(Boolean))].sort();
}

export function createRunId(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
}

function markdown(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function formatRunRow(run) {
  return `| ${markdown(run.id)} | ${markdown(run.createdAt)} | ${markdown((run.designFiles ?? []).join(", "))} | ${markdown(run.gates ?? run.status)} | ${markdown(run.security ?? "—")} | ${markdown(run.qc ?? "—")} | ${markdown(run.previewUrl)} | ${markdown(run.productionUrl)} |`;
}

export function buildPrompt(role, context) {
  const common = `Run ID: ${context.runId}\nRepository: ${ROOT}\nRead AGENTS.md and CLAUDE.md first. Never modify design/. Never commit or deploy. Do not run npm run design recursively. Return only JSON matching the provided output schema.`;
  if (role === "plan") {
    return `${common}\n\nYou are the read-only planning agent. Read business.md, design/README.md, Guide-convert-html-design-to-code.md, PROGRESS.md, the changed design files, relevant Next.js 16 docs in node_modules/next/dist/docs, and current code. Produce a decision-complete minimal implementation plan. Reuse existing code, include exact routes/files, test-first steps, browser verification, SEO 100 requirements, performance impact, and security impact. Use NEEDS_DECISION instead of guessing when business and design conflict.\nChanged design files: ${(context.designFiles ?? []).join(", ")}`;
  }
  if (role === "implementation") {
    return `${common}\n\nYou are the implementation agent. Read and execute the approved plan at ${context.planPath}. Follow test-driven development and Guide-convert-html-design-to-code.md. Preserve unrelated working-tree changes. Use secure Next.js/React defaults, optimize maintainability and performance, and update PROGRESS.md. ${context.reason ? `This is a repair pass. Fix this verified failure only:\n${context.reason}` : ""}`;
  }
  if (role === "security") {
    return `${common}\n\nYou are an independent read-only Next.js/React/Supabase security reviewer. Review only the implementation delta and its trust boundaries. Check server-side auth/authz, IDOR, runtime validation, CSRF/origin, secrets, RLS/service-role isolation, injection, XSS, SSRF, redirects, uploads, webhooks, rate limits, cookies, CORS, caching, CSP, error leakage, and abuse-case tests. Any Critical/High or trust-boundary Medium means FAIL. browserEvidence must be an empty array for SECURITY.\nApproved plan: ${context.planPath}\nChanged files: ${(context.changedFiles ?? []).join(", ")}`;
  }
  if (role === "qc") {
    return `${common}\n\nYou are an independent read-only QC/QA reviewer. Read ${context.planPath} and Guide-convert-html-design-to-code.md. Browser verification is mandatory: start/reuse the built app and static design server, then use the browser automation tool available in your current agent (browser-use, Chrome, or equivalent) to compare every affected route directly against its .dc.html source at both 390px and 1280px. Measure computed styles and section geometry, inspect screenshots, scroll/reveal all content, and check console errors, horizontal overflow, broken images, accessibility, reduced motion, metadata, robots, sitemap, Lighthouse SEO 100, Performance >=90, Accessibility >=95 and Best Practices >=95. Set parityPercent to 100 only when every visual difference is either fixed or an explicitly approved business deviation. Missing browser tooling or evidence is BLOCKED, never PASS. Put concise browser evidence references in the JSON report; do not modify repository files. Return one browserEvidence entry per route and viewport.\nChanged files: ${(context.changedFiles ?? []).join(", ")}`;
  }
  throw new Error(`Unknown agent role: ${role}`);
}

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function run(command, args, { cwd = ROOT, allowFailure = false, quiet = false } = {}) {
  return await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (!quiet) process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (!quiet) process.stderr.write(text);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const result = { code: code ?? 1, stdout, stderr };
      if (result.code !== 0 && !allowFailure) {
        const error = new Error(`${command} ${args.join(" ")} failed with exit ${result.code}`);
        error.result = result;
        reject(error);
      } else resolvePromise(result);
    });
  });
}

async function git(args, options = {}) {
  return await run("git", args, { ...options, quiet: true });
}

async function discoverDesignChanges(previous) {
  let baseline = previous?.completedCommit;
  if (!baseline) {
    const mergeBase = await git(["merge-base", "HEAD", "origin/main"], { allowFailure: true });
    baseline = mergeBase.code === 0 ? mergeBase.stdout.trim() : "HEAD^";
  }
  const committed = await git(["diff", "--name-status", `${baseline}...HEAD`, "--", "design/"], { allowFailure: true });
  const working = await git(["diff", "--name-status", "--", "design/"], { allowFailure: true });
  const untracked = await git(["ls-files", "--others", "--exclude-standard", "--", "design/"], { allowFailure: true });
  return collectChangedPaths([committed.stdout, working.stdout, untracked.stdout]);
}

function hashFiles(paths) {
  const hash = createHash("sha256");
  for (const relative of [...new Set(paths)].sort()) {
    hash.update(relative);
    const absolute = join(ROOT, relative);
    hash.update(existsSync(absolute) ? readFileSync(absolute) : "<deleted>");
  }
  return hash.digest("hex");
}

function isSourcePath(path) {
  return /^(?:app|components|lib|netlify|public|scripts|supabase|tests)\//.test(path)
    || /^(?:package(?:-lock)?\.json|next\.config\.ts|netlify\.toml|open-next\.config\.ts|tsconfig\.json)$/.test(path);
}

async function sourceSnapshot() {
  const listed = await git(["ls-files", "-co", "--exclude-standard"], { allowFailure: true });
  const files = listed.stdout.split("\n").filter((path) => path && isSourcePath(path));
  return new Map(files.map((path) => [path, hashFiles([path])]));
}

function snapshotDiff(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter((path) => before.get(path) !== after.get(path))
    .sort();
}

function changedContents(paths) {
  return new Map(paths.map((path) => {
    const absolute = join(ROOT, path);
    return [path, existsSync(absolute) ? readFileSync(absolute, "utf8") : ""];
  }));
}

function parseAgentOutput(path) {
  const raw = readFileSync(path, "utf8").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(raw);
}

let activeAgent;

async function resolveAgent() {
  if (activeAgent) return activeAgent;
  const processes = await run("ps", ["-axo", "pid=,ppid=,command="], { allowFailure: true, quiet: true });
  activeAgent = detectAgent(process.env, ancestorCommands(processes.stdout, process.pid));
  if (!activeAgent) {
    for (const candidate of ["codex", "claude", "opencode"]) {
      const available = await run(candidate, ["--version"], { allowFailure: true, quiet: true }).catch(() => ({ code: 1 }));
      if (available.code === 0) {
        activeAgent = candidate;
        break;
      }
    }
  }
  if (!activeAgent) throw new Error("No supported AI agent CLI found (Codex, Claude Code, or OpenCode).");
  console.log(`[AI agent] ${activeAgent}`);
  return activeAgent;
}

async function runAgent(role, context) {
  const schemaName = role === "plan" ? "plan" : role === "implementation" ? "implementation" : "review";
  const schema = join(ROOT, "scripts", "schemas", `design-${schemaName}.schema.json`);
  const output = join(context.artifactDir, `${role}-${Date.now()}.json`);
  const prompt = buildPrompt(role, context);
  const agent = await resolveAgent();
  const invocation = buildAgentInvocation({
    agent,
    root: ROOT,
    schema,
    schemaText: readFileSync(schema, "utf8"),
    output,
    prompt,
    role,
  });
  const result = await run(invocation.command, invocation.args);
  if (invocation.writesOutput) return parseAgentOutput(output);
  const parsed = parseAgentResult(agent, result.stdout);
  writeJson(output, parsed);
  return parsed;
}

async function runGates(artifactDir) {
  const gates = [
    ["npm", ["test"]],
    ["npm", ["run", "typecheck"]],
    ["npm", ["run", "build"]],
  ];
  for (const [command, args] of gates) {
    const label = [command, ...args].join(" ").replaceAll(" ", "-").replaceAll("/", "-");
    try {
      const result = await run(command, args);
      writeFileSync(join(artifactDir, `${label}.log`), `${result.stdout}${result.stderr}`);
    } catch (error) {
      const output = `${error.result?.stdout ?? ""}${error.result?.stderr ?? ""}`;
      writeFileSync(join(artifactDir, `${label}.log`), output);
      throw new Error(`${command} ${args.join(" ")} failed.\n${output.slice(-6000)}`);
    }
  }
}

function saveState(state) {
  writeJson(STATE_PATH, state);
}

async function repair(state, reason) {
  state.retries = (state.retries ?? 0) + 1;
  if (state.retries > 2) throw new Error("Workflow stopped after two automatic repair attempts.");
  const before = await sourceSnapshot();
  const result = await runAgent("implementation", { ...state, reason });
  if (result.status !== "IMPLEMENTATION_DONE") throw new Error(`Implementation repair blocked: ${result.blockers.join("; ")}`);
  const after = await sourceSnapshot();
  state.changedFiles = [...new Set([...(state.changedFiles ?? []), ...snapshotDiff(before, after), ...(result.filesChanged ?? [])])].sort();
  saveState(state);
  await runGates(state.artifactDir);
}

async function reviewWithRepairs(kind, state, requireSeo) {
  for (;;) {
    const report = await runAgent(kind, state);
    writeJson(join(state.artifactDir, `${kind}-result.json`), report);
    if (report.status === "BLOCKED") throw new Error(`${kind.toUpperCase()} blocked: ${report.summary}`);
    try {
      validateReview(report, { requireSeo, routes: state.plan.affectedRoutes });
      return report;
    } catch (error) {
      await repair(state, `${kind.toUpperCase()} failed:\n${JSON.stringify(report.findings)}\n${error.message}`);
    }
  }
}

async function deploy(preview) {
  const args = ["deploy", "--json"];
  if (preview) args.push("--context", "deploy-preview");
  else args.push("--prod");
  const result = await run("netlify", args);
  const lines = result.stdout.trim().split("\n");
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const data = JSON.parse(lines.slice(index).join("\n"));
      const url = data.deploy_url ?? data.url ?? data.ssl_url;
      if (url) return url;
    } catch {}
  }
  throw new Error("Netlify deploy succeeded but returned no deploy URL.");
}

async function smokeTest(baseUrl, routes) {
  const targets = ["/", "/robots.txt", "/sitemap.xml", ...routes]
    .filter((route) => route.startsWith("/") && !route.includes("[") && !route.startsWith("/invite/"));
  for (const route of [...new Set(targets)]) {
    const response = await fetch(new URL(route, baseUrl), { redirect: "follow" });
    if (!response.ok) throw new Error(`Smoke test failed: ${route} returned ${response.status}.`);
    if (route === "/sitemap.xml") {
      const xml = await response.text();
      for (const sitemapPath of validateSitemap(xml)) {
        const page = await fetch(new URL(sitemapPath, baseUrl), { redirect: "follow" });
        if (!page.ok) throw new Error(`Sitemap URL failed on deploy: ${sitemapPath} returned ${page.status}.`);
      }
    }
  }
}

function upsertProcessRow(state) {
  const path = join(ROOT, "process.md");
  const current = readFileSync(path, "utf8");
  const row = formatRunRow(state);
  const marker = `| ${state.id} |`;
  const next = current.includes(marker)
    ? current.split("\n").map((line) => line.startsWith(marker) ? row : line).join("\n")
    : `${current.trimEnd()}\n${row}\n`;
  writeFileSync(path, next);
}

function persistLessons(reports) {
  const lessons = reports.flatMap((report) => report?.lessons ?? []);
  if (!lessons.length) return;
  const path = join(ROOT, "Guide-convert-html-design-to-code.md");
  const current = readFileSync(path, "utf8");
  writeFileSync(path, appendVerifiedLessons(current, lessons));
}

async function confirmProduction() {
  if (!process.stdin.isTTY) return false;
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question("Deploy production? [y/N] ");
  prompt.close();
  return answer.trim().toLowerCase() === "y";
}

async function execute(state) {
  for (;;) {
    const stage = nextStage(state.status);
    if (stage === "analyzing") {
      console.log(`\n[Analyze] ${state.designFiles.length} design file(s): ${state.designFiles.join(", ")}`);
      state.status = "analyzing";
      saveState(state);
      const plan = validatePlan(await runAgent("plan", state));
      state.plan = plan;
      state.planPath = join(state.artifactDir, "plan.json");
      writeJson(state.planPath, plan);
      state.status = "planned";
      saveState(state);
      continue;
    }
    if (stage === "implementing") {
      console.log("\n[Implementation] AI agent is executing the approved plan...");
      const before = await sourceSnapshot();
      const result = await runAgent("implementation", state);
      if (result.status !== "IMPLEMENTATION_DONE") throw new Error(`Implementation blocked: ${result.blockers.join("; ")}`);
      const after = await sourceSnapshot();
      state.changedFiles = [...new Set([...snapshotDiff(before, after), ...(result.filesChanged ?? [])])].sort();
      state.status = "implemented";
      saveState(state);
      continue;
    }
    if (stage === "verifying") {
      console.log("\n[Verification] Running tests, typecheck and build...");
      try {
        await runGates(state.artifactDir);
      } catch (error) {
        await repair(state, error.message);
      }
      state.gates = "PASS";
      state.status = "verified";
      saveState(state);
      continue;
    }
    if (stage === "security") {
      const needsSecurity = shouldRunSecurity(state.changedFiles ?? [], changedContents(state.changedFiles ?? []));
      if (needsSecurity) {
        console.log("\n[Security] Running independent backend security review...");
        state.securityReport = await reviewWithRepairs("security", state, false);
        state.security = "PASS";
        state.status = "security-passed";
      } else {
        state.security = "SKIPPED (no backend delta)";
        state.status = "security-skipped";
      }
      saveState(state);
      continue;
    }
    if (stage === "qc") {
      console.log("\n[Browser QC/QA] Verifying design parity at 390px and 1280px...");
      const hasPublicRoute = state.plan.affectedRoutes.some((route) => !/^\/(?:studio|invite|account|api)(?:\/|$)/.test(route));
      state.qcReport = await reviewWithRepairs("qc", state, hasPublicRoute);
      state.qc = "PASS (browser parity 100, SEO 100)";
      persistLessons([state.securityReport, state.qcReport]);
      state.inputFingerprint = hashFiles(["business.md", "design/README.md", "Guide-convert-html-design-to-code.md", ...state.designFiles]);
      state.approvedInputFingerprint = state.inputFingerprint;
      const snapshot = await sourceSnapshot();
      state.approvedFingerprint = hashFiles([...snapshot.keys()]);
      state.status = "qc-passed";
      saveState(state);
      continue;
    }
    if (stage === "preview") {
      console.log("\n[Preview] Deploying to Netlify...");
      state.previewUrl = await deploy(true);
      await smokeTest(state.previewUrl, state.plan.affectedRoutes);
      state.status = "previewed";
      upsertProcessRow(state);
      saveState(state);
      console.log(`Preview: ${state.previewUrl}`);
      continue;
    }
    if (stage === "production-confirmation") {
      const snapshot = await sourceSnapshot();
      const currentFingerprint = hashFiles([...snapshot.keys()]);
      const currentInputFingerprint = hashFiles(["business.md", "design/README.md", "Guide-convert-html-design-to-code.md", ...state.designFiles]);
      if (currentFingerprint !== state.approvedFingerprint || currentInputFingerprint !== state.approvedInputFingerprint) {
        state.status = "implemented";
        saveState(state);
        console.log("Source changed after QC; rerunning verification and reviews.");
        continue;
      }
      if (!await confirmProduction()) {
        console.log(`Production not deployed. Run npm run design again to resume from ${state.previewUrl}.`);
        return;
      }
      console.log("\n[Production] Deploying approved source...");
      state.productionUrl = await deploy(false);
      await smokeTest(state.productionUrl, state.plan.affectedRoutes);
      state.status = "deployed";
      state.completedCommit = (await git(["rev-parse", "HEAD"])).stdout.trim();
      upsertProcessRow(state);
      saveState(state);
      continue;
    }
    if (stage === "done") {
      console.log(`Workflow complete: ${state.productionUrl}`);
      return;
    }
  }
}

async function main() {
  mkdirSync(RUNS_DIR, { recursive: true });
  const previous = readJson(STATE_PATH);
  const discovered = await discoverDesignChanges(previous);
  const resumable = previous && previous.status !== "deployed";
  const inputFiles = resumable ? previous.designFiles : discovered;
  if (!inputFiles.length) {
    console.log("No changed design files found. Nothing to do.");
    return;
  }
  const inputFingerprint = hashFiles(["business.md", "design/README.md", "Guide-convert-html-design-to-code.md", ...inputFiles]);
  let state = resumable && previous.inputFingerprint === inputFingerprint ? previous : null;
  if (!state && previous?.status === "deployed" && previous.inputFingerprint === inputFingerprint) {
    console.log(`These design changes already completed in run ${previous.id}.`);
    return;
  }
  if (!state) {
    const id = createRunId();
    const artifactDir = join(RUNS_DIR, id);
    mkdirSync(artifactDir, { recursive: true });
    state = { id, runId: id, createdAt: new Date().toISOString(), status: "analyzing", designFiles: inputFiles, inputFingerprint, artifactDir, retries: 0 };
    saveState(state);
  }
  await execute(state);
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(`\nWorkflow stopped: ${error.message}`);
    process.exitCode = 1;
  });
}

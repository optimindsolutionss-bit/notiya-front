#!/usr/bin/env node
/**
 * Dynamic Workflow: Motion & Accesibilidad Audit — src/pages/Pantalla
 *
 * Proceso de planeacion puesto en codigo (no lenguaje natural). Fases fijas,
 * deterministas y reproducibles: scout -> bootstrap -> evaluate -> synthesize -> write.
 *
 * Uso:
 *   node scripts/dynamic-workflows/motion-audit-workflow.js
 *   npm run workflow:motion-audit
 *
 * Salida:
 *   - Reporte en docs/superpowers/audits/<timestamp>-pantalla-motion-audit.md
 *   - JSON de evidencia por stdout
 *   - Exit code 0 si todos los checks pasan, 1 si alguno falla (para poder
 *     encadenarse como verificador de un loop externo, p.ej. /goal).
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGET_DIR = join(ROOT, "src", "pages", "Pantalla");
const SPECS_DIR = join(ROOT, "docs", "superpowers", "specs");
const AUDITS_DIR = join(ROOT, "docs", "superpowers", "audits");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(jsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

// --- Fase 1: scout ----------------------------------------------------------
// Recorre el directorio objetivo y extrae hechos crudos (conteos, matches).
// No interpreta nada todavia: solo observa.
function scout() {
  const files = walk(TARGET_DIR);
  const facts = {
    files: files.map((f) => relative(ROOT, f)),
    keyframes: 0,
    animatedClasses: 0,
    reducedMotionGuards: 0,
    consoleDebugHits: [],
    willChangeHits: 0,
    usesFramerReducedMotion: false,
  };

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    facts.keyframes += (src.match(/@keyframes/g) || []).length;
    facts.animatedClasses += (src.match(/animation-name\s*:/g) || []).length;
    facts.reducedMotionGuards += (src.match(/prefers-reduced-motion/g) || []).length;
    facts.willChangeHits += (src.match(/will-change/g) || []).length;
    if (/useReducedMotion/.test(src)) facts.usesFramerReducedMotion = true;

    const debugMatches = [...src.matchAll(/console\.(log|debug|warn)\(|debugger;?/g)];
    for (const m of debugMatches) {
      facts.consoleDebugHits.push({ file: relative(ROOT, file), match: m[0] });
    }
  }

  return facts;
}

// --- Fase 2: bootstrap -------------------------------------------------------
// Junta el contexto de decisiones previas (specs ya escritas) relevantes al
// area auditada, para que el reporte final enlace la razon de cada patron.
function bootstrap() {
  let specFiles;
  try {
    specFiles = readdirSync(SPECS_DIR).filter((f) => /pantalla|tilt|animada/i.test(f));
  } catch {
    specFiles = [];
  }
  return specFiles.map((f) => relative(ROOT, join(SPECS_DIR, f)));
}

// --- Fase 3: evaluate ---------------------------------------------------------
// Aplica una rubrica fija sobre los hechos de scout(). Cada check es
// determinista: mismos hechos -> mismo resultado, siempre.
function evaluate(facts) {
  const checks = [];

  checks.push({
    id: "reduced-motion-css",
    label: "Cada bloque de @keyframes tiene guardia prefers-reduced-motion",
    pass: facts.keyframes === 0 || facts.reducedMotionGuards >= 1,
    detail: `keyframes=${facts.keyframes} guards=${facts.reducedMotionGuards}`,
  });

  checks.push({
    id: "reduced-motion-js",
    label: "La escena React respeta useReducedMotion (framer-motion)",
    pass: facts.usesFramerReducedMotion,
    detail: `usesFramerReducedMotion=${facts.usesFramerReducedMotion}`,
  });

  checks.push({
    id: "no-debug-code",
    label: "Sin console.log/debugger residual en Pantalla",
    pass: facts.consoleDebugHits.length === 0,
    detail:
      facts.consoleDebugHits.length === 0
        ? "ok"
        : facts.consoleDebugHits.map((h) => `${h.file}: ${h.match}`).join("; "),
  });

  let lintPass = true;
  let lintOutput;
  try {
    lintOutput = execSync(`npx eslint "${relative(ROOT, TARGET_DIR)}"`, {
      cwd: ROOT,
      stdio: "pipe",
    }).toString();
  } catch (err) {
    lintPass = false;
    lintOutput = (err.stdout ? err.stdout.toString() : "") + (err.stderr ? err.stderr.toString() : "");
  }
  checks.push({
    id: "eslint-pantalla",
    label: "eslint sobre src/pages/Pantalla sin errores",
    pass: lintPass,
    detail: lintPass ? "ok" : lintOutput.slice(0, 800),
  });

  return checks;
}

// --- Fase 4: synthesize -------------------------------------------------------
// Combina hechos + contexto + checks en un resultado estructurado unico.
function synthesize(facts, specs, checks) {
  const failing = checks.filter((c) => !c.pass);
  return {
    timestamp: new Date().toISOString(),
    target: relative(ROOT, TARGET_DIR),
    facts,
    relatedSpecs: specs,
    checks,
    passCount: checks.length - failing.length,
    totalChecks: checks.length,
    status: failing.length === 0 ? "PASS" : "FAIL",
  };
}

// --- Fase 5: write -------------------------------------------------------------
// Efecto de salida: un unico artefacto Markdown reproducible en docs/.
function write(result) {
  const stamp = result.timestamp.replace(/[:.]/g, "-");
  const outPath = join(AUDITS_DIR, `${stamp}-pantalla-motion-audit.md`);

  const lines = [
    `# Motion audit — ${result.target}`,
    "",
    `Generado por \`scripts/dynamic-workflows/motion-audit-workflow.js\` el ${result.timestamp}.`,
    "",
    `**Resultado: ${result.status}** (${result.passCount}/${result.totalChecks} checks)`,
    "",
    "## Checks",
    "",
    ...result.checks.map(
      (c) => `- [${c.pass ? "x" : " "}] **${c.id}** — ${c.label}\n  - ${c.detail}`
    ),
    "",
    "## Hechos (scout)",
    "",
    `- Archivos analizados: ${result.facts.files.length}`,
    `- @keyframes: ${result.facts.keyframes}`,
    `- Clases con animation-name: ${result.facts.animatedClasses}`,
    `- Guardias prefers-reduced-motion: ${result.facts.reducedMotionGuards}`,
    `- will-change hits: ${result.facts.willChangeHits}`,
    "",
    "## Specs relacionadas (bootstrap)",
    "",
    ...(result.relatedSpecs.length
      ? result.relatedSpecs.map((s) => `- ${s}`)
      : ["- (ninguna encontrada)"]),
    "",
  ];

  writeFileSync(outPath, lines.join("\n"), "utf8");
  return outPath;
}

// --- Orquestacion ---------------------------------------------------------------
function main() {
  const facts = scout();
  const specs = bootstrap();
  const checks = evaluate(facts);
  const result = synthesize(facts, specs, checks);
  const reportPath = write(result);

  console.log(JSON.stringify(result, null, 2));
  console.log(`\nReporte guardado en: ${relative(ROOT, reportPath)}`);

  if (result.status !== "PASS") {
    console.error(`\nWorkflow FAIL: ${result.totalChecks - result.passCount} check(s) sin pasar.`);
    process.exit(1);
  }
}

main();

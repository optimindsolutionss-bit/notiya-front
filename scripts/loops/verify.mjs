#!/usr/bin/env node
/**
 * Verificador del loop de autocorreccion (verify-and-heal).
 *
 * Corre siempre: lint + build (verificador de CODIGO).
 * Solo en superficie "local" agrega un smoke test de Playwright contra el
 * dev server real (verificador de PRODUCTO) -- en la nube no hay navegador
 * ni servidor corriendo, asi que ese check no aplica.
 *
 * Uso:
 *   node scripts/loops/verify.mjs --surface=local
 *   node scripts/loops/verify.mjs --surface=cloud
 *
 * Salida: JSON por stdout + exit code 0 (PASS) / 1 (FAIL).
 */

import { execSync, spawn } from "node:child_process";

const surface = (process.argv.find((a) => a.startsWith("--surface=")) || "--surface=local").split("=")[1];

function run(label, cmd) {
  const startedAt = Date.now();
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: "pipe" });
    return { id: label, cmd, pass: true, ms: Date.now() - startedAt, output: output.slice(-2000) };
  } catch (err) {
    const output = (err.stdout || "") + (err.stderr || "");
    return { id: label, cmd, pass: false, ms: Date.now() - startedAt, output: output.slice(-4000) };
  }
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // servidor todavia no responde, seguimos esperando
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function runPlaywrightAgainstDevServer() {
  const dev = spawn("npx", ["vite", "--port", "5183", "--strictPort"], {
    stdio: "ignore",
    shell: true,
  });

  try {
    const up = await waitForServer("http://localhost:5183/", 20000);
    if (!up) {
      return { id: "e2e-pantalla", pass: false, output: "dev server no respondio en 20s" };
    }
    return run("e2e-pantalla", "npx playwright test");
  } finally {
    dev.kill();
  }
}

async function main() {
  const checks = [];
  checks.push(run("lint", "npm run lint"));
  checks.push(run("build", "npm run build"));

  if (surface === "local") {
    checks.push(await runPlaywrightAgainstDevServer());
  }

  const failing = checks.filter((c) => !c.pass);
  const result = {
    timestamp: new Date().toISOString(),
    surface,
    verifierType: surface === "local" ? "codigo+producto" : "codigo",
    status: failing.length === 0 ? "PASS" : "FAIL",
    passCount: checks.length - failing.length,
    totalChecks: checks.length,
    checks,
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "PASS" ? 0 : 1);
}

main();

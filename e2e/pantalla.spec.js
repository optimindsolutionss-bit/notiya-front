import { test, expect } from "@playwright/test";

// Smoke test de PRODUCTO (no de codigo): confirma que la SPA arranca de
// verdad en un navegador real contra el dev server, enruta a /pantalla/:id
// y renderiza un estado coherente -- sin backend disponible, el resultado
// esperado es el estado de error definido en PantallaStates.jsx, no una
// pantalla en blanco ni una excepcion no capturada.
test("la Pantalla publica renderiza un estado valido sin quedar en blanco", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/pantalla/999999");

  await expect(page.getByText("No encontramos este negocio")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/pantalla-error-state.png", fullPage: true });

  expect(pageErrors).toEqual([]);
});

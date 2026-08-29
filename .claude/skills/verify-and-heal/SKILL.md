---
name: verify-and-heal
description: Loop de verificacion end-to-end con autocorreccion para NotiYa Frontend. Corre el verificador (lint+build, y en superficie local tambien Playwright contra el dev server), y si falla invoca al subagente healer para corregir el codigo, repitiendo hasta llegar a verde o agotar el tope de intentos. Usalo cuando el usuario pida "corre el loop de verificacion", "verifica y corrige", o dispare este skill desde una Routine en la nube.
---

# verify-and-heal

Orquestador del loop de autocorreccion. Es la misma anatomia en las dos
superficies (local y nube): trigger -> agente -> verificador -> (si falla)
healer -> verificador de nuevo -> ... -> reporte final. Lo unico que cambia
entre superficies es (a) quien dispara el trigger y (b) que tan estricto es
el verificador (ver `scripts/loops/verify.mjs`: local corre lint+build+e2e,
cloud solo lint+build porque no hay navegador ni dev server ahi).

## Argumentos

`args` recibido por el skill: `<surface> [max_iterations]`

- `surface`: `local` o `cloud`. Si no se especifica, asume `local`.
- `max_iterations`: entero, default `3`. Es el hard-stop: si tras N
  invocaciones al healer el verificador sigue en rojo, el loop se detiene y
  reporta FAIL en vez de reintentar indefinidamente.

## Reglas duras (hard stops)

1. **Maximo `max_iterations` invocaciones al healer.** No hay reintento
   "infinito" bajo ninguna circunstancia.
2. **Nunca `git commit`/`git push` en superficie `local`.** El arbol de
   trabajo queda listo para revision humana.
3. **En superficie `cloud`, si se llega a verde, el unico camino para
   persistir el fix es abrir un Pull Request** (nunca push directo a
   `dev`/`master`). Si no hay forma de abrir PR en el entorno, reporta el
   diff y detente sin pushear.
4. **El healer nunca se invoca a si mismo ni relanza este skill.** Solo el
   orquestador (tu, siguiendo este SKILL.md) decide cuando reintentar.
5. Si el verificador falla por una razon distinta cada vez (no converge, el
   healer "arregla" un check y rompe otro), documentalo explicitamente en el
   reporte final -- es una senal de que el loop no deberia forzarse a
   converger.

## Procedimiento

1. **Setup.** Confirma que `node_modules/@playwright` existe si
   `surface=local` (si no, `npm install` ya deberia haberlo dejado listo;
   si falta, instalalo primero: `npx playwright install --with-deps
   chromium` una sola vez, no en cada iteracion).

2. **Iteracion 0 — verificar.** Corre:

   ```bash
   node scripts/loops/verify.mjs --surface=<surface>
   ```

   Parsea el JSON de salida. Muestra al usuario el resultado crudo (esto es
   la evidencia visual del estado ROJO/VERDE — no lo resumas de mas, deja
   ver el `status`, `checks[].pass` y el `output` de los checks que
   fallaron).

3. **Si `status == "PASS"`:** reporta verde inmediatamente con un resumen de
   los checks que corrieron y en que superficie. Fin del loop (converge en 0
   iteraciones de correccion).

4. **Si `status == "FAIL"`:** entra al loop de autocorreccion.

   Para cada intento `i` de `1` a `max_iterations`:

   a. Anuncia explicitamente el intento: "Intento `i`/`max_iterations` —
      invocando healer con el siguiente fallo: <resumen corto>".

   b. Invoca al subagente `healer` (tool `Agent`, `subagent_type: "healer"`)
      con un prompt que incluya:
      - La superficie (`local`/`cloud`).
      - El numero de intento actual.
      - La salida cruda (`output`) de cada check que fallo.
      - Recordatorio explicito de las reglas duras del healer (fix minimo,
        sin commit/push, sin tocar Pantalla salvo que el fallo este ahi).

   c. Cuando el healer termina, vuelve a correr
      `node scripts/loops/verify.mjs --surface=<surface>` (paso 2) y muestra
      el resultado de nuevo — este es el punto donde debe verse el cambio de
      ROJO a (posiblemente) VERDE.

   d. Si `status == "PASS"`, reporta exito: cuantos intentos tomo, que
      cambio el healer en cada intento, y el resultado final en verde. Fin
      del loop.

   e. Si tras `max_iterations` intentos sigue en `FAIL`, detente (hard
      stop) y reporta: el estado final, todos los intentos que se hicieron,
      y una recomendacion para intervencion humana. Nunca sigas iterando
      mas alla del tope.

5. **Reporte final (ambas superficies).** Siempre termina con un bloque
   explicito:

   ```
   SURFACE: <local|cloud>
   VERIFIER: <codigo | codigo+producto>
   RESULTADO: <PASS|FAIL>
   INTENTOS: <n>
   ```

   En superficie `cloud`, si el resultado es PASS y hubo correccion (n>0),
   procede a abrir el PR con el fix (regla dura 3) y agrega la URL del PR al
   reporte.

# Línea base de no regresión (002)

Generada el 2026-11-11 antes de tocar código.

## T001 · Pruebas

`node --test tests/` con Node v20.19.4: **31 pruebas, 31 pass, 0 fail**.
(El `node` por defecto del equipo es v14.21.3, que no tiene `--test`; se usa `%APPDATA%/nvm/v20.19.4/node.exe`.)

## T002 · Hashes SHA-256 de archivos intocables

```text
cd8c063f85734cec003988ad11bbe043c16217e618d1bb07f29a2e3b0cafac11 *src/money.js
8f9a3b31e5e6e2dda7be3ef8a321395beb6bbec92e090700b1c5c1a2f9071df4 *src/totals.js
2dd6be40c84edf204994374b930d8364c16f55f58a2bf5f82846e86cbca95ef4 *src/quotes.js
c3b7b4ce25789bba1ebfb06469bc8bd8afbb733e15578d3ca9834eb561d916e2 *src/store.js
bada124267eb1182ae78cb9d7d35359397c917ca6a274e4760aa4ab2c622664e *src/logo.js
71deb4944e87595d292d20a551ce977da98d5e584aa07d351ed2fdbbe5753d8b *tests/money.test.js
24091e95e126c036d92307aca359d659e27605c7857f1c3a285492f4b54a8c97 *tests/quotes.test.js
f2f83553beadf2d2af437acd6f54b001e832d2c6f1ce6f2d379119d391083832 *tests/totals.test.js
98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875 *vendor/jspdf.umd.min.js
913c7573ccf6265e1d3a6f859de97ed636575a16ca1b7f3fbd191816315e2d78 *package.json
```

## T003 · PDF del ejemplo de referencia

Archivo: [baseline-Presupuesto.pdf](baseline-Presupuesto.pdf) (1 página). Cliente empresa, retención 15 %,
líneas «Diseño de página web» 1.500,00 € y «Sesión de fotos de producto» 500,00 €, ambas al 21 %.
Textos dibujados en el PDF (ordenados; deben coincidir exactamente tras el rediseño, FR-120):

```json
{
 "pages": 1,
 "texts": [
  "-300,00 €",
  "08019 Barcelona",
  "1",
  "1",
  "1.500,00 €",
  "1.500,00 €",
  "2.000,00 €",
  "2.120,00 €",
  "21 %",
  "21 %",
  "28001 Madrid",
  "420,00 €",
  "500,00 €",
  "500,00 €",
  "600 000 000",
  "Acme Soluciones SL",
  "Av. Diagonal 100",
  "Base imponible",
  "Calle Mayor 1",
  "Cantidad",
  "Cliente",
  "Descripción",
  "Diseño de página web",
  "Fecha de emisión: 09/11/2026",
  "IVA",
  "IVA (21 %)",
  "Importe",
  "Laura Martín Diseño",
  "NIF/CIF: B12345678",
  "NIF: 12345678Z",
  "Nº 2026-001",
  "PRESUPUESTO",
  "Precio unitario",
  "Retención IRPF (-15 %)",
  "Sesión de fotos de producto",
  "Total",
  "Válido hasta: 09/12/2026",
  "laura@example.com"
 ]
}
```

## Resultado tras la implementación (2026-11-11)

- **T027**: `node --test tests/` (Node v20.19.4): 31 pruebas, 31 pass, 0 fail, sin modificar ninguna prueba.
- **T028**: los 10 hashes de T002 coinciden (`sha256sum -c`): ningún archivo intocable ha cambiado.
- **PDF**: el PDF rediseñado del ejemplo de referencia dibuja exactamente los mismos 38 textos que la línea base, en 1 página. Con 45 líneas y logo ocupa 3 páginas, con la cabecera de la tabla repetida y los totales sin partir.

### T030 · Quickstart § 2

Recorrido automático con Chrome headless (CDP), datos sembrados con 2 borradores y 3 emitidos: **34/34 comprobaciones PASS**.

| Paso | Resultado | Cómo |
|---|---|---|
| 1–7 | ✔ | Automático: inicio en `/`, recuentos 2/3/5, accesos, «Nuevo presupuesto» → 2026-006, recuento al día, ruta desconocida → Inicio, sección marcada (también en el editor) |
| 8, 19 | ✔ | Automático a 360 px: menú plegado, ☰ abre los 4 enlaces (≥ 44 px), Escape cierra y devuelve el foco, tocar fuera cierra, elegir un destino navega y cierra |
| 9, 20, 21 | ✔ | Automático: sin desplazamiento horizontal en las 5 pantallas a 360 px, en horizontal (740 × 360) y con el texto al 200 %; revisado también en capturas |
| 10 | ✔ | Automático (h2 «Resumen», total de 22 px frente a 18 px del siguiente importe) y revisión de capturas en móvil y escritorio |
| 12, 13, 15 | ✔ | Script Node con jsPDF: textos idénticos a la línea base, varias páginas y PDF sin logo |
| 17 y FR-110 | ✔ | Automático: el primer uso lleva a Mi perfil y no deja saltarlo; con datos dañados, aviso y navegación oculta |
| 11 | Pendiente (manual) | Necesita una persona que identifique 5 estados en escala de grises. La diferencia de borde (discontinuo/continuo) está comprobada automáticamente |
| 14 | Pendiente (manual) | Volver a descargar desde la app un presupuesto emitido antes del cambio. El código sigue usando `issuerSnapshot`, sin cambios |
| 16 | Pendiente (manual) | Imprimir en blanco y negro |
| 18 | Pendiente (manual) | Quickstart completo de la 001 en la app |

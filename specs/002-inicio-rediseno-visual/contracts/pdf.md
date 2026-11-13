# Contract: plantilla del PDF rediseñada

El **contenido** (textos, datos, importes, formatos, nombre del archivo, A4 vertical, uso de
`issuerSnapshot`) es exactamente el de
[specs/001-presupuestos-pdf/contracts/ui.md § PDF](../../001-presupuestos-pdf/contracts/ui.md)
(FR-120). Este contrato solo fija la composición.

## Fuente de estilo

- Colores: `pdf.js` lee de `:root` `--color-primary`, `--color-primary-soft`, `--color-text`,
  `--color-muted`, `--color-border` y `--color-bg` al generar el PDF ([research.md § R3](../research.md)).
- Tipografía: Helvetica, con los tamaños en pt de la tabla de
  [design-tokens.md](design-tokens.md#tipografía).
- Márgenes de 18 mm. Unidad: mm.

## Composición (de arriba abajo)

1. **Cabecera**:
   - A la izquierda, el logo (como máximo 60 × 20 mm, sin deformar). Sin logo, el nombre del
     freelancer a 20 pt en negrita y color principal, ocupando la misma altura, para que no quede
     hueco.
   - A la derecha, «PRESUPUESTO» a 20 pt en negrita y color principal, y debajo, a 10 pt, «Nº»,
     «Fecha de emisión» y «Válido hasta» en `--color-muted` (cada línea es un solo texto, como
     hoy).
2. **Filete** de 0,6 mm del color principal a todo el ancho.
3. **Partes**: los datos del freelancer (NIF, email, teléfono y dirección) van en la cabecera, bajo
   el logo o el nombre, como hoy. Bajo el filete, el bloque «Cliente» (12 pt en negrita y color
   principal) con nombre, NIF/CIF y dirección a 10 pt. No se añaden los títulos «De» y «Para»,
   porque cambiarían los textos del PDF (FR-120). Los textos se comparan con
   [baseline.md](../baseline.md).
4. **Tabla de líneas**:
   - Cabecera con fondo `--color-bg` y texto de 9 pt en negrita y `--color-muted`.
   - Filas de 10 pt separadas por filetes de 0,2 mm en `--color-border`.
   - Columnas numéricas alineadas a la derecha.
   - La descripción se ajusta en varias líneas.
5. **Totales**, alineados a la derecha (≈ 75 mm de ancho):
   - Filas de 10 pt.
   - Total a 14 pt en negrita sobre una banda `--color-primary-soft`, con un filete superior del
     color principal.

## Paginación

- Si una fila no cabe en la página, pasa a la siguiente y la cabecera de la tabla se repite.
- El bloque de totales no se parte: si no cabe entero, pasa completo a la página siguiente.

## Blanco y negro (FR-121)

Los fondos son tintes claros (luminancia > 85 %) con texto oscuro encima, y el total se distingue
por el tamaño y la negrita, no solo por el color. Impreso en escala de grises sigue siendo legible.

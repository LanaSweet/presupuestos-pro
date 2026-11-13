# Contract: pantallas y acciones

Interfaz en español. Navegación fija con tres enlaces: **Presupuestos**, **Catálogo** y **Mi
perfil**. Las rutas son hashes en la URL.

## `#/perfil` — Mi perfil (FR-001, FR-002, FR-022)

- Campos: nombre*, NIF*, email, teléfono, dirección, logo (PNG/JPG ≤ 1 MB, con vista previa y
  botón «Quitar»), retención habitual (No retengo / 15 % / 7 %). *Obligatorio para descargar PDF.
- Aviso permanente: «Tus datos se guardan solo en este navegador de este dispositivo. No se
  sincronizan y se pierden si borras los datos del navegador o cambias de dispositivo.»
- Acción: **Guardar**.
- En el primer uso (`onboarded = false`), cualquier ruta redirige aquí. Tras guardar, va a
  `#/presupuestos`.

## `#/catalogo` — Catálogo (FR-004, FR-005)

- Tabla: nombre, precio por defecto, acciones **Editar** y **Borrar** (con confirmación).
- Formulario: nombre*, precio por defecto* (≥ 0). Acción **Añadir servicio** / **Guardar**.

## `#/presupuestos` — Lista (FR-013b)

- Tabla ordenada por número de mayor a menor: número, cliente, fecha de emisión, total y estado
  (Borrador / Emitido). Cada fila abre el presupuesto.
- Acción: **Nuevo presupuesto**: crea un borrador (con número asignado) y lo abre.
- Lista vacía: «Todavía no tienes presupuestos» y el botón Nuevo presupuesto.

## `#/presupuestos/<id>` — Presupuesto

**Cabecera**: número, estado, fecha de emisión (editable solo en borrador, campo de texto con
máscara DD/MM/AAAA: las barras se insertan solas y una fecha inexistente muestra «Fecha no
válida») y «Válido hasta» (se calcula solo).

**Cliente**: nombre*, NIF/CIF, dirección, tipo* (Empresa/autónomo · Particular, sin marcar al
crear).

**Retención IRPF**: No / 15 % / 7 %, con valor inicial del perfil. Si el tipo es Particular, el
control se desactiva con el texto «A particulares no se aplica retención». Si el tipo está sin
marcar, se desactiva con «Elige el tipo de cliente para aplicar la retención».

**Líneas**: tabla con descripción, cantidad, precio unitario, IVA (21/10/4/0 %), importe
(calculado) y **Borrar**. Acciones: **Añadir del catálogo** (selector de servicios) y **Añadir
línea manual**. Los errores (cantidad ≤ 0, precio < 0, descripción vacía) se muestran junto a la
línea.

**Resumen** (se actualiza al momento): base imponible, una fila por cada tipo de IVA usado,
retención (si es mayor que 0) y total.

**Acciones**:

| Acción | Borrador | Emitido |
|---|---|---|
| Editar campos y líneas | Sí | No (todo en solo lectura) |
| **Descargar PDF** | Valida y, si todo es correcto, emite y descarga | Descarga el mismo PDF |
| **Duplicar** | Sí | Sí |
| **Borrar** | Sí, con confirmación | No se muestra |

**Bloqueos de Descargar PDF** (sin emitir ni descargar):
- Perfil sin nombre o NIF: «Completa tu nombre y NIF en Mi perfil para descargar el PDF», con
  enlace al perfil.
- Sin líneas: «Añade al menos una línea antes de descargar el PDF».
- Líneas con errores, o sin nombre de cliente: se indica qué falta.
- Tipo de cliente sin marcar: «Indica si el cliente es empresa/autónomo o particular».

Antes de emitir, se confirma (FR-027): «Al descargar, el presupuesto quedará emitido y ya no podrás
modificarlo. ¿Continuar?».

## Mensajes globales

- Almacenamiento lleno (FR-028): «No queda espacio en este navegador»; el cambio no se aplica.
- Datos dañados (FR-029): «No se han podido leer tus datos guardados» y botón «Empezar de cero»,
  que pide confirmar «Se borrarán todos tus datos. ¿Continuar?».

## PDF (FR-018)

- Archivo: `Presupuesto-<número>.pdf`, tamaño A4 vertical.
- Contenido, de arriba abajo:
  - Cabecera: logo, o el nombre del freelancer si no hay logo; datos del freelancer.
  - «PRESUPUESTO», número, fecha de emisión y «Válido hasta».
  - Datos del cliente.
  - Tabla de líneas: descripción, cantidad, precio unitario, IVA e importe.
  - Resumen: base imponible, IVA por tipo, retención de IRPF (si la hay) y **Total**.
- Los datos del freelancer y el logo salen de `issuerSnapshot` (emitido).
- Importes en formato `1.500,00 €` y fechas en DD/MM/AAAA.

## Adaptación a móvil (FR-024 – FR-026)

- Ancho mínimo soportado: 360 px en vertical, sin desplazamiento horizontal.
- **< 768 px**: una columna. Navegación como barra fija con los tres enlaces. La lista de
  presupuestos se muestra en tarjetas (número, cliente, total y estado; la fecha debajo). Las
  líneas del presupuesto también son tarjetas con sus campos apilados y el importe destacado. El
  resumen de totales va fijo al final del presupuesto, con el botón Descargar PDF.
- **≥ 768 px**: tablas como se describen arriba.
- Campos de cantidad y precio con teclado numérico decimal; botones y zonas táctiles de 44 px
  como mínimo.
- Aviso de datos en el perfil: se añade «En iPhone, Safari puede borrarlos si no usas la app
  durante unos días».
- PDF: idéntico en todos los dispositivos (A4). En iPhone se abre en el visor del sistema; en
  Android se descarga.

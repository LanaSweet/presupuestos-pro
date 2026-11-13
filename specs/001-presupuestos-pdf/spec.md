# Feature Specification: PresupuestosPro v0 — presupuestos en PDF para freelancers

**Feature Branch**: `001-presupuestos-pdf` (el proyecto no es un repositorio git; no se ha creado rama)

**Created**: 2026-11-09

**Status**: Draft

**Input**: Especificación de PresupuestosPro v0 aportada por la usuaria (objetivo, usuarios, HU1–HU5,
RF1–RF11, reglas de negocio con ejemplo, CA1–CA7, CL1–CL3, fuera de alcance) más las decisiones
tomadas en la sesión de preguntas del 2026-11-09 (idioma, IVA por línea, redondeo, clientes,
numeración, estados, primer uso, almacenamiento, IRPF por defecto y líneas de catálogo).

## Contexto y objetivo

PresupuestosPro permite a un freelancer español crear presupuestos profesionales con su marca y
descargarlos en PDF para enviarlos a sus clientes, sin hojas de cálculo ni calculadora.

Hoy el freelancer copia un presupuesto viejo en una hoja de cálculo, cambia los conceptos a mano y
calcula el IVA con el móvil. Tarda demasiado, se equivoca y el resultado se ve poco profesional.

**Éxito de negocio**: emitir un presupuesto correcto y con buena imagen en menos de 5 minutos.

**Usuarios**:

- **Freelancer** (usa la app): autónomo en España, trabaja solo, no es técnico, hace varios
  presupuestos al mes.
- **Cliente** (no usa la app): recibe el PDF por email. Puede ser **empresa/autónomo** o
  **particular**; el tipo decide si se aplica la retención de IRPF.

## Clarifications

### Session 2026-11-09

- Q: Al volver a descargar un emitido tras cambiar el perfil, ¿datos de la emisión o actuales? → A: Datos de la emisión; al emitir se congelan los datos del freelancer y el logo.
- Q: ¿Qué fecha de emisión lleva el presupuesto? → A: Editable mientras es borrador; al crearlo se propone la fecha de ese día y al emitirse queda fija.
- Q: ¿Qué muestra la lista de presupuestos y cómo se encuentra uno antiguo? → A: Lista simple, del más reciente al más antiguo por número, con número, cliente, fecha de emisión, total y estado; sin búsqueda ni filtros.
- Q: ¿En qué dispositivos tiene que funcionar bien la v0? → A: Escritorio y móvil: todos los flujos, incluida la descarga del PDF, deben poder hacerse también desde un teléfono (revisado el 2026-11-09; antes «solo escritorio»).

### Session 2026-11-11 (tras /speckit-analyze)

- Q: ¿La confirmación antes de emitir, el aviso de almacenamiento lleno y la recuperación de datos dañados son parte de la v0? → A: Sí; se añaden como FR-027, FR-028 y FR-029.
- Q: ¿El formato DD/MM/AAAA aplica también al campo de fecha? → A: Sí, con máscara de entrada independiente del idioma del navegador (FR-020).
- Q: ¿El tipo de cliente empieza preseleccionado? → A: No; empieza sin marcar y es obligatorio elegirlo antes de descargar el PDF (FR-006, FR-010).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un presupuesto con los impuestos bien calculados (Priority: P1)

El freelancer crea un presupuesto, escribe los datos del cliente e indica si es empresa/autónomo o
particular. Añade líneas con descripción, cantidad, precio unitario y tipo de IVA. La app calcula
sola la base imponible, el IVA desglosado por tipo, la retención de IRPF (cuando toca) y el total.

**Why this priority**: es el corazón del producto. Sin cálculos correctos no hay presupuesto que
enviar y se pierde la confianza del freelancer.

**Independent Test**: crear el presupuesto del ejemplo de referencia (sección «Reglas de negocio»)
y comprobar en pantalla que todos los importes coinciden al céntimo.

**Acceptance Scenarios**:

1. **Given** un presupuesto nuevo a un cliente empresa/autónomo con las líneas «Diseño de página
   web» (1 × 1.500,00 €, IVA 21 %) y «Sesión de fotos de producto» (1 × 500,00 €, IVA 21 %) y
   retención del 15 %, **When** el freelancer mira el resumen, **Then** ve base imponible
   2.000,00 €, IVA (21 %) 420,00 €, retención de IRPF −300,00 € y total 2.120,00 €.
2. **Given** ese mismo presupuesto, **When** cambia la retención al 7 %, **Then** el total pasa a
   2.280,00 € sin pulsar ningún botón de recalcular.
3. **Given** ese mismo presupuesto, **When** desactiva la retención, **Then** el total pasa a
   2.420,00 €.
4. **Given** ese mismo presupuesto con retención activada, **When** cambia el tipo de cliente a
   «particular», **Then** la retención desaparece del resumen y el total pasa a 2.420,00 €.
5. **Given** un presupuesto con «Diseño de página web» (1.500,00 €, IVA 21 %) y «Sesión de
   fotos de producto» (500,00 €, IVA 10 %) a un cliente empresa/autónomo con retención del 15 %,
   **When** mira el resumen, **Then** ve base 2.000,00 €, IVA 21 % 315,00 €, IVA 10 % 50,00 €,
   retención −300,00 € y total 2.065,00 €.
6. **Given** un borrador con varias líneas, **When** edita o borra una línea, **Then** la base,
   el IVA, la retención y el total se actualizan al momento.
7. **Given** una línea con cantidad 3 y precio unitario 0,785 €, **When** mira el importe de la
   línea, **Then** ve 2,36 € (2,355 redondeado al céntimo con medio céntimo hacia arriba).

---

### User Story 2 - Descargar el presupuesto en PDF con su marca (Priority: P1)

El freelancer descarga el presupuesto en PDF con su logo (si lo tiene), sus datos, los del cliente,
el número, la fecha de emisión, la validez, la tabla de líneas y el desglose de importes. Al
descargarlo por primera vez, el presupuesto queda emitido y ya no se puede modificar.

**Why this priority**: el PDF es lo que recibe el cliente; sin él, el presupuesto no sirve.

**Independent Test**: con un perfil con nombre y NIF y un presupuesto con líneas, descargar el PDF
y comprobar a simple vista que contiene todos los elementos listados.

**Acceptance Scenarios**:

1. **Given** un perfil con nombre, NIF y logo y un borrador con líneas, **When** descarga el PDF,
   **Then** el PDF muestra logo, datos del freelancer y del cliente, número, fecha de emisión,
   fecha de validez (emisión + 30 días), tabla de líneas, base, IVA por tipo, retención (si la
   hay) y total.
2. **Given** un perfil sin logo, **When** descarga el PDF, **Then** la cabecera muestra el nombre
   del freelancer en lugar del logo.
3. **Given** un perfil sin NIF o sin nombre, **When** intenta descargar el PDF, **Then** la app no
   lo genera y le indica qué dato del perfil falta.
4. **Given** un borrador sin líneas, **When** intenta descargar el PDF, **Then** la app no lo genera
   y le avisa de que el presupuesto no tiene líneas.
5. **Given** un borrador, **When** descarga el PDF por primera vez, **Then** el presupuesto pasa a
   «emitido» y ya no se pueden editar ni borrar sus datos ni sus líneas.
6. **Given** un presupuesto emitido, **When** vuelve a descargar el PDF, **Then** obtiene el mismo
   contenido, con el mismo número y la misma fecha de emisión.
7. **Given** un borrador creado el 09/11/2026, **When** cambia la fecha de emisión al 12/11/2026,
   **Then** la validez pasa a 12/12/2026 y el PDF muestra ambas fechas.

---

### User Story 3 - Configurar el perfil del freelancer (Priority: P2)

El freelancer guarda una vez su nombre, NIF, datos de contacto, logo y su retención de IRPF
habitual, para que todos sus presupuestos salgan con su marca sin repetirlo.

**Why this priority**: es necesario para el PDF, pero el cálculo (US1) se puede probar sin él.

**Independent Test**: rellenar el perfil, cerrar la app, abrirla de nuevo y comprobar que los datos
siguen ahí y que un presupuesto nuevo los usa.

**Acceptance Scenarios**:

1. **Given** que es la primera vez que abre la app, **When** entra, **Then** ve la pantalla del
   perfil y un aviso de que los datos se guardan solo en este navegador de este dispositivo.
2. **Given** un perfil con retención habitual del 15 %, **When** crea un presupuesto nuevo a un
   cliente empresa/autónomo, **Then** la retención aparece activada al 15 % y se puede cambiar.
3. **Given** un perfil sin retención habitual, **When** crea un presupuesto nuevo a un cliente
   empresa/autónomo, **Then** la retención aparece desactivada.
4. **Given** un perfil guardado, un borrador y un presupuesto emitido, **When** cambia el logo,
   **Then** el PDF del borrador usa el logo nuevo y el PDF del emitido sigue saliendo con el logo
   que tenía al emitirse.

---

### User Story 4 - Mantener un catálogo de servicios (Priority: P2)

El freelancer guarda sus servicios habituales con un precio por defecto y los añade a los
presupuestos sin reescribirlos.

**Why this priority**: ahorra tiempo en cada presupuesto (objetivo de 5 minutos), pero se puede
presupuestar sin catálogo usando líneas manuales.

**Independent Test**: crear un servicio, añadirlo a un presupuesto, cambiar su precio en la línea y
comprobar que el catálogo no cambia.

**Acceptance Scenarios**:

1. **Given** el catálogo, **When** crea, edita o borra un servicio con nombre y precio por defecto,
   **Then** el catálogo refleja el cambio.
2. **Given** un servicio «Sesión de fotos» a 500,00 €, **When** lo añade a un presupuesto,
   **Then** se crea una línea con esa descripción, cantidad 1, precio 500,00 € e IVA 21 %, y puede
   cambiar descripción, cantidad, precio e IVA en esa línea.
3. **Given** un presupuesto con una línea que viene del catálogo, **When** cambia el precio de ese
   servicio en el catálogo o lo borra, **Then** la línea del presupuesto no cambia.
4. **Given** un presupuesto, **When** añade una línea escrita a mano que no está en el catálogo,
   **Then** la línea se acepta igual que una del catálogo.

---

### User Story 5 - Numerar, guardar, duplicar y gestionar presupuestos (Priority: P3)

Los presupuestos se numeran solos, se guardan entre sesiones y se pueden duplicar para corregir uno
ya emitido o reutilizarlo.

**Why this priority**: da orden y continuidad, pero un único presupuesto ya aporta valor sin ello.

**Independent Test**: crear dos presupuestos, cerrar y reabrir la app, comprobar números y datos;
duplicar uno emitido y comprobar que el nuevo es un borrador con número nuevo.

**Acceptance Scenarios**:

1. **Given** que el último presupuesto creado en 2026 es el 2026-001, **When** crea otro,
   **Then** recibe automáticamente el número 2026-002, que no se puede editar.
2. **Given** que el último presupuesto de 2026 es el 2026-014, **When** crea el primero de 2027,
   **Then** recibe el número 2027-001.
3. **Given** el borrador 2026-003, **When** lo borra y crea uno nuevo, **Then** el nuevo recibe el
   2026-004 (el 2026-003 no se reutiliza).
4. **Given** un presupuesto emitido, **When** intenta borrarlo, **Then** la app no lo permite.
5. **Given** un presupuesto emitido, **When** lo duplica, **Then** se crea un borrador con el mismo
   cliente, las mismas líneas y la misma retención, con número nuevo, y el original no cambia.
6. **Given** los presupuestos 2026-001 (emitido) y 2026-002 (borrador), **When** abre la lista,
   **Then** ve primero el 2026-002 y después el 2026-001, cada uno con cliente, fecha de emisión,
   total y estado.
7. **Given** un perfil, un catálogo y varios presupuestos, **When** cierra la app y la vuelve a
   abrir en el mismo navegador, **Then** todo sigue ahí.

---

### Edge Cases

- Presupuesto sin ninguna línea: no se genera el PDF; se avisa al freelancer (CL1).
- Línea escrita a mano fuera del catálogo: permitida (CL2).
- Cliente particular con la retención activada: la retención no se aplica; manda el tipo de
  cliente (CL3). Si vuelve a marcarlo como empresa/autónomo, la retención vuelve a aplicarse con el
  último valor elegido.
- Línea con cantidad 0 o negativa, o precio negativo: no se acepta; se indica el error en la línea.
- Línea con precio 0,00 €: se acepta (por ejemplo, un concepto de cortesía).
- Tipo de cliente sin marcar al intentar descargar el PDF: no se genera; se pide elegir
  empresa/autónomo o particular.
- Fecha de emisión inexistente o incompleta (por ejemplo, 31/02/2026): error «Fecha no válida»; se
  conserva la última fecha válida.
- Importes con más de dos decimales: se redondean al céntimo con medio céntimo hacia arriba según
  las reglas de negocio.
- Borrador creado en un año y emitido en el siguiente, o con una fecha de emisión de otro año:
  conserva el número asignado al crearlo (el año del número es siempre el de creación).
- Logo con un formato o tamaño no admitido: no se guarda y se explica el motivo.
- En iPhone, Safari puede borrar los datos de la web si no se usa durante unos 7 días; el aviso de
  FR-022 lo menciona expresamente.
- Datos del navegador borrados o cambio de dispositivo: los datos se pierden; la app lo avisa en el
  primer uso y en el perfil.

## Reglas de negocio

- **Tipos de IVA**: 21 %, 10 %, 4 % y 0 %, elegibles en cada línea. Cada línea nueva empieza con
  21 %.
- **Importe de línea** = cantidad × precio unitario, redondeado a 2 decimales (medio céntimo hacia
  arriba).
- **Base imponible** = suma de los importes de todas las líneas.
- **IVA de cada tipo** = suma de los importes de las líneas con ese tipo × tipo, redondeado a 2
  decimales. Solo se muestran los tipos usados en el presupuesto.
- **Retención de IRPF** = base imponible × 15 % o × 7 %, redondeado a 2 decimales. Es opcional y
  **solo se aplica a clientes empresa/autónomo, nunca a particulares**.
- **Total** = base imponible + suma de IVA − retención de IRPF.
- **Numeración**: AAAA-NNN (2026-001, 2026-002…), asignada al crear el presupuesto según el año de
  creación, no editable, sin reutilizar números; el contador reinicia cada año.
- **Fecha de emisión**: se propone la del día de creación, editable en borrador, fija al emitir.
- **Validez**: 30 días desde la fecha de emisión.

**Ejemplo de referencia (debe cuadrar al céntimo):**

| Concepto | IVA | Importe |
|---|---|---|
| Diseño de página web | 21 % | 1.500,00 € |
| Sesión de fotos de producto | 21 % | 500,00 € |
| **Base imponible** | | **2.000,00 €** |
| IVA (21 %) | | 420,00 € |
| Retención de IRPF (−15 %) | | −300,00 € |
| **Total a pagar** | | **2.120,00 €** |

- Mismo presupuesto con retención del 7 %: total **2.280,00 €**.
- Mismo presupuesto a un cliente particular (sin retención): total **2.420,00 €**.
- Con «Sesión de fotos» al 10 % en lugar del 21 %: IVA 21 % 315,00 €, IVA 10 % 50,00 €, total con
  retención del 15 % **2.065,00 €**.

## Requirements *(mandatory)*

### Functional Requirements

**Perfil**

- **FR-001**: El sistema MUST permitir guardar y editar el perfil del freelancer: nombre, NIF,
  datos de contacto (email, teléfono, dirección), logo y retención de IRPF habitual (ninguna,
  15 % o 7 %).
- **FR-002**: La primera vez que se abre la app, el sistema MUST mostrar la pantalla del perfil.
- **FR-003**: El sistema MUST impedir descargar un PDF mientras el perfil no tenga nombre y NIF, e
  indicar qué falta. El logo es opcional.

**Catálogo**

- **FR-004**: El sistema MUST permitir crear, editar y borrar servicios del catálogo, cada uno con
  nombre y precio por defecto.
- **FR-005**: Cambiar o borrar un servicio del catálogo MUST NOT modificar las líneas de
  presupuestos ya creados.

**Presupuestos y líneas**

- **FR-006**: El sistema MUST permitir crear un presupuesto escribiendo los datos del cliente:
  nombre (obligatorio), NIF/CIF, dirección y tipo (empresa/autónomo o particular, obligatorio). El
  tipo empieza **sin marcar** en cada presupuesto nuevo y hay que elegirlo antes de descargar el
  PDF. No hay agenda de clientes.
- **FR-007**: Cada línea MUST poder venir del catálogo o escribirse a mano, con descripción,
  cantidad (admite decimales, mayor que 0), precio unitario (0 o mayor) y tipo de IVA (21, 10, 4
  o 0 %; 21 % por defecto).
- **FR-008**: En una línea que viene del catálogo, el precio del catálogo MUST ser solo el valor
  inicial; descripción, cantidad, precio e IVA MUST poder cambiarse en la línea.
- **FR-009**: El sistema MUST calcular automáticamente, y actualizar al momento ante cualquier
  cambio, el importe de cada línea, la base imponible, el IVA por tipo, la retención de IRPF y el
  total, según las reglas de negocio.
- **FR-010**: En un presupuesto nuevo, la retención MUST partir del valor del perfil y poder
  activarse, desactivarse o cambiarse entre 15 % y 7 %. Solo se aplica cuando el tipo de cliente es
  empresa/autónomo; mientras el tipo está sin marcar, el resumen no muestra retención.
- **FR-011**: Si el cliente es «particular», la retención MUST NOT aplicarse en ningún caso.
- **FR-012**: El sistema MUST numerar cada presupuesto al crearlo con el formato AAAA-NNN según el
  año de creación, reiniciando el contador cada año, sin permitir editar el número y sin reutilizar
  números de presupuestos borrados.

**Estados, PDF y duplicado**

- **FR-013**: Un presupuesto MUST estar en estado «borrador» hasta la primera descarga del PDF y en
  estado «emitido» a partir de ella. El estado MUST verse en la lista y en el presupuesto.
- **FR-013b**: El sistema MUST mostrar una lista de todos los presupuestos, del más reciente al más
  antiguo por número, con número, cliente, fecha de emisión, total y estado. No hay búsqueda ni
  filtros en v0.
- **FR-014**: En un borrador, el freelancer MUST poder editar los datos del cliente, la retención y
  cualquier línea, y borrar el presupuesto.
- **FR-015**: Un presupuesto emitido MUST NOT poder editarse ni borrarse; MUST poder volver a
  descargarse con el mismo contenido.
- **FR-015b**: Al emitirse, el presupuesto MUST guardar una copia de los datos del freelancer y del
  logo de ese momento; las descargas posteriores MUST usar esa copia aunque el perfil cambie.
- **FR-016**: El sistema MUST permitir duplicar cualquier presupuesto; el duplicado es un borrador
  nuevo con el mismo cliente, las mismas líneas y la misma retención, y un número nuevo.
- **FR-017**: El sistema MUST NOT generar el PDF de un presupuesto sin líneas y MUST avisar de ello.
- **FR-018**: El PDF MUST contener: logo (o, si no hay, el nombre del freelancer en la cabecera),
  datos del freelancer y del cliente, número, fecha de emisión, fecha de validez (emisión + 30
  días), tabla de líneas (descripción, cantidad, precio unitario, IVA, importe) y desglose de base
  imponible, IVA por tipo, retención (si la hay) y total.
- **FR-019**: Al crear un presupuesto, el sistema MUST proponer como fecha de emisión la fecha de
  ese día. En borrador, el freelancer MUST poder cambiarla; la fecha de validez se recalcula sola
  (emisión + 30 días). Al emitirse, la fecha de emisión queda fija y no cambia en descargas
  posteriores.

**Idioma, moneda y datos**

- **FR-020**: La interfaz y el PDF MUST estar en español, con importes en euros en formato español
  (1.500,00 €) y fechas en formato DD/MM/AAAA. Esto incluye el campo de fecha de emisión: se escribe
  como DD/MM/AAAA con las barras insertadas solas, sea cual sea el idioma del navegador, y una fecha
  inexistente (por ejemplo, 31/02/2026) muestra el error «Fecha no válida» y no se guarda.
- **FR-021**: Perfil, catálogo y presupuestos MUST conservarse al cerrar y volver a abrir la app en
  el mismo navegador del mismo dispositivo.
- **FR-022**: La app MUST avisar claramente, en el primer uso y en el perfil, de que los datos se
  guardan solo en este navegador, no se sincronizan y se pierden si se borran los datos del
  navegador o se cambia de dispositivo. En iPhone, el aviso MUST añadir que Safari puede borrarlos
  si la app no se usa durante unos días.
- **FR-023**: La app MUST pedir solo los datos listados en esta spec y MUST NOT enviar datos del
  freelancer ni de sus clientes fuera del dispositivo.

**Salvaguardas**

- **FR-027**: Antes de la primera descarga del PDF de un borrador, el sistema MUST pedir
  confirmación con el mensaje «Al descargar, el presupuesto quedará emitido y ya no podrás
  modificarlo. ¿Continuar?». Si el freelancer cancela, el presupuesto sigue en borrador y no se
  descarga nada. Las descargas de un emitido no piden confirmación.
- **FR-028**: Si el navegador no tiene espacio para guardar un cambio, el sistema MUST mostrar «No
  queda espacio en este navegador», no aplicar ese cambio y conservar intactos los datos ya
  guardados.
- **FR-029**: Si los datos guardados no se pueden leer (están dañados), el sistema MUST mostrar «No
  se han podido leer tus datos guardados» y MUST NOT sobrescribirlos por su cuenta. Ofrece el botón
  «Empezar de cero», que pide confirmación («Se borrarán todos tus datos. ¿Continuar?») antes de
  borrarlos y empezar con la app vacía.

**Dispositivos**

- **FR-024**: Todas las pantallas y acciones (perfil, catálogo, lista, edición de presupuestos y
  descarga del PDF) MUST poder usarse en un teléfono móvil con pantalla de 360 px de ancho o más,
  en vertical, sin desplazamiento horizontal de la página ni ampliación con los dedos.
- **FR-025**: En el móvil, la descarga MUST dejar el PDF guardado en el teléfono o abierto en el
  visor del sistema, desde donde se pueda compartir o enviar por email.
- **FR-026**: El PDF MUST ser el mismo (mismo contenido y diseño A4) se genere desde el escritorio
  o desde el móvil.

### Key Entities

- **Perfil del freelancer**: nombre, NIF, email, teléfono, dirección, logo, retención habitual
  (ninguna, 15 %, 7 %). Uno solo por instalación.
- **Servicio**: nombre y precio por defecto. Forma el catálogo.
- **Presupuesto**: número (AAAA-NNN), estado (borrador/emitido), fecha de creación, fecha de
  emisión, fecha de validez, datos del cliente (nombre, NIF/CIF, dirección, tipo), retención
  (desactivada, 15 %, 7 %) y sus líneas. Los importes calculados derivan de las líneas. Si está
  emitido, guarda además la copia de los datos del freelancer y del logo del momento de emisión.
- **Línea de presupuesto**: descripción, cantidad, precio unitario, tipo de IVA e importe. Copia
  los datos del servicio al añadirse; no queda enlazada a él.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer con el perfil y el catálogo ya configurados crea y descarga un
  presupuesto de 3 líneas en menos de 5 minutos.
- **SC-002**: Los ejemplos de la sección «Reglas de negocio» muestran exactamente 2.120,00 €,
  2.280,00 €, 2.420,00 € y 2.065,00 € en pantalla y en el PDF (0 céntimos de diferencia).
- **SC-003**: Cada escenario de aceptación de esta spec puede comprobarlo una persona no técnica
  usando solo la app y el PDF descargado, sin leer código.
- **SC-004**: Al cerrar y reabrir la app en el mismo navegador, el 100 % del perfil, el catálogo y
  los presupuestos siguen disponibles.
- **SC-005**: Un freelancer que usa la app por primera vez descarga su primer PDF sin ayuda
  externa en menos de 10 minutos, perfil incluido.
- **SC-006**: Desde un teléfono, un freelancer con el perfil y el catálogo configurados crea y
  descarga un presupuesto de 3 líneas en menos de 5 minutos, sin ampliar la pantalla con los dedos.

## Fuera de alcance (v0)

- No es una factura: sin facturación electrónica ni VeriFactu.
- Sin cuentas de usuario ni contraseña.
- Sin nube ni sincronización: los datos viven en el navegador de este dispositivo.
- Sin copia de seguridad, exportación ni importación de datos.
- Solo euros (sin multidivisa).
- Solo español (interfaz y PDF).
- Sin envío del PDF por email desde la app.
- Sin descuentos por línea ni globales.
- Sin agenda de clientes.
- Sin búsqueda ni filtros en la lista de presupuestos.
- Sin app nativa para iOS o Android ni instalación desde tiendas: el móvil se usa con su
  navegador.
- Los datos del móvil y los del ordenador son independientes: no se comparten entre dispositivos.
- Sin recargo de equivalencia ni otros tipos de retención distintos de 15 % y 7 %.

## Assumptions

- Un único freelancer por navegador; no hay varios perfiles.
- El NIF del freelancer y el NIF/CIF del cliente no se validan contra el formato oficial en v0;
  solo se exige que el NIF del freelancer no esté vacío.
- El NIF/CIF y la dirección del cliente son opcionales (un particular puede no darlos).
- El logo admite imágenes PNG o JPG de hasta 1 MB.
- El duplicado copia la retención elegida en el original, no la del perfil, y propone como fecha de
  emisión la del día del duplicado.
- La fecha de emisión admite cualquier fecha válida (pasada o futura); no se bloquea un PDF con la
  validez ya vencida.
- Navegadores soportados, en sus últimas versiones: en escritorio, Chrome, Firefox, Edge y
  Safari; en móvil, Safari en iPhone y Chrome en Android. Los criterios de aceptación se comprueban
  en ambos tipos de dispositivo.
- Las tabletas se tratan como móvil o escritorio según su ancho de pantalla; no tienen diseño
  propio.

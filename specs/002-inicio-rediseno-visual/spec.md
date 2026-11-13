# Feature Specification: Página de inicio, navegación común y rediseño visual de PresupuestosPro

**Feature Branch**: `002-inicio-rediseno-visual` (el proyecto no es un repositorio git; no se ha creado rama)

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada
en la spec 001) con dos cambios, sin alterar ninguna funcionalidad ni dato existente. Primero: añadir
una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del
servidor, con navegación clara hacia las tres secciones existentes (Presupuestos, Catálogo y Perfil)
y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las
páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón
atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y
sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado
uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales
distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño
debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita
la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos
en español de España. La lógica de negocio, los cálculos, la API y el esquema de datos no deben
cambiar en absoluto."

## Contexto y objetivo

PresupuestosPro v0 (spec 001) ya funciona: perfil, catálogo, presupuestos y PDF. Hoy, al abrir la
app, el freelancer cae directamente en la lista de presupuestos, no tiene una vista de conjunto de
su actividad y la apariencia es funcional pero poco cuidada. El PDF que recibe el cliente es la
cara visible del freelancer y debe transmitir seriedad.

**Objetivo**: que la app tenga una puerta de entrada clara con un resumen de actividad, que moverse
entre secciones sea inmediato desde cualquier pantalla y que la app y el PDF tengan una imagen
profesional y coherente, **sin cambiar qué hace la app ni los datos que guarda**.

**Usuarios**: los mismos que en la spec 001 (freelancer que usa la app; cliente que recibe el PDF).

## Clarifications

### Session 2026-11-11

- Q: La petición nombra cinco estados (Borrador, Enviado, Aceptado, Rechazado, Caducado), pero la
  spec 001 y los datos solo tienen Borrador y Emitido. ¿Qué estados se muestran? → A: Solo Borrador
  y Emitido; la paleta deja reservados colores para los otros cuatro, sin usarlos (FR-104). Añadir
  esos estados es funcionalidad nueva y, si se quiere, irá en una spec propia.
- Q: ¿El PDF debe usar exactamente la misma tipografía que la app o basta con un estilo parecido?
  → A: Mismo estilo (sin remates) y misma escala de tamaños, con la fuente estándar del PDF; no se
  incrusta ninguna fuente (FR-119).
- Q: En el móvil, ¿dónde va la navegación común? → A: Menú plegado tras un botón (☰) en el móvil y
  barra arriba con los 4 destinos en el escritorio (FR-107, FR-109, SC-101).
- Q: En la página de inicio, ¿el botón «Nuevo presupuesto» aparece siempre o solo cuando no hay
  presupuestos? → A: Siempre visible, como acción principal; crea el presupuesto igual que el botón
  de la lista (FR-105, US1).

### Session 2026-11-11 (revisión de checklists/ui.md)

- Q: ¿Cómo más se cierra el menú ☰ y cómo se usa con teclado? → A: También con Escape (el foco
  vuelve al botón) y tocando fuera del panel; botón y enlaces accesibles con tabulador y foco
  visible (FR-109).
- Q: ¿Qué se exige con el móvil en horizontal? → A: Solo que no haya desplazamiento horizontal ni
  contenido tapado; sin diseño propio (FR-118).
- Q: ¿Qué debe aguantar la app con el texto ampliado? → A: Hasta el 200 %, legible y usable
  (FR-118).
- Q: ¿Basta la fuente sin remates del sistema para «una misma familia tipográfica»? → A: Sí; es
  coherente en cada dispositivo y no se añaden fuentes (FR-112).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver de un vistazo la actividad al abrir la app (Priority: P1)

El freelancer abre la app y llega a una página de inicio. Ve accesos claros a Presupuestos,
Catálogo y Mi perfil, un botón «Nuevo presupuesto» y un pequeño resumen con cuántos presupuestos
tiene en cada estado. Desde ahí entra en la sección que necesita, o empieza un presupuesto, con un
solo toque.

**Why this priority**: es el punto de entrada de toda la app; da orientación inmediata y es lo
primero que ve el freelancer cada vez que la abre.

**Independent Test**: con un perfil configurado y varios presupuestos en distintos estados, abrir la
app desde su dirección principal y comprobar que aparece la página de inicio con los recuentos
correctos y que cada acceso lleva a su sección.

**Acceptance Scenarios**:

1. **Given** un perfil ya configurado, **When** el freelancer abre la app desde su dirección
   principal, **Then** ve la página de inicio, no la lista de presupuestos.
2. **Given** 2 presupuestos en borrador y 3 emitidos, **When** abre la página de inicio, **Then** el
   resumen muestra 2 en Borrador, 3 en Emitido y un total de 5.
3. **Given** la página de inicio, **When** toca el acceso a Presupuestos, Catálogo o Mi perfil,
   **Then** llega a esa sección.
4. **Given** ningún presupuesto creado, **When** abre la página de inicio, **Then** el resumen muestra
   0 en cada estado y un texto que invita a crear el primer presupuesto, sin errores.
5. **Given** que es la primera vez que abre la app (perfil sin configurar), **When** entra por la
   dirección principal, **Then** sigue viendo primero la pantalla del perfil, como exige la spec 001
   (FR-002).
6. **Given** que el freelancer emite o borra un presupuesto, **When** vuelve a la página de inicio,
   **Then** los recuentos reflejan el cambio sin recargar la app.
7. **Given** la página de inicio, con o sin presupuestos, **When** toca «Nuevo presupuesto»,
   **Then** se crea un borrador con el número siguiente y se abre su edición, igual que desde la
   lista.

---

### User Story 2 - Moverse entre secciones desde cualquier pantalla (Priority: P1)

En cualquier pantalla (inicio, lista, edición de un presupuesto, catálogo, perfil) el freelancer ve
la misma barra de navegación, con la sección actual marcada, y puede ir a otra sección o volver al
inicio sin usar el botón atrás del navegador.

**Why this priority**: sin navegación común la página de inicio sería un callejón; es lo que hace
usable la nueva estructura, sobre todo en el móvil.

**Independent Test**: recorrer todas las pantallas en escritorio y en un móvil de 360 px y comprobar
que en todas aparece la misma navegación, que marca la sección actual y que lleva a cada destino.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la app en el escritorio, **When** el freelancer mira la parte
   superior, **Then** ve la navegación común con Inicio, Presupuestos, Catálogo y Mi perfil.
2. **Given** que está editando un presupuesto, **When** mira la navegación, **Then** aparece marcada
   la sección Presupuestos.
3. **Given** un teléfono de 360 px en vertical, **When** toca el botón de menú (☰) de la parte
   superior, **Then** se despliegan los 4 destinos con la sección actual marcada; al elegir uno
   llega a esa sección y el menú se cierra, sin desplazamiento horizontal.
4. **Given** el primer uso (perfil sin configurar), **When** intenta ir a otra sección desde la
   navegación, **Then** la app sigue llevándolo al perfil, igual que hoy.
5. **Given** datos guardados dañados, **When** se muestra el aviso de recuperación (FR-029 de la spec
   001), **Then** la navegación no permite saltarse ese aviso, igual que hoy.

---

### User Story 3 - Una app con imagen profesional y coherente (Priority: P2)

El freelancer usa una app con aspecto sobrio y ordenado: la misma tipografía en todas las pantallas,
pocos colores y siempre los mismos, separaciones uniformes, títulos claramente distinguibles de
tablas y formularios, totales que destacan y estados de presupuesto que se reconocen a simple vista.

**Why this priority**: mejora la confianza y la rapidez de lectura, pero la app ya es usable sin
ello.

**Independent Test**: recorrer todas las pantallas y comprobar con la lista de comprobación visual de
los criterios de éxito (tipografía, colores, espaciado, jerarquía y estados) que se cumplen en todas.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla, **When** se compara con las demás, **Then** usan la misma familia
   tipográfica, los mismos tamaños para elementos del mismo nivel y los mismos colores.
2. **Given** la edición de un presupuesto, **When** el freelancer mira la pantalla, **Then** distingue
   sin esfuerzo el título, los datos del cliente, la tabla de líneas y el bloque de totales, y el
   total final es el importe más destacado.
3. **Given** la lista con presupuestos en Borrador y en Emitido, **When** se mira la columna de
   estado, **Then** cada estado tiene una etiqueta con texto y un color distinto, y se distinguen
   también sin depender solo del color.
4. **Given** un teléfono de 360 px, **When** recorre todas las pantallas, **Then** el diseño nuevo no
   provoca desplazamiento horizontal ni texto ilegible.
5. **Given** el mismo presupuesto antes y después del rediseño, **When** se comparan los importes,
   **Then** son idénticos al céntimo.

---

### User Story 4 - Un PDF con la misma imagen profesional (Priority: P2)

El cliente recibe un PDF ordenado, con la marca del freelancer, una jerarquía clara (cabecera,
datos de las partes, tabla de conceptos, totales, condiciones) y la misma línea visual que la app.

**Why this priority**: el PDF es lo que ve el cliente; su imagen repercute directamente en el
negocio del freelancer.

**Independent Test**: descargar el PDF del ejemplo de referencia de la spec 001 y comprobar que
conserva todo su contenido e importes, y que cumple la lista de comprobación visual del PDF.

**Acceptance Scenarios**:

1. **Given** el presupuesto del ejemplo de referencia de la spec 001, **When** se descarga el PDF,
   **Then** contiene exactamente los mismos datos e importes que antes del rediseño.
2. **Given** el PDF nuevo, **When** se mira, **Then** usa la misma paleta de colores que la app y una
   tipografía sin remates con la misma escala de tamaños, y el total final es el importe más destacado.
3. **Given** un presupuesto con muchas líneas que ocupa más de una página, **When** se descarga el
   PDF, **Then** la tabla continúa con cabecera repetida y los totales no quedan separados de forma
   ilegible.
4. **Given** un presupuesto emitido antes del rediseño, **When** se vuelve a descargar, **Then** sale
   con el diseño nuevo pero con los mismos datos congelados de la emisión (spec 001).
5. **Given** un perfil sin logo, **When** se descarga el PDF, **Then** la cabecera queda equilibrada
   sin un hueco vacío.

---

### Edge Cases

- Muchos presupuestos (cientos): los recuentos del inicio siguen siendo correctos y la página carga
  sin espera apreciable.
- Nombres de cliente, descripciones o importes muy largos: no rompen tablas, etiquetas de estado ni
  el resumen en el móvil; el texto se ajusta en varias líneas.
- Logo muy ancho, muy alto o con fondo de color: el PDF y la app lo escalan sin deformarlo ni tapar
  otros datos.
- Usuario que entra con una dirección guardada de una sección concreta (por ejemplo, la lista de
  presupuestos): llega a esa sección, no al inicio.
- Dirección desconocida: lleva al inicio en lugar de a la lista de presupuestos.
- Almacenamiento lleno o datos dañados: los avisos de la spec 001 (FR-028, FR-029) siguen
  apareciendo y son legibles con el diseño nuevo.
- Impresión en blanco y negro del PDF: la información (incluidos los totales) sigue siendo legible.

## Requirements *(mandatory)*

### Functional Requirements

**Página de inicio**

- **FR-101**: Al abrir la app desde su dirección principal, el sistema MUST mostrar la página de
  inicio, salvo en el primer uso (perfil sin configurar), en el que MUST seguir mostrando el perfil
  (FR-002 de la spec 001).
- **FR-102**: La página de inicio MUST ofrecer un acceso claro a cada una de las tres secciones
  existentes: Presupuestos, Catálogo y Mi perfil.
- **FR-103**: La página de inicio MUST mostrar un resumen de actividad con el número de presupuestos
  en cada estado y el total de presupuestos. Los recuentos MUST calcularse a partir de los
  presupuestos ya guardados, sin guardar datos nuevos.
- **FR-104**: Los estados que muestran el resumen, la lista y la edición MUST ser solo los que ya
  existen en la spec 001: Borrador y Emitido. La paleta MUST reservar además un color para
  Enviado, Aceptado, Rechazado y Caducado, para que una spec futura pueda añadirlos sin
  rediseñar; en esta spec esos colores no se usan en ninguna pantalla.
- **FR-105**: La página de inicio MUST mostrar siempre un botón «Nuevo presupuesto», como acción
  principal de la página, que crea un presupuesto igual que el botón equivalente de la lista
  (spec 001). Si no hay presupuestos, el resumen MUST mostrar 0 en cada estado y un texto que invite
  a crear el primero con ese botón.
- **FR-106**: Una dirección que no corresponde a ninguna sección MUST llevar a la página de inicio.

**Navegación común**

- **FR-107**: Todas las pantallas MUST mostrar la misma navegación con los destinos Inicio,
  Presupuestos, Catálogo y Mi perfil, siempre en el mismo orden y en la parte superior, junto al
  nombre de la app («PresupuestosPro»), que también lleva a Inicio. En el escritorio es una barra con los 4 destinos visibles; en el móvil los destinos quedan plegados
  tras un botón de menú (☰) con nombre accesible «Menú».
- **FR-108**: La navegación MUST marcar la sección en la que está el freelancer; la edición de un
  presupuesto cuenta como sección Presupuestos.
- **FR-109**: En un teléfono de 360 px de ancho en vertical, la navegación MUST permitir llegar a
  cualquier destino en dos toques (abrir el menú y elegir), sin desplazamiento horizontal y con
  zonas de toque de 44 × 44 px como mínimo. El menú MUST cerrarse al elegir un destino, al volver
  a tocar el botón, al pulsar Escape o al tocar fuera del panel, y MUST NOT tapar de forma
  permanente el contenido. Con teclado, el botón y los enlaces MUST poder alcanzarse con el
  tabulador y mostrar un foco visible; al cerrar con Escape, el foco MUST volver al botón ☰.
- **FR-110**: La navegación MUST NOT permitir saltarse el perfil en el primer uso ni el aviso de datos
  dañados (FR-002 y FR-029 de la spec 001).

**Rediseño visual de la app**

- **FR-111**: La paleta de colores MUST estar definida en un único lugar y MUST limitarse a un color
  principal, una escala de grises para texto, bordes y fondos, y un color por cada estado de
  presupuesto y por cada tipo de mensaje (error, aviso, confirmación).
- **FR-112**: Todas las pantallas MUST usar una misma familia tipográfica, la sin remates del
  sistema del dispositivo (sin fuentes externas), y una escala fija de tamaños: título de página,
  título de sección, texto normal, texto secundario y totales.
- **FR-113**: Las separaciones entre elementos MUST seguir una escala fija de espaciado aplicada por
  igual en todas las pantallas.
- **FR-114**: Cada pantalla MUST tener un único título de página, y los títulos, tablas, formularios y
  totales MUST distinguirse visualmente entre sí; el total final del presupuesto MUST ser el importe
  más destacado de la pantalla de edición.
- **FR-115**: Cada estado de presupuesto MUST mostrarse con una etiqueta con su nombre en texto y un
  color propio, igual en la lista, en la edición y en el resumen del inicio; el estado MUST
  entenderse aunque no se perciban los colores.
- **FR-116**: Los textos e interfaces MUST mantener un contraste suficiente para leerse con
  comodidad (como mínimo el nivel AA de las pautas de accesibilidad web para texto).
- **FR-117**: Los formularios MUST mostrar de forma uniforme etiquetas, campos, ayudas, campos
  obligatorios y mensajes de error, y los botones MUST distinguir la acción principal de las
  secundarias y de las que borran datos.
- **FR-118**: El diseño MUST seguir siendo mobile-first: todo lo que exige FR-024 de la spec 001 MUST
  seguir cumpliéndose en todas las pantallas, incluida la página de inicio. Con el móvil en
  horizontal, ninguna pantalla MUST presentar desplazamiento horizontal ni contenido tapado (sin
  diseño propio para esa orientación). Con el texto ampliado al 200 % (ajuste del navegador o del
  sistema), todo el contenido y todas las acciones MUST seguir siendo legibles y usables.

**Rediseño del PDF**

- **FR-119**: El PDF MUST usar la misma paleta que la app y una tipografía del mismo estilo (sin
  remates) con la misma escala de tamaños, usando una fuente estándar de PDF sin incrustar fuentes
  adicionales. MUST tener una jerarquía clara: cabecera con la marca del freelancer, datos de las
  partes, tabla de conceptos y bloque de totales con el total final destacado. La validez se
  muestra con la fecha «Válido hasta» que ya incluye el PDF; no se añade ningún bloque de
  condiciones (FR-120).
- **FR-120**: El PDF MUST conservar exactamente el mismo contenido, importes, formato de números y
  fechas, tamaño A4 y comportamiento (también en móvil) que define la spec 001 (FR-020, FR-025,
  FR-026).
- **FR-121**: El PDF MUST seguir siendo legible impreso en blanco y negro.
- **FR-122**: Un presupuesto emitido MUST salir con el diseño nuevo pero con los datos congelados de su
  emisión (spec 001).

**Lo que no cambia**

- **FR-123**: El rediseño MUST NOT cambiar la lógica de negocio, los cálculos, los datos guardados, su
  estructura ni ninguna funcionalidad de la spec 001; los datos ya guardados MUST seguir funcionando
  sin ninguna acción del freelancer.
- **FR-124**: Todos los textos nuevos (página de inicio, navegación, resumen) MUST estar en español de
  España, coherentes con los de la spec 001.

### Key Entities

No se crean ni modifican entidades. La página de inicio solo lee los presupuestos existentes (spec
001) para contar cuántos hay en cada estado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-101**: Desde la página de inicio, el freelancer llega a cualquiera de las tres secciones con
  un solo toque, y desde cualquier pantalla llega a cualquier otra sección sin usar el botón atrás
  en un máximo de un clic en el escritorio y de dos toques en el móvil.
- **SC-102**: En el 100 % de las pantallas aparece la misma navegación con la sección actual marcada,
  en escritorio y en un teléfono de 360 px.
- **SC-103**: Los recuentos del resumen coinciden en el 100 % de las pruebas con los presupuestos que
  se ven en la lista.
- **SC-104**: Los ejemplos de «Reglas de negocio» de la spec 001 siguen mostrando exactamente los
  mismos importes en pantalla y en el PDF, y todos los escenarios de aceptación de la spec 001 siguen
  cumpliéndose.
- **SC-105**: Una persona no técnica, con la lista de comprobación visual (misma tipografía, mismos
  colores, mismas separaciones, un título por pantalla, total destacado, estados distinguibles),
  confirma que se cumplen en el 100 % de las pantallas y en el PDF.
- **SC-106**: Una persona que no conoce la app identifica correctamente el estado de 5 presupuestos de
  la lista en menos de 10 segundos, también viendo la pantalla en escala de grises.
- **SC-107**: Ninguna pantalla presenta desplazamiento horizontal ni necesita ampliar con los dedos en
  un teléfono de 360 px en vertical.
- **SC-108**: Los datos guardados antes del cambio (perfil, catálogo y presupuestos) aparecen
  completos al abrir la app rediseñada, sin ninguna acción del freelancer.

## Assumptions

- La «raíz del servidor» es la dirección principal de la app; acceder a ella sin indicar sección
  muestra la página de inicio. Las direcciones de secciones concretas siguen funcionando.
- Se añade «Inicio» como cuarto destino de la navegación común para volver a la página de inicio.
- La navegación común ya existe parcialmente; esta spec la unifica y la extiende al inicio, sin
  cambiar los destinos actuales.
- «Mi perfil» es el nombre actual de la sección Perfil y se mantiene.
- El resumen de actividad se limita a recuentos por estado y total; no incluye importes ni gráficos.
- No se añaden fuentes ni recursos que dependan de servicios externos; la app sigue funcionando sin
  enviar datos fuera del navegador (FR-023 de la spec 001).
- No se ofrece modo oscuro ni temas personalizables.
- Los estados Enviado, Aceptado, Rechazado y Caducado quedan fuera de alcance (ver Clarifications);
  solo se reserva su color en la paleta.
- La constitución (simplicidad, cero alcance fantasma, solo español en v0, euro) se aplica sin
  cambios.
- Dependencia: la app de la spec 001 está implementada y sus escenarios de aceptación se usan como
  pruebas de no regresión.

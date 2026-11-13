# Quickstart: validar el inicio, la navegación y el rediseño

Arranque y requisitos: los de [specs/001-presupuestos-pdf/quickstart.md § 1](../001-presupuestos-pdf/quickstart.md).

## 1. No regresión (persona técnica)

```bash
node --test tests/   # Todo en verde, sin haber modificado ninguna prueba (SC-104)
npx serve . -l 3000
```

Hay que comprobar también que no ha cambiado ningún archivo de los intocables del
[plan](plan.md#technical-context).

## 2. Comprobación manual (sin leer código)

Antes de empezar, guarda un PDF del presupuesto del ejemplo de referencia generado con la versión
anterior (para comparar en el paso 12). Usa datos ya existentes de la 001: no borres los datos del
navegador.

| # | Pasos | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abre `http://localhost:3000/` con el perfil ya configurado | Sale la página de inicio, no la lista | FR-101, US1-AS1 |
| 2 | Cuenta en la lista cuántos presupuestos hay en Borrador y cuántos Emitidos; vuelve a Inicio | Las cifras coinciden y Borrador + Emitido = Total | FR-103, SC-103 |
| 3 | En Inicio, toca cada acceso (Presupuestos, Catálogo, Mi perfil) | Cada uno abre su sección | FR-102, US1-AS3 |
| 4 | En Inicio, toca «Nuevo presupuesto» | Se abre un borrador con el número siguiente | FR-105, US1-AS7 |
| 5 | Borra ese borrador y vuelve a Inicio | El recuento de Borrador baja en 1 sin recargar | US1-AS6 |
| 6 | Escribe `#/loquesea` en la dirección | Lleva a Inicio | FR-106 |
| 7 | Recorre las 5 pantallas en el escritorio | En todas se ve la misma barra arriba con la sección actual marcada; en un presupuesto se marca Presupuestos | FR-107, FR-108, SC-102 |
| 8 | En un teléfono (o con la ventana a 360 px) toca ☰, elige Catálogo | El menú muestra los 4 destinos, lleva a Catálogo y se cierra; sin desplazamiento horizontal | FR-109, SC-101, SC-107 |
| 9 | Recorre todas las pantallas a 360 px | Sin desplazamiento horizontal ni texto ilegible | FR-118, SC-107 |
| 10 | Revisa las 5 pantallas con la lista: misma letra, mismos colores, mismas separaciones, un solo título grande, el total como cifra más destacada en el presupuesto | Se cumple en todas | FR-111 a FR-114, FR-117, SC-105 |
| 11 | Pon la pantalla en escala de grises (ajuste de accesibilidad del sistema) y pide a alguien que diga el estado de 5 presupuestos de la lista | Acierta los 5 en menos de 10 s | FR-115, SC-106 |
| 12 | Descarga el PDF del ejemplo de referencia y compáralo con el guardado antes | Mismos textos, datos e importes; diseño nuevo con la misma paleta que la app | FR-119, FR-120, SC-104 |
| 13 | Descarga un presupuesto con más de 25 líneas | La cabecera de la tabla se repite y los totales salen juntos | US4-AS3 |
| 14 | Vuelve a descargar un presupuesto emitido antes del cambio | Sale con el diseño nuevo y los datos de su emisión | FR-122 |
| 15 | Quita el logo del perfil y descarga el PDF de un borrador | El nombre ocupa la cabecera sin hueco | US4-AS5 |
| 16 | Imprime un PDF en blanco y negro | Todo legible y el total se distingue | FR-121 |
| 17 | Borra los datos del sitio y abre `/` | Sale Mi perfil; ☰ y los enlaces no dejan saltárselo | FR-110, US2-AS4 |
| 18 | Repite los pasos de la 001 (quickstart § 2) | Todos siguen cumpliéndose | SC-104, SC-108 |
| 19 | A 360 px, abre ☰ con el teclado (Tab + Intro), pulsa Escape; vuelve a abrirlo y toca fuera del panel | Con Escape se cierra y el foco vuelve a ☰; tocando fuera también se cierra; el foco siempre se ve | FR-109 |
| 20 | Gira el móvil a horizontal y recorre Inicio, la lista y un presupuesto | Sin desplazamiento horizontal ni contenido tapado | FR-118 |
| 21 | Sube el tamaño de texto del navegador al 200 % y recorre las 5 pantallas | Todo legible y todas las acciones usables | FR-118 |

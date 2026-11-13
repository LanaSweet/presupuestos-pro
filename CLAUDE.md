# PresupuestosPro

Web estática para que un freelancer cree presupuestos en euros, con IVA por línea y retención de IRPF, y los descargue en PDF.

## Stack y decisiones vigentes
- HTML5, CSS3 y JavaScript ES2022 con módulos ES nativos. Sin framework, sin backend y sin compilación.
- Una sola dependencia: jsPDF 2.5.1, guardada en `vendor/jspdf.umd.min.js` (sin CDN). `package.json` no declara dependencias.
- Datos en `localStorage`, clave `presupuestospro:v1` (formato en `specs/001-presupuestos-pdf/contracts/storage.md`). Tiene que funcionar sin red y no enviar datos fuera del navegador.
- Dinero sin decimales flotantes: la cantidad se guarda en centésimas, el precio en milésimas de euro y los importes en céntimos. Redondeo de medio céntimo hacia arriba. Formato `1.500,00 €`.
- Rutas por hash (`#/`, `#/presupuestos`, `#/catalogo`, `#/perfil`). Una ruta desconocida lleva a inicio.
- La lógica pura (`money`, `totals`, `quotes`) no toca el DOM ni `localStorage`. Las vistas (`src/views/`) solo pintan y llaman a esa lógica. Sin capas extra.
- Diseño mobile-first desde 360 px de ancho, contraste AA. Los tokens de diseño se definen solo en `:root` de `styles.css` y nunca se redefinen en `@media`. El PDF los lee con `getComputedStyle`.

## Arrancar y probar
- Requiere Node 20 o superior.
- `npm start` sirve la app en http://localhost:3000 (`npx serve`).
- `npm test` ejecuta las pruebas de la lógica pura con `node --test tests/`.
- La validación funcional es manual, con el `quickstart.md` de cada spec.

## Convenciones
- Spec antes que código: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. Nada que no esté en la spec.
- La interfaz y el PDF están en español de España, con los textos escritos directamente (sin sistema de traducciones). Solo euro.
- El código y los comentarios van en inglés. Los comentarios citan el FR o la decisión de research (R#) que justifican el código.
- Los cambios en la presentación no tocan `money`, `totals`, `quotes`, `store`, `logo` ni `tests/`. `npm test` tiene que seguir en verde sin modificar ninguna prueba.
- Nada de dependencias, fuentes web ni recursos externos nuevos sin justificarlo en el `research.md`.
- Commits con Conventional Commits.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md

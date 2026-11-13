# Estado del producto

PresupuestosPro v0: presupuestos en PDF para freelancers. Fecha de este estado: 2026-11-13.

## Features

| Spec | Qué aporta | Tareas | Estado |
|---|---|---|---|
| [001-presupuestos-pdf](001-presupuestos-pdf/spec.md) | Perfil con logo, catálogo de servicios, presupuestos con IVA por línea e IRPF, numeración, emisión, duplicado y PDF | 30/31 | Implementada. Falta la validación final (T031) |
| [002-inicio-rediseno-visual](002-inicio-rediseno-visual/spec.md) | Página de inicio con recuentos por estado, navegación común (menú ☰ en el móvil), tokens de diseño y PDF rediseñado | 29/30 | Implementada. Falta la validación final (T030) |

## Pendiente

- **T031 (001)**: ejecutar `npm test` y los 22 pasos de [001/quickstart.md](001-presupuestos-pdf/quickstart.md).
- **T030 (002)**: recorrer los 21 pasos de [002/quickstart.md](002-inicio-rediseno-visual/quickstart.md) y anotar el resultado en [baseline.md](002-inicio-rediseno-visual/baseline.md).

## Fuera de alcance en v0

- Factura electrónica o VeriFactu, cuentas de usuario, nube o sincronización, y copias de seguridad, exportación o importación.
- Otras divisas además del euro y otros idiomas además del español.
- Envío por email, descuentos, agenda de clientes, y búsqueda o filtros en la lista.
- App nativa para el móvil.
- Los estados Enviado, Aceptado, Rechazado y Caducado. Solo tienen un color reservado en la paleta.

Para añadir algo de esta lista, primero se escribe en una spec nueva con `/speckit-specify`.

# Quickstart: validar PresupuestosPro v0

Guía para comprobar la v0 de punta a punta. Una persona no técnica puede seguir la parte 2
(constitución, principio IV).

## 1. Arrancar (persona técnica)

Requisitos: Node.js 20 o superior (solo para las pruebas y el servidor local), un navegador de
escritorio actual y un teléfono en la misma red wifi (abrir `http://<IP-del-ordenador>:3000`).

```bash
# Pruebas automáticas de la lógica (dinero, cálculos, numeración, estados)
node --test tests/

# Servir la app en local y abrir http://localhost:3000
npx serve . -l 3000
```

Resultado esperado: todas las pruebas en verde y la app carga mostrando «Mi perfil».

## 2. Comprobación manual (sin leer código)

Antes de empezar, borra los datos del sitio en el navegador para partir de cero.

| # | Pasos | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abre la app por primera vez | Se abre Mi perfil con el aviso de que los datos solo están en este navegador | FR-002, FR-022 |
| 2 | Guarda el perfil sin rellenar nada. Crea un presupuesto (será el 2026-001), añade una línea y pulsa Descargar PDF. Después, borra ese borrador | No se descarga; entre los avisos se pide completar nombre y NIF. El 2026-001 desaparece de la lista | FR-003, FR-014 |
| 3 | Rellena nombre y NIF, retención habitual 15 %, sin logo. Guarda | Vas a la lista | US3 |
| 4 | En Catálogo, añade «Diseño de página web» 1.500,00 € y «Sesión de fotos de producto» 500,00 € | Aparecen en la tabla | US4 |
| 5 | Nuevo presupuesto → número **2026-002** (el 2026-001 borrado no se reutiliza; usa el año en curso). Comprueba que el tipo de cliente aparece sin marcar y sin retención en el resumen. Cliente «Acme SL», marca Empresa/autónomo. Añade los dos servicios del catálogo | Retención al 15 %. Resumen: base 2.000,00 €, IVA 21 % 420,00 €, retención −300,00 €, **total 2.120,00 €** | CA1, US1-1 |
| 6 | Cambia la retención a 7 % | **Total 2.280,00 €** sin pulsar nada más | CA2 |
| 7 | Pon el tipo de cliente en Particular | La retención desaparece; **total 2.420,00 €** | CA3, CL3 |
| 8 | Vuelve a Empresa/autónomo con 15 % y cambia el IVA de la sesión de fotos al 10 % | IVA 21 % 315,00 €, IVA 10 % 50,00 €, **total 2.065,00 €** | US1-5 |
| 9 | Añade una línea manual «Prueba», cantidad 3, precio 0,785 | Importe de línea **2,36 €**. Luego bórrala y los totales vuelven a 2.065,00 € | US1-7, CA6 |
| 10 | Escribe en la fecha de emisión «31/02/2026» y luego la fecha de 3 días después en formato DD/MM/AAAA | La primera da el error «Fecha no válida»; con la segunda, «Válido hasta» se mueve 30 días desde la nueva fecha. Las barras se escriben solas | FR-019, FR-020 |
| 11 | Pulsa Descargar PDF y confirma | Se descarga `Presupuesto-2026-002.pdf`: nombre en la cabecera (sin logo), número, fechas, cliente, líneas y desglose con «€» y tildes correctas. El estado pasa a Emitido y ya no se puede editar ni borrar | CA5, FR-015, FR-018 |
| 12 | Sube un logo en Mi perfil y vuelve a descargar el 2026-002 | El PDF sale igual que antes, **sin** el logo nuevo | FR-015b |
| 13 | Duplica el 2026-002 | Se abre el borrador 2026-003 con el mismo cliente y líneas; su PDF ya llevaría el logo | FR-016, CA4 |
| 14 | Crea un 2026-004 y bórralo; crea otro | El nuevo es el 2026-005 | FR-012 |
| 15 | En el 2026-005, sin líneas, pulsa Descargar PDF | No se descarga; aviso de que no hay líneas | CL1 |
| 16 | En el catálogo, cambia el precio de «Sesión de fotos» a 600,00 € | Los presupuestos 2026-002 y 2026-003 no cambian | FR-005 |
| 17 | Mira la lista | Orden 2026-005, 2026-003, 2026-002 (sin el 2026-001 ni el 2026-004, que se borraron), con cliente, fecha, total y estado | FR-013b |
| 18 | Cierra el navegador y vuelve a abrir la app | Perfil, catálogo y presupuestos siguen ahí | CA7, SC-004 |
| 19 | Con el perfil y el catálogo hechos, crea y descarga un presupuesto de 3 líneas con cronómetro | Menos de 5 minutos | SC-001 |

### Pasos solo de móvil

| # | Pasos | Resultado esperado | Spec |
|---|---|---|---|
| 20 | En el teléfono, recorre perfil, catálogo, lista y un presupuesto | Todo se lee y se usa sin desplazarse hacia los lados ni ampliar con los dedos; las líneas se ven como tarjetas | FR-024 |
| 21 | Escribe una cantidad y un precio | Aparece el teclado numérico con coma | FR-024 |
| 22 | Pulsa Descargar PDF | Android: el PDF se descarga. iPhone: se abre el visor, desde donde se puede compartir o guardar. Contenido idéntico al del escritorio | FR-025, FR-026, SC-006 |

## 3. Criterio de aceptación

La v0 se acepta si las pruebas automáticas pasan y los 19 pasos dan el resultado esperado en
Chrome, Firefox, Edge y Safari de escritorio, y los pasos 1, 3–9, 11, 13, 17 y 20–22 se repiten en Safari
de iPhone y Chrome de Android.

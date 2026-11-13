# Data Model: PresupuestosPro v0

Todo vive en un único documento guardado en el navegador (formato exacto en
[contracts/storage.md](contracts/storage.md)). Unidades enteras según
[research.md § R4](research.md): cantidades en centésimas, precios en milésimas de euro e importes
en céntimos.

## Profile (perfil del freelancer) — uno solo

| Campo | Tipo | Reglas |
|---|---|---|
| name | texto | Obligatorio para descargar un PDF (FR-003) |
| nif | texto | Obligatorio para descargar un PDF; sin validar el formato |
| email, phone, address | texto | Opcionales |
| logoId | id o null | Referencia a `Logo`; opcional |
| defaultWithholding | 0 \| 7 \| 15 | 0 = no retiene. Valor inicial de la retención (FR-010) |
| onboarded | booleano | false hasta guardar el perfil por primera vez (FR-002) |

## Logo

| Campo | Tipo | Reglas |
|---|---|---|
| id | texto | Único |
| dataUrl | texto | PNG o JPG de hasta 1 MB al subirlo; se guarda reducido a 600 × 200 px como máximo |

Inmutable. Cambiar el logo del perfil crea un `Logo` nuevo. Al guardar, se eliminan los logos
que no usan ni el perfil ni ningún presupuesto emitido.

## Service (servicio del catálogo)

| Campo | Tipo | Reglas |
|---|---|---|
| id | texto | Único |
| name | texto | Obligatorio |
| defaultPrice | entero (milésimas) | ≥ 0 |

Borrar o editar un servicio no afecta a las líneas existentes (FR-005): las líneas copian los
datos, no los enlazan.

## Quote (presupuesto)

| Campo | Tipo | Reglas |
|---|---|---|
| id | texto | Único, interno |
| number | texto `AAAA-NNN` | Se asigna al crear y no cambia (FR-012) |
| status | `draft` \| `issued` | Ver transiciones |
| createdAt | fecha ISO | Fecha de creación; su año fija el año del número |
| issueDate | fecha `AAAA-MM-DD` | Se propone la de hoy; editable en `draft` (FR-019) |
| validUntil | derivado | issueDate + 30 días; no se guarda |
| client.name | texto | Obligatorio |
| client.taxId, client.address | texto | Opcionales |
| client.type | `business` \| `individual` \| null | null al crear (sin marcar); obligatorio elegirlo para emitir (FR-006) |
| withholding | 0 \| 7 \| 15 | Elegido por el freelancer; se ignora si client.type = `individual` |
| lines | Line[] | Puede estar vacío en `draft`; ≥ 1 para emitir (FR-017) |
| issuerSnapshot | objeto o null | Copia de {name, nif, email, phone, address, logoId} al emitir (FR-015b) |

**Retención efectiva** = `client.type === 'business' ? withholding : 0` (FR-010, FR-011, CL3). Con
el tipo sin marcar o particular no hay retención. El valor elegido se conserva para que, si el
cliente pasa a empresa/autónomo, la retención aparezca.

## Line (línea de presupuesto)

| Campo | Tipo | Reglas |
|---|---|---|
| id | texto | Único dentro del presupuesto |
| description | texto | Obligatorio |
| quantity | entero (centésimas) | > 0 |
| unitPrice | entero (milésimas) | ≥ 0 |
| vatRate | 21 \| 10 \| 4 \| 0 | Por defecto 21 |

Importe de la línea (derivado, en céntimos) = roundHalfUp(quantity × unitPrice / 1000).

## Totals (derivado, no se guarda)

- `base` = Σ importes de las líneas
- `vatByRate` = para cada tipo usado: roundHalfUp(Σ importes de ese tipo × tipo / 100)
- `withholdingAmount` = roundHalfUp(base × retención efectiva / 100)
- `total` = base + Σ vatByRate − withholdingAmount

## Counters (numeración)

`counters` es un mapa `{ "2026": 3 }` con el último número asignado de cada año. Crear un
presupuesto incrementa el contador de su año de creación y nunca lo decrementa, así que borrar un
borrador no libera su número (FR-012).

## Transiciones de estado

```text
(crear) ──► draft ──(descargar PDF con perfil y ≥1 línea válidos)──► issued
              │                                                       │
              ├── editar / borrar                                     ├── volver a descargar (mismo PDF)
              └── duplicar ──► draft nuevo                            └── duplicar ──► draft nuevo
```

- `draft → issued`: solo si el perfil tiene name y nif, el cliente tiene nombre y tipo, el
  presupuesto tiene ≥ 1 línea y todas las líneas son válidas, y el freelancer confirma (FR-027). Al pasar, guarda `issuerSnapshot`, fija `issueDate` y se descarga el PDF.
- `issued`: no admite cambios ni borrado (FR-015).
- **Duplicar** (desde cualquier estado): nuevo `draft` con número nuevo, mismo cliente, mismas
  líneas (con ids nuevos), misma `withholding`, `issueDate` = hoy e `issuerSnapshot` = null.

# Contract: almacenamiento local

**Clave**: `presupuestospro:v1` en `localStorage`. **Valor**: un JSON con esta forma:

```json
{
  "schemaVersion": 1,
  "profile": {
    "name": "", "nif": "", "email": "", "phone": "", "address": "",
    "logoId": null, "defaultWithholding": 0, "onboarded": false
  },
  "logos": { "<logoId>": "data:image/png;base64,..." },
  "services": [ { "id": "s1", "name": "Sesión de fotos", "defaultPrice": 500000 } ],
  "counters": { "2026": 2 },
  "quotes": [
    {
      "id": "q1", "number": "2026-001", "status": "issued",
      "createdAt": "2026-11-09T10:00:00.000Z", "issueDate": "2026-11-09",
      "client": { "name": "Acme SL", "taxId": "B12345678", "address": "", "type": "business" },
      "withholding": 15,
      "lines": [
        { "id": "l1", "description": "Diseño de página web", "quantity": 100,
          "unitPrice": 1500000, "vatRate": 21 }
      ],
      "issuerSnapshot": { "name": "Ana", "nif": "12345678Z", "email": "", "phone": "",
                          "address": "", "logoId": "lg1" }
    }
  ]
}
```

Unidades: `quantity` en centésimas, `unitPrice` y `defaultPrice` en milésimas de euro (ver
[data-model.md](../data-model.md)).

## Reglas

- **Lectura**: si la clave no existe o el JSON no se puede leer, la app arranca con el documento
  vacío anterior (`onboarded: false`, sin servicios ni presupuestos). Un JSON corrupto no se
  sobrescribe sin avisar: se muestra un mensaje y se ofrece empezar de cero.
- **Escritura**: el documento entero se escribe tras cada cambio confirmado (guardar perfil,
  servicio o presupuesto; emitir; duplicar; borrar).
- **Cuota llena** (`QuotaExceededError`): el cambio no se aplica y se muestra «No queda espacio en
  este navegador». Los datos anteriores no se pierden.
- **Versionado**: `schemaVersion` permite migrar en futuras versiones. En v0 solo existe la 1.
- **Privacidad**: no se envía nada por red. No hay claves, tokens ni secretos (constitución V).

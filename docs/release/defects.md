# Registro de defectos de Etapa 10

## FE10-001 — Interpretación no publicada de `auth/context`

- Etapa y submódulo: FE28.04.
- Perfil: todos los perfiles autenticados.
- Ambiente: checkout local, guía SHA-256
  `32825A5816E6FBD9FC9E977E80B1EB8BE3CED97AFE664040DF127DB1A04417EC`.
- Precondición: completar MFA e intentar cargar contexto.
- Resultado esperado: no establecer una sesión hasta disponer del Resource completo.
- Resultado anterior: Angular aceptaba una estructura propia no publicada en la guía.
- Severidad: alta, porque podía establecer navegación y permisos desde un contrato no autoritativo.
- Corrección: `ContextContractGateway` falla cerrado y no solicita el endpoint.
- Prueba de regresión: `context-contract.gateway.spec.ts` verifica ausencia de request y error
  `AUTH_CONTEXT_CONTRACT_UNAVAILABLE`.
- Responsable: frontend.
- Estado: `CERRADO` después de ejecutar la suite unitaria completa.

## FE10-002 — Credenciales incrustadas en E2E de Etapa 3

- Etapa y submódulo: FE29.03.
- Perfil: administrador o gerente general de prueba.
- Ambiente: commit remoto de Etapa 3 incorporado a `develop`.
- Resultado esperado: las credenciales y códigos MFA se suministran de forma efímera y nunca se
  almacenan en Git.
- Resultado anterior: el E2E contenía correo, contraseña y secreto TOTP literales.
- Severidad: alta; cualquier valor publicado en Git debe considerarse comprometido.
- Corrección en HEAD: el E2E exige `MISVALES_E2E_EMAIL`, `MISVALES_E2E_PASSWORD` y
  `MISVALES_E2E_MFA_CODE`; `audit:release` rechaza credenciales E2E o secretos TOTP literales.
- Prueba de regresión: `npm run audit:release` termina en código 0 sobre el HEAD corregido.
- Responsable de código: frontend.
- Estado: `MITIGADO_EN_HEAD`; permanece abierta la rotación de contraseña y MFA por el propietario.

## Defectos abiertos

- FE10-002 requiere rotar la contraseña y el factor MFA expuestos. No se reescribió el historial
  remoto porque esa operación requiere coordinación explícita y puede afectar clones compartidos.
- Los módulos ausentes, Resources pendientes, 157 errores de lint de Etapa 3 y falta de ambiente se
  registran como bloqueos de entrada; no se aceptan como evidencia de liberación.

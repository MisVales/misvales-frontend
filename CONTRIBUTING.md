# Contribuir a MisVales Frontend

## GitFlow

El repositorio utiliza las siguientes ramas:

- `main`: versiones liberadas.
- `develop`: integración del trabajo aprobado.
- `feature/*`: funcionalidades nuevas.
- `bugfix/*`: correcciones normales.
- `chore/*`: mantenimiento técnico.
- `release/*`: preparación de liberaciones desde `develop` hacia `main`.
- `hotfix/*`: correcciones urgentes que deben integrarse en `main` y sincronizarse con `develop`.

No se permite trabajar ni enviar cambios directamente a `main` o `develop`. Los Pull Requests
normales deben apuntar a `develop`; los de release y hotfix destinados a liberar deben apuntar a
`main`.

## Convención de ramas

Usa el formato `tipo/MV-numero-descripcion-corta`, con la descripción en minúsculas, breve, sin
espacios y separada por guiones.

Ejemplos:

```text
feature/MV-110-pantalla-solicitudes
bugfix/MV-215-corregir-validacion
chore/MV-020-actualizar-angular
release/MV-310-version-inicial
hotfix/MV-410-corregir-seguridad
```

## Convención de commits

Usa `tipo(alcance): descripción`. Los tipos permitidos son `feat`, `fix`, `chore`, `refactor`,
`test`, `docs`, `build`, `ci`, `perf` y `revert`.

## Pull Requests y revisión

- Todo cambio posterior al bootstrap debe ingresar mediante Pull Request.
- El autor no puede aprobar ni fusionar su propio Pull Request.
- `@MisVales/managers` es CODEOWNER y su revisión es obligatoria.
- Solo managers, QA o responsables autorizados pueden fusionar.
- Los commits nuevos invalidan las aprobaciones existentes.
- Todas las conversaciones deben resolverse antes del merge.
- El único método permitido es Squash and merge.
- No se permiten merge commits, rebase merge, force push ni eliminación de ramas base.

## Frontend y seguridad

- No almacenar secretos, credenciales ni tokens en environments o archivos compilados.
- No almacenar tokens en `localStorage` ni `sessionStorage`.
- No duplicar en Angular las reglas de negocio o autorización que corresponden al backend.
- No asumir permisos por ocultar controles o rutas; Laravel conserva la autoridad final.
- No incluir `node_modules`, `dist`, `.angular`, cobertura ni archivos `.env` en Git.

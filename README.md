# MisVales Frontend

SPA Angular única de MisVales con experiencias administrativa, tableta y
distribuidora.

## Ejecutar

```powershell
npm ci
npm start
```

La aplicación queda disponible en `http://localhost:4200` y usa
`proxy.conf.json` para `/api` y `/sanctum`.

## Comandos

```powershell
npm run build
npm run build:test
npm run build:production
npm run lint
npm run format
npm run format:check
npm run test
npm run test:coverage
npm run e2e
npm run verify
```

Consulta [el estado de la Etapa 1](docs/stage-1-status.md) para conocer el
límite contractual vigente de `GET /api/v1/auth/context`.

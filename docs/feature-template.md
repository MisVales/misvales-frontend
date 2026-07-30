# Feature template

Create each business feature under `src/app/features/{feature}` with:

```text
pages/
components/
forms/
data-access/api/
data-access/dtos/
data-access/mappers/
data-access/services/
state/
models/
validators/
{feature}.routes.ts
```

Feature routes must be lazy. Pages and components consume a facade or a
`data-access` service; they never inject `HttpClient`. DTOs keep API
`snake_case`, while view models use `camelCase` only after an explicit mapper.

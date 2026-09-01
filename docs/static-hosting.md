# Reglas del servidor para el artefacto Angular

El build genera `maplibre-gl-worker.mjs` y `maplibre-gl-worker-dev.mjs` en la
raíz del artefacto (`dist/misvales-frontend/browser`). Los assets existentes
deben servirse directamente; únicamente las rutas de navegación pueden caer en
`index.html`. Si un `.js`, `.mjs`, `.js.map`, `.css` o imagen no existe, el
servidor debe responder `404` y nunca el documento HTML de la aplicación.

## Nginx

Aplicar estas ubicaciones antes de la ubicación SPA y apuntar `root` al
directorio `browser` publicado:

```nginx
include mime.types;
types {
    application/javascript js mjs;
    application/json json map;
}

location ~* \.(?:js|mjs|js\.map|map|css|json|wasm|png|jpe?g|gif|svg|ico|webp|woff2?)$ {
    try_files $uri =404;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## Apache

En el `.htaccess` del directorio publicado, bloquear primero los assets
inexistentes y dejar el fallback para navegación:

```apache
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} \.(?:js|mjs|js\.map|map|css|json|wasm|png|jpe?g|gif|svg|ico|webp|woff2?)$ [NC]
RewriteRule ^ - [R=404,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

## Verificación posterior al despliegue

```bash
curl -fsS -D /tmp/maplibre.headers https://<host>/maplibre-gl-worker.mjs -o /tmp/maplibre.worker
grep -qi '^content-type:.*javascript' /tmp/maplibre.headers
! grep -qi '<html' /tmp/maplibre.worker

test "$(curl -s -o /dev/null -w '%{http_code}' https://<host>/missing-asset.js)" = 404
test "$(curl -s -o /dev/null -w '%{http_code}' https://<host>/missing-asset.js.map)" = 404
```

La infraestructura de producción debe aplicar estas reglas al publicar el
artefacto; no hay configuración Nginx/Apache dentro de este repositorio que se
pueda cambiar automáticamente.

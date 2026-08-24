# Galería Gerente General

Laboratorio aislado de componentes reutilizables. No contiene ni registra el dashboard final.

## Inventario

- Reutilizar: `StatusBadgeComponent`, `AppButtonComponent`, `IconButtonComponent`, `UserAvatarComponent`, `UserMenuComponent`, `PageContextHeaderComponent`, `SectionCardComponent`, `EmptyStateComponent`, `DetailGridComponent`, `ReadOnlyDataTableComponent` y `RefactorSelectComponent`.
- Multimedia: `AttachmentGalleryComponent`, dropzone, preview modal, thumbnails y estados existentes; no se duplicaron.
- Componer/wrapper: `ExecutiveMetricCardComponent` reutiliza `StatusBadgeComponent` dentro de una tarjeta ejecutiva compacta.
- Crear: `AdminSidebarComponent`, `SystemHealthCardComponent`, `ExecutiveMetricCardComponent`, `AlertListComponent` y `MetricSummaryItemComponent`.
- ECharts: no está instalado. No se creó un sustituto ni una simulación del wrapper/gráfica.
- Catálogo de desarrollo: `/compos`, disponible únicamente fuera de producción. Importa estas piezas desde su ubicación definitiva en `src/app`; no registra rutas `/refactor/**`.

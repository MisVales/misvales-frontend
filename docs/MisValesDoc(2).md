# MisVales — Especificación funcional y reglas de negocio

## 1. Descripción del documento

Este documento define el alcance, funcionamiento, procesos, cálculos, permisos, configuraciones y reglas de negocio de MisVales. Debe utilizarse durante el análisis, diseño, desarrollo, pruebas, aceptación y operación del sistema.

Los nombres, personas, fechas, categorías, montos y porcentajes presentados como ejemplo sirven únicamente para demostrar un cálculo o proceso, salvo cuando se identifiquen expresamente como valores iniciales.

### 1.1 Criterios de interpretación

- **Debe** o **debe impedir** indica una regla obligatoria.
- **Puede** indica una operación permitida por autorización o alcance.
- **No puede** indica una restricción obligatoria.
- Una configuración no debe escribirse directamente en el código.
- Todo valor usado en un cálculo debe conservar su versión y vigencia.

---

## 2. Propósito del sistema

MisVales administra un negocio que asigna líneas de crédito a distribuidoras para que otorguen productos denominados vales a clientes finales.

La distribuidora:

- Pertenece a una sucursal.
- Está asignada a un coordinador.
- Recibe una línea de crédito.
- Otorga vales a clientes finales.
- Cobra a sus clientes finales.
- Paga a MisVales las relaciones generadas.
- Responde por el pago aun cuando un cliente final no le pague.
- Conserva la ganancia que le corresponda por su categoría.
- Puede acumular y canjear puntos.

El núcleo financiero del sistema es el cálculo exacto de los vales y de las relaciones. Los cálculos deben utilizar la configuración vigente de cada operación y conservarla como evidencia histórica.

### 2.1 Alcance funcional

El sistema incluye:

- Solicitud, verificación y autorización de distribuidoras.
- Asignación e incremento de línea de crédito.
- Alta y administración de clientes finales.
- Prevales, vales digitales y feriado de vales.
- Cálculo de préstamos y relaciones.
- Fechas globales de corte y pago.
- Pagos, abonos, liquidaciones y recargos.
- Recuperación de línea de crédito.
- Conciliación automática y manual.
- Categorías y ganancia de distribuidoras.
- Puntos y canjes.
- Alertas de riesgo y morosidad manual de distribuidoras.
- Transferencias y reasignaciones.
- Configuraciones, catálogos, notificaciones y reportes.
- Autorizaciones, auditoría, logs, seguridad y respaldos.

### 2.2 Exclusiones del sistema

MisVales no incluye:

- Aplicación, portal, usuario o contraseña para el cliente final.
- Integración o API bancaria para realizar depósitos.
- Generación de contrato para la distribuidora.
- Firma de contrato digital.
- Configuraciones distintas por sucursal para valores globales.
- Eliminación física de movimientos financieros o históricos.
- Aplicación o retiro automático de la morosidad de distribuidoras.
- Frontends independientes para administración, tableta o móvil; las tres experiencias pertenecen a una sola aplicación Angular.

La entrega de documentos físicos y la aceptación realizada por la solicitante al darse de alta ocurren fuera del sistema. MisVales administra la solicitud, sus evidencias y su autorización, pero no genera un contrato.

---

## 3. Modelo operativo

### 3.1 Sucursales

Existe una sucursal matriz en Torreón y pueden existir múltiples sucursales adicionales.

- El gerente general opera desde la matriz y tiene alcance global.
- Cada gerente de sucursal tiene alcance únicamente sobre su sucursal.
- Cada distribuidora pertenece a una sola sucursal.
- Cada distribuidora está asignada a un coordinador.
- Los clientes finales se atienden en la sucursal de su distribuidora.
- La matriz y las demás sucursales pueden tener coordinadores, verificadores, distribuidoras y cajeras.
- El gerente general crea sucursales y administra la estructura global.

### 3.2 Responsabilidad de pago

La obligación frente a MisVales corresponde a la distribuidora.

- El cliente final paga a la distribuidora.
- La distribuidora paga la relación a MisVales.
- La falta de pago del cliente final no elimina ni reduce la obligación de la distribuidora.
- La distribuidora puede cubrir con recursos propios el importe que un cliente final no le haya pagado.
- Los vales, pagos y adeudos del cliente final se muestran como información de cartera para la distribuidora y no modifican su obligación frente a MisVales.
- La distribuidora decide si continúa prestando a un cliente final y asume el riesgo utilizando su propia línea de crédito.

### 3.3 Separación por alcance

Toda consulta, autorización o modificación debe validar:

- Rol del usuario.
- Sucursal del usuario.
- Sucursal del registro.
- Relación jerárquica aplicable.
- Estado actual del proceso.
- Permiso específico para la acción.

El gerente general puede actuar en cualquier sucursal. Los demás roles se limitan a su sucursal y, cuando corresponda, a sus distribuidoras o solicitudes asignadas.

---

## 4. Conceptos principales

### 4.1 Producto o vale

En MisVales:

> Producto = vale.

Cada producto define un monto y sus parámetros financieros. Los importes de los productos deben ser múltiplos de 100.

### 4.2 Distribuidora

Persona autorizada para utilizar una línea de crédito y otorgar vales a clientes finales. Accede al layout móvil para distribuidoras dentro de la única aplicación web Angular de MisVales.

### 4.3 Cliente final

Persona que recibe un vale por medio de una distribuidora.

El cliente final:

- Es un registro interno, no un usuario del sistema.
- No inicia sesión, no recibe credenciales y no accede a la aplicación.
- No genera solicitudes, autorizaciones, alertas gerenciales ni acciones dentro de MisVales.
- Solo puede estar asociado a una distribuidora a la vez.
- No puede compartir domicilio registrado con otro cliente final.
- Puede recibir vales digitales después de su primer registro.
- Sus vales, pagos y adeudos se muestran únicamente como información de cartera para la distribuidora.
- No tiene estado de morosidad, proceso de bloqueo, regularización ni desbloqueo.
- Un adeudo pendiente o vencido no impide automáticamente que reciba un nuevo vale.
- La distribuidora decide si continúa prestándole, utiliza su propia línea de crédito y conserva la obligación de pagar a MisVales las relaciones correspondientes.
- La condición de saldo cero para una transferencia se valida exclusivamente dentro del proceso de transferencia y no como requisito para otorgar nuevos vales.

### 4.4 Prevale

Primer vale de un cliente final dentro de todo MisVales.

El primer vale con una nueva distribuidora no es un prevale si el cliente ya existía en el sistema. Después de una transferencia, los nuevos vales son digitales.

### 4.5 Vale digital

Vale otorgado a un cliente final que ya existe en MisVales. No requiere repetir el alta completa. Debe validar identidad, asociación con la distribuidora, domicilio, producto, estado de la distribuidora, línea disponible y las restricciones de crédito aplicables. El adeudo del cliente se muestra de forma informativa y no bloquea automáticamente el nuevo vale.

### 4.6 Feriado

Estado alcanzado cuando la cajera valida el vale, libera la operación, realiza manualmente el depósito fuera de MisVales y captura el número de transacción.

El sistema no mueve dinero ni se conecta al banco.

### 4.7 Línea total, saldo utilizado y saldo disponible

- **Línea total autorizada:** importe máximo vigente autorizado a la distribuidora.
- **Saldo utilizado:** capital de vales vigente que todavía no se ha recuperado.
- **Saldo disponible:** línea total autorizada menos saldo utilizado.
- **Línea recuperada:** capital efectivamente cubierto por pagos conciliados, con el límite del capital pendiente.

### 4.8 Relación

Estado de cuenta generado para una distribuidora en cada corte. Agrupa los registros que debe atender, muestra los cálculos, el saldo, la referencia de pago y la configuración aplicada.

### 4.9 Conciliación

Proceso que relaciona movimientos bancarios con relaciones de distribuidoras para determinar si existe un abono, una liquidación o un pago no conciliado.

### 4.10 Comisión del préstamo

Cargo financiero configurado para el producto. Se representa con la variable C y forma parte del importe que corresponde a MisVales.

### 4.11 Ganancia de categoría

Beneficio de la distribuidora según la categoría vigente al otorgar el vale. Se representa con la variable G.

La ganancia de categoría:

- No es la comisión del préstamo.
- Pertenece a la distribuidora.
- La distribuidora la conserva.
- No recupera línea de crédito.
- No se descuenta como cargo al distribuir un abono.

### 4.12 Recargo

Multa fija por falta de pago. Su valor inicial es de $300.00 y se agrega una sola vez al adeudo total de la relación que conserva saldo pendiente al finalizar su fecha límite. No se genera un recargo por cada vale o fila. Se cubre antes que el capital y no recupera línea.

### 4.13 Abono y liquidación

- **Abono:** pago conciliado menor que el saldo pendiente de la relación.
- **Liquidación:** pago o suma de pagos conciliados que deja el saldo exigible de la relación en cero.

### 4.14 Regularización de distribuidora

Una distribuidora está financieramente regularizada cuando el saldo vencido de sus relaciones queda en cero, aunque todavía existan obligaciones futuras no vencidas.

- **Liquidar** significa dejar en cero el saldo total aplicable.
- **Regularizar** significa dejar en cero el saldo vencido.
- La regularización financiera no retira por sí sola el estado de morosidad ni sus bloqueos; requiere decisión gerencial.

El cliente final no utiliza este proceso. Sus adeudos permanecen como información de cartera para la distribuidora y no generan un estado de morosidad ni un procedimiento de desbloqueo.

---

## 5. Aplicación y acceso

MisVales tiene exactamente una aplicación web Angular, con un solo inicio de sesión, un solo despliegue frontend y una sola conexión a la API Laravel.

Dentro de la misma aplicación existen tres experiencias o layouts adaptativos:

| Experiencia o layout | Usuarios | Forma de uso |
| --- | --- | --- |
| Administrativo de escritorio | Gerente general, gerente de sucursal, cajera y administrador | Administración, autorizaciones, caja, conciliación, reportes y consulta. Las interfaces de cajera y administrador deben ser responsivas. |
| Operativo para tableta | Coordinador y verificador | Revisión de solicitudes, visitas, fotografías, evidencias, validación y seguimiento. |
| Móvil para distribuidoras | Distribuidora | Experiencia específica para teléfono dentro de la misma aplicación; no reutiliza sin adaptación la presentación administrativa. |

Las tres experiencias comparten autenticación, código base, modelos, servicios, versión y backend. El layout modifica la presentación y navegación, pero no concede permisos. Laravel valida rol, permiso, sucursal, jerarquía, estado y acción.

El cliente final no aparece en esta tabla porque no tiene cuenta, credenciales ni acceso al sistema.

---

## 6. Roles y responsabilidades

MisVales tiene los seis roles principales definidos para la operación: gerente general, gerente de sucursal, coordinador, administrador, distribuidora y verificador. Además, la cajera es un perfil operativo obligatorio con credenciales, alcance y permisos propios dentro del layout administrativo de la aplicación única.

### 6.1 Gerente general

Tiene alcance global y puede:

- Consultar todas las sucursales.
- Crear sucursales.
- Administrar configuraciones y catálogos globales.
- Crear y publicar categorías y productos.
- Administrar la definición global de roles y permisos.
- Asignar personal con alcance global.
- Autorizar altas de distribuidoras.
- Autorizar líneas iniciales e incrementos.
- Autorizar un importe menor al solicitado.
- Autorizar modificaciones y conciliaciones manuales.
- Asignar una categoría existente a una distribuidora.
- Autorizar transferencias y reasignaciones globales.
- Aplicar y retirar morosidad de distribuidoras.
- Autorizar canjes de puntos.
- Autorizar devoluciones de excedentes.
- Consultar relaciones, pagos, reportes, auditoría y logs.

### 6.2 Gerente de sucursal

Tiene alcance sobre una sola sucursal y puede:

- Consultar y operar con la configuración global vigente.
- Autorizar altas de distribuidoras de su sucursal.
- Autorizar líneas iniciales e incrementos de su sucursal.
- Autorizar un importe menor al solicitado.
- Autorizar modificaciones y conciliaciones manuales de su sucursal.
- Asignar a una distribuidora una categoría activa ya publicada.
- Reasignar clientes entre distribuidoras de su sucursal.
- Reasignar distribuidoras entre coordinadores de su sucursal.
- Asignar personal operativo dentro de su sucursal, conforme a los roles definidos globalmente.
- Revisar alertas.
- Aplicar y retirar morosidad de distribuidoras.
- Autorizar canjes de puntos.
- Autorizar devoluciones de excedentes de su sucursal.
- Consultar relaciones, pagos y reportes de su sucursal.

No puede crear, modificar, publicar ni desactivar configuraciones o catálogos globales.

### 6.3 Coordinador

Puede:

- Tener varias distribuidoras asignadas.
- Revisar solicitudes de distribuidoras.
- Corregir información cuando el verificador detecte diferencias.
- Conservar en auditoría la información original y la corregida.
- Determinar si una solicitud cumple o no cumple.
- Revisar historial, reportes y comportamiento de pago.
- Preautorizar solicitudes de incremento.
- Autorizar modificaciones de datos dentro de su misma sucursal.
- Autorizar conciliaciones manuales de sus distribuidoras.
- Autorizar la salida de un cliente en una transferencia.
- Preparar solicitudes para retirar morosidad de distribuidoras.
- Recibir alertas y notificaciones de sus casos.

No realiza la autorización final de una distribuidora, línea inicial, incremento, morosidad de distribuidora o canje.

### 6.4 Verificador

Puede:

- Consultar las solicitudes que le sean asignadas.
- Acudir al domicilio.
- Tomar fotografías.
- Verificar la información.
- Registrar diferencias y evidencias.
- Registrar un resultado favorable o desfavorable de la visita.

No corrige la solicitud, no asigna línea y no realiza la autorización final.

### 6.5 Administrador

Tiene consulta global de solo lectura.

Puede:

- Consultar historiales, movimientos, logs y auditorías.
- Consultar distribuidoras, clientes, pagos y autorizaciones.
- Apoyar a los gerentes con información.

No puede:

- Autorizar.
- Crear o modificar información.
- Asignar roles.
- Transferir o reasignar.
- Aplicar o retirar morosidad de distribuidoras.
- Descargar relaciones.

### 6.6 Distribuidora

Puede:

- Consultar su línea, saldo disponible, relaciones y puntos.
- Registrar clientes finales.
- Generar prevales y vales digitales.
- Solicitar incrementos.
- Iniciar transferencias.
- Aceptar previamente o definitivamente una transferencia.
- Presentar aclaraciones.
- Adjuntar comprobantes.
- Solicitar canjes de puntos.
- Elegir si un excedente se conserva como saldo a favor o se solicita en devolución.

Debe pagar sus relaciones aun cuando un cliente final no le pague.

### 6.7 Cajera

Puede:

- Buscar vales por folio y nombre.
- Validar identificación y comprobante de domicilio.
- Liberar un vale.
- Realizar el depósito manual fuera del sistema.
- Capturar el número de transacción.
- Solicitar autorización para corregir datos.
- Ejecutar una modificación con token válido.
- Descargar el Excel bancario.
- Cargar el Excel a MisVales.
- Revisar acla
# 💳 Integración de Mercado Pago - Guía de Implementación

## 📋 Archivos Creados

### API Routes

- `app/api/mercadopago/create-preference/route.ts` - Crea preferencias de pago
- `app/api/mercadopago/webhook/route.ts` - Recibe notificaciones de Mercado Pago

### Componentes

- `components/MercadoPagoButton.tsx` - Botón de pago reutilizable

### Páginas de Resultado

- `app/dashboard/client/payment-success/page.tsx` - Pago exitoso
- `app/dashboard/client/payment-failure/page.tsx` - Pago rechazado
- `app/dashboard/client/payment-pending/page.tsx` - Pago pendiente

---

## 🔑 Paso 1: Obtener Credenciales de Mercado Pago

### Modo de Prueba (Testing)

1. Ingresa a https://www.mercadopago.com.ar/developers/panel
2. En el menú lateral, ve a **"Tus integraciones"**
3. Si no tienes una aplicación, crea una nueva:
   - Nombre: "Personas de Confianza"
   - Descripción: "Plataforma de servicios intermediados"
4. Dentro de tu aplicación, ve a **"Credenciales"**
5. Selecciona la pestaña **"Credenciales de prueba"**
6. Copia las credenciales:
   - **Access Token** (empieza con `TEST-`)
   - **Public Key** (empieza con `TEST-`)

### Modo de Producción (Cuando estés listo)

1. En la misma sección de credenciales, selecciona **"Credenciales de producción"**
2. Completa el proceso de homologación de Mercado Pago
3. Copia las credenciales de producción

---

## ⚙️ Paso 2: Configurar Variables de Entorno

Edita el archivo `.env.local` y reemplaza las credenciales de prueba:

```env
# Mercado Pago - Credenciales de Prueba
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890123456-123456-abcdef1234567890abcdef1234567890-123456789
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890

# URL de tu aplicación (para webhooks y redirecciones)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**

- Nunca subas las credenciales de producción a GitHub
- El Access Token es **privado** (solo se usa en el servidor)
- La Public Key es **pública** (se puede usar en el cliente)

---

## 🧪 Paso 3: Probar con Tarjetas de Prueba

Mercado Pago proporciona tarjetas de prueba para simular pagos:

### Tarjeta Aprobada

- **Número:** 5031 7557 3453 0604
- **Código de seguridad:** 123
- **Fecha de vencimiento:** 11/25
- **Nombre:** APRO

### Tarjeta Rechazada (Fondos insuficientes)

- **Número:** 5031 4332 1540 6351
- **Código de seguridad:** 123
- **Fecha de vencimiento:** 11/25
- **Nombre:** FUND

### Tarjeta Pendiente

- **Número:** 5031 7557 3453 0604
- **Código de seguridad:** 123
- **Fecha de vencimiento:** 11/25
- **Nombre:** PEND

**Más tarjetas de prueba:** https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

---

## 🔌 Paso 4: Integrar el Botón de Pago

### Opción A: En el Dashboard del Cliente

Ejemplo de cómo usar el componente `MercadoPagoButton`:

```tsx
import MercadoPagoButton from "@/components/MercadoPagoButton";
import { useAuth } from "@/components/AuthProvider";

export default function ClientDashboard() {
  const { user } = useAuth();

  // Datos de ejemplo de una solicitud
  const request = {
    id: "abc123",
    title: "Verificar estado de auto en Córdoba",
    amount: 5000, // Precio en pesos argentinos
    status: "accepted", // El representante aceptó el presupuesto
  };

  return (
    <div>
      {/* Mostrar botón solo si el servicio fue aceptado y no está pagado */}
      {request.status === "accepted" && (
        <MercadoPagoButton
          requestId={request.id}
          title={request.title}
          amount={request.amount}
          clientEmail={user?.email || ""}
          clientName={user?.displayName || ""}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all"
        />
      )}
    </div>
  );
}
```

### Opción B: En Modal o Card de Servicio

```tsx
<div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
  <h3 className="font-bold text-xl mb-2">{request.title}</h3>
  <p className="text-3xl font-bold text-primary mb-4">
    ${request.amount.toLocaleString("es-AR")}
  </p>

  <MercadoPagoButton
    requestId={request.id}
    title={request.title}
    amount={request.amount}
    clientEmail={user?.email || ""}
    clientName={user?.displayName || ""}
    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
  />
</div>
```

---

## 🔔 Paso 5: Configurar Webhooks (Para Producción)

Los webhooks permiten que Mercado Pago te notifique cuando cambia el estado de un pago.

### En Desarrollo Local (Testing)

Para probar webhooks en local, necesitas exponer tu servidor local a internet:

1. Instala ngrok: https://ngrok.com/download
2. Ejecuta: `ngrok http 3000`
3. Copia la URL generada (ej: `https://abc123.ngrok.io`)
4. En el panel de Mercado Pago, ve a **Webhooks** y agrega:
   - URL: `https://abc123.ngrok.io/api/mercadopago/webhook`
   - Eventos: `payment`

### En Producción (Deploy)

1. Despliega tu aplicación (Vercel, Railway, etc.)
2. En el panel de Mercado Pago, configura:
   - URL: `https://tudominio.com/api/mercadopago/webhook`
   - Eventos: `payment`

**⚠️ Importante:** La URL del webhook ya está configurada en el código (`create-preference/route.ts`), pero Mercado Pago requiere que también la configures manualmente en su panel para producción.

---

## 📊 Paso 6: Estructura de Datos en Firebase

La integración actualiza automáticamente los documentos en Firebase cuando cambia el estado del pago:

### Campos Agregados a una Solicitud (`requests/{requestId}`)

```typescript
{
  // Campos existentes
  title: string,
  amount: number,
  clientId: string,
  repId: string,
  status: string, // Ahora puede ser: "paid", "payment_pending", "payment_failed"

  // Campos nuevos de Mercado Pago
  paymentId: string,           // ID del pago en Mercado Pago
  paymentStatus: string,        // approved, pending, rejected, etc.
  paymentStatusDetail: string,  // Detalles del estado
  paymentMethod: string,        // visa, master, rapipago, etc.
  paymentAmount: number,        // Monto pagado
  paidAt: Timestamp,           // Fecha de pago aprobado
  paymentUpdatedAt: Timestamp  // Última actualización
}
```

### Estados de una Solicitud

```typescript
// Estados posibles de `status`:
"pending"; // Solicitud publicada, sin asignar
"accepted"; // Representante aceptó, esperando pago
"payment_pending"; // Cliente inició pago, pendiente de aprobación
"paid"; // Pago aprobado, servicio en ejecución
"payment_failed"; // Pago rechazado
"completed"; // Servicio completado, esperando calificación
"finished"; // Todo finalizado, fondos liberados
```

---

## 🔐 Paso 7: Flujo Completo del Pago

### 1. Cliente Acepta Presupuesto

```
Cliente → Hace clic en "Pagar con Mercado Pago"
```

### 2. Crear Preferencia de Pago

```
Frontend → POST /api/mercadopago/create-preference
Backend → Mercado Pago API
Mercado Pago → Devuelve init_point (URL de pago)
Frontend → Redirige al usuario a Mercado Pago
```

### 3. Cliente Completa el Pago

```
Usuario → Completa pago en Mercado Pago
Mercado Pago → Redirige a:
  - /payment-success (aprobado)
  - /payment-failure (rechazado)
  - /payment-pending (pendiente)
```

### 4. Webhook Actualiza Firebase

```
Mercado Pago → POST /api/mercadopago/webhook
Backend → Obtiene datos del pago
Backend → Actualiza Firebase con nuevo estado
```

### 5. Notificación al Representante

```
Firebase → Escucha cambio de estado
App → Notifica al representante que puede comenzar
```

---

## 🎨 Paso 8: Personalizar Páginas de Resultado

Las páginas de éxito, error y pendiente están en:

- `app/dashboard/client/payment-success/page.tsx`
- `app/dashboard/client/payment-failure/page.tsx`
- `app/dashboard/client/payment-pending/page.tsx`

Puedes personalizarlas para:

- Cambiar mensajes
- Agregar tracking de analytics
- Mostrar información adicional del servicio
- Personalizar diseño según tu marca

---

## 🐛 Paso 9: Testing y Debugging

### Ver Logs en Producción

1. En Vercel/Railway, ve a **Logs**
2. Busca errores en las API routes
3. Verifica que los webhooks estén llegando

### Ver Pagos en Mercado Pago

1. Panel de Mercado Pago → **Actividad**
2. Filtra por **Aplicación** (Personas de Confianza)
3. Revisa detalles de cada transacción

### Errores Comunes

| Error                         | Solución                                                           |
| ----------------------------- | ------------------------------------------------------------------ |
| "Invalid access token"        | Verifica que el ACCESS_TOKEN en `.env.local` sea correcto          |
| "Cannot read property 'id'"   | Asegúrate de pasar todos los props requeridos al MercadoPagoButton |
| "Webhook not received"        | Verifica que la URL del webhook sea accesible públicamente         |
| "Payment status not updating" | Revisa que Firebase tenga permisos de escritura                    |

---

## 💰 Paso 10: Liberar Fondos (Manual)

**IMPORTANTE:** En esta implementación de Checkout Pro, los fondos quedan en tu cuenta de Mercado Pago automáticamente al aprobarse el pago.

### Para Transferir al Representante:

1. **Opción Manual** (Actual):
   - Cuando el servicio se completa y hay calificación positiva
   - Transferís manualmente desde tu cuenta de MP a la del representante
   - Descontás tu comisión del 15%

2. **Opción Automatizada** (Futura con Split Payments):
   - Mercado Pago divide automáticamente el pago
   - El representante recibe su parte
   - Vos recibís la comisión
   - Requiere implementar Split Payments

---

## 📱 Paso 11: Próximos Pasos

### Funcionalidades Adicionales a Considerar:

1. **Reembolsos**: Implementar lógica para devolver dinero si se cancela el servicio
2. **Split Payments**: Automatizar la división de fondos (comisión + pago al rep)
3. **Subscripciones**: Si querés cobrar membresías a representantes
4. **Reportes**: Dashboard de transacciones y comisiones
5. **Cuotas**: Permitir que clientes paguen en cuotas (tiene costo adicional)

---

## ❓ FAQ

**¿Cuánto tarda en acreditarse el dinero?**

- Tarjetas: Inmediato (en tu cuenta MP)
- Efectivo: 1-2 días hábiles
- Transferencia: Inmediato

**¿Puedo cambiar el precio después de crear la preferencia?**

- No, debes crear una nueva preferencia con el nuevo monto

**¿Cómo manejo devoluciones?**

- Desde el panel de Mercado Pago puedes hacer refunds manualmente
- También se puede automatizar vía API

**¿Qué pasa si el webhook falla?**

- Mercado Pago lo reintenta automáticamente
- Puedes consultar el estado del pago manualmente vía API

---

## 🆘 Soporte

- **Documentación oficial:** https://www.mercadopago.com.ar/developers/es/docs
- **Foro de desarrolladores:** https://www.mercadopago.com.ar/developers/es/support
- **Status de Mercado Pago:** https://status.mercadopago.com/

---

**Creado:** 11 de Febrero 2026
**Versión:** 1.0 - MVP con Checkout Pro
**Próxima versión:** Split Payments + Automatización de liberación de fondos

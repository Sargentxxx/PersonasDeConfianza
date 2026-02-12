# ✅ Integración de Mercado Pago - Checklist de Implementación

## 📦 Archivos Creados

### Backend (API Routes)

- ✅ `app/api/mercadopago/create-preference/route.ts` - Crea preferencias de pago
- ✅ `app/api/mercadopago/webhook/route.ts` - Recibe notificaciones de MP

### Frontend (Componentes y Páginas)

- ✅ `components/MercadoPagoButton.tsx` - Botón de pago reutilizable
- ✅ `app/dashboard/client/payment-success/page.tsx` - Página de éxito
- ✅ `app/dashboard/client/payment-failure/page.tsx` - Página de error
- ✅ `app/dashboard/client/payment-pending/page.tsx` - Página de pendiente

### Configuración

- ✅ `.env.local` - Variables de entorno (requiere tus credenciales)
- ✅ `package.json` - SDK de Mercado Pago instalado

### Documentación

- ✅ `MERCADOPAGO_GUIA.md` - Guía completa de implementación
- ✅ `EXAMPLE_PAYMENT_INTEGRATION.tsx` - Ejemplos de uso del botón

---

## 🚀 Próximos Pasos (EN ORDEN)

### 1. ⚙️ Obtener Credenciales de Mercado Pago (URGENTE)

**Acción requerida:**

1. Ir a https://www.mercadopago.com.ar/developers/panel
2. Crear una aplicación "Personas de Confianza" (si no existe)
3. Copiar las **credenciales de prueba**:
   - Access Token (empieza con `TEST-`)
   - Public Key (empieza con `TEST-`)
4. Reemplazar en `.env.local`:
   ```env
   MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
   ```

**Estado:** ⏳ PENDIENTE - Requiere acción del usuario

---

### 2. 🧪 Probar Localmente

**Acción requerida:**

1. Asegurarte de que el servidor esté corriendo:
   ```bash
   npm run dev
   ```
2. Abrir el dashboard del cliente
3. Intentar un pago con tarjeta de prueba:
   - **Número:** 5031 7557 3453 0604
   - **CVV:** 123
   - **Vencimiento:** 11/25
   - **Nombre:** APRO

**Resultado esperado:**

- Redirección a Mercado Pago
- Pago exitoso
- Redirección a `/dashboard/client/payment-success`
- Firebase actualizado con `paymentId` y `status: "paid"`

**Estado:** ⏳ PENDIENTE - Requiere testing

---

### 3. 🎨 Integrar Botón en Dashboard del Cliente

**Acción requerida:**

1. Abrir `app/dashboard/client/page.tsx` (o donde muestres las solicitudes)
2. Importar el componente:
   ```tsx
   import MercadoPagoButton from "@/components/MercadoPagoButton";
   ```
3. Usar el botón según los ejemplos en `EXAMPLE_PAYMENT_INTEGRATION.tsx`

**Ejemplo básico:**

```tsx
{
  request.status === "accepted" && !request.paymentId && (
    <MercadoPagoButton
      requestId={request.id}
      title={request.title}
      amount={request.amount}
      clientEmail={user?.email || ""}
      clientName={user?.displayName || ""}
      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl"
    />
  );
}
```

**Estado:** ⏳ PENDIENTE - Requiere integración en UI

---

### 4. 📊 Actualizar Estructura de Firebase

**Acción requerida:**

1. Asegurarte de que los documentos de `requests` permitan los nuevos campos:
   - `paymentId`
   - `paymentStatus`
   - `paymentMethod`
   - `paymentAmount`
   - `paidAt`

**Firebase Security Rules sugeridas:**

```javascript
match /requests/{requestId} {
  allow read: if request.auth != null &&
    (resource.data.clientId == request.auth.uid ||
     resource.data.repId == request.auth.uid);

  allow update: if request.auth != null &&
    (resource.data.clientId == request.auth.uid ||
     request.auth.uid == 'tu-server-uid'); // Para webhooks
}
```

**Estado:** ⏳ PENDIENTE - Verificar permisos

---

### 5. 🔔 Configurar Webhooks (Para Testing Avanzado)

**OPCIONAL para testing local:**

1. Instalar ngrok: https://ngrok.com/download
2. Ejecutar:
   ```bash
   ngrok http 3000
   ```
3. Copiar URL generada (ej: `https://abc123.ngrok.io`)
4. En Mercado Pago → Webhooks → Agregar:
   - URL: `https://abc123.ngrok.io/api/mercadopago/webhook`
   - Eventos: `payment`

**REQUERIDO para producción:**

- Configurar webhook con la URL real de producción

**Estado:** ⏸️ OPCIONAL (por ahora)

---

### 6. 📱 Mejorar UI/UX del Dashboard

**Sugerencias de mejora:**

**A. Indicador visual del estado de pago:**

```tsx
{
  request.status === "accepted" && !request.paymentId && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <p className="text-sm font-semibold text-yellow-800">
        ⏳ Esperando pago para comenzar el servicio
      </p>
    </div>
  );
}

{
  request.status === "paid" && (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
      <p className="text-sm font-semibold text-green-800">
        ✅ Pago confirmado - Servicio en progreso
      </p>
    </div>
  );
}
```

**B. Historial de transacciones:**

- Mostrar lista de pagos realizados
- Detalles de cada pago (método, fecha, monto)
- Link para ver recibo/comprobante

**C. Notificaciones:**

- Notificar al representante cuando se confirma el pago
- Notificar al cliente cuando cambia el estado del pago

**Estado:** ⏳ PENDIENTE - Mejoras de UX

---

### 7. 🔐 Seguridad y Validaciones

**Acción requerida:**

**A. Backend (API Routes):**

- ✅ Ya implementado: Validación de datos en `create-preference`
- ✅ Ya implementado: Verificación de existencia del request en `webhook`

**B. Frontend:**

```tsx
// Validar que solo el cliente pueda pagar su propia solicitud
if (request.clientId !== user?.uid) {
  return null; // No mostrar botón
}

// Validar que el monto sea válido
if (!request.amount || request.amount <= 0) {
  return <div>Error: Monto inválido</div>;
}
```

**C. Firebase Realtime:**

```tsx
// Escuchar cambios en tiempo real para actualizar UI
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "requests", requestId), (doc) => {
    const data = doc.data();
    if (data?.paymentStatus === "approved") {
      // Mostrar notificación de éxito
      toast.success("¡Pago confirmado!");
    }
  });

  return () => unsubscribe();
}, [requestId]);
```

**Estado:** ⚠️ PARCIAL - Requiere validaciones adicionales

---

### 8. 📈 Analytics y Tracking

**Opcional pero recomendado:**

```tsx
// En MercadoPagoButton.tsx
const handlePayment = async () => {
  // Track inicio de pago
  analytics.track("payment_initiated", {
    requestId,
    amount,
    method: "mercadopago",
  });

  // ... resto del código
};

// En payment-success/page.tsx
useEffect(() => {
  analytics.track("payment_completed", {
    requestId,
    paymentId,
    amount,
  });
}, []);
```

**Estado:** ⏸️ OPCIONAL

---

### 9. 🧾 Sistema de Comprobantes

**Funcionalidad a agregar:**

1. Generar PDF de comprobante de pago
2. Enviarlo por email al cliente
3. Permitir descarga desde el dashboard

**Ejemplo de estructura:**

```
Personas de Confianza
Comprobante de Pago

Servicio: Verificar estado de auto
Monto: $5,000
Fecha: 11/02/2026
ID Pago: 123456789
Estado: Aprobado
Método: Visa ****1234

El dinero quedará en custodia hasta la finalización del servicio.
```

**Estado:** ⏸️ FUTURO

---

### 10. 💼 Migración a Producción

**Cuando estés listo para producción:**

**A. Homologación en Mercado Pago:**

1. Completar certificación de integración
2. Obtener credenciales de producción
3. Actualizar `.env.local` → `.env.production`

**B. Configurar Webhooks de Producción:**

```
URL: https://tudominio.com/api/mercadopago/webhook
```

**C. Testing en producción:**

1. Hacer un pago real de bajo monto
2. Verificar que todo funcione
3. Hacer refund si es necesario

**D. Monitoreo:**

- Configurar alertas para errores en webhooks
- Revisar logs de transacciones diariamente

**Estado:** ⏸️ FUTURO (cuando tengas usuarios reales)

---

## 🎯 Prioridades INMEDIATAS

1. **CRÍTICO** ✅ Obtener credenciales de Mercado Pago (Paso 1)
2. **ALTO** ✅ Probar pago local con tarjeta de prueba (Paso 2)
3. **MEDIO** ✅ Integrar botón en dashboard del cliente (Paso 3)
4. **BAJO** ✅ Mejorar UI/UX (Paso 6)

---

## 📝 Notas Importantes

### Sobre la Custodia de Fondos

- El dinero queda en TU cuenta de Mercado Pago
- Debes transferir manualmente al representante después de completado el servicio
- Descuentas tu comisión del 15% antes de transferir

### Sobre Split Payments (Futuro)

- Mercado Pago divide automáticamente el pago
- Requiere implementación adicional
- Costo: ~6.29% + IVA (vs 3.99% actual)
- Lo implementaremos después de validar el modelo

### Sobre Reembolsos

- Se hacen manualmente desde el panel de Mercado Pago
- También se pueden automatizar vía API
- Implementar cuando tengas el primer caso de cancelación

---

## ❓ ¿Necesitas Ayuda?

Si encuentras algún error o tienes dudas:

1. **Revisa `MERCADOPAGO_GUIA.md`** - Documentación completa
2. **Revisa `EXAMPLE_PAYMENT_INTEGRATION.tsx`** - Ejemplos de código
3. **Logs del servidor:** Revisa la consola de Next.js
4. **Logs de Mercado Pago:** Panel → Actividad
5. **Testing:** Usa las tarjetas de prueba del paso 3

---

**Última actualización:** 11 de Febrero 2026, 22:30  
**Estado:** ✅ Implementación Base Completa  
**Próximo hito:** Testing con credenciales reales

# Solución al Error de Login "auth/unauthorized-domain"

El error que ves ("El servicio de autenticación no está disponible temporalmente en este dominio") ocurre por seguridad de Firebase.

**Para solucionarlo:**

1.  Ve a la **Consola de Firebase**: https://console.firebase.google.com/
2.  Selecciona tu proyecto "Personas de Confianza".
3.  En el menú lateral izquierdo, ve a **Authentication** (Autenticación).
4.  Haz clic en la pestaña **Settings** (Configuración).
5.  Busca la sección **Authorized Domains** (Dominios autorizados).
6.  Haz clic en **Add Domain** (Agregar dominio).
7.  Escribe el dominio de Vercel que te dio el error (sin `https://`):
    `personas-de-confianza-6h1a-dtijui2jo.vercel.app`
8.  Haz clic en **Add**.

¡Listo! Espera unos segundos y prueba loguearte de nuevo.

---

# Cambios Realizados

- **Eliminados botones de Apple y Microsoft**: Se limpió la pantalla de inicio de sesión (`app/auth/page.tsx`) dejando solo Google y LinkedIn.
- **Diseño Ajustado**: Se acomodó la grilla de botones para que se vea bien con los elementos restantes.
- **Despliegue**: Los cambios se subieron al repositorio y Vercel debería estar actualizando el sitio automáticamente.

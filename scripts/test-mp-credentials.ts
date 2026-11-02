import { MercadoPagoConfig, Preference } from "mercadopago";

async function testMercadoPago() {
    // Requiere la variable de entorno MP_ACCESS_TOKEN. Nunca hardcodear credenciales.
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        throw new Error("Falta MP_ACCESS_TOKEN. Definila antes de ejecutar este script.");
    }
    console.log("Iniciando prueba con credenciales de producción...");

    const client = new MercadoPagoConfig({
        accessToken: accessToken,
        options: { timeout: 5000 },
    });

    const preference = new Preference(client);

    console.log("Intentando crear una preferencia de prueba...");

    try {
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: "TEST-123",
                        title: "Servicio de Prueba - Antigravity",
                        quantity: 1,
                        unit_price: 100,
                        currency_id: "ARS",
                    },
                ],
                back_urls: {
                    success: "https://example.com/success",
                    failure: "https://example.com/failure",
                    pending: "https://example.com/pending",
                },
                external_reference: "TEST-REF-001",
            },
        });

        console.log("✅ ¡Prueba exitosa!");
        console.log("Preferencia ID:", result.id);
        console.log("URL de Pago (Sandbox):", result.sandbox_init_point);
        console.log("URL de Pago (Producción):", result.init_point);
    } catch (err: unknown) {
        const error = err as { response?: unknown; status?: number; message?: string };
        console.error("❌ Error en la prueba:");
        if (error.response) {
            console.error("Status:", error.status);
            console.error("Detalles:", JSON.stringify(error.response, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testMercadoPago();

import { MercadoPagoConfig, Preference } from "mercadopago";

async function testMercadoPago() {
    // Usando las credenciales proporcionadas por el usuario
    const accessToken = "APP_USR-4763788249855514-021121-ba59146e7cd10911df2c5020a46b1a4b-3166395230";
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
    } catch (error: any) {
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

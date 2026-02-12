import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configuración del cliente de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    options: { timeout: 5000 },
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, title, amount, clientEmail, clientName } = body;

        // Logging para depuración
        console.log("=== MERCADOPAGO CREATE PREFERENCE ===");
        console.log("Body recibido:", JSON.stringify(body, null, 2));
        console.log("requestId:", requestId);
        console.log("title:", title);
        console.log("amount:", amount);
        console.log("clientEmail:", clientEmail);
        console.log("clientName:", clientName);

        // Validación de datos
        if (!requestId || !title || !amount || !clientEmail) {
            console.error("Validación fallida - Datos faltantes:");
            console.error({
                requestId: !!requestId,
                title: !!title,
                amount: !!amount,
                clientEmail: !!clientEmail
            });
            return NextResponse.json(
                { error: "Faltan datos requeridos" },
                { status: 400 }
            );
        }

        // Definir URL base asegurando que no sea undefined
        // En producción, asegúrate de configurar NEXT_PUBLIC_APP_URL con https://tudominio.com
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        console.log("URL Base utilizada:", baseUrl);

        // Crear preferencia de pago
        const preference = new Preference(client);

        const backUrls = {
            success: `${baseUrl}/dashboard/client/payment-success?requestId=${requestId}`,
            failure: `${baseUrl}/dashboard/client/payment-failure?requestId=${requestId}`,
            pending: `${baseUrl}/dashboard/client/payment-pending?requestId=${requestId}`,
        };

        const notificationUrl = `${baseUrl}/api/mercadopago/webhook`;

        console.log("Back URLs:", backUrls);
        console.log("Notification URL:", notificationUrl);

        const preferenceData = {
            items: [
                {
                    id: requestId,
                    title: title,
                    description: `Pago de servicio: ${title}`,
                    quantity: 1,
                    unit_price: Number(amount),
                    currency_id: "ARS",
                },
            ],
            payer: {
                email: clientEmail,
                name: clientName,
            },
            back_urls: backUrls,
            // auto_return: "approved" as const, // Comentado para permitir localhost en desarrollo
            statement_descriptor: "PERSONAS DE CONFIANZA",
            external_reference: requestId,
            notification_url: notificationUrl,
            metadata: {
                request_id: requestId,
            },
        };

        const result = await preference.create({ body: preferenceData });

        return NextResponse.json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
        });
    } catch (error: any) {
        console.error("Error creating Mercado Pago preference:", error);

        // Intentar extraer la mayor cantidad de información posible del error
        const errorResponse = {
            error: "Error al crear la preferencia de pago",
            message: error.message || "Error desconocido",
            cause: error.cause || "No especificada",
            status: error.status,
            name: error.name,
            // Serializar el objeto de error completo si es posible
            fullError: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        };

        return NextResponse.json(
            errorResponse,
            { status: 500 }
        );
    }
}

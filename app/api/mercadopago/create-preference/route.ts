import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Initialize Firebase client SDK (safe to call in server context)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

/**
 * Fetches the commission rate from Firestore config.
 * Falls back to 15% if not configured.
 */
async function getCommissionRate(): Promise<number> {
    try {
        const configDoc = await getDoc(doc(db, "config", "platform"));
        if (configDoc.exists()) {
            const rate = configDoc.data().commissionRate;
            if (typeof rate === "number" && rate > 0 && rate <= 100) {
                return rate;
            }
        }
    } catch (err) {
        console.error("Error fetching commission rate, using default 15%:", err);
    }
    return 15; // default fallback
}

// Configuración del cliente de Mercado Pago
export async function POST(request: NextRequest) {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
        options: { timeout: 5000 },
    });

    try {
        const body = await request.json();
        const { requestId, title, amount, clientEmail, clientName } = body;

        // Logging para depuración
        console.log("=== MERCADOPAGO CREATE PREFERENCE ===");
        console.log("Body recibido:", JSON.stringify(body, null, 2));

        // Validación de datos
        if (!requestId || !title || !amount || !clientEmail) {
            console.error("Validación fallida - Datos faltantes:", {
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

        // Fetch dynamic commission rate from Firestore
        const commissionRate = await getCommissionRate();
        const commissionAmount = Number(amount) * (commissionRate / 100);
        const repAmount = Number(amount) - commissionAmount;

        console.log(`Comisión: ${commissionRate}% → $${commissionAmount.toFixed(2)} (plataforma) / $${repAmount.toFixed(2)} (rep)`);

        // Definir URL base
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        console.log("URL Base utilizada:", baseUrl);

        const preference = new Preference(client);

        const backUrls = {
            success: `${baseUrl}/dashboard/client/payment-success?requestId=${requestId}`,
            failure: `${baseUrl}/dashboard/client/payment-failure?requestId=${requestId}`,
            pending: `${baseUrl}/dashboard/client/payment-pending?requestId=${requestId}`,
        };

        const notificationUrl = `${baseUrl}/api/mercadopago/webhook`;

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
                commission_rate: commissionRate,
                commission_amount: commissionAmount,
                rep_amount: repAmount,
            },
        };

        const result = await preference.create({ body: preferenceData });

        return NextResponse.json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
        });
    } catch (error: unknown) {
        const err = error as Record<string, unknown>;
        console.error("Error creating Mercado Pago preference:", err);

        const errorResponse = {
            error: "Error al crear la preferencia de pago",
            message: (err.message as string) || "Error desconocido",
            cause: err.cause || "No especificada",
            status: err.status,
            name: err.name,
            fullError: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        };

        return NextResponse.json(
            errorResponse,
            { status: 500 }
        );
    }
}

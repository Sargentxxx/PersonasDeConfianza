import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

// Configuración del cliente de Mercado Pago
export async function POST(request: NextRequest) {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    });

    try {
        const body = await request.json();

        console.log("Webhook received from Mercado Pago:", body);

        // Mercado Pago envía notificaciones de diferentes tipos
        // Nos interesan las de tipo "payment"
        if (body.type === "payment") {
            const paymentId = body.data?.id;

            if (!paymentId) {
                return NextResponse.json({ error: "No payment ID" }, { status: 400 });
            }

            // Obtener detalles del pago desde Mercado Pago
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            console.log("Payment data:", paymentData);

            // Obtener la referencia externa (ID de la solicitud)
            const requestId = paymentData.external_reference;

            if (!requestId) {
                console.error("No external reference found in payment");
                return NextResponse.json(
                    { error: "No external reference" },
                    { status: 400 }
                );
            }

            // Actualizar el estado en Firebase según el status del pago
            const requestRef = doc(db, "requests", requestId);

            // Verificar que el documento existe
            const requestDoc = await getDoc(requestRef);
            if (!requestDoc.exists()) {
                console.error("Request not found:", requestId);
                return NextResponse.json(
                    { error: "Request not found" },
                    { status: 404 }
                );
            }

            const updateData: Record<string, any> = {
                paymentId: paymentId,
                paymentStatus: paymentData.status,
                paymentStatusDetail: paymentData.status_detail,
                paymentMethod: paymentData.payment_method_id,
                paymentAmount: paymentData.transaction_amount,
                paymentUpdatedAt: serverTimestamp(),
            };

            // Mapear estados de Mercado Pago a estados de nuestra app
            switch (paymentData.status) {
                case "approved":
                    updateData.status = "paid"; // Pagado, en ejecución
                    updateData.paidAt = serverTimestamp();
                    break;
                case "pending":
                case "in_process":
                    updateData.status = "payment_pending"; // Pago pendiente
                    break;
                case "rejected":
                case "cancelled":
                    updateData.status = "payment_failed"; // Pago rechazado
                    break;
                default:
                    console.log("Unhandled payment status:", paymentData.status);
            }

            await updateDoc(requestRef, updateData);

            console.log("Request updated successfully:", requestId);

            return NextResponse.json({ success: true });
        }

        // Si no es un webhook de pago, simplemente responder OK
        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error processing webhook:", err);
        return NextResponse.json(
            {
                error: "Error processing webhook",
                details: err.message,
            },
            { status: 500 }
        );
    }
}

// Mercado Pago puede enviar webhooks vía GET también (para validación)
export async function GET() {
    return NextResponse.json({ status: "Webhook endpoint ready" });
}

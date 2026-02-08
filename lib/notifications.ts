import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function sendNotification({
    recipientId,
    title,
    message,
    type,
    link = ""
}: {
    recipientId: string;
    title: string;
    message: string;
    type: 'chat' | 'validation' | 'request';
    link?: string;
}) {
    try {
        await addDoc(collection(db, "notifications"), {
            recipientId,
            title,
            message,
            type,
            status: 'unread',
            createdAt: serverTimestamp(),
            link
        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

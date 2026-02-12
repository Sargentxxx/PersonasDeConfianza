const ACCESS_TOKEN = '***REMOVED***';

async function createTestUser() {
    console.log("Creando usuario de prueba en Mercado Pago...");
    
    try {
        const response = await fetch('https://api.mercadopago.com/users/test_user', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                site_id: 'MLA' // Argentina
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("\n✅ Usuario de prueba creado con éxito:");
            console.log("--------------------------------------");
            console.log(`Email de prueba: ${data.email}`);
            console.log(`Contraseña: ${data.password}`);
            console.log("--------------------------------------");
            console.log("\n💡 INSTRUCCIONES:");
            console.log("1. Abre una ventana de INCÓGNITO.");
            console.log("2. Ve a la página de pago de tu app.");
            console.log("3. Inicia sesión con este email y contraseña cuando Mercado Pago te lo pida.");
            console.log("4. Este usuario tiene saldo ficticio para pagar.");
        } else {
            console.error("\n❌ Error al crear usuario de prueba:");
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("\n❌ Error de red:", error.message);
    }
}

createTestUser();

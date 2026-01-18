interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    // Format items list
    const itemsList = data.items
      .map(item => `- ${item.productName} (${item.quantity} unidades)`)
      .join('\n');

    const emailBody = `
Nueva Orden Recibida - Tica Shop 🇨🇷

Número de Orden: #${data.orderId}

INFORMACIÓN DEL CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${data.customerName}
Email: ${data.customerEmail}
${data.customerPhone ? `Teléfono: ${data.customerPhone}` : ''}

DIRECCIÓN DE ENVÍO:
━━━━━━━━━━━━━━━━━━━━━━
${data.shippingAddress}

PRODUCTOS:
━━━━━━━━━━━━━━━━━━━━━━
${itemsList}

RESUMEN:
━━━━━━━━━━━━━━━━━━━━━━
Subtotal: $${data.subtotal.toFixed(2)}
Descuento: -$${data.discount.toFixed(2)}
Envío: $${data.shippingCost.toFixed(2)}
TOTAL: $${data.total.toFixed(2)}

MÉTODO DE PAGO:
━━━━━━━━━━━━━━━━━━━━━━
${data.paymentMethod}
${data.paymentMethod === 'Revolut' ? 'Revolut: +36309975697' : ''}

${data.notes ? `NOTAS:\n━━━━━━━━━━━━━━━━━━━━━━\n${data.notes}\n` : ''}

---
Tica Shop - Productos de Costa Rica 🌴
Tiempo de entrega: 1-2 semanas
    `.trim();

    // Send email to shop owner
    const response = await fetch(process.env.BUILT_IN_FORGE_API_URL + '/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        to: 'comprar@tica-shop.com',
        subject: `Nueva Orden #${data.orderId} - ${data.customerName}`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send order email:', await response.text());
      return false;
    }

    // Send confirmation to customer
    const customerEmailBody = `
¡Gracias por tu pedido en Tica Shop! 🇨🇷

Hola ${data.customerName},

Hemos recibido tu pedido #${data.orderId} y lo procesaremos pronto.

RESUMEN DE TU PEDIDO:
━━━━━━━━━━━━━━━━━━━━━━
${itemsList}

Total: $${data.total.toFixed(2)}

PRÓXIMOS PASOS:
━━━━━━━━━━━━━━━━━━━━━━
1. Recibirás un email con las instrucciones de pago
2. Una vez confirmado el pago, prepararemos tu pedido
3. Te notificaremos cuando tu pedido esté en camino

MÉTODO DE PAGO:
━━━━━━━━━━━━━━━━━━━━━━
${data.paymentMethod === 'Revolut' ? 'Revolut: +36309975697' : data.paymentMethod}

DIRECCIÓN DE ENVÍO:
━━━━━━━━━━━━━━━━━━━━━━
${data.shippingAddress}

⏱️ Tiempo de entrega estimado: 1-2 semanas

Si tienes alguna pregunta, responde a este email.

¡Pura Vida! 🌴

---
Tica Shop
Productos de Costa Rica
    `.trim();

    const customerResponse = await fetch(process.env.BUILT_IN_FORGE_API_URL + '/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        to: data.customerEmail,
        subject: `Confirmación de Pedido #${data.orderId} - Tica Shop`,
        text: customerEmailBody,
      }),
    });

    if (!customerResponse.ok) {
      console.error('Failed to send customer confirmation email:', await customerResponse.text());
    }

    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
}

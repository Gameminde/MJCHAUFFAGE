import { getEmailTransporter, getFromAddress } from '@/config/email';
import { logger } from '@/utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    region?: string;
    country: string;
  };
  paymentMethod: string;
  currency?: string;
}

export class EmailService {
  /**
   * Send a generic email
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = getEmailTransporter();
      const from = getFromAddress();

      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error,
      });
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const subject = `Confirmation de commande #${data.orderNumber} - MJ CHAUFFAGE`;
    const html = this.generateOrderConfirmationHTML(data);
    const text = this.generateOrderConfirmationText(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject,
      text,
      html,
    });
  }

  /**
   * Generate HTML for order confirmation email
   */
  private static generateOrderConfirmationHTML(data: OrderEmailData): string {
    const currency = data.currency || 'DZD';
    const formatPrice = (price: number) => `${price.toFixed(2)} ${currency}`;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .order-number {
      background-color: #eff6ff;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 25px;
    }
    .order-number strong {
      color: #2563eb;
      font-size: 20px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      color: #1e40af;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .items-table th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }
    .total-row.final {
      border-top: 2px solid #d1d5db;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 20px;
      font-weight: bold;
      color: #2563eb;
    }
    .address-box {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .payment-info {
      background-color: #fef3c7;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .footer strong {
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 MJ CHAUFFAGE</h1>
      <p style="margin: 10px 0 0 0; color: #6b7280;">Merci pour votre commande !</p>
    </div>

    <div class="order-number">
      <p style="margin: 0;">Numéro de commande</p>
      <strong>#${data.orderNumber}</strong>
    </div>

    <p style="font-size: 16px;">Bonjour <strong>${data.customerName}</strong>,</p>
    <p>Nous avons bien reçu votre commande et nous vous en remercions. Voici le récapitulatif de votre commande :</p>

    <div class="section">
      <div class="section-title">📦 Articles commandés</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th style="text-align: center;">Quantité</th>
            <th style="text-align: right;">Prix unitaire</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatPrice(item.unitPrice)}</td>
              <td style="text-align: right;"><strong>${formatPrice(item.totalPrice)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="total-section">
      <div class="total-row">
        <span>Sous-total :</span>
        <span>${formatPrice(data.subtotal)}</span>
      </div>
      <div class="total-row">
        <span>Frais de livraison :</span>
        <span>${formatPrice(data.shippingAmount)}</span>
      </div>
      <div class="total-row final">
        <span>Total à payer :</span>
        <span>${formatPrice(data.totalAmount)}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🚚 Adresse de livraison</div>
      <div class="address-box">
        <p style="margin: 0;"><strong>${data.customerName}</strong></p>
        <p style="margin: 5px 0 0 0;">${data.shippingAddress.street}</p>
        <p style="margin: 5px 0 0 0;">${data.shippingAddress.postalCode} ${data.shippingAddress.city}</p>
        ${data.shippingAddress.region ? `<p style="margin: 5px 0 0 0;">${data.shippingAddress.region}</p>` : ''}
        <p style="margin: 5px 0 0 0;">${data.shippingAddress.country}</p>
      </div>
    </div>

    <div class="payment-info">
      <div class="section-title" style="border: none; padding: 0; margin-bottom: 10px;">💳 Mode de paiement</div>
      <p style="margin: 0;"><strong>${data.paymentMethod}</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">
        Vous pouvez payer en espèces ou par carte bancaire lors de la livraison.
      </p>
    </div>

    <div class="section" style="margin-top: 30px;">
      <p style="font-size: 16px;">
        <strong>Que se passe-t-il maintenant ?</strong>
      </p>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Notre équipe prépare votre commande</li>
        <li>Nous vous contacterons pour confirmer la date de livraison</li>
        <li>Votre commande sera livrée à l'adresse indiquée</li>
        <li>Vous effectuerez le paiement à la livraison</li>
      </ol>
    </div>

    <div class="footer">
      <p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter.</p>
      <p style="margin-top: 15px;">
        <strong>MJ CHAUFFAGE</strong><br>
        Email: contact@mjchauffage.dz<br>
        Téléphone: +213 XXX XXX XXX
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text version for order confirmation email
   */
  private static generateOrderConfirmationText(data: OrderEmailData): string {
    const currency = data.currency || 'DZD';
    const formatPrice = (price: number) => `${price.toFixed(2)} ${currency}`;

    const text = `
MJ CHAUFFAGE - Confirmation de commande

Bonjour ${data.customerName},

Nous avons bien reçu votre commande et nous vous en remercions.

Numéro de commande : #${data.orderNumber}

ARTICLES COMMANDÉS
==================
${data.items.map(item => 
  `${item.name}\n  Quantité: ${item.quantity} x ${formatPrice(item.unitPrice)} = ${formatPrice(item.totalPrice)}`
).join('\n\n')}

RÉCAPITULATIF
=============
Sous-total: ${formatPrice(data.subtotal)}
Frais de livraison: ${formatPrice(data.shippingAmount)}
Total à payer: ${formatPrice(data.totalAmount)}

ADRESSE DE LIVRAISON
====================
${data.customerName}
${data.shippingAddress.street}
${data.shippingAddress.postalCode} ${data.shippingAddress.city}
${data.shippingAddress.region || ''}
${data.shippingAddress.country}

MODE DE PAIEMENT
================
${data.paymentMethod}
Vous pouvez payer en espèces ou par carte bancaire lors de la livraison.

QUE SE PASSE-T-IL MAINTENANT ?
==============================
1. Notre équipe prépare votre commande
2. Nous vous contacterons pour confirmer la date de livraison
3. Votre commande sera livrée à l'adresse indiquée
4. Vous effectuerez le paiement à la livraison

Pour toute question concernant votre commande, n'hésitez pas à nous contacter.

MJ CHAUFFAGE
Email: contact@mjchauffage.dz
Téléphone: +213 XXX XXX XXX
    `.trim();

    return text;
  }

  /**
   * Send order status update email
   */
  static async sendOrderStatusUpdate(
    orderNumber: string,
    customerName: string,
    customerEmail: string,
    _oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Votre commande a été confirmée',
      PROCESSING: 'Votre commande est en cours de préparation',
      SHIPPED: 'Votre commande a été expédiée',
      DELIVERED: 'Votre commande a été livrée',
      CANCELLED: 'Votre commande a été annulée',
    };

    const message = statusMessages[newStatus] || 'Votre commande a été mise à jour';
    const subject = `${message} - Commande #${orderNumber}`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mise à jour de commande</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 30px;
    }
    .status-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
    }
    .status-confirmed { background-color: #dbeafe; color: #1e40af; }
    .status-processing { background-color: #fef3c7; color: #92400e; }
    .status-shipped { background-color: #ddd6fe; color: #5b21b6; }
    .status-delivered { background-color: #d1fae5; color: #065f46; }
    .status-cancelled { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #2563eb; margin: 0;">🔥 MJ CHAUFFAGE</h1>
    </div>
    <p style="font-size: 16px;">Bonjour <strong>${customerName}</strong>,</p>
    <p>${message}</p>
    <p style="text-align: center;">
      <span class="status-badge status-${newStatus.toLowerCase()}">${newStatus}</span>
    </p>
    <p>Numéro de commande : <strong>#${orderNumber}</strong></p>
    <p style="margin-top: 30px;">Pour toute question, n'hésitez pas à nous contacter.</p>
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      <p><strong style="color: #2563eb;">MJ CHAUFFAGE</strong><br>
      Email: contact@mjchauffage.dz | Téléphone: +213 XXX XXX XXX</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
MJ CHAUFFAGE - Mise à jour de commande

Bonjour ${customerName},

${message}

Numéro de commande : #${orderNumber}
Nouveau statut : ${newStatus}

Pour toute question, n'hésitez pas à nous contacter.

MJ CHAUFFAGE
Email: contact@mjchauffage.dz
Téléphone: +213 XXX XXX XXX
    `.trim();

    return this.sendEmail({
      to: customerEmail,
      subject,
      text,
      html,
    });
  }
}

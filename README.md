# ENYTM APPARELS — ADVANCED E-COMMERCE

This version adds the missing production architecture requested from the quotation:
- Custom ENYTM black-theme storefront
- Customer registration/login
- Login gate before checkout
- Razorpay checkout + server-side signature verification
- Razorpay webhook endpoint
- Customer order history
- Admin dashboard
- Orders/customer/product/settings views
- Cart + wishlist persistence
- Server-side tracking of logged-in customer cart/wishlist
- 48-hour abandoned cart/wishlist email/WhatsApp reminder job
- WhatsApp integration hooks
- SMTP email integration
- Basic security headers, compression and rate limiting
- SEO-ready HTML metadata
- Free-shipping configuration
- Product stock tracking
- Responsive mobile design

## 1. Install

Install Node.js LTS first:
https://nodejs.org/

Open this folder in VS Code and run:

```powershell
npm.cmd install
```

or, after fixing PowerShell execution policy:

```powershell
npm install
```

## 2. Configure

Copy:

`.env.example` -> `.env`

Then fill in the credentials.

### Razorpay

Use TEST keys first. Create API keys in your Razorpay Dashboard.

Required:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET

The secret must stay server-side. Do not put it in React code.

For the webhook, once the site is publicly deployed, configure:

`https://enytm.co.in/api/webhooks/razorpay`

in Razorpay Dashboard -> Webhooks.

## 3. Run

```powershell
npm run dev
```

Open:

http://localhost:5173

Localhost is only for development.

## 4. Your real domain: enytm.co.in

You cannot make `localhost` become `enytm.co.in` just by changing React code.

You need:
1. Hosting/server for this application.
2. HTTPS/SSL.
3. DNS records at the company where `enytm.co.in` is managed.
4. Point the domain to your deployed server.
5. Set APP_URL=https://enytm.co.in
6. Configure Razorpay webhook using the public HTTPS URL.

Recommended deployment shape:

Browser
  -> https://enytm.co.in
  -> Node/Express server
  -> database/storage
  -> Razorpay / email / WhatsApp APIs

For a real store with significant traffic, replace the included JSON database with PostgreSQL/Supabase or MySQL. The API structure is already separated so this migration can be done without redesigning the storefront.

## 5. Admin panel

Open:

http://localhost:5173/admin

Credentials come from:
ADMIN_EMAIL
ADMIN_PASSWORD

The admin area shows:
- Revenue
- Total orders
- Paid orders
- Customers
- Products
- Pending payments
- Full order list
- Customer list
- Product list
- Store shipping settings

For production, move admin authentication to a proper user/role database and enable 2FA.

## 6. Payment flow

Customer:
Cart -> Checkout -> Login/Register -> Delivery details -> Razorpay -> payment verification -> confirmed order.

The server:
- Creates the Razorpay order.
- Never exposes the Razorpay secret.
- Verifies the Razorpay signature.
- Records payment ID/status/method.
- Decreases product stock.
- Clears the customer's cart.
- Sends confirmation email when SMTP is configured.

Card/UPI credentials are not stored by ENYTM.

## 7. WhatsApp

The project contains a WhatsApp Cloud API adapter.

Set:
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_API_VERSION

For business-initiated reminders, use an approved WhatsApp message template and configure the template name in:

WHATSAPP_TEMPLATE_NAME

The sample reminder code uses a text message adapter for development. Before production, switch the reminder sender to your approved WhatsApp template and follow Meta's current WhatsApp business messaging rules.

## 8. 48-hour reminders

Set:

ENABLE_REMINDER_JOB=true

The server checks hourly. If a logged-in customer has an active cart or wishlist that has not changed for 48+ hours, it can send an email and/or WhatsApp reminder only when the customer has opted in.

This feature needs:
- customer account
- customer phone/email
- notification consent
- publicly deployed server so the scheduled process remains running

## 9. Email

Configure SMTP:

SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
MAIL_FROM

For Gmail, use an App Password rather than your normal Gmail password.

## 10. Screenshot quotation features

The quotation shown in the provided reference includes:
- WordPress/WooCommerce
- responsive design
- product catalog
- cart/checkout
- admin order management
- payment gateway
- WhatsApp
- SEO
- hosting/domain
- homepage banners
- promotions
- speed optimization
- security/backups
- admin training

This project implements the equivalent custom-code architecture for the storefront, checkout, admin, payment, WhatsApp/email notification hooks, SEO basics, performance middleware and security middleware.

Hosting/domain, live payment credentials, Meta/WhatsApp credentials, SMTP credentials and production deployment still require your accounts.

## 11. Important security rule

Never commit `.env` to GitHub.
Never put:
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
WHATSAPP_ACCESS_TOKEN
SMTP_PASS
JWT_SECRET

inside React/frontend files.

## 12. Production checklist

Before launch:
- Replace demo images with ENYTM product photography.
- Set real prices, stock and sizes.
- Add privacy policy.
- Add terms & conditions.
- Add return/refund policy.
- Add shipping policy.
- Add contact/support details.
- Configure GST/invoice requirements.
- Configure Razorpay live keys.
- Configure Razorpay webhook.
- Configure WhatsApp Business.
- Configure SMTP.
- Deploy over HTTPS.
- Point enytm.co.in DNS to hosting.
- Test UPI, card, NetBanking and payment failure.
- Test refund workflow.
- Test login/register.
- Test abandoned cart reminder.
- Test admin permissions.
- Configure automated database backups.

### Current data storage

The starter uses `data/db.json` so it can run immediately without a database server. It is intended for development/small testing. For production, use PostgreSQL/Supabase or another managed database and proper object storage for product images.

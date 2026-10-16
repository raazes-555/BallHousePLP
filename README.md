# Wilson FIBA 3X3 Cash on Delivery Funnel

A production-oriented Cash on Delivery funnel built with Next.js App Router and Tailwind CSS. It includes a responsive product landing page, checkout, thank-you page, a server-side order API, Google Sheets storage, and two HTML email notifications.

## Stack and order flow

- **Next.js App Router + TypeScript** for the pages and server-only API route.
- **Tailwind CSS** plus a focused global design system for the responsive interface.
- **Zod** for backend validation. Browser values such as price and product name are never trusted.
- **Google Sheets API** with a service account for durable order storage.
- **Nodemailer over SMTP** for the business notification and customer confirmation.

When the checkout form is submitted, the browser sends the customer details, selected quantity, delivery area, and a unique submission ID to `POST /api/order`. The server validates the request, identifies the configured product, recalculates the price and delivery fee, creates a stable order ID, appends the order to Google Sheets, then sends both emails. Only after every required action succeeds does the browser redirect to `/thank-you`.

The unique submission ID produces the same order ID on a retry, and the Sheets integration checks that ID before appending. This prevents a network retry from creating a duplicate spreadsheet row. Because Google Sheets and SMTP are separate external systems, they cannot form a true database transaction: if Sheets succeeds and an email provider fails, the API returns an error and logs the failed order ID so the email problem is visible.

## Local setup

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in the environment variables described below.
5. Run `npm run dev`.
6. Open [http://localhost:3000](http://localhost:3000).

Do not commit `.env.local`. It is ignored by Git.

## Environment variables

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BUSINESS_EMAIL=raazes@gmail.com
EMAIL_FROM=raazes@gmail.com
BRAND_NAME=Ball House

GOOGLE_SHEET_ID=
GOOGLE_SHEET_TAB_NAME=Orders
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=raazes@gmail.com
SMTP_PASS=

EMAIL_SERVICE_API_KEY=
FRONTEND_URL=http://localhost:3000
```

`EMAIL_SERVICE_API_KEY` is reserved for a future Resend, Brevo, or SendGrid adapter and is not needed when SMTP is used. For Gmail, `SMTP_PASS` should be a Google App Password, not the normal Gmail password. The Google private key may contain literal `\n` characters; the server converts them to line breaks.

## Google Spreadsheet setup

1. Create a Google Spreadsheet. The app creates the configured order tab automatically if it does not exist.
2. Put the desired tab name in `GOOGLE_SHEET_TAB_NAME`; `Orders` is recommended.
3. Copy the spreadsheet ID from its URL. In `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`, the value between `/d/` and `/edit` is the ID. Add it to `GOOGLE_SHEET_ID`.
4. In Google Cloud Console, create or choose a project, enable the **Google Sheets API**, create a **Service Account**, and create a JSON key for it.
5. Copy `client_email` from the JSON file to `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` to `GOOGLE_PRIVATE_KEY`.
6. Open the spreadsheet’s Share dialog and share it with the service account email as an **Editor**.
7. On the first successful order attempt, the API creates and styles the tab with a frozen header, tailored column widths, alternating row colors, NPR number formats, a filter, status dropdowns, and color-coded order statuses.

Expected columns, in order:

1. Order ID
2. Date & Time
3. Customer Name
4. Phone Number
5. Email Address
6. Exact Location
7. Product Name
8. Quantity
9. Price Per Piece
10. Delivery Zone
11. Delivery Fee
12. Total Price
13. Payment Method
14. Order Status
15. Notes

If you create headers manually, use those exact names and order. To configure Sheets manually, select row 1 and choose **View → Freeze → 1 row**, then **Data → Create a filter**. For the `Order Status` column, choose **Data → Data validation → Dropdown** and add:

- New Order
- Order Confirmed
- Order Ongoing
- Delivered
- Cancelled

## Gmail SMTP setup

1. Enable two-step verification on the Google account used to send email.
2. Create a Google **App Password** for Mail.
3. Use `smtp.gmail.com` as `SMTP_HOST`, `465` as `SMTP_PORT`, the Gmail address as `SMTP_USER`, and the 16-character app password as `SMTP_PASS`.
4. Set `EMAIL_FROM` to the same authenticated Gmail address unless the SMTP account is configured to send from another verified address.
5. Set `BUSINESS_EMAIL` to the inbox that should receive new-order notifications.

The backend sends both messages with responsive, table-based HTML and a plain-text fallback. Credentials and private keys are imported only by server modules and are never bundled into frontend JavaScript.

## Testing the complete order flow

1. Run `npm run typecheck` and `npm run build`.
2. Start the app with `npm run dev` and select a quantity on the landing page.
3. Open checkout and verify the product, quantity, price per piece, delivery fee, and total.
4. Submit a real test order using an email inbox you can inspect.
5. Confirm all four success conditions:
   - A new row appears in the configured Google Sheet.
   - `BUSINESS_EMAIL` receives the new-order notification.
   - The customer email receives the order confirmation.
   - The browser redirects to the thank-you page with the correct order ID and total.
6. Submit invalid data to verify inline validation. Temporarily use an invalid SMTP password to verify that the API shows an error and does not redirect.

Without valid Google and SMTP credentials, the pages will still render, but an order intentionally returns a clear error instead of pretending it succeeded.

## Deploying to Vercel later

1. Push the project to a private Git repository.
2. Import that repository into Vercel as a Next.js project.
3. Add every value from `.env.example` in **Project Settings → Environment Variables**. For production, set both `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to the exact `https://` production domain.
4. Keep the private key quoted with `\n` line breaks if pasting it on one line.
5. Deploy, then repeat the complete order-flow test against the production URL.
6. If using a custom domain, update `FRONTEND_URL` and redeploy so origin checks accept that domain.

The API route uses the Node.js runtime and is compatible with Vercel serverless functions. No separate backend or CORS configuration is needed for the normal same-origin frontend.

## Content notes

- Product content and pricing are centralized in `lib/product.ts` for easy editing.
- The reels section is intentionally omitted because no reel links were supplied.
- Product images are optimized PNG files in `public/images`.
- The testimonials are explicitly marked as sample preview content. Replace them with verified customer reviews before public launch.

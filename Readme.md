# Little Luxury — Boutique Storefront

Official website for **Little Luxury** tailoring studio. A GitHub Pages–ready
site with three tabs (New Arrival, Location, Contact Support), a shopping
cart, and a Razorpay-based checkout.

## Files
```
index.html      — the whole site (all three tabs, cart, checkout, receipt)
style.css       — all styling
script.js       — cart, checkout, and order-confirmation logic
images/         — your uploaded photos (instagram.jpg, product photos)
```

## Publishing on GitHub Pages
1. Put all four items above at the **root** of your repo (not inside a
   sub-folder), replacing what's there now.
2. Commit and push.
3. In the repo → **Settings → Pages**, set the source to your default
   branch, root folder. Your site will be live at the same GitHub Pages URL
   you already have.

## Updating products
Open `script.js` and edit the `PRODUCTS` array near the top:
```js
{ id: "p1", name: "Elegant Silk Blouse", price: 1800, image: "images/1000003487.jpg" }
```
- **To swap a photo:** replace the file inside `images/` but keep the exact
  same filename — the product on the site updates automatically.
- **To add a new product:** copy one of the objects, give it a new `id`, and
  add the photo to `images/`.
- I named your second new-arrival item **"Rust Silk Ghagra Choli"** as a
  placeholder since you hadn't given a name yet — rename it any time.

## About the Razorpay checkout — please read this part
Your site is a **static** site (plain HTML/CSS/JS hosted on GitHub Pages).
That means there is no server running behind it, which has two real
consequences worth understanding before you go live:

1. **Payment happens on Razorpay's page, not yours.** The "Pay Now" button
   opens your existing payment link (`razorpay.me/@poonamshailendranazare`)
   in a new tab with the order amount attached. I could not confirm from
   here whether razorpay.me links honor the `?amount=` prefill for every
   account — please test a small payment yourself and adjust the amount
   manually on the Razorpay page if it doesn't carry over correctly.
2. **The site can't automatically know a payment succeeded.** A real
   "payment received → auto-send invoice" pipeline needs a server to
   receive Razorpay's payment webhook and verify it — something a GitHub
   Pages site cannot run. So instead, after paying, the customer taps
   **"I've Completed My Payment"**, which:
   - Shows an on-screen receipt with an Order ID.
   - Sends the order automatically by email, **if you finish the EmailJS
     setup below** (takes about 10 minutes, free).
   - Also gives the customer one-tap WhatsApp/email buttons to send you the
     order directly, as a backup in case email delivery ever fails.

This is the most reliable version of "automatic receipts" achievable
without paying for server hosting. If you ever want true payment
verification (impossible to fake or skip confirming), that requires a small
backend — happy to help you build that later if your shop grows into it.

### Registering / using Razorpay from your phone
You mentioned not being registered yet — a couple of clarifying notes:
- The link you gave me (`razorpay.me/@poonamshailendranazare`) is already a
  live Razorpay Payment Page, so that account is registered.
- If you want your **own** Razorpay account instead (recommended, since
  payouts should go to your own bank account), sign up at
  **dashboard.razorpay.com** with your mobile number, complete the basic KYC
  (PAN + bank account details for a proprietorship/individual), and Razorpay
  will give you your own `razorpay.me/@yourname` link. Swap that into
  `RAZORPAY_LINK` at the top of `script.js`.
- Cash on Delivery has been removed everywhere, per your instructions — the
  About Us section and checkout page both state prepaid-only.

### EmailJS setup (for automatic emails)
1. Create a free account at **emailjs.com** (100 emails/month free).
2. Add an **Email Service** connected to your Gmail
   (`shailendranazare1@gmail.com`).
3. Create two **Email Templates**:
   - one addressed to `shailendranazare1@gmail.com` (order notification)
   - one addressed to `{{customer_email}}` (customer receipt)
   - Both templates can use these variables, all sent automatically by the
     site: `{{order_id}}`, `{{order_date}}`, `{{customer_name}}`,
     `{{customer_email}}`, `{{customer_phone}}`, `{{delivery_address}}`,
     `{{items_list}}`, `{{total_amount}}`.
4. Copy your **Public Key**, **Service ID**, and both **Template IDs** into
   the `EMAILJS_CONFIG` object at the top of `script.js`, then set
   `enabled: true`.

Until you do this, the site still works perfectly — customers just use the
WhatsApp/email buttons on the receipt screen instead of getting an
automatic email.

## Contact & location details already wired in
- Phone / WhatsApp: +91 93222 89023 and +91 93593 37552
- Support email: shailendranazare1@gmail.com
- Instagram: your QR code image, linking to @litt.leluxy
- Location tab: map + "Get Directions" button pointing at your shared Google
  Maps link (Vaishnavi Ladies Tailor Boutique, Pune)

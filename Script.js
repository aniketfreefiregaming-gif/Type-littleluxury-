/* ============================================================
   LITTLE LUXURY — STORE LOGIC
   Cart (localStorage) + Checkout + Razorpay redirect +
   best-effort automated order confirmation (EmailJS).
   See README.md for what "automatic" means on a static site
   with no backend server, and how to finish the EmailJS setup.
   ============================================================ */

/* ---------- 1. FILL THESE IN (see README "EmailJS setup") ---------- */
const EMAILJS_CONFIG = {
    enabled: false,                 // set to true once you've added your keys below
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    ownerTemplateId: "YOUR_OWNER_TEMPLATE_ID",     // sends the order to shailendranazare1@gmail.com
    customerTemplateId: "YOUR_CUSTOMER_TEMPLATE_ID" // sends the receipt to the customer
};
const SHOP_OWNER_EMAIL = "shailendranazare1@gmail.com";
const SHOP_WHATSAPP_NUMBER = "919322289023"; // used for the pre-filled "send my order" message
const RAZORPAY_LINK = "https://razorpay.me/@poonamshailendranazare";

if (EMAILJS_CONFIG.enabled && window.emailjs) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

/* ---------- 2. PRODUCTS ----------
   Swap the photo file (keep the same filename) to update the picture
   without touching this code. Edit name/price directly below. */
const PRODUCTS = [
    {
        id: "p1",
        name: "Elegant Silk Blouse",
        price: 1800,
        image: "images/1000003487.jpg"
    },
    {
        id: "p2",
        // Suggested name — rename any time, this is just a placeholder.
        name: "Rust Silk Ghagra Choli",
        price: 3200,
        image: "images/1000003489.jpg"
    }
];

/* ---------- 3. CART STATE (persisted in this browser) ---------- */
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("ll_cart")) || [];
    } catch (e) {
        return [];
    }
}
function saveCart(cart) {
    localStorage.setItem("ll_cart", JSON.stringify(cart));
}
let cart = loadCart();

function findProduct(id) {
    return PRODUCTS.find(p => p.id === id);
}

function addToCart(id) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, qty: 1 });
    }
    saveCart(cart);
    renderCart();
    openCart();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart(cart);
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
}

function cartTotal() {
    return cart.reduce((sum, item) => {
        const p = findProduct(item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);
}

function formatINR(amount) {
    return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------- 4. RENDERING ---------- */
function renderProductGrid() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = PRODUCTS.map(p => `
        <div class="shop-card">
            <div class="img-wrapper">
                <span class="new-tag">New</span>
                <img src="${p.image}" alt="${p.name}">
            </div>
            <h3>${p.name}</h3>
            <p class="price">${formatINR(p.price)}</p>
            <button class="btn-buy" onclick="addToCart('${p.id}')">Add To Cart</button>
        </div>
    `).join("") + `
        <div class="shop-card coming-soon-card">
            <div class="img-wrapper"><span>More Coming Soon</span></div>
        </div>
    `;
}

function renderCart() {
    const list = document.getElementById("cart-items-list");
    const countBadge = document.getElementById("cart-count-badge");
    const totalItems = cart.reduce((n, i) => n + i.qty, 0);

    if (countBadge) {
        countBadge.style.display = totalItems > 0 ? "flex" : "none";
        countBadge.innerText = totalItems;
    }

    if (cart.length === 0) {
        list.innerHTML = `<p class="cart-empty-msg">Your cart is empty.</p>`;
    } else {
        list.innerHTML = cart.map(item => {
            const p = findProduct(item.id);
            if (!p) return "";
            return `
                <div class="cart-line-item">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="cart-line-details">
                        <h4>${p.name}</h4>
                        <div class="cart-line-price">${formatINR(p.price)}</div>
                        <div class="qty-control">
                            <button onclick="updateQty('${p.id}', -1)">−</button>
                            <span>${item.qty}</span>
                            <button onclick="updateQty('${p.id}', 1)">+</button>
                        </div>
                        <button class="cart-line-remove" onclick="removeFromCart('${p.id}')">Remove</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    document.getElementById("cart-subtotal-amount").innerText = formatINR(cartTotal());
}

/* ---------- 5. CART DRAWER OPEN/CLOSE ---------- */
function openCart() {
    document.getElementById("cart-overlay").classList.add("open");
    document.getElementById("cart-drawer").classList.add("open");
}
function closeCart() {
    document.getElementById("cart-overlay").classList.remove("open");
    document.getElementById("cart-drawer").classList.remove("open");
}

/* ---------- 6. TABS ---------- */
function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-link").forEach(el => el.classList.remove("active"));
    document.getElementById("tab-" + tabName).classList.add("active");
    const btn = document.querySelector(`.tab-link[data-tab="${tabName}"]`);
    if (btn) btn.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- 7. CHECKOUT ---------- */
function openCheckoutFromCart() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add a product before checking out.");
        return;
    }
    closeCart();
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.getElementById("checkout-view-container").style.display = "block";

    const sidebar = document.getElementById("checkout-sidebar-items");
    sidebar.innerHTML = cart.map(item => {
        const p = findProduct(item.id);
        return `
            <div class="sidebar-item-flexrow">
                <div class="sidebar-item-leftbox">
                    <div class="sidebar-img-wrapper">
                        <img src="${p.image}" alt="${p.name}">
                        <div class="sidebar-badge-count">${item.qty}</div>
                    </div>
                    <div class="sidebar-item-title-txt">${p.name}</div>
                </div>
                <div class="sidebar-item-price-txt">${formatINR(p.price * item.qty)}</div>
            </div>
        `;
    }).join("");

    const total = cartTotal();
    document.getElementById("chk-subtotal").innerText = formatINR(total);
    document.getElementById("chk-grand-total").innerText = formatINR(total);

    document.getElementById("confirm-payment-box").style.display = "none";
    document.getElementById("pay-now-btn").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeCheckout() {
    document.getElementById("checkout-view-container").style.display = "none";
    switchTab("new-arrival");
}

function validateCheckoutForm() {
    const requiredIds = ["chk-name", "chk-email", "chk-phone", "chk-address", "chk-city", "chk-state", "chk-pincode"];
    for (const id of requiredIds) {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.focus();
            alert("Please fill in all delivery and contact details before paying.");
            return false;
        }
    }
    return true;
}

function payNow() {
    if (!validateCheckoutForm()) return;

    const total = cartTotal();
    // Best-effort amount prefill. Razorpay Payment Pages (razorpay.me links)
    // generally accept ?amount= in rupees, but this isn't guaranteed for
    // every account — double check the opened page shows the right amount.
    const payUrl = `${RAZORPAY_LINK}?amount=${total.toFixed(2)}`;
    window.open(payUrl, "_blank");

    // Reveal the manual confirmation step, since a static site has no way
    // to automatically detect that the Razorpay payment succeeded.
    document.getElementById("pay-now-btn").style.display = "none";
    document.getElementById("confirm-payment-box").style.display = "block";
}

/* ---------- 8. ORDER CONFIRMATION ---------- */
function buildOrderId() {
    const d = new Date();
    return "LL" + d.getFullYear().toString().slice(-2) +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0") + "-" +
        Math.floor(1000 + Math.random() * 9000);
}

function confirmPayment() {
    const name = document.getElementById("chk-name").value.trim();
    const email = document.getElementById("chk-email").value.trim();
    const phone = document.getElementById("chk-phone").value.trim();
    const address = document.getElementById("chk-address").value.trim();
    const city = document.getElementById("chk-city").value.trim();
    const state = document.getElementById("chk-state").value.trim();
    const pincode = document.getElementById("chk-pincode").value.trim();
    const total = cartTotal();
    const orderId = buildOrderId();
    const dateStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    const itemsText = cart.map(item => {
        const p = findProduct(item.id);
        return `${p.name} x${item.qty} — ${formatINR(p.price * item.qty)}`;
    }).join("\n");

    const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;

    // ----- Receipt shown on screen -----
    document.getElementById("receipt-box").innerHTML = `
        <div class="receipt-row"><span>Order ID</span><span>${orderId}</span></div>
        <div class="receipt-row"><span>Date</span><span>${dateStr}</span></div>
        <div class="receipt-row"><span>Customer</span><span>${name}</span></div>
        <div class="receipt-row"><span>Delivery Address</span><span style="text-align:right;max-width:60%;">${fullAddress}</span></div>
        <div class="receipt-row"><span>Amount Paid</span><span>${formatINR(total)}</span></div>
        <div class="receipt-row"><span>Status</span><span class="status-badge">Confirmed</span></div>
    `;

    // ----- Pre-filled WhatsApp message to the shop -----
    const waMessage = encodeURIComponent(
        `New Order — Little Luxury\nOrder ID: ${orderId}\nName: ${name}\nPhone: ${phone}\nAddress: ${fullAddress}\n\nItems:\n${itemsText}\n\nTotal Paid: ${formatINR(total)}\nPaid via Razorpay.`
    );
    document.getElementById("receipt-whatsapp-link").href = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${waMessage}`;

    // ----- Pre-filled email to the shop -----
    const mailSubject = encodeURIComponent(`New Order Received — ${orderId}`);
    const mailBody = encodeURIComponent(
        `Order ID: ${orderId}\nDate: ${dateStr}\n\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${fullAddress}\n\nItems:\n${itemsText}\n\nTotal Paid: ${formatINR(total)}\nPayment: Razorpay`
    );
    document.getElementById("receipt-email-link").href = `mailto:${SHOP_OWNER_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

    // ----- Automatic emails, only if EmailJS has been configured -----
    if (EMAILJS_CONFIG.enabled && window.emailjs) {
        const templateParams = {
            order_id: orderId,
            order_date: dateStr,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            delivery_address: fullAddress,
            items_list: itemsText,
            total_amount: formatINR(total),
            shop_owner_email: SHOP_OWNER_EMAIL
        };
        emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.ownerTemplateId, templateParams);
        emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.customerTemplateId, templateParams);
    }

    // Clear the cart now that the order is placed
    cart = [];
    saveCart(cart);
    renderCart();

    document.getElementById("checkout-view-container").style.display = "none";
    document.getElementById("success-modal").classList.add("open");
}

function closeSuccessModal() {
    document.getElementById("success-modal").classList.remove("open");
    switchTab("new-arrival");
}

/* ---------- 9. INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
    renderProductGrid();
    renderCart();
});

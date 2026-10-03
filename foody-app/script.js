/* Foody — developed by the Harsha team */
/* ===== Git repository info (edit REPO_URL to your own GitHub address) ===== */
const REPO_URL = "https://github.com/harsha-team/foody-food-delivery";
window.foodyRepository = {
  name: "foody-food-delivery",
  app: "Foody",
  team: "Harsha",
  branch: "main",
  url: REPO_URL,
  clone: "git clone " + REPO_URL + ".git",
  files: ["index.html", "style.css", "script.js", "README.md", ".gitignore"]
};

/* ===== Simulated role accounts ===== */
const ACCOUNTS = {
  admin:   { username: "admin",   password: "admin123",   label: "Admin" },
  user:    { username: "user",    password: "user123",    label: "User" },
  manager: { username: "manager", password: "manager123", label: "Manager" }
};

/* ===== Global state (inspect in DevTools console) ===== */
window.adminModuleData = {
  customers: [
    { id: 1, name: "Aarav Reddy", email: "aarav@example.com", joined: "2026-01-14", orders: 3 },
    { id: 2, name: "Meera Iyer", email: "meera@example.com", joined: "2026-02-02", orders: 5 },
    { id: 3, name: "Rohan Shah", email: "rohan@example.com", joined: "2026-03-19", orders: 1 },
    { id: 4, name: "Sana Khan", email: "sana@example.com", joined: "2026-05-07", orders: 2 },
    { id: 5, name: "Vikram Rao", email: "vikram@example.com", joined: "2026-06-21", orders: 0 }
  ],
  totalCustomers: 0,
  activeOrders: 0,
  totalOrders: 0
};

window.userModuleData = {
  currentUser: "Aarav Reddy",
  menu: [
    { id: 101, name: "Hyderabadi Chicken Biryani", price: 289, emoji: "🍛", desc: "Dum-cooked basmati, raita on the side." },
    { id: 102, name: "Paneer Butter Masala", price: 229, emoji: "🧀", desc: "Creamy tomato gravy with soft paneer." },
    { id: 103, name: "Masala Dosa", price: 119, emoji: "🥞", desc: "Crisp dosa, potato filling, two chutneys." },
    { id: 104, name: "Margherita Pizza", price: 249, emoji: "🍕", desc: "Wood-fired, fresh basil and mozzarella." },
    { id: 105, name: "Veg Burger Combo", price: 179, emoji: "🍔", desc: "Burger, fries and a small drink." },
    { id: 106, name: "Gulab Jamun (4 pcs)", price: 89, emoji: "🍮", desc: "Warm, syrup-soaked and soft." }
  ],
  cart: [],
  deliveryFee: 40,
  freeDeliveryAbove: 500,
  discount: 0,
  appliedCode: null,
  restaurants: [
    { name: "Paradise Dum House", cuisine: "Biryani, Mughlai", eta: "30 min", rating: 4.6, emoji: "🍲" },
    { name: "Udupi Sunrise", cuisine: "South Indian", eta: "20 min", rating: 4.4, emoji: "🥥" },
    { name: "Oven & Ember", cuisine: "Pizza, Italian", eta: "35 min", rating: 4.3, emoji: "🔥" },
    { name: "Green Tiffin", cuisine: "Vegetarian", eta: "25 min", rating: 4.5, emoji: "🥗" },
    { name: "Sweet Tooth Corner", cuisine: "Desserts, Bakery", eta: "15 min", rating: 4.7, emoji: "🧁" },
    { name: "Burger Barn", cuisine: "Burgers, Fries", eta: "28 min", rating: 4.1, emoji: "🍟" }
  ],
  offers: [
    { role: "Admin", title: "Welcome waiver", desc: "Platform fee waived for newly registered customers.", code: "ADMIN50", type: "info" },
    { role: "Admin", title: "Loyalty reward", desc: "Free dessert for customers with 5+ orders.", code: "LOYAL5", type: "info" },
    { role: "User", title: "Flat ₹50 off", desc: "On any order above ₹300.", code: "SAVE50", type: "flat", value: 50, min: 300 },
    { role: "User", title: "10% off your feast", desc: "Up to ₹100 off on orders above ₹200.", code: "FEAST10", type: "percent", value: 10, min: 200 },
    { role: "Manager", title: "Rush-hour priority", desc: "Priority cooking slot for orders added in the pipeline.", code: "MGR20", type: "info" },
    { role: "Manager", title: "Zero-reject week", desc: "Accept every order for a week to earn a badge.", code: "ZEROREJECT", type: "info" }
  ]
};

window.managerModuleData = {
  statuses: ["Pending", "Cooking", "Out for Delivery", "Delivered"],
  orders: [
    { id: 9001, customer: "Meera Iyer", items: "Masala Dosa x2", total: 238, status: "Cooking", decision: "Accepted" },
    { id: 9002, customer: "Rohan Shah", items: "Margherita Pizza x1", total: 249, status: "Pending", decision: null }
  ],
  nextOrderId: 9003
};

/* ===== Helpers ===== */
const A = window.adminModuleData, U = window.userModuleData, M = window.managerModuleData;
const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + Number(n).toFixed(2);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const session = { role: null };
let loginTarget = null, afterLogin = null, toastTimer;

/* ===== Local persistence (browser localStorage) ===== */
const STORAGE_KEY = "foody-data-v1";
const SEED = JSON.stringify({ customers: A.customers, cart: U.cart, orders: M.orders, nextOrderId: M.nextOrderId });

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      customers: A.customers, cart: U.cart, appliedCode: U.appliedCode, orders: M.orders, nextOrderId: M.nextOrderId
    }));
  } catch (err) { console.warn("Foody: could not save to local storage.", err); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (Array.isArray(d.customers)) A.customers = d.customers;
    if (Array.isArray(d.cart)) U.cart = d.cart;
    U.appliedCode = d.appliedCode || null;
    if (Array.isArray(d.orders)) M.orders = d.orders;
    if (d.nextOrderId) M.nextOrderId = d.nextOrderId;
    return true;
  } catch (err) { console.warn("Foody: saved data was unreadable, using defaults.", err); return false; }
}

window.resetFoodyData = function () {
  try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
  location.reload();
};

const restored = loadState();

function logState(label) {
  saveState();
  console.log("%cFoody%c " + label, "background:#ff3d81;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700", "");
  console.log("window.adminModuleData", window.adminModuleData);
  console.log("window.userModuleData", window.userModuleData);
  console.log("window.managerModuleData", window.managerModuleData);
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

const isActive = (o) => o.decision !== "Rejected" && o.status !== "Delivered";

function syncAdminMetrics() {
  A.totalCustomers = A.customers.length;
  A.totalOrders = M.orders.length;
  A.activeOrders = M.orders.filter(isActive).length;
}

/* ===== Navigation and access control ===== */
function showView(name) {
  if (["admin", "user", "manager"].includes(name) && session.role !== name) { openLogin(name); return; }
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  const navName = ["admin", "user", "manager"].includes(name) ? "home" : name;
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.nav === navName));
  if (name === "cart") renderCart();
  window.scrollTo(0, 0);
}

function openLogin(role, next) {
  loginTarget = role;
  afterLogin = next || role;
  $("loginTitle").textContent = ACCOUNTS[role].label + " sign in";
  $("loginIcon").textContent = { admin: "🛡️", user: "🍽️", manager: "👨‍🍳" }[role];
  $("loginHint").textContent = "Demo credentials: " + ACCOUNTS[role].username + " / " + ACCOUNTS[role].password;
  $("lUser").value = ""; $("lPass").value = ""; $("loginMsg").textContent = "";
  $("loginOverlay").hidden = false;
  $("lUser").focus();
}

function closeLogin() { $("loginOverlay").hidden = true; loginTarget = null; }

function updateSessionUI() {
  $("sessionBox").hidden = !session.role;
  if (session.role) $("sessionLabel").textContent = "Signed in as " + ACCOUNTS[session.role].label;
}

function login(e) {
  e.preventDefault();
  const acc = ACCOUNTS[loginTarget];
  if ($("lUser").value.trim() === acc.username && $("lPass").value === acc.password) {
    session.role = loginTarget;
    const next = afterLogin;
    closeLogin();
    updateSessionUI();
    renderAll();
    showView(next);
    toast("Signed in as " + acc.label);
    logState("Login: " + acc.label);
  } else {
    $("loginMsg").textContent = "Wrong username or password. Check the demo credentials above and try again.";
    $("lPass").value = ""; $("lPass").focus();
  }
}

function logout() {
  session.role = null;
  updateSessionUI();
  showView("home");
  toast("Logged out");
  logState("Logout");
}

/* ===== Renderers ===== */
function renderAdmin() {
  syncAdminMetrics();
  $("mCustomers").textContent = A.totalCustomers;
  $("mActive").textContent = A.activeOrders;
  $("mTotal").textContent = A.totalOrders;
  $("customerBody").innerHTML = A.customers.map((c) =>
    "<tr><td>#" + c.id + "</td><td>" + esc(c.name) + "</td><td>" + esc(c.email) + "</td><td>" + c.joined + "</td><td>" + c.orders + "</td></tr>").join("");
}

function renderMenu() {
  $("foodGrid").innerHTML = U.menu.map((f, i) =>
    '<article class="card"><div class="card-art" style="--h:' + (i * 57 + 8) + '">' + f.emoji + '</div><div class="card-body"><h3>' + esc(f.name) + "</h3><p>" + esc(f.desc) +
    '</p><div class="card-foot"><span class="price">' + money(f.price) + '</span><button class="btn primary small" data-add="' + f.id + '">Add to Cart</button></div></div></article>').join("");
}

function renderRestaurants() {
  $("restaurantGrid").innerHTML = U.restaurants.map((r, i) =>
    '<article class="card"><div class="card-art" style="--h:' + (i * 57 + 200) + '">' + r.emoji + '</div><div class="card-body"><h3>' + esc(r.name) + "</h3><p>" + esc(r.cuisine) +
    '</p><div class="card-foot"><span class="rating">★ ' + r.rating + "</span><span>" + r.eta + "</span></div></div></article>").join("");
}

function renderOffers() {
  $("offerGrid").innerHTML = U.offers.map((o) =>
    '<article class="card voucher"><div class="card-body"><span class="role-tag ' + o.role + '">' + o.role + "</span><h3>" + esc(o.title) + "</h3><p>" + esc(o.desc) +
    '</p><div class="card-foot"><span class="code">' + o.code + "</span>" +
    (o.type === "info" ? "" : '<button class="btn small" data-code="' + o.code + '">Apply</button>') + "</div></div></article>").join("");
}

function renderOrders() {
  const body = $("orderBody");
  if (!M.orders.length) { body.innerHTML = '<tr><td colspan="6" class="empty">No orders yet. Add one above or wait for a customer checkout.</td></tr>'; return; }
  body.innerHTML = M.orders.map((o) => {
    const rejected = o.decision === "Rejected";
    const label = rejected ? "Rejected" : o.status;
    const opts = M.statuses.map((s) => "<option" + (s === o.status ? " selected" : "") + ">" + s + "</option>").join("");
    return "<tr><td>#" + o.id + "</td><td>" + esc(o.customer) + "</td><td>" + esc(o.items) + "</td><td>" + money(o.total) +
      '</td><td><span class="pill ' + label.replace(/ /g, "-") + '">' + label + '</span></td><td><div class="actions">' +
      '<button class="btn ok small" data-accept="' + o.id + '"' + (rejected || o.decision === "Accepted" ? " disabled" : "") + ">Accept</button>" +
      '<button class="btn bad small" data-reject="' + o.id + '"' + (rejected ? " disabled" : "") + ">Reject</button>" +
      '<select data-status="' + o.id + '" aria-label="Update status for order ' + o.id + '"' + (rejected ? " disabled" : "") + ">" + opts + "</select></div></td></tr>";
  }).join("");
}

function computeTotals() {
  const sub = U.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = sub === 0 || sub >= U.freeDeliveryAbove ? 0 : U.deliveryFee;
  const v = U.offers.find((o) => o.code === U.appliedCode);
  let disc = 0;
  if (v && sub >= (v.min || 0)) disc = v.type === "flat" ? v.value : Math.min(100, sub * v.value / 100);
  U.discount = disc;
  return { sub, fee, disc, total: Math.max(0, sub + fee - disc) };
}

function renderCart() {
  $("cartBody").innerHTML = U.cart.length ? U.cart.map((i) =>
    "<tr><td>" + esc(i.name) + "</td><td>" + money(i.price) + '</td><td><span class="qty"><button data-dec="' + i.id + '" aria-label="Decrease quantity">−</button>' + i.qty +
    '<button data-inc="' + i.id + '" aria-label="Increase quantity">+</button></span></td><td>' + money(i.price * i.qty) +
    '</td><td><button class="btn small" data-remove="' + i.id + '">Remove</button></td></tr>').join("")
    : '<tr><td colspan="5" class="empty">Your cart is empty. Sign in to the User Module to add food.</td></tr>';
  const t = computeTotals();
  const count = U.cart.reduce((s, i) => s + i.qty, 0);
  $("sCount").textContent = count;
  $("sSub").textContent = money(t.sub);
  $("sFee").textContent = t.sub > 0 && t.fee === 0 ? "Free" : money(t.fee);
  $("sDisc").textContent = "−" + money(t.disc);
  $("sTotal").textContent = money(t.total);
  $("cartBadge").textContent = count;
  $("placeOrderBtn").disabled = !U.cart.length;
}

function renderAll() { renderAdmin(); renderOrders(); renderCart(); }

/* ===== Actions ===== */
function addToCart(id) {
  const food = U.menu.find((f) => f.id === id);
  const line = U.cart.find((i) => i.id === id);
  if (line) line.qty++; else U.cart.push({ id: food.id, name: food.name, price: food.price, qty: 1 });
  renderCart();
  toast(food.name + " added to cart");
  logState("Cart updated");
}

function changeQty(id, delta) {
  const line = U.cart.find((i) => i.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) U.cart = U.cart.filter((i) => i.id !== id);
  renderCart();
  logState("Cart quantity changed");
}

function placeOrder() {
  if (!U.cart.length) return;
  if (session.role !== "user") { openLogin("user", "cart"); return; }
  const t = computeTotals();
  const items = U.cart.map((i) => i.name + " x" + i.qty).join(", ");
  M.orders.push({ id: M.nextOrderId++, customer: U.currentUser, items: items, total: t.total, status: "Pending", decision: null });
  const me = A.customers.find((c) => c.name === U.currentUser);
  if (me) me.orders++;
  U.cart = [];
  U.appliedCode = null;
  renderAll();
  $("cartMsg").className = "form-msg good";
  $("cartMsg").textContent = "Order placed. The kitchen manager will confirm it shortly.";
  toast("Order placed");
  logState("Checkout pushed order to manager pipeline");
}

function createOrder() {
  const customer = $("fCustomer").value.trim(), item = $("fItem").value.trim(), price = parseFloat($("fPrice").value);
  const msg = $("formMsg");
  if (!customer || !item || isNaN(price) || price < 0) { msg.className = "form-msg"; msg.textContent = "Enter a customer, an item and a valid price."; return; }
  M.orders.push({ id: M.nextOrderId++, customer: customer, items: item, total: price, status: "Pending", decision: null });
  const known = A.customers.find((c) => c.name.toLowerCase() === customer.toLowerCase());
  if (known) known.orders++;
  else A.customers.push({ id: A.customers.length + 1, name: customer, email: customer.toLowerCase().replace(/\s+/g, ".") + "@example.com", joined: new Date().toISOString().slice(0, 10), orders: 1 });
  ["fCustomer", "fItem", "fPrice"].forEach((id) => ($(id).value = ""));
  msg.className = "form-msg good";
  msg.textContent = "Order added to the pipeline.";
  renderAdmin(); renderOrders();
  logState("Manager added order");
}

function updateOrder(id, changes) {
  const o = M.orders.find((x) => x.id === id);
  if (!o) return;
  Object.assign(o, changes);
  renderAdmin(); renderOrders();
  logState("Order #" + id + " updated");
}

function acceptOrder(id) {
  const o = M.orders.find((x) => x.id === id);
  updateOrder(id, { decision: "Accepted", status: o.status === "Pending" ? "Cooking" : o.status });
}

/* ===== Events ===== */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const d = t.dataset;
  if (d.nav) showView(d.nav);
  else if (d.portal) showView(d.portal);
  else if ("logout" in d || t.id === "logoutTop") logout();
  else if (d.add) addToCart(+d.add);
  else if (d.inc) changeQty(+d.inc, 1);
  else if (d.dec) changeQty(+d.dec, -1);
  else if (d.remove) { U.cart = U.cart.filter((i) => i.id !== +d.remove); renderCart(); logState("Item removed"); }
  else if (d.accept) acceptOrder(+d.accept);
  else if (d.reject) updateOrder(+d.reject, { decision: "Rejected" });
  else if (d.code) { U.appliedCode = d.code; showView("cart"); toast("Voucher " + d.code + " applied"); logState("Voucher applied"); }
});
document.addEventListener("change", (e) => { if (e.target.dataset.status) updateOrder(+e.target.dataset.status, { status: e.target.value }); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("loginOverlay").hidden) closeLogin(); });
$("loginOverlay").addEventListener("click", (e) => { if (e.target === $("loginOverlay")) closeLogin(); });
$("loginForm").addEventListener("submit", login);
$("loginCancel").addEventListener("click", closeLogin);
$("createOrderBtn").addEventListener("click", createOrder);
$("placeOrderBtn").addEventListener("click", placeOrder);

/* ===== Mount ===== */
$("repoLink").href = window.foodyRepository.url;
renderMenu(); renderRestaurants(); renderOffers(); renderAll();
logState(restored ? "Mounted (restored saved data from local storage)" : "Mounted (fresh data)");
console.log("%cFoody Git repository", "background:#2de2c0;color:#0e0a1a;padding:2px 8px;border-radius:4px;font-weight:700");
console.log("window.foodyRepository", window.foodyRepository);
console.table(window.foodyRepository.files.map((f) => ({ file: f, repository: window.foodyRepository.name, branch: window.foodyRepository.branch })));
console.log("Repository URL:", window.foodyRepository.url);
console.log("Data auto-saves to localStorage key foody-data-v1; run window.resetFoodyData() to clear it. Type window.foodyRepository, window.adminModuleData, window.userModuleData or window.managerModuleData to inspect live state.");

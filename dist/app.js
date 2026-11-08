"use strict";

// Dữ liệu và giá bên dưới chỉ dùng để minh họa giao diện cửa hàng.
const products = [
  { id: "macbook-pro", name: "MacBook Pro 14 inch", category: "laptop", description: "Laptop · Thiết kế gọn gàng", price: 34990000, oldPrice: 37990000, image: "assets/laptop.webp", badge: "NỔI BẬT" },
  { id: "airpods-max", name: "Apple AirPods Max", category: "audio", description: "Tai nghe · Chụp tai", price: 11990000, oldPrice: 12990000, image: "assets/airpods-max.webp", badge: "YÊU THÍCH" },
  { id: "iphone-13-pro", name: "iPhone 13 Pro", category: "phone", description: "Điện thoại · Màu xanh", price: 18990000, oldPrice: 20990000, image: "assets/iphone.webp", badge: "ƯU ĐÃI" },
  { id: "ipad-mini", name: "iPad mini 2021", category: "tablet", description: "Máy tính bảng · Nhỏ gọn", price: 11990000, oldPrice: 12990000, image: "assets/ipad.webp", badge: "NỔI BẬT" },
  { id: "asus-zenbook", name: "ASUS Zenbook Pro Duo", category: "laptop", description: "Laptop · Màn hình kép", price: 39990000, oldPrice: null, image: "assets/zenbook.webp", badge: "KHÁM PHÁ" },
  { id: "samsung-s10", name: "Samsung Galaxy S10", category: "phone", description: "Điện thoại · Thiết kế thanh lịch", price: 8990000, oldPrice: 9990000, image: "assets/samsung.webp", badge: "ƯU ĐÃI" },
  { id: "airpods", name: "Apple AirPods", category: "audio", description: "Tai nghe · Không dây", price: 3490000, oldPrice: null, image: "assets/airpods.webp", badge: "YÊU THÍCH" },
  { id: "matebook", name: "Huawei MateBook X Pro", category: "laptop", description: "Laptop · Di động và tinh gọn", price: 27990000, oldPrice: null, image: "assets/matebook.webp", badge: "KHÁM PHÁ" },
  { id: "beats-flex", name: "Beats Flex", category: "audio", description: "Tai nghe · Không dây", price: 1990000, oldPrice: 2290000, image: "assets/headphones.webp", badge: "ƯU ĐÃI" },
  { id: "apple-watch", name: "Apple Watch Series 4", category: "accessory", description: "Đồng hồ thông minh · Màu vàng", price: 4990000, oldPrice: null, image: "assets/watch.webp", badge: "KHÁM PHÁ" },
  { id: "wireless-charger", name: "Apple AirPower", category: "accessory", description: "Phụ kiện · Đế sạc minh họa", price: 1590000, oldPrice: null, image: "assets/charger.webp", badge: "KHÁM PHÁ" }
];

const categoryNames = { laptop: "Laptop", phone: "Điện thoại", tablet: "Máy tính bảng", audio: "Âm thanh", accessory: "Phụ kiện" };
const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const storageKey = "volt-cart-v1";
const productGrid = document.querySelector("#product-grid");
const resultsInfo = document.querySelector("#results-info");
const emptyResults = document.querySelector("#empty-results");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const cartDialog = document.querySelector("#cart-dialog");
const cartBody = document.querySelector("#cart-body");
const cartTotal = document.querySelector("#cart-total");
const cartButton = document.querySelector("#open-cart");
const countElement = document.querySelector(".cart-count");
const checkoutButton = document.querySelector("#checkout");
const toast = document.querySelector("#toast");
let activeCategory = "all";
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(products.flatMap(product => {
      const quantity = saved[product.id];
      return Number.isInteger(quantity) && quantity > 0 ? [[product.id, Math.min(quantity, 99)]] : [];
    }));
  } catch {
    return {};
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch {
    // Website vẫn sử dụng được trong phiên hiện tại nếu trình duyệt chặn lưu trữ.
  }
}

function normalize(text) {
  return text.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

function updateFilterButtons() {
  document.querySelectorAll("[data-filter]").forEach(button => {
    const selected = button.dataset.filter === activeCategory;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderProducts() {
  const query = normalize(searchInput.value);
  let visible = products.filter(product => {
    const categoryMatches = activeCategory === "all" || product.category === activeCategory;
    const text = normalize(`${product.name} ${categoryNames[product.category]} ${product.description}`);
    return categoryMatches && text.includes(query);
  });

  if (sortSelect.value === "price-asc") visible.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") visible.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "vi"));

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image">
        <span class="product-badge ${product.badge === "ƯU ĐÃI" ? "is-sale" : ""}">${product.badge}</span>
        <img src="${product.image}" alt="${product.name}" loading="lazy" width="1000" height="1000">
      </div>
      <div class="product-content">
        <p class="product-category">${categoryNames[product.category]}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price-row"><strong class="product-price">${currency.format(product.price)}</strong>${product.oldPrice ? `<span class="old-price">${currency.format(product.oldPrice)}</span>` : ""}</div>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Thêm ${product.name} vào giỏ hàng"><svg aria-hidden="true"><use href="#i-plus"/></svg> THÊM VÀO GIỎ</button>
      </div>
    </article>`).join("");
  resultsInfo.textContent = `Hiển thị ${visible.length} sản phẩm · Giá chỉ mang tính minh họa`;
  emptyResults.hidden = visible.length !== 0;
  updateFilterButtons();
}

function renderCart() {
  const chosen = products.filter(product => cart[product.id]);
  const quantity = chosen.reduce((sum, product) => sum + cart[product.id], 0);
  const total = chosen.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  countElement.textContent = quantity > 99 ? "99+" : String(quantity);
  cartButton.setAttribute("aria-label", `Mở giỏ hàng, ${quantity} sản phẩm`);
  cartTotal.textContent = currency.format(total);
  checkoutButton.disabled = quantity === 0;

  if (!chosen.length) {
    cartBody.innerHTML = `<div class="cart-empty"><svg aria-hidden="true"><use href="#i-bag"/></svg><strong>Giỏ hàng của bạn đang trống</strong><p>Hãy khám phá và chọn một sản phẩm bạn yêu thích nhé.</p></div>`;
    return;
  }
  cartBody.innerHTML = chosen.map(product => `
    <article class="cart-item">
      <div class="cart-item-image"><img src="${product.image}" alt="" width="100" height="100"></div>
      <div class="cart-item-info">
        <h3>${product.name}</h3><strong>${currency.format(product.price)}</strong>
        <div class="cart-item-actions"><div class="quantity-control" aria-label="Số lượng ${product.name}">
          <button type="button" data-action="decrease" data-id="${product.id}" aria-label="Giảm số lượng ${product.name}"><svg aria-hidden="true"><use href="#i-minus"/></svg></button>
          <span>${cart[product.id]}</span>
          <button type="button" data-action="increase" data-id="${product.id}" aria-label="Tăng số lượng ${product.name}"><svg aria-hidden="true"><use href="#i-plus"/></svg></button>
        </div><button class="remove-item" type="button" data-action="remove" data-id="${product.id}" aria-label="Xóa ${product.name} khỏi giỏ hàng">Xóa</button></div>
      </div>
    </article>`).join("");
}

function setCategory(category, clearSearch = false) {
  activeCategory = category in categoryNames ? category : "all";
  if (clearSearch) searchInput.value = "";
  renderProducts();
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function closeNavigation() {
  const menu = document.querySelector("#mobile-nav");
  const toggle = document.querySelector(".menu-toggle");
  menu.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Mở menu");
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => setCategory(button.dataset.filter));
});

document.querySelectorAll("[data-category], [data-category-link]").forEach(element => {
  element.addEventListener("click", () => {
    setCategory(element.dataset.category || element.dataset.categoryLink, true);
    closeNavigation();
    if (element.tagName === "BUTTON") document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
  });
});

searchInput.addEventListener("input", () => {
  activeCategory = "all";
  renderProducts();
});
document.querySelector(".search-form").addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
  document.querySelector("#search-panel").hidden = true;
  document.querySelector(".search-toggle").setAttribute("aria-expanded", "false");
});
sortSelect.addEventListener("change", renderProducts);
document.querySelector("#reset-filters").addEventListener("click", () => {
  sortSelect.value = "featured";
  setCategory("all", true);
});

document.querySelector(".search-toggle").addEventListener("click", event => {
  const panel = document.querySelector("#search-panel");
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  closeNavigation();
  if (!panel.hidden) searchInput.focus();
});
document.querySelector(".menu-toggle").addEventListener("click", event => {
  const menu = document.querySelector("#mobile-nav");
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!menu.hidden));
  event.currentTarget.setAttribute("aria-label", menu.hidden ? "Mở menu" : "Đóng menu");
  document.querySelector("#search-panel").hidden = true;
  document.querySelector(".search-toggle").setAttribute("aria-expanded", "false");
});
document.querySelectorAll("#mobile-nav a").forEach(link => link.addEventListener("click", closeNavigation));

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.add);
  if (!product) return;
  if ((cart[product.id] || 0) >= 99) {
    notify("Mỗi sản phẩm có thể thêm tối đa 99 chiếc.");
    return;
  }
  cart[product.id] = (cart[product.id] || 0) + 1;
  saveCart();
  renderCart();
  notify(`Đã thêm ${product.name} vào giỏ hàng.`);
});

cartButton.addEventListener("click", () => {
  closeNavigation();
  renderCart();
  cartDialog.showModal();
  document.querySelector(".close-cart").focus();
});
document.querySelector(".close-cart").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", event => {
  if (event.target === cartDialog) cartDialog.close();
});
cartDialog.addEventListener("close", () => cartButton.focus());
cartBody.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button || !cart[button.dataset.id]) return;
  const { action, id } = button.dataset;
  if (action === "remove" || (action === "decrease" && cart[id] === 1)) delete cart[id];
  else if (action === "decrease") cart[id] -= 1;
  else if (action === "increase") cart[id] = Math.min(cart[id] + 1, 99);
  saveCart();
  renderCart();
  const replacement = cartBody.querySelector(`[data-action="${action}"][data-id="${id}"]`);
  if (replacement) replacement.focus();
});
checkoutButton.addEventListener("click", () => {
  alert("Đây là website mẫu. Chức năng đặt hàng và thanh toán chưa được kết nối.");
});

renderProducts();
renderCart();

// Inicialización prueba
let products = [];
let cart = [];
let storeConfig = {};

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCart();
  loadStoreConfig();
  renderProducts();
  updateCartCount();
  updateFooter();
  setupEventListeners();
});

// Cargar productos desde localStorage
function loadProducts() {
  const savedProducts = localStorage.getItem("products");
  products = savedProducts ? JSON.parse(savedProducts) : [];
}

// Cargar carrito desde localStorage
function loadCart() {
  const savedCart = localStorage.getItem("cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
}

// Cargar configuración de la tienda
function loadStoreConfig() {
  const savedConfig = localStorage.getItem("storeConfig");
  storeConfig = savedConfig
    ? JSON.parse(savedConfig)
    : {
        name: "Mi Tienda",
        phone: "",
        address: "",
      };
}

// Guardar carrito en localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Renderizar productos
function renderProducts() {
  const grid = document.getElementById("productsGrid");

  if (products.length === 0) {
    grid.innerHTML = '<p class="empty-cart">No hay productos disponibles en este momento.</p>';
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" onclick="openProductModal('${product.id}')">
            <img src="${product.images[0] || "/generic-product-display.png"}" 
                 alt="${product.name}" 
                 class="product-image">
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">Q${Number.parseFloat(product.price).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Abrir modal de producto
function openProductModal(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("productModal");
  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductDescription").textContent = product.description;
  document.getElementById("modalProductPrice").textContent = `Q${Number.parseFloat(product.price).toFixed(2)}`;

  const mainImage = document.getElementById("modalMainImage");
  mainImage.src = product.images[0] || "/generic-product-display.png";

  const thumbnails = document.getElementById("modalThumbnails");
  thumbnails.innerHTML = product.images
    .map(
      (img, index) => `
        <img src="${img}" 
             alt="${product.name}" 
             class="thumbnail ${index === 0 ? "active" : ""}"
             onclick="changeMainImage('${img}', this)">
    `
    )
    .join("");

  const addToCartBtn = document.getElementById("addToCartBtn");
  addToCartBtn.onclick = () => addToCart(productId);

  modal.classList.add("active");
}

// Cambiar imagen principal
function changeMainImage(src, thumbnail) {
  document.getElementById("modalMainImage").src = src;
  document.querySelectorAll(".thumbnail").forEach((t) => t.classList.remove("active"));
  thumbnail.classList.add("active");
}

// Agregar al carrito
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
  }

  saveCart();
  closeModal("productModal");
  alert("Producto agregado al carrito");
}

// Actualizar contador del carrito
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

// Abrir carrito
function openCart() {
  const modal = document.getElementById("cartModal");
  renderCart();
  modal.classList.add("active");
}

// Renderizar carrito
function renderCart() {
  const cartItems = document.getElementById("cartItems");

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    document.getElementById("totalAmount").textContent = "Q0.00";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <img src="${item.image || "/generic-product-display.png"}" 
                 alt="${item.name}" 
                 class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Q${Number.parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">🗑️</button>
            </div>
        </div>
    `
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("totalAmount").textContent = `Q${total.toFixed(2)}`;
}

// Eliminar del carrito
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

// Finalizar compra por WhatsApp (versión optimizada)
function checkout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  if (!storeConfig.phone || storeConfig.phone.trim().length < 8) {
    alert("El número de WhatsApp no está configurado correctamente.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let message = "¡Hola! Me gustaría hacer un pedido:\n\n";

  cart.forEach((item) => {
    message += `• ${item.name} x${item.quantity} - Q${(item.price * item.quantity).toFixed(2)}\n`;
  });

  message += `\n*Total: Q${total.toFixed(2)}*`;

  const whatsappUrl = `https://wa.me/${storeConfig.phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");

  cart = [];
  saveCart();
  closeModal("cartModal");
}

// Cerrar modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Actualizar footer con información de la tienda
function updateFooter() {
  document.getElementById("footerPhone").textContent = `Teléfono: ${storeConfig.phone || "No configurado"}`;
  document.getElementById("footerAddress").textContent = `Dirección: ${storeConfig.address || "No configurada"}`;
}

// Configurar event listeners
function setupEventListeners() {
  document.getElementById("cartBtn").addEventListener("click", (e) => {
    e.preventDefault();
    openCart();
  });

  document.getElementById("closeCart").addEventListener("click", () => {
    closeModal("cartModal");
  });

  document.getElementById("closeProduct").addEventListener("click", () => {
    closeModal("productModal");
  });

  document.getElementById("checkoutBtn").addEventListener("click", checkout);

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });
}

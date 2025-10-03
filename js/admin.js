// Estado
let isLoggedIn = false
let products = []
let storeConfig = {}
let currentEditingProduct = null
let tempImages = []

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  loadStoreConfig()
  loadProducts()
  setupEventListeners()
})

// Verificar autenticación
function checkAuth() {
  const session = sessionStorage.getItem("adminSession")
  if (session === "active") {
    showAdminPanel()
  } else {
    showLogin()
  }
}

// Mostrar login
function showLogin() {
  document.getElementById("loginContainer").style.display = "flex"
  document.getElementById("adminPanel").style.display = "none"
  isLoggedIn = false
}

// Mostrar panel admin
function showAdminPanel() {
  document.getElementById("loginContainer").style.display = "none"
  document.getElementById("adminPanel").style.display = "block"
  isLoggedIn = true
  renderStoreConfig()
  renderProducts()
}

// Cargar configuración
function loadStoreConfig() {
  const saved = localStorage.getItem("storeConfig")
  storeConfig = saved
    ? JSON.parse(saved)
    : {
        name: "Mi Tienda",
        phone: "",
        address: "",
        password: "admin123",
      }
}

// Guardar configuración
function saveStoreConfig() {
  localStorage.setItem("storeConfig", JSON.stringify(storeConfig))
}

// Cargar productos
function loadProducts() {
  const saved = localStorage.getItem("products")
  products = saved ? JSON.parse(saved) : []
}

// Guardar productos
function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products))
}

// Renderizar configuración
function renderStoreConfig() {
  document.getElementById("storeName").value = storeConfig.name || ""
  document.getElementById("whatsappNumber").value = storeConfig.phone || ""
  document.getElementById("storeAddress").value = storeConfig.address || ""
}

// Renderizar productos
function renderProducts() {
  const container = document.getElementById("adminProductsList")

  if (products.length === 0) {
    container.innerHTML = '<p class="empty-cart">No hay productos. Agrega tu primer producto.</p>'
    return
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="admin-product-card">
            <img src="${product.images[0] || "/generic-product-display.png"}" 
                 alt="${product.name}" 
                 class="admin-product-image">
            <div class="admin-product-info">
                <div class="admin-product-name">${product.name}</div>
                <div class="admin-product-description">${product.description}</div>
                <div class="admin-product-price">Q${Number.parseFloat(product.price).toFixed(2)}</div>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-small btn-secondary" onclick="editProduct('${product.id}')">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.id}')">Eliminar</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Abrir modal de producto
function openProductModal(productId = null) {
  currentEditingProduct = productId
  tempImages = []

  const modal = document.getElementById("productFormModal")
  const title = document.getElementById("productFormTitle")

  if (productId) {
    const product = products.find((p) => p.id === productId)
    title.textContent = "Editar Producto"
    document.getElementById("productId").value = product.id
    document.getElementById("productName").value = product.name
    document.getElementById("productDescription").value = product.description
    document.getElementById("productPrice").value = product.price
    tempImages = [...product.images]
  } else {
    title.textContent = "Agregar Producto"
    document.getElementById("productForm").reset()
    document.getElementById("productId").value = ""
  }

  renderUploadedImages()
  modal.classList.add("active")
}

// Renderizar imágenes subidas
function renderUploadedImages() {
  const container = document.getElementById("uploadedImages")
  container.innerHTML = tempImages
    .map(
      (img, index) => `
        <div class="uploaded-image-item">
            <img src="${img}" alt="Producto">
            <button type="button" class="remove-image-btn" onclick="removeImage(${index})">×</button>
        </div>
    `,
    )
    .join("")
}

// Agregar imagen
function addImage() {
  const input = document.getElementById("imageInput")
  const file = input.files[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    tempImages.push(e.target.result)
    renderUploadedImages()
    input.value = ""
  }
  reader.readAsDataURL(file)
}

// Eliminar imagen
function removeImage(index) {
  tempImages.splice(index, 1)
  renderUploadedImages()
}

// Editar producto
function editProduct(productId) {
  openProductModal(productId)
}

// Eliminar producto
function deleteProduct(productId) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return

  products = products.filter((p) => p.id !== productId)
  saveProducts()
  renderProducts()
}

// Cerrar modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

// Configurar event listeners
function setupEventListeners() {
  // Login
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const password = document.getElementById("password").value

    if (password === storeConfig.password) {
      sessionStorage.setItem("adminSession", "active")
      showAdminPanel()
    } else {
      alert("Contraseña incorrecta")
    }
  })

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("adminSession")
    showLogin()
  })

  // Configuración de la tienda
  document.getElementById("storeConfigForm").addEventListener("submit", (e) => {
    e.preventDefault()

    storeConfig.name = document.getElementById("storeName").value
    storeConfig.phone = document.getElementById("whatsappNumber").value
    storeConfig.address = document.getElementById("storeAddress").value

    const newPassword = document.getElementById("adminPassword").value
    if (newPassword) {
      storeConfig.password = newPassword
      document.getElementById("adminPassword").value = ""
    }

    saveStoreConfig()
    alert("Configuración guardada exitosamente")
  })

  // Agregar producto
  document.getElementById("addProductBtn").addEventListener("click", () => {
    openProductModal()
  })

  // Formulario de producto
  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault()

    if (tempImages.length === 0) {
      alert("Debes agregar al menos una imagen")
      return
    }

    const productId = document.getElementById("productId").value || Date.now().toString()
    const productData = {
      id: productId,
      name: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      price: Number.parseFloat(document.getElementById("productPrice").value),
      images: tempImages,
    }

    if (currentEditingProduct) {
      const index = products.findIndex((p) => p.id === currentEditingProduct)
      products[index] = productData
    } else {
      products.push(productData)
    }

    saveProducts()
    renderProducts()
    closeModal("productFormModal")
    alert("Producto guardado exitosamente")
  })

  // Agregar imagen
  document.getElementById("addImageBtn").addEventListener("click", () => {
    document.getElementById("imageInput").click()
  })

  document.getElementById("imageInput").addEventListener("change", addImage)

  // Cerrar modales
  document.getElementById("closeProductForm").addEventListener("click", () => {
    closeModal("productFormModal")
  })

  document.getElementById("cancelProductForm").addEventListener("click", () => {
    closeModal("productFormModal")
  })

  // Cerrar modal al hacer click fuera
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })
}

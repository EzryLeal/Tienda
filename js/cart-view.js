// Cargar y mostrar el carrito desde la URL
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const cartData = urlParams.get("data")

  if (!cartData) {
    document.getElementById("cartViewItems").innerHTML = '<p class="empty-cart">No hay datos del carrito</p>'
    return
  }

  try {
    const cart = JSON.parse(decodeURIComponent(cartData))
    renderCartView(cart)
  } catch (error) {
    document.getElementById("cartViewItems").innerHTML = '<p class="empty-cart">Error al cargar el carrito</p>'
  }
})

function renderCartView(cart) {
  const container = document.getElementById("cartViewItems")

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <img src="${item.image || "/generic-product-display.png"}" 
                 alt="${item.name}" 
                 class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Q${Number.parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                <div><strong>Subtotal: Q${(item.price * item.quantity).toFixed(2)}</strong></div>
            </div>
        </div>
    `,
    )
    .join("")

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  document.getElementById("cartViewTotal").textContent = `Q${total.toFixed(2)}`
}

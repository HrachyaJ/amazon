import { formatCurrency } from "./utils/money.js";
import { getOrders } from "../data/orders.js";
import { addToCart, getCartQuantity } from "../data/cart.js";

document.addEventListener('DOMContentLoaded', () => {
  // Update cart quantity
  updateCartQuantity();
  
  const orders = getOrders();
  
  // Display orders or empty state
  renderOrders(orders);
});

// Function to update cart quantity in header
function updateCartQuantity() {
  const cartQuantity = getCartQuantity();
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

function renderOrders(orders) {
  const container = document.querySelector('.js-orders-container');
  
  // Show empty state if no orders
  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div class="empty-orders">
        <div class="empty-text">You don't have any orders yet</div><br>
        <div class="empty-text">Start shopping to find something you love!</div><br>
        <a href="index.html" class="buy-again-button button-primary">Start shopping</a>
      </div>
    `;
    return;
  }
  
  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  
  // Generate HTML for each order
  let ordersHTML = '';
  
  orders.forEach(order => {
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Calculate total if missing
    const totalCents = order.totals?.totalCents || 
                      (order.items?.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0) || 0);
    
    // Generate items HTML
    let itemsHTML = '';
    order.items.forEach(item => {
      // Use default image if missing
      const productImage = item.productImage;
      const productName = item.productName || 'Product';
      
      itemsHTML += `
        <div class="order-details-grid">
          <div class="product-image-container">
            <img src="${productImage}" alt="${productName}" class="product-image">
          </div>

          <div class="product-details">
            <div class="product-name">
              ${productName}
            </div>
            <div class="product-delivery-date">
              ${item.status === 'Delivered' ? 'Delivered on' : 'Arriving on'}: ${item.deliveryDate || 'Processing'}
            </div>
            <div class="product-quantity">
              Quantity: ${item.quantity}
            </div>
            <button class="buy-again-button button-primary js-buy-again" data-product-id="${item.productId}">
              <img class="buy-again-icon" src="images/icons/buy-again.png" alt="Buy again">
              <span class="buy-again-message">Buy it again</span>
            </button>
          </div>

          <div class="product-actions">
            <a href="tracking.html?orderId=${order.id}&productId=${item.productId}">
              <button class="track-package-button button-secondary">
                Track package
              </button>
            </a>
          </div>
        </div>
      `;
    });
    
    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${formattedDate}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${formatCurrency(totalCents)}</div>
            </div>
          </div>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>
        
        ${itemsHTML}
      </div>
    `;
  });
  
  container.innerHTML = ordersHTML;
  
  // Add event listeners for "Buy it again" buttons
  addBuyAgainListeners();
}

// Function to add event listeners to "Buy it again" buttons
function addBuyAgainListeners() {
  document.querySelectorAll('.js-buy-again').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      
      if (productId) {
        // Add to cart and show confirmation
        try {
          addToCart(productId, 1);
          updateCartQuantity();
          
          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'success-message';
          successMessage.textContent = 'Item added to cart!';
            successMessage.style.cssText = 'background-color: #067D62; color:rgb(238, 238, 238); padding: 10px; margin: 10px 0; border-radius: 4px; position: fixed; top: 60px; left: 50%; transform: translateX(-50%); z-index: 1000;';
          document.body.appendChild(successMessage);
          
          // Remove after 3 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 3000);
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          alert('Failed to add item to cart. Please try again.');
        }
      }
    });
  });
}

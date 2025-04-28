import { getOrder, updateItemStatus, getTrackingInfo } from "../data/orders.js";
import { getCartQuantity } from "../data/cart.js";

document.addEventListener('DOMContentLoaded', () => {
  // Update cart quantity in header
  updateCartQuantity();
  
  // Get order and product IDs from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const productId = urlParams.get('productId');
  
  if (!orderId || !productId) {
    showError("Invalid tracking information. Please try again.");
    return;
  }
  
  // Load and display tracking information
  loadTrackingInfo(orderId, productId);
  
  // Set up automatic status updates based on delivery date
  setupStatusUpdates();
});

// Function to update cart quantity in header
function updateCartQuantity() {
  const cartQuantity = getCartQuantity();
  document.querySelector('.cart-quantity').innerHTML = cartQuantity;
}

// Function to load and display tracking information
function loadTrackingInfo(orderId, productId) {
  try {
    // Get tracking info for the specified order and product
    const trackingInfo = getTrackingInfo(orderId, productId);
    
    if (!trackingInfo) {
      showError("Product not found in order. Please check your tracking information.");
      return;
    }
    
    // Get the full order to access order date
    const order = getOrder(orderId);
    
    if (!order) {
      showError("Order not found. Please check your tracking information.");
      return;
    }
    
    // Update page with product details
    document.querySelector('.delivery-date').textContent = 
      `${getStatusVerb(trackingInfo.status)} on ${trackingInfo.deliveryDate}`;
    
    document.querySelector('.product-info').textContent = trackingInfo.productName || 'Product';
    
    const quantityElement = document.querySelectorAll('.product-info')[1];
    if (quantityElement) {
      quantityElement.textContent = `Quantity: ${trackingInfo.quantity}`;
    }
    
    // Update product image
    const productImage = document.querySelector('.product-image');
    if (productImage && trackingInfo.productImage) {
      productImage.src = trackingInfo.productImage;
      productImage.alt = trackingInfo.productName || 'Product';
      // Add error handler for image loading failure
      productImage.onerror = function() {
        this.src = 'images/products/default-product.jpg';
      };
    }
    
    // Update tracking status display
    updateTrackingStatusDisplay(trackingInfo.status);
    
  } catch (error) {
    console.error('Error loading tracking info:', error);
    showError("An error occurred while loading tracking information.");
  }
}

// Function to get the appropriate verb based on status
function getStatusVerb(status) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'Delivered';
    case 'shipped':
      return 'Arriving';
    default:
      return 'Expected';
  }
}

// Function to update the tracking status display
function updateTrackingStatusDisplay(status) {
  // Get all status labels
  const statusLabels = document.querySelectorAll('.progress-label');
  const progressBar = document.querySelector('.progress-bar');
  
  // Remove current-status class from all labels
  statusLabels.forEach(label => {
    label.classList.remove('current-status');
  });
  
  // Set progress bar width based on status
  switch (status.toLowerCase()) {
    case 'preparing':
      statusLabels[0].classList.add('current-status');
      progressBar.style.width = '0%';
      break;
    case 'shipped':
      statusLabels[1].classList.add('current-status');
      progressBar.style.width = '50%';
      break;
    case 'delivered':
      statusLabels[2].classList.add('current-status');
      progressBar.style.width = '100%';
      break;
    default:
      statusLabels[0].classList.add('current-status');
      progressBar.style.width = '0%';
  }
}

// Function to show error message
function showError(message) {
  const container = document.querySelector('.order-tracking');
  if (container) {
    container.innerHTML = `
      <a class="back-to-orders-link link-primary" href="orders.html">
        View all orders
      </a>
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
  }
}

// Function to set up automatic status updates
function setupStatusUpdates() {
  // This function runs once a day to update order statuses
  updateOrderStatuses();
  
  // Set up interval to check daily (for testing, you might want to reduce this interval)
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(updateOrderStatuses, CHECK_INTERVAL);
}

// Function to update all order statuses based on dates
function updateOrderStatuses() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const productId = urlParams.get('productId');
    
    if (!orderId || !productId) return;
    
    const order = getOrder(orderId);
    if (!order) return;
    
    const item = order.items.find(item => item.productId === productId);
    if (!item) return;
    
    const today = new Date();
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(item.deliveryDate);
    
    // Calculate days since order was placed
    const daysSinceOrder = Math.floor((today - orderDate) / (24 * 60 * 60 * 1000));
    const daysUntilDelivery = Math.floor((deliveryDate - today) / (24 * 60 * 60 * 1000));
    
    let newStatus = item.status;
    
    // Update status based on timeline
    if (daysUntilDelivery <= 0) {
      // Delivery date has passed or is today
      newStatus = 'Delivered';
    } else if (daysSinceOrder >= 1) {
      // At least one day has passed since ordering
      newStatus = 'Shipped';
    } else {
      // Just ordered
      newStatus = 'Preparing';
    }
    
    // Only update if status has changed
    if (newStatus !== item.status) {
      const updated = updateItemStatus(orderId, productId, newStatus);
      
      if (updated) {
        // If we're on the tracking page, update the display
        updateTrackingStatusDisplay(newStatus);
        
        // Update the delivery date text
        const deliveryDateElement = document.querySelector('.delivery-date');
        if (deliveryDateElement) {
          deliveryDateElement.textContent = `${getStatusVerb(newStatus)} on ${item.deliveryDate}`;
        }
        
        // If delivered, check if we should remove from tracking after delay
        if (newStatus === 'Delivered') {
          setupOrderRemoval(orderId, productId);
        }
      }
    }
  } catch (error) {
    console.error('Error updating order statuses:', error);
  }
}

// Function to set up order removal after delivered + 7 days
function setupOrderRemoval(orderId, productId) {
  try {
    const order = getOrder(orderId);
    if (!order) return;
    
    const item = order.items.find(item => item.productId === productId);
    if (!item || item.status !== 'Delivered') return;
    
    // Schedule removal 7 days after delivery date
    const deliveryDate = new Date(item.deliveryDate);
    const removalDate = new Date(deliveryDate);
    removalDate.setDate(removalDate.getDate() + 7); // 7 days after delivery
    
    const today = new Date();
    const timeUntilRemoval = removalDate - today;
    
    if (timeUntilRemoval > 0) {
      // Schedule removal at the appropriate time
      setTimeout(() => {
        // For a real implementation, you'd want to remove just this item from the order
        // or mark it as archived. For now, we'll just log this.
        console.log(`Order ${orderId}, product ${productId} would now be archived or removed from tracking.`);
        
        // Redirect to orders page if we're still on the tracking page for this product
        const urlParams = new URLSearchParams(window.location.search);
        const currentOrderId = urlParams.get('orderId');
        const currentProductId = urlParams.get('productId');
        
        if (currentOrderId === orderId && currentProductId === productId) {
          window.location.href = 'orders.html';
        }
      }, timeUntilRemoval);
    }
  } catch (error) {
    console.error('Error setting up order removal:', error);
  }
}
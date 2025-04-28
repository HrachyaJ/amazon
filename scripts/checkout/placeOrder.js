// scripts/checkout/placeOrder.js

import { cart } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { saveOrder } from "../../data/orders.js";
import { getDeliveryOption } from "../../data/deliveryOptions.js";

export function placeOrder() {
  if (!cart || cart.length === 0) {
    alert('Your cart is empty. Please add items before checking out.');
    return;
  }

  // Generate a unique order ID
  const orderId = generateOrderId();
  
  // Get the current date
  const orderDate = new Date().toISOString();
  
  // Calculate delivery dates for each item
  const orderItems = cart.map(cartItem => {
    const product = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    
    // Calculate delivery date based on the selected delivery option
    const deliveryDate = calculateDeliveryDate(deliveryOption.deliveryDays);
    
    return {
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      quantity: cartItem.quantity,
      priceCents: product.priceCents,
      deliveryOptionId: cartItem.deliveryOptionId,
      deliveryDate: deliveryDate,
      status: 'Preparing' // Initial status
    };
  });
  
  // Calculate order totals
  const totals = calculateOrderTotals(cart);
  
  // Create the order object
  const order = {
    id: orderId,
    orderDate: orderDate,
    items: orderItems,
    totals: totals
  };
  
  // Save the order
  saveOrder(order);
  
  // Clear the cart (reset localStorage cart)
  localStorage.removeItem('cart');
  
  window.location.href = `orders.html`;
}

// Helper function to generate a unique order ID
function generateOrderId() {
  // Generate a random order ID in the format "A123456"
  const prefix = 'A';
  const number = Math.floor(100000 + Math.random() * 900000); // 6-digit number
  return `${prefix}${number}`;
}

// Helper function to calculate delivery date
function calculateDeliveryDate(deliveryDays) {
  const date = new Date();
  date.setDate(date.getDate() + deliveryDays);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to calculate order totals
function calculateOrderTotals(cartItems) {
  let itemsSubtotal = 0;
  let shippingTotal = 0;
  
  cartItems.forEach(cartItem => {
    const product = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    
    // Add product price * quantity to subtotal
    itemsSubtotal += product.priceCents * cartItem.quantity;
    
    // Add shipping cost
    shippingTotal += deliveryOption.priceCents;
  });
  
  // Calculate tax (assume 10% tax rate)
  const taxRate = 0.1;
  const taxCents = Math.round(itemsSubtotal * taxRate);
  
  // Calculate total
  const totalCents = itemsSubtotal + shippingTotal + taxCents;
  
  return {
    itemsSubtotal: itemsSubtotal,
    shippingTotal: shippingTotal,
    taxCents: taxCents,
    totalCents: totalCents
  };
}
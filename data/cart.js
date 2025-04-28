// Initialize cart from localStorage
export let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to save cart to localStorage
function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to add to cart with quantity validation
export function addToCart(productId, quantity = 1) {
  // Validate inputs
  if (!productId) {
    console.error('Invalid product ID');
    return false;
  }
  
  // Convert quantity to number and validate
  quantity = Number(quantity);
  if (isNaN(quantity) || quantity < 1) {
    console.error('Invalid quantity. Must be a positive number.');
    return false;
  }

  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += quantity;
  } else {
    cart.push({
      productId: productId,
      quantity: quantity,
      deliveryOptionId: '1' // Default delivery option
    });
  }

  saveToStorage();
  return true;
}

// Function to remove from cart
export function removeFromCart(productId) {
  if (!productId) {
    console.error('Invalid product ID');
    return false;
  }

  const newCart = [];

  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });

  cart = newCart;
  saveToStorage();
  return true;
}

// Function to update delivery option
export function updateDeliveryOption(productId, deliveryOptionId) {
  if (!productId || !deliveryOptionId) {
    console.error('Invalid product ID or delivery option');
    return false;
  }

  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (!matchingItem) {
    console.error('Product not found in cart');
    return false;
  }

  matchingItem.deliveryOptionId = deliveryOptionId;
  saveToStorage();
  return true;
}

// New function to update item quantity directly
export function updateQuantity(productId, newQuantity) {
  // Validate inputs
  if (!productId) {
    console.error('Invalid product ID');
    return false;
  }
  
  // Convert quantity to number and validate
  newQuantity = Number(newQuantity);
  if (isNaN(newQuantity) || newQuantity < 1) {
    console.error('Invalid quantity. Must be a positive number.');
    return false;
  }
  
  // Find the item
  const itemIndex = cart.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    console.error('Product not found in cart');
    return false;
  }
  
  // Update quantity
  cart[itemIndex].quantity = newQuantity;
  saveToStorage();
  return true;
}

// Function to get cart total quantity
export function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Function to clear the cart
export function clearCart() {
  cart = [];
  saveToStorage();
}
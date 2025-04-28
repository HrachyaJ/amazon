class Cart {
  #cartItems;
  #localStorageKey;

  constructor(localStorageKey) {
    this.#localStorageKey = localStorageKey;
    this.#loadFromStorage();
  }

  #loadFromStorage() {
    this.#cartItems = JSON.parse(localStorage.getItem(this.#localStorageKey)) || [];
  }

  saveToStorage() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.#cartItems));
  }

  // Public getter for cart items (read-only)
  get items() {
    return [...this.#cartItems];
  }

  // Get total quantity of items in cart
  get totalItems() {
    return this.#cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  addToCart(productId, quantity = 1) {
    if (typeof productId !== 'string' || quantity <= 0) return;

    const matchingItem = this.#cartItems.find(item => item.productId === productId);

    if (matchingItem) {
      matchingItem.quantity += quantity;
    } else {
      this.#cartItems.push({
        productId,
        quantity,
        deliveryOptionId: '1' // Default option
      });
    }

    this.saveToStorage();
  }

  removeFromCart(productId) {
    const initialLength = this.#cartItems.length;
    this.#cartItems = this.#cartItems.filter(item => item.productId !== productId);
    
    if (this.#cartItems.length !== initialLength) {
      this.saveToStorage();
    }
  }

  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const matchingItem = this.#cartItems.find(item => item.productId === productId);
    if (matchingItem) {
      matchingItem.quantity = newQuantity;
      this.saveToStorage();
    }
  }

  updateDeliveryOption(productId, deliveryOptionId) {
    const matchingItem = this.#cartItems.find(item => item.productId === productId);
    if (matchingItem) {
      matchingItem.deliveryOptionId = deliveryOptionId;
      this.saveToStorage();
    }
  }

  clearCart() {
    this.#cartItems = [];
    this.saveToStorage();
  }

  isEmpty() {
    return this.#cartItems.length === 0;
  }
}

// Usage examples:
const cart = new Cart('cart');
const businessCart = new Cart('cart-business');
// Helper function to generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Function to get all orders from localStorage
export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('orders')) || [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

// Function to get a specific order by ID
export function getOrder(orderId) {
  const orders = getOrders();
  return orders.find(order => order.id === orderId);
}

// Function to get orders sorted by date (newest first)
export function getOrdersSortedByDate() {
  const orders = getOrders();
  return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
}

// Function to get tracking information for a specific item
export function getTrackingInfo(orderId, productId) {
  const order = getOrder(orderId);
  if (!order) return null;
  
  return order.items.find(item => item.productId === productId);
}

// Function to update an entire order
export function updateOrder(updatedOrder) {
  try {
    if (!updatedOrder || !updatedOrder.id) return false;
    
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === updatedOrder.id);
    
    if (orderIndex === -1) return false;
    
    orders[orderIndex] = updatedOrder;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

// Function to update an item's status in an order
export function updateItemStatus(orderId, productId, newStatus) {
  try {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return false;
    
    const itemIndex = orders[orderIndex].items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) return false;
    
    orders[orderIndex].items[itemIndex].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return true;
  } catch (error) {
    console.error('Error updating item status:', error);
    return false;
  }
}

// Validate order data structure
function validateOrderData(orderData) {
  if (!orderData) {
    throw new Error('Order data is required');
  }
  
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error('Invalid order data: missing items');
  }
  
  // Validate each item has required fields
  orderData.items.forEach((item, index) => {
    if (!item.productId) {
      throw new Error(`Item at index ${index} is missing productId`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(`Item at index ${index} has invalid quantity`);
    }
    if (typeof item.priceCents !== 'number' || item.priceCents < 0) {
      throw new Error(`Item at index ${index} has invalid price`);
    }
  });
  
  return true;
}

// Function to add a new order with validation
export function saveOrder(orderData) {
  try {
    validateOrderData(orderData);

    const order = {
      id: orderData.id || generateId(),
      orderDate: orderData.orderDate || new Date().toISOString(),
      items: orderData.items.map(item => ({
        productId: item.productId,
        productName: item.productName || '',
        productImage: item.productImage || '',
        quantity: item.quantity,
        priceCents: item.priceCents,
        deliveryOptionId: item.deliveryOptionId,
        deliveryDate: item.deliveryDate || '',
        status: item.status || 'Preparing'
      })),
      totals: orderData.totals || {},
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || ''
    };

    const orders = getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return order;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

// Function to calculate order total including tax
export function calculateOrderTotal(items, deliveryOptions, taxRate = 0.1) {
  // Calculate items subtotal
  const itemsSubtotal = items.reduce((total, item) => {
    return total + (item.priceCents * item.quantity);
  }, 0);
  
  // Calculate shipping total
  const shippingTotal = items.reduce((total, item) => {
    const deliveryOption = deliveryOptions.find(opt => opt.id === item.deliveryOptionId);
    const deliveryCost = deliveryOption ? deliveryOption.priceCents : 0;
    return total + deliveryCost;
  }, 0);
  
  // Calculate tax
  const taxCents = Math.round(itemsSubtotal * taxRate);
  
  // Calculate total
  const totalCents = itemsSubtotal + shippingTotal + taxCents;
  
  return {
    itemsSubtotal,
    shippingTotal,
    taxCents,
    totalCents
  };
}

// Function to clear all orders (for testing)
export function clearOrders() {
  localStorage.removeItem('orders');
}
export const deliveryOptions = [{
  id: '1',
  deliveryDays: 7,
  priceCents: 0,
  name: 'Standard Shipping'
}, {
  id: '2',
  deliveryDays: 3, 
  priceCents: 499,
  name: 'Express Shipping'
}, {
  id: '3',
  deliveryDays: 1,
  priceCents: 999,
  name: 'Next Day Delivery'
}];

export function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(option => option.id === deliveryOptionId) || deliveryOptions[0];
}

export function getDefaultDeliveryOption() {
  return deliveryOptions[0];
}
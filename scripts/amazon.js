import { cart, addToCart } from "../data/cart.js";
import { products } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";

// Function to render products based on search filter
function renderProducts(productsToRender) {
  let productsHTML = '';

  productsToRender.forEach((product) => {
    productsHTML += `<div class="product-container">
            <div class="product-image-container">
              <img class="product-image"
                src="${product.image}">
            </div>

            <div class="product-name limit-text-to-2-lines">
              ${product.name}
            </div>

            <div class="product-rating-container">
              <img class="product-rating-stars"
                src="images/ratings/rating-${product.rating.stars * 10}.png">
              <div class="product-rating-count link-primary">
                ${product.rating.count}
              </div>
            </div>

            <div class="product-price">
              $${formatCurrency(product.priceCents)}
            </div>

            <div class="product-quantity-container">
              <select class="js-quantity-selector">
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>

            <div class="product-spacer"></div>

            <div class="added-to-cart">
              <img src="images/icons/checkmark.png">
              Added
            </div>

            <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
              Add to Cart
            </button>
          </div>`;
  });

  document.querySelector('.js-products-grid').innerHTML = productsHTML;
  
  // Re-add event listeners to the newly rendered buttons
  attachEventListeners();
}

// Initial render of all products
renderProducts(products);

export function updateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });

  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

// Call updateCartQuantity when the page loads to display the initial cart quantity
updateCartQuantity();

function attachEventListeners() {
  document.querySelectorAll('.js-add-to-cart')
   .forEach((button) => {
     button.addEventListener('click', () => {
       const productId = button.dataset.productId;
       const quantitySelector = button.closest('.product-container').querySelector('.js-quantity-selector');
       const quantity = Number(quantitySelector.value);
       
       addToCart(productId, quantity);
       updateCartQuantity();
       
       // Find and show the "Added" message for this specific product
       const productContainer = button.closest('.product-container');
       const addedMessage = productContainer.querySelector('.added-to-cart');
       
       // Show the "Added" message
       addedMessage.classList.add('show');
       
       // Hide the message after 2 seconds
       setTimeout(() => {
         addedMessage.classList.remove('show');
       }, 2000);
     });
   });
}

// Add search functionality
const searchBar = document.querySelector('.search-bar');
const searchButton = document.querySelector('.search-button');

// Function to filter products based on search term
function searchProducts(searchTerm) {
  if (!searchTerm) {
    renderProducts(products);
    return;
  }
  
  searchTerm = searchTerm.toLowerCase();
  
  const filteredProducts = products.filter(product => {
    const productName = product.name.toLowerCase();
    // Also search keywords array
    const matchesKeywords = product.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm)
    );
    return productName.includes(searchTerm) || matchesKeywords;
  });
  
  renderProducts(filteredProducts);
  
  // Add empty state message if no results
  if (filteredProducts.length === 0) {
    document.querySelector('.js-products-grid').innerHTML = 
      '<div class="no-products-message">No products found. Try a different search term.</div>';
  }
}

// Handle search button click
searchBar.addEventListener('input', () => {
  const searchTerm = searchBar.value.trim();
  
  // Add loading indicator if needed
  if (searchTerm.length > 0) {
    // You could add a small delay here to prevent excess rendering
    searchProducts(searchTerm);
  } else {
    renderProducts(products);
  }
});

// Handle Enter key press in search bar
searchBar.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const searchTerm = searchBar.value.trim();
    searchProducts(searchTerm);
  }
});

// Also add ability to clear search and show all products again
searchBar.addEventListener('input', () => {
  if (searchBar.value.trim() === '') {
    renderProducts(products);
  }
});
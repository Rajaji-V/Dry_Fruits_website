// Cart Page JavaScript

// DOM Elements
const cartItemsList = document.getElementById('cart-items-list');
const itemCount = document.getElementById('item-count');
const subtotalEl = document.getElementById('subtotal');
const orderTotalEl = document.getElementById('order-total');
const proceedCheckoutBtn = document.getElementById('proceed-checkout');
const continueShoppingBtn = document.getElementById('continue-shopping');
const updateCartBtn = document.getElementById('update-cart');
const applyCouponBtn = document.getElementById('apply-coupon');
const couponCodeInput = document.getElementById('coupon-code');
const couponRow = document.querySelector('.coupon-row');
const couponDiscountEl = document.getElementById('coupon-discount');
const shippingEl = document.getElementById('shipping');

// State
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let subtotal = 0;
let shippingCost = 0;
let couponDiscount = 0;
let currentCoupon = null;

// Available coupons
const COUPONS = {
    'WELCOME10': { discount: 10, type: 'percentage', minPurchase: 20 },
    'FREESHIP': { discount: 0, type: 'free_shipping', minPurchase: 50 },
    'SAVE15': { discount: 15, type: 'percentage', minPurchase: 30 }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load cart items
    loadCartItems();

    // Initialize event listeners
    initEventListeners();
});

// Initialize event listeners
function initEventListeners() {
    // Continue shopping button
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }
    
    // Update cart button
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', updateCart);
    }
    
    // Apply coupon button
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    // Proceed to checkout button
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            // In a real app, this would redirect to the checkout page
            window.location.href = 'checkout.html';
        });
    }
}

// Load cart items from localStorage
function loadCartItems() {
    if (cartItems.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Clear existing items
    cartItemsList.innerHTML = '';
    
    // Reset subtotal
    subtotal = 0;
    
    // Add each item to the cart
    cartItems.forEach((item, index) => {
        addCartItemToDOM(item, index);
        subtotal += item.price * item.quantity;
    });
    
    // Update the UI
    updateCartSummary();
    updateItemCount();
    toggleProceedButton();
}

// Add a single cart item to the DOM
function addCartItemToDOM(item, index) {
    const itemTotal = item.price * item.quantity;
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-table-row cart-item';
    itemElement.setAttribute('data-index', index);
    
    itemElement.innerHTML = `
        <div class="cart-table-col product-col">
            <div class="cart-product">
                <div class="cart-product-image">
                    <img src="${item.image || '../assets/images/placeholder.jpg'}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-product-details">
                    <h4 class="cart-product-name">${item.name}</h4>
                    <p class="cart-product-category">${formatCategory(item.category || 'nuts')}</p>
                </div>
            </div>
        </div>
        <div class="cart-table-col price-col">
            <span class="price">$${item.price.toFixed(2)}</span>
            ${item.originalPrice ? `<span class="original-price">$${item.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <div class="cart-table-col quantity-col">
            <div class="quantity-selector">
                <button class="quantity-btn minus" data-action="decrease">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-index="${index}">
                <button class="quantity-btn plus" data-action="increase">+</button>
            </div>
        </div>
        <div class="cart-table-col total-col">
            <span class="item-total">$${itemTotal.toFixed(2)}</span>
        </div>
        <div class="cart-table-col action-col">
            <button class="btn btn-icon remove-item" data-index="${index}" aria-label="Remove item">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    cartItemsList.appendChild(itemElement);
    
    // Add event listeners for quantity controls
    const quantityInput = itemElement.querySelector('.quantity-input');
    const minusBtn = itemElement.querySelector('.minus');
    const plusBtn = itemElement.querySelector('.plus');
    const removeBtn = itemElement.querySelector('.remove-item');
    
    quantityInput.addEventListener('change', (e) => updateQuantity(index, parseInt(e.target.value) || 1));
    minusBtn.addEventListener('click', () => updateQuantity(index, Math.max(1, item.quantity - 1)));
    plusBtn.addEventListener('click', () => updateQuantity(index, item.quantity + 1));
    removeBtn.addEventListener('click', () => removeItem(index));
}

// Update item quantity
function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    
    cartItems[index].quantity = newQuantity;
    saveCart();
    
    // Update the quantity input in case it was out of bounds
    const quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
    if (quantityInput) {
        quantityInput.value = newQuantity;
    }
    
    // Update the item total
    const itemTotal = cartItems[index].price * newQuantity;
    const itemTotalEl = document.querySelector(`.cart-item[data-index="${index}"] .item-total`);
    if (itemTotalEl) {
        itemTotalEl.textContent = `$${itemTotal.toFixed(2)}`;
    }
    
    // Update the cart summary
    updateCartSummary();
}

// Remove item from cart
function removeItem(index) {
    cartItems.splice(index, 1);
    saveCart();
    
    // Remove from DOM
    const itemElement = document.querySelector(`.cart-item[data-index="${index}"]`);
    if (itemElement) {
        itemElement.classList.add('removing');
        setTimeout(() => {
            itemElement.remove();
            
            // Re-index remaining items
            const remainingItems = document.querySelectorAll('.cart-item');
            remainingItems.forEach((item, i) => {
                item.setAttribute('data-index', i);
                const quantityInput = item.querySelector('.quantity-input');
                const removeBtn = item.querySelector('.remove-item');
                
                if (quantityInput) quantityInput.setAttribute('data-index', i);
                if (removeBtn) removeBtn.setAttribute('data-index', i);
            });
            
            // Update the cart
            if (cartItems.length === 0) {
                showEmptyCart();
            } else {
                updateCartSummary();
                updateItemCount();
                toggleProceedButton();
            }
        }, 300);
    }
}

// Update cart summary (subtotal, shipping, total)
function updateCartSummary() {
    // Calculate subtotal
    subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping (free over $50, otherwise $5.99)
    shippingCost = subtotal >= 50 ? 0 : 5.99;
    
    // Update DOM
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) {
        shippingEl.textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
        shippingEl.className = shippingCost === 0 ? 'free' : '';
    }
    
    // Calculate total
    const total = subtotal + shippingCost - couponDiscount;
    if (orderTotalEl) orderTotalEl.textContent = `$${total.toFixed(2)}`;
    
    // Save cart to localStorage
    saveCart();
}

// Apply coupon code
function applyCoupon() {
    const code = couponCodeInput.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('Please enter a coupon code', 'error');
        return;
    }
    
    const coupon = COUPONS[code];
    
    if (!coupon) {
        showNotification('Invalid coupon code', 'error');
        return;
    }
    
    if (subtotal < coupon.minPurchase) {
        showNotification(`Minimum purchase of $${coupon.minPurchase} required for this coupon`, 'error');
        return;
    }
    
    // Apply coupon
    currentCoupon = { code, ...coupon };
    
    if (coupon.type === 'percentage') {
        couponDiscount = subtotal * (coupon.discount / 100);
    } else if (coupon.type === 'free_shipping') {
        shippingCost = 0;
        couponDiscount = 0; // No discount, just free shipping
    }
    
    // Update UI
    couponRow.style.display = 'flex';
    couponDiscountEl.textContent = `-$${couponDiscount.toFixed(2)}`;
    
    // Update total
    const total = subtotal + shippingCost - couponDiscount;
    if (orderTotalEl) orderTotalEl.textContent = `$${total.toFixed(2)}`;
    
    // Disable coupon input and button
    couponCodeInput.disabled = true;
    applyCouponBtn.disabled = true;
    
    showNotification('Coupon applied successfully!', 'success');
}

// Update cart (save to localStorage)
function updateCart() {
    // This function is called when the "Update Cart" button is clicked
    // In this implementation, we don't need to do anything special here
    // because we're updating quantities in real-time
    showNotification('Cart updated', 'success');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateItemCount();
    toggleProceedButton();
}

// Show empty cart message
function showEmptyCart() {
    cartItemsList.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a href="products.html" class="btn btn-primary">Continue Shopping</a>
        </div>
    `;
    
    // Reset summary
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (shippingEl) shippingEl.textContent = '$0.00';
    if (orderTotalEl) orderTotalEl.textContent = '$0.00';
    if (couponRow) couponRow.style.display = 'none';
    
    // Disable checkout button
    toggleProceedButton();
}

// Toggle proceed to checkout button
function toggleProceedButton() {
    if (!proceedCheckoutBtn) return;
    
    if (cartItems.length === 0) {
        proceedCheckoutBtn.disabled = true;
        proceedCheckoutBtn.classList.add('disabled');
    } else {
        proceedCheckoutBtn.disabled = false;
        proceedCheckoutBtn.classList.remove('disabled');
    }
}

// Update item count in the header
function updateItemCount() {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count in header
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
    
    // Update item count in the cart header
    if (itemCount) {
        itemCount.textContent = `(${count} ${count === 1 ? 'item' : 'items'})`;
    }
}


// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to the body
    document.body.appendChild(notification);
    
    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Format category for display
function formatCategory(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Make cart functions available globally
window.DryFruitsCart = {
    loadCartItems,
    updateQuantity,
    removeItem,
    updateCartSummary,
    saveCart
};

// Initialize the cart when the page loads
loadCartItems();
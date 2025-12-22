
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

let cartItems = [];
let subtotal = 0;
let shippingCost = 0;
let couponDiscount = 0;
let currentCoupon = null;

const COUPONS = {
    'WELCOME10': { discount: 10, type: 'percentage', minPurchase: 20 },
    'FREESHIP': { discount: 0, type: 'free_shipping', minPurchase: 50 },
    'SAVE15': { discount: 15, type: 'percentage', minPurchase: 30 }
};

document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    initEventListeners();
});

function initEventListeners() {
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }

    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', updateCart);
    }

    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }

    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}

function loadCartItems() {
    try {
        cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    } catch (e) {
        cartItems = [];
    }

    if (cartItems.length === 0) {
        showEmptyCart();
        return;
    }

    cartItemsList.innerHTML = '';

    subtotal = 0;

    cartItems.forEach((item, index) => {
        addCartItemToDOM(item, index);
        const price = getEffectivePrice(item);
        subtotal += price * item.quantity;
    });

    updateCartSummary();
    updateItemCount();
    toggleProceedButton();
}

function getEffectivePrice(item) {
    if (item.discount && item.discount > 0) {
        return item.price * (1 - item.discount / 100);
    }
    return item.price;
}

function addCartItemToDOM(item, index) {
    const effectivePrice = getEffectivePrice(item);
    const itemTotal = effectivePrice * item.quantity;
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-table-row cart-item';
    itemElement.setAttribute('data-index', index);

    let imagePath = item.image;
    if (imagePath && !imagePath.startsWith('../') && !imagePath.startsWith('http')) {
        imagePath = '../' + imagePath;
    }
    if (!imagePath) {
        imagePath = '../assets/images/placeholder.jpg';
    }

    let priceDisplay = `$${effectivePrice.toFixed(2)}`;
    if (item.discount > 0) {
        priceDisplay = `
            <div class="price-container" style="display: flex; flex-direction: column;">
                <span class="price-discounted" style="color: #d97706; font-weight: bold;">$${effectivePrice.toFixed(2)}</span>
                <span class="original-price" style="text-decoration: line-through; color: #999; font-size: 0.9em;">$${item.price.toFixed(2)}</span>
            </div>
        `;
    }

    itemElement.innerHTML = `
        <div class="cart-table-col product-col">
            <div class="cart-product">
                <div class="cart-product-image">
                    <img src="${imagePath}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-product-details">
                    <h4 class="cart-product-name">${item.name}</h4>
                    <p class="cart-product-category">${formatCategory(item.category || 'nuts')}</p>
                    ${item.discount ? `<span class="cart-discount-badge" style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">-${item.discount}% Off</span>` : ''}
                </div>
            </div>
        </div>
        <div class="cart-table-col price-col">
            ${priceDisplay}
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

    const quantityInput = itemElement.querySelector('.quantity-input');
    const minusBtn = itemElement.querySelector('.minus');
    const plusBtn = itemElement.querySelector('.plus');
    const removeBtn = itemElement.querySelector('.remove-item');

    const handleUpdate = (newVal) => {
        updateQuantity(index, newVal);
    };

    quantityInput.addEventListener('change', (e) => handleUpdate(parseInt(e.target.value) || 1));
    minusBtn.addEventListener('click', () => handleUpdate(Math.max(1, item.quantity - 1)));
    plusBtn.addEventListener('click', () => handleUpdate(item.quantity + 1));
    removeBtn.addEventListener('click', () => removeItem(index));
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;

    cartItems[index].quantity = newQuantity;
    saveCart();

    const quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
    if (quantityInput) {
        quantityInput.value = newQuantity;
    }

    const effectivePrice = getEffectivePrice(cartItems[index]);
    const itemTotal = effectivePrice * newQuantity;
    const itemTotalEl = document.querySelector(`.cart-item[data-index="${index}"] .item-total`);
    if (itemTotalEl) {
        itemTotalEl.textContent = `$${itemTotal.toFixed(2)}`;
    }

    updateCartSummary();
}

function removeItem(index) {
    cartItems.splice(index, 1);
    saveCart();

    const itemElement = document.querySelector(`.cart-item[data-index="${index}"]`);
    if (itemElement) {
        itemElement.classList.add('removing');
        setTimeout(() => {
            itemElement.remove();

            loadCartItems();
        }, 300);
    } else {
        loadCartItems();
    }
}

function updateCartSummary() {
    subtotal = cartItems.reduce((sum, item) => {
        const price = getEffectivePrice(item);
        return sum + (price * item.quantity);
    }, 0);

    shippingCost = subtotal >= 50 ? 0 : 5.99;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) {
        shippingEl.textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
        shippingEl.className = shippingCost === 0 ? 'free' : '';
    }

    const total = subtotal + shippingCost - couponDiscount;
    if (orderTotalEl) orderTotalEl.textContent = `$${total.toFixed(2)}`;

    saveCart();
}

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

    currentCoupon = { code, ...coupon };

    if (coupon.type === 'percentage') {
        couponDiscount = subtotal * (coupon.discount / 100);
    } else if (coupon.type === 'free_shipping') {
        shippingCost = 0;
        couponDiscount = 0;
    }

    couponRow.style.display = 'flex';
    couponDiscountEl.textContent = `-$${couponDiscount.toFixed(2)}`;

    const total = subtotal + shippingCost - couponDiscount;
    if (orderTotalEl) orderTotalEl.textContent = `$${total.toFixed(2)}`;

    couponCodeInput.disabled = true;
    applyCouponBtn.disabled = true;

    showNotification('Coupon applied successfully!', 'success');
}

function updateCart() {
    showNotification('Cart updated', 'success');
}

function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateItemCount();
    toggleProceedButton();
}

function showEmptyCart() {
    cartItemsList.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a href="products.html" class="btn btn-primary">Continue Shopping</a>
        </div>
    `;

    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (shippingEl) shippingEl.textContent = '$0.00';
    if (orderTotalEl) orderTotalEl.textContent = '$0.00';
    if (couponRow) couponRow.style.display = 'none';

    toggleProceedButton();
}

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

function updateItemCount() {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);

    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });

    if (itemCount) {
        itemCount.textContent = `(${count} ${count === 1 ? 'item' : 'items'})`;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');

        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function formatCategory(category) {
    if (!category) return '';
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

window.DryFruitsCart = {
    loadCartItems,
    updateQuantity,
    removeItem,
    updateCartSummary,
    saveCart
};
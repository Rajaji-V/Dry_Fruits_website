
// DOM Elements
const checkoutSteps = document.querySelectorAll('.step');
const sections = document.querySelectorAll('.checkout-section');
const paymentOptions = document.querySelectorAll('.payment-option');
const paymentForms = document.querySelectorAll('.payment-form');

// Form Actions
const shippingForm = document.getElementById('shipping-form');
const paymentForm = document.getElementById('payment-form');
const backToShippingBtn = document.getElementById('back-to-shipping');
const backToShippingPp = document.getElementById('back-to-shipping-pp');
const backToShippingCod = document.getElementById('back-to-shipping-cod');
const placeOrderPaypal = document.getElementById('place-order-paypal');
const placeOrderCod = document.getElementById('place-order-cod');

// Card Preview Elements
const cardNumberInput = document.getElementById('cardNumber');
const cardNameInput = document.getElementById('cardName');
const expiryInput = document.getElementById('expiryDate');
const cardDisplayNum = document.querySelector('.card-number-display');
const cardDisplayName = document.querySelector('.card-holder-display');
const cardDisplayExpiry = document.querySelector('.card-expiry-display');

// State
let currentStep = 1;
let selectedPaymentMethod = 'card';
let cartItems = [];
try {
    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
} catch (e) {
    cartItems = [];
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // If cart is empty, redirect to cart page
    if (cartItems.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    renderOrderSummary();
    initEventListeners();
});

function initEventListeners() {
    // Shipping Form Submit
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            goToStep(2);
        });
    }

    // Payment Method Selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // UI Update
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Form selection
            const method = option.getAttribute('data-method');
            selectedPaymentMethod = method;

            paymentForms.forEach(form => form.classList.remove('active'));
            if (method === 'card') {
                document.getElementById('card-form-container').classList.add('active');
            } else if (method === 'paypal') {
                document.getElementById('paypal-form-container').classList.add('active');
            } else if (method === 'cod') {
                document.getElementById('cod-form-container').classList.add('active');
            }
        });
    });

    // Back Buttons
    [backToShippingBtn, backToShippingPp, backToShippingCod].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                goToStep(1);
            });
        }
    });

    // Payment Actions
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processOrder();
        });
    }

    if (placeOrderPaypal) {
        placeOrderPaypal.addEventListener('click', processOrder);
    }

    if (placeOrderCod) {
        placeOrderCod.addEventListener('click', processOrder);
    }

    // Credit Card Live Preview
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            let formatted = '';
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += val[i];
            }
            e.target.value = formatted;
            cardDisplayNum.textContent = formatted || '#### #### #### ####';
        });
    }

    if (cardNameInput) {
        cardNameInput.addEventListener('input', (e) => {
            cardDisplayName.textContent = e.target.value.toUpperCase() || 'CARD HOLDER';
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.slice(0, 2) + '/' + val.slice(2);
            }
            e.target.value = val;
            cardDisplayExpiry.textContent = val || 'MM/YY';
        });
    }
}

function goToStep(step) {
    currentStep = step;

    // Update Header
    checkoutSteps.forEach(el => {
        const stepNum = parseInt(el.getAttribute('data-step'));
        if (stepNum === step) {
            el.classList.add('active');
            el.classList.remove('completed');
        } else if (stepNum < step) {
            el.classList.add('active', 'completed');
        } else {
            el.classList.remove('active', 'completed');
        }
    });

    // Update Sections
    sections.forEach(sec => sec.classList.remove('active'));

    if (step === 1) {
        document.getElementById('shipping-step').classList.add('active');
    } else if (step === 2) {
        document.getElementById('payment-step').classList.add('active');
    } else if (step === 3) {
        document.getElementById('success-step').classList.add('active');
        // Clear cart
        localStorage.removeItem('cartItems');
        // Update header count
        if (window.DryFruitsApp) {
            window.DryFruitsApp.updateCartCount();
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function processOrder() {
    // Simulate API call
    const btn = document.querySelector('.payment-form.active button.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;

        // Generate random order ID
        const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
        document.getElementById('order-number').textContent = '#' + orderId;

        goToStep(3);
    }, 2000);
}

function renderOrderSummary() {
    const container = document.getElementById('checkout-items');
    if (!container) return;

    let subtotal = 0;

    container.innerHTML = cartItems.map(item => {
        const itemPrice = item.discount
            ? item.price * (1 - item.discount / 100)
            : item.price;

        subtotal += itemPrice * item.quantity;

        return `
            <div class="checkout-item">
                <img src="${getRelativeImagePath(item.image)}" alt="${item.name}" class="checkout-item-img">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-meta">Qty: ${item.quantity}</div>
                </div>
                <div class="checkout-item-price">$${(itemPrice * item.quantity).toFixed(2)}</div>
            </div>
        `;
    }).join('');

    // Totals
    const shipping = subtotal > 50 ? 0 : 5.99;

    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

function getRelativeImagePath(path) {
    if (path && !path.startsWith('../') && !path.startsWith('http')) {
        return '../' + path;
    }
    return path || '../assets/images/placeholder.jpg';
}

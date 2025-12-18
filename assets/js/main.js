// Main JavaScript for Dry Fruits Website

// DOM Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const backToTopBtn = document.getElementById('back-to-top');
const themeToggle = document.getElementById('theme-toggle');
const cartCount = document.querySelector('.cart-count');
const newsletterForm = document.getElementById('newsletter-form');
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initMobileMenu();

    // Initialize back to top button
    initBackToTop();

    // Initialize theme toggle
    initThemeToggle();

    // Initialize cart count
    updateCartCount();

    // Initialize user authentication
    initUserAuth();

    // Initialize newsletter form
    if (newsletterForm) {
        initNewsletterForm();
    }

    // Load featured products if on home page
    if (document.getElementById('featured-products-grid')) {
        loadFeaturedProducts();
    }

    // Initialize smooth scrolling for anchor links
    initSmoothScrolling();

    // Add animation on scroll
    initScrollAnimations();
});

// Mobile Menu Toggle
function initMobileMenu() {
    if (!mobileMenuToggle) return;
    
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open', !isExpanded);
    });
    
    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
        if (!mainNav || !mobileMenuToggle) return;
        if (!mainNav.classList.contains('active')) return;

        const withinNav = e.composedPath && e.composedPath().includes(mainNav);
        const withinToggle = e.composedPath && e.composedPath().includes(mobileMenuToggle);
        if (!withinNav && !withinToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav && mainNav.classList.contains('active')) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenuToggle.focus();
        }
    });
}

// Back to Top Button
function initBackToTop() {
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Theme Toggle
function initThemeToggle() {
    if (!themeToggle) return;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        themeToggle.innerHTML = newTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    });
}

// Cart Functions
function updateCartCount() {
    if (!cartCount) return;
    
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
}

function addToCart(product) {
    // Check if product is already in cart
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cartItems.push({
            ...product,
            quantity: product.quantity || 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification('Product added to cart!', 'success');
}

// Newsletter Form
function initNewsletterForm() {
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();
        const messageDiv = newsletterForm.querySelector('.form-message');
        
        // Simple email validation
        if (!isValidEmail(email)) {
            showFormMessage(messageDiv, 'Please enter a valid email address', 'error');
            return;
        }
        
        try {
            // In a real app, you would send this to your server
            // For now, we'll simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            showFormMessage(messageDiv, 'Thank you for subscribing!', 'success');
            emailInput.value = '';
            
            // Reset form message after 5 seconds
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormMessage(messageDiv, 'Something went wrong. Please try again.', 'error');
        }
    });
}

// Load Featured Products
async function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featured-products-grid');
    if (!productsGrid) return;
    
    try {
        // In a real app, you would fetch this from an API
        const products = [
            {
                id: 1,
                name: 'Almonds',
                price: 12.99,
                image: 'assets/images/almonds.jpg',
                description: 'Premium quality California almonds, rich in protein and healthy fats.'
            },
            {
                id: 2,
                name: 'Cashews',
                price: 14.99,
                image: 'assets/images/cashews.jpg',
                description: 'Creamy and delicious cashews, perfect for snacking or cooking.'
            },
            {
                id: 3,
                name: 'Pistachios',
                price: 16.99,
                image: 'assets/images/pista.jpg',
                description: 'Fresh and flavorful pistachios, a great source of protein and fiber.'
            },
            {
                id: 4,
                name: 'Walnuts',
                price: 11.99,
                image: 'assets/images/walnut.jpg',
                description: 'Rich and buttery walnuts, packed with omega-3 fatty acids.'
            }
        ];
        
        // Clear loading skeleton
        productsGrid.innerHTML = '';
        
        // Add products to the grid
        products.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

// Create Product Card Element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart" data-product='${JSON.stringify(product)}'>
                    Add to Cart
                </button>
                <a href="pages/product-details.html?id=${product.id}" class="btn btn-outline">
                    View Details
                </a>
            </div>
        </div>
    `;
    
    // Add event listener to the Add to Cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            const productData = JSON.parse(e.target.getAttribute('data-product'));
            addToCart({ ...productData, quantity: 1 });
        });
    }
    
    return card;
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's a # link
            if (targetId === '#') return;
            
            // Check if it's an anchor link on the same page
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Calculate the position to scroll to, accounting for the fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without adding to history
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };
    
    // Run once on page load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
}

// Helper Functions
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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

function showFormMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `form-message ${type}`;
}

// User Authentication Functions
function initUserAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.querySelector('a[href*="login.html"]');

    if (currentUser && loginLink) {
        // User is logged in - show logout option
        loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        loginLink.href = '#';
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });

        // Add welcome message to header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'user-welcome';
            welcomeDiv.innerHTML = `<span class="welcome-text">Welcome, ${currentUser}!</span>`;
            headerActions.insertBefore(welcomeDiv, headerActions.firstChild);
        }
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Export functions for use in other modules
window.DryFruitsApp = {
    addToCart,
    updateCartCount,
    showNotification,
    logoutUser
};

// Also export for ES modules
export { addToCart, updateCartCount, showNotification, logoutUser };

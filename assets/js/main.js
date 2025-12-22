
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const backToTopBtn = document.getElementById('back-to-top');
const themeToggle = document.getElementById('theme-toggle');
const cartCount = document.querySelector('.cart-count');
const newsletterForm = document.getElementById('newsletter-form');

let cartItems = [];
try {
    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
} catch (e) {
    cartItems = [];
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();

    initBackToTop();

    initThemeToggle();

    updateCartCount();

    initUserAuth();

    if (newsletterForm) {
        initNewsletterForm();
    }

    if (document.getElementById('featured-products-grid')) {
        loadFeaturedProducts();
    }

    initSmoothScrolling();

    initScrollAnimations();

    initHeaderScroll();
});

function initMobileMenu() {
    if (!mobileMenuToggle) return;

    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open', !isExpanded);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav && mainNav.classList.contains('active')) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenuToggle.focus();
        }
    });
}

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

function initThemeToggle() {
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeToggle.innerHTML = newTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });
}

function updateCartCount() {
    if (!cartCount) return;

    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
}

function addToCart(product) {
    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cartItems.push({
            ...product,
            quantity: product.quantity || 1
        });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    updateCartCount();

    showNotification('Product added to cart!', 'success');
}

function initNewsletterForm() {
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();
        const messageDiv = newsletterForm.querySelector('.form-message');

        if (!isValidEmail(email)) {
            showFormMessage(messageDiv, 'Please enter a valid email address', 'error');
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            showFormMessage(messageDiv, 'Thank you for subscribing!', 'success');
            emailInput.value = '';

            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }, 5000);

        } catch (error) {
            showFormMessage(messageDiv, 'Something went wrong. Please try again.', 'error');
        }
    });
}

async function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featured-products-grid');
    if (!productsGrid) return;

    try {
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

        productsGrid.innerHTML = '';

        products.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });

    } catch (error) {
        productsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card animate-on-scroll';

    const productJson = JSON.stringify(product).replace(/'/g, '&apos;');

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart" data-product='${productJson}'>
                    Add to Cart
                </button>
                <a href="pages/product-details.html?id=${product.id}" class="btn btn-outline">
                    View Details
                </a>
            </div>
        </div>
    `;

    const addToCartBtn = card.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            try {
                const btn = e.currentTarget;
                const json = btn.getAttribute('data-product');
                const productData = JSON.parse(json);
                addToCart({ ...productData, quantity: 1 });
            } catch (err) {
            }
        });
    }

    return card;
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, targetId);
            }
        });
    });
}

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

    animateOnScroll();

    window.addEventListener('scroll', animateOnScroll);
}

function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

function showFormMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.className = `form-message ${type}`;
}

function initUserAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.querySelector('a[href*="login.html"]');

    if (currentUser && loginLink) {
        loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        loginLink.href = '#';
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            logoutUser();
        });

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

window.DryFruitsApp = {
    addToCart,
    updateCartCount,
    showNotification,
    logoutUser
};

export { addToCart, updateCartCount, showNotification, logoutUser };

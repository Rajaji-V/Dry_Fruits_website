// Products Page JavaScript

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const searchInput = document.getElementById('search-products');
const viewOptions = document.querySelectorAll('.view-option');
const categoryLinks = document.querySelectorAll('.category-list a');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const applyPriceFilter = document.getElementById('apply-price-filter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const prevPageBottomBtn = document.getElementById('prev-page-bottom');
const nextPageBottomBtn = document.getElementById('next-page-bottom');
const currentPageEl = document.getElementById('current-page');
const totalPagesEl = document.getElementById('total-pages');
const showingCountEl = document.getElementById('showing-count');
const totalCountEl = document.getElementById('total-count');

// State
let products = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let currentView = 'grid'; // 'grid' or 'list'
let currentCategory = 'all';
let currentSort = 'featured';
let currentSearch = '';
let priceRange = { min: 0, max: 1000 };

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load products
    loadProducts();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize price range slider
    initPriceSlider();
    
    // Update UI
    updateView();
});

// Load products from API or local data
async function loadProducts() {
    try {
        // In a real app, you would fetch this from an API
        // For now, we'll use sample data
        products = [
            {
                id: 1,
                name: 'California Almonds',
                price: 12.99,
                category: 'almonds',
                image: '../assets/images/almonds.jpg',
                description: 'Premium quality California almonds, rich in protein and healthy fats.',
                rating: 4.8,
                reviews: 124,
                inStock: true,
                isFeatured: true,
                discount: 10
            },
            {
                id: 2,
                name: 'Premium Cashews',
                price: 14.99,
                category: 'cashews',
                image: '../assets/images/cashews.jpg',
                description: 'Creamy and delicious cashews, perfect for snacking or cooking.',
                rating: 4.9,
                reviews: 98,
                inStock: true,
                isFeatured: true
            },
            {
                id: 3,
                name: 'Pistachios',
                price: 16.99,
                category: 'pistachios',
                image: '../assets/images/pista.jpg',
                description: 'Fresh and flavorful pistachios, a great source of protein and fiber.',
                rating: 4.7,
                reviews: 156,
                inStock: true,
                isFeatured: true,
                discount: 5
            },
            {
                id: 4,
                name: 'English Walnuts',
                price: 11.99,
                category: 'walnuts',
                image: '../assets/images/walnut.jpg',
                description: 'Rich and buttery walnuts, packed with omega-3 fatty acids.',
                rating: 4.6,
                reviews: 87,
                inStock: true,
                isFeatured: true
            },
            {
                id: 5,
                name: 'Medjool Dates',
                price: 9.99,
                category: 'dates',
                image: '../assets/images/blackdates.jpg',
                description: 'Naturally sweet Medjool dates, perfect for a healthy snack or dessert.',
                rating: 4.8,
                reviews: 112,
                inStock: true
            },
            {
                id: 6,
                name: 'Golden Raisins',
                price: 7.99,
                category: 'raisins',
                image: '../assets/images/dryGrapesBlack.jpg',
                description: 'Sweet and chewy golden raisins, great for baking or snacking.',
                rating: 4.5,
                reviews: 76,
                inStock: true
            },
            {
                id: 7,
                name: 'Dried Apricots',
                price: 8.99,
                category: 'apricots',
                image: '../assets/images/drykiwi.jpg',
                description: 'Naturally sweet and tangy dried apricots, rich in vitamins and fiber.',
                rating: 4.7,
                reviews: 93,
                inStock: true
            },
            
            // Add more products as needed
        ];
        
        // Initialize filtered products
        filteredProducts = [...products];
        
        // Update UI
        updateUI();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again later.');
    }
}

// Initialize event listeners
function initEventListeners() {
    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            currentPage = 1;
            filterProducts();
        });
    }
    
    // Sort by
    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            currentSort = e.target.value;
            sortProducts();
            updateUI();
        });
    }
    
    // Search
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value.toLowerCase();
            currentPage = 1;
            filterProducts();
        }, 300));
    }
    
    // View options
    viewOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            setView(view);
        });
    });
    
    // Category links
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            setCategory(category);
        });
    });
    
    // Price filter
    if (applyPriceFilter) {
        applyPriceFilter.addEventListener('click', () => {
            const min = parseFloat(minPriceInput.value) || 0;
            const max = parseFloat(maxPriceInput.value) || 1000;
            
            if (min >= 0 && max >= min) {
                priceRange = { min, max };
                currentPage = 1;
                filterProducts();
            } else {
                showError('Please enter a valid price range.');
            }
        });
    }
    
    // Pagination
    if (prevPageBtn) prevPageBtn.addEventListener('click', goToPrevPage);
    if (nextPageBtn) nextPageBtn.addEventListener('click', goToNextPage);
    if (prevPageBottomBtn) prevPageBottomBtn.addEventListener('click', goToPrevPage);
    if (nextPageBottomBtn) nextPageBottomBtn.addEventListener('click', goToNextPage);
}

// Initialize price range slider
function initPriceSlider() {
    // In a real app, you would use a slider library like noUiSlider or range input
    // For simplicity, we're using basic number inputs
    minPriceInput.value = priceRange.min;
    maxPriceInput.value = priceRange.max;
}

// Filter products based on current filters
function filterProducts() {
    filteredProducts = products.filter(product => {
        // Category filter
        if (currentCategory !== 'all' && product.category !== currentCategory) {
            return false;
        }
        
        // Search filter
        if (currentSearch && !product.name.toLowerCase().includes(currentSearch)) {
            return false;
        }
        
        // Price filter
        if (product.price < priceRange.min || product.price > priceRange.max) {
            return false;
        }
        
        return true;
    });
    
    // Sort products
    sortProducts();
    
    // Update UI
    updateUI();
}

// Sort products based on current sort option
function sortProducts() {
    filteredProducts.sort((a, b) => {
        switch (currentSort) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'featured':
            default:
                // Featured products first, then by rating
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return b.rating - a.rating;
        }
    });
}

// Set current view (grid or list)
function setView(view) {
    if (view === currentView) return;
    
    currentView = view;
    updateView();
    
    // Update active state of view options
    viewOptions.forEach(option => {
        if (option.getAttribute('data-view') === view) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Set current category
function setCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Update active state of category links
    categoryLinks.forEach(link => {
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update category filter dropdown
    if (categoryFilter) {
        categoryFilter.value = category === 'all' ? 'all' : 'nuts';
    }
    
    // Filter products
    filterProducts();
}

// Go to previous page
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateUI();
        scrollToTop();
    }
}

// Go to next page
function goToNextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateUI();
        scrollToTop();
    }
}

// Update UI based on current state
function updateUI() {
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    // Update product grid
    renderProducts(paginatedProducts);
    
    // Update pagination controls
    updatePagination(totalPages);
    
    // Update results count
    updateResultsCount(startIndex, endIndex, filteredProducts.length);
}

// Render products to the grid
function renderProducts(products) {
    if (!productsGrid) return;
    
    // Clear existing content
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter to find what you're looking for.</p>
                <button class="btn btn-primary" id="reset-filters">Reset Filters</button>
            </div>
        `;
        
        // Add event listener to reset filters button
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFilters);
        }
        
        return;
    }
    
    // Add products to the grid
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Update grid class based on current view
    updateView();
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = `product-card ${currentView === 'list' ? 'list-view' : ''}`;
    
    // Format price
    const price = product.discount 
        ? `<span class="original-price">$${product.price.toFixed(2)}</span> $${(product.price * (1 - product.discount / 100)).toFixed(2)}`
        : `$${product.price.toFixed(2)}`;
    
    // Create star rating
    const stars = createStarRating(product.rating);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
            <div class="product-actions">
                <button class="btn btn-icon quick-view" data-product-id="${product.id}" aria-label="Quick view">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-icon add-to-wishlist" data-product-id="${product.id}" aria-label="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category">${formatCategory(product.category)}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                ${stars}
                <span class="reviews">(${product.reviews})</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div class="product-price">${price}</div>
                <button class="btn btn-primary add-to-cart" data-product='${JSON.stringify(product)}'>
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            const productData = JSON.parse(e.target.getAttribute('data-product'));
            // Use the global addToCart function from main.js
            if (window.DryFruitsApp && window.DryFruitsApp.addToCart) {
                window.DryFruitsApp.addToCart({ ...productData, quantity: 1 });
            } else {
                // Fallback if main.js hasn't loaded yet
                console.warn('addToCart function not available, trying again in 100ms');
                setTimeout(() => {
                    if (window.DryFruitsApp && window.DryFruitsApp.addToCart) {
                        window.DryFruitsApp.addToCart({ ...productData, quantity: 1 });
                    }
                }, 100);
            }
        });
    }
    
    return card;
}

// Create star rating HTML
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Format category for display
function formatCategory(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Update pagination controls
function updatePagination(totalPages) {
    if (!currentPageEl || !totalPagesEl) return;
    
    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = totalPages;
    
    // Update button states
    const prevButtons = [prevPageBtn, prevPageBottomBtn];
    const nextButtons = [nextPageBtn, nextPageBottomBtn];
    
    prevButtons.forEach(btn => {
        if (btn) {
            btn.disabled = currentPage === 1;
        }
    });
    
    nextButtons.forEach(btn => {
        if (btn) {
            btn.disabled = currentPage === totalPages;
        }
    });
    
    // Update page numbers
    updatePageNumbers(totalPages);
}

// Update page numbers in pagination
function updatePageNumbers(totalPages) {
    const pageNumbersContainer = document.querySelector('.page-numbers');
    if (!pageNumbersContainer) return;
    
    let pageNumbers = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        // Show first page, current page with neighbors, and last page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        pageNumbers.push(1);
        
        if (startPage > 2) {
            pageNumbers.push('...');
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }
        
        if (endPage < totalPages) {
            pageNumbers.push(totalPages);
        }
    }
    
    // Render page numbers
    pageNumbersContainer.innerHTML = pageNumbers.map(page => {
        if (page === '...') {
            return '<span class="ellipsis">...</span>';
        }
        return `<button class="page-number ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
    }).join('');
    
    // Add event listeners to page numbers
    document.querySelectorAll('.page-number').forEach(btn => {
        if (btn.textContent !== '...') {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (page !== currentPage) {
                    currentPage = page;
                    updateUI();
                    scrollToTop();
                }
            });
        }
    });
}

// Update results count
function updateResultsCount(startIndex, endIndex, total) {
    if (!showingCountEl || !totalCountEl) return;
    
    showingCountEl.textContent = `${startIndex + 1}-${Math.min(endIndex, total)}`;
    totalCountEl.textContent = total;
}

// Update view (grid or list)
function updateView() {
    if (!productsGrid) return;
    
    if (currentView === 'list') {
        productsGrid.classList.add('list-view');
    } else {
        productsGrid.classList.remove('list-view');
    }
    
    // Update product cards
    document.querySelectorAll('.product-card').forEach(card => {
        if (currentView === 'list') {
            card.classList.add('list-view');
        } else {
            card.classList.remove('list-view');
        }
    });
}

// Reset all filters
function resetFilters() {
    // Reset category
    currentCategory = 'all';
    
    // Reset search
    if (searchInput) {
        searchInput.value = '';
        currentSearch = '';
    }
    
    // Reset price range
    priceRange = { min: 0, max: 1000 };
    if (minPriceInput) minPriceInput.value = priceRange.min;
    if (maxPriceInput) maxPriceInput.value = priceRange.max;
    
    // Reset sort
    currentSort = 'featured';
    if (sortBy) sortBy.value = currentSort;
    
    // Reset view
    currentView = 'grid';
    viewOptions.forEach(option => {
        if (option.getAttribute('data-view') === 'grid') {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Reset pagination
    currentPage = 1;
    
    // Update UI
    filterProducts();
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of the products section
    const productsSection = document.querySelector('.products-section .container');
    if (productsSection) {
        productsSection.insertBefore(errorDiv, productsSection.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Scroll to top of the page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions available globally
window.DryFruitsProducts = {
    loadProducts,
    filterProducts,
    sortProducts,
    setView,
    setCategory,
    updateUI
};

// Products page functionality

let currentPage = 1;
let itemsPerPage = 12;
let filteredBooks = [];
let currentFilters = {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'name-asc'
};

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('products.html')) {
        initializeProductsPage();
        setupEventListeners();
        loadURLParams();
    }
});

// Initialize products page
function initializeProductsPage() {
    filteredBooks = [...books];
    applyFilters();
    updateProductsDisplay();
    updateResultsCount();
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            currentFilters.search = this.value;
            applyFilters();
        }, 300));
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentFilters.category = this.value;
            applyFilters();
        });
    }
    
    // Price filters
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    
    if (minPriceInput) {
        minPriceInput.addEventListener('change', function() {
            currentFilters.minPrice = this.value;
            applyFilters();
        });
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', function() {
            currentFilters.maxPrice = this.value;
            applyFilters();
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentFilters.sort = this.value;
            applyFilters();
        });
    }
    
    // View toggle buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const productsGrid = document.getElementById('products-grid');
            if (this.dataset.view === 'list') {
                productsGrid.classList.add('list-view');
            } else {
                productsGrid.classList.remove('list-view');
            }
        });
    });
}

// Load URL parameters
function loadURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        currentFilters.category = category;
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        applyFilters();
    }
}

// Apply filters
function applyFilters() {
    filteredBooks = books.filter(book => {
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const matchesSearch = 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm);
            if (!matchesSearch) return false;
        }
        
        // Category filter
        if (currentFilters.category && book.category !== currentFilters.category) {
            return false;
        }
        
        // Price filters
        if (currentFilters.minPrice && book.price < parseFloat(currentFilters.minPrice)) {
            return false;
        }
        
        if (currentFilters.maxPrice && book.price > parseFloat(currentFilters.maxPrice)) {
            return false;
        }
        
        return true;
    });
    
    // Apply sorting
    applySorting();
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    updateProductsDisplay();
    updateResultsCount();
    updatePagination();
}

// Apply sorting
function applySorting() {
    switch (currentFilters.sort) {
        case 'name-asc':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'price-asc':
            filteredBooks.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredBooks.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
    }
}

// Update products display
function updateProductsDisplay() {
    const productsGrid = document.getElementById('products-grid');
    const productsLoading = document.getElementById('products-loading');
    const noResults = document.getElementById('no-results');
    
    if (!productsGrid) return;
    
    // Show loading
    if (productsLoading) productsLoading.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    productsGrid.style.opacity = '0.5';
    
    setTimeout(() => {
        if (filteredBooks.length === 0) {
            productsGrid.innerHTML = '';
            if (productsLoading) productsLoading.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const booksToShow = filteredBooks.slice(startIndex, endIndex);
        
        // Generate HTML
        productsGrid.innerHTML = booksToShow.map(book => createBookCard(book)).join('');
        
        // Hide loading
        if (productsLoading) productsLoading.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        productsGrid.style.opacity = '1';
        
        // Add animation
        const bookCards = productsGrid.querySelectorAll('.book-card');
        bookCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }, 500);
}

// Create book card HTML
function createBookCard(book) {
    return `
        <div class="book-card" onclick="showBookModal(${book.id})">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}" loading="lazy">
                ${book.originalPrice ? '<div class="book-badge">Endirim</div>' : ''}
                ${book.stock <= 0 ? '<div class="book-badge" style="background-color: var(--error-color);">Stokda yoxdur</div>' : ''}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <span class="book-category">${getCategoryName(book.category)}</span>
                <div class="book-rating">
                    <div class="stars">${generateStars(book.rating || 0)}</div>
                    <span class="rating-text">(${book.ratingCount || 0})</span>
                </div>
                <div class="book-price">
                    <div class="price-info">
                        <span class="current-price">${formatPrice(book.price)}</span> ₼
                        ${book.originalPrice ? `<span class="original-price">${formatPrice(book.originalPrice)} ₼</span>` : ''}
                    </div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary ${book.stock <= 0 ? 'btn-disabled' : ''}" 
                            onclick="event.stopPropagation(); addToCart(${book.id})"
                            ${book.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${book.stock <= 0 ? 'Stokda yoxdur' : 'Səbətə əlavə et'}
                    </button>
                    <button class="favorite-btn ${isFavorite(book.id) ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleFavorite(${book.id})"
                            title="${isFavorite(book.id) ? 'Sevimlilər siyahısından çıxar' : 'Sevimliləra əlavə et'}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = filteredBooks.length;
    }
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    
    currentPage = page;
    updateProductsDisplay();
    updatePagination();
    
    // Scroll to top of products
    const productsContainer = document.querySelector('.products-container');
    if (productsContainer) {
        productsContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Toggle filters (mobile)
function toggleFilters() {
    const filtersContent = document.getElementById('filters-content');
    if (filtersContent) {
        filtersContent.classList.toggle('active');
    }
}

// Clear filters
function clearFilters() {
    currentFilters = {
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        sort: 'name-asc'
    };
    
    // Reset form inputs
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortFilter = document.getElementById('sort-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (sortFilter) sortFilter.value = 'name-asc';
    
    applyFilters();
}

// Debounce function
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

// Quick filter functions
window.filterByCategory = function(category) {
    currentFilters.category = category;
    
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.value = category;
    }
    
    applyFilters();
    
    // Scroll to products if on same page
    if (window.location.pathname.includes('products.html')) {
        const productsContainer = document.querySelector('.products-container');
        if (productsContainer) {
            productsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Export functions
window.productsPage = {
    applyFilters,
    clearFilters,
    changePage,
    toggleFilters
};
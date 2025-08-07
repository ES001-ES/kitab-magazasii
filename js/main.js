// Main JavaScript functionality

// Global variables
let books = [];
let currentUser = null;
let cart = [];
let favorites = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1500);
});

// Initialize application
function initializeApp() {
    loadBooks();
    loadUserState();
    updateNavCounts();
    
    // Initialize featured books on homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadFeaturedBooks();
    }
}

// Sample books data
function loadBooks() {
    const sampleBooks = [
        {
            id: 1,
            title: "Çılğın Türk",
            author: "Banine",
            category: "roman",
            price: 15.99,
            originalPrice: 19.99,
            image: "https://images.pexels.com/photos/1785493/pexels-photo-1785493.jpeg",
            description: "Azərbaycanın məşhur yazıçısı Baninənin avtobioqrafik romanı.",
            rating: 4.5,
            ratingCount: 128,
            stock: 25,
            featured: true
        },
        {
            id: 2,
            title: "Koroğlu",
            author: "Xalq yaradıcılığı",
            category: "tarixi",
            price: 12.50,
            originalPrice: 16.00,
            image: "https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg",
            description: "Azərbaycan xalqının qəhrəmanlıq dastanı.",
            rating: 4.8,
            ratingCount: 95,
            stock: 18,
            featured: true
        },
        {
            id: 3,
            title: "Aşıq Qərib",
            author: "Xalq yaradıcılığı",
            category: "poeziya",
            price: 10.75,
            originalPrice: 13.50,
            image: "https://images.pexels.com/photos/1543586/pexels-photo-1543586.jpeg",
            description: "Azərbaycan folklor ədəbiyyatının şah əsəri.",
            rating: 4.3,
            ratingCount: 76,
            stock: 30,
            featured: true
        },
        {
            id: 4,
            title: "Dədə Qorqud",
            author: "Xalq yaradıcılığı",
            category: "tarixi",
            price: 18.25,
            originalPrice: 22.00,
            image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg",
            description: "Türk xalqlarının qədim dastanı.",
            rating: 4.7,
            ratingCount: 142,
            stock: 12,
            featured: true
        },
        {
            id: 5,
            title: "Bir Gəncin Xatirələri",
            author: "Yusif Vəzir Çəmənzəminli",
            category: "roman",
            price: 14.90,
            image: "https://images.pexels.com/photos/1426674/pexels-photo-1426674.jpeg",
            description: "XX əsr Azərbaycan ədəbiyyatının klassik əsəri.",
            rating: 4.4,
            ratingCount: 89,
            stock: 22
        },
        {
            id: 6,
            title: "İki Gün",
            author: "Müstəqil Axundov",
            category: "roman",
            price: 13.75,
            image: "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg",
            description: "Müasir Azərbaycan romanının nümunəsi.",
            rating: 4.2,
            ratingCount: 67,
            stock: 35
        },
        {
            id: 7,
            title: "Uşaq Ensiklopediyası",
            author: "Müxtəlif müəlliflər",
            category: "uşaq",
            price: 25.00,
            image: "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg",
            description: "Uşaqlar üçün faydalı məlumatlar ensiklopediyası.",
            rating: 4.6,
            ratingCount: 203,
            stock: 40
        },
        {
            id: 8,
            title: "Fizika Əsasları",
            author: "Dr. Əli Həsənov",
            category: "elmi",
            price: 32.50,
            image: "https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg",
            description: "Orta məktəb üçün fizika dərsliyi.",
            rating: 4.1,
            ratingCount: 45,
            stock: 15
        }
    ];

    // Save to localStorage if not exists
    if (!localStorage.getItem('books')) {
        localStorage.setItem('books', JSON.stringify(sampleBooks));
    }
    
    books = JSON.parse(localStorage.getItem('books') || '[]');
}

// Load user state
function loadUserState() {
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    updateAuthDisplay();
}

// Update authentication display
function updateAuthDisplay() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const userBonus = document.getElementById('user-bonus');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = currentUser.name;
        if (userBonus) userBonus.textContent = currentUser.bonus || 0;
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Update nav counts
function updateNavCounts() {
    const cartCount = document.getElementById('cart-count');
    const favoritesCount = document.getElementById('favorites-count');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
        favoritesCount.style.display = favorites.length > 0 ? 'flex' : 'none';
    }
}

// Load featured books
function loadFeaturedBooks() {
    const featuredBooksContainer = document.getElementById('featured-books');
    if (!featuredBooksContainer) return;
    
    const featuredBooks = books.filter(book => book.featured).slice(0, 4);
    
    featuredBooksContainer.innerHTML = featuredBooks.map(book => `
        <div class="book-card" onclick="showBookModal(${book.id})">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
                ${book.originalPrice ? '<div class="book-badge">Endirim</div>' : ''}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <span class="book-category">${getCategoryName(book.category)}</span>
                <div class="book-rating">
                    <div class="stars">${generateStars(book.rating)}</div>
                    <span class="rating-text">(${book.ratingCount || 0})</span>
                </div>
                <div class="book-price">
                    <div class="price-info">
                        <span class="current-price">${book.price}</span> ₼
                        ${book.originalPrice ? `<span class="original-price">${book.originalPrice} ₼</span>` : ''}
                    </div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${book.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Səbətə əlavə et
                    </button>
                    <button class="favorite-btn ${isFavorite(book.id) ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleFavorite(${book.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate stars HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star"><i class="fas fa-star"></i></span>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<span class="star"><i class="fas fa-star-half-alt"></i></span>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star empty"><i class="far fa-star"></i></span>';
    }
    
    return starsHTML;
}

// Get category name in Azerbaijani
function getCategoryName(category) {
    const categories = {
        'roman': 'Roman',
        'elmi': 'Elmi',
        'tarixi': 'Tarixi',
        'uşaq': 'Uşaq',
        'poeziya': 'Poeziya',
        'dram': 'Dram'
    };
    return categories[category] || category;
}

// Check if book is favorite
function isFavorite(bookId) {
    return favorites.includes(bookId);
}

// Toggle favorite
function toggleFavorite(bookId) {
    if (!currentUser) {
        showModal('login-required-modal');
        return;
    }
    
    const index = favorites.indexOf(bookId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(bookId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateNavCounts();
    
    // Update UI
    const favoriteButtons = document.querySelectorAll(`.favorite-btn`);
    favoriteButtons.forEach(btn => {
        if (btn.onclick.toString().includes(bookId)) {
            btn.classList.toggle('active', isFavorite(bookId));
        }
    });
    
    showToast(isFavorite(bookId) ? 'Sevimliləra əlavə edildi' : 'Sevimlilər siyahısından çıxarıldı');
}

// Add to cart
function addToCart(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    if (book.stock <= 0) {
        showToast('Bu kitab stokda yoxdur', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.bookId === bookId);
    
    if (existingItem) {
        if (existingItem.quantity < book.stock) {
            existingItem.quantity += 1;
        } else {
            showToast('Stok limiti', 'warning');
            return;
        }
    } else {
        cart.push({
            bookId: bookId,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateNavCounts();
    showToast('Səbətə əlavə edildi');
}

// Show book modal
function showBookModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    // Update modal content
    document.getElementById('modal-book-title').textContent = book.title;
    document.getElementById('modal-book-title-full').textContent = book.title;
    document.getElementById('modal-book-author').textContent = book.author;
    document.getElementById('modal-book-category').textContent = getCategoryName(book.category);
    document.getElementById('modal-book-price').textContent = book.price;
    document.getElementById('modal-book-description').textContent = book.description;
    document.getElementById('modal-book-image').src = book.image;
    document.getElementById('modal-book-rating').innerHTML = generateStars(book.rating);
    document.getElementById('modal-rating-count').textContent = book.ratingCount || 0;
    
    // Update favorite button
    const favoriteIcon = document.getElementById('modal-favorite-icon');
    favoriteIcon.className = isFavorite(bookId) ? 'fas fa-heart' : 'far fa-heart';
    
    // Store current book ID for modal actions
    modal.dataset.bookId = bookId;
    
    showModal('product-modal');
}

// Add to cart from modal
function addToCartFromModal() {
    const modal = document.getElementById('product-modal');
    const bookId = parseInt(modal.dataset.bookId);
    addToCart(bookId);
}

// Toggle favorite from modal
function toggleFavoriteFromModal() {
    const modal = document.getElementById('product-modal');
    const bookId = parseInt(modal.dataset.bookId);
    toggleFavorite(bookId);
    
    // Update modal favorite icon
    const favoriteIcon = document.getElementById('modal-favorite-icon');
    favoriteIcon.className = isFavorite(bookId) ? 'fas fa-heart' : 'far fa-heart';
}

// Filter by category
function filterByCategory(category) {
    window.location.href = `products.html?category=${category}`;
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'exclamation'}-circle"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles if not exists
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border-left: 4px solid;
            }
            .toast-success { border-left-color: #10b981; }
            .toast-error { border-left-color: #ef4444; }
            .toast-warning { border-left-color: #f59e0b; }
            .toast.show { transform: translateX(0); }
            .toast i { color: inherit; }
            .toast-success i { color: #10b981; }
            .toast-error i { color: #ef4444; }
            .toast-warning i { color: #f59e0b; }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Logout
function logout() {
    currentUser = null;
    cart = [];
    favorites = [];
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    
    updateAuthDisplay();
    updateNavCounts();
    
    showToast('Uğurla çıxış etdiniz');
    
    // Redirect to home page
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// Utility functions
function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ');
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Export functions for other scripts
window.bookstore = {
    books,
    currentUser,
    cart,
    favorites,
    addToCart,
    toggleFavorite,
    showModal,
    closeModal,
    showToast,
    updateNavCounts,
    formatPrice,
    generateStars,
    getCategoryName
};
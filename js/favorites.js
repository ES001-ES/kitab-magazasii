// Favorites functionality

// Initialize favorites page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('favorites.html')) {
        initializeFavoritesPage();
    }
});

// Initialize favorites page
function initializeFavoritesPage() {
    loadFavoriteBooks();
    updateFavoritesCount();
}

// Load favorite books
function loadFavoriteBooks() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyFavorites = document.getElementById('empty-favorites');
    
    if (!favoritesGrid) return;
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '';
        if (emptyFavorites) emptyFavorites.style.display = 'block';
        return;
    }
    
    if (emptyFavorites) emptyFavorites.style.display = 'none';
    
    const favoriteBooks = books.filter(book => favorites.includes(book.id));
    
    favoritesGrid.innerHTML = favoriteBooks.map(book => `
        <div class="book-card" onclick="showBookModal(${book.id})">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
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
                    <button class="favorite-btn active" 
                            onclick="event.stopPropagation(); removeFavorite(${book.id})"
                            title="Sevimlilər siyahısından çıxar">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add animation
    const bookCards = favoritesGrid.querySelectorAll('.book-card');
    bookCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Update favorites count
function updateFavoritesCount() {
    const totalFavorites = document.getElementById('total-favorites');
    if (totalFavorites) {
        totalFavorites.textContent = favorites.length;
    }
}

// Remove from favorites
function removeFavorite(bookId) {
    const index = favorites.indexOf(bookId);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Update display
        loadFavoriteBooks();
        updateFavoritesCount();
        updateNavCounts();
        
        showToast('Sevimlilər siyahısından çıxarıldı');
    }
}

// Clear all favorites
function clearFavorites() {
    if (favorites.length === 0) return;
    
    if (confirm('Bütün sevimli kitabları silmək istədiyinizə əminsiniz?')) {
        favorites = [];
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Update display
        loadFavoriteBooks();
        updateFavoritesCount();
        updateNavCounts();
        
        showToast('Bütün sevimlilər silindi');
    }
}

// Add all favorites to cart
function addAllToCart() {
    if (favorites.length === 0) {
        showToast('Sevimli kitabınız yoxdur', 'warning');
        return;
    }
    
    if (!currentUser) {
        showModal('login-required-modal');
        return;
    }
    
    let addedCount = 0;
    let skippedCount = 0;
    
    favorites.forEach(bookId => {
        const book = books.find(b => b.id === bookId);
        if (!book || book.stock <= 0) {
            skippedCount++;
            return;
        }
        
        const existingItem = cart.find(item => item.bookId === bookId);
        
        if (existingItem) {
            if (existingItem.quantity < book.stock) {
                existingItem.quantity += 1;
                addedCount++;
            } else {
                skippedCount++;
            }
        } else {
            cart.push({
                bookId: bookId,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateNavCounts();
    }
    
    // Show appropriate message
    if (addedCount > 0 && skippedCount === 0) {
        showToast(`${addedCount} kitab səbətə əlavə edildi`);
    } else if (addedCount > 0 && skippedCount > 0) {
        showToast(`${addedCount} kitab əlavə edildi, ${skippedCount} kitab atlandı`, 'warning');
    } else {
        showToast('Heç bir kitab əlavə edilə bilmədi', 'error');
    }
}

// Filter favorites by category
function filterFavoritesByCategory(category) {
    const favoritesGrid = document.getElementById('favorites-grid');
    if (!favoritesGrid) return;
    
    const favoriteBooks = books.filter(book => 
        favorites.includes(book.id) && 
        (category === '' || book.category === category)
    );
    
    favoritesGrid.innerHTML = favoriteBooks.map(book => createFavoriteBookCard(book)).join('');
}

// Create favorite book card
function createFavoriteBookCard(book) {
    return `
        <div class="book-card" onclick="showBookModal(${book.id})">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
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
                    <button class="favorite-btn active" 
                            onclick="event.stopPropagation(); removeFavorite(${book.id})"
                            title="Sevimlilər siyahısından çıxar">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Sort favorites
function sortFavorites(sortBy) {
    const favoritesGrid = document.getElementById('favorites-grid');
    if (!favoritesGrid) return;
    
    let favoriteBooks = books.filter(book => favorites.includes(book.id));
    
    switch (sortBy) {
        case 'name-asc':
            favoriteBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            favoriteBooks.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'price-asc':
            favoriteBooks.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            favoriteBooks.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            favoriteBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'date-added':
            // Sort by the order they were added to favorites
            favoriteBooks.sort((a, b) => {
                const aIndex = favorites.indexOf(a.id);
                const bIndex = favorites.indexOf(b.id);
                return bIndex - aIndex; // Most recently added first
            });
            break;
    }
    
    favoritesGrid.innerHTML = favoriteBooks.map(book => createFavoriteBookCard(book)).join('');
}

// Export favorites data
function exportFavorites() {
    if (favorites.length === 0) {
        showToast('Sevimli kitabınız yoxdur', 'warning');
        return;
    }
    
    const favoriteBooks = books.filter(book => favorites.includes(book.id));
    const exportData = favoriteBooks.map(book => ({
        title: book.title,
        author: book.author,
        category: getCategoryName(book.category),
        price: book.price + ' ₼'
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'sevimli-kitablar.json';
    link.click();
    
    showToast('Sevimli kitablar ixrac edildi');
}

// Share favorites
function shareFavorites() {
    if (favorites.length === 0) {
        showToast('Sevimli kitabınız yoxdur', 'warning');
        return;
    }
    
    const favoriteBooks = books.filter(book => favorites.includes(book.id));
    const shareText = `Mənim sevimli kitablarım:\n\n${favoriteBooks.map(book => 
        `📚 ${book.title} - ${book.author}`
    ).join('\n')}\n\nKitab Dünyası - kitabdunyasi.az`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Sevimli Kitablarım',
            text: shareText
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Sevimli kitablar panoya kopyalandı');
        });
    }
}

// Export functions
window.favoritesPage = {
    removeFavorite,
    clearFavorites,
    addAllToCart,
    filterFavoritesByCategory,
    sortFavorites,
    exportFavorites,
    shareFavorites
};
// Cart functionality

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
        setupCartEventListeners();
    }
});

// Initialize cart page
function initializeCartPage() {
    loadCartItems();
    updateCartSummary();
    updateBonusSection();
}

// Setup event listeners for cart
function setupCartEventListeners() {
    // Bonus usage checkbox
    const useBonusCheckbox = document.getElementById('use-bonus');
    const bonusAmountInput = document.getElementById('bonus-amount');
    
    if (useBonusCheckbox && bonusAmountInput) {
        useBonusCheckbox.addEventListener('change', function() {
            bonusAmountInput.disabled = !this.checked;
            if (!this.checked) {
                bonusAmountInput.value = '';
            }
            updateCartSummary();
        });
        
        bonusAmountInput.addEventListener('input', function() {
            const maxBonus = currentUser ? currentUser.bonus : 0;
            const minBonus = 10;
            const enteredAmount = parseInt(this.value) || 0;
            
            if (enteredAmount > maxBonus) {
                this.value = maxBonus;
            }
            
            if (enteredAmount < minBonus && enteredAmount > 0) {
                this.value = minBonus;
            }
            
            updateCartSummary();
        });
    }
}

// Load cart items
function loadCartItems() {
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsList) return;
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItemsList.innerHTML = cart.map(item => {
        const book = books.find(b => b.id === item.bookId);
        if (!book) return '';
        
        return `
            <div class="cart-item" data-book-id="${book.id}">
                <div class="cart-item-image">
                    <img src="${book.image}" alt="${book.title}">
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${book.title}</h3>
                    <p class="cart-item-author">Müəllif: ${book.author}</p>
                    <div class="cart-item-price">${formatPrice(book.price)} ₼</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${book.id}, ${item.quantity - 1})"
                                    ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${book.id}, ${item.quantity + 1})"
                                    ${item.quantity >= book.stock ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${book.id})" title="Məhsulu sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update quantity
function updateQuantity(bookId, newQuantity) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    if (newQuantity <= 0) {
        removeFromCart(bookId);
        return;
    }
    
    if (newQuantity > book.stock) {
        showToast('Stok limiti aşıldı', 'warning');
        return;
    }
    
    const cartItem = cart.find(item => item.bookId === bookId);
    if (cartItem) {
        cartItem.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update display
        loadCartItems();
        updateCartSummary();
        updateNavCounts();
        
        showToast('Miqdar yeniləndi');
    }
}

// Remove from cart
function removeFromCart(bookId) {
    const index = cart.findIndex(item => item.bookId === bookId);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update display
        loadCartItems();
        updateCartSummary();
        updateNavCounts();
        
        showToast('Məhsul səbətdən çıxarıldı');
    }
}

// Clear cart
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Səbəti təmizləmək istədiyinizə əminsiniz?')) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update display
        loadCartItems();
        updateCartSummary();
        updateNavCounts();
        
        showToast('Səbət təmizləndi');
    }
}

// Update cart summary
function updateCartSummary() {
    const totalItemsSpan = document.getElementById('total-items');
    const subtotalSpan = document.getElementById('subtotal');
    const shippingCostSpan = document.getElementById('shipping-cost');
    const totalAmountSpan = document.getElementById('total-amount');
    const bonusDiscountRow = document.getElementById('bonus-discount');
    const bonusDiscountAmount = document.getElementById('bonus-discount-amount');
    
    if (!totalItemsSpan || !subtotalSpan || !totalAmountSpan) return;
    
    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;
    
    cart.forEach(item => {
        const book = books.find(b => b.id === item.bookId);
        if (book) {
            subtotal += book.price * item.quantity;
            totalItems += item.quantity;
        }
    });
    
    // Shipping calculation
    const shippingCost = subtotal >= 50 ? 0 : 5; // Free shipping over 50 AZN
    
    // Bonus discount calculation
    let bonusDiscount = 0;
    const useBonusCheckbox = document.getElementById('use-bonus');
    const bonusAmountInput = document.getElementById('bonus-amount');
    
    if (useBonusCheckbox && bonusAmountInput && useBonusCheckbox.checked) {
        const bonusAmount = parseInt(bonusAmountInput.value) || 0;
        bonusDiscount = bonusAmount * 0.01; // 1 bonus = 0.01 AZN
    }
    
    const total = Math.max(0, subtotal + shippingCost - bonusDiscount);
    
    // Update display
    totalItemsSpan.textContent = totalItems;
    subtotalSpan.textContent = formatPrice(subtotal) + ' ₼';
    if (shippingCostSpan) {
        shippingCostSpan.textContent = shippingCost === 0 ? 'Pulsuz' : formatPrice(shippingCost) + ' ₼';
    }
    totalAmountSpan.textContent = formatPrice(total) + ' ₼';
    
    // Show/hide bonus discount
    if (bonusDiscountRow && bonusDiscountAmount) {
        if (bonusDiscount > 0) {
            bonusDiscountRow.style.display = 'flex';
            bonusDiscountAmount.textContent = formatPrice(bonusDiscount);
        } else {
            bonusDiscountRow.style.display = 'none';
        }
    }
}

// Update bonus section
function updateBonusSection() {
    const userBonusBalance = document.getElementById('user-bonus-balance');
    const bonusAmountInput = document.getElementById('bonus-amount');
    
    if (userBonusBalance) {
        const bonus = currentUser ? currentUser.bonus : 0;
        userBonusBalance.textContent = bonus;
        
        if (bonusAmountInput) {
            bonusAmountInput.max = bonus;
            bonusAmountInput.placeholder = `Maksimum ${bonus}`;
        }
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Səbətiniz boşdur', 'warning');
        return;
    }
    
    if (!currentUser) {
        showModal('login-required-modal');
        return;
    }
    
    // Check stock availability
    let stockError = false;
    cart.forEach(item => {
        const book = books.find(b => b.id === item.bookId);
        if (!book || book.stock < item.quantity) {
            stockError = true;
        }
    });
    
    if (stockError) {
        showToast('Bəzi məhsullar stokda yoxdur', 'error');
        loadCartItems(); // Refresh cart to show current stock
        return;
    }
    
    // Save cart data for checkout
    const checkoutData = {
        items: cart.map(item => {
            const book = books.find(b => b.id === item.bookId);
            return {
                bookId: item.bookId,
                title: book.title,
                author: book.author,
                price: book.price,
                quantity: item.quantity,
                image: book.image
            };
        }),
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        bonusDiscount: calculateBonusDiscount(),
        total: calculateTotal()
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    window.location.href = 'checkout.html';
}

// Calculate functions
function calculateSubtotal() {
    return cart.reduce((total, item) => {
        const book = books.find(b => b.id === item.bookId);
        return total + (book ? book.price * item.quantity : 0);
    }, 0);
}

function calculateShipping() {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 5;
}

function calculateBonusDiscount() {
    const useBonusCheckbox = document.getElementById('use-bonus');
    const bonusAmountInput = document.getElementById('bonus-amount');
    
    if (useBonusCheckbox && bonusAmountInput && useBonusCheckbox.checked) {
        const bonusAmount = parseInt(bonusAmountInput.value) || 0;
        return bonusAmount * 0.01;
    }
    
    return 0;
}

function calculateTotal() {
    return Math.max(0, calculateSubtotal() + calculateShipping() - calculateBonusDiscount());
}

// Add animation to cart items
function animateCartItem(element, type = 'add') {
    if (type === 'add') {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 100);
    } else if (type === 'remove') {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateX(-100%)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.remove();
        }, 300);
    }
}

// Export functions
window.cartPage = {
    updateQuantity,
    removeFromCart,
    clearCart,
    proceedToCheckout,
    updateCartSummary
};
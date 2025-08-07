// Checkout functionality

let checkoutData = null;

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        initializeCheckoutPage();
        setupCheckoutEventListeners();
    }
});

// Initialize checkout page
function initializeCheckoutPage() {
    // Check if user is logged in
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load checkout data
    checkoutData = JSON.parse(localStorage.getItem('checkoutData') || 'null');
    
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    loadOrderItems();
    loadOrderSummary();
    prefillBillingInfo();
}

// Setup checkout event listeners
function setupCheckoutEventListeners() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            const selectedMethod = this.querySelector('input[type="radio"]').value;
            const cardDetails = document.getElementById('card-details');
            
            if (cardDetails) {
                cardDetails.style.display = selectedMethod === 'card' ? 'block' : 'none';
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Card expiry formatting
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
}

// Load order items
function loadOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer || !checkoutData) return;
    
    orderItemsContainer.innerHTML = checkoutData.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="order-item-info">
                <div class="order-item-title">${item.title}</div>
                <div class="order-item-details">${item.author} × ${item.quantity}</div>
                <div class="order-item-price">${formatPrice(item.price * item.quantity)} ₼</div>
            </div>
        </div>
    `).join('');
}

// Load order summary
function loadOrderSummary() {
    if (!checkoutData) return;
    
    const itemsTotal = document.getElementById('items-total');
    const shippingTotal = document.getElementById('shipping-total');
    const bonusDiscountRow = document.getElementById('bonus-discount-row');
    const bonusDiscountTotal = document.getElementById('bonus-discount-total');
    const finalTotal = document.getElementById('final-total');
    
    if (itemsTotal) itemsTotal.textContent = formatPrice(checkoutData.subtotal) + ' ₼';
    if (shippingTotal) {
        shippingTotal.textContent = checkoutData.shipping === 0 ? 'Pulsuz' : formatPrice(checkoutData.shipping) + ' ₼';
    }
    
    if (bonusDiscountRow && bonusDiscountTotal) {
        if (checkoutData.bonusDiscount > 0) {
            bonusDiscountRow.style.display = 'flex';
            bonusDiscountTotal.textContent = formatPrice(checkoutData.bonusDiscount);
        } else {
            bonusDiscountRow.style.display = 'none';
        }
    }
    
    if (finalTotal) finalTotal.textContent = formatPrice(checkoutData.total) + ' ₼';
}

// Prefill billing information
function prefillBillingInfo() {
    if (!currentUser) return;
    
    const billingName = document.getElementById('billing-name');
    const billingEmail = document.getElementById('billing-email');
    
    if (billingName) billingName.value = currentUser.name || '';
    if (billingEmail) billingEmail.value = currentUser.email || '';
}

// Process payment
function processPayment(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateCheckoutForm()) {
        return false;
    }
    
    // Show processing modal
    showModal('payment-processing-modal');
    
    // Simulate payment processing
    setTimeout(() => {
        processPaymentSuccess();
    }, 3000);
    
    return false;
}

// Validate checkout form
function validateCheckoutForm() {
    const requiredFields = [
        'billing-name',
        'billing-email',
        'billing-phone',
        'billing-city',
        'billing-address'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else if (field) {
            field.style.borderColor = 'var(--gray-200)';
        }
    });
    
    // Validate payment method
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPaymentMethod) {
        showToast('Ödəniş üsulunu seçin', 'error');
        isValid = false;
    }
    
    // Validate card details if card payment is selected
    if (selectedPaymentMethod && selectedPaymentMethod.value === 'card') {
        const cardFields = ['card-number', 'card-name', 'card-expiry', 'card-cvv'];
        
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.style.borderColor = 'var(--error-color)';
                isValid = false;
            } else if (field) {
                field.style.borderColor = 'var(--gray-200)';
            }
        });
        
        // Validate card number format
        const cardNumber = document.getElementById('card-number');
        if (cardNumber && cardNumber.value.replace(/\s/g, '').length !== 16) {
            cardNumber.style.borderColor = 'var(--error-color)';
            showToast('Kart nömrəsi 16 rəqəm olmalıdır', 'error');
            isValid = false;
        }
        
        // Validate expiry date
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry && !isValidExpiryDate(cardExpiry.value)) {
            cardExpiry.style.borderColor = 'var(--error-color)';
            showToast('Kart tarixi düzgün deyil', 'error');
            isValid = false;
        }
        
        // Validate CVV
        const cardCvv = document.getElementById('card-cvv');
        if (cardCvv && cardCvv.value.length !== 3) {
            cardCvv.style.borderColor = 'var(--error-color)';
            showToast('CVV 3 rəqəm olmalıdır', 'error');
            isValid = false;
        }
    }
    
    if (!isValid) {
        showToast('Zəhmət olmasa bütün sahələri doldurun', 'error');
    }
    
    return isValid;
}

// Validate expiry date
function isValidExpiryDate(expiry) {
    if (!expiry || expiry.length !== 5) return false;
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const cardMonth = parseInt(month);
    const cardYear = parseInt(year);
    
    if (cardMonth < 1 || cardMonth > 12) return false;
    if (cardYear < currentYear) return false;
    if (cardYear === currentYear && cardMonth < currentMonth) return false;
    
    return true;
}

// Process payment success
function processPaymentSuccess() {
    // Close processing modal
    closeModal('payment-processing-modal');
    
    // Generate order
    const order = createOrder();
    
    // Save order
    saveOrder(order);
    
    // Update user bonus
    updateUserBonus(order);
    
    // Update book stock
    updateBookStock();
    
    // Clear cart
    clearCartAfterOrder();
    
    // Show success modal
    showPaymentSuccess(order);
}

// Create order
function createOrder() {
    const orderNumber = generateOrderNumber();
    const billingInfo = getBillingInfo();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    return {
        id: orderNumber,
        orderNumber: orderNumber,
        userId: currentUser.id,
        items: checkoutData.items,
        billingInfo: billingInfo,
        paymentMethod: paymentMethod,
        subtotal: checkoutData.subtotal,
        shipping: checkoutData.shipping,
        bonusDiscount: checkoutData.bonusDiscount,
        total: checkoutData.total,
        status: 'completed',
        orderDate: new Date().toISOString(),
        notes: document.getElementById('order-notes')?.value || ''
    };
}

// Get billing info
function getBillingInfo() {
    return {
        name: document.getElementById('billing-name').value,
        email: document.getElementById('billing-email').value,
        phone: document.getElementById('billing-phone').value,
        city: document.getElementById('billing-city').value,
        address: document.getElementById('billing-address').value
    };
}

// Save order
function saveOrder(order) {
    // Save to user's orders
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        if (!users[userIndex].orders) {
            users[userIndex].orders = [];
        }
        users[userIndex].orders.push(order);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Save to global orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Update user bonus
function updateUserBonus(order) {
    const bonusEarned = Math.floor(order.total); // 1 bonus per 1 AZN
    const bonusUsed = Math.floor(checkoutData.bonusDiscount * 100); // Convert back to bonus points
    
    currentUser.bonus = (currentUser.bonus || 0) + bonusEarned - bonusUsed;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        users[userIndex].bonus = currentUser.bonus;
        
        // Add bonus history
        if (!users[userIndex].bonusHistory) {
            users[userIndex].bonusHistory = [];
        }
        
        if (bonusUsed > 0) {
            users[userIndex].bonusHistory.push({
                type: 'Sifariş üçün istifadə',
                amount: -bonusUsed,
                date: new Date().toISOString(),
                orderId: order.orderNumber
            });
        }
        
        if (bonusEarned > 0) {
            users[userIndex].bonusHistory.push({
                type: 'Sifariş bonusu',
                amount: bonusEarned,
                date: new Date().toISOString(),
                orderId: order.orderNumber
            });
        }
        
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Update book stock
function updateBookStock() {
    checkoutData.items.forEach(item => {
        const bookIndex = books.findIndex(b => b.id === item.bookId);
        if (bookIndex > -1) {
            books[bookIndex].stock = Math.max(0, books[bookIndex].stock - item.quantity);
        }
    });
    
    localStorage.setItem('books', JSON.stringify(books));
}

// Clear cart after order
function clearCartAfterOrder() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.removeItem('checkoutData');
}

// Show payment success
function showPaymentSuccess(order) {
    const orderNumberSpan = document.getElementById('order-number');
    if (orderNumberSpan) {
        orderNumberSpan.textContent = '#' + order.orderNumber;
    }
    
    showModal('payment-success-modal');
}

// Generate order number
function generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return timestamp.slice(-6) + random;
}

// Format price
function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

// Export functions
window.checkoutPage = {
    processPayment,
    validateCheckoutForm
};
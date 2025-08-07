// Payment Page Functions
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    renderPaymentSummary();
    setupPaymentForm();
});

function renderPaymentSummary() {
    const container = document.getElementById('payment-order-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    cart.forEach(item => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        paymentItem.innerHTML = `
            <div class="payment-item-info">
                <strong>${item.title}</strong><br>
                <small><i class="fas fa-user"></i> ${item.author}</small><br>
                <small>${item.quantity} x ${item.price} ₼</small>
            </div>
            <span class="payment-item-price">${(item.price * item.quantity).toFixed(2)} ₼</span>
        `;
        container.appendChild(paymentItem);
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const bonus = Math.floor(subtotal * 0.05);
    const total = subtotal - bonus;
    
    document.getElementById('payment-subtotal').textContent = subtotal.toFixed(2) + ' ₼';
    document.getElementById('payment-bonus').textContent = bonus.toFixed(2) + ' ₼';
    document.getElementById('payment-total').textContent = total.toFixed(2) + ' ₼';
}

function setupPaymentForm() {
    const form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', handlePayment);
    }
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

function handlePayment(e) {
    e.preventDefault();
    
    // Validate form
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('card-name').value;
    
    if (cardNumber.length !== 16) {
        showNotification('Kart nömrəsi 16 rəqəm olmalıdır!', 'error');
        return;
    }
    
    if (expiryDate.length !== 5) {
        showNotification('Son istifadə tarixini düzgün daxil edin!', 'error');
        return;
    }
    
    if (cvv.length !== 3) {
        showNotification('CVV 3 rəqəm olmalıdır!', 'error');
        return;
    }
    
    if (!cardName.trim()) {
        showNotification('Kart sahibinin adını daxil edin!', 'error');
        return;
    }
    
    // Redirect to loading page
    window.location.href = 'loading.html';
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length > 19) {
        formattedValue = formattedValue.substring(0, 19);
    }
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}
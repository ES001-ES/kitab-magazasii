// Profile page functionality

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('profile.html')) {
        // Check if user is logged in
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        initializeProfilePage();
        setupProfileEventListeners();
    }
});

// Initialize profile page
function initializeProfilePage() {
    loadProfileInfo();
    loadUserOrders();
    loadBonusInfo();
    setupTabNavigation();
}

// Setup profile event listeners
function setupProfileEventListeners() {
    // Tab navigation
    const tabItems = document.querySelectorAll('.profile-nav .nav-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Notification settings
    const notificationCheckboxes = document.querySelectorAll('#settings-tab input[type="checkbox"]');
    notificationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveNotificationSettings();
        });
    });
}

// Load profile information
function loadProfileInfo() {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const updateName = document.getElementById('update-name');
    const updateEmail = document.getElementById('update-email');
    const updatePhone = document.getElementById('update-phone');
    const updateCity = document.getElementById('update-city');
    const updateAddress = document.getElementById('update-address');
    
    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;
    
    if (updateName) updateName.value = currentUser.name || '';
    if (updateEmail) updateEmail.value = currentUser.email || '';
    if (updatePhone) updatePhone.value = currentUser.phone || '';
    if (updateCity) updateCity.value = currentUser.city || '';
    if (updateAddress) updateAddress.value = currentUser.address || '';
    
    // Load profile stats
    loadProfileStats();
}

// Load profile stats
function loadProfileStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) return;
    
    const orders = user.orders || [];
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const bonusPoints = user.bonus || 0;
    
    const totalOrdersSpan = document.getElementById('total-orders');
    const totalSpentSpan = document.getElementById('total-spent');
    const bonusPointsSpan = document.getElementById('bonus-points');
    
    if (totalOrdersSpan) totalOrdersSpan.textContent = totalOrders;
    if (totalSpentSpan) totalSpentSpan.textContent = formatPrice(totalSpent);
    if (bonusPointsSpan) bonusPointsSpan.textContent = bonusPoints;
}

// Load user orders
function loadUserOrders() {
    const ordersList = document.getElementById('orders-list');
    const noOrders = document.getElementById('no-orders');
    
    if (!ordersList) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    const orders = user?.orders || [];
    
    if (orders.length === 0) {
        ordersList.innerHTML = '';
        if (noOrders) noOrders.style.display = 'block';
        return;
    }
    
    if (noOrders) noOrders.style.display = 'none';
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-number">Sifariş #${order.orderNumber}</div>
                <div class="order-status ${order.status}">${getOrderStatusText(order.status)}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <div class="order-detail-label">Tarix</div>
                    <div class="order-detail-value">${formatDate(order.orderDate)}</div>
                </div>
                <div class="order-detail">
                    <div class="order-detail-label">Məhsul sayı</div>
                    <div class="order-detail-value">${order.items.length}</div>
                </div>
                <div class="order-detail">
                    <div class="order-detail-label">Məbləğ</div>
                    <div class="order-detail-value">${formatPrice(order.total)} ₼</div>
                </div>
                <div class="order-detail">
                    <div class="order-detail-label">Ödəniş</div>
                    <div class="order-detail-value">${getPaymentMethodText(order.paymentMethod)}</div>
                </div>
            </div>
            <div class="order-items-preview">
                ${order.items.slice(0, 3).map(item => `
                    <span class="order-item-preview">${item.title}</span>
                `).join('')}
                ${order.items.length > 3 ? `<span class="order-item-more">+${order.items.length - 3} daha</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Load bonus information
function loadBonusInfo() {
    const currentBonus = document.getElementById('current-bonus');
    const bonusTransactions = document.getElementById('bonus-transactions');
    
    if (currentBonus) {
        currentBonus.textContent = currentUser.bonus || 0;
    }
    
    if (!bonusTransactions) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    const bonusHistory = user?.bonusHistory || [];
    
    if (bonusHistory.length === 0) {
        bonusTransactions.innerHTML = '<p class="text-center text-gray">Bonus tarixçəsi yoxdur</p>';
        return;
    }
    
    // Sort by date (newest first)
    bonusHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    bonusTransactions.innerHTML = bonusHistory.map(transaction => `
        <div class="bonus-transaction">
            <div class="transaction-info">
                <div class="transaction-type">${transaction.type}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
            </div>
        </div>
    `).join('');
}

// Setup tab navigation
function setupTabNavigation() {
    // Show first tab by default
    switchTab('profile');
}

// Switch tab
function switchTab(tabId) {
    // Update nav items
    const navItems = document.querySelectorAll('.profile-nav .nav-item');
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId + '-tab');
    });
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('update-name').value;
    const email = document.getElementById('update-email').value;
    const phone = document.getElementById('update-phone').value;
    const city = document.getElementById('update-city').value;
    const address = document.getElementById('update-address').value;
    
    // Validate
    if (!name.trim() || !email.trim()) {
        showToast('Ad və email sahələri mütləqdir', 'error');
        return false;
    }
    
    if (!validateEmail(email)) {
        showToast('Email formatı düzgün deyil', 'error');
        return false;
    }
    
    // Update current user
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.city = city;
    currentUser.address = address;
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...currentUser };
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Update display
    loadProfileInfo();
    updateAuthDisplay();
    
    showToast('Profil məlumatları yeniləndi');
    
    return false;
}

// Change password
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Bütün sahələri doldurun', 'error');
        return false;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Yeni şifrələr uyğun gəlmir', 'error');
        return false;
    }
    
    if (newPassword.length < 6) {
        showToast('Yeni şifrə ən azı 6 simvol olmalıdır', 'error');
        return false;
    }
    
    // Check current password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user || user.password !== currentPassword) {
        showToast('Cari şifrə yanlışdır', 'error');
        return false;
    }
    
    // Update password
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Clear form
    document.getElementById('password-form').reset();
    
    showToast('Şifrə uğurla dəyişdirildi');
    
    return false;
}

// Save notification settings
function saveNotificationSettings() {
    const emailNotifications = document.getElementById('email-notifications').checked;
    const promoNotifications = document.getElementById('promo-notifications').checked;
    const orderNotifications = document.getElementById('order-notifications').checked;
    
    const settings = {
        emailNotifications,
        promoNotifications,
        orderNotifications
    };
    
    // Update user settings
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        users[userIndex].notificationSettings = settings;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showToast('Bildiriş parametrləri saxlanıldı');
}

// Confirm delete account
function confirmDeleteAccount() {
    if (confirm('Hesabınızı silmək istədiyinizə əminsiniz? Bu əməliyyat geri alınmaz!')) {
        if (confirm('Son dəfə soruşuruq: Hesabınızı həqiqətən silmək istəyirsiniz?')) {
            deleteAccount();
        }
    }
}

// Delete account
function deleteAccount() {
    // Remove user from users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(u => u.id !== currentUser.id);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Clear current session
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    localStorage.removeItem('rememberedUser');
    
    showToast('Hesabınız silindi');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Helper functions
function getOrderStatusText(status) {
    const statusTexts = {
        'pending': 'Gözləyir',
        'processing': 'İşlənir',
        'completed': 'Tamamlandı',
        'cancelled': 'Ləğv edildi'
    };
    return statusTexts[status] || status;
}

function getPaymentMethodText(method) {
    const methodTexts = {
        'card': 'Kart',
        'cash': 'Nağd'
    };
    return methodTexts[method] || method;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

// Export functions
window.profilePage = {
    updateProfile,
    changePassword,
    switchTab,
    confirmDeleteAccount
};
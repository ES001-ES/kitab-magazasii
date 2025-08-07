// Admin panel functionality

let adminStats = {
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        // Check admin authentication
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
        if (!adminUser) {
            window.location.href = 'login.html';
            return;
        }
        
        initializeAdminPanel();
        setupAdminEventListeners();
    }
});

// Initialize admin panel
function initializeAdminPanel() {
    loadAdminStats();
    loadProductsTable();
    loadOrdersTable();
    loadUsersTable();
    loadAnalytics();
    setupSidebarNavigation();
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchAdminSection(section);
        });
    });
}

// Load admin statistics
function loadAdminStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    adminStats.totalProducts = books.length;
    adminStats.totalUsers = users.length;
    adminStats.totalOrders = orders.length;
    adminStats.totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Update display
    const totalProductsSpan = document.getElementById('total-products');
    const totalUsersSpan = document.getElementById('total-users-stat');
    const totalOrdersSpan = document.getElementById('total-orders');
    const totalRevenueSpan = document.getElementById('total-revenue');
    
    if (totalProductsSpan) totalProductsSpan.textContent = adminStats.totalProducts;
    if (totalUsersSpan) totalUsersSpan.textContent = adminStats.totalUsers;
    if (totalOrdersSpan) totalOrdersSpan.textContent = adminStats.totalOrders;
    if (totalRevenueSpan) totalRevenueSpan.textContent = formatPrice(adminStats.totalRevenue);
}

// Load products table
function loadProductsTable() {
    const productsTable = document.getElementById('products-table');
    if (!productsTable) return;
    
    productsTable.innerHTML = books.map(book => `
        <tr>
            <td>
                <img src="${book.image}" alt="${book.title}">
            </td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${getCategoryName(book.category)}</td>
            <td>${formatPrice(book.price)} ₼</td>
            <td>
                <span class="status-badge ${getStockStatus(book.stock)}">
                    ${book.stock}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editProduct(${book.id})" title="Redaktə et">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${book.id})" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load orders table
function loadOrdersTable() {
    const ordersTable = document.getElementById('orders-table');
    if (!ordersTable) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.orderNumber}</td>
            <td>${order.billingInfo?.name || 'N/A'}</td>
            <td>${order.items.length} məhsul</td>
            <td>${formatPrice(order.total)} ₼</td>
            <td>
                <span class="status-badge ${order.status}">${getOrderStatusText(order.status)}</span>
            </td>
            <td>${formatDate(order.orderDate)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="viewOrder('${order.id}')" title="Bax">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteOrder('${order.id}')" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load users table
function loadUsersTable() {
    const usersTable = document.getElementById('users-table');
    if (!usersTable) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    usersTable.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${formatDate(user.registeredAt)}</td>
            <td>${(user.orders || []).length}</td>
            <td>${user.bonus || 0}</td>
            <td>
                <span class="status-badge active">Aktiv</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="viewUser('${user.id}')" title="Bax">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser('${user.id}')" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load analytics
function loadAnalytics() {
    loadTopSellingBooks();
    loadActiveUsers();
}

// Load top selling books
function loadTopSellingBooks() {
    const topSellingContainer = document.getElementById('top-selling-books');
    if (!topSellingContainer) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const bookSales = {};
    
    // Calculate sales for each book
    orders.forEach(order => {
        order.items.forEach(item => {
            if (bookSales[item.bookId]) {
                bookSales[item.bookId].quantity += item.quantity;
            } else {
                bookSales[item.bookId] = {
                    bookId: item.bookId,
                    title: item.title,
                    quantity: item.quantity
                };
            }
        });
    });
    
    // Sort by quantity and get top 5
    const topBooks = Object.values(bookSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    topSellingContainer.innerHTML = topBooks.map((book, index) => `
        <div class="analytics-item">
            <div class="analytics-item-info">
                <div class="analytics-item-title">${book.title}</div>
                <div class="analytics-item-subtitle">#${index + 1} ən çox satan</div>
            </div>
            <div class="analytics-item-value">${book.quantity}</div>
        </div>
    `).join('');
}

// Load active users
function loadActiveUsers() {
    const activeUsersContainer = document.getElementById('active-users');
    if (!activeUsersContainer) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Sort by registration date (newest first) and get top 5
    const recentUsers = users
        .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
        .slice(0, 5);
    
    activeUsersContainer.innerHTML = recentUsers.map(user => `
        <div class="analytics-item">
            <div class="analytics-item-info">
                <div class="analytics-item-title">${user.name}</div>
                <div class="analytics-item-subtitle">${formatDate(user.registeredAt)}</div>
            </div>
            <div class="analytics-item-value">${(user.orders || []).length}</div>
        </div>
    `).join('');
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    // Show dashboard by default
    switchAdminSection('dashboard');
}

// Switch admin section
function switchAdminSection(sectionId) {
    // Update nav items
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    
    // Update sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId + '-section');
    });
}

// Show add product modal
function showAddProductModal() {
    showModal('add-product-modal');
}

// Add product
function addProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = {
        id: generateProductId(),
        title: formData.get('title'),
        author: formData.get('author'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        image: formData.get('image'),
        description: formData.get('description'),
        rating: 0,
        ratingCount: 0,
        featured: false
    };
    
    // Validate
    if (!productData.title || !productData.author || !productData.category || 
        !productData.price || !productData.stock || !productData.image || !productData.description) {
        showToast('Bütün sahələri doldurun', 'error');
        return false;
    }
    
    // Add to books array
    books.push(productData);
    localStorage.setItem('books', JSON.stringify(books));
    
    // Update display
    loadProductsTable();
    loadAdminStats();
    
    // Close modal and reset form
    closeModal('add-product-modal');
    event.target.reset();
    
    showToast('Kitab uğurla əlavə edildi');
    
    return false;
}

// Edit product
function editProduct(productId) {
    const book = books.find(b => b.id === productId);
    if (!book) return;
    
    // Fill edit form
    document.getElementById('edit-product-id').value = book.id;
    document.getElementById('edit-product-title').value = book.title;
    document.getElementById('edit-product-author').value = book.author;
    document.getElementById('edit-product-category').value = book.category;
    document.getElementById('edit-product-price').value = book.price;
    document.getElementById('edit-product-stock').value = book.stock;
    document.getElementById('edit-product-image').value = book.image;
    document.getElementById('edit-product-description').value = book.description;
    
    showModal('edit-product-modal');
}

// Update product
function updateProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productId = parseInt(formData.get('id'));
    
    const bookIndex = books.findIndex(b => b.id === productId);
    if (bookIndex === -1) return false;
    
    // Update book data
    books[bookIndex] = {
        ...books[bookIndex],
        title: formData.get('title'),
        author: formData.get('author'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        image: formData.get('image'),
        description: formData.get('description')
    };
    
    localStorage.setItem('books', JSON.stringify(books));
    
    // Update display
    loadProductsTable();
    loadAdminStats();
    
    // Close modal
    closeModal('edit-product-modal');
    
    showToast('Kitab məlumatları yeniləndi');
    
    return false;
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Bu kitabı silmək istədiyinizə əminsiniz?')) return;
    
    const bookIndex = books.findIndex(b => b.id === productId);
    if (bookIndex > -1) {
        books.splice(bookIndex, 1);
        localStorage.setItem('books', JSON.stringify(books));
        
        // Update display
        loadProductsTable();
        loadAdminStats();
        
        showToast('Kitab silindi');
    }
}

// View order
function viewOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        alert(`Sifariş #${order.orderNumber}\nMüştəri: ${order.billingInfo?.name}\nMəbləğ: ${formatPrice(order.total)} ₼\nTarix: ${formatDate(order.orderDate)}`);
    }
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm('Bu sifarişi silmək istədiyinizə əminsiniz?')) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const filteredOrders = orders.filter(o => o.id !== orderId);
    
    localStorage.setItem('orders', JSON.stringify(filteredOrders));
    
    // Update display
    loadOrdersTable();
    loadAdminStats();
    
    showToast('Sifariş silindi');
}

// View user
function viewUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        alert(`İstifadəçi: ${user.name}\nEmail: ${user.email}\nQeydiyyat: ${formatDate(user.registeredAt)}\nSifarişlər: ${(user.orders || []).length}\nBonus: ${user.bonus || 0}`);
    }
}

// Delete user
function deleteUser(userId) {
    if (!confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(u => u.id !== userId);
    
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Update display
    loadUsersTable();
    loadAdminStats();
    
    showToast('İstifadəçi silindi');
}

// Helper functions
function generateProductId() {
    return Math.max(...books.map(b => b.id), 0) + 1;
}

function getStockStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
}

function getOrderStatusText(status) {
    const statusTexts = {
        'pending': 'Gözləyir',
        'processing': 'İşlənir',
        'completed': 'Tamamlandı',
        'cancelled': 'Ləğv edildi'
    };
    return statusTexts[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ');
}

function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

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

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

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

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

// Export functions
window.adminPanel = {
    addProduct,
    updateProduct,
    editProduct,
    deleteProduct,
    viewOrder,
    deleteOrder,
    viewUser,
    deleteUser,
    showAddProductModal,
    switchAdminSection,
    adminLogout
};
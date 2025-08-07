// Authentication functionality

// Check if user is on admin page and redirect if not authenticated
if (window.location.pathname.includes('admin.html')) {
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
    if (!adminUser) {
        window.location.href = 'login.html';
    }
}

// Switch between login and register forms
function switchToRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function switchToLogin() {
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('admin-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

function showAdminLogin() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('admin-form').classList.add('active');
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Login function
function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Show loading
    showButtonLoading(event.target, true);
    
    // Simulate API call
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Create user session
            const currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                bonus: user.bonus || 0,
                registeredAt: user.registeredAt
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            if (remember) {
                localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
            }
            
            showSuccessMessage('Uğurla daxil oldunuz!');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showErrorMessage('Email və ya şifrə yanlışdır!');
        }
        
        showButtonLoading(event.target, false);
    }, 1000);
    
    return false;
}

// Register function
function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const terms = document.querySelector('input[name="terms"]').checked;
    
    // Validation
    if (password !== confirmPassword) {
        showErrorMessage('Şifrələr uyğun gəlmir!');
        return false;
    }
    
    if (!terms) {
        showErrorMessage('İstifadə şərtlərini qəbul etməlisiniz!');
        return false;
    }
    
    if (password.length < 6) {
        showErrorMessage('Şifrə ən azı 6 simvol olmalıdır!');
        return false;
    }
    
    // Show loading
    showButtonLoading(event.target, true);
    
    // Simulate API call
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            showErrorMessage('Bu email artıq istifadə edilib!');
            showButtonLoading(event.target, false);
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email,
            password: password,
            bonus: 50, // Welcome bonus
            registeredAt: new Date().toISOString(),
            orders: [],
            bonusHistory: [
                {
                    type: 'Xoş gəldin bonusu',
                    amount: 50,
                    date: new Date().toISOString()
                }
            ]
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        const currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            bonus: newUser.bonus,
            registeredAt: newUser.registeredAt
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showSuccessMessage('Qeydiyyat uğurla tamamlandı! Xoş gəldin bonusu: 50 bonus');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
        showButtonLoading(event.target, false);
    }, 1000);
    
    return false;
}

// Admin login function
function adminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Show loading
    showButtonLoading(event.target, true);
    
    // Simulate API call
    setTimeout(() => {
        // Check admin credentials (simple check for demo)
        if (username === 'admin' && password === 'admin123') {
            const adminUser = {
                id: 'admin',
                username: 'admin',
                role: 'admin',
                loginAt: new Date().toISOString()
            };
            
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            
            showSuccessMessage('Admin girişi uğurlu!');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            showErrorMessage('İstifadəçi adı və ya şifrə yanlışdır!');
        }
        
        showButtonLoading(event.target, false);
    }, 1000);
    
    return false;
}

// Show loading state on button
function showButtonLoading(form, loading) {
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoader = submitButton.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.opacity = '0';
        btnLoader.style.display = 'block';
        submitButton.disabled = true;
    } else {
        btnText.style.opacity = '1';
        btnLoader.style.display = 'none';
        submitButton.disabled = false;
    }
}

// Show success message
function showSuccessMessage(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('success-message');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.classList.add('active');
    }
}

// Show error message
function showErrorMessage(message) {
    const modal = document.getElementById('error-modal');
    const messageElement = document.getElementById('error-message');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.classList.add('active');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Generate user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Auto-fill remembered user
document.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser') || 'null');
    
    if (rememberedUser) {
        const emailInput = document.getElementById('login-email');
        const rememberCheckbox = document.querySelector('input[name="remember"]');
        
        if (emailInput) {
            emailInput.value = rememberedUser.email;
        }
        
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
});

// Card number formatting
document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedInputValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedInputValue;
        });
    }
    
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
});

// Payment method selection
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardDetails = document.getElementById('card-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to clicked method
            this.classList.add('active');
            
            // Toggle card details visibility
            const selectedMethod = this.querySelector('input[type="radio"]').value;
            if (cardDetails) {
                cardDetails.style.display = selectedMethod === 'card' ? 'block' : 'none';
            }
        });
    });
});

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // If on login page and user is already logged in, redirect to home
    if (window.location.pathname.includes('login.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser) {
            window.location.href = 'index.html';
        }
    }
});

// Input validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    return name.length >= 2;
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', function() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const nameInputs = document.querySelectorAll('#register-name');
    
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--gray-200)';
            }
        });
    });
    
    passwordInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validatePassword(this.value)) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--gray-200)';
            }
        });
    });
    
    nameInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateName(this.value)) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--gray-200)';
            }
        });
    });
});
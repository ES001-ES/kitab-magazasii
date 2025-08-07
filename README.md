# 📚 Kitab Mağazası Veb Tətbiqi

Bu layihə HTML, CSS və JavaScript istifadə edilərək hazırlanmış, responsiv və dinamik kitab mağazası saytıdır. Diplom işi üçün hazırlanmışdır və həm istifadəçilər, həm də administrator üçün funksionallıq təqdim edir.

## 🚀 Əsas Xüsusiyyətlər

- ✅ Responsive dizayn (mobil və masaüstü dəstəyi)
- 📖 Kitabların siyahılanması və axtarışı
- 🛒 Səbətə əlavə etmə və ödəniş səhifəsi
- ❤️ Favorit kitablar funksiyası
- 👤 İstifadəçi profili
- 🔐 Admin panelə giriş
- 📦 Checkout və çatdırılma prosesi

## 🔑 Admin Girişi

Admin panelə daxil olmaq üçün standart giriş məlumatları:

- **İstifadəçi adı:** `admin`
- **Şifrə:** `admin123`

> Bu məlumat `js/auth.js` faylında saxlanılır və oradan yoxlanılır.

## 🗂 Layihə Qovluq Strukturu


│
├── index.html # Ana səhifə
├── products.html # Kitablar səhifəsi
├── login.html # Giriş səhifəsi
├── admin.html # Admin panel
├── cart.html # Səbət
├── checkout.html # Ödəniş səhifəsi
├── favorites.html # Favoritlər
├── profile.html # İstifadəçi profili
│
├── js/ # JavaScript faylları
│ ├── auth.js # Giriş yoxlanışı
│ ├── admin.js # Admin panel funksiyaları
│ ├── cart.js # Səbət funksiyaları
│ ├── checkout.js # Checkout prosesləri
│ ├── favorites.js # Favoritlər
│ ├── home.js # Ana səhifə funksiyaları
│ ├── main.js # Ümumi JS
│ ├── payment.js # Ödəniş funksiyaları
│ └── profile.js # Profil səhifəsi
│
├── styles/ # CSS faylları
│ ├── main.css # Ümumi stil
│ └── admin.css # Admin üçün stil



## ⚙️ İstifadə edilən Texnologiyalar

- **HTML5**
- **CSS3**
- **Vanilla JavaScript **
- **Responsive dizayn** – media queries ilə

## 🧠 JavaScript Funksiyalar və İstifadə

Layihədə əsasən aşağıdakı JS funksiyalarından istifadə olunub:

- `addToCart(productId)` – məhsulu səbətə əlavə edir.
- `updateCartUI()` – səbət interfeysini yeniləyir.
- `localStorage.setItem()` və `getItem()` – məlumatları saxlayıb oxumaq üçün.
- `JSON.parse()` / `JSON.stringify()` – məlumat formatlarını çevirmək üçün.
- `window.location.href` – səhifələr arası yönləndirmə.
- `addEventListener()` – istifadəçi hadisələrini izləmək üçün.

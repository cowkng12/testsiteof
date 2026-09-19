// Получаем элементы
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const closeModal = document.getElementById('closeModal');
const themeToggle = document.getElementById('themeToggle');
const categoriesScroll = document.getElementById('categoriesScroll');
const scrollLeft = document.getElementById('scrollLeft');
const scrollRight = document.getElementById('scrollRight');
const categoryTitle = document.getElementById('categoryTitle');
const favoritesBtn = document.getElementById('favoritesBtn');

// Категории и их названия
const categoryNames = {
    'all': 'Все блюда',
    'pastry': 'Выпечка',
    'main': 'Основные блюда',
    'breakfast': 'Завтраки',
    'drinks': 'Напитки',
    'author-sweets': 'Авторские сладости',
    'cakes': 'Торты и пироги',
    'sweets': 'Сладости',
    'bar': 'Для бара',
    'other': 'Другое'
};

// Массивы для хранения избранных товаров и корзины
let favoriteItems = JSON.parse(localStorage.getItem('favorites')) || [];
let cartItems = JSON.parse(localStorage.getItem('cart')) || {};

// Функция прокрутки категорий
function updateScrollButtons() {
    const maxScroll = categoriesScroll.scrollWidth - categoriesScroll.clientWidth;
    
    if (categoriesScroll.scrollLeft <= 10) {
        scrollLeft.classList.add('hidden');
    } else {
        scrollLeft.classList.remove('hidden');
    }
    
    if (categoriesScroll.scrollLeft >= maxScroll - 10) {
        scrollRight.classList.add('hidden');
    } else {
        scrollRight.classList.remove('hidden');
    }
}

// Прокрутка влево
scrollLeft.addEventListener('click', () => {
    categoriesScroll.scrollBy({ left: -200, behavior: 'smooth' });
});

// Прокрутка вправо
scrollRight.addEventListener('click', () => {
    categoriesScroll.scrollBy({ left: 200, behavior: 'smooth' });
});

// Обновляем состояние кнопок прокрутки
categoriesScroll.addEventListener('scroll', updateScrollButtons);
window.addEventListener('resize', updateScrollButtons);
updateScrollButtons();

// Плавная прокрутка к секциям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        if (!targetId) return;

        // Если это категория меню, обновляем активную категорию
        if (categoryNames[targetId]) {
            const categoryBtn = document.querySelector(`[data-category="${targetId}"]`);
            if (categoryBtn) {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                categoryBtn.classList.add('active');
                categoryTitle.querySelector('h2').textContent = categoryNames[targetId];
                document.querySelectorAll('.products').forEach(section => {
                    section.style.display = 'none';
                });
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
                categoryTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            return;
        }

        const targetElement = document.querySelector(`#${targetId}`);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Переключение категорий
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        categoryTitle.querySelector('h2').textContent = categoryNames[category];
        document.querySelectorAll('.products').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(category);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        categoryTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Модальное окно поиска
searchBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
});

searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Переключение темы
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Функция обновления счетчика избранных
function updateFavoritesCount() {
    const count = favoriteItems.length;
    let badge = favoritesBtn.querySelector('.favorites-badge');
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'favorites-badge';
            favoritesBtn.appendChild(badge);
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}

// Функция добавления/удаления из избранного
function toggleFavorite(productName, button) {
    const index = favoriteItems.findIndex(item => item.name === productName);
    if (index > -1) {
        favoriteItems.splice(index, 1);
        button.classList.remove('active-favorite');
    } else {
        const card = button.closest('.product-card');
        const img = card.querySelector('.product-img');
        const priceEl = card.querySelector('.product-price');
        
        if (img && priceEl) {
            favoriteItems.push({ 
                name: productName, 
                img: img.src, 
                price: priceEl.textContent 
            });
            button.classList.add('active-favorite');
            showFavoriteToast();
        }
    }
    localStorage.setItem('favorites', JSON.stringify(favoriteItems));
    updateFavoritesCount();
}

function showFavoriteToast() {
    const toast = document.getElementById('favoriteToast');
    if (!toast) return;
    toast.classList.remove('show');
    requestAnimationFrame(() => toast.classList.add('show'));
    window.setTimeout(() => toast.classList.remove('show'), 3000);
}

// Функция отображения модального окна избранного
function showFavoritesModal() {
    let modal = document.getElementById('favoritesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'favoritesModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    let content = '<div class="modal-content favorites-modal-content">';
    content += '<button class="modal-close" onclick="closeFavoritesModal()">×</button>';
    content += '<h2 style="margin-bottom: 30px; font-size: 28px;">Избранное</h2>';
    
    if (favoriteItems.length === 0) {
        content += '<p style="text-align: center; color: var(--text-secondary); padding: 40px 0;">Нет избранных товаров</p>';
    } else {
        content += '<div class="favorites-grid">';
        favoriteItems.forEach(item => {
            const quantity = cartItems[item.name] || 0;
            content += `
                <div class="favorite-item">
                    <img src="${item.img}" alt="${item.name}" class="favorite-img">
                    <div class="favorite-info">
                        <h3 class="favorite-name">${item.name}</h3>
                        <p class="favorite-price">${item.price}</p>
                    </div>
                    <div class="favorite-actions">
                        ${quantity > 0 ? `
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="changeQuantity('${item.name}', -1)">-</button>
                                <span class="quantity-display">${quantity}</span>
                                <button class="quantity-btn" onclick="changeQuantity('${item.name}', 1)">+</button>
                            </div>
                        ` : `
                            <button class="add-to-cart-btn" onclick="addToCartFromFavorites('${item.name}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        `}
                    </div>
                </div>
            `;
        });
        content += '</div>';
    }
    
    content += '</div>';
    modal.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Функция закрытия модального окна избранного
window.closeFavoritesModal = function() {
    const modal = document.getElementById('favoritesModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Функция добавления в корзину из избранного
window.addToCartFromFavorites = function(productName) {
    cartItems[productName] = 1;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    showFavoritesModal();
};

// Функция изменения количества
window.changeQuantity = function(productName, delta) {
    if (!cartItems[productName]) cartItems[productName] = 0;
    cartItems[productName] += delta;
    if (cartItems[productName] <= 0) {
        delete cartItems[productName];
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
    showFavoritesModal();
};

// Иконка избранного в шапке остаётся визуальным индикатором без перехода.
favoritesBtn.addEventListener('click', (event) => event.preventDefault());

let toastTimer;
function showCartToast(message = 'Добавлено в корзину', variant = 'default') {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('toast-light', variant === 'light');
    toast.classList.remove('show');
    window.clearTimeout(toastTimer);
    requestAnimationFrame(() => toast.classList.add('show'));
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
}

// Обработка кнопок "Добавить" на карточках товаров
document.querySelectorAll('.add-to-cart-btn-main').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.product-card');
        const productName = card.getAttribute('data-name');
        
        cartItems[productName] = 1;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        showCartToast();
    });
});

// Кнопка карточки всегда остаётся простой кнопкой "Добавить".
function updateCartButton(button, productName) {
    button.textContent = 'Добавить';
    button.classList.remove('has-quantity');
}

// Функция изменения количества на главных карточках
function changeQuantityMain(productName, delta, button) {
    if (!cartItems[productName]) cartItems[productName] = 0;
    cartItems[productName] += delta;
    
    if (cartItems[productName] <= 0) {
        delete cartItems[productName];
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartButton(button, productName);
}

// Обработка кнопок избранного на карточках
document.querySelectorAll('.favorite-btn').forEach(button => {
    const card = button.closest('.product-card');
    const productName = card.getAttribute('data-name');
    
    if (favoriteItems.some(item => item.name === productName)) {
        button.classList.add('active-favorite');
    }
    
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavorite(productName, this);
    });
});

// Инициализация счетчиков при загрузке
document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesCount();
    
    document.querySelectorAll('.product-card').forEach(card => {
        const productName = card.getAttribute('data-name');
        const button = card.querySelector('.add-to-cart-btn-main');
        if (button) updateCartButton(button, productName);
    });
});

/* ==========================================================================
   TWENTY TWO - INTERACTIVE PITCH & STORE DEMO LOGIC
   ========================================================================== */

// --- 1. PRODUCT DATABASE ---
const PRODUCTS = {
    tee: {
        id: 'tee',
        name: 'تيشرت Oversized أسود جرافيك',
        price: 450,
        oldPrice: 550,
        category: 'تيشرتات',
        image: 'assets/oversized_tee.png',
        sizes: ['S', 'M', 'L', 'XL'],
        desc: 'تيشرت أسود قطن 100% مريح جداً بستايل أوفرسايز عصري، يتميز بطبعة جرافيك خفيفة وأنيقة على الصدر. مثالي للاستخدام اليومي وخروجات الشباب.'
    },
    pants: {
        id: 'pants',
        name: 'بنطلون كارغو فضفاض زيتوني',
        price: 650,
        oldPrice: 750,
        category: 'بنطلونات',
        image: 'assets/cargo_pants.png',
        sizes: ['M', 'L', 'XL', 'XXL'],
        desc: 'بنطلون كارغو بلون زيتوني جذاب مصنوع من الجبردين المتين والناعم، يحتوي على جيوب جانبية متعددة وعملية، وتصميم مريح يعطي حرية كاملة في الحركة.'
    },
    knit: {
        id: 'knit',
        name: 'قميص صيفي تريكو كريمي',
        price: 550,
        oldPrice: null,
        category: 'قمصان صيفية',
        image: 'assets/summer_knit.png',
        sizes: ['S', 'M', 'L', 'XL'],
        desc: 'قميص صيفي أنيق مصنوع من التريكو الخفيف والمناسب لحرارة الصيف، يتميز بلون كريمي هادئ وتصميم كاجوال ممتاز فوق التيشرتات أو منفرداً.'
    }
};

// --- 2. GLOBAL STATE ---
let currentSlide = 1;
const totalSlides = 5;
let cart = [];
let activeModalProductId = null;
let activeModalSelectedSize = 'M';

// --- 3. PAGE INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI Setup
    updateCartUI();
    setupVideoPlayers();
    
    // Auto-scroll slides keyboard binding
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('proposal-section').classList.contains('active')) {
            if (e.key === 'ArrowRight') prevSlide();
            if (e.key === 'ArrowLeft') nextSlide();
        }
    });
});

// --- 4. TAB SWITCHING ---
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected content and activate button
    const targetSection = document.getElementById(`${tabId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Find the correct button using onclick attribute search
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });

    // Control video playback based on active tab
    const videos = document.querySelectorAll('.video-wrapper video');
    if (tabId === 'demo') {
        // Automatically start the first video when demo tab is active (muted)
        if (videos.length > 0) {
            videos[0].play().catch(e => console.log("Auto-play blocked, waiting for click."));
            videos[0].parentElement.classList.add('playing');
        }
    } else {
        // Pause all videos if they go back to proposal tab
        videos.forEach(v => {
            v.pause();
            v.parentElement.classList.remove('playing');
        });
    }
}

// --- 5. PROPOSAL SLIDESHOW SYSTEM ---
function updateSlidesUI() {
    // Hide all slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    const activeSlide = document.getElementById(`slide-${currentSlide}`);
    if (activeSlide) {
        activeSlide.classList.add('active');
    }
    
    // Update dots indicator
    const dots = document.querySelectorAll('.slide-dots .dot');
    dots.forEach((dot, index) => {
        if (index === currentSlide - 1) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Enable/Disable controls based on bounds
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = (currentSlide === 1);
    }
    
    if (nextBtn) {
        if (currentSlide === totalSlides) {
            nextBtn.innerHTML = `تصفح المتجر التجريبي <i class="fa-solid fa-store" style="margin-right:5px;"></i>`;
            nextBtn.classList.add('btn-next-tab');
        } else {
            nextBtn.innerHTML = `التالي <i class="fa-solid fa-chevron-left"></i>`;
            nextBtn.classList.remove('btn-next-tab');
        }
    }
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlidesUI();
    } else {
        // If on the last slide, transition to the live demo tab
        switchTab('demo');
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlidesUI();
    }
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlidesUI();
}

// --- 6. STORE VIEWPORT MODES ---
function setViewport(mode) {
    const viewport = document.getElementById('store-viewport-element');
    const btnMobile = document.getElementById('btn-view-mobile');
    const btnDesktop = document.getElementById('btn-view-desktop');
    
    if (mode === 'mobile') {
        viewport.classList.remove('desktop-mode');
        viewport.classList.add('mobile-mode');
        btnMobile.classList.add('active');
        btnDesktop.classList.remove('active');
    } else {
        viewport.classList.remove('mobile-mode');
        viewport.classList.add('desktop-mode');
        btnDesktop.classList.add('active');
        btnMobile.classList.remove('active');
    }
}

// --- 7. CART DRAWER OPERATIONS ---
function toggleCart(open) {
    const cartDrawer = document.getElementById('cart-drawer');
    if (open) {
        cartDrawer.classList.add('active');
    } else {
        cartDrawer.classList.remove('active');
    }
}

function updateCartUI() {
    const cartItemsList = document.getElementById('cart-items-list');
    const cartBadge = document.querySelector('.cart-badge');
    const cartCountTitle = document.getElementById('cart-count-title');
    const cartSubtotalPrice = document.getElementById('cart-subtotal-price');
    
    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Update badge and header totals
    if (cartBadge) cartBadge.textContent = totalItems;
    if (cartCountTitle) cartCountTitle.textContent = `${totalItems} قطع`;
    if (cartSubtotalPrice) cartSubtotalPrice.textContent = `${subtotal} EGP`;
    
    // Render list
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>سلة المشتريات فارغة حالياً</p>
                <button class="store-btn store-btn-primary" onclick="toggleCart(false)">ابدأ التسوق</button>
            </div>
        `;
    } else {
        let html = '';
        cart.forEach((item, index) => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div>
                            <h4 class="cart-item-name">${item.name}</h4>
                            <p class="cart-item-meta">المقاس: ${item.size}</p>
                        </div>
                        <div class="cart-item-controls">
                            <div class="qty-selector">
                                <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                                <span class="qty-val">${item.qty}</span>
                                <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                            </div>
                            <span class="cart-item-price">${item.price * item.qty} EGP</span>
                            <button class="remove-item-btn" onclick="removeItem(${index})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        cartItemsList.innerHTML = html;
    }
}

function quickAddToCart(productId) {
    const product = PRODUCTS[productId];
    // Default size is S or M depending on what's available
    const defaultSize = product.sizes.includes('M') ? 'M' : product.sizes[0];
    addToCart(productId, defaultSize);
}

function addToCart(productId, size) {
    const product = PRODUCTS[productId];
    
    // Check if item with same ID and size exists in cart
    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            qty: 1
        });
    }
    
    updateCartUI();
    toggleCart(true); // Open cart to show added item
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// --- 8. PRODUCT MODAL (QUICK VIEW) ---
function openProductModal(productId) {
    const product = PRODUCTS[productId];
    activeModalProductId = productId;
    
    document.getElementById('modal-product-img').src = product.image;
    document.getElementById('modal-product-img').alt = product.name;
    document.getElementById('modal-product-cat').textContent = product.category;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `${product.price} EGP`;
    document.getElementById('modal-product-desc').textContent = product.desc;
    
    const oldPriceEl = document.getElementById('modal-product-old-price');
    if (product.oldPrice) {
        oldPriceEl.textContent = `${product.oldPrice} EGP`;
        oldPriceEl.style.display = 'inline';
    } else {
        oldPriceEl.style.display = 'none';
    }
    
    // Generate size selection buttons
    const sizeContainer = document.getElementById('modal-size-container');
    let sizesHtml = '';
    
    // Select default size (first one)
    activeModalSelectedSize = product.sizes[0];
    document.getElementById('selected-size-label').textContent = activeModalSelectedSize;
    
    product.sizes.forEach(size => {
        const activeClass = (size === activeModalSelectedSize) ? 'active' : '';
        sizesHtml += `<button class="size-opt-btn ${activeClass}" onclick="selectModalSize('${size}', this)">${size}</button>`;
    });
    sizeContainer.innerHTML = sizesHtml;
    
    document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function selectModalSize(size, element) {
    activeModalSelectedSize = size;
    document.getElementById('selected-size-label').textContent = size;
    
    // Remove active class from other size buttons
    element.parentElement.querySelectorAll('.size-opt-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Add active class to clicked button
    element.classList.add('active');
}

function addProductFromModal() {
    if (activeModalProductId) {
        addToCart(activeModalProductId, activeModalSelectedSize);
        closeProductModal();
    }
}

// --- 9. SIZE CHART MODAL CONTROL ---
function toggleSizeChart(open) {
    const chart = document.getElementById('size-chart-modal');
    if (open) {
        chart.classList.add('active');
    } else {
        chart.classList.remove('active');
    }
}

// --- 10. SHOPPABLE REELS & VIDEO MANAGERS ---
function setupVideoPlayers() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    
    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const muteBtn = wrapper.querySelector('.video-mute-btn');
        
        // Play/Pause toggler
        wrapper.addEventListener('click', (e) => {
            // Ignore if clicking the mute button directly
            if (e.target.closest('.video-mute-btn')) return;
            
            // Pause other videos
            document.querySelectorAll('.video-wrapper video').forEach(v => {
                if (v !== video) {
                    v.pause();
                    v.parentElement.classList.remove('playing');
                }
            });
            
            if (video.paused) {
                video.play();
                wrapper.classList.add('playing');
            } else {
                video.pause();
                wrapper.classList.remove('playing');
            }
        });
        
        // Mute/Unmute Toggler
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop click from triggering play/pause on parent wrapper
                
                video.muted = !video.muted;
                if (video.muted) {
                    muteBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
                } else {
                    muteBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
                }
            });
        }
    });
}

function quickBuy(productId) {
    // Open product details directly
    openProductModal(productId);
}

// --- 11. CHECKOUT SIMULATION SYSTEM ---
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("سلة المشتريات فارغة. برجاء إضافة منتجات أولاً!");
        return;
    }
    
    // Close cart drawer
    toggleCart(false);
    
    // Populating Checkout Summary Items
    const summaryItems = document.getElementById('checkout-summary-items');
    let summaryHtml = '';
    
    cart.forEach(item => {
        summaryHtml += `
            <div class="checkout-summary-item">
                <div class="summary-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="summary-item-details">
                    <span class="summary-item-name">${item.name}</span>
                    <span class="summary-item-meta">المقاس: ${item.size} × ${item.qty}</span>
                </div>
                <span class="summary-item-price">${item.price * item.qty} EGP</span>
            </div>
        `;
    });
    summaryItems.innerHTML = summaryHtml;
    
    // Initial totals calculation
    updateShippingCost();
    
    // Open modal
    document.getElementById('checkout-modal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
}

function updateShippingCost() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const city = document.getElementById('c-city').value;
    
    let shippingCost = 50; // Base shipping cost
    
    if (subtotal >= 1000) {
        // Free shipping on large orders
        shippingCost = 0;
    } else {
        // Customize shipping cost by city
        if (city === 'القاهرة' || city === 'الجيزة') {
            shippingCost = 40;
        } else if (city === 'الإسكندرية') {
            shippingCost = 55;
        } else {
            shippingCost = 65;
        }
    }
    
    const itemsTotalEl = document.getElementById('checkout-items-total');
    const shippingTotalEl = document.getElementById('checkout-shipping-total');
    const grandTotalEl = document.getElementById('checkout-grand-total');
    
    itemsTotalEl.textContent = `${subtotal} EGP`;
    shippingTotalEl.textContent = shippingCost === 0 ? 'مجاّني' : `${shippingCost} EGP`;
    grandTotalEl.textContent = `${subtotal + shippingCost} EGP`;
}

function submitCheckout(e) {
    e.preventDefault();
    
    // Simple validation (already handled by 'required' input tags, but we ensure values are set)
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;
    const address = document.getElementById('c-address').value;
    
    if (!name || !phone || !address) {
        alert("برجاء ملء كافة الحقول الإلزامية!");
        return;
    }
    
    // Close checkout
    closeCheckoutModal();
    
    // Open Success screen
    document.getElementById('success-screen').classList.add('active');
    
    // Trigger celebration confetti
    triggerConfetti();
    
    // Empty Cart
    cart = [];
    updateCartUI();
}

function closeSuccessScreen() {
    document.getElementById('success-screen').classList.remove('active');
}

// --- 12. PARTICLE CONFETTI CELEBRATION EFFECT ---
function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = ''; // clear old ones
    
    const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#ffffff', '#e67e22'];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('confetti-particle');
        
        // Random particle traits
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100; // random X position %
        const delay = Math.random() * 2; // delay before start
        const size = Math.random() * 6 + 5; // size between 5px and 11px
        const duration = Math.random() * 2 + 2; // fall duration between 2s and 4s
        
        particle.style.left = `${left}%`;
        particle.style.backgroundColor = color;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        // Random shape (some circles, some squares)
        if (Math.random() > 0.5) {
            particle.style.borderRadius = '0';
        }
        
        container.appendChild(particle);
    }
    
    // Clear confetti elements after 5 seconds to free resources
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

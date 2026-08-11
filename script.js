document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       CUSTOM CURSOR
       ========================================== */
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    // Smooth trailing effect using animation frame
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate dot tracking
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });
    
    function animateCursor() {
        // LERP (Linear Interpolation) for smooth delay
        const lerpFactor = 0.15;
        cursorX += (mouseX - cursorX) * lerpFactor;
        cursorY += (mouseY - cursorY) * lerpFactor;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive items
    const hoverElements = document.querySelectorAll('a, button, .work-card, .stack-item, .selectable-tag, .form-input, .form-textarea');
    
    hoverElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        elem.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });

    /* ==========================================
       HERO ROTATING TICKER
       ========================================== */
    const tickerWrapper = document.getElementById('tickerWrapper');
    const tickerItems = document.querySelectorAll('.ticker-item');
    let currentTickerIndex = 0;
    const totalTickerItems = tickerItems.length;
    
    setInterval(() => {
        currentTickerIndex = (currentTickerIndex + 1) % totalTickerItems;
        // Translate vertically by 60px per item index
        tickerWrapper.style.transform = `translateY(-${currentTickerIndex * 60}px)`;
    }, 2500);

    /* ==========================================
       HERO VIDEO & AUDIO TRIGGERS
       ========================================== */
    const heroVideoBlock = document.getElementById('heroVideoBlock');
    const heroVideo = document.getElementById('heroVideo');
    const soundToggle = document.getElementById('soundToggle');
    const playHint = document.querySelector('.play-hint');
    
    heroVideoBlock.addEventListener('mouseenter', () => {
        heroVideo.play().catch(e => console.log('Video play interrupted:', e));
        playHint.textContent = "PLAYING";
    });
    
    heroVideoBlock.addEventListener('mouseleave', () => {
        heroVideo.pause();
        playHint.textContent = "HOVER TO PLAY";
    });
    
    soundToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering parent hover logic changes
        heroVideo.muted = !heroVideo.muted;
        
        if (heroVideo.muted) {
            soundToggle.classList.remove('sound-active');
            soundToggle.style.backgroundColor = 'rgba(255,255,255,0.1)';
        } else {
            soundToggle.classList.add('sound-active');
            soundToggle.style.backgroundColor = 'var(--accent-pink)';
        }
    });

    /* ==========================================
       SELECTED WORK CARD VIDEO HOVER
       ========================================== */
    const workCards = document.querySelectorAll('.work-card');
    
    workCards.forEach(card => {
        const video = card.querySelector('.work-video');
        
        card.addEventListener('mouseenter', () => {
            if (video) {
                video.currentTime = 0;
                video.play().catch(e => console.log('Video autoplay blocked:', e));
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
            }
        });
    });

    /* ==========================================
       SERVICES STACK SELECTOR
       ========================================== */
    const stackItems = document.querySelectorAll('.stack-item');
    const detailPanels = document.querySelectorAll('.service-detail-panel');
    const servicesRight = document.querySelector('.services-right');
    
    // Set initial state
    if (servicesRight) {
        servicesRight.classList.add('pulled');
    }
    
    stackItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // Toggle stack button active state
            stackItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Trigger drawer pulling effect
            if (servicesRight) {
                servicesRight.classList.remove('pulled');
                void servicesRight.offsetWidth; // Trigger reflow
                servicesRight.classList.add('pulled');
            }
            
            // Show corresponding detail panel
            detailPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `detail-${target}`) {
                    panel.classList.add('active');
                }
            });
        });
    });

    /* ==========================================
       CONTACT FORM SERVICE TAGS
       ========================================== */
    const selectableTags = document.querySelectorAll('.selectable-tag');
    
    selectableTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Multi-select toggle
            tag.classList.toggle('active');
        });
    });
});

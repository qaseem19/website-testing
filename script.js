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
       HERO ROTATING TICKER (SEAMLESS INFINITE LOOP)
       ========================================== */
    const tickerWrapper = document.getElementById('tickerWrapper');
    if (tickerWrapper) {
        const originalItems = Array.from(tickerWrapper.querySelectorAll('.ticker-item'));
        if (originalItems.length > 0) {
            // Append clone of the first item for seamless loop transition
            const firstClone = originalItems[0].cloneNode(true);
            tickerWrapper.appendChild(firstClone);

            let currentTickerIndex = 0;
            const totalItems = originalItems.length;
            const ITEM_HEIGHT = 52; // Fixed single line height

            setInterval(() => {
                currentTickerIndex++;
                tickerWrapper.style.transition = 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)';
                tickerWrapper.style.transform = `translateY(-${currentTickerIndex * ITEM_HEIGHT}px)`;

                // When we reach the clone item at index === totalItems
                if (currentTickerIndex === totalItems) {
                    setTimeout(() => {
                        tickerWrapper.style.transition = 'none';
                        currentTickerIndex = 0;
                        tickerWrapper.style.transform = 'translateY(0px)';
                    }, 600); // Wait for CSS transition completion
                }
            }, 2500);
        }
    }

    /* ==========================================
       SCROLL-LINKED STICKY PINNING FOR VSL
       ========================================== */
    const scrollContainer = document.getElementById('scrollContainer');
    const stickyWrapper = document.getElementById('stickyWrapper');
    const videoBox = document.getElementById('videoBox');
    const heroTextContainer = document.getElementById('heroTextContainer');
    const heroVideo = document.getElementById('heroVideo');
    const soundToggle = document.getElementById('soundToggle');
    
    let hasUnmutedOnScroll = false;

    function enableVideoAudioAndPlay() {
        if (!heroVideo) return;

        // Unpause video automatically if paused
        if (heroVideo.paused) {
            heroVideo.play().catch(e => console.log('Video autoplay deferred:', e));
        }

        // Unmute video automatically
        if (heroVideo.muted) {
            heroVideo.muted = false;
            hasUnmutedOnScroll = true;
            if (soundToggle) {
                soundToggle.classList.add('sound-active');
                soundToggle.style.backgroundColor = 'var(--accent-pink)';
            }
        }
    }

    if (heroVideo) {
        heroVideo.play().then(() => {
            // Attempt unmute on initial load if allowed
            heroVideo.muted = false;
            if (soundToggle) {
                soundToggle.classList.add('sound-active');
                soundToggle.style.backgroundColor = 'var(--accent-pink)';
            }
        }).catch(e => console.log('Initial unmuted play deferred:', e));
    }

    // Trigger play and unmute on user interaction / focus
    const userInteractionEvents = ['scroll', 'wheel', 'touchstart', 'mousemove', 'click'];
    userInteractionEvents.forEach(evt => {
        window.addEventListener(evt, enableVideoAudioAndPlay, { passive: true });
    });

    function updateVideoBoxScroll() {
        if (!scrollContainer || !videoBox || !stickyWrapper) return;

        const rect = scrollContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollDistance = scrollContainer.offsetHeight - viewportHeight;

        if (scrollDistance <= 0) return;

        let progress = 0;

        // Dynamic JS Pinning Controller
        if (rect.top > 0) {
            // Above scroll track
            stickyWrapper.style.position = 'sticky';
            stickyWrapper.style.top = '0';
            stickyWrapper.style.left = '';
            stickyWrapper.style.bottom = '';
            stickyWrapper.style.width = '100%';
            progress = 0;
        } else if (rect.top <= 0 && rect.bottom >= viewportHeight) {
            // Inside 300vh scroll track
            stickyWrapper.style.position = 'fixed';
            stickyWrapper.style.top = '0';
            stickyWrapper.style.left = '0';
            stickyWrapper.style.bottom = '';
            stickyWrapper.style.width = '100vw';
            progress = -rect.top / scrollDistance;
            progress = Math.max(0, Math.min(1, progress));
        } else if (rect.bottom < viewportHeight) {
            // Past 300vh scroll track
            stickyWrapper.style.position = 'absolute';
            stickyWrapper.style.top = 'auto';
            stickyWrapper.style.left = '0';
            stickyWrapper.style.bottom = '0';
            stickyWrapper.style.width = '100vw';
            progress = 1;
        }

        // Dynamically adjust padding-top on stickyWrapper (60px at rest -> 0px at full scroll)
        const paddingTop = 60 * (1 - progress);
        stickyWrapper.style.paddingTop = `${paddingTop}px`;

        // Scale width: 60vw -> 100vw
        const width = 60 + (40 * progress);
        // Scale height: 50vh -> 100vh
        const height = 50 + (50 * progress);
        // Reduce border-radius: 24px -> 0px
        const borderRadius = 24 * (1 - progress);
        const borderOpacity = 1 - progress;

        videoBox.style.width = `${width}vw`;
        videoBox.style.height = `${height}vh`;
        videoBox.style.borderRadius = `${borderRadius}px`;
        videoBox.style.borderColor = `rgba(255, 255, 255, ${0.08 * borderOpacity})`;

        // Fade hero text out & smoothly shrink its height in 1:1 sync with scroll (zero layout snap / jhatka)
        if (heroTextContainer) {
            heroTextContainer.style.opacity = Math.max(0, 1 - progress * 2.5);
            heroTextContainer.style.transform = `translateY(${-120 * progress}px)`;
            heroTextContainer.style.marginBottom = `${20 * (1 - progress)}px`;
            heroTextContainer.style.maxHeight = `${500 * (1 - progress)}px`;
            heroTextContainer.style.pointerEvents = progress > 0.3 ? 'none' : 'auto';
        }

        // Auto play & unmute as soon as animation starts
        if (progress > 0) {
            enableVideoAudioAndPlay();
        }
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateVideoBoxScroll);
    }, { passive: true });

    window.addEventListener('resize', () => {
        requestAnimationFrame(updateVideoBoxScroll);
    });

    updateVideoBoxScroll();

    if (soundToggle && heroVideo) {
        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            heroVideo.muted = !heroVideo.muted;
            if (heroVideo.muted) {
                soundToggle.classList.remove('sound-active');
                soundToggle.style.backgroundColor = 'rgba(255,255,255,0.1)';
                hasUnmutedOnScroll = false;
            } else {
                soundToggle.classList.add('sound-active');
                soundToggle.style.backgroundColor = 'var(--accent-pink)';
                hasUnmutedOnScroll = true;
            }
        });
    }

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

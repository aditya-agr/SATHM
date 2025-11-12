document.addEventListener('DOMContentLoaded', function() {
    
    // --- Set Active Navigation Link for HTML pages ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinksElements = document.querySelectorAll('.nav-link');
    
    navLinksElements.forEach(link => {
        const linkPage = link.getAttribute('data-page') + '.html';
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
    
    // --- Responsive Navigation (Hamburger Menu) ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const academicsLink = document.querySelector('.dropdown > a');
    const dropdown = document.querySelector('.dropdown');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        const expanded = hamburger.classList.contains('active');
        hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    // --- Close mobile menu when a link is clicked ---
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Dropdown keyboard accessibility ---
    if (academicsLink && dropdown) {
        academicsLink.addEventListener('focus', () => dropdown.classList.add('open'));
        academicsLink.addEventListener('blur', () => setTimeout(() => dropdown.classList.remove('open'), 150));
        academicsLink.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.toggle('open');
            }
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                academicsLink.focus();
            }
            if (e.key === 'ArrowDown') {
                const firstItem = dropdown.querySelector('.dropdown-content a');
                if (firstItem) {
                    e.preventDefault();
                    dropdown.classList.add('open');
                    firstItem.focus();
                }
            }
        });
        dropdown.querySelectorAll('.dropdown-content a').forEach((item, idx, list) => {
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdown.classList.remove('open');
                    academicsLink.focus();
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = list[idx + 1] || list[0];
                    next.focus();
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = list[idx - 1] || list[list.length - 1];
                    prev.focus();
                }
            });
        });
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // --- Fade-in Animation on Scroll ---
    const faders = document.querySelectorAll('.fade-in');
    const reveals = document.querySelectorAll('.reveal-up');
    
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    [...faders, ...reveals].forEach(el => appearOnScroll.observe(el));

    // --- Smooth Scroll for Academics Page Sections ---
    // This handles the dropdown links smoothly scrolling to sections on the same page.
    document.querySelectorAll('a[href^="academics.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if we are already on the academics page
            if (window.location.pathname.endsWith('academics.html')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').split('#')[1];
                const targetElement = document.getElementById(targetId);
                if(targetElement) {
                    // Offset for sticky header
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
            // If not on academics.html, the default link behavior will take the user there.
        });
    });

    // --- Photo Marquee ---
    const marquee = document.getElementById('photoMarquee');
    const btnPrev = document.getElementById('marqueePrev');
    const btnNext = document.getElementById('marqueeNext');
    if (marquee && btnPrev && btnNext) {
        let scrollPos = 0;
        const step = 260; // px per click
        const speed = 0.5; // px per frame for auto scroll
        let rafId;

        const autoScroll = () => {
            scrollPos += speed;
            marquee.scrollLeft = scrollPos;
            if (scrollPos >= marquee.scrollWidth - marquee.clientWidth) {
                scrollPos = 0;
            }
            rafId = requestAnimationFrame(autoScroll);
        };

        // Initialize
        scrollPos = marquee.scrollLeft;
        rafId = requestAnimationFrame(autoScroll);

        const userScroll = (dir) => {
            cancelAnimationFrame(rafId);
            scrollPos = Math.max(0, Math.min(marquee.scrollWidth, marquee.scrollLeft + dir * step));
            marquee.scrollTo({ left: scrollPos, behavior: 'smooth' });
            rafId = requestAnimationFrame(autoScroll);
        };

        btnPrev.addEventListener('click', () => userScroll(-1));
        btnNext.addEventListener('click', () => userScroll(1));

        // Pause on hover
        marquee.addEventListener('mouseenter', () => cancelAnimationFrame(rafId));
        marquee.addEventListener('mouseleave', () => rafId = requestAnimationFrame(autoScroll));

        // Touch swipe support
        let startX = 0;
        marquee.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; cancelAnimationFrame(rafId); }, { passive: true });
        marquee.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const delta = endX - startX;
            if (Math.abs(delta) > 30) userScroll(delta > 0 ? -1 : 1);
        });
    }

    // --- Notification Marquee ---
    const noticeTrack = document.getElementById('noticeTrack');
    if (noticeTrack) {
        let x = 0;
        const rate = 0.6; // px per frame
        const loop = () => {
            x -= rate;
            // Looping effect by resetting transform when scrolled past width
            if (Math.abs(x) > noticeTrack.scrollWidth) x = 0;
            noticeTrack.style.transform = `translateX(${x}px)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // --- Hero Marquee Controls ---
    const marqueeContent = document.querySelector('.marquee-content');
    const marqueePrevBtn = document.querySelector('.marquee-prev');
    const marqueeNextBtn = document.querySelector('.marquee-next');
    
    if (marqueeContent && marqueePrevBtn && marqueeNextBtn) {
        let isPaused = false;
        
        // Pause animation on hover
        marqueeContent.addEventListener('mouseenter', () => {
            marqueeContent.style.animationPlayState = 'paused';
            isPaused = true;
        });
        
        marqueeContent.addEventListener('mouseleave', () => {
            marqueeContent.style.animationPlayState = 'running';
            isPaused = false;
        });
        
        // Control buttons
        marqueePrevBtn.addEventListener('click', () => {
            marqueeContent.style.animation = 'none';
            const currentTransform = window.getComputedStyle(marqueeContent).transform;
            const matrix = new DOMMatrix(currentTransform);
            const currentX = matrix.m41;
            marqueeContent.style.transform = `translateX(${currentX + 300}px)`;
            
            setTimeout(() => {
                marqueeContent.style.animation = 'marquee 40s linear infinite';
            }, 100);
        });
        
        marqueeNextBtn.addEventListener('click', () => {
            marqueeContent.style.animation = 'none';
            const currentTransform = window.getComputedStyle(marqueeContent).transform;
            const matrix = new DOMMatrix(currentTransform);
            const currentX = matrix.m41;
            marqueeContent.style.transform = `translateX(${currentX - 300}px)`;
            
            setTimeout(() => {
                marqueeContent.style.animation = 'marquee 40s linear infinite';
            }, 100);
        });
    }

});
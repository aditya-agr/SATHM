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

    // --- Enhanced Fade-in and Stagger Animation on Scroll ---
    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-in-left, .slide-in-right');
    const scalers = document.querySelectorAll('.scale-in');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
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

    [...faders, ...sliders, ...scalers].forEach(el => appearOnScroll.observe(el));

    // Add stagger animation to card grids
    const cardGrids = document.querySelectorAll('.card-grid, .feature-grid');
    cardGrids.forEach(grid => {
        const cards = grid.querySelectorAll('.card, .feature-item');
        cards.forEach((card, index) => {
            card.classList.add('fade-in');
            card.classList.add(`stagger-${Math.min(index + 1, 6)}`);
            appearOnScroll.observe(card);
        });
    });

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

    // --- Glimpses slider (prev/next) with DOM reordering for infinite loop ---
    (function setupGlimpsesSlider() {
        const container = document.querySelector('.marquee-container');
        const track = container?.querySelector('.marquee-content');
        const prevBtn = container?.parentElement?.querySelector('.marquee-prev');
        const nextBtn = container?.parentElement?.querySelector('.marquee-next');
        if (!container || !track || !prevBtn || !nextBtn) return;

        // closure timer for resume
        let glimpsesResumeT = null;

        const getComputedTranslateX = (el) => {
            const style = window.getComputedStyle(el);
            const transform = style.transform || 'matrix(1, 0, 0, 1, 0, 0)';
            const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+),\s*([^\)]+)\)/);
            if (match) {
                const x = parseFloat(match[1]);
                return isNaN(x) ? 0 : x;
            }
            return 0;
        };

        const pauseAuto = () => {
            // Freeze current computed position into inline transform and stop animation
            const x = getComputedTranslateX(track);
            track.style.animationPlayState = 'paused';
            track.style.animation = 'none';
            track.style.transition = 'none';
            track.style.transform = `translateX(${x}px)`;
        };
        const resumeAuto = () => {
            // Clear inline transform/transition and let CSS animation run again
            track.style.transition = 'none';
            track.style.transform = '';
            track.style.animation = '';
            track.style.animationPlayState = 'running';
        };

        // Calculate one image width step (first child including margin)
        const getStep = () => {
            const first = track.querySelector('img');
            if (!first) return 0;
            const styles = window.getComputedStyle(first);
            const mr = parseFloat(styles.marginRight) || 0;
            return first.getBoundingClientRect().width + mr;
        };

        let isAnimating = false;
        const slide = (dir) => {
            if (isAnimating) return;
            const step = getStep();
            if (!step) return;
            isAnimating = true;
            pauseAuto();

            // Ensure inline baseline equals computed position
            const currentX = getComputedTranslateX(track);
            track.style.transition = 'none';
            track.style.transform = `translateX(${currentX}px)`;
            // Force reflow before animating
            // eslint-disable-next-line no-unused-expressions
            track.offsetHeight;
            const targetX = dir === 'next' ? currentX - step : currentX + step;

            track.style.transition = 'transform 500ms ease';
            track.style.transform = `translateX(${targetX}px)`;

            // After transition, reorder DOM for infinite effect
            const onEnd = () => {
                track.style.transition = 'none';
                const imgs = track.querySelectorAll('img');
                if (imgs.length > 0) {
                    if (dir === 'next') {
                        // Move first image to end and reset X
                        track.appendChild(imgs[0]);
                        track.style.transform = `translateX(${currentX}px)`;
                    } else {
                        // Move last image to front and reset X
                        track.insertBefore(imgs[imgs.length - 1], imgs[0]);
                        track.style.transform = `translateX(${currentX}px)`;
                    }
                }
                // Force reflow then allow CSS animation again
                // eslint-disable-next-line no-unused-expressions
                track.offsetHeight;
                isAnimating = false;
                // Resume auto after short delay
                clearTimeout(glimpsesResumeT);
                glimpsesResumeT = setTimeout(() => resumeAuto(), 2000);
            };

            track.addEventListener('transitionend', onEnd, { once: true });
        };

        nextBtn.addEventListener('click', () => slide('next'));
        prevBtn.addEventListener('click', () => slide('prev'));

        // Pause on hover/focus for accessibility
        container.addEventListener('mouseenter', pauseAuto);
        container.addEventListener('mouseleave', resumeAuto);
        container.addEventListener('focusin', pauseAuto);
        container.addEventListener('focusout', resumeAuto);
    })();

});
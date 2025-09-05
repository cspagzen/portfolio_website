// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards for animation
    document.querySelectorAll('.metric-card, .experience-card, .testimonial-card, .content-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
            
            // Update aria-expanded for accessibility
            const isOpen = navLinks.classList.contains('nav-open');
            navToggle.setAttribute('aria-expanded', isOpen);
            
            // Change icon when menu is open
            const icon = navToggle.querySelector('svg');
            if (isOpen) {
                icon.innerHTML = `
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                `;
            } else {
                icon.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            }
        });
        
        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                
                // Reset icon
                const icon = navToggle.querySelector('svg');
                icon.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                
                // Reset icon
                const icon = navToggle.querySelector('svg');
                icon.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            }
        });
    }

    // Add loading state for images
    const profileImage = document.querySelector('.profile-image img');
    if (profileImage) {
        profileImage.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        profileImage.addEventListener('error', function() {
            // Fallback if image fails to load
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.innerHTML = '👨‍💼';
            placeholder.style.cssText = `
                font-size: 4rem;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
            `;
            this.parentNode.appendChild(placeholder);
        });
    }

    // Analytics and tracking (placeholder)
    function trackEvent(eventName, properties = {}) {
        // Add your analytics tracking code here
        console.log('Event tracked:', eventName, properties);
    }

    // Track CTA clicks
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', (e) => {
            trackEvent('CTA Click', {
                buttonText: e.target.textContent.trim(),
                location: e.target.href.includes('calendly') ? 'calendly' : 'other'
            });
        });
    });

    // Track contact clicks
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', (e) => {
            trackEvent('Contact Click', {
                contactType: e.currentTarget.href ? 'link' : 'text',
                contactMethod: e.currentTarget.textContent.trim()
            });
        });
    });

    // Track download clicks
    document.querySelectorAll('.download-button').forEach(button => {
        button.addEventListener('click', (e) => {
            trackEvent('Download Click', {
                fileName: e.target.href ? e.target.href.split('/').pop() : 'unknown'
            });
        });
    });

    // Track thought leadership clicks
    document.querySelectorAll('.content-card a').forEach(link => {
        link.addEventListener('click', (e) => {
            trackEvent('Thought Leadership Click', {
                title: e.target.textContent.trim(),
                url: e.target.href
            });
        });
    });

    // Track Calendly clicks specifically
    document.querySelectorAll('a[href*="calendly"]').forEach(link => {
        link.addEventListener('click', (e) => {
            trackEvent('Calendly Click', {
                location: link.closest('section')?.className || 'unknown',
                buttonText: link.textContent.trim()
            });
        });
    });

   // Parallax effect for hero section (desktop only)
window.addEventListener('scroll', () => {
    // Only apply parallax on desktop
    if (window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero');
        if (parallax && scrolled < window.innerHeight) {
            const speed = scrolled * 0.3;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    }
});

    // Performance optimization: Lazy load non-critical elements
    const lazyElements = document.querySelectorAll('.testimonial-card, .content-card');
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                lazyObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px'
    });

    lazyElements.forEach(el => lazyObserver.observe(el));

    // Stage badge hover effects
    document.querySelectorAll('.stage-badge').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Metric cards stagger animation on load
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});
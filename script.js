/* ==========================================================================
   VISAGH REJI - PORTFOLIO INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. PRELOADER SCANNER
    // ==========================================
    const preloader = document.getElementById('preloader');
    const progressFill = document.getElementById('loader-progress');
    const percentageText = document.getElementById('loader-percentage');
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Fade out preloader
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                document.body.style.overflowY = 'auto'; // Re-enable scroll
                
                // Trigger stats and scroll reveal checks
                checkScrollReveal();
            }, 600);
        }
        progressFill.style.width = `${progress}%`;
        percentageText.textContent = `${progress}%`;
    }, 40);

    // Prevent scrolling during loader
    document.body.style.overflowY = 'hidden';


    // ==========================================
    // 2. CUSTOM GLOW CURSOR SYSTEM
    // ==========================================
    const cursorDot = document.getElementById('custom-cursor');
    const cursorGlow = document.getElementById('custom-cursor-glow');

    // Detect touch input to disable custom cursor on touch/hybrid screens
    document.addEventListener('touchstart', function onFirstTouch() {
        document.body.classList.add('touch-device');
        document.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });

    if (cursorDot && cursorGlow) {
        document.body.classList.add('custom-cursor-enabled');
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot immediately matches mouse position
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth follower animation loop for the outer glow circle
        function animateCursor() {
            // Linear interpolation for smooth trailing
            currentX += (mouseX - currentX) * 0.12;
            currentY += (mouseY - currentY) * 0.12;
            
            cursorGlow.style.left = `${currentX}px`;
            cursorGlow.style.top = `${currentY}px`;
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor scaling states when hovering interactive nodes
        const interactives = document.querySelectorAll('a, button, input, textarea, .project-card, .certificate-card, .stat-card, .hamburger-menu');
        
        interactives.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursorDot.classList.add('active');
                cursorGlow.classList.add('active');
            });
            element.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('active');
                cursorGlow.classList.remove('active');
            });
        });
    }


    // ==========================================
    // 3. CANVAS PARTICLE NETWORK
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let connectionDistance = 110;
        let particleCount = 80;

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            
            // Adjust particle density based on screen dimensions
            if (window.innerWidth < 768) {
                particleCount = 35;
                connectionDistance = 80;
            } else {
                particleCount = 80;
                connectionDistance = 110;
            }
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle Blueprint
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.speedY = (Math.random() - 0.5) * 0.6;
                this.color = Math.random() > 0.5 ? '#00E5FF' : '#7C3AED';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Edge Collision Bouncing
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Initialize particles array
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        // Drawing connector nodes
        function drawConnections() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        // Dynamic alpha depending on distance proximity
                        const alpha = (1 - (distance / connectionDistance)) * 0.15;
                        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Loop animation frame rate
        function runParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            drawConnections();
            requestAnimationFrame(runParticles);
        }
        runParticles();
    }


    // ==========================================
    // 4. CYBER TYPING SYSTEM
    // ==========================================
    const typingSpan = document.getElementById('typing-text');
    const terms = ["Cybersecurity Engineer", "AI Engineer", "Full Stack Developer", "Ethical Hacker", "Prompt Engineer"];
    let termIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function handleTyping() {
        const currentTerm = terms[termIdx];
        
        if (isDeleting) {
            // Erasing characters
            typingSpan.textContent = currentTerm.substring(0, charIdx - 1);
            charIdx--;
            typeDelay = 40; // Erase fast
        } else {
            // Typing characters
            typingSpan.textContent = currentTerm.substring(0, charIdx + 1);
            charIdx++;
            typeDelay = 100; // Normal typing speed
        }

        if (!isDeleting && charIdx === currentTerm.length) {
            // Finished typing word, pause
            typeDelay = 1500;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            // Word deleted, move to next term
            isDeleting = false;
            termIdx = (termIdx + 1) % terms.length;
            typeDelay = 400; // Quick breath before typing
        }

        setTimeout(handleTyping, typeDelay);
    }

    if (typingSpan) {
        setTimeout(handleTyping, 1000);
    }


    // ==========================================
    // 5. STICKY NAVBAR & NAVIGATION FLOWS
    // ==========================================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.getElementById('hamburger-menu');
    const navWrapper = document.getElementById('nav-links-wrapper');

    // Sticky Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        highlightActiveSection();
        updateTimelineProgress();
    });

    // Mobile Hamburger Menu Action
    if (hamburger && navWrapper) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navWrapper.classList.toggle('active');
            
            // Prevent background scrolling when overlay active
            if (navWrapper.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu on selecting navigations
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navWrapper.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (navWrapper.classList.contains('active') && 
                !navWrapper.contains(e.target) && 
                !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navWrapper.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Highlighting current section links on scroll
    function highlightActiveSection() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Nav height offset
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }


    // ==========================================
    // 6. SCROLL REVEALS & TIMELINE CONTROLLER
    // ==========================================
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const skillProgressBars = document.querySelectorAll('.skill-fill');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineProgress = document.querySelector('.timeline-progress');

    function checkScrollReveal() {
        const triggerBottom = window.innerHeight * 0.85;

        // Reveal standard containers
        scrollRevealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });

        // Animate Skills bars when section visible
        skillProgressBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            if (barTop < triggerBottom) {
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth;
            }
        });

        // Trigger timelines elements
        timelineItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            if (itemTop < triggerBottom) {
                item.classList.add('active');
            }
        });

        // Check Stats numbers activation
        const statsSection = document.getElementById('stats-grid');
        if (statsSection) {
            const statsTop = statsSection.getBoundingClientRect().top;
            if (statsTop < triggerBottom && !statsSection.classList.contains('counted')) {
                statsSection.classList.add('counted');
                animateStatsCounters();
            }
        }
    }

    // Timeline connector line filling algorithm
    function updateTimelineProgress() {
        if (!timelineProgress) return;
        
        const timeline = document.querySelector('.timeline-container');
        if (!timeline) return;

        const timelineTop = timeline.offsetTop - window.innerHeight / 2;
        const timelineHeight = timeline.offsetHeight;
        const scrollPosition = window.scrollY;

        let scrolledRatio = (scrollPosition - timelineTop) / timelineHeight;
        
        if (scrolledRatio < 0) scrolledRatio = 0;
        if (scrolledRatio > 1) scrolledRatio = 1;

        timelineProgress.style.height = `${scrolledRatio * 100}%`;
    }

    window.addEventListener('scroll', checkScrollReveal);


    // ==========================================
    // 7. STATISTICS METRICS INCREMENTS
    // ==========================================
    function animateStatsCounters() {
        const counterFields = document.querySelectorAll('.stat-number');
        
        counterFields.forEach(counter => {
            const targetVal = parseInt(counter.getAttribute('data-target'), 10);
            let currentVal = 0;
            const stepDuration = Math.floor(1800 / targetVal); // Uniform run time
            
            const countInterval = setInterval(() => {
                currentVal++;
                counter.textContent = currentVal;
                
                if (currentVal >= targetVal) {
                    counter.textContent = targetVal;
                    clearInterval(countInterval);
                }
            }, stepDuration);
        });
    }


    // ==========================================
    // 8. CYBER FORM SUBMISSION TRANSPONDERS
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMsg = document.getElementById('form-status');

    // Sanitizes strings to prevent XSS (escapes HTML special characters)
    function sanitizeHTML(str) {
        return str.replace(/[&<>"']/g, (match) => {
            const escapeChars = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return escapeChars[match];
        });
    }

    // Validates structured email formatting
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    if (contactForm && submitBtn && statusMsg) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Retrieve input values safely
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const subjectInput = document.getElementById('form-subject');
            const messageInput = document.getElementById('form-message');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const subject = subjectInput.value.trim();
            const message = messageInput.value.trim();

            // Reset status message
            statusMsg.style.display = 'none';
            statusMsg.className = 'form-status-message';
            statusMsg.style.opacity = '1';

            // Validate fields
            if (!name || !email || !subject || !message) {
                statusMsg.textContent = "TRANSMISSION ERROR: ALL MESSAGE NODES ARE REQUIRED.";
                statusMsg.classList.add('error');
                statusMsg.style.display = 'block';
                return;
            }

            if (!isValidEmail(email)) {
                statusMsg.textContent = "TRANSMISSION ERROR: INVALID EMAIL FORMAT DETECTED.";
                statusMsg.classList.add('error');
                statusMsg.style.display = 'block';
                return;
            }

            if (name.length > 100 || email.length > 320 || subject.length > 150 || message.length > 5000) {
                statusMsg.textContent = "TRANSMISSION ERROR: PAYLOAD EXCEEDS MAXIMUM BUFFER LIMITS.";
                statusMsg.classList.add('error');
                statusMsg.style.display = 'block';
                return;
            }

            // Sanitize inputs
            const sanitizedName = sanitizeHTML(name);
            const sanitizedEmail = sanitizeHTML(email);
            const sanitizedSubject = sanitizeHTML(subject);
            const sanitizedMessage = sanitizeHTML(message);

            // Log details securely for demonstration purposes (shows secure programming principles)
            console.log(`[SECURE HANDSHAKE INIT] Initiating transmission payload...`);
            console.log(`Name Hash Identifier (Sanitized): ${sanitizedName}`);
            console.log(`Email Hash Destination: ${sanitizedEmail}`);

            // Add loading spinner state
            submitBtn.classList.add('loading');
            submitBtn.setAttribute('disabled', 'true');

            // Simulate encrypted data handshake payload transmission
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
                
                // Clear fields
                contactForm.reset();

                // Status message visual
                statusMsg.textContent = "PAYLOAD SECURELY TRANSMITTED. ENCRYPTED HANDSHAKE LINK ESTABLISHED.";
                statusMsg.className = "form-status-message success";
                statusMsg.style.display = "block";

                // Fade status message after time
                setTimeout(() => {
                    statusMsg.style.opacity = '0';
                    setTimeout(() => {
                        statusMsg.style.display = 'none';
                        statusMsg.style.opacity = '1';
                    }, 500);
                }, 5000);
            }, 2500);
        });
    }

    // ==========================================
    // 9. PROJECT FILTERING SYSTEM
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const cardCategories = card.getAttribute('data-category');
                    if (!cardCategories) return;
                    
                    const categories = cardCategories.split(' ');
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.classList.remove('filter-hide');
                        card.classList.add('filter-show');
                    } else {
                        card.classList.remove('filter-show');
                        card.classList.add('filter-hide');
                    }
                });
            });
        });
    }
});

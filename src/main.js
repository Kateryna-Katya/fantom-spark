document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ПЛАВНЫЙ СКРОЛЛ (LENIS) ---
    // Объявляем переменную здесь, чтобы она была видна во всем коде
    let lenis;

    // Проверяем, подключилась ли библиотека Lenis
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        // Интеграция с GSAP (чтобы скролл не дергался при анимациях)
        if (typeof gsap !== 'undefined') {
             gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    } else {
        console.warn("Библиотека Lenis не найдена. Плавный скролл отключен.");
    }

    // --- 2. ИКОНКИ ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- 3. АНИМАЦИИ (GSAP) ---
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Анимация заголовка (вылет букв/слов)
        const tl = gsap.timeline();
        tl.from('.hero__title .line', {
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power4.out"
        })
        .from('.hero__desc', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
        .from('.hero__actions', { opacity: 0, y: 20, duration: 0.8 }, "-=0.6");

        // Анимация появления карточек при скролле
        const cards = document.querySelectorAll('.about__card');
        if (cards.length > 0) {
            cards.forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.1
                });
            });
        }
    }

    // --- 4. МОБИЛЬНОЕ МЕНЮ ---
    const header = document.querySelector('.header');
    const burger = document.querySelector('.header__burger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');

    // Изменение цвета хедера при скролле
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if(header) header.style.background = 'rgba(212, 255, 0, 0.95)';
        } else {
            if(header) header.style.background = 'transparent';
        }
    });

    // Открытие/Закрытие меню
    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-active');

            // Блокируем скролл Lenis, когда меню открыто
            if (mobileMenu.classList.contains('is-active')) {
                if (lenis) lenis.stop();
            } else {
                if (lenis) lenis.start();
            }
        });
    }

    // Закрытие меню при клике на ссылку
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (burger) burger.classList.remove('is-active');
            if (mobileMenu) mobileMenu.classList.remove('is-active');
            if (lenis) lenis.start();
        });
    });

    // --- 5. ФОРМА КОНТАКТОВ (Валидация и капча) ---
    const form = document.getElementById('leadForm');
    
    if (form) {
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phoneError');
        const statusDiv = document.getElementById('formStatus');
        
        // Простая математическая капча
        const captchaQ = document.getElementById('captchaQuestion');
        const captchaA = document.getElementById('captchaAnswer');
        let n1 = Math.floor(Math.random() * 10) + 1;
        let n2 = Math.floor(Math.random() * 10) + 1;
        
        if(captchaQ) captchaQ.innerText = `${n1} + ${n2}`;

        // Валидация телефона (только цифры)
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9+]/g, '');
                if (e.target.value.length < 10) {
                    if(phoneError) phoneError.innerText = "Минимум 10 цифр";
                } else {
                    if(phoneError) phoneError.innerText = "";
                }
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Проверка капчи
            if (captchaA && parseInt(captchaA.value) !== n1 + n2) {
                if(statusDiv) {
                    statusDiv.innerText = "Ошибка в примере! Посчитайте снова.";
                    statusDiv.className = "form-status error";
                }
                return;
            }

            // Имитация отправки
            const submitBtn = form.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Отправка...";
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                form.reset();
                
                // Обновляем капчу
                n1 = Math.floor(Math.random() * 10) + 1;
                n2 = Math.floor(Math.random() * 10) + 1;
                if(captchaQ) captchaQ.innerText = `${n1} + ${n2}`;

                if(statusDiv) {
                    statusDiv.innerText = "Заявка успешно отправлена!";
                    statusDiv.className = "form-status success";
                    setTimeout(() => { statusDiv.innerText = ""; }, 5000);
                }
            }, 1500);
        });
    }

    // --- 6. COOKIE POPUP ---
    const cookiePopup = document.getElementById('cookiePopup');
    const acceptBtn = document.getElementById('acceptCookie');
    
    if (cookiePopup && !localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookiePopup.style.display = 'block';
            setTimeout(() => cookiePopup.classList.add('is-visible'), 10);
        }, 2000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            if(cookiePopup) {
                cookiePopup.classList.remove('is-visible');
                setTimeout(() => cookiePopup.style.display = 'none', 500);
            }
        });
    }

});
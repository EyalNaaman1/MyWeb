(function(){
        emailjs.init("8Wh5LSV3nex318hJ7");
      })();

      // Cookie Banner Logic
      document.addEventListener("DOMContentLoaded", function() {
          if (!localStorage.getItem("cookiesAccepted")) {
              setTimeout(() => {
                  document.getElementById("cookieBanner").classList.add("show");
              }, 1500);
          }

          document.getElementById("acceptCookies").addEventListener("click", function() {
              localStorage.setItem("cookiesAccepted", "true");
              document.getElementById("cookieBanner").classList.remove("show");
          });

          document.getElementById("declineCookies").addEventListener("click", function() {
              document.getElementById("cookieBanner").classList.remove("show");
          });
      });

      // Mobile nav toggle
      const navToggle = document.getElementById('navToggle');
      const mobileNav = document.getElementById('mobileNav');
      navToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = mobileNav.classList.toggle('open');
          navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          navToggle.setAttribute('aria-label', isOpen ? 'סגור תפריט ניווט' : 'פתח תפריט ניווט');
      });

      // Close mobile nav when clicking outside of it
      document.addEventListener('click', (e) => {
          if (!mobileNav.classList.contains('open')) return;
          const clickedInsideNav = mobileNav.contains(e.target) || navToggle.contains(e.target);
          if (!clickedInsideNav) {
              mobileNav.classList.remove('open');
              navToggle.setAttribute('aria-expanded', 'false');
              navToggle.setAttribute('aria-label', 'פתח תפריט ניווט');
          }
      });

      // Smooth scrolling + close mobile nav on click
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                  const offsetTop = target.offsetTop - 80;
                  window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }
              mobileNav.classList.remove('open');
              navToggle.setAttribute('aria-expanded', 'false');
          });
      });

      // Intersection Observer for animations
      const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
      const observer = new IntersectionObserver(function(entries) {
          entries.forEach(entry => {
              if (entry.isIntersecting) entry.target.classList.add('visible');
          });
      }, observerOptions);
      document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => observer.observe(el));

      // FAQ functionality
      document.querySelectorAll('.faq-question').forEach((question) => {
          question.addEventListener('click', function() {
              const faqItem = this.parentElement;
              const answer = faqItem.querySelector('.faq-answer');
              const isActive = answer.classList.contains('active');

              document.querySelectorAll('.faq-item').forEach((item) => {
                  if (item !== faqItem) {
                      const otherAnswer = item.querySelector('.faq-answer');
                      const otherQuestion = item.querySelector('.faq-question');
                      if (otherAnswer && otherQuestion) {
                          otherAnswer.classList.remove('active');
                          otherQuestion.classList.remove('active');
                          otherQuestion.setAttribute('aria-expanded', 'false');
                      }
                  }
              });

              if (isActive) {
                  answer.classList.remove('active');
                  this.classList.remove('active');
                  this.setAttribute('aria-expanded', 'false');
              } else {
                  answer.classList.add('active');
                  this.classList.add('active');
                  this.setAttribute('aria-expanded', 'true');
              }
          });
      });

      // Active nav state on scroll
      const sections = document.querySelectorAll('section[id]');
      const navItems = document.querySelectorAll('.floating-nav-item');

      function updateActiveNav() {
          let current = '';
          const scrollPos = window.scrollY + 120;
          sections.forEach(section => {
              if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.clientHeight) {
                  current = section.getAttribute('id');
              }
          });
          navItems.forEach(item => {
              item.classList.remove('active');
              if (item.getAttribute('href') === `#${current}`) item.classList.add('active');
          });
      }

      // Notification system
      function showNotification(message, type = 'success') {
          document.querySelectorAll('.notification').forEach(n => n.remove());
          const notification = document.createElement('div');
          notification.className = `notification ${type}`;
          notification.textContent = message;
          notification.setAttribute('role', 'alert');
          document.body.appendChild(notification);
          setTimeout(() => notification.classList.add('show'), 100);
          setTimeout(() => {
              notification.classList.remove('show');
              setTimeout(() => notification.remove(), 300);
          }, 5000);
      }

      // Form field validation helpers (Updated for Checkbox)
      const contactForm = document.getElementById('contactForm');
      const requiredFields = contactForm.querySelectorAll('input[required], textarea[required]');

      function isFieldValid(field) {
          if (field.type === 'checkbox') {
              return field.checked;
          }
          if (field.type === 'email') {
              return field.value.trim() !== '' && field.checkValidity();
          }
          return field.value.trim() !== '';
      }

      requiredFields.forEach(field => {
          field.addEventListener('input', () => {
              if (isFieldValid(field)) {
                  field.classList.remove('input-error');
              }
          });
          if (field.type === 'checkbox') {
              field.addEventListener('change', () => {
                  if (isFieldValid(field)) {
                      field.classList.remove('input-error');
                  }
              });
          }
      });

      // Contact form with EmailJS
      contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);

          let hasError = false;
          requiredFields.forEach(field => {
              if (!isFieldValid(field)) {
                  field.classList.add('input-error');
                  hasError = true;
              } else {
                  field.classList.remove('input-error');
              }
          });

          if (hasError) {
              showNotification('אנא מלא כראוי את כל השדות המסומנים ואשר את התקנון', 'error');
              return;
          }

          const button = this.querySelector('.submit-button');
          const originalText = button.textContent;
          button.textContent = 'שולח הודעה...';
          button.disabled = true;

          const whatsappFollowup = document.getElementById('whatsappFollowup');
          whatsappFollowup.innerHTML = '';

          if (typeof emailjs === 'undefined') {
              showNotification('מערכת השליחה בטעינה, אנא נסה שוב בעוד רגע', 'error');
              button.textContent = originalText;
              button.disabled = false;
              return;
          }

          const templateParams = {
              from_name: data.name,
              from_phone: data.phone,
              from_email: data.email,
              subject: data.subject,
              message: data.message,
              name: data.name,
              email: data.email
          };

          emailjs.send("service_zjb8pns", "template_9e6prma", templateParams, "8Wh5LSV3nex318hJ7")
              .then(function(response) {
                  showNotification('ההודעה נשלחה בהצלחה!', 'success');

                  const whatsappMessage = `שלום עו"ד נעמן,

פנייה חדשה מהאתר:

📝 שם: ${data.name}
📞 טלפון: ${data.phone}
📧 דואר: ${data.email}
🏷️ נושא: ${data.subject}

💬 הודעה:
${data.message}`;
                  const whatsappLink = `https://wa.me/972544679144?text=${encodeURIComponent(whatsappMessage)}`;

                  const waBtn = document.createElement('a');
                  waBtn.href = whatsappLink;
                  waBtn.target = '_blank';
                  waBtn.rel = 'noopener';
                  waBtn.className = 'whatsapp-followup-btn';
                  waBtn.innerHTML = `
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.74 13.4L3 21l3.7-1.27a8.93 8.93 0 0 0 5.36 1.72h.01a8.94 8.94 0 0 0 8.93-8.85 8.86 8.86 0 0 0-2.5-6.28zM12.06 19.8a7.4 7.4 0 0 1-3.78-1.04l-.27-.16-2.8.96.94-2.73-.18-.28a7.4 7.4 0 1 1 6.1 3.25zm4.1-5.5c-.22-.11-1.31-.65-1.51-.72-.2-.07-.35-.11-.5.11-.15.26-.16-.48.05-1.32-.66-2.18-1.18-3.05-2.67-.23-.4.23-.37.66-1.23.07-.15.04-.27-.03-.38-.07-.11-.62-1.5-.85-2.05-.22-.53-.45-.46-.62-.47-.16-.01-.34-.01-.52-.01-.18 0-.46.07-.71.34-.25.27-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.13.18 1.83 2.8 4.45 3.81 2.1.8 2.52.64 2.97.6.45-.04 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.1-.21-.16-.43-.27z"/></svg>
                      <span>הטופס נשלח בהצלחה! לחץ כאן לשליחה גם בווטסאפ (אופציונלי)</span>
                  `;
                  whatsappFollowup.innerHTML = '';
                  whatsappFollowup.appendChild(waBtn);
                  requestAnimationFrame(() => waBtn.classList.add('show'));

                  e.target.reset();
              }, function(error) {
                  console.error("שגיאה בשליחת אימייל:", error);
                  showNotification('אירעה שגיאה בשליחת ההודעה, נסה שוב', 'error');
              }).finally(() => {
                  button.textContent = originalText;
                  button.disabled = false;
              });
      });

      // Back to top button
      const backToTopBtn = document.getElementById('backToTopBtn');
      function updateBackToTop() {
          if (window.scrollY > 300) {
              backToTopBtn.hidden = false;
              requestAnimationFrame(() => backToTopBtn.classList.add('show'));
          } else {
              backToTopBtn.classList.remove('show');
              backToTopBtn.hidden = true;
          }
      }
      backToTopBtn.addEventListener('click', () => {
          const target = document.getElementById('hero');
          const offsetTop = target ? target.offsetTop : 0;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      });

      // Scroll handling
      let ticking = false;
      function requestTick() {
          if (!ticking) {
              requestAnimationFrame(() => { updateActiveNav(); updateBackToTop(); ticking = false; });
              ticking = true;
          }
      }
      window.addEventListener('scroll', requestTick, { passive: true });

      document.addEventListener('DOMContentLoaded', function() {
          setTimeout(() => {
              document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
                  if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
              });
          }, 100);
          updateActiveNav();
          updateBackToTop();
      });

      // Keyboard navigation for FAQ (Escape closes open answers)
      document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
              document.querySelectorAll('.faq-answer.active').forEach(answer => {
                  answer.classList.remove('active');
                  const question = answer.parentElement.querySelector('.faq-question');
                  question.classList.remove('active');
                  question.setAttribute('aria-expanded', 'false');
              });
          }
      });
      
      window.addEventListener('load', () => {
        const fixAllAccessibility = setInterval(() => {
            const heBtn = document.querySelector('[data-enable-lang="he_IL"]');
            const enBtn = document.querySelector('[data-enable-lang="en_US"]');
            const modal = document.getElementById('enable-modal');
            if (heBtn) heBtn.setAttribute('aria-label', 'שנה שפה לעברית');
            if (enBtn) enBtn.setAttribute('aria-label', 'Change language to English');
            if (modal) modal.setAttribute('aria-label', 'תפריט נגישות');

            const toolbar = document.getElementById('enable-toolbar-buttons');
            if (toolbar) {
                toolbar.setAttribute('aria-labelledby', 'enable-toolbar-trigger');
                toolbar.removeAttribute('aria-labeledby');
                toolbar.setAttribute('role', 'menu');
            }

            if (heBtn && toolbar) clearInterval(fixAllAccessibility);
        }, 500);

        setTimeout(() => clearInterval(fixAllAccessibility), 5000);
    });
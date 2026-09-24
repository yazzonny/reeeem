/**
 * Ali & Reem Wedding Invitation
 * Interactive logic: Envelope Opening, Carousel, Countdown, Audio, Lightbox, RSVP
 */

(function () {
  'use strict';

  // State
  let envelopeOpened = false;
  let currentSlide = 0;
  const totalSlides = 3;
  let soundEnabled = false;
  let audioCtx = null;
  let ambientInterval = null;

  // Photo data for carousel & lightbox
  const photoData = [
    {
      src: 'assets/ring-ceremony.jpg',
      title: 'The Sacred Ring',
      caption: 'Ali placing the ring on Reem’s finger — A solemn vow and eternal promise.'
    },
    {
      src: 'assets/holding-hands.jpg',
      title: 'Hand in Hand',
      caption: 'Intertwined fingers with wedding rings — Two lives stepping forward together.'
    },
    {
      src: 'assets/together.jpg',
      title: 'Near to the Heart',
      caption: 'Groom holding bride’s hand against his heart — Love anchored in affection and grace.'
    }
  ];

  /* ========================================================
     1. INITIALIZATION ON DOM LOADED
     ======================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initEnvelope();
    initCarousel();
    initCountdown();
    initScrollReveal();
    initAmbientParticles();
    initRSVP();
    initKeyboardNav();
  });

  /* ========================================================
     2. ENVELOPE / CARD OPENING REVEAL
     ======================================================== */
  function initEnvelope() {
    const overlay = document.getElementById('envelope-overlay');
    const envelopeContainer = document.getElementById('envelope-container');
    const waxSeal = document.getElementById('wax-seal');
    const prompt = document.getElementById('envelope-prompt');
    const mainWebsite = document.getElementById('main-website');
    const reopenBtn = document.getElementById('reopen-envelope-btn');

    document.body.classList.add('envelope-active');

    function triggerOpen() {
      if (envelopeOpened) return;
      envelopeOpened = true;

      // Play soft harp chime on open
      playWeddingChime();

      // Step 1: Flap opens and seal lifts
      envelopeContainer.classList.add('opening');
      if (prompt) {
        prompt.style.opacity = '0';
        prompt.style.pointerEvents = 'none';
      }

      // Step 2: Card glides up smoothly out of envelope pocket
      setTimeout(() => {
        envelopeContainer.classList.add('card-reveal');
      }, 550);

      // Step 3: Envelope dissolves and scales into main site
      setTimeout(() => {
        overlay.classList.add('transitioning');
      }, 2100);

      // Step 4: Hide overlay completely and reveal website
      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('transitioning');
        mainWebsite.classList.add('visible');
        document.body.classList.remove('envelope-active');
        // Trigger scroll reveals in hero
        document.querySelectorAll('.hero-content-card').forEach(el => el.classList.add('revealed'));
      }, 2850);
    }

    envelopeContainer.addEventListener('click', triggerOpen);
    envelopeContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerOpen();
      }
    });

    if (waxSeal) {
      waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerOpen();
      });
    }

    if (prompt) {
      prompt.addEventListener('click', triggerOpen);
    }

    if (reopenBtn) {
      reopenBtn.addEventListener('click', () => {
        replayEnvelope();
      });
    }
  }

  // Global replay function
  window.replayEnvelope = function () {
    const overlay = document.getElementById('envelope-overlay');
    const envelopeContainer = document.getElementById('envelope-container');
    const prompt = document.getElementById('envelope-prompt');
    const mainWebsite = document.getElementById('main-website');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    envelopeOpened = false;
    envelopeContainer.classList.remove('opening', 'card-reveal');
    overlay.classList.remove('hidden', 'transitioning');
    if (prompt) {
      prompt.style.opacity = '1';
      prompt.style.pointerEvents = 'auto';
    }
    document.body.classList.add('envelope-active');
  };

  /* ========================================================
     3. WEDDING AMBIENT SOUND (WEB AUDIO API CHIMES)
     ======================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playNote(freq, startTime, duration = 1.6, gainLevel = 0.08) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Warm, bell-like harp harmonics
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  function playWeddingChime() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Luxurious pentatonic ascending chime (F# major / Champagne serenity)
    const notes = [277.18, 369.99, 415.30, 554.37, 739.99, 830.61]; // C#4, F#4, G#4, C#5, F#5, G#5
    notes.forEach((freq, index) => {
      playNote(freq, now + index * 0.18, 2.2, 0.09);
    });
  }

  function playGentleArpeggioLoop() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [369.99, 440.00, 554.37, 659.25, 739.99]; // Gentle soft acoustic sweep
    chord.forEach((freq, idx) => {
      playNote(freq, now + idx * 0.28, 2.6, 0.04);
    });
  }

  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      const ctx = getAudioContext();

      if (soundEnabled) {
        soundBtn.classList.remove('muted');
        playWeddingChime();
        if (ambientInterval) clearInterval(ambientInterval);
        ambientInterval = setInterval(() => {
          if (soundEnabled) playGentleArpeggioLoop();
        }, 9000);
      } else {
        soundBtn.classList.add('muted');
        if (ambientInterval) {
          clearInterval(ambientInterval);
          ambientInterval = null;
        }
      }
    });
  }

  /* ========================================================
     4. PHOTOS GALLERY & CAROUSEL
     ======================================================== */
  function initCarousel() {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dots = document.querySelectorAll('.carousel-dots .dot-btn');
    const thumbs = document.querySelectorAll('.gallery-triptych-preview .thumb-card');

    window.goToSlide = function (index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;

      if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
      }

      // Update active slides
      document.querySelectorAll('.carousel-slide').forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
      });

      // Update dots
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });

      // Update thumbnails
      thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === currentSlide);
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide + 1);
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        goToSlide(idx);
      });
    });

    // Touch Swipe Gesture support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselElem = document.getElementById('wedding-carousel');

    if (carouselElem) {
      carouselElem.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carouselElem.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
    }
  }

  /* ========================================================
     5. PHOTO LIGHTBOX MODAL (DESKTOP & MOBILE TOUCH)
     ======================================================== */
  let lightboxActiveIndex = 0;

  window.openLightbox = function (index) {
    lightboxActiveIndex = index;
    const modal = document.getElementById('photo-lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const counter = document.getElementById('lightbox-counter');

    if (!modal || !img) return;

    const data = photoData[lightboxActiveIndex];
    img.src = data.src;
    img.alt = data.title;
    if (caption) {
      caption.textContent = `${data.title} — ${data.caption}`;
    }
    if (counter) {
      counter.textContent = `${lightboxActiveIndex + 1} / ${totalSlides}`;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightboxDirect = function () {
    const modal = document.getElementById('photo-lightbox');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.closeLightbox = function (event) {
    if (event.target.id === 'photo-lightbox') {
      window.closeLightboxDirect();
    }
  };

  window.navigateLightbox = function (direction, event) {
    if (event) event.stopPropagation();
    let newIndex = lightboxActiveIndex + direction;
    if (newIndex < 0) newIndex = totalSlides - 1;
    if (newIndex >= totalSlides) newIndex = 0;
    window.openLightbox(newIndex);
  };

  function initKeyboardNav() {
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('photo-lightbox');
      if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') {
          window.closeLightboxDirect();
        } else if (e.key === 'ArrowLeft') {
          window.navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
          window.navigateLightbox(1);
        }
      }
    });

    // Touch Swipe in Lightbox for mobile users
    const modal = document.getElementById('photo-lightbox');
    if (modal) {
      let lbTouchStartX = 0;
      let lbTouchEndX = 0;

      modal.addEventListener('touchstart', (e) => {
        lbTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      modal.addEventListener('touchend', (e) => {
        lbTouchEndX = e.changedTouches[0].screenX;
        const diff = lbTouchEndX - lbTouchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            window.navigateLightbox(1);
          } else {
            window.navigateLightbox(-1);
          }
        }
      }, { passive: true });
    }
  }

  /* ========================================================
     6. WEDDING COUNTDOWN TIMER
     Date: Wednesday, October 7, 2026, 19:00:00 (Amman, Jordan)
     ======================================================== */
  function initCountdown() {
    // Wedding Date: Oct 7, 2026, 19:00 Amman Time (UTC+3)
    const weddingDate = new Date('2026-10-07T19:00:00+03:00').getTime();

    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-minutes');
    const secsEl = document.getElementById('count-seconds');
    const statusText = document.getElementById('countdown-status-text');

    function updateTimer() {
      const now = new Date().getTime();
      const difference = weddingDate - now;

      if (difference <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        if (statusText) statusText.textContent = 'Today is the Celebration Day!';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minsEl) minsEl.textContent = minutes.toString().padStart(2, '0');
      if (secsEl) secsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /* ========================================================
     7. CALENDAR INTEGRATION (GOOGLE CALENDAR & ICAL)
     ======================================================== */
  window.addToGoogleCalendar = function () {
    const title = encodeURIComponent('Ali & Reem Wedding Celebration');
    const details = encodeURIComponent('You are cordially invited to celebrate the holy union of Ali & Reem at the Royal Hotel, Amman. Reception begins at 6:30 PM.');
    const location = encodeURIComponent('Royal Hotel, Amman, Jordan');
    // 2026-10-07 19:00 Amman (UTC+3 is 16:00 UTC)
    const dates = '20261007T160000Z/20261007T220000Z';
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
  };

  window.downloadICalFile = function () {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ali and Reem//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:wedding-ali-reem-20261007@wedding.jo',
      'DTSTAMP:20261007T000000Z',
      'DTSTART:20261007T160000Z',
      'DTEND:20261007T220000Z',
      'SUMMARY:Ali & Reem Wedding Celebration',
      'DESCRIPTION:Together with their families\\, Ali and Reem request the honor of your presence at their wedding celebration.',
      'LOCATION:Royal Hotel\\, Zahran Street\\, Amman\\, Jordan',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Ali-and-Reem-Wedding.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ========================================================
     8. RSVP FORM SUBMISSION
     ======================================================== */
  function initRSVP() {
    const form = document.getElementById('rsvp-form');
    const alertBox = document.getElementById('rsvp-success-message');
    const alertBody = document.getElementById('rsvp-feedback-text');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const guestName = document.getElementById('guest-name').value.trim();
      const attendance = document.getElementById('guest-attendance').value;
      const count = document.getElementById('guest-count').value;
      const message = document.getElementById('guest-message').value.trim();

      const rsvpData = {
        name: guestName,
        attendance: attendance,
        count: count,
        message: message,
        submittedAt: new Date().toISOString()
      };

      // Store in localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('ali_reem_rsvps') || '[]');
        saved.push(rsvpData);
        localStorage.setItem('ali_reem_rsvps', JSON.stringify(saved));
      } catch (err) {
        console.warn('Storage unavailable', err);
      }

      // Customize confirmation text
      if (attendance === 'attending') {
        alertBody.innerHTML = `Dearest <strong>${escapeHTML(guestName)}</strong>, thank you for confirming attendance for <strong>${count} guest(s)</strong>. We eagerly await celebrating with you at the Royal Hotel!`;
      } else {
        alertBody.innerHTML = `Dearest <strong>${escapeHTML(guestName)}</strong>, you will be deeply missed in person, but your warm wishes will be held closely in our hearts!`;
      }

      alertBox.classList.remove('hidden');
      form.reset();

      // Trigger soft celebration chime
      playWeddingChime();
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  /* ========================================================
     9. INTERSECTION OBSERVER FOR SCROLL REVEALS
     ======================================================== */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.15
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ========================================================
     10. AMBIENT GOLDEN DUST PARTICLES (CANVAS)
     ======================================================== */
  function initAmbientParticles() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particleCount = 42;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
        alphaSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.1) // gently float upward
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha <= 0.1 || p.alpha >= 0.65) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(223, 194, 130, ${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(223, 194, 130, 0.4)';
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    render();
  }

})();

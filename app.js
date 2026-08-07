(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* ── Sticky nav glass intensify on scroll ── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── GSAP: page entrance animations ── */
  if (hasGsap && !prefersReducedMotion) {
    const cards = gsap.utils.toArray('.story-card');
    if (cards.length) {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.035,
        ease: 'power2.out',
        delay: 0.08,
        onComplete: function () {
          cards.forEach(function (c) { c.classList.add('is-visible'); });
        }
      });
    } else {
      document.querySelectorAll('.story-card').forEach(function (c) {
        c.classList.add('is-visible');
      });
    }

    /* Item page: header + comments slide in */
    const itemHeader = document.querySelector('.item-header');
    if (itemHeader) {
      gsap.from(itemHeader, { opacity: 0, y: -16, duration: 0.5, ease: 'power3.out' });
    }

    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
      gsap.from(commentForm, { opacity: 0, y: 12, duration: 0.45, delay: 0.15, ease: 'power2.out' });
    }

    const comments = gsap.utils.toArray('.comment-thread > .comment');
    if (comments.length) {
      gsap.from(comments, {
        opacity: 0,
        x: -12,
        duration: 0.4,
        stagger: 0.07,
        delay: 0.25,
        ease: 'power2.out'
      });
    }

    /* Trending sticker wobble via GSAP (replaces CSS pulse when GSAP active) */
    gsap.utils.toArray('.trending-sticker').forEach(function (sticker) {
      sticker.style.animation = 'none';
      gsap.to(sticker, {
        rotation: -4,
        scale: 1.06,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    /* Ambient orbs slow parallax on scroll */
    if (typeof ScrollTrigger !== 'undefined') {
      const orbs = gsap.utils.toArray('.orb');
      if (orbs.length) {
        gsap.to(orbs[0], { y: 60, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.2 } });
        if (orbs[1]) gsap.to(orbs[1], { y: -50, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 } });
        if (orbs[2]) gsap.to(orbs[2], { x: -40, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 } });
      }
    }

    /* Magnetic hover on primary buttons */
    document.querySelectorAll('.btn-primary').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.18, y: y * 0.18, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  } else {
    document.querySelectorAll('.story-card').forEach(function (c) {
      c.classList.add('is-visible');
    });
  }

  /* ── Boost chips ── */
  document.querySelectorAll('.boost-chip').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      const wasBoosted = chip.classList.contains('boosted');
      chip.classList.toggle('boosted', !wasBoosted);
      chip.setAttribute('aria-pressed', String(!wasBoosted));

      if (prefersReducedMotion) return;

      if (hasGsap) {
        gsap.fromTo(chip,
          { scale: 1 },
          { scale: 1.22, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }
        );
        if (!wasBoosted) {
          gsap.fromTo(chip.querySelector('.boost-icon'),
            { y: 0 },
            { y: -4, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }
          );
        }
      } else {
        chip.classList.remove('bounce');
        void chip.offsetWidth;
        chip.classList.add('bounce');
        chip.addEventListener('animationend', function handler() {
          chip.classList.remove('bounce');
          chip.removeEventListener('animationend', handler);
        });
      }
    });
  });

  /* ── Collapsible comment threads (GSAP height slide) ── */
  document.querySelectorAll('.comment-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const comment = btn.closest('.comment');
      if (!comment) return;

      const body = comment.querySelector(':scope > .comment-row > .comment-content > .comment-body');
      const replies = comment.querySelector(':scope > .comment-replies');
      const isExpanded = btn.getAttribute('aria-expanded') !== 'false';

      if (hasGsap && !prefersReducedMotion) {
        const targets = [body, replies].filter(Boolean);

        if (isExpanded) {
          /* Collapse */
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = '[+]';

          targets.forEach(function (el) {
            gsap.to(el, {
              height: 0,
              opacity: 0,
              duration: 0.28,
              ease: 'power2.inOut',
              onStart: function () {
                el.style.overflow = 'hidden';
                el.style.display = 'block';
                el.classList.remove('collapsed');
              },
              onComplete: function () {
                el.classList.add('collapsed');
                el.style.height = '';
                el.style.overflow = '';
                el.style.display = '';
              }
            });
          });
        } else {
          /* Expand */
          btn.setAttribute('aria-expanded', 'true');
          btn.textContent = '[–]';

          targets.forEach(function (el) {
            el.classList.remove('collapsed');
            el.style.overflow = 'hidden';
            el.style.height = 'auto';
            const fullHeight = el.offsetHeight;
            el.style.height = '0';
            el.style.opacity = '0';

            gsap.to(el, {
              height: fullHeight,
              opacity: 1,
              duration: 0.32,
              ease: 'power2.out',
              onComplete: function () {
                el.style.height = '';
                el.style.overflow = '';
                el.style.opacity = '';
              }
            });
          });
        }
      } else {
        const collapsed = btn.getAttribute('aria-expanded') === 'false';
        btn.setAttribute('aria-expanded', String(collapsed));
        btn.textContent = collapsed ? '[–]' : '[+]';
        if (body) body.classList.toggle('collapsed', !collapsed);
        if (replies) replies.classList.toggle('collapsed', !collapsed);
      }
    });
  });

  /* ── Story card hover tilt (subtle GSAP) ── */
  if (hasGsap && !prefersReducedMotion) {
    document.querySelectorAll('.story-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateX: relY * -3,
          rotateY: relX * 3,
          transformPerspective: 600,
          duration: 0.35,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }
})();

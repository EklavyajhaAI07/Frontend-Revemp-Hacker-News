(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* ── Client-side User Session Management ── */
  const loggedInUser = localStorage.getItem('hn_username');

  // Handle Login Page forms
  const forms = document.querySelectorAll('.form-page form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const userInput = form.querySelector('input[name="username"]');
      if (userInput && userInput.value.trim()) {
        const username = userInput.value.trim();
        localStorage.setItem('hn_username', username);
        alert(`Successfully signed in as @${username}!`);
        window.location.href = 'index.html';
      }
    });
  });

  // Handle Submission Page form
  if (window.location.pathname.endsWith('submit.html')) {
    const sForm = document.querySelector('.form-page form');
    if (sForm) {
      sForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const titleInput = document.getElementById('title');
        if (titleInput && titleInput.value.trim()) {
          alert('Story submitted successfully!');
          window.location.href = 'index.html';
        }
      });
    }
  }

  // Handle Sign out
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-signout')) {
      e.preventDefault();
      localStorage.removeItem('hn_username');
      alert('Signed out successfully.');
      window.location.href = 'index.html';
    }
  });

  // Update navbar based on login state
  const signinBtn = document.getElementById('btn-signin');
  if (signinBtn) {
    if (loggedInUser) {
      const userContainer = document.createElement('div');
      userContainer.className = 'user-profile-menu';
      userContainer.style.display = 'flex';
      userContainer.style.alignItems = 'center';
      userContainer.style.gap = 'var(--space-xs)';
      
      const userSpan = document.createElement('span');
      userSpan.className = 'meta-chip';
      userSpan.style.margin = '0';
      userSpan.style.fontWeight = 'bold';
      userSpan.style.color = 'var(--accent-primary)';
      userSpan.textContent = `@${loggedInUser}`;

      const signoutBtn = document.createElement('button');
      signoutBtn.className = 'btn btn-ghost btn-signout';
      signoutBtn.style.padding = 'var(--space-xs) var(--space-sm)';
      signoutBtn.textContent = 'Sign out';

      userContainer.appendChild(userSpan);
      userContainer.appendChild(signoutBtn);

      signinBtn.parentNode.replaceChild(userContainer, signinBtn);
    }
  }

  // Handle Post It button access
  const postBtn = document.getElementById('btn-post');
  if (postBtn) {
    postBtn.addEventListener('click', function (e) {
      if (!loggedInUser) {
        e.preventDefault();
        e.stopPropagation();
        alert('Please sign in first to submit a story.');
        window.open('login.html', '_blank');
      }
    });
  }

  // If on submit.html page and not logged in, force redirect to login
  if (window.location.pathname.endsWith('submit.html') && !loggedInUser) {
    alert('Please sign in first to access the submission page.');
    window.location.href = 'login.html';
  }

  /* ── Requirement 4: Always open links in a new window ── */
  function enforceNewWindowLinks() {
    document.querySelectorAll('a').forEach(function (link) {
      // Don't target blank if it's dynamic/signout actions
      if (!link.classList.contains('btn-signout')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // Intercept any click on anchor tags to guarantee opening in a new tab/window
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a');
    if (anchor && !anchor.classList.contains('btn-signout')) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  }, true);

  enforceNewWindowLinks();

  /* ── Sticky nav glass intensify on scroll ── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── GSAP: page entrance fade animations (No scaling) ── */
  if (hasGsap && !prefersReducedMotion) {
    const cards = gsap.utils.toArray('.story-card');
    if (cards.length) {
      gsap.to(cards, {
        opacity: 1,
        duration: 0.35,
        stagger: 0.025,
        ease: 'power2.out',
        delay: 0.05,
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
      gsap.from(itemHeader, { opacity: 0, duration: 0.4, ease: 'power2.out' });
    }

    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
      gsap.from(commentForm, { opacity: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' });
    }

    const comments = gsap.utils.toArray('.comment-thread > .comment');
    if (comments.length) {
      gsap.from(comments, {
        opacity: 0,
        duration: 0.35,
        stagger: 0.05,
        delay: 0.15,
        ease: 'power2.out'
      });
    }
  } else {
    document.querySelectorAll('.story-card').forEach(function (c) {
      c.classList.add('is-visible');
    });
  }

  /* ── Boost chips toggling (No scale bounce) ── */
  document.querySelectorAll('.boost-chip').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      const wasBoosted = chip.classList.contains('boosted');
      chip.classList.toggle('boosted', !wasBoosted);
      chip.setAttribute('aria-pressed', String(!wasBoosted));
    });
  });

  /* ── Collapsible comment threads ── */
  document.querySelectorAll('.comment-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
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
              duration: 0.25,
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
              duration: 0.28,
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
})();


/* ─────────────────────────────────────────────────────────────
   Om Pranab Mohanty — portfolio script
   ───────────────────────────────────────────────────────────── */

const DATA = {
  interests:    'data/interests.json',
  projects:     'data/projects.json',
  publications: 'data/publications.json',
  now:          'data/now.json',
};

function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}`);
  const data = await res.json();
  return data.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
}

// ── Render: Interests ─────────────────────────────────────────
function renderInterests(items) {
  const el = document.getElementById('interests-container');
  if (!el) return;
  el.innerHTML = items.map((item, i) => `
    <div class="interest-item" style="--d:${i * 60}ms">
      <div class="interest-num">[ ${String(i + 1).padStart(2, '0')} ]</div>
      <div class="interest-title">${esc(item.title)}</div>
      <p class="interest-desc">${esc(item.description)}</p>
    </div>
  `).join('');
}

// ── Render: Projects ──────────────────────────────────────────
function renderProjects(items) {
  const el = document.getElementById('projects-container');
  if (!el) return;
  el.innerHTML = items.map((p, i) => {
    const name = p.name.replace(/-/g, ' ');
    return `
    <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"
       class="project-row" style="--d:${i * 70}ms">
      <div class="proj-left">
        <div class="proj-prompt"><span class="prompt-sym">$</span> ./${esc(p.name)}</div>
        <div class="proj-name">${esc(name)}</div>
        <p class="proj-desc">${esc(p.description)}</p>
        <span class="proj-lang">${esc(p.language)}</span>
      </div>
      <span class="proj-arrow">↗</span>
    </a>`;
  }).join('');
}

// ── Render: Publications ──────────────────────────────────────
function renderPublications(items) {
  const el = document.getElementById('publications-container');
  if (!el) return;
  el.innerHTML = items.map((pub, i) => `
    <div class="pub-item" style="--d:${i * 70}ms">
      <div class="pub-status">${esc(pub.status)}</div>
      <div class="pub-title">${esc(pub.title)}</div>
      ${pub.authors ? `<div class="pub-meta">${esc(pub.authors)}</div>` : ''}
      ${pub.journal ? `<div class="pub-meta">${esc(pub.journal)}</div>` : ''}
      ${pub.note    ? `<p class="pub-note">${esc(pub.note)}</p>` : ''}
    </div>
  `).join('');
}


// ── Render: Now ───────────────────────────────────────────────
function renderNow(data) {
  const el = document.getElementById('now-container');
  if (!el || !data) return;

  const categories = [
    { key: 'reading',  label: 'reading',  icon: '▸' },
    { key: 'building', label: 'building', icon: '▸' },
    { key: 'thinking', label: 'thinking', icon: '▸' },
  ];

  el.innerHTML = categories.map(cat => {
    const items = data[cat.key];
    if (!items || !items.length) return '';
    return `
      <div class="now-block">
        <div class="now-cat">${cat.icon} ${cat.label}</div>
        <ul class="now-items">
          ${items.map(item => `
            <li class="now-item">
              <span class="now-item-title">${esc(item.title)}</span>
              ${item.note ? `<span class="now-item-note"> — ${esc(item.note)}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>`;
  }).join('');

  if (data.updated) {
    const stamp = document.getElementById('now-updated');
    if (stamp) stamp.textContent = `last updated: ${esc(data.updated)}`;
  }
}

// ── Copy email to clipboard ────────────────────────────────────
function setupCopyEmail() {
  const row = document.getElementById('email-row');
  if (!row) return;
  const email = 'ompranabmohanty@gmail.com';

  row.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    const arrow = row.querySelector('.contact-arrow');
    const val   = row.querySelector('.contact-value');
    const origArrow = arrow.textContent;
    const origVal   = val.textContent;
    arrow.textContent = '✓';
    val.textContent   = 'copied!';
    row.classList.add('copied');
    setTimeout(() => {
      arrow.textContent = origArrow;
      val.textContent   = origVal;
      row.classList.remove('copied');
    }, 2000);
  });
}
// ── Reveal on scroll ──────────────────────────────────────────
function setupRevealOnScroll() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.interest-item, .project-row, .pub-item')
    .forEach(el => obs.observe(el));
}

// ── Scroll-spy + nav ──────────────────────────────────────────
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  const nav      = document.getElementById('nav');
  const bar      = document.querySelector('.progress-bar');

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-52px 0px -55% 0px' });

  sections.forEach(s => spy.observe(s));

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    if (bar) bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Custom cursor ──────────────────────────────────────────────
function setupCursor() {
  const dot = document.getElementById('cursorDot');
  if (!dot || window.matchMedia('(max-width:640px)').matches) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    dot.style.left = cx + 'px';
    dot.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  })();
}

// ── Hero canvas — scan-line grid ──────────────────────────────
function setupHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const COLS = 28, ROWS = 16;
  let dots = [];

  function buildDots() {
    dots = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dots.push({
          ox: (c / (COLS - 1)) * W,
          oy: (r / (ROWS - 1)) * H,
          x: 0, y: 0,
          phase: Math.random() * Math.PI * 2,
          speed: 0.25 + Math.random() * 0.35,
          amp:   2 + Math.random() * 4,
        });
      }
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.007;

    dots.forEach(d => {
      d.x = d.ox + Math.sin(t * d.speed + d.phase) * d.amp;
      d.y = d.oy + Math.cos(t * d.speed + d.phase * 1.4) * d.amp * 0.5;
    });

    // Lines
    const threshold = W / COLS * 1.8;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < threshold) {
          ctx.globalAlpha = (1 - dist / threshold) * 0.22;
          ctx.strokeStyle = '#4af0a0';
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }
    // Dots
    ctx.globalAlpha = 1;
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74,240,160,0.28)';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); buildDots(); });
  resize();
  buildDots();
  draw();
}

// ── Terminal typewriter for hero tag ─────────────────────────
function setupTypewriter() {
  const el = document.querySelector('.hero-tag');
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.style.animation = 'none';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  cursor.textContent = '█';
  el.appendChild(cursor);
  const iv = setInterval(() => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i++]), cursor);
    } else {
      clearInterval(iv);
      setTimeout(() => cursor.style.display = 'none', 800);
    }
  }, 45);
}

// ── Progress bar ──────────────────────────────────────────────
function injectProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.prepend(bar);
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  injectProgressBar();
  setupCursor();
  setupHeroCanvas();
  setupScrollSpy();
  setupTypewriter();

  setupCopyEmail();

  try {
    const [interests, projects, publications, now] = await Promise.all([
      fetchJSON(DATA.interests),
      fetchJSON(DATA.projects),
      fetchJSON(DATA.publications),
      fetch(DATA.now).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);
    renderInterests(interests);
    renderProjects(projects);
    renderPublications(publications);
    renderNow(now);
    setupRevealOnScroll();
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
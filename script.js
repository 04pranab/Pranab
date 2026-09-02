/* -----------------------------------------------------------------
   Om Pranab Mohanty -- portfolio script
   Data-driven: all content is fetched from data/*.json
   ----------------------------------------------------------------- */

const DATA = {
  interests:    'data/interests.json',
  projects:     'data/projects.json',
  publications: 'data/publications.json',
  experience:   'data/experience.json',
  tools:        'data/tools.json',
  now:          'data/now.json',
  blog:         'data/blog.json',
};

let blogPosts = [];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}`);
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  }
  return data;
}

/* -- Render: research interests ------------------------------- */
function renderInterests(items) {
  const el = $('#interests-list');
  if (!el) return;
  el.innerHTML = items.map(item => `
    <div class="row">
      <div class="row-title">${esc(item.title)}</div>
      <div class="row-desc">${esc(item.description)}</div>
    </div>
  `).join('');
}

/* -- Render: projects ------------------------------------------- */
function renderProjects(items) {
  const el = $('#projects-list');
  if (!el) return;
  el.innerHTML = items.map(p => `
    <div class="row-item">
      <span class="row-lang">${esc(p.language)}</span>
      <div class="row-body">
        <h4>${esc(p.name)}</h4>
        <p>${esc(p.description)}</p>
      </div>
      <a class="row-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">view &#8599;</a>
    </div>
  `).join('');
}

/* -- Render: experience timeline --------------------------------- */
function renderExperience(items) {
  const el = $('#timeline-list');
  if (!el) return;
  el.innerHTML = items.map(t => `
    <div class="tl-row">
      <div class="tl-date">${esc(t.date)}</div>
      <div>
        <div class="tl-org">${esc(t.org)}</div>
        <p class="tl-desc">${esc(t.description)}</p>
      </div>
    </div>
  `).join('');
}

/* -- Render: publications ----------------------------------------- */
function renderPublications(items) {
  const el = $('#pubs-list');
  if (!el) return;
  el.innerHTML = items.map(pub => `
    <div class="row-item">
      <span class="pub-status">${esc(pub.status)}</span>
      <div class="row-body">
        <h4>${esc(pub.title)}</h4>
        <p>${esc(pub.note)}</p>
      </div>
    </div>
  `).join('');
}

/* -- Render: tools -------------------------------------------------- */
function renderTools(items) {
  const el = $('#tools-grid');
  if (!el) return;
  el.innerHTML = items.map(t => `
    <div class="tool-card">
      <div class="tool-cat">${esc(t.category)}</div>
      <div class="tool-items">${t.items.map(esc).join('<br>')}</div>
    </div>
  `).join('');
}

/* -- Render: now snapshot (home tiles) ------------------------------- */
function renderNow(data) {
  if (!data) return;
  const building = data.building && data.building[0];
  const reading = data.reading && data.reading[0];
  if (building) {
    $('#tile-building-title').textContent = building.title;
    $('#tile-building-note').textContent = building.note || '';
  }
  if (reading) {
    $('#tile-reading-title').textContent = reading.title;
    $('#tile-reading-note').textContent = reading.note || '';
  }
}

/* -- Render: blog list ------------------------------------------------ */
function renderBlogList(items) {
  const el = $('#blog-list');
  if (!el) return;
  el.innerHTML = items.map(p => `
    <a class="blog-row" href="#/blog/${esc(p.slug)}">
      <div class="blog-row-meta">
        <span>${esc(p.date)}</span>
        <span class="blog-post-dot">&middot;</span>
        <span>${esc(p.readTime)}</span>
      </div>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.excerpt)}</p>
      <span class="row-link">read &#8599;</span>
    </a>
  `).join('');
}

/* -- Render: single blog post ----------------------------------------- */
function renderBlogPost(post) {
  $('#blogpost-date').textContent = post.date;
  $('#blogpost-readtime').textContent = post.readTime;
  $('#blogpost-title').textContent = post.title;
  $('#blogpost-body').innerHTML = post.body.map(p => `<p>${esc(p)}</p>`).join('');
}

/* -- View routing ------------------------------------------------------ */
const views = $$('.view');
const navIcons = $$('.nav-icon');

function showView(name) {
  views.forEach(v => v.hidden = v.dataset.view !== name);
  navIcons.forEach(b => {
    if (b.dataset.view === name) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  const active = document.getElementById(`view-${name}`);
  if (active) {
    active.classList.remove('view');
    void active.offsetWidth;
    active.classList.add('view');
  }
  window.scrollTo({ top: 0 });
  if (location.hash.slice(2) !== name) {
    history.replaceState(null, '', `#/${name}`);
  }
}

function routeFromHash() {
  const raw = location.hash.replace('#/', '').trim();
  const [base, slug] = raw.split('/');
  if (base === 'blog' && slug) {
    showBlogPost(slug);
    return;
  }
  const name = base || 'home';
  const valid = navIcons.some(b => b.dataset.view === name);
  showView(valid ? name : 'home');
}

function showBlogPost(slug) {
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) { showView('blog'); return; }
  views.forEach(v => v.hidden = v.dataset.view !== 'blogpost');
  navIcons.forEach(b => {
    if (b.dataset.view === 'blog') b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  renderBlogPost(post);
  const active = document.getElementById('view-blogpost');
  if (active) {
    active.classList.remove('view');
    void active.offsetWidth;
    active.classList.add('view');
  }
  window.scrollTo({ top: 0 });
  if (location.hash !== `#/blog/${slug}`) {
    history.replaceState(null, '', `#/blog/${slug}`);
  }
}

navIcons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
$$('[data-goto]').forEach(el => el.addEventListener('click', () => showView(el.dataset.goto)));
window.addEventListener('hashchange', routeFromHash);

/* -- Stat count-up (single load moment) --------------------------------- */
function animateStats() {
  const nums = $$('.stat-num');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  nums.forEach(el => {
    const target = parseFloat(el.dataset.count);
    if (prefersReduced || !target) { el.textContent = target; return; }
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(target % 1 !== 0 ? 1 : 0);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* -- Contact form ---------------------------------------------------------- */
function setupContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const note = $('#form-note');
    const name = $('#f-name').value.trim();
    const email = $('#f-email').value.trim();
    const message = $('#f-msg').value.trim();
    if (!name || !email || !message) {
      note.textContent = 'Fill in your name, email and message first.';
      note.style.color = 'var(--amber)';
      return;
    }
    const topic = $('#f-topic').value;
    const subject = encodeURIComponent(`[Portfolio] ${topic} -- from ${name}`);
    const body = encodeURIComponent(`${message}\n\n-- ${name} (${email})`);
    window.location.href = `mailto:ompranabmohanty@gmail.com?subject=${subject}&body=${body}`;
    note.textContent = 'Opening your email client...';
    note.style.color = 'var(--teal)';
  });
}

/* -- Init -------------------------------------------------------------------- */
async function init() {
  setupContactForm();
  routeFromHash();
  animateStats();

  try {
    const [interests, projects, publications, experience, tools, now, blog] = await Promise.all([
      fetchJSON(DATA.interests),
      fetchJSON(DATA.projects),
      fetchJSON(DATA.publications),
      fetchJSON(DATA.experience),
      fetchJSON(DATA.tools),
      fetch(DATA.now).then(r => r.ok ? r.json() : null).catch(() => null),
      fetchJSON(DATA.blog),
    ]);
    renderInterests(interests);
    renderProjects(projects);
    renderPublications(publications);
    renderExperience(experience);
    renderTools(tools);
    renderNow(now);
    blogPosts = blog;
    renderBlogList(blogPosts);
    routeFromHash();
  } catch (err) {
    console.error('Failed to load site data:', err);
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
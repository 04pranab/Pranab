/* -----------------------------------------------------------------
   Om Pranab Mohanty -- portfolio script
   Data-driven: all content is fetched from data/*.json
   ----------------------------------------------------------------- */

const DATA = {
  interests: 'data/interests.json',
  projects: 'data/projects.json',
  publications: 'data/publications.json',
  experience: 'data/experience.json',
  tools: 'data/tools.json',
  now: 'data/now.json',
  blog: 'data/blog.json',
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
    <div class="tl-row${t.skills ? ' expandable' : ''}">
      <div class="tl-date">${esc(t.date)}</div>
      <div>
        <div class="tl-org">
          ${t.skills ? '<span class="tl-expand-btn">⮺</span>' : ''}
          ${esc(t.org)}
        </div>
        <p class="tl-desc">${esc(t.description)}</p>
        ${t.skills ? `
          <div class="tl-details">
            <div class="tl-details-text">
              <strong>Skills:</strong> ${esc(t.skills.join(', '))}<br>
              <strong>Outcome:</strong> ${esc(t.outcomes)}
            </div>
          </div>
        ` : ''}
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

      ${p.tags && p.tags.length ? `
        <div class="blog-tags">
          ${p.tags.map(tag => `
            <span class="blog-tag">${esc(tag)}</span>
          `).join('')}
        </div>
      ` : ''}

      <span class="row-link">read &#8599;</span>

    </a>
  `).join('');
}

/* -- Generate Table of Contents ----------------------------------- */
function generateTableOfContents(container) {
  if (!container) return null;

  const headings = Array.from(
    container.querySelectorAll('h2, h3')
  );

  if (headings.length === 0) {
    return null;
  }

  const nav = document.createElement('nav');
  nav.className = 'blog-toc';
  nav.setAttribute('aria-label', 'Table of contents');

  const title = document.createElement('div');
  title.className = 'blog-toc-title';
  title.textContent = 'Contents';

  nav.appendChild(title);

  const list = document.createElement('ol');
  list.className = 'blog-toc-list';

  const usedIds = new Set();

  headings.forEach(heading => {
    const baseId =
      heading.id ||
      slugifyHeading(heading.textContent);

    let id = baseId;
    let counter = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${counter++}`;
    }

    usedIds.add(id);
    heading.id = id;

    const item = document.createElement('li');

    item.className =
      heading.tagName.toLowerCase() === 'h3'
        ? 'blog-toc-item blog-toc-subitem'
        : 'blog-toc-item';

    const link = document.createElement('a');

    link.href = `#${id}`;
    link.textContent = heading.textContent.trim();

    link.addEventListener('click', event => {
      event.preventDefault();

      heading.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });

    item.appendChild(link);
    list.appendChild(item);
  });

  nav.appendChild(list);

  return nav;
}
/* -- Expandable Timeline Items ------------------------------------ */
function setupExpandableTimeline() {
  $$('.tl-row.expandable').forEach(row => {
    const details = row.querySelector('.tl-details');
    if (!details) return;

    row.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      this.classList.toggle('expanded');
    });
  });
}

/* -- Expandable Project Cards ------------------------------------- */
function setupExpandableProjects() {
  $$('.row-item').forEach(card => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      this.classList.toggle('expanded');
    });
  });
}

/* -- Expandable Code Snippets ------------------------------------- */
function setupExpandableCode() {
  $$('.code-header').forEach(header => {
    header.addEventListener('click', function () {
      this.closest('.code-snippet').classList.toggle('expanded');
    });
  });
}

/* -- Blog Tag Filtering -------------------------------------------- */

function setupBlogSearch() {
  const searchInput = $('#blog-search');
  const resetBtn = $('#blog-filter-reset');
  const tagsEl = $('#blog-filter-tags');

  if (!searchInput || !tagsEl) return;

  const allTags = [...new Set(
    blogPosts.flatMap(post => post.tags || [])
  )].sort();

  tagsEl.innerHTML = allTags.map(tag => `
    <button
      class="filter-tag"
      data-tag="${esc(tag)}"
      title="Filter by ${esc(tag)}"
    >
      ${esc(tag)}
    </button>
  `).join('');

  $$('.filter-tag', tagsEl).forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      filterBlogPosts();
    });
  });

  searchInput.addEventListener('input', filterBlogPosts);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resetBlogFilters();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetBlogFilters);
  }

  filterBlogPosts();
}


function filterBlogPosts() {
  const searchTerm = $('#blog-search')?.value.toLowerCase().trim() || '';

  const activeTags = Array.from(
    $$('#blog-filter-tags .filter-tag.active')
  ).map(tag => tag.dataset.tag);

  const resetBtn = $('#blog-filter-reset');
  const emptyEl = $('#blog-empty');

  const filtered = blogPosts.filter(post => {

    const searchable = [
      post.title,
      post.excerpt,
      ...(post.tags || [])
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      !searchTerm || searchable.includes(searchTerm);

    const matchesTags =
      activeTags.length === 0 ||
      activeTags.some(tag => (post.tags || []).includes(tag));

    return matchesSearch && matchesTags;
  });

  renderBlogList(filtered);

  if (emptyEl) {
    emptyEl.style.display =
      filtered.length === 0 ? 'block' : 'none';
  }

  if (resetBtn) {
    const hasFilters =
      searchTerm || activeTags.length > 0;

    resetBtn.style.display =
      hasFilters ? 'inline-block' : 'none';
  }
}


function resetBlogFilters() {
  const searchInput = $('#blog-search');

  if (searchInput) {
    searchInput.value = '';
  }

  $$('#blog-filter-tags .filter-tag').forEach(tag => {
    tag.classList.remove('active');
  });

  filterBlogPosts();
}


function slugifyHeading(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
/* -- Render: single blog post ----------------------------------------- */
function renderBlogPost(post) {
  $('#blogpost-date').textContent = post.date;
  $('#blogpost-readtime').textContent = post.readTime;
  $('#blogpost-title').textContent = post.title;

  /*
   * Render structured blog content
   *
   * Supported blocks:
   *   paragraph
   *   heading
   *   quote
   *   list
   *   code
   */
  const bodyHTML = (post.body || []).map(block => {
    // Backward compatibility:
    // old posts can still contain plain strings
    if (typeof block === 'string') {
      return `<p>${esc(block)}</p>`;
    }

    if (!block || !block.type) return '';

    switch (block.type) {

      case 'paragraph':
        return `<p>${esc(block.text || '')}</p>`;

      case 'heading': {
        const level = Math.min(
          Math.max(parseInt(block.level, 10) || 2, 2),
          4
        );

        const id = slugifyHeading(block.text || '');

        return `
          <h${level} id="${esc(id)}" class="blog-section-heading">
            ${esc(block.text || '')}
          </h${level}>
        `;
      }

      case 'quote':
        return `
          <blockquote class="blog-quote">
            ${esc(block.text || '')}
          </blockquote>
        `;

      case 'list': {
        const items = Array.isArray(block.items) ? block.items : [];

        return `
          <ul class="blog-list">
            ${items.map(item => `<li>${esc(item)}</li>`).join('')}
          </ul>
        `;
      }

      case 'code':
        return `
          <div class="code-snippet">
            <div class="code-header">
              <span>${esc(block.language || 'code')}</span>
              <span>expand</span>
            </div>
            <pre><code>${esc(block.code || '')}</code></pre>
          </div>
        `;

      default:
        return '';
    }
  }).join('');

  const bodyEl = $('#blogpost-body');

  if (bodyEl) {
    bodyEl.innerHTML = bodyHTML;
  }

  // Generate table of contents from rendered headings
  const tocContainer = $('#blog-toc-container');

  if (tocContainer) {
    tocContainer.innerHTML = '';

    const toc = generateTableOfContents(bodyEl);

    if (toc) {
      tocContainer.appendChild(toc);
    }
  }

  // Setup related features
  setupShareButtons(post.title, post.slug);
  initReadingProgress();
  renderRelatedPosts(post, blogPosts);
  setupExpandableCode();
}

/* -- Toast Notifications ------------------------------------------ */
function showToast(message, type = 'success') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('remove');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* -- Copy to Clipboard ------------------------------------------ */
function setupCopyLinks() {
  $$('.copy-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      const copyText = link.getAttribute('data-copy');
      if (!copyText) return;

      try {
        await navigator.clipboard.writeText(copyText);
        showToast(`Copied: ${copyText}`, 'success');

        link.classList.add('copied');
        setTimeout(() => link.classList.remove('copied'), 1500);
      } catch (err) {
        showToast('Failed to copy', 'error');
      }
    });
  });
}

/* -- Back to Top Button ------------------------------------------ */
function setupBackToTop() {
  const btn = $('#back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -- Projects Search & Filter ----------------------------------- */
let allProjects = [];

function extractLanguages(projects) {
  const langs = new Set();
  projects.forEach(p => {
    if (p.language) {
      p.language.split('/').forEach(lang => {
        langs.add(lang.trim());
      });
    }
  });
  return Array.from(langs).sort();
}

function renderProjectsWithFilter(items) {
  allProjects = items;
  const languages = extractLanguages(items);

  const el = $('#projects-list');
  if (!el) return;
  el.innerHTML = items.map(p => `
    <div class="row-item" data-project-id="${esc(p.id)}" data-languages="${esc(p.language || '')}">
      <span class="row-lang">${esc(p.language)}</span>
      <div class="row-body">
        <h4>${esc(p.name)}<span class="row-expand-indicator">⮺</span></h4>
        <p>${esc(p.description)}</p>
        <div class="row-details">
          <div class="row-details-item">
            <span class="row-details-label">Status:</span> ${esc(p.status || '')}
          </div>
          <div class="row-details-item">
            <span class="row-details-label">Focus:</span> ${esc(p.focus || '')}
          </div>
        </div>
      </div>
      <a class="row-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">view &#8599;</a>
    </div>
  `).join('');

  const tagsEl = $('#filter-tags');
  if (tagsEl) {
    tagsEl.innerHTML = languages.map(lang => `
      <button class="filter-tag" data-lang="${esc(lang)}" title="Filter by ${esc(lang)}">
        ${esc(lang)}
      </button>
    `).join('');

    $$('.filter-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        filterProjects();
      });
    });
  }
}

function filterProjects() {
  const searchTerm = $('#project-search').value.toLowerCase();
  const activeTags = Array.from($$('.filter-tag.active')).map(t => t.dataset.lang);
  const resetBtn = $('#filter-reset');

  let visibleCount = 0;

  $$('.row-item').forEach(item => {
    const name = item.querySelector('h4')?.textContent.toLowerCase() || '';
    const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
    const langs = item.dataset.languages.toLowerCase();

    const matchesSearch = !searchTerm || name.includes(searchTerm) || desc.includes(searchTerm);
    const matchesLang = activeTags.length === 0 || activeTags.some(lang => langs.includes(lang.toLowerCase()));

    const isVisible = matchesSearch && matchesLang;
    item.classList.toggle('hidden', !isVisible);
    if (isVisible) visibleCount++;
  });

  const emptyEl = $('#projects-empty');
  if (emptyEl) {
    emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  if (resetBtn) {
    const hasActive = searchTerm || activeTags.length > 0;
    resetBtn.style.display = hasActive ? 'inline-block' : 'none';
  }
}

function resetFilters() {
  $('#project-search').value = '';
  $$('.filter-tag').forEach(t => t.classList.remove('active'));
  filterProjects();
}

function setupProjectsFilter() {
  const searchInput = $('#project-search');
  const resetBtn = $('#filter-reset');

  if (searchInput) {
    searchInput.addEventListener('input', filterProjects);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        resetFilters();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }
}

/* -- Reading Progress ------------------------------------------ */
function initReadingProgress() {
  const progressBar = $('#reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
}

/* -- Social Share Buttons ------------------------------------------ */
function setupShareButtons(title, postSlug) {
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const twitterBtn = $('#share-twitter');
  if (twitterBtn) {
    twitterBtn.onclick = () => {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        '_blank'
      );
    };
  }

  const linkedinBtn = $('#share-linkedin');
  if (linkedinBtn) {
    linkedinBtn.onclick = () => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        '_blank'
      );
    };
  }

  const emailBtn = $('#share-email');
  if (emailBtn) {
    emailBtn.onclick = () => {
      window.location.href =
        `mailto:?subject=${encodedTitle}&body=Check this out: ${url}`;
    };
  }

  const copyBtn = $('#share-copy');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied!', 'success');
      } catch (err) {
        showToast('Failed to copy', 'error');
      }
    };
  }
}

/* -- Related Posts -------------------------------------------------- */
function findRelatedPosts(currentPost, allPosts, limit = 2) {
  return allPosts
    .filter(p => p.slug !== currentPost.slug)
    .map(post => ({
      post,
      score: calculateRelevance(currentPost, post)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

function calculateRelevance(post1, post2) {
  let score = 0;
  const words1 = new Set(post1.title.toLowerCase().split(/\s+/));
  const words2 = new Set(post2.title.toLowerCase().split(/\s+/));

  words1.forEach(word => {
    if (words2.has(word) && word.length > 3) score += 2;
  });

  return score;
}

function renderRelatedPosts(currentPost, allPosts) {
  const related = findRelatedPosts(currentPost, allPosts);
  if (!related.length) return;

  const html = `
    <div class="related-posts">
      <h4>Related reading</h4>
      <div class="related-list">
        ${related.map(p => `
          <a href="#/blog/${esc(p.slug)}" class="related-item">
            <span>${esc(p.title)}</span>
            <span class="arrow">→</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  const container = $('#related-posts-container');
  if (container) {
    container.innerHTML = html;
  }
}

/* -- Keyboard Shortcuts ------------------------------------------ */
const SHORTCUTS = {
  '1': 'home',
  '2': 'projects',
  '3': 'work',
  '4': 'tools',
  '5': 'blog',
  '6': 'contact'
};

function showShortcutsHelp() {
  const help = document.createElement('div');
  help.className = 'shortcuts-help';
  help.innerHTML = `
    <div class="shortcuts-modal">
      <button class="shortcuts-close" onclick="this.closest('.shortcuts-help').remove()">✕</button>
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li><span>1</span><kbd>Home</kbd></li>
        <li><span>2</span><kbd>Projects</kbd></li>
        <li><span>3</span><kbd>Experience</kbd></li>
        <li><span>4</span><kbd>Tools</kbd></li>
        <li><span>5</span><kbd>Blog</kbd></li>
        <li><span>6</span><kbd>Contact</kbd></li>
        <li><span>?</span><kbd>Show this help</kbd></li>
      </ul>
    </div>
  `;
  document.body.appendChild(help);
}

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === '?') {
    showShortcutsHelp();
    return;
  }

  const view = SHORTCUTS[e.key];
  if (view) {
    e.preventDefault();
    goToView(view);
  }
});

/* -- View routing ------------------------------------------------------ */
/* -- View routing ------------------------------------------------------ */
const views = $$('.view');
const navIcons = $$('.nav-icon');

function showView(name) {
  views.forEach(v => {
    v.hidden = v.dataset.view !== name;
  });

  navIcons.forEach(b => {
    if (b.dataset.view === name) {
      b.setAttribute('aria-current', 'page');
    } else {
      b.removeAttribute('aria-current');
    }
  });

  const active = document.getElementById(`view-${name}`);

  if (active) {
    active.classList.remove('view');
    void active.offsetWidth;
    active.classList.add('view');
  }

  window.scrollTo({ top: 0 });

  // Only normal views should rewrite the URL.
  // Blog posts manage their own #/blog/<slug> URL.
  if (
    name !== 'blogpost' &&
    location.hash.slice(2) !== name
  ) {
    history.replaceState(null, '', `#/${name}`);
  }
}


function routeFromHash() {
  const raw = location.hash.replace(/^#\//, '').trim();

  // No hash -> home
  if (!raw) {
    showView('home');
    return;
  }

  const parts = raw.split('/');
  const base = parts[0];
  const slug = parts.slice(1).join('/');

  // Blog post route
  if (base === 'blog' && slug) {
    showBlogPost(slug);
    return;
  }

  // Normal page route
  const valid = navIcons.some(
    b => b.dataset.view === base
  );

  showView(valid ? base : 'home');
}


function showBlogPost(slug) {
  console.log('[BLOG ROUTE] Requested slug:', slug);
  console.log('[BLOG ROUTE] Loaded posts:', blogPosts);

  // Blog data must already be loaded.
  if (!Array.isArray(blogPosts) || blogPosts.length === 0) {
    console.error(
      '[BLOG ROUTE] blogPosts is empty. Blog data was not loaded.'
    );

    return;
  }

  const post = blogPosts.find(
    p => p && p.slug === slug
  );

  if (!post) {
    console.error(
      '[BLOG ROUTE] Post not found:',
      slug,
      'Available slugs:',
      blogPosts.map(p => p.slug)
    );

    showView('blog');
    return;
  }

  console.log('[BLOG ROUTE] Opening:', post.title);

  // Show ONLY the blog-post view
  views.forEach(v => {
    v.hidden = v.dataset.view !== 'blogpost';
  });

  // Keep Blog navigation active
  navIcons.forEach(b => {
    if (b.dataset.view === 'blog') {
      b.setAttribute('aria-current', 'page');
    } else {
      b.removeAttribute('aria-current');
    }
  });

  // Render post
  renderBlogPost(post);

  // Re-trigger entrance animation
  const active = document.getElementById('view-blogpost');

  if (active) {
    active.classList.remove('view');
    void active.offsetWidth;
    active.classList.add('view');
  }

  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });

  // Preserve the exact deep-link URL
  const targetHash = `#/blog/${slug}`;

  if (location.hash !== targetHash) {
    history.replaceState(
      null,
      '',
      targetHash
    );
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
    renderProjectsWithFilter(projects);
    renderPublications(publications);
    renderExperience(experience);
    renderTools(tools);
    renderNow(now);

    // Blog data is now available
    blogPosts = blog;
    renderBlogList(blogPosts);

    // Initialize features
    setupBackToTop();
    setupCopyLinks();
    setupProjectsFilter();
    setupExpandableTimeline();
    setupExpandableProjects();
    setupBlogSearch();

    // IMPORTANT:
    // Route AFTER all data has loaded.
    routeFromHash();

  } catch (err) {
    console.error('Failed to load site data:', err);
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
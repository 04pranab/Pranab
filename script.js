

// GitHub API configuration
const GITHUB_USERNAME = '04pranab';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Project data - Hardcoded backup data
const HARDCODED_PROJECTS = [
    {
        name: 'riscv-emulator',
        description: 'A RISC-V instruction set emulator built from scratch. Implements core RISC-V ISA with proper memory management and instruction decoding.',
        language: 'C',
        url: 'https://github.com/04pranab/riscv-emulator'
    },
    {
        name: 'os-bootloader',
        description: 'Custom OS bootloader targeting x86-64 architecture. Implements real mode to protected mode transition with GDT setup.',
        language: 'Assembly',
        url: 'https://github.com/04pranab/os-bootloader'
    },
    {
        name: 'cache-simulator',
        description: 'Multi-level cache hierarchy simulator. Analyzes cache hit/miss patterns and performance metrics for different memory access patterns.',
        language: 'Python',
        url: 'https://github.com/04pranab/cache-simulator'
    }
];

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

const projectsContainer = document.getElementById('projects-container');

// ============================================
// FETCH GITHUB PROJECTS
// ============================================

/**
 * Fetches public repositories from GitHub API
 * Falls back to hardcoded projects if API fails
 */
async function fetchGitHubProjects() {
    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('GitHub API request failed');
        }

        const repos = await response.json();

        // Filter and sort repositories
        // Exclude forks and archived repos, sort by updated date
        const filteredRepos = repos
            .filter(repo => !repo.fork && !repo.archived)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6); // Get top 6 most recently updated

        return filteredRepos.map(repo => ({
            name: repo.name,
            description: repo.description || 'No description provided.',
            language: repo.language || 'Unknown',
            url: repo.html_url,
            stars: repo.stargazers_count
        }));
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        console.log('Using hardcoded project data');
        return HARDCODED_PROJECTS;
    }
}

// ============================================
// RENDER PROJECT CARDS
// ============================================

/**
 * Creates and renders project cards in the projects grid
 * @param {Array} projects - Array of project objects
 */
function renderProjects(projects) {
    if (!projectsContainer) return;

    projectsContainer.innerHTML = ''; // Clear existing content

    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project);
        projectsContainer.appendChild(projectCard);

        // Stagger animation
        setTimeout(() => {
            projectCard.classList.add('fade-in');
        }, index * 100);
    });
}

/**
 * Creates a single project card element
 * @param {Object} project - Project object with name, description, language, url
 * @returns {HTMLElement} Project card element
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Sanitize and format project name
    const projectName = project.name
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Limit description length
    const description = project.description.length > 150
        ? project.description.substring(0, 150) + '...'
        : project.description;

    card.innerHTML = `
        <h3>${projectName}</h3>
        <p class="project-description">${escapeHtml(description)}</p>
        <div class="project-meta">
            <span class="project-language">${project.language || 'Unknown'}</span>
            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">
                View on GitHub →
            </a>
        </div>
    `;

    return card;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Smooth scroll to section with keyboard support
 */
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active nav state
                navLinks.forEach(l => l.style.color = '');
                link.style.color = 'var(--accent)';
            }
        });

        // Add keyboard support (Enter key)
        link.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                link.click();
            }
        });
    });
}

/**
 * Highlights active section in navigation as user scrolls
 */
function setupScrollSpyNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.style.color = 'var(--accent)';
                    } else {
                        link.style.color = '';
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/**
 * Fade in cards as they come into view
 */
function setupIntersectionObserver() {
    const cards = document.querySelectorAll('.project-card, .interest-card, .wip-item, .contact-item');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Add keyboard navigation support
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Skip search if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Quick navigation with keyboard shortcuts
        const shortcuts = {
            'h': '#hero',
            'a': '#about',
            'r': '#research-interests',
            'p': '#projects',
            'c': '#contact'
        };

        if (shortcuts[e.key]) {
            const section = document.querySelector(shortcuts[e.key]);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

/**
 * Enhance accessibility features
 */
function setupAccessibility() {
    // Add skip to main content link
    const body = document.body;
    const skipLink = document.createElement('a');
    skipLink.href = 'main';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--accent);
        color: var(--bg-primary);
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    body.insertBefore(skipLink, body.firstChild);

    // Improve focus indicators
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        body.classList.remove('keyboard-nav');
    });
}

/**
 * Add smooth scroll to top button
 */
function setupScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--accent);
        color: var(--bg-primary);
        border: none;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 99;
    `;

    document.body.appendChild(scrollButton);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.visibility = 'visible';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.visibility = 'hidden';
        }
    });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Track page view in console (analytics-free)
 */
function trackPageView() {
    const timestamp = new Date().toLocaleString();
    console.log(`%c📄 Page loaded at ${timestamp}`, 'color: #60a5fa; font-weight: bold;');
    console.log('%cOm Pranab Mohanty\'s Academic Portfolio', 'color: #60a5fa; font-size: 16px; font-weight: bold;');
    console.log('%cBuilt with semantic HTML, vanilla CSS, and JavaScript', 'color: #a0a0a0; font-style: italic;');
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all features on DOM content loaded
 */
async function initialize() {
    console.log('[v0] Initializing portfolio...');

    try {
        // Fetch and render projects
        const projects = await fetchGitHubProjects();
        renderProjects(projects);
        console.log('[v0] Projects rendered successfully');
    } catch (error) {
        console.error('[v0] Error during initialization:', error);
    }

    // Setup interactions
    setupSmoothScrolling();
    setupScrollSpyNavigation();
    setupIntersectionObserver();
    setupKeyboardNavigation();
    setupAccessibility();
    setupScrollToTopButton();
    trackPageView();

    console.log('[v0] Portfolio initialization complete');
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already loaded (if script is loaded async)
    initialize();
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

/**
 * Lazy load images if needed in the future
 */
if ('IntersectionObserver' in window) {
    console.log('[v0] IntersectionObserver API supported for lazy loading');
}

/**
 * Check for service worker support (for future PWA features)
 */
if ('serviceWorker' in navigator) {
    console.log('[v0] Service Worker API supported');
}

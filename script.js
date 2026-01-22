/**
 * Om Pranab Mohanty - Personal Academic Website
 * script.js - Main JavaScript functionality
 * 
 * Features:
 * - Fetches public GitHub repositories
 * - Smooth scroll navigation
 * - Responsive interactions
 * - Accessibility enhancements
 */

// ============================================
// CONFIGURATION
// ============================================

const GITHUB_USERNAME = '04pranab';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Data file paths
const DATA_FILES = {
    interests: 'data/interests.json',
    projects: 'data/projects.json',
    publications: 'data/publications.json'
};

// Hardcoded project data
const HARDCODED_PROJECTS = [
    {
        name: 'Project One',
        description: 'Description of Project One.',
        language: 'JavaScript',
        url: 'https://github.com/04pranab/project-one',
        stars: 10
    },
    {
        name: 'Project Two',
        description: 'Description of Project Two.',
        language: 'Python',
        url: 'https://github.com/04pranab/project-two',
        stars: 5
    }
];

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

const projectsContainer = document.getElementById('projects-container');
const interestsContainer = document.getElementById('interests-container');
const publicationsContainer = document.getElementById('publications-container');

// ============================================
// FETCH JSON DATA
// ============================================

/**
 * Fetch JSON data from file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Array>} Parsed JSON data
 */
async function fetchJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}`);
        }
        const data = await response.json();
        // Sort by rank if rank field exists
        if (data.length > 0 && 'rank' in data[0]) {
            return data.sort((a, b) => a.rank - b.rank);
        }
        return data;
    } catch (error) {
        console.error(`[v0] Error loading ${filePath}:`, error);
        return [];
    }
}

// Fetch GitHub projects
async function fetchGitHubProjects() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch GitHub projects for ${GITHUB_USERNAME}`);
        }
        const data = await response.json();
        // Sort by stars in descending order
        return data.sort((a, b) => b.stars - a.stars);
    } catch (error) {
        console.error(`[v0] Error fetching GitHub projects:`, error);
        return HARDCODED_PROJECTS;
    }
}

// ============================================
// RENDER INTERESTS
// ============================================

/**
 * Renders interest cards from JSON data
 * @param {Array} interests - Array of interest objects
 */
function renderInterests(interests) {
    if (!interestsContainer) return;
    
    interestsContainer.innerHTML = '';
    
    interests.forEach((interest, index) => {
        const card = createInterestCard(interest);
        interestsContainer.appendChild(card);
        
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 50);
    });
}

/**
 * Creates a single interest card element
 * @param {Object} interest - Interest object
 * @returns {HTMLElement} Interest card element
 */
function createInterestCard(interest) {
    const card = document.createElement('div');
    card.className = 'interest-card';
    
    card.innerHTML = `
        <h3>${escapeHtml(interest.title)}</h3>
        <p class="badge">${interest.status}</p>
        <p>${escapeHtml(interest.description)}</p>
    `;
    
    return card;
}

// ============================================
// RENDER PROJECTS
// ============================================

/**
 * Renders project cards from JSON data
 * @param {Array} projects - Array of project objects
 */
function renderProjects(projects) {
    if (!projectsContainer) return;

    projectsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project);
        projectsContainer.appendChild(projectCard);

        setTimeout(() => {
            projectCard.classList.add('fade-in');
        }, index * 50);
    });
}

/**
 * Creates a single project card element
 * @param {Object} project - Project object
 * @returns {HTMLElement} Project card element
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    const projectName = project.name
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const description = project.description.length > 140
        ? project.description.substring(0, 140) + '...'
        : project.description;

    card.innerHTML = `
        <h3>${escapeHtml(projectName)}</h3>
        <p class="project-description">${escapeHtml(description)}</p>
        <div class="project-meta">
            <span class="project-language">${escapeHtml(project.language || 'Unknown')}</span>
            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">
                View on GitHub →
            </a>
        </div>
    `;

    return card;
}

// ============================================
// RENDER PUBLICATIONS
// ============================================

/**
 * Renders publication cards from JSON data
 * @param {Array} publications - Array of publication objects
 */
function renderPublications(publications) {
    if (!publicationsContainer) return;
    
    publicationsContainer.innerHTML = '';
    
    publications.forEach((pub, index) => {
        const card = createPublicationCard(pub);
        publicationsContainer.appendChild(card);
        
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 50);
    });
}

/**
 * Creates a single publication card element
 * @param {Object} pub - Publication object
 * @returns {HTMLElement} Publication card element
 */
function createPublicationCard(pub) {
    const card = document.createElement('div');
    card.className = 'publication-card';
    
    let html = `
        <h3>${escapeHtml(pub.title)}</h3>
        <p class="badge">${pub.status}</p>
    `;
    
    if (pub.note) {
        html += `<p class="publication-note"><em>${escapeHtml(pub.note)}</em></p>`;
    }
    
    if (pub.authors) {
        html += `<p class="publication-authors">${escapeHtml(pub.authors)}</p>`;
    }
    
    if (pub.journal) {
        html += `<p class="publication-journal">${escapeHtml(pub.journal)}</p>`;
    }
    
    card.innerHTML = html;
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
        // Load JSON data
        const [interests, projects, publications] = await Promise.all([
            fetchJSON(DATA_FILES.interests),
            fetchJSON(DATA_FILES.projects),
            fetchJSON(DATA_FILES.publications)
        ]);
        
        // Render all sections
        renderInterests(interests);
        renderProjects(projects);
        renderPublications(publications);
        
        console.log('[v0] All sections rendered successfully');
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

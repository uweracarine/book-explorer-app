/**
 * app.js
 * ──────────────────────────────────────────────────────────────────────────
 * Main entry point for the homepage (index.html).
 * Connects all modules: fetchBooks, favorites, ui, storage.
 * Handles: search, initial load, dark-mode toggle, mobile menu.
 */

import { fetchBooks }                          from './fetchBooks.js';
import { renderLoading, renderEmpty,
         renderError, createBookCard, showToast } from './ui.js';

// ── DOM refs ──────────────────────────────────────────────────────────────
const grid        = document.getElementById('book-grid');
const searchInput = document.getElementById('search-input');
const searchBtn   = document.getElementById('search-btn');
const resultCount = document.getElementById('result-count');
const sectionTitle= document.getElementById('section-title');
const menuBtn     = document.getElementById('menu-btn');
const mobileMenu  = document.getElementById('mobile-menu');
const themeBtn    = document.getElementById('theme-btn');

// ── Theme (dark / light) ──────────────────────────────────────────────────

const THEME_KEY = 'be_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

// Load saved theme or default to light
applyTheme(localStorage.getItem(THEME_KEY) || 'light');

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ── Mobile menu ───────────────────────────────────────────────────────────

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── Book rendering ────────────────────────────────────────────────────────

/**
 * Fetch and display books for a given query.
 * @param {string} query
 */
async function displayBooks(query) {
  // Update section heading
  sectionTitle.textContent = query
    ? `Results for "${query}"`
    : '🔥 Trending Books';
  resultCount.textContent = '';

  renderLoading(grid);

  try {
    const books = await fetchBooks(query || 'javascript programming', 12);

    if (books.length === 0) {
      renderEmpty(
        grid,
        '🔍',
        'No results found',
        `We couldn't find any books matching "${query}". Try a different search term.`
      );
      return;
    }

    grid.innerHTML = '';
    books.forEach(book => grid.appendChild(createBookCard(book)));
    resultCount.textContent = `${books.length} book${books.length !== 1 ? 's' : ''} found`;

  } catch (err) {
    console.error('[app] fetchBooks failed:', err);
    renderError(
      grid,
      'Could not load books. Please check your internet connection and try again.'
    );
  }
}

// ── Search ────────────────────────────────────────────────────────────────

function handleSearch() {
  const query = searchInput.value.trim();
  displayBooks(query);
}

searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSearch();
});

// ── Initial load ──────────────────────────────────────────────────────────
displayBooks('');

/**
 * ui.js
 * ──────────────────────────────────────────────────────────────────────────
 * Reusable UI rendering functions.
 * Handles: book cards, loading state, empty state, error state, toasts.
 */

import { getCoverUrl } from './fetchBooks.js';
import { addFavorite, removeFavorite, isFavorite } from './favorites.js';

// ── Toast ─────────────────────────────────────────────────────────────────

/**
 * Show a brief toast notification at the bottom-right of the screen.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Remove after animation completes (2.6 s total)
  setTimeout(() => toast.remove(), 2700);
}

// ── Loading state ─────────────────────────────────────────────────────────

/**
 * Render a loading spinner inside a grid container.
 * @param {HTMLElement} container
 */
export function renderLoading(container) {
  container.innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <p>Fetching books…</p>
    </div>
  `;
}

// ── Empty state ───────────────────────────────────────────────────────────

/**
 * Render an empty-state message inside a grid container.
 * @param {HTMLElement} container
 * @param {string} icon
 * @param {string} title
 * @param {string} message
 * @param {string} [actionHtml]  Optional action button/link HTML
 */
export function renderEmpty(container, icon, title, message, actionHtml = '') {
  container.innerHTML = `
    <div class="state-box">
      <span class="icon">${icon}</span>
      <strong>${title}</strong>
      <p>${message}</p>
      ${actionHtml}
    </div>
  `;
}

// ── Error state ───────────────────────────────────────────────────────────

/**
 * Render an error message inside a grid container.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function renderError(container, message) {
  container.innerHTML = `
    <div class="state-box">
      <span class="icon">⚠️</span>
      <strong>Something went wrong</strong>
      <p>${message}</p>
    </div>
  `;
}

// ── Book card (homepage) ──────────────────────────────────────────────────

/**
 * Create a book card element for the homepage grid.
 * Includes an "Add to Favourites" button wired to localStorage.
 *
 * @param {Object} book  - Open Library book doc
 * @param {Function} [onFavChange]  - Optional callback after fav state changes
 * @returns {HTMLElement}
 */
export function createBookCard(book, onFavChange) {
  const saved = isFavorite(book.key);
  const card  = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <img
      src="${getCoverUrl(book.cover_i)}"
      alt="Cover of ${escHtml(book.title)}"
      loading="lazy"
      onerror="this.src='./assets/placeholder.jpg'"
    />
    <div class="card-body">
      <p class="card-title">${escHtml(book.title)}</p>
      <p class="card-author">${escHtml(book.author_name?.[0] ?? 'Unknown Author')}${book.first_publish_year ? ' · ' + book.first_publish_year : ''}</p>
      <button class="btn-fav ${saved ? 'saved' : ''}" ${saved ? 'disabled' : ''} aria-label="Add ${escHtml(book.title)} to favourites">
        ${saved ? '✓ Saved' : '♡ Add to Favourites'}
      </button>
    </div>
  `;

  const btn = card.querySelector('.btn-fav');
  btn.addEventListener('click', () => {
    const added = addFavorite(book);
    if (added) {
      btn.textContent = '✓ Saved';
      btn.disabled = true;
      btn.classList.add('saved');
      showToast(`"${book.title}" added to favourites!`);
      onFavChange?.();
    } else {
      showToast('Already in your favourites.', 'info');
    }
  });

  return card;
}

// ── Favourite card (favorites page) ──────────────────────────────────────

/**
 * Create a book card element for the favourites page.
 * Includes a "Remove" button.
 *
 * @param {Object} book
 * @param {Function} onRemove  - Callback after removal (to re-render list)
 * @returns {HTMLElement}
 */
export function createFavCard(book, onRemove) {
  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <img
      src="${getCoverUrl(book.cover_i)}"
      alt="Cover of ${escHtml(book.title)}"
      loading="lazy"
      onerror="this.src='./assets/placeholder.jpg'"
    />
    <div class="card-body">
      <p class="card-title">${escHtml(book.title)}</p>
      <p class="card-author">${escHtml(book.author_name?.[0] ?? 'Unknown Author')}${book.first_publish_year ? ' · ' + book.first_publish_year : ''}</p>
      <button class="btn-remove" aria-label="Remove ${escHtml(book.title)} from favourites">
        🗑 Remove
      </button>
    </div>
  `;

  card.querySelector('.btn-remove').addEventListener('click', () => {
    removeFavorite(book.key);
    showToast(`"${book.title}" removed from favourites.`, 'info');
    // Fade out then re-render
    card.style.transition = 'opacity 0.2s, transform 0.2s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(onRemove, 220);
  });

  return card;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Escape HTML special characters to prevent XSS. */
function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

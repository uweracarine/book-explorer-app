/**
 * favorites.js
 * ──────────────────────────────────────────────────────────────────────────
 * Pure functions for managing the user's favourite books list.
 * No DOM manipulation here — only data logic.
 */

import { saveToStorage, getFromStorage } from './storage.js';

const KEY = 'be_favorites'; // localStorage key

/**
 * Return the current favourites array.
 * @returns {Array}
 */
export function getFavorites() {
  return getFromStorage(KEY, []);
}

/**
 * Add a book to favourites. Silently ignores duplicates.
 * @param {Object} book - Book object from the Open Library API
 * @returns {boolean} true if added, false if already saved
 */
export function addFavorite(book) {
  const list = getFavorites();
  if (list.some(b => b.key === book.key)) return false;
  list.push(book);
  saveToStorage(KEY, list);
  return true;
}

/**
 * Remove a book from favourites by its Open Library key.
 * @param {string} bookKey  e.g. "/works/OL45804W"
 */
export function removeFavorite(bookKey) {
  const updated = getFavorites().filter(b => b.key !== bookKey);
  saveToStorage(KEY, updated);
}

/**
 * Check whether a book is already saved.
 * @param {string} bookKey
 * @returns {boolean}
 */
export function isFavorite(bookKey) {
  return getFavorites().some(b => b.key === bookKey);
}

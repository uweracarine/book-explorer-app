
const BASE_URL = 'https://openlibrary.org/search.json';

export async function fetchBooks(query, limit = 12) {
  if (!query || !query.trim()) return [];

  const url = `${BASE_URL}?q=${encodeURIComponent(query.trim())}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year,subject`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.docs ?? [];
}


export function getCoverUrl(coverId, size = 'M') {
  return coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
    : './assets/placeholder.jpg';
}

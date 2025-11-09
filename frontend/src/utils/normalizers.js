// src/utils/normalizers.js

// Normalize book from your backend API
export const normalizeBackendBook = (book) => ({
  id: book.google_id || book.id || book.title,
  title: book.title,
  authors: book.authors || [],
  thumbnail:
    book.thumbnail ||
    "https://via.placeholder.com/120x180?text=No+Cover",
});

// Normalize book from Google Books API
export const normalizeGoogleBook = (item) => ({
  id: item.id,
  title: item.volumeInfo.title || "Untitled",
  authors: item.volumeInfo.authors || [],
  thumbnail:
    item.volumeInfo.imageLinks?.thumbnail ||
    "https://via.placeholder.com/120x180?text=No+Cover",
});

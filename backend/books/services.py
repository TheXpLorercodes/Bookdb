import requests
import os
import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache
from .models import Book

# --- Configure Gemini ---
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
except Exception:
    print("⚠️ Warning: Gemini API Key not found or invalid. AI features will fail.")

# -------------------------------
# External API helpers
# -------------------------------

def search_google_books(query, max_results=20):
    """Query the Google Books API with a search term."""
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        "q": query,
        "maxResults": max_results,
        "key": getattr(settings, "GOOGLE_BOOKS_API_KEY", None),
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Google Books API Error: {e}")
        return None

# RENAMED and FIXED: This now correctly fetches raw API data.
def fetch_google_book_by_id(google_id):
    """Get details for a specific book by Google ID from the API."""
    url = f"https://www.googleapis.com/books/v1/volumes/{google_id}"
    params = {"key": getattr(settings, "GOOGLE_BOOKS_API_KEY", None)}
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Google Books API Error fetching ID {google_id}: {e}")
        return None

def get_nyt_bestsellers(list_name="hardcover-fiction", limit=10):
    """Get NYT bestseller list."""
    # ... (rest of function is fine)
    url = f"https://api.nytimes.com/svc/books/v3/lists/current/{list_name}.json"
    params = {"api-key": getattr(settings, "NYT_BOOKS_API_KEY", None)}
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"NYT API Error: {e}")
        return []
    data = response.json()
    return data.get("results", {}).get("books", [])[:limit]

# -------------------------------
# Normalizers (Google + NYT)
# -------------------------------

def normalize_google_book(item):
    """Normalize Google Books API item into unified schema."""
    volume = item.get("volumeInfo", {})
    return {
        "google_id": item.get("id"),
        "title": volume.get("title", "Unknown Title"),
        "authors": volume.get("authors", []),
        "published_date": volume.get("publishedDate"),
        "categories": volume.get("categories", []),
        "thumbnail": (volume.get("imageLinks", {}) or {}).get("thumbnail"),
        "description": volume.get("description"),
        "average_rating": volume.get("averageRating"),
    }

def normalize_nyt_book(item):
    """Normalize NYT bestseller book into unified schema."""
    # ... (rest of function is fine)
    return {
        "google_id": None,
        "title": item.get("title"),
        "authors": [item.get("author")] if item.get("author") else [],
        "thumbnail": item.get("book_image"),
        "description": item.get("description"),
        "amazon_url": item.get("amazon_product_url"),
        "rank": item.get("rank"),
    }

# -------------------------------
# DB caching / get_or_create
# -------------------------------

# IMPROVED: This now saves a more complete record to your database.
def get_or_create_book_details(google_id):
    """
    Check DB for book; if missing, fetch from Google, normalize,
    and save a complete record.
    """
    try:
        return Book.objects.get(google_id=google_id)
    except Book.DoesNotExist:
        data = fetch_google_book_by_id(google_id)
        if not data:
            return None

        normalized_data = normalize_google_book(data)
        
        book, created = Book.objects.update_or_create(
            google_id=google_id,
            defaults={
                "title": normalized_data.get("title", "Unknown Title"),
                "authors": normalized_data.get("authors", []),
                "published_date": normalized_data.get("published_date"),
                "thumbnail_url": normalized_data.get("thumbnail"),
                "short_description": normalized_data.get("description"),
            }
        )
        return book

# -------------------------------
# High-level business logic (with caching)
# -------------------------------

# ADDED: Caching for performance
def get_genre_top_books(limit=10):
    """Get top book from each genre (Google Books), with caching."""
    cache_key = "genre_top_books"
    cached_books = cache.get(cache_key)
    if cached_books:
        return cached_books

    genres = ["Science Fiction", "Science", "History", "Biography", "Fantasy", "Romance"]
    books = []
    for genre in genres[:limit]:
        data = search_google_books(f"subject:{genre}", max_results=1)
        if data and "items" in data:
            books.append(normalize_google_book(data["items"][0]))
    
    cache.set(cache_key, books, 60 * 60 * 6)  # Cache for 6 hours
    return books

# ADDED: Caching for performance
def get_recent_books(limit=10):
    """Get recently published books (Google Books), with caching."""
    cache_key = "recent_books"
    cached_books = cache.get(cache_key)
    if cached_books:
        return cached_books
    
    data = search_google_books("newest", max_results=limit)
    if not data:
        return []
    books = [normalize_google_book(item) for item in data.get("items", [])]
    cache.set(cache_key, books, 60 * 60 * 6)  # Cache for 6 hours
    return books

# ADDED: Caching for performance
def get_bestsellers(limit=10):
    """Get bestseller books (NYT), with caching."""
    cache_key = "bestsellers"
    cached_books = cache.get(cache_key)
    if cached_books:
        return cached_books

    books_data = get_nyt_bestsellers(limit=limit)
    books = [normalize_nyt_book(item) for item in books_data]
    cache.set(cache_key, books, 60 * 60 * 6)  # Cache for 6 hours
    return books

# -------------------------------
# AI Summary (Gemini / caching)
# -------------------------------

def generate_and_cache_ai_summary(book_id: str):
    """
    Generate a spoiler-free AI summary for a book using Gemini.
    Uses cache to prevent repeated API calls.
    """
    # ... (rest of function is fine, assuming 'book_id' is a google_id)
    cache_key = f"book_summary_gemini_{book_id}"
    summary = cache.get(cache_key)
    if summary:
        return summary

    try:
        book = Book.objects.get(google_id=book_id)
    except Book.DoesNotExist:
        return "Summary not available because the book is not in our database."

    prompt = (
        f"Write a spoiler-free, engaging, and concise summary (about 150 words) "
        f"for the book titled '{book.title}' by {', '.join(book.authors or ['Unknown Author'])}."
    )
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        summary = response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        summary = "Summary not available due to an AI error."
    
    cache.set(cache_key, summary, 60 * 60 * 24)  # Cache for 24 hours
    return summary
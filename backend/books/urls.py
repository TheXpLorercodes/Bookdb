from django.urls import path
from .views import (
    BookSearchView,
    BookDetailView,
    BookSummaryView,
    HomeBooksView,
    UserBookInteractionView,
    UserLibraryView,
    ReviewListCreateView,
    ReviewDetailView,
    UserFavoritesView,
)

urlpatterns = [
    path("search/", BookSearchView.as_view(), name="book-search"),
    path("details/<str:google_id>/", BookDetailView.as_view(), name="book-detail"),
    path("summary/<str:google_id>/", BookSummaryView.as_view(), name="book-summary"),
    path("home/", HomeBooksView.as_view(), name="home-books"),
    
    # Interaction & Library URLs
    path("interactions/", UserBookInteractionView.as_view(), name="user-interaction"),
    path("my-library/", UserLibraryView.as_view(), name="user-library"),
    path("favorites/", UserFavoritesView.as_view(), name="user-favorites"),
    
    # Review URLs
    # FIXED: The URL parameter now correctly uses 'book_id' to match the view.
    path("books/<str:book_id>/reviews/", ReviewListCreateView.as_view(), name="review-create"),
    path("reviews/<int:review_id>/", ReviewDetailView.as_view(), name="review-detail"),
]
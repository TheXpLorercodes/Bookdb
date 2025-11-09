from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Book, UserBookInteraction, Review
from .serializers import (
    BookSerializer,
    UserBookInteractionSerializer,
    ReviewSerializer,
)
from .services import (
    search_google_books,
    normalize_google_book,
    get_or_create_book_details,
    generate_and_cache_ai_summary,
    get_genre_top_books,
    get_recent_books,
    get_bestsellers,
)
from .permissions import IsOwnerOrReadOnly

# -------------------------------
# Book Search
# -------------------------------
class BookSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "")
        if not query:
            return Response(
                {"error": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = search_google_books(query)
        if not data or "items" not in data:
            return Response({"books": []})

        books = [normalize_google_book(item) for item in data.get("items", [])]
        return Response({"books": books})

# -------------------------------
# Book Details
# -------------------------------
# CHANGED: Simplified to use the serializer directly with the DB object.
class BookDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, google_id):
        # The service function gets or creates the book in our database.
        book = get_or_create_book_details(google_id)

        if not book:
            return Response({"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

        # Pass the database object directly to the serializer.
        serializer = BookSerializer(book)
        return Response(serializer.data)

# -------------------------------
# AI Summary
# -------------------------------
class BookSummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, google_id):
        summary = generate_and_cache_ai_summary(google_id)
        return Response({"summary": summary})

# -------------------------------
# Home / Genre Top / Recent / Bestseller Books
# -------------------------------
class HomeBooksView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "carousel": get_genre_top_books(limit=10),
            "recent": get_recent_books(limit=10),
            "bestsellers": get_bestsellers(limit=10)
        })

# -------------------------------
# UserBookInteraction
# -------------------------------
class UserBookInteractionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserBookInteractionSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        book_id = request.data.get("book_id")
        if not book_id:
            return Response(
                {"error": "book_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        interaction = get_object_or_404(
            UserBookInteraction, user=request.user, book_id=book_id
        )

        serializer = UserBookInteractionSerializer(
            interaction, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------------
# Reviews
# -------------------------------
class ReviewListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        # Find the book instance first
        book = get_object_or_404(Book, pk=book_id)
        
        serializer = ReviewSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            # Pass the user and book instances directly to save
            serializer.save(user=request.user, book=book)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewDetailView(APIView):
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self, review_id):
        return get_object_or_404(Review, id=review_id)

    def put(self, request, review_id):
        review = self.get_object(review_id)
        self.check_object_permissions(request, review)
        serializer = ReviewSerializer(
            review, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, review_id):
        review = self.get_object(review_id)
        self.check_object_permissions(request, review)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# User Library & Favorites
# -------------------------------
# FIXED: Solved the N+1 query problem and now uses the serializer.
class UserLibraryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Use select_related('book') to fetch books in a single efficient query.
        interactions = UserBookInteraction.objects.filter(
            user=request.user
        ).select_related('book')

        # Use the serializer for clean, reusable data formatting.
        serializer = UserBookInteractionSerializer(interactions, many=True)
        return Response({"library": serializer.data})

# FIXED: Solved the N+1 query problem and now uses the serializer.
class UserFavoritesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Also apply select_related('book') here.
        favorites = UserBookInteraction.objects.filter(
            user=request.user, is_favorite=True
        ).select_related('book')

        # Reuse the same serializer for a consistent response structure.
        serializer = UserBookInteractionSerializer(favorites, many=True)
        return Response({"favorites": serializer.data})
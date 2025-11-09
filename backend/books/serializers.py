from rest_framework import serializers
from .models import Book, UserBookInteraction, Review

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            'google_id',
            'title',
            'authors',
            'published_date',
            'thumbnail_url',
            'short_description',
        ]

class UserBookInteractionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())

    class Meta:
        model = UserBookInteraction
        fields = ["user", "book", "status", "is_favorite"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['book'] = BookSerializer(instance.book).data
        return representation

# In books/serializers.py

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    # REMOVED: The explicit, writable 'book' field definition is no longer needed here.

    class Meta:
        model = Review
        fields = ["id", "book", "user", "username", "rating", "comment", "created_at"]
        # CHANGED: Added 'book' back to read_only_fields.
        # The view will provide both the user and the book during the .save() call.
        read_only_fields = ["user", "book"]
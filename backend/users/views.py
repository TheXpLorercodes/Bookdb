from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.cache import cache
import random
from twilio.rest import Client

from .serializers import (
    RegisterSerializer, 
    UserProfileSerializer, 
    ChangePasswordSerializer
)

User = get_user_model()

# -------------------------------
# Registration
# -------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


# -------------------------------
# Profile: Get / Update
# -------------------------------
class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
# Change Password
# -------------------------------
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response({"old_password": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"detail": "Password updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
# My Favorites placeholder
# -------------------------------
class MyFavoritesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"favorites": []})


# -------------------------------
# OTP: Send OTP via SMS
# -------------------------------
class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Store in cache (valid for 5 minutes)
        cache.set(f"otp_{phone}", otp, timeout=300)

        try:
            # Initialize Twilio client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

            # Ensure phone format
            to_number = f"+91{phone}" if not phone.startswith("+") else phone

            # Send SMS
            message = client.messages.create(
                body=f"Your OTP is {otp}",
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )

            print("DEBUG: OTP sent to", to_number, "| SID:", message.sid)

        except Exception as e:
            return Response({"error": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": f"OTP sent to {phone}"})


# -------------------------------
# OTP: Verify OTP and login
# -------------------------------
class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        otp = request.data.get("otp")

        if not phone or not otp:
            return Response({"error": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_{phone}")
        if cached_otp != otp:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid → fetch or create user
        user, created = User.objects.get_or_create(username=phone, defaults={"email": "", "password": "!"})

        # Delete OTP after use
        cache.delete(f"otp_{phone}")

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        })

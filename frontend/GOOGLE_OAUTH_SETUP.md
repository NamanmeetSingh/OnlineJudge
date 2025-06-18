# Google OAuth Setup Instructions

## Prerequisites
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

## Setting up OAuth Credentials

1. **Go to Credentials**
   - Navigate to "APIs & Services" > "Credentials"

2. **Create OAuth 2.0 Client ID**
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"

3. **Configure OAuth consent screen** (if not done already)
   - Go to "OAuth consent screen"
   - Choose "External" for user type
   - Fill in the required information:
     - App name: "Online Judge"
     - User support email: your email
     - Developer contact information: your email

4. **Set up authorized origins and redirect URIs**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)

5. **Copy your credentials**
   - Copy the Client ID and Client Secret

## Environment Setup

1. Update your `.env.local` file with the actual values:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string_here
```

2. Generate a random secret for NEXTAUTH_SECRET:
   - You can use: `openssl rand -base64 32`
   - Or any random string generator

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:3000` and test the Google sign-in

## Testing Authentication

1. Click "Sign in with Google" on the login page
2. You'll be redirected to Google's OAuth consent screen
3. After authorization, you'll be redirected back to your app
4. The navbar should show your profile information

## Troubleshooting

- Make sure your redirect URIs match exactly
- Check that the Google+ API is enabled
- Verify your OAuth consent screen is properly configured
- Check the browser console for any errors

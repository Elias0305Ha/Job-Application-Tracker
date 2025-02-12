# Job Application Tracker

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Elias0305Ha/Job-Application-Tracker.git
cd Job-Application-Tracker
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the `backend` directory with the following variables:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGO_URI=your_mongodb_connection_string
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
```

To get these credentials:

### Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google OAuth2 API
4. Go to Credentials
5. Create OAuth 2.0 Client ID
6. Set the authorized redirect URI to: `http://localhost:5000/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster or use an existing one
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string and replace `<password>` with your database user password

## Running the Application

After setting up the environment variables, start the server:
```bash
npm start
```

The server will run on http://localhost:5000

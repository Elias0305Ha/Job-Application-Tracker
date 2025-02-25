const Job = require("./models/Job");

// Load environment variables (for API keys)
const path = require('path');
const fs = require('fs');
require("dotenv").config({ path: path.join(__dirname, '.env') });

const jobRoutes = require("./routes/jobRoutes"); // Import job routes
const fetchJobEmails = require("./gmailService"); // Import Gmail service
const { google } = require('googleapis'); // Import Google APIs

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback"
);

// Set credentials from environment variables
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const mongoose = require('mongoose');

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Enable debug mode for development
mongoose.set('debug', true);

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit process with failure
  });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔄 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔸 MongoDB connection disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});


// Import necessary tools
const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Required for making API requests

// Initialize the Express app
const app = express();

// Enable CORS (Allows frontend to talk to backend)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// Enable JSON parsing (So we can send/receive JSON data)
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Define a simple test route
app.get("/", (req, res) => {
  res.send("Job Application Tracker API is running...");
});

// Route to revoke existing tokens
app.get("/auth/google/revoke", async (req, res) => {
  try {
    await axios.post(`https://oauth2.googleapis.com/revoke?token=${process.env.GOOGLE_REFRESH_TOKEN}`, null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    res.send("Tokens revoked successfully. Now try logging in again at /auth/google");
  } catch (error) {
    console.error("Error revoking token:", error);
    res.send("You can proceed to /auth/google to get new tokens");
  }
});

// Google OAuth Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback";

// Step 1: Redirect user to Google login page
app.get("/auth/google", (req, res) => {
    // Force consent screen to always appear to ensure we get a refresh token
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email%20profile%20https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=consent&include_granted_scopes=true`;
    res.redirect(authUrl);
});

// Step 2: Handle Google's response (exchange code for access token)
app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query; // Google sends us a 'code' in the URL

    if (!code) {
        return res.status(400).send("Error: No code provided.");
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
                code
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const accessToken = tokenResponse.data.access_token;

        // Fetch user info using the access token
        const userResponse = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userData = userResponse.data;

        // Save tokens to a file and update .env
        const tokens = {
            access_token: tokenResponse.data.access_token,
            refresh_token: tokenResponse.data.refresh_token
        };
        
        if (!tokenResponse.data.refresh_token) {
            throw new Error('No refresh token received. Please revoke access and try again.');
        }

        // Update .env file with new refresh token
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(
            /GOOGLE_REFRESH_TOKEN=.*/,
            `GOOGLE_REFRESH_TOKEN=${tokenResponse.data.refresh_token}`
        );
        fs.writeFileSync(envPath, envContent);
        
        // Also save to tokens.json for backup
        fs.writeFileSync('tokens.json', JSON.stringify({
            access_token: tokenResponse.data.access_token,
            refresh_token: tokenResponse.data.refresh_token
        }, null, 2));
        
        // Update the oauth2Client with new refresh token
        oauth2Client.setCredentials({
            refresh_token: tokenResponse.data.refresh_token
        });

        // Reload environment variables to ensure they're updated
        require('dotenv').config({ path: path.join(__dirname, '.env') });

        // Send success response
        res.send(`
            <h1>Authentication Successful!</h1>
            <p>Tokens have been saved. You can close this window.</p>
            <script>
                console.log('Tokens:', ${JSON.stringify(tokens)});
            </script>
        `);

    } catch (error) {
        console.error("Error exchanging code for token:", error.response ? error.response.data : error.message);
        res.status(500).send("Authentication failed.");
    }
});

// Test Gmail integration
app.get("/test-gmail", async (req, res) => {
  try {
    // First test authentication
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    console.log('Testing Gmail authentication...');
    
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log('Gmail authentication successful:', profile.data);
    } catch (error) {
      console.error('Gmail authentication failed:', error);
      return res.status(401).json({ 
        error: 'Gmail authentication failed',
        details: error.message,
        action: 'Please visit /auth/google to re-authenticate'
      });
    }

    // If authentication successful, try to fetch emails
    console.log('Fetching emails...');
    const emails = await fetchJobEmails();
    console.log(`Found ${emails.length} emails`);
    res.json(emails);
  } catch (error) {
    console.error("Gmail Error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

// Start the server on port 5000
const PORT = process.env.PORT || 5000;

// Register routes
app.use("/api/jobs", jobRoutes); // Register job routes first

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Add 404 handler for unmatched routes (this should be last)
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Start the server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

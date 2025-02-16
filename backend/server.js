const Job = require("./models/Job");

// Load environment variables (for API keys)
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '.env') });

const jobRoutes = require("./routes/jobRoutes"); // Import job routes

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
app.use(cors());

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

// Google OAuth Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback";

// Step 1: Redirect user to Google login page
app.get("/auth/google", (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email%20profile`;
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

        // Send user data as response
        res.json({
            message: "Google Authentication Successful!",
            user: userData
        });

    } catch (error) {
        console.error("Error exchanging code for token:", error.response ? error.response.data : error.message);
        res.status(500).send("Authentication failed.");
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

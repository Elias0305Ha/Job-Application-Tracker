// Import mongoose (to interact with MongoDB)
const mongoose = require('mongoose');

// Step 1: Define a Schema (The Structure of a Job Application)
const jobSchema = new mongoose.Schema({
    // Basic job info
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Applied', 'Interview', 'Rejected', 'Accepted'],
        default: 'Applied'
    },
    dateApplied: { type: Date, default: Date.now },

    // Email data
    emailId: String,
    emailSubject: String,
    emailFrom: String,
    emailContent: String,
    fromEmail: { type: Boolean, default: false },

    // User corrections
    originalCompany: String,  // Store original extracted company
    originalPosition: String, // Store original extracted position
    wasEdited: { type: Boolean, default: false },

    // Metadata
    platform: String, // e.g., 'workday', 'greenhouse', etc.
    notes: String
});

// Step 2: Create a Model
const Job = mongoose.model('Job', jobSchema);

// Step 3: Export the model
module.exports = Job;

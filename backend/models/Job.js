// Import mongoose (to interact with MongoDB)
const mongoose = require('mongoose');

// Step 1: Define a Schema (The Structure of a Job Application)
const jobSchema = new mongoose.Schema({
    company: { type: String, required: true }, // Company name (required)
    position: { type: String, required: true }, // Job title (required)
    status: { 
        type: String, 
        enum: ['Applied', 'Interview', 'Rejected', 'Accepted'], // Only allow these values
        default: 'Applied' // Default to "Applied" if nothing is given
    },
    dateApplied: { type: Date, default: Date.now } // Automatically use current date
});

// Step 2: Create a Model (A collection/table in MongoDB)
const Job = mongoose.model('Job', jobSchema);

// Step 3: Export the model so we can use it in other files
module.exports = Job;

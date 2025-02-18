const express = require("express");
const mongoose = require('mongoose'); // Add mongoose for ObjectId validation
const Job = require("../models/Job"); // Import the Job model
const fetchJobEmails = require("../gmailService"); 

const router = express.Router(); // Create an Express router

// Route for adding jobs

router.post("/add", async (req, res) => {
  try {
    const { company, position, status } = req.body; // Get job details from request body

    // Check if job already exists
    const existingJob = await Job.findOne({ company, position });
    if (existingJob) {
      return res.status(400).json({ 
        error: "A job application for this company and position already exists",
        existingJob 
      });
    }

    // Create a new job document in the database
    const newJob = new Job({ company, position, status });
    await newJob.save(); // Save job to MongoDB

    res.status(201).json({ message: "Job added successfully!", job: newJob });
  } catch (error) {
    res.status(500).json({ error: "Error adding job application" });
  }
});


// 📤 Route 2: Get job applications and emails with smart filtering
router.get("/", async (req, res) => {
  try {
    // Get the initial load parameter from query
    const { initialLoad } = req.query;
    console.log('🔍 Attempting to fetch jobs and emails... Initial load:', initialLoad);
    
    // Calculate the date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // If it's the initial load, only show last 3 months
    // Otherwise, show all historical data
    const query = initialLoad === 'true' ? 
      { dateApplied: { $gte: threeMonthsAgo } } : 
      {};
    
    // Fetch both jobs and emails concurrently
    const [jobs, emails] = await Promise.all([
      Job.find(query).sort({ dateApplied: -1 }),
      fetchJobEmails(initialLoad === 'true')
    ]);
    
    console.log(`✅ Data fetched successfully. ${initialLoad === 'true' ? 
      'Showing last 3 months only.' : 
      'Showing all historical data.'}`);
    console.log(`Found ${jobs.length} jobs and ${emails.length} emails matching criteria.`);
    
    // Combine jobs and emails in the response
    res.json({
      savedJobs: jobs,
      emailApplications: emails
    });
  } catch (error) {
    console.error('🔴 Error fetching jobs:', error);
    res.status(500).json({ error: "Error fetching job applications" });
  }
});

// PATCH route for updating job details
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the job first to store original values
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Store original values if not already stored
    if (!job.originalCompany && updates.company) {
      job.originalCompany = job.company;
    }
    if (!job.originalPosition && updates.position) {
      job.originalPosition = job.position;
    }

    // Apply updates
    Object.assign(job, updates);
    job.wasEdited = true;
    
    // Save the updated job
    await job.save();

    res.json({
      message: "Job updated successfully",
      job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: "Error updating job" });
  }
});

// Route to delete a job application
// Changed from "/delete/:id" to just "/:id" to simplify the route
// Now the full URL will be "/api/jobs/:id" instead of "/api/jobs/delete/:id"
router.delete("/:id", async (req, res) => {
  try {
    // Log the incoming delete request with the job ID
    console.log("🗑️ Attempting to delete job with ID:", req.params.id);
    
    // First, validate if the ID is in the correct MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ Invalid ID format:", req.params.id);
      return res.status(400).json({ 
        error: "Invalid job ID format",
        message: "The provided ID is not in the correct format"
      });
    }

    // Attempt to find and delete the job
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    // If no job was found with that ID
    if (!deletedJob) {
      console.log("❌ No job found with ID:", req.params.id);
      return res.status(404).json({ 
        error: "Job not found",
        message: "No job exists with the provided ID"
      });
    }

    // Log success and return the deleted job details
    console.log("✅ Successfully deleted job:", deletedJob);
    res.status(200).json({ 
      message: "Job deleted successfully!",
      deletedJob // Include the deleted job details in the response
    });

  } catch (error) {
    // Log any errors that occur during the process
    console.error("🔴 Error while deleting job:", error);
    res.status(500).json({ 
      error: "Error deleting job application",
      message: error.message
    });
  }
});




// Route to fetch job application emails from Gmail
router.get("/fetch-emails", async (req, res) => {
  try {
    const emails = await fetchJobEmails();
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching job emails:", error);
    res.status(500).json({ error: "Failed to fetch job emails" });
  }
});

module.exports = router; // Export the router

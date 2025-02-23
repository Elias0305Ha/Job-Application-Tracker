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

// GET route for fetching all jobs
router.get("/", async (req, res) => {
  try {
    console.log('🔍 Fetching all jobs...');
    
    // Check MongoDB connection
    const isConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connection status:', isConnected ? '🟢 Connected' : '🔴 Not connected');
    
    // Get all jobs from the database
    const savedJobs = await Job.find({});
    console.log('📊 Total jobs found:', savedJobs.length);
    
    // Log each job's watchlist status
    savedJobs.forEach(job => {
      console.log(`Job ${job._id} (${job.company}): isWatchlisted = ${job.isWatchlisted}`);
    });
    
    // Count watchlisted jobs
    const watchlistedCount = savedJobs.filter(job => job.isWatchlisted === true).length;
    console.log('⭐ Watchlisted jobs count:', watchlistedCount);
    
    // Send response with full job objects
    res.json({
      savedJobs: savedJobs.map(job => ({
        ...job.toObject(),
        _id: job._id,
        isWatchlisted: job.isWatchlisted
      })),
      emailApplications: [],
      watchlistedCount
    });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ error: "Error fetching jobs", details: error.message });
  }
});

// PATCH route for updating job details
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isWatchlisted } = req.body;
    
    console.log('🔄 PATCH Request received for job:', id);
    console.log('📦 Update request to set isWatchlisted to:', isWatchlisted);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId:', id);
      return res.status(400).json({ error: "Invalid job ID format" });
    }

    // Find and update the job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: { isWatchlisted: isWatchlisted } },
      { new: true }
    );

    if (!updatedJob) {
      console.log('❌ Job not found:', id);
      return res.status(404).json({ error: "Job not found" });
    }

    console.log('✅ Job successfully updated:', {
      id: updatedJob._id,
      company: updatedJob.company,
      isWatchlisted: updatedJob.isWatchlisted
    });

    // Verify watchlist status after update
    const verifyJob = await Job.findById(id);
    console.log('🔍 Verification - Job after update:', verifyJob);

    // Get all watchlisted jobs for count
    const watchlistedJobs = await Job.find({ isWatchlisted: true });
    console.log('📊 Total watchlisted jobs:', watchlistedJobs.length);

    res.json({
      message: "Job updated successfully",
      job: updatedJob,
      watchlistCount: watchlistedJobs.length
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({ 
      error: "Error updating job",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route to delete a job application
// Changed from "/delete/:id" to just "/:id" to simplify the route
// Now the full URL will be "/api/jobs/:id" instead of "/api/jobs/delete/:id"
router.delete("/:id", async (req, res) => {
  try {
    // Log the incoming delete request with the job ID
    console.log(" Attempting to delete job with ID:", req.params.id);
    
    // First, validate if the ID is in the correct MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(" Invalid ID format:", req.params.id);
      return res.status(400).json({ 
        error: "Invalid job ID format",
        message: "The provided ID is not in the correct format"
      });
    }

    // Attempt to find and delete the job
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    // If no job was found with that ID
    if (!deletedJob) {
      console.log(" No job found with ID:", req.params.id);
      return res.status(404).json({ 
        error: "Job not found",
        message: "No job exists with the provided ID"
      });
    }

    // Log success and return the deleted job details
    console.log(" Successfully deleted job:", deletedJob);
    res.status(200).json({ 
      message: "Job deleted successfully!",
      deletedJob // Include the deleted job details in the response
    });

  } catch (error) {
    // Log any errors that occur during the process
    console.error(" Error while deleting job:", error);
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

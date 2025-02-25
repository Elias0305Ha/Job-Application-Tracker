"use client"

import { useState, useEffect } from "react"
import { Search, Star, StarOff, Calendar } from "lucide-react"

const formatDate = (dateString) => {
  try {
    if (!dateString) return 'No date'
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

const INDUSTRIES = ["All", "Tech", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Other"]

const JobCard = ({ job, onToggleWatchlist }) => (
  <div className="group bg-[#1e293b] p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-[#1e293b]/80 mb-6 cursor-pointer">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold group-hover:text-[#3b82f6] transition-colors duration-300">{job.company}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
              job.status === "Applied"
                ? "bg-[#3b82f6] text-white group-hover:bg-[#2563eb]"
                : job.status === "Interview"
                  ? "bg-[#eab308] text-black group-hover:bg-[#ca8a04]"
                  : job.status === "Rejected"
                    ? "bg-[#ef4444] text-white group-hover:bg-[#dc2626]"
                    : "bg-[#22c55e] text-white group-hover:bg-[#16a34a]"
            }`}
          >
            {job.status}
          </span>
        </div>
        <p className="text-[#94a3b8] text-lg mt-1 group-hover:text-white transition-colors duration-300">{job.position}</p>
        {job.emailContent && (
          <p className="text-sm text-[#94a3b8] mt-3 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
            {job.emailContent}
          </p>
        )}
      </div>
      <button 
        className="ml-4 p-2 rounded-full hover:bg-[#334155] transition-colors duration-300"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(job._id);
        }}
      >
        {job.isWatchlisted ? (
          <Star size={24} className="text-[#eab308] fill-[#eab308] transition-transform duration-300 hover:scale-110" />
        ) : (
          <StarOff size={24} className="text-[#94a3b8] transition-all duration-300 hover:text-[#eab308] hover:scale-110" />
        )}
      </button>
    </div>
    <div className="mt-4 flex items-center gap-4 text-sm text-[#94a3b8]">
      <div className="flex items-center gap-2">
        <Calendar size={16} />
        <span>{formatDate(job.dateApplied || job.date)}</span>
      </div>
      {job.industry && (
        <span className="px-3 py-1 bg-[#334155] rounded-full text-xs group-hover:bg-[#475569] transition-colors duration-300">
          {job.industry}
        </span>
      )}
      <span className="px-3 py-1 bg-[#3b82f6]/20 text-[#3b82f6] rounded-full text-xs group-hover:bg-[#3b82f6]/30 transition-colors duration-300">
        {job.platform}
      </span>
    </div>
  </div>
)

export default function ActiveApplications() {
  const [searchTerm, setSearchTerm] = useState("")
  const [industry, setIndustry] = useState("All")
  const [sortBy, setSortBy] = useState("Date")
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const toggleWatchlist = async (jobId) => {
    try {
      const currentJob = jobs.find(job => job._id === jobId);
      if (!currentJob) return;

      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isWatchlisted: !currentJob.isWatchlisted
        })
      });
      
      if (response.ok) {
        // Update local state
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, isWatchlisted: !job.isWatchlisted } : job
        ));

        // Trigger a custom event to notify Watchlist component
        const event = new CustomEvent('watchlistUpdated', { 
          detail: { jobId, isWatchlisted: !currentJob.isWatchlisted } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs')
        const data = await response.json()
        const allJobs = [...data.savedJobs, ...data.emailApplications].map(job => ({
          ...job,
          dateApplied: job.dateApplied || job.date, // Handle both date fields
          industry: job.industry || "Tech" // Set default industry if not specified
        }))
        setJobs(allJobs)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch = 
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.emailContent?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesIndustry = industry === "All" || job.industry === industry
      return matchesSearch && matchesIndustry
    })
    .sort((a, b) => {
      if (sortBy === "Date") {
        const dateA = new Date(a.dateApplied || a.date || 0).getTime()
        const dateB = new Date(b.dateApplied || b.date || 0).getTime()
        return dateB - dateA
      }
      return (a.company || "").localeCompare(b.company || "")
    })

  if (loading) {
    return <div className="w-full md:w-2/3 animate-pulse">Loading...</div>
  }

  return (
    <div className="w-full md:w-2/3">
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748b]" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2 bg-[#1e293b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-[#1e293b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 bg-[#1e293b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Date">Sort by Date</option>
            <option value="Company">Sort by Company</option>
          </select>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Applications</h2>
        {filteredJobs.map((job) => (
          <JobCard key={job._id} job={job} onToggleWatchlist={toggleWatchlist} />
        ))}
      </div>
    </div>
  )
}

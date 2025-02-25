"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"

const formatDate = (dateString) => {
  try {
    if (!dateString) return 'No date'
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

const WatchlistCard = ({ job, onToggleWatchlist }) => (
  <div className="bg-[#1e293b] p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 mb-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">{job.company}</h3>
        <p className="text-[#94a3b8]">{job.position}</p>
      </div>
      <button 
        className="text-[#eab308] hover:text-[#ca8a04]"
        onClick={() => onToggleWatchlist(job._id)}
      >
        <Star size={20} fill="#eab308" />
      </button>
    </div>
    <div className="mt-2 text-sm text-[#94a3b8]">
      <span>Applied: {formatDate(job.dateApplied || job.date)}</span>
      {job.industry && (
        <span className="ml-4 px-2 py-1 bg-[#334155] rounded-full text-xs">{job.industry}</span>
      )}
      <span className="ml-4 px-2 py-1 bg-[#3b82f6] rounded-full text-xs text-white">{job.platform}</span>
    </div>
  </div>
)

export default function Watchlist() {
  const [watchlistedJobs, setWatchlistedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const toggleWatchlist = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isWatchlisted: false
        })
      });
      
      if (response.ok) {
        setWatchlistedJobs(watchlistedJobs.filter(job => job._id !== jobId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  useEffect(() => {
    const fetchWatchlistedJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs')
        const data = await response.json()
        const allJobs = [...data.savedJobs, ...data.emailApplications]
        const watchlisted = allJobs.filter(job => job.isWatchlisted)
        setWatchlistedJobs(watchlisted)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching watchlisted jobs:', error)
        setLoading(false)
      }
    }

    fetchWatchlistedJobs()

    // Listen for watchlist updates
    const handleWatchlistUpdate = (event) => {
      const { jobId, isWatchlisted } = event.detail;
      if (isWatchlisted) {
        // Fetch the updated job data
        fetch('http://localhost:5000/api/jobs')
          .then(res => res.json())
          .then(data => {
            const allJobs = [...data.savedJobs, ...data.emailApplications];
            const updatedJob = allJobs.find(job => job._id === jobId);
            if (updatedJob) {
              setWatchlistedJobs(prev => [...prev, updatedJob]);
            }
          });
      } else {
        setWatchlistedJobs(prev => prev.filter(job => job._id !== jobId));
      }
    };

    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
  }, []);

  if (loading) {
    return (
      <div className="w-full md:w-2/5 md:sticky md:top-4 self-start animate-pulse">
        <h2 className="text-2xl font-bold mb-4">Watchlist</h2>
        <div className="space-y-4">
          <div className="h-24 bg-[#1e293b] rounded-lg"></div>
          <div className="h-24 bg-[#1e293b] rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-2/5 md:sticky md:top-4 self-start">
      <h2 className="text-2xl font-bold mb-4">Watchlist</h2>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {watchlistedJobs.length > 0 ? (
          watchlistedJobs.map((job) => (
            <WatchlistCard 
              key={job._id} 
              job={job} 
              onToggleWatchlist={toggleWatchlist}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Star size={48} className="mx-auto mb-4 text-[#94a3b8]" />
            <p className="text-[#94a3b8]">Your watchlist is empty</p>
          </div>
        )}
      </div>
    </div>
  )
}

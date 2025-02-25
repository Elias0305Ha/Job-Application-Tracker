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
  <div className="group bg-[#1e293b] p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-[#1e293b]/80 mb-6">
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
      </div>
      <button 
        className="ml-4 p-2 rounded-full hover:bg-[#334155] transition-colors duration-300"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🖱️ Star button clicked for job:', job._id);
          onToggleWatchlist(job._id);
        }}
      >
        <Star size={24} className="text-[#eab308] fill-[#eab308] transition-transform duration-300 hover:scale-110" />
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
    console.log('🔍 Watchlist - Toggle clicked for job:', jobId);
    try {
      const currentJob = watchlistedJobs.find(job => job._id === jobId);
      if (!currentJob) {
        console.error('❌ Job not found:', jobId);
        return;
      }

      console.log('📦 Current job:', currentJob);

      // Update local state first for immediate feedback
      setWatchlistedJobs(prev => prev.filter(job => job._id !== jobId));

      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isWatchlisted: false
        })
      });
      
      console.log('🌐 API Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response data:', data);

        // Dispatch event after successful API call
        window.dispatchEvent(new CustomEvent('watchlist-update', {
          detail: { jobId, isWatchlisted: false }
        }));
      } else {
        console.error('❌ API Error:', await response.text());
        // Revert the state if API call failed
        setWatchlistedJobs(prev => [...prev, currentJob]);
      }
    } catch (error) {
      console.error('❌ Error removing from watchlist:', error);
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

    // Listen for watchlist updates with the new event name
    const handleWatchlistUpdate = (event) => {
      const { jobId, isWatchlisted } = event.detail;
      
      if (isWatchlisted) {
        // If job is being added to watchlist, fetch it
        fetch('http://localhost:5000/api/jobs')
          .then(res => res.json())
          .then(data => {
            const allJobs = [...data.savedJobs, ...data.emailApplications];
            const updatedJob = allJobs.find(job => job._id === jobId);
            if (updatedJob && updatedJob.isWatchlisted) {
              setWatchlistedJobs(prev => [...prev, updatedJob]);
            }
          })
          .catch(error => console.error('Error fetching updated job:', error));
      } else {
        // If job is being removed from watchlist, remove it from state
        setWatchlistedJobs(prev => prev.filter(job => job._id !== jobId));
      }
    };

    window.addEventListener('watchlist-update', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-update', handleWatchlistUpdate);
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

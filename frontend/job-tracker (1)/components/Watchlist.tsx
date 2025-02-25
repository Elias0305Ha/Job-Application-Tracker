"use client"

import { Star } from "lucide-react"

const WatchlistCard = ({ job }) => (
  <div className="bg-[#1e293b] p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 mb-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">{job.company}</h3>
        <p className="text-[#94a3b8]">{job.position}</p>
      </div>
      <button className="text-[#eab308] hover:text-[#ca8a04]">
        <Star size={20} fill="#eab308" />
      </button>
    </div>
    <div className="mt-2 text-sm text-[#94a3b8]">
      <span>Added: {job.date}</span>
    </div>
  </div>
)

export default function Watchlist() {
  const watchlistedJobs = [
    { company: "InnovateTech", position: "Full Stack Developer", date: "2023-05-18" },
    { company: "AI Solutions", position: "Machine Learning Engineer", date: "2023-05-16" },
    // Add more watchlisted job objects as needed
  ]

  return (
    <div className="w-full md:w-2/5 md:sticky md:top-4 self-start">
      <h2 className="text-2xl font-bold mb-4">Watchlist</h2>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {watchlistedJobs.length > 0 ? (
          watchlistedJobs.map((job, index) => <WatchlistCard key={index} job={job} />)
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


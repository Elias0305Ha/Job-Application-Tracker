"use client"

import { useState } from "react"
import { Search, Star } from "lucide-react"

const JobCard = ({ job }) => (
  <div className="bg-[#1e293b] p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 mb-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">{job.company}</h3>
        <p className="text-[#94a3b8]">{job.position}</p>
      </div>
      <div className="flex items-center">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === "Applied"
              ? "bg-[#3b82f6] text-white"
              : job.status === "Interview"
                ? "bg-[#eab308] text-black"
                : "bg-[#22c55e] text-white"
          }`}
        >
          {job.status}
        </span>
        <button className="ml-2 text-[#3b82f6] hover:text-[#2563eb]">
          <Star size={20} />
        </button>
      </div>
    </div>
    <div className="mt-2 text-sm text-[#94a3b8]">
      <span>Applied: {job.date}</span>
      <span className="ml-4 px-2 py-1 bg-[#3b82f6] rounded-full text-xs text-white">{job.platform}</span>
    </div>
  </div>
)

export default function ActiveApplications() {
  const [searchTerm, setSearchTerm] = useState("")
  const [industry, setIndustry] = useState("All")
  const [sortBy, setSortBy] = useState("Date")

  const jobs = [
    {
      company: "TechCorp",
      position: "Frontend Developer",
      status: "Applied",
      date: "2023-05-15",
      platform: "LinkedIn",
    },
    { company: "DataSystems", position: "Data Analyst", status: "Interview", date: "2023-05-10", platform: "Indeed" },
    {
      company: "CloudNine",
      position: "DevOps Engineer",
      status: "Offer",
      date: "2023-05-05",
      platform: "Company Website",
    },
    // Add more job objects as needed
  ]

  return (
    <div className="w-full md:w-3/5">
      <h2 className="text-2xl font-bold mb-4">Active Applications</h2>
      <div className="mb-4 flex gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full bg-[#1e293b] text-white p-2 pl-10 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-[#94a3b8]" size={20} />
        </div>
        <select
          className="bg-[#1e293b] text-white p-2 rounded-lg"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option>All Industries</option>
          <option>Tech</option>
          <option>Finance</option>
          <option>Healthcare</option>
        </select>
        <select
          className="bg-[#1e293b] text-white p-2 rounded-lg"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option>Sort by Date</option>
          <option>Sort by Company</option>
          <option>Sort by Status</option>
        </select>
      </div>
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </div>
  )
}


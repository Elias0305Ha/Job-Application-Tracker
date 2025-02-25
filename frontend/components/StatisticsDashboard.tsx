"use client"

import { useState, useEffect } from "react"
import { Star, Clock, Calendar, TrendingUp } from "lucide-react"

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-[#94a3b8]">{title}</h3>
      <Icon className="text-[#3b82f6]" size={24} />
    </div>
    <div className="text-4xl font-bold mb-2">{value}</div>
    <p className="text-sm text-[#94a3b8]">{subtitle}</p>
  </div>
)

export default function StatisticsDashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviewRate: 0,
    acceptanceRate: 0,
    watchlistCount: 0,
    responseRate: 0,
    averageResponseTime: 0,
    weeklyApplications: 0,
    successRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs')
        const data = await response.json()
        
        const allJobs = [...data.savedJobs, ...data.emailApplications]
        const totalJobs = allJobs.length
        const interviewJobs = allJobs.filter(job => job.status === "Interview").length
        const acceptedJobs = allJobs.filter(job => job.status === "Offer").length
        const watchlistJobs = allJobs.filter(job => job.isWatchlisted).length
        const respondedJobs = allJobs.filter(job => job.status !== "Applied").length
        
        // Calculate weekly applications
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weeklyJobs = allJobs.filter(job => new Date(job.dateApplied) > oneWeekAgo).length

        setStats({
          totalApplications: totalJobs,
          interviewRate: totalJobs ? Math.round((interviewJobs / totalJobs) * 100) : 0,
          acceptanceRate: totalJobs ? Math.round((acceptedJobs / totalJobs) * 100) : 0,
          watchlistCount: watchlistJobs,
          responseRate: totalJobs ? Math.round((respondedJobs / totalJobs) * 100) : 0,
          averageResponseTime: 5, // This would need additional date calculations
          weeklyApplications: weeklyJobs,
          successRate: totalJobs ? Math.round((acceptedJobs / respondedJobs) * 100) : 0,
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching statistics:', error)
        setLoading(false)
      }
    }

    fetchStats()

    // Listen for watchlist updates to refresh stats
    const handleWatchlistUpdate = () => {
      fetchStats()
    }

    window.addEventListener('watchlistUpdated', handleWatchlistUpdate)
    return () => window.removeEventListener('watchlistUpdated', handleWatchlistUpdate)
  }, [])

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 animate-pulse">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      <StatCard
        title="Total Applications"
        value={stats.totalApplications}
        subtitle="Total job applications submitted"
        icon={Calendar}
      />
      <StatCard
        title="Interview Rate"
        value={`${stats.interviewRate}%`}
        subtitle="Applications that led to interviews"
        icon={TrendingUp}
      />
      <StatCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        subtitle="Applications with responses"
        icon={Clock}
      />
      <StatCard
        title="Success Rate"
        value={`${stats.successRate}%`}
        subtitle="Interviews that led to offers"
        icon={Star}
      />
      <StatCard
        title="Weekly Applications"
        value={stats.weeklyApplications}
        subtitle="Applications in the last 7 days"
        icon={Calendar}
      />
      <StatCard
        title="Watchlist"
        value={stats.watchlistCount}
        subtitle="Jobs in your watchlist"
        icon={Star}
      />
      <StatCard
        title="Average Response Time"
        value={`${stats.averageResponseTime} days`}
        subtitle="Average time to get a response"
        icon={Clock}
      />
      <StatCard
        title="Acceptance Rate"
        value={`${stats.acceptanceRate}%`}
        subtitle="Applications that led to offers"
        icon={TrendingUp}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
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

  useEffect(() => {
    // Simulating data fetch
    setTimeout(() => {
      setStats({
        totalApplications: 150,
        interviewRate: 25,
        acceptanceRate: 10,
        watchlistCount: 30,
        responseRate: 60,
        averageResponseTime: 5,
        weeklyApplications: 12,
        successRate: 40,
      })
    }, 1000)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      <StatCard
        title="Total Applications"
        value={stats.totalApplications}
        subtitle="Total jobs applied"
        icon={TrendingUp}
      />
      <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <h3 className="text-lg font-semibold text-[#94a3b8] mb-4">Interview Rate</h3>
        <div className="w-32 h-32 mx-auto">
          <CircularProgressbar
            value={stats.interviewRate}
            text={`${stats.interviewRate}%`}
            styles={buildStyles({
              textColor: "#f8fafc",
              pathColor: stats.interviewRate < 10 ? "#ef4444" : stats.interviewRate < 20 ? "#eab308" : "#22c55e",
              trailColor: "#1e293b",
            })}
          />
        </div>
        <p className="text-sm text-[#94a3b8] mt-4 text-center">Application to interview rate</p>
      </div>
      <StatCard
        title="Acceptance Rate"
        value={`${stats.acceptanceRate}%`}
        subtitle="Application success rate"
        icon={TrendingUp}
      />
      <StatCard title="Watchlist Count" value={stats.watchlistCount} subtitle="Saved for later" icon={Star} />
      <StatCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        subtitle="Companies that responded"
        icon={TrendingUp}
      />
      <StatCard
        title="Average Response Time"
        value={`${stats.averageResponseTime} days`}
        subtitle="Days until first response"
        icon={Clock}
      />
      <StatCard
        title="Weekly Applications"
        value={stats.weeklyApplications}
        subtitle="Applications this week"
        icon={Calendar}
      />
      <StatCard
        title="Success Rate"
        value={`${stats.successRate}%`}
        subtitle="Interview to offer ratio"
        icon={TrendingUp}
      />
    </div>
  )
}


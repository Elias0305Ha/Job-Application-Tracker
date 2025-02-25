import Header from "@/components/Header"
import StatisticsDashboard from "@/components/StatisticsDashboard"
import ActiveApplications from "@/components/ActiveApplications"
import Watchlist from "@/components/Watchlist"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      <Header />
      <main className="container mx-auto px-4">
        <StatisticsDashboard />
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <ActiveApplications />
          <Watchlist />
        </div>
      </main>
    </div>
  )
}

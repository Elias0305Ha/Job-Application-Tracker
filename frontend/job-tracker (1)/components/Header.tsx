"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <header className="bg-[#1e293b] py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#3b82f6] animate-pulse">JobTracker</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full bg-[#3b82f6] text-white transition-all duration-300 hover:bg-[#2563eb]"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
    </header>
  )
}


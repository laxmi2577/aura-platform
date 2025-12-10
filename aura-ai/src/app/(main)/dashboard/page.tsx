"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { Activity, Heart, Music, Zap } from "lucide-react"

type MoodPoint = {
  date: string
  time: string
  score: number
}

const mockData = [
  { name: "Nature", count: 45 },
  { name: "Rain", count: 32 },
  { name: "Urban", count: 20 },
  { name: "Piano", count: 15 },
  { name: "Noise", count: 10 },
]

/**
 * Visual styling configuration.
 * Defines gradient definitions for chart visualization layers.
 */
const GRADIENTS = [
  "url(#goldGradient)",
  "url(#tealGradient)",
  "url(#purpleGradient)",
  "url(#goldGradient)",
  "url(#tealGradient)",
]

/**
 * Analytics Dashboard.
 * Visualizes user engagement metrics and mood tracking data.
 * Fetches historical sentiment data from Supabase for longitudinal analysis.
 */
export default function DashboardPage() {
  const [moodData, setMoodData] = useState<MoodPoint[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchMoods() {
      const { data, error } = await supabase
        .from("user_moods")
        .select("created_at, mood_score")
        .order("created_at", { ascending: true })
        .limit(20)

      if (error) {
        console.error("Error fetching moods:", error)
        return
      }

      if (data) {
        const formatted: MoodPoint[] = data.map((d: any) => ({
          date: new Date(d.created_at).toLocaleDateString(),
          time: new Date(d.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          score: d.mood_score,
        }))
        setMoodData(formatted)
      }
    }

    fetchMoods()
  }, [supabase])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 p-1.5">
            <Zap className="w-5 h-5 text-amber-400" />
          </span>
          Your Insights
        </h1>
        <p className="text-muted-foreground">
          Visualize your relaxation patterns and how your mood evolves over time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 border border-white/5 rounded-xl bg-card/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-400 border border-amber-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Focus Time
              </p>
              <h3 className="text-2xl font-bold text-foreground">12h 45m</h3>
            </div>
          </div>
        </div>

        <div className="p-6 border border-white/5 rounded-xl bg-card/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Favorite Vibe
              </p>
              <h3 className="text-2xl font-bold text-foreground">Nature</h3>
            </div>
          </div>
        </div>

        <div className="p-6 border border-white/5 rounded-xl bg-card/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-full text-violet-400 border border-violet-500/20">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sounds Explored
              </p>
              <h3 className="text-2xl font-bold text-foreground">24</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 border border-white/5 rounded-xl bg-card/30 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-semibold mb-2">Top Categories</h3>
        <p className="text-sm text-muted-foreground mb-8">
          Your most engaged soundscapes based on listening duration.
        </p>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={14}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis
                stroke="#888"
                fontSize={14}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
                dx={-10}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
                itemStyle={{ color: "#fff" }}
              />

              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                {mockData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GRADIENTS[index % GRADIENTS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-8 border border-white/5 rounded-xl bg-card/30 shadow-xl backdrop-blur-md">
        <div className="mb-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Mood History</h3>
          <p className="text-sm text-muted-foreground">
            Sentiment analysis of your recent conversations with the digital assistant.
          </p>
        </div>

        <div className="h-[320px] w-full">
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[-1, 1]}
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                  formatter={(value: any) => [value.toFixed(2), "Mood Score"]}
                  labelFormatter={(label) => {
                    const point = moodData.find((m) => m.time === label)
                    return point ? `${point.date} • ${point.time}` : label
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#8b5cf6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No mood data yet. Chat with the digital assistant to start tracking your emotional journey.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

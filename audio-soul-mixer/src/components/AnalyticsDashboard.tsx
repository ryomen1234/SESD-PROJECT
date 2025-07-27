import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Realistic music data simulation
const generateTrendsData = () => [
  { month: 'Jan', plays: 15420, likes: 3890, recommendations: 1240, shares: 890 },
  { month: 'Feb', plays: 18340, likes: 4520, recommendations: 1560, shares: 1120 },
  { month: 'Mar', plays: 22150, likes: 5680, recommendations: 1890, shares: 1450 },
  { month: 'Apr', plays: 19780, likes: 4920, recommendations: 1670, shares: 1280 },
  { month: 'May', plays: 24890, likes: 6340, recommendations: 2140, shares: 1690 },
  { month: 'Jun', plays: 27230, likes: 7120, recommendations: 2380, shares: 1890 }
];

const moodDistribution = [
  { name: 'Chill', value: 35, color: '#6366f1', emoji: '😌' },
  { name: 'Party', value: 25, color: '#f59e0b', emoji: '🎉' },
  { name: 'Focus', value: 20, color: '#10b981', emoji: '🎯' },
  { name: 'Workout', value: 15, color: '#ef4444', emoji: '💪' },
  { name: 'Sad', value: 5, color: '#8b5cf6', emoji: '😢' }
];

const genrePopularity = [
  { genre: 'Hip Hop', popularity: 92, change: '+15%', color: '#f59e0b' },
  { genre: 'Pop', popularity: 85, change: '+8%', color: '#6366f1' },
  { genre: 'Rock', popularity: 78, change: '+12%', color: '#ef4444' },
  { genre: 'Electronic', popularity: 67, change: '+22%', color: '#10b981' },
  { genre: 'Jazz', popularity: 45, change: '+5%', color: '#8b5cf6' },
  { genre: 'Classical', popularity: 38, change: '+3%', color: '#06b6d4' }
];

const realTimeData = [
  { time: '00:00', listeners: 1200, plays: 340 },
  { time: '04:00', listeners: 800, plays: 220 },
  { time: '08:00', listeners: 1800, plays: 480 },
  { time: '12:00', listeners: 2400, plays: 650 },
  { time: '16:00', listeners: 3200, plays: 820 },
  { time: '20:00', listeners: 2800, plays: 720 },
  { time: '24:00', listeners: 1600, plays: 420 }
];

const topArtists = [
  { name: 'Arctic Monkeys', plays: '847K', rating: 4.8 },
  { name: 'Billie Eilish', plays: '723K', rating: 4.7 },
  { name: 'Kendrick Lamar', plays: '692K', rating: 4.9 },
  { name: 'Tame Impala', plays: '634K', rating: 4.6 },
  { name: 'The Strokes', plays: '578K', rating: 4.5 }
];

// Advanced Custom Tooltip with Glassmorphism
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-white shadow-2xl"
      >
        <p className="font-bold text-lg mb-2 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <motion.p 
            key={index} 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm font-medium" 
            style={{ color: entry.color }}
          >
            {`${entry.dataKey}: ${Number(entry.value).toLocaleString()}`}
          </motion.p>
        ))}
      </motion.div>
    );
  }
  return null;
};



const AnalyticsDashboard: React.FC = () => {
  const musicTrendsData = generateTrendsData();

  // Realistic music platform metrics
  const metrics = [
    { label: 'Total Plays', value: '847K', change: '+12%', icon: '🎵', color: 'from-blue-500 to-blue-600' },
    { label: 'Active Users', value: '2.3K', change: '+8%', icon: '👥', color: 'from-green-500 to-green-600' },
            { label: 'Total Likes', value: '156K', change: '+15%', icon: '👍', color: 'from-red-500 to-red-600' },
    { label: 'Avg. Rating', value: '4.7', change: '+0.2', icon: '⭐', color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="relative w-full space-y-8 p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">      
      {/* Professional Header */}
      <motion.div 
        className="text-center space-y-4 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Music Analytics Dashboard
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Track your music performance and user engagement
        </motion.p>
      </motion.div>

             {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.5 
            }}
            whileHover={{ 
              scale: 1.02, 
              y: -2,
              transition: { duration: 0.2 }
            }}
          >
            <Card className={`bg-gradient-to-br ${metric.color}/10 border-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">
                    {metric.icon}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 font-medium">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-green-400 bg-green-400/10">
                      {metric.change}
                    </Badge>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Music Engagement Trends */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="xl:col-span-2"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                📈 Music Engagement Trends
              </CardTitle>
              <CardDescription className="text-gray-300">
                Monthly plays, likes, recommendations, and shares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={musicTrendsData}>
                  <defs>
                    <linearGradient id="playsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="plays"
                    stroke="#6366f1"
                    fill="url(#playsGradient)"
                    strokeWidth={2}
                    name="Plays"
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Likes"
                  />
                  <Line
                    type="monotone"
                    dataKey="recommendations"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Recommendations"
                  />
                  <Bar dataKey="shares" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Shares" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                😌 Mood Analytics
              </CardTitle>
              <CardDescription>User preferences by mood</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {moodDistribution.map((mood, index) => (
                  <motion.div
                    key={mood.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mood.emoji}</span>
                      <span className="text-white font-medium">{mood.name}</span>
                    </div>
                    <Badge style={{ backgroundColor: mood.color }} className="text-white">
                      {mood.value}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Genre Popularity with Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="xl:col-span-2"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                🎯 Genre Popularity Rankings
              </CardTitle>
              <CardDescription>Top performing genres with growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {genrePopularity.map((genre, index) => (
                  <motion.div
                    key={genre.genre}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-bold text-lg">{genre.genre}</h3>
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: genre.color }} className="text-white">
                            {genre.change}
                          </Badge>
                          <span className="text-white font-bold">{genre.popularity}%</span>
                        </div>
                      </div>
                      <motion.div
                        className="w-full bg-gray-700 rounded-full h-3 overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1.5 + index * 0.1, duration: 0.8 }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: genre.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${genre.popularity}%` }}
                          transition={{ delay: 1.7 + index * 0.1, duration: 1, ease: "easeOut" }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Artists Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                🏆 Top Artists
              </CardTitle>
              <CardDescription>Most played artists this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topArtists.map((artist, index) => (
                  <motion.div
                    key={artist.name}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{artist.name}</p>
                      <p className="text-gray-400 text-sm">{artist.plays} plays</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white font-medium">{artist.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Real-time Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <Card className="bg-black/40 border-white/10 backdrop-blur-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              ⚡ Real-time Activity
            </CardTitle>
            <CardDescription>Live user activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="listeners"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard; 
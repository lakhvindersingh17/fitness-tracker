"use client";

import { useLiveQuery } from "@/lib/db";
import { db } from "@/lib/db";
import { BottomNav } from "@/components/BottomNav";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrendsPage() {
  const logs = useLiveQuery(() => db.logs.toArray());
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  // Aggregate data for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayLogs = logs?.filter(l => l.date === date) || [];
    const foodLogs = dayLogs.filter(l => l.type === 'food');
    const workoutLogs = dayLogs.filter(l => l.type === 'workout');

    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      date,
      caloriesEaten: foodLogs.reduce((acc, l) => acc + (l.calories || 0), 0),
      caloriesBurned: workoutLogs.reduce((acc, l) => acc + (l.calories || 0), 0),
      protein: foodLogs.reduce((acc, l) => acc + (l.protein || 0), 0),
      carbs: foodLogs.reduce((acc, l) => acc + (l.carbs || 0), 0),
      fat: foodLogs.reduce((acc, l) => acc + (l.fat || 0), 0),
      duration: workoutLogs.reduce((acc, l) => acc + (l.duration || 0), 0),
    };
  });

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      <header className="p-4 flex items-center border-b border-slate-800 bg-[#0A0C10]">
        <Button variant="ghost" size="icon" onClick={() => window.location.href='/'}>
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-white">Weekly Trends</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto pb-24 space-y-8">
        
        {/* Calories Trend */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5">
           <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Net Calories vs Goal</h3>
           <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                       itemStyle={{ color: '#f8fafc' }}
                    />
                    <Line type="monotone" dataKey="caloriesEaten" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Eaten (kcal)" />
                    <Line type="monotone" dataKey="caloriesBurned" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Burned (kcal)" />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Macros Breakdown */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5">
           <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Macronutrients</h3>
           <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} barGap={0} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <Tooltip 
                       cursor={{fill: '#1e293b', opacity: 0.4}}
                       contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Bar dataKey="protein" stackId="a" fill="#3b82f6" name="Protein (g)" radius={[0,0,4,4]} />
                    <Bar dataKey="carbs" stackId="a" fill="#10b981" name="Carbs (g)" />
                    <Bar dataKey="fat" stackId="a" fill="#f59e0b" name="Fat (g)" radius={[4,4,0,0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Workout Activity */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5">
           <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Active Minutes</h3>
           <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <Tooltip 
                       cursor={{fill: '#1e293b', opacity: 0.4}}
                       contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Bar dataKey="duration" fill="#f97316" name="Duration (min)" radius={[4,4,0,0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>

      <BottomNav activeTab="trends" />
    </div>
  );
}

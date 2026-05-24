"use client";

import React, { useState, useEffect } from "react";
import { useLiveQuery } from "@/lib/db";
import { db } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple, Flame } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDate } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'diet' | 'activity'>('home');
  const today = formatDate(new Date());

  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const todayLogs = useLiveQuery(() => db.logs.where('date').equals(today).toArray());

  // Initialization
  useEffect(() => {
    async function initSettings() {
      const count = await db.settings.count();
      if (count === 0) {
        await db.settings.add({
          dailyCalorieGoal: 2000,
          dailyProteinGoal: 150,
          dailyCarbGoal: 200,
          dailyFatGoal: 65,
          planStartDate: today,
        });
      }
    }
    initSettings();
  }, [today]);

  const caloriesEaten = todayLogs?.filter(l => l.type === 'food').reduce((acc, l) => acc + (l.calories || 0), 0) || 0;
  const caloriesBurned = todayLogs?.filter(l => l.type === 'workout').reduce((acc, l) => acc + (l.calories || 0), 0) || 0;
  
  const protein = todayLogs?.filter(l => l.type === 'food').reduce((acc, l) => acc + (l.protein || 0), 0) || 0;
  const carbs = todayLogs?.filter(l => l.type === 'food').reduce((acc, l) => acc + (l.carbs || 0), 0) || 0;
  const fat = todayLogs?.filter(l => l.type === 'food').reduce((acc, l) => acc + (l.fat || 0), 0) || 0;

  const latestActivity = todayLogs?.filter(l => l.type === 'activity_summary').sort((a,b) => b.timestamp - a.timestamp)[0];
  const steps = latestActivity?.steps || 0;
  const move = latestActivity?.move || 0;
  const activeCaloriesSummary = latestActivity?.activeCalories || 0;

  const [motivation, setMotivation] = useState<string>('');
  const [isFetchingMotiv, setIsFetchingMotiv] = useState(false);

  const fetchMotivation = async () => {
    if (!settings) return;
    setIsFetchingMotiv(true);
    try {
      const sDate = new Date(settings.planStartDate);
      const tDate = new Date(today);
      const diffTime = Math.abs(tDate.getTime() - sDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const res = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfPlan: diffDays,
          caloriesEaten,
          calorieGoal: settings.dailyCalorieGoal,
          caloriesBurned,
          macros: { protein, carbs, fat }
        })
      });
      const data = await res.json();
      if (data.message) setMotivation(data.message);
    } catch(e) {
      console.error(e);
    } finally {
      setIsFetchingMotiv(false);
    }
  };

  // Poll Apple Watch queue
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/apple-watch');
        const { data } = await res.json();
        if (data && data.length > 0) {
           for (const item of data) {
             await db.logs.add({
               date: new Date(item.timestamp).toISOString().split('T')[0],
               type: item.type || 'workout',
               name: item.name || 'Apple Watch Sync',
               calories: item.calories || 0,
               duration: item.duration || 0,
               steps: item.steps || 0,
               move: item.move || 0,
               activeCalories: item.activeCalories || 0,
               source: 'apple_watch',
               timestamp: item.timestamp,
             });
           }
        }
      } catch (e) {
        console.error(e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getDayOfPlan = () => {
    if (!settings) return 1;
    const sDate = new Date(settings.planStartDate);
    const tDate = new Date(today);
    return Math.ceil(Math.abs(tDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Morning, {auth.currentUser?.displayName?.split(' ')[0] || 'User'}</h1>
            <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">Day {getDayOfPlan()} of 100 Diet Challenge</p>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchMotivation} disabled={isFetchingMotiv} className="rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700">
             <Flame className="w-5 h-5 text-orange-400" />
          </Button>
        </header>

        {motivation && (
          <div className="mb-6 p-5 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">Coach Pulse</p>
            <p className="text-sm font-medium text-white leading-relaxed">&quot;{motivation}&quot;</p>
          </div>
        )}

        {/* Ring / Summary */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800 rounded-3xl col-span-2 sm:col-span-1">
             <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Remaining</div>
                <div className="text-3xl font-bold text-white mb-2">{(settings?.dailyCalorieGoal || 2000) - caloriesEaten + caloriesBurned}</div>
                <div className="flex space-x-2 text-[10px] uppercase font-bold tracking-tighter">
                  <span className="text-emerald-400">-{caloriesEaten}</span>
                  <span className="text-rose-400">+{caloriesBurned}</span>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 rounded-3xl col-span-2 sm:col-span-1">
             <CardContent className="p-4 flex flex-col items-center h-full space-y-3 justify-center">
                <div className="w-full flex justify-between items-center text-xs font-semibold">
                   <span className="text-rose-400 uppercase">Move</span>
                   <span className="text-white">{move} kcal</span>
                </div>
                <div className="w-full flex justify-between items-center text-xs font-semibold">
                   <span className="text-emerald-400 uppercase">Steps</span>
                   <span className="text-white">{steps}</span>
                </div>
                <div className="w-full flex justify-between items-center text-xs font-semibold">
                   <span className="text-cyan-400 uppercase">Active</span>
                   <span className="text-white">{activeCaloriesSummary} kcal</span>
                </div>
             </CardContent>
          </Card>

          <div className="space-y-4 col-span-2">
             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-xs text-slate-400 uppercase font-semibold">Protein</span>
                 <span className="text-sm font-semibold text-white">{protein}g</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.min(100, (protein / (settings?.dailyProteinGoal || 150)) * 100)}%`}} />
               </div>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-xs text-slate-400 uppercase font-semibold">Carbs</span>
                 <span className="text-sm font-semibold text-white">{carbs}g</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 rounded-full" style={{width: `${Math.min(100, (carbs / (settings?.dailyCarbGoal || 200)) * 100)}%`}} />
               </div>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-xs text-slate-400 uppercase font-semibold">Fat</span>
                 <span className="text-sm font-semibold text-white">{fat}g</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 rounded-full" style={{width: `${Math.min(100, (fat / (settings?.dailyFatGoal || 65)) * 100)}%`}} />
               </div>
             </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Recent Log</h2>
        <div className="space-y-4">
          {todayLogs?.map(log => (
            <div key={log.id} className="flex items-center space-x-3 p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.type === 'food' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {log.type === 'food' ? <Apple className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">{log.name}</p>
                {log.type === 'food' && (
                  <p className="text-[10px] text-slate-500">P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g</p>
                )}
                {log.type === 'workout' && (
                  <p className="text-[10px] text-slate-500">{log.duration} min {log.source === 'apple_watch' ? '• ⌚️' : ''}</p>
                )}
                {log.type === 'activity_summary' && (
                  <p className="text-[10px] text-slate-500">Steps: {log.steps} • Move: {log.move} {log.source === 'apple_watch' ? '• ⌚️' : ''}</p>
                )}
              </div>
              <div className="text-right">
                <p className={`font-semibold text-xs ${log.type === 'workout' || log.type === 'activity_summary' ? 'text-orange-400' : 'text-slate-200'}`}>
                  {log.type === 'food' ? '+' : '-'}{log.calories || 0}
                </p>
                <p className="text-[9px] text-slate-500 uppercase font-bold">kcal</p>
              </div>
            </div>
          ))}
          {(!todayLogs || todayLogs.length === 0) && (
            <div className="text-center p-6 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">
              No entries today yet.
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
}

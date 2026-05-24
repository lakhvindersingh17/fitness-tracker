"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ScanLine, BarChart2, Save, ChevronLeft, Apple, Flame, Info } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";

export default function WorkoutPage() {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    duration: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.logs.add({
        date: formatDate(new Date()),
        type: 'workout',
        name: formData.name || 'Workout',
        calories: Number(formData.calories) || 0,
        duration: Number(formData.duration) || 0,
        source: 'manual',
        timestamp: Date.now(),
      });
      window.location.href = '/';
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      <header className="p-4 flex items-center border-b border-slate-800 bg-[#0A0C10]">
        <Button variant="ghost" size="icon" onClick={() => window.location.href='/'}>
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-white">Log Workout</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto pb-24 space-y-8">
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400">Activity Type</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Running, Cycling..." required className="border-slate-800 bg-slate-900/50 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="duration" className="text-slate-400">Duration (min)</Label>
                 <Input id="duration" type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="0" required className="border-slate-800 bg-slate-900/50 text-white" />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="calories" className="text-slate-400">Active Calories</Label>
                 <Input id="calories" type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} placeholder="0" required className="border-slate-800 bg-slate-900/50 text-white" />
               </div>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white h-12 shadow-lg shadow-emerald-500/20">
            <Save className="w-4 h-4 mr-2" /> Save Activity
          </Button>
        </form>

        {/* Info card for Apple Watch */}
        <Card className="bg-slate-900/50 border-slate-800 rounded-3xl">
           <CardContent className="p-5 space-y-3">
              <div className="flex items-center space-x-2 text-white">
                 <Apple className="w-5 h-5 text-emerald-400" />
                 <h3 className="font-bold text-sm tracking-tight uppercase">Apple Watch / Health Sync</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 Use the iOS Shortcuts app to automatically sync your Activity data (Move, Steps, Active Calories) or Workouts. Use the &quot;Get Contents of URL&quot; action (POST method) to send data to your app. 
              </p>
              <div className="bg-[#0A0C10] border border-slate-800 rounded-xl p-3 overflow-hidden text-[10px] sm:text-xs font-mono text-slate-500 whitespace-pre">
                 POST /api/apple-watch
                 <br/><br/>
                 {`// Example: Activity Summary\n{"type":"activity_summary", "calories": 0, "move":400, "steps":5000, "activeCalories":400}\n\n// Example: Workout\n{"type":"workout", "calories":300, "duration":30}`}
              </div>
           </CardContent>
        </Card>

      </div>

      <BottomNav activeTab="log" />
    </div>
  );
}

"use client";

import { useLiveQuery } from "@/lib/db";
import { db } from "@/lib/db";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  
  const [formData, setFormData] = useState({
    dailyCalorieGoal: '',
    dailyProteinGoal: '',
    dailyCarbGoal: '',
    dailyFatGoal: '',
    weight: '',
    height: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        dailyCalorieGoal: String(settings.dailyCalorieGoal || 2000),
        dailyProteinGoal: String(settings.dailyProteinGoal || 150),
        dailyCarbGoal: String(settings.dailyCarbGoal || 200),
        dailyFatGoal: String(settings.dailyFatGoal || 65),
        weight: String(settings.weight || ''),
        height: String(settings.height || ''),
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings && settings.id) {
      await db.settings.update(settings.id, {
        dailyCalorieGoal: Number(formData.dailyCalorieGoal),
        dailyProteinGoal: Number(formData.dailyProteinGoal),
        dailyCarbGoal: Number(formData.dailyCarbGoal),
        dailyFatGoal: Number(formData.dailyFatGoal),
        weight: Number(formData.weight) || undefined,
        height: Number(formData.height) || undefined,
      });
      alert('Profile updated successfully!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      <header className="p-4 flex items-center border-b border-slate-800 bg-[#0A0C10]">
        <Button variant="ghost" size="icon" onClick={() => window.location.href='/'}>
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-white">My Profile</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto pb-24 space-y-6">
        
        <form onSubmit={handleSave} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-slate-400">Weight (kg)</Label>
                <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 75" className="border-slate-800 bg-slate-900/50 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-slate-400">Height (cm)</Label>
                <Input id="height" type="number" step="1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 180" className="border-slate-800 bg-slate-900/50 text-white" />
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4 text-white">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Daily Goals</h3>
              
              <div className="space-y-2">
                <Label htmlFor="dailyCalorieGoal" className="text-slate-400">Calories (kcal)</Label>
                <Input id="dailyCalorieGoal" type="number" value={formData.dailyCalorieGoal} onChange={e => setFormData({...formData, dailyCalorieGoal: e.target.value})} required className="border-slate-800 bg-[#0A0C10]" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <div className="space-y-2">
                   <Label htmlFor="dailyProteinGoal" className="text-slate-400 text-xs">Protein (g)</Label>
                   <Input id="dailyProteinGoal" type="number" value={formData.dailyProteinGoal} onChange={e => setFormData({...formData, dailyProteinGoal: e.target.value})} required className="border-slate-800 bg-[#0A0C10]" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="dailyCarbGoal" className="text-slate-400 text-xs">Carbs (g)</Label>
                   <Input id="dailyCarbGoal" type="number" value={formData.dailyCarbGoal} onChange={e => setFormData({...formData, dailyCarbGoal: e.target.value})} required className="border-slate-800 bg-[#0A0C10]" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="dailyFatGoal" className="text-slate-400 text-xs">Fat (g)</Label>
                   <Input id="dailyFatGoal" type="number" value={formData.dailyFatGoal} onChange={e => setFormData({...formData, dailyFatGoal: e.target.value})} required className="border-slate-800 bg-[#0A0C10]" />
                 </div>
              </div>
           </div>

           <Button type="submit" className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white h-12 shadow-lg shadow-indigo-500/20">
             <Save className="w-4 h-4 mr-2" /> Save Profile
           </Button>
        </form>

      </div>

      <BottomNav activeTab="me" />
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Apple, BarChart2, ScanLine, Camera, Loader2, Save, ChevronLeft, Barcode } from "lucide-react";
import Webcam from "react-webcam";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";

export default function DietPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    
    setIsCapturing(false);
    setShowScanner(false);
    setAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageSrc }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setFormData({
          name: data.name || '',
          calories: String(data.calories || ''),
          protein: String(data.protein || ''),
          carbs: String(data.carbs || ''),
          fat: String(data.fat || ''),
        });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  React.useEffect(() => {
    if (!showBarcodeScanner) return;
    
    // Slight delay to ensure DOM element is ready
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 10 }, false);
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setShowBarcodeScanner(false);
          setAnalyzing(true);
          try {
            const res = await fetch(`/api/lookup-barcode?barcode=${decodedText}`);
            const data = await res.json();
            if (data && !data.error) {
              setFormData({
                name: data.name || '',
                calories: String(data.calories || ''),
                protein: String(data.protein || ''),
                carbs: String(data.carbs || ''),
                fat: String(data.fat || ''),
              });
            } else {
               alert('Product not found in database');
            }
          } catch (e) {
            alert('Failed to lookup barcode');
          } finally {
            setAnalyzing(false);
          }
        },
        (err) => {}
      );
      
      return () => { 
        try { scanner.clear(); } catch(e){} 
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [showBarcodeScanner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.logs.add({
        date: formatDate(new Date()),
        type: 'food',
        name: formData.name || 'Unknown Food',
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fat: Number(formData.fat) || 0,
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
        <h1 className="text-xl font-bold ml-2 text-white">Log Food</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto pb-24">
        {showBarcodeScanner ? (
          <div className="w-full flex flex-col items-center">
            <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden mb-4 bg-white text-black"></div>
            <Button onClick={() => setShowBarcodeScanner(false)} variant="outline" className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700">Cancel</Button>
          </div>
        ) : showScanner ? (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden mb-4 border border-slate-800">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="flex space-x-4">
               <Button onClick={() => setShowScanner(false)} variant="outline" className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700">Cancel</Button>
               <Button onClick={capture} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                 <Camera className="w-4 h-4 mr-2" /> Capture AI Analysis
               </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-16 rounded-3xl border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 flex flex-col items-center justify-center p-2"
                onClick={() => { setShowBarcodeScanner(true); }}
                disabled={analyzing}
              >
                {analyzing ? (
                  <Loader2 className="w-6 h-6 mb-1 animate-spin text-indigo-400" />
                ) : (
                  <Barcode className="w-6 h-6 mb-1 text-indigo-400" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Scan Barcode</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-16 rounded-3xl border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 flex flex-col items-center justify-center p-2"
                onClick={() => { setShowScanner(true); setIsCapturing(true); }}
                disabled={analyzing}
              >
                {analyzing ? (
                  <Loader2 className="w-6 h-6 mb-1 animate-spin text-emerald-500" />
                ) : (
                  <Camera className="w-6 h-6 mb-1 text-emerald-500" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">AI Photo Log</span>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-400">Food Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Grilled Chicken Salad" required className="border-slate-800 bg-slate-900/50 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-slate-400">Calories (kcal)</Label>
                <Input id="calories" type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} placeholder="0" required className="border-slate-800 bg-slate-900/50 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                 <div className="space-y-2">
                   <Label htmlFor="protein" className="text-slate-400">Protein (g)</Label>
                   <Input id="protein" type="number" value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} placeholder="0" className="border-slate-800 bg-slate-900/50 text-white" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="carbs" className="text-slate-400">Carbs (g)</Label>
                   <Input id="carbs" type="number" value={formData.carbs} onChange={e => setFormData({...formData, carbs: e.target.value})} placeholder="0" className="border-slate-800 bg-slate-900/50 text-white" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="fat" className="text-slate-400">Fat (g)</Label>
                   <Input id="fat" type="number" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} placeholder="0" className="border-slate-800 bg-slate-900/50 text-white" />
                 </div>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white h-12 shadow-lg shadow-emerald-500/20" disabled={analyzing}>
              <Save className="w-4 h-4 mr-2" /> Save to Diary
            </Button>
          </form>
        )}
      </div>

      <BottomNav activeTab="add" />
    </div>
  );
}

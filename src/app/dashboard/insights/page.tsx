"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart2, PieChart, Activity, Info, Sparkles, LayoutGrid } from "lucide-react";

export default function InsightsPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDataset = async () => {
            try {
                const response = await fetch("/api/dataset");
                if (!response.ok) throw new Error("Failed to load dataset");
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDataset();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full"
            />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f5f3ff] flex flex-col items-center justify-center p-8">
            <h1 className="text-2xl font-black text-red-500 mb-4">Error loading insights</h1>
            <p className="text-[#64748b] mb-8">{error}</p>
            <button 
                onClick={() => router.back()}
                className="px-6 py-2 bg-[#a855f7] text-white rounded-full font-bold"
            >
                Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f3ff] text-[#1e1b4b] font-sans p-8">
            <main className="max-w-7xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-purple-600 font-bold mb-8 hover:translate-x-[-4px] transition-transform"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-black mb-4">ADHD <span className="text-[#a855f7]">Insights</span></h1>
                    <p className="text-xl text-[#64748b] max-w-2xl leading-relaxed">
                        Explore anonymized patterns and correlations from a research dataset containing {data?.summary?.totalRows.toLocaleString()} entries.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <InsightCard 
                        title="Total Records" 
                        value={data?.summary?.totalRows.toLocaleString()} 
                        icon={<Activity className="text-blue-500" />}
                        color="bg-blue-50"
                    />
                    <InsightCard 
                        title="Avg Focus Score" 
                        value={`${data?.summary?.averageFocusScore.toFixed(2)}`} 
                        icon={<Sparkles className="text-purple-500" />}
                        color="bg-purple-50"
                    />
                    <InsightCard 
                        title="Org Difficulty" 
                        value={`${data?.summary?.averageOrgDifficulty.toFixed(2)}`} 
                        icon={<LayoutGrid className="text-indigo-500" />}
                        color="bg-indigo-100"
                    />
                    <InsightCard 
                        title="Diagnosis Classes" 
                        value={Object.keys(data?.summary?.diagnosisClasses || {}).length.toString()} 
                        icon={<Info className="text-pink-500" />}
                        color="bg-pink-50"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-white rounded-[40px] shadow-xl p-8 border border-purple-100 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black">Performance Analysis <span className="text-sm font-medium text-purple-400 bg-purple-50 px-3 py-1 rounded-full ml-4">Research Dataset</span></h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b-2 border-purple-100">
                                    <tr>
                                        <th className="py-4 font-bold text-sm text-[#64748b]">Age</th>
                                        <th className="py-4 font-bold text-sm text-[#64748b]">Education</th>
                                        <th className="py-4 font-bold text-sm text-[#64748b]">Focus (Video)</th>
                                        <th className="py-4 font-bold text-sm text-[#64748b]">Org Difficulty</th>
                                        <th className="py-4 font-bold text-sm text-[#64748b]">Class</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.data.slice(0, 10).map((row: any, idx: number) => (
                                        <tr key={idx} className="border-b border-purple-50 hover:bg-purple-50 transition-colors group">
                                            <td className="py-4 font-black">{row.Age} yr</td>
                                            <td className="py-4 text-[#64748b] font-medium">{row.Educational_Level}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600" 
                                                            style={{ width: `${(row.Focus_Score_Video / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-purple-700">{row.Focus_Score_Video}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                                                    row.Difficulty_Organizing_Tasks > 0.7 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {row.Difficulty_Organizing_Tasks}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                    row.Diagnosis_Class === 3 ? 'bg-purple-100 text-purple-700' : 
                                                    row.Diagnosis_Class === 2 ? 'bg-blue-100 text-blue-700' :
                                                    row.Diagnosis_Class === 1 ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {row.Diagnosis_Class === 3 ? 'Combined' : 
                                                     row.Diagnosis_Class === 2 ? 'Hyperactive' :
                                                     row.Diagnosis_Class === 1 ? 'Inattentive' : 'Control'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="mt-8 text-xs text-center text-[#64748b] bg-slate-50 py-3 rounded-2xl border border-dashed border-slate-200">
                                Insights derived from <strong>{data?.summary?.totalRows}</strong> clean records. Correlation between Focus and Organizing Difficulty is high.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-xl p-8 border border-purple-50 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-black mb-4">Diagnosis Distribution</h2>
                            <div className="space-y-4">
                                {Object.entries(data?.summary?.diagnosisClasses || {}).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1 font-bold">
                                            <span>Class {key}</span>
                                            <span>{Math.round((value / (data?.summary?.totalRows || 1)) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-purple-50 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(value / data?.summary?.totalRows) * 100}%` }}
                                                className="h-full bg-[#a855f7]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 p-6 bg-purple-100 rounded-[30px] border-2 border-purple-200">
                            <h3 className="font-black text-purple-700 mb-2">Research Tip 🧪</h3>
                            <p className="text-sm text-purple-900 leading-relaxed font-semibold">
                                Studies suggest a strong correlation between sleep cycles and executive function in neurodiverse brains.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function InsightCard({ title, value, icon, color }: any) {
    return (
        <div className={`${color} p-6 rounded-[35px] border border-white shadow-lg`}>
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                {icon}
            </div>
            <h4 className="text-sm text-[#64748b] font-bold mb-1 uppercase tracking-wider">{title}</h4>
            <div className="text-3xl font-black tracking-tighter">{value}</div>
        </div>
    );
}

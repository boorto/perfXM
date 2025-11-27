import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `10:${i < 10 ? '0' + i : i}`,
  rps: Math.floor(Math.random() * 5000) + 2000,
  latency: Math.floor(Math.random() * 200) + 20,
}));

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 transition-transform group-hover:scale-110 ${color}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-slate-800 ${color.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm relative z-10">
      <span className="text-emerald-400 font-medium">{change}</span>
      <span className="text-slate-500">vs last hour</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.dashboard.activeUsers} 
          value="12,450" 
          change="+12%" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={t.dashboard.rps} 
          value="8,240" 
          change="+5%" 
          icon={Activity} 
          color="bg-purple-500" 
        />
        <StatCard 
          title={t.dashboard.avgLatency} 
          value="45ms" 
          change="-12%" 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title={t.dashboard.errorRate} 
          value="0.02%" 
          change="+0.01%" 
          icon={AlertTriangle} 
          color="bg-rose-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">{t.dashboard.realtimeThroughput}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} 
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="rps" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">{t.dashboard.latencyDist}</h3>
           <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} 
                />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.activeNodes}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800/50 uppercase font-medium">
                <tr>
                  <th className="px-6 py-3">{t.dashboard.nodeName}</th>
                  <th className="px-6 py-3">{t.dashboard.region}</th>
                  <th className="px-6 py-3">{t.common.status}</th>
                  <th className="px-6 py-3">{t.dashboard.cpu}</th>
                  <th className="px-6 py-3">{t.dashboard.memory}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[1,2,3,4].map(i => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-white font-medium">Agent-Node-{i}0{i}</td>
                    <td className="px-6 py-4">us-east-1</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">{(Math.random() * 40 + 20).toFixed(1)}%</td>
                    <td className="px-6 py-4">{(Math.random() * 30 + 40).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};
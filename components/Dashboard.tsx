
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, ShieldAlert, Trash2, Pencil, Calendar, User } from 'lucide-react';
import { Obligation, Status } from '../types';
import { STATUS_COLORS } from '../constants';
import EditObligationModal from './EditObligationModal';

interface DashboardProps {
  obligations: Obligation[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updated: Partial<Obligation>) => void;
  orgaos: string[];
  responsaveis: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ obligations, onDelete, onUpdate, orgaos, responsaveis }) => {
  const [editingItem, setEditingItem] = useState<Obligation | null>(null);

  const stats = useMemo(() => {
    const total = obligations.length;
    const countByStatus = obligations.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<Status, number>);

    return {
      total,
      vigente: countByStatus[Status.VIGENTE] || 0,
      pendente: countByStatus[Status.PENDENTE] || 0,
      emAndamento: countByStatus[Status.EM_ANDAMENTO] || 0,
      concluido: countByStatus[Status.CONCLUIDO] || 0,
    };
  }, [obligations]);

  const recentObligations = useMemo(() => {
    return [...obligations]
      .sort((a, b) => new Date(a.dataFinal).getTime() - new Date(b.dataFinal).getTime())
      .slice(0, 3);
  }, [obligations]);

  const chartData = [
    { name: 'Vigente', value: stats.vigente, color: '#10b981' },
    { name: 'Pendente', value: stats.pendente, color: '#ef4444' },
    { name: 'Andamento', value: stats.emAndamento, color: '#eab308' },
    { name: 'Concluído', value: stats.concluido, color: '#3b82f6' },
  ];

  const MetricCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-transparent hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-20`}>
          <Icon className={colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      <h3 className="text-4xl font-black italic tracking-tighter text-black">{value}</h3>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Vigentes" value={stats.vigente} icon={CheckCircle} colorClass="bg-green-500" />
        <MetricCard title="Pendentes" value={stats.pendente} icon={ShieldAlert} colorClass="bg-red-500" />
        <MetricCard title="Em Andamento" value={stats.emAndamento} icon={Clock} colorClass="bg-yellow-500" />
        <MetricCard title="Concluídos" value={stats.concluido} icon={AlertCircle} colorClass="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] p-8 shadow-sm">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 border-b-2 border-black/5 pb-4">
            DISTRIBUIÇÃO POR STATUS
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-sm">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 border-b-2 border-black/5 pb-4">
            VISÃO GERAL
          </h3>
          <div className="flex items-center justify-center h-[300px]">
             {obligations.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="text-center text-gray-300">
                 <ShieldAlert size={64} className="mx-auto mb-4 opacity-20" />
                 <p className="font-bold uppercase tracking-widest text-xs">Sem dados para exibir</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md rounded-[40px] p-8 border border-white/20">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Clock className="text-black" />
          PRÓXIMAS OBRIGAÇÕES
        </h3>
        <div className="grid gap-4">
          {recentObligations.map(o => (
            <div key={o.id} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${STATUS_COLORS[o.status]}`} />
                <div>
                  <h4 className="font-black text-black uppercase text-sm italic">{o.nomeDocumento}</h4>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] flex items-center gap-1 text-gray-500 font-bold">
                      <Calendar size={12} /> {new Date(o.dataFinal).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[10px] flex items-center gap-1 text-gray-500 font-bold">
                      <User size={12} /> {o.responsavel}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 relative z-10">
                <button 
                  type="button"
                  onClick={() => setEditingItem(o)}
                  className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-[#FFA200] transition-all flex items-center justify-center"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if(window.confirm('Confirmar exclusão desta obrigação?')) {
                        onDelete?.(o.id);
                    }
                  }}
                  className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center group/del"
                  title="Excluir"
                >
                  <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
          {obligations.length === 0 && (
            <p className="text-center py-4 text-gray-500 font-bold uppercase text-xs">Nenhuma obrigação pendente</p>
          )}
        </div>
      </div>

      {editingItem && onUpdate && (
        <EditObligationModal 
          obligation={editingItem} 
          onClose={() => setEditingItem(null)} 
          orgaos={orgaos}
          responsaveis={responsaveis}
          onSave={(updated) => {
            onUpdate(editingItem.id, updated);
            setEditingItem(null);
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard;

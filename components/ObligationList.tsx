
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  AlertCircle,
  Download,
  X,
  FileSpreadsheet,
  FilePieChart,
  Pencil,
  Copy
} from 'lucide-react';
import { Obligation, Status, Empresa } from '../types';
import { STATUS_COLORS } from '../constants';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import EditObligationModal from './EditObligationModal';

interface ObligationListProps {
  obligations: Obligation[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<Obligation>) => void;
  orgaos: string[];
  responsaveis: string[];
}

const ObligationList: React.FC<ObligationListProps> = ({ obligations, onDelete, onUpdate, orgaos, responsaveis }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState<Empresa | 'TODAS'>('TODAS');
  const [filterStatus, setFilterStatus] = useState<Status | 'TODOS'>('TODOS');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState({ start: '', end: '' });
  const [editingItem, setEditingItem] = useState<Obligation | null>(null);

  const filtered = obligations.filter(o => {
    const matchesSearch = o.nomeDocumento.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.responsavel && o.responsavel.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEmpresa = filterEmpresa === 'TODAS' || o.empresa === filterEmpresa;
    const matchesStatus = filterStatus === 'TODOS' || o.status === filterStatus;
    return matchesSearch && matchesEmpresa && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getExportData = () => {
    return obligations.filter(o => {
      if (!exportRange.start || !exportRange.end) return true;
      const date = new Date(o.dataFinal);
      const start = new Date(exportRange.start);
      const end = new Date(exportRange.end);
      return date >= start && date <= end;
    });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data.map(o => ({
      'Periodicidade': o.periodicidade,
      'Órgão': o.orgao,
      'Empresa': o.empresa,
      'Início Providências': formatDate(o.dataInicio),
      'Final Providências': formatDate(o.dataFinal),
      'Validade': formatDate(o.validadeDocumento),
      'Tipo': o.tipo,
      'Nº Documento': o.numeroDocumento,
      'Nome Documento': o.nomeDocumento,
      'Responsável': o.responsavel,
      'Ação': o.acao,
      'Status': o.status,
      'Conclusão': formatDate(o.dataConclusao),
      'Observações': o.observacoes
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Obrigações');
    XLSX.writeFile(workbook, `Relatorio_Obrigacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const data = getExportData();
    const doc = new jsPDF('l', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.text('Relatório de Obrigações Ambientais - EcoGuard', 14, 15);
    doc.setFontSize(10);
    doc.text(`Período: ${exportRange.start ? formatDate(exportRange.start) : 'Início'} até ${exportRange.end ? formatDate(exportRange.end) : 'Fim'}`, 14, 22);
    
    const tableData = data.map(o => [
      o.nomeDocumento,
      o.orgao,
      o.empresa,
      formatDate(o.dataFinal),
      o.responsavel,
      o.status
    ]);

    (doc as any).autoTable({
      startY: 28,
      head: [['Documento', 'Órgão', 'Empresa', 'Vencimento', 'Responsável', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: 'DF', fillColor: [0, 0, 0], textColor: [255, 162, 0] },
      styles: { fontSize: 8 }
    });

    doc.save(`Relatorio_EcoGuard_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/20 p-4 rounded-2xl backdrop-blur-sm no-print">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFA200] w-5 h-5 z-10" />
          <input 
            type="text"
            placeholder="Buscar por documento, órgão, responsável..."
            className="w-full pl-10 pr-4 py-3 bg-black text-white rounded-xl outline-none focus:ring-2 ring-white/30 transition-all font-medium placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            className="bg-black text-white px-4 py-3 rounded-xl outline-none font-bold text-xs"
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value as any)}
          >
            <option value="TODAS">TODAS AS EMPRESAS</option>
            <option value={Empresa.CAMPLUVAS}>CAMPLUVAS</option>
            <option value={Empresa.LOCATEX}>LOCATEX</option>
          </select>

          <select 
            className="bg-black text-white px-4 py-3 rounded-xl outline-none font-bold text-xs"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="TODOS">TODOS STATUS</option>
            <option value={Status.VIGENTE}>VIGENTE</option>
            <option value={Status.PENDENTE}>PENDENTE</option>
            <option value={Status.EM_ANDAMENTO}>EM ANDAMENTO</option>
            <option value={Status.CONCLUIDO}>CONCLUÍDO</option>
          </select>

          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-black text-[#FFA200] px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg text-xs shrink-0"
          >
            <Download size={16} />
            EXPORTAR
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white/40 p-12 rounded-3xl text-center border-2 border-dashed border-black/10">
            <AlertCircle className="w-12 h-12 text-black/40 mx-auto mb-4" />
            <p className="text-xl font-bold text-black/60 italic">Nenhuma obrigação encontrada</p>
          </div>
        ) : (
          filtered.map(o => (
            <div 
              key={o.id} 
              className="bg-white rounded-3xl p-6 shadow-sm border border-transparent hover:border-black/10 transition-all group overflow-hidden relative"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${STATUS_COLORS[o.status]}`} />

              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${STATUS_COLORS[o.status]}`}>
                          {o.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{o.periodicidade}</span>
                      </div>
                      <h3 className="text-xl font-black italic text-black uppercase">{o.nomeDocumento}</h3>
                      <p className="text-sm font-medium text-gray-500">{o.tipo} - {o.numeroDocumento}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="flex flex-col text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Órgão / Empresa</p>
                      <p className="font-bold text-black truncate">{o.orgao} / {o.empresa}</p>
                    </div>
                    <div className="flex flex-col text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Providências</p>
                      <p className="font-bold text-black">{formatDate(o.dataInicio)} - {formatDate(o.dataFinal)}</p>
                    </div>
                    <div className="flex flex-col text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Responsável</p>
                      <p className="font-bold text-black truncate">{o.responsavel || 'Não definido'}</p>
                    </div>
                    <div className="flex flex-col text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Validade</p>
                      <p className="font-bold text-black">{formatDate(o.validadeDocumento)}</p>
                    </div>
                    {o.dataConclusao && (
                      <div className="flex flex-col text-sm">
                        <p className="text-[10px] font-bold text-green-600 uppercase">Concluído em</p>
                        <p className="font-bold text-black">{formatDate(o.dataConclusao)}</p>
                      </div>
                    )}
                  </div>

                  {o.observacoes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border-l-4 border-black/10">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Observações</p>
                      <p className="text-sm text-gray-700">{o.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col items-center justify-end gap-3 shrink-0 no-print z-10 relative">
                  <select 
                    value={o.status}
                    onChange={(e) => onUpdate(o.id, { status: e.target.value as Status })}
                    className="bg-black text-white text-xs font-bold p-3 rounded-xl border-none outline-none appearance-none cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    <option value={Status.VIGENTE}>VIGENTE</option>
                    <option value={Status.PENDENTE}>PENDENTE</option>
                    <option value={Status.EM_ANDAMENTO}>EM ANDAMENTO</option>
                    <option value={Status.CONCLUIDO}>CONCLUÍDO</option>
                  </select>
                  
                  <div className="flex gap-2 w-full lg:w-auto">
                    <button 
                      type="button"
                      onClick={() => navigate('/cadastro', { state: { duplicateData: o } })}
                      className="flex-1 lg:flex-none p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-black hover:text-[#FFA200] transition-all flex items-center justify-center shadow-sm group/dup"
                      title="Duplicar Obrigação"
                    >
                      <Copy size={18} className="group-hover/dup:scale-110 transition-transform" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditingItem(o)}
                      className="flex-1 lg:flex-none p-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-[#FFA200] transition-all flex items-center justify-center shadow-sm"
                      title="Editar Obrigação"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if(window.confirm('ATENÇÃO: Deseja excluir esta obrigação permanentemente?')) {
                          onDelete(o.id);
                        }
                      }}
                      className="flex-1 lg:flex-none p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm group/del"
                      title="Excluir Obrigação"
                    >
                      <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Exportar Relatório</h3>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">Selecione o período de vencimento para filtrar os dados do relatório.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-gray-400">Data Inicial</label>
                <input 
                  type="date" 
                  className="w-full bg-black text-white p-3 rounded-xl outline-none focus:ring-2 ring-[#FFA200] transition-all"
                  value={exportRange.start}
                  onChange={(e) => setExportRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-gray-400">Data Final</label>
                <input 
                  type="date" 
                  className="w-full bg-black text-white p-3 rounded-xl outline-none focus:ring-2 ring-[#FFA200] transition-all"
                  value={exportRange.end}
                  onChange={(e) => setExportRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all"
              >
                <FileSpreadsheet size={24} />
                EXPORTAR PARA EXCEL (.xlsx)
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all"
              >
                <FilePieChart size={24} />
                GERAR RELATÓRIO PDF
              </button>
            </div>
            
            <button 
              onClick={() => { setExportRange({start: '', end: ''}); handleExportExcel(); }}
              className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-black uppercase underline"
            >
              Exportar todas as obrigações (sem filtro)
            </button>
          </div>
        </div>
      )}

      {editingItem && (
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

export default ObligationList;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Repeat } from 'lucide-react';
import { Obligation, Status, Empresa } from '../types';
import { INITIAL_PERIODICITIES } from '../constants';

interface ObligationFormProps {
  onSave: (obligation: Obligation | Obligation[]) => void;
  orgaos: string[];
  responsaveis: string[];
}

const addPeriod = (dateStr: string, periodicidade: string, count: number): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const pUpper = periodicidade.toUpperCase();
  let monthOffset = 1;
  if (pUpper.includes('BIMESTRAL')) {
    monthOffset = 2;
  } else if (pUpper.includes('TRIMESTRAL')) {
    monthOffset = 3;
  } else if (pUpper.includes('QUADRIMESTRAL')) {
    monthOffset = 4;
  } else if (pUpper.includes('SEMESTRAL')) {
    monthOffset = 6;
  } else if (pUpper.includes('ANUAL') && !pUpper.includes('BIENAL')) {
    monthOffset = 12;
  } else if (pUpper.includes('BIENAL')) {
    monthOffset = 24;
  } else {
    monthOffset = 1;
  }

  const totalMonthsAdded = monthOffset * count;
  if (totalMonthsAdded === 0) return dateStr;

  const targetTotalMonths = (year * 12 + (month - 1)) + totalMonthsAdded;
  const targetYear = Math.floor(targetTotalMonths / 12);
  const targetMonth = targetTotalMonths % 12;

  const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(day, maxDaysInTargetMonth);

  const yStr = String(targetYear).padStart(4, '0');
  const mStr = String(targetMonth + 1).padStart(2, '0');
  const dStr = String(targetDay).padStart(2, '0');

  return `${yStr}-${mStr}-${dStr}`;
};

const ObligationForm: React.FC<ObligationFormProps> = ({ onSave, orgaos, responsaveis }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verifica se há dados para duplicação vindos do estado da rota
  const duplicateData = location.state?.duplicateData as Obligation | undefined;

  const [formData, setFormData] = useState({
    periodicidade: duplicateData?.periodicidade || INITIAL_PERIODICITIES[0],
    dataInicio: duplicateData?.dataInicio || '',
    dataFinal: duplicateData?.dataFinal || '',
    orgao: duplicateData?.orgao || orgaos[0] || '',
    tipo: duplicateData?.tipo || '',
    numeroDocumento: duplicateData?.numeroDocumento || '',
    validadeDocumento: duplicateData?.validadeDocumento || '',
    nomeDocumento: duplicateData?.nomeDocumento || '',
    empresa: duplicateData?.empresa || Empresa.CAMPLUVAS,
    acao: duplicateData?.acao || '',
    status: duplicateData ? Status.PENDENTE : Status.PENDENTE, // Sempre inicia pendente ao duplicar
    dataConclusao: '', // Limpa data de conclusão ao duplicar
    responsavel: duplicateData?.responsavel || responsaveis[0] || '',
    observacoes: duplicateData?.observacoes || ''
  });

  const [isBatchRecurrent, setIsBatchRecurrent] = useState(false);
  const [batchUntilDate, setBatchUntilDate] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orgao || !formData.responsavel) {
      alert('Por favor, cadastre ao menos um Órgão e um Responsável antes de continuar.');
      return;
    }

    if (isBatchRecurrent) {
      if (!batchUntilDate) {
        alert('Por favor, informe a "Data limite" para a geração das obrigações em lote.');
        return;
      }
      if (formData.periodicidade === 'Única') {
        alert('A opção de geração em lote não se aplica à periodicidade "Única". Selecione Mensal, Trimestral, Semestral, Anual ou Bienal.');
        return;
      }

      const generatedList: Obligation[] = [];
      let count = 0;
      const maxIterations = 120; // limite de segurança (10 anos mensais)

      while (count < maxIterations) {
        const nextInicio = addPeriod(formData.dataInicio, formData.periodicidade, count);
        const nextFinal = addPeriod(formData.dataFinal, formData.periodicidade, count);
        const nextValidade = addPeriod(formData.validadeDocumento, formData.periodicidade, count);

        // Data de referência para checar o limite
        const refDate = nextInicio || nextValidade;

        // Se a data de referência ultrapassar a data limite escolhida, interrompe
        if (count > 0 && refDate > batchUntilDate) {
          break;
        }

        generatedList.push({
          ...formData,
          dataInicio: nextInicio,
          dataFinal: nextFinal,
          validadeDocumento: nextValidade,
          id: crypto.randomUUID(),
          createdAt: Date.now() + count
        });

        if (refDate >= batchUntilDate) {
          break;
        }

        count++;
      }

      if (generatedList.length === 0) {
        alert('Nenhuma obrigação foi gerada. Verifique as datas fornecidas.');
        return;
      }

      onSave(generatedList);
      alert(`Sucesso! Foram geradas ${generatedList.length} obrigações recorrentes.`);
    } else {
      const newObligation: Obligation = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };
      onSave(newObligation);
    }

    navigate('/listagem');
  };

  const inputClass = "w-full bg-black text-white border-2 border-transparent focus:border-white p-3 rounded-lg outline-none transition-all placeholder-gray-500 font-bold";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider mb-2 text-black/80";

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black italic text-black uppercase tracking-tighter">
          {duplicateData ? 'DUPLICAR OBRIGAÇÃO' : 'CADASTRO DE OBRIGAÇÕES'}
        </h2>
        {duplicateData && (
          <span className="bg-black text-[#FFA200] px-3 py-1 rounded-full text-[10px] font-black italic">MODO DUPLICAÇÃO</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Periodicidade */}
          <div>
            <label className={labelClass}>Periodicidade</label>
            <select name="periodicidade" value={formData.periodicidade} onChange={handleChange} className={inputClass}>
              {INITIAL_PERIODICITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Orgão - Dinâmico */}
          <div>
            <label className={labelClass}>Órgão</label>
            <select 
              name="orgao" 
              value={formData.orgao} 
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Selecione um Órgão...</option>
              {orgaos.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {orgaos.length === 0 && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase">Cadastre órgãos no menu lateral</p>}
          </div>

          {/* Empresa */}
          <div>
            <label className={labelClass}>Empresa</label>
            <select name="empresa" value={formData.empresa} onChange={handleChange} className={inputClass}>
              <option value={Empresa.CAMPLUVAS}>CAMPLUVAS</option>
              <option value={Empresa.LOCATEX}>LOCATEX</option>
            </select>
          </div>

          {/* Datas */}
          <div>
            <label className={labelClass}>Início das Providências</label>
            <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Final das Providências</label>
            <input type="date" name="dataFinal" value={formData.dataFinal} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Validade do Documento</label>
            <input type="date" name="validadeDocumento" value={formData.validadeDocumento} onChange={handleChange} className={inputClass} required />
          </div>

          {/* Texto */}
          <div>
            <label className={labelClass}>Tipo</label>
            <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} className={inputClass} placeholder="Ex: Licença Operação" />
          </div>
          <div>
            <label className={labelClass}>Nº do Documento</label>
            <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} className={inputClass} placeholder="Ex: 001/2024" />
          </div>

          {/* Responsável - Dinâmico */}
          <div>
            <label className={labelClass}>Responsável</label>
            <select 
              name="responsavel" 
              value={formData.responsavel} 
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Selecione um Responsável...</option>
              {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {responsaveis.length === 0 && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase">Cadastre responsáveis no menu lateral</p>}
          </div>

          <div>
            <label className={labelClass}>Nome do Documento</label>
            <input type="text" name="nomeDocumento" value={formData.nomeDocumento} onChange={handleChange} className={inputClass} placeholder="Nome amigável" />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Ação</label>
            <input type="text" name="acao" value={formData.acao} onChange={handleChange} className={inputClass} placeholder="Descreva a ação necessária" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
              <option value={Status.VIGENTE}>VIGENTE</option>
              <option value={Status.PENDENTE}>PENDENTE</option>
              <option value={Status.EM_ANDAMENTO}>EM ANDAMENTO</option>
              <option value={Status.CONCLUIDO}>CONCLUÍDO</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Data de conclusão</label>
            <input type="date" name="dataConclusao" value={formData.dataConclusao} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Bloco de Geração Recorrente em Lote */}
        <div className="bg-black/5 border border-black/10 rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isBatchRecurrent} 
                onChange={(e) => setIsBatchRecurrent(e.target.checked)}
                className="w-5 h-5 accent-black rounded cursor-pointer"
              />
              <div>
                <span className="font-black text-sm uppercase text-black flex items-center gap-2">
                  <Repeat size={16} className="text-[#FFA200]" />
                  Gerar ocorrências recorrentes em lote?
                </span>
                <p className="text-xs text-gray-600 font-medium">
                  Cria automaticamente múltiplos registros periódicos ({formData.periodicidade}) até a data limite informada.
                </p>
              </div>
            </label>
          </div>

          {isBatchRecurrent && (
            <div className="pt-2 border-t border-black/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className={labelClass}>Gerar até a data limite (Final da Recorrência)</label>
                <input 
                  type="date" 
                  value={batchUntilDate} 
                  onChange={(e) => setBatchUntilDate(e.target.value)} 
                  className={inputClass} 
                  required={isBatchRecurrent} 
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-gray-700 bg-white/70 p-3 rounded-lg border border-black/10 italic">
                  💡 Com a periodicidade <strong>{formData.periodicidade}</strong>, o sistema gerará individualmente cada ocorrência até a data limite selecionada.
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Observações</label>
          <textarea 
            name="observacoes" 
            value={formData.observacoes} 
            onChange={handleChange} 
            className={`${inputClass} min-h-[120px] resize-none`}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate('/listagem')} className="px-6 py-3 font-bold text-black border-2 border-black rounded-xl">Cancelar</button>
          <button type="submit" className="px-10 py-3 bg-black text-[#FFA200] font-black italic rounded-xl hover:shadow-xl transition-all flex items-center gap-2">
            <Save size={20} />
            {isBatchRecurrent ? 'GERAR LOTE DE OBRIGAÇÕES' : duplicateData ? 'CRIAR CÓPIA' : 'SALVAR OBRIGAÇÃO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObligationForm;

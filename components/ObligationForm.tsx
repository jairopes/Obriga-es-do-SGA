
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Obligation, Status, Empresa } from '../types';
import { INITIAL_PERIODICITIES } from '../constants';

interface ObligationFormProps {
  onSave: (obligation: Obligation) => void;
  orgaos: string[];
  responsaveis: string[];
}

const ObligationForm: React.FC<ObligationFormProps> = ({ onSave, orgaos, responsaveis }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    periodicidade: INITIAL_PERIODICITIES[0],
    dataInicio: '',
    dataFinal: '',
    orgao: orgaos[0] || '',
    tipo: '',
    numeroDocumento: '',
    validadeDocumento: '',
    nomeDocumento: '',
    empresa: Empresa.CAMPLUVAS,
    acao: '',
    status: Status.PENDENTE,
    dataConclusao: '',
    responsavel: responsaveis[0] || '',
    observacoes: ''
  });

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
    const newObligation: Obligation = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    onSave(newObligation);
    navigate('/listagem');
  };

  const inputClass = "w-full bg-black text-white border-2 border-transparent focus:border-white p-3 rounded-lg outline-none transition-all placeholder-gray-500 font-bold";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider mb-2 text-black/80";

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black italic text-black uppercase tracking-tighter">CADASTRO DE OBRIGAÇÕES</h2>
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
            SALVAR OBRIGAÇÃO
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObligationForm;

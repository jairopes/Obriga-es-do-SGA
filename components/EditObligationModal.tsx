
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Obligation, Status, Empresa } from '../types';
import { INITIAL_PERIODICITIES } from '../constants';

interface EditObligationModalProps {
  obligation: Obligation;
  onClose: () => void;
  onSave: (updated: Partial<Obligation>) => void;
  orgaos: string[];
  responsaveis: string[];
}

const EditObligationModal: React.FC<EditObligationModalProps> = ({ obligation, onClose, onSave, orgaos, responsaveis }) => {
  const [formData, setFormData] = useState<Partial<Obligation>>(obligation);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = "w-full bg-black text-white border-2 border-transparent focus:border-[#FFA200] p-3 rounded-lg outline-none transition-all text-sm font-bold";
  const labelClass = "block text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-500";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Editar Obrigação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <label className={labelClass}>Periodicidade</label>
              <select name="periodicidade" value={formData.periodicidade} onChange={handleChange} className={inputClass}>
                {INITIAL_PERIODICITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Órgão</label>
              <select name="orgao" value={formData.orgao} onChange={handleChange} className={inputClass}>
                {orgaos.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Empresa</label>
              <select name="empresa" value={formData.empresa} onChange={handleChange} className={inputClass}>
                <option value={Empresa.CAMPLUVAS}>CAMPLUVAS</option>
                <option value={Empresa.LOCATEX}>LOCATEX</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Início das Providências</label>
              <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Final das Providências</label>
              <input type="date" name="dataFinal" value={formData.dataFinal} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Validade do Documento</label>
              <input type="date" name="validadeDocumento" value={formData.validadeDocumento} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Tipo</label>
              <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nº do Documento</label>
              <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Responsável</label>
              <select name="responsavel" value={formData.responsavel} onChange={handleChange} className={inputClass}>
                {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Nome do Documento</label>
              <input type="text" name="nomeDocumento" value={formData.nomeDocumento} onChange={handleChange} className={inputClass} />
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

            <div className="md:col-span-2">
              <label className={labelClass}>Ação</label>
              <input type="text" name="acao" value={formData.acao} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data de conclusão</label>
              <input type="date" name="dataConclusao" value={formData.dataConclusao} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className={`${inputClass} min-h-[100px] resize-none`} />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-8 py-3 font-bold text-gray-500 hover:text-black transition-colors">Cancelar</button>
            <button type="submit" className="px-12 py-3 bg-black text-[#FFA200] font-black italic rounded-xl hover:shadow-xl transition-all flex items-center gap-2">
              <Save size={20} />
              ATUALIZAR DADOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditObligationModal;

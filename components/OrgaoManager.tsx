
import React, { useState } from 'react';
import { Plus, Trash2, Building2, ShieldAlert } from 'lucide-react';

interface ManagerProps {
  items: string[];
  setItems: (items: string[]) => void;
}

const OrgaoManager: React.FC<ManagerProps> = ({ items, setItems }) => {
  const [newValue, setNewValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    if (items.includes(newValue.trim().toUpperCase())) {
      alert('Este órgão já está cadastrado.');
      return;
    }
    setItems([...items, newValue.trim().toUpperCase()]);
    setNewValue('');
  };

  const handleRemove = (item: string) => {
    if (window.confirm(`Deseja remover o órgão "${item}"?`)) {
      setItems(items.filter(i => i !== item));
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-black p-3 rounded-2xl">
          <Building2 className="text-[#FFA200]" />
        </div>
        <h2 className="text-3xl font-black italic text-black uppercase tracking-tighter">Gestão de Órgãos</h2>
      </div>

      <form onSubmit={handleAdd} className="mb-8">
        <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-black/80">Novo Órgão Ambiental</label>
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Ex: IBAMA, CETESB, PREFEITURA..."
            className="flex-1 bg-black text-white p-4 rounded-xl outline-none border-2 border-transparent focus:border-white transition-all uppercase font-bold"
          />
          <button 
            type="submit"
            className="bg-black text-[#FFA200] px-8 rounded-xl font-black italic hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={24} />
            CADASTRAR
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Órgãos Cadastrados ({items.length})</h3>
        {items.length === 0 ? (
          <div className="bg-white/50 p-12 rounded-2xl text-center border-2 border-dashed border-black/10">
            <ShieldAlert className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <p className="text-sm font-bold text-black/40 uppercase">Nenhum órgão cadastrado</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
              <span className="font-black text-black italic text-lg uppercase">{item}</span>
              <button 
                onClick={() => handleRemove(item)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Remover Órgão"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrgaoManager;

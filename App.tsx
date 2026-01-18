
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo,
  ShieldCheck,
  Menu,
  X,
  Building2,
  Users,
  Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ObligationForm from './components/ObligationForm';
import ObligationList from './components/ObligationList';
import OrgaoManager from './components/OrgaoManager';
import ResponsavelManager from './components/ResponsavelManager';
import { Obligation, Empresa, Status } from './types';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [orgaos, setOrgaos] = useState<string[]>([]);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auxiliar para converter dados do Banco (snake_case) para o App (camelCase)
  const mapFromDB = (data: any): Obligation => ({
    id: data.id,
    periodicidade: data.periodicidade || '',
    dataInicio: data.data_inicio || '',
    dataFinal: data.data_final || '',
    orgao: data.orgao || '',
    tipo: data.tipo || '',
    numeroDocumento: data.numero_documento || '',
    validadeDocumento: data.validade_documento || '',
    nomeDocumento: data.nome_documento || '',
    empresa: (data.empresa as Empresa) || Empresa.CAMPLUVAS,
    acao: data.acao || '',
    status: (data.status as Status) || Status.PENDENTE,
    dataConclusao: data.data_conclusao || '',
    responsavel: data.responsavel || '',
    observacoes: data.observacoes || '',
    createdAt: data.created_at || Date.now()
  });

  // Auxiliar para converter dados do App (camelCase) para o Banco (snake_case)
  const mapToDB = (ob: Partial<Obligation>) => {
    const mapped: any = {};
    if (ob.id !== undefined) mapped.id = ob.id;
    if (ob.periodicidade !== undefined) mapped.periodicidade = ob.periodicidade;
    
    // Tratamento de Datas: Se vazio (""), envia NULL para o Postgres
    if (ob.dataInicio !== undefined) mapped.data_inicio = ob.dataInicio || null;
    if (ob.dataFinal !== undefined) mapped.data_final = ob.dataFinal || null;
    if (ob.validadeDocumento !== undefined) mapped.validade_documento = ob.validadeDocumento || null;
    if (ob.dataConclusao !== undefined) mapped.data_conclusao = ob.dataConclusao || null;

    if (ob.orgao !== undefined) mapped.orgao = ob.orgao;
    if (ob.tipo !== undefined) mapped.tipo = ob.tipo;
    if (ob.numeroDocumento !== undefined) mapped.numero_documento = ob.numeroDocumento;
    if (ob.nomeDocumento !== undefined) mapped.nome_documento = ob.nomeDocumento;
    if (ob.empresa !== undefined) mapped.empresa = ob.empresa;
    if (ob.acao !== undefined) mapped.acao = ob.acao;
    if (ob.status !== undefined) mapped.status = ob.status;
    if (ob.responsavel !== undefined) mapped.responsavel = ob.responsavel;
    if (ob.observacoes !== undefined) mapped.observacoes = ob.observacoes;
    if (ob.createdAt !== undefined) mapped.created_at = ob.createdAt;
    return mapped;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obsRes, orgRes, respRes] = await Promise.all([
          supabase.from('obligations').select('*').order('data_final', { ascending: true }),
          supabase.from('orgaos').select('nome').order('nome'),
          supabase.from('responsaveis').select('nome').order('nome')
        ]);

        if (obsRes.data) {
          setObligations(obsRes.data.map(mapFromDB));
        }
        if (orgRes.data) setOrgaos(orgRes.data.map((o: any) => o.nome));
        if (respRes.data) setResponsaveis(respRes.data.map((r: any) => r.nome));
      } catch (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addObligation = async (newObligation: Obligation) => {
    const dbData = mapToDB(newObligation);
    const { error } = await supabase.from('obligations').insert([dbData]);
    if (error) {
      console.error("Erro detalhado do Supabase:", error);
      alert(`Erro ao salvar: ${error.message} \n\nDica: Verifique se todos os campos obrigatórios estão preenchidos corretamente.`);
      return;
    }
    setObligations(prev => [newObligation, ...prev]);
  };

  const deleteObligation = async (id: string) => {
    const { error } = await supabase.from('obligations').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }
    setObligations(prev => prev.filter(o => o.id !== id));
  };

  const updateObligation = async (id: string, updated: Partial<Obligation>) => {
    const dbData = mapToDB(updated);
    const { error } = await supabase.from('obligations').update(dbData).eq('id', id);
    if (error) {
      alert("Erro ao atualizar: " + error.message);
      return;
    }
    setObligations(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
  };

  const handleSetOrgaos = async (newList: string[]) => {
    if (newList.length > orgaos.length) {
      const added = newList.filter(x => !orgaos.includes(x))[0];
      await supabase.from('orgaos').insert([{ nome: added }]);
    } else if (newList.length < orgaos.length) {
      const removed = orgaos.filter(x => !newList.includes(x))[0];
      await supabase.from('orgaos').delete().eq('nome', removed);
    }
    setOrgaos(newList);
  };

  const handleSetResponsaveis = async (newList: string[]) => {
    if (newList.length > responsaveis.length) {
      const added = newList.filter(x => !responsaveis.includes(x))[0];
      await supabase.from('responsaveis').insert([{ nome: added }]);
    } else if (newList.length < responsaveis.length) {
      const removed = responsaveis.filter(x => !newList.includes(x))[0];
      await supabase.from('responsaveis').delete().eq('nome', removed);
    }
    setResponsaveis(newList);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#FFA200]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black italic uppercase tracking-widest text-sm">Sincronizando com Supabase...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row overflow-hidden" style={{ backgroundColor: '#FFA200' }}>
        
        <div className="md:hidden bg-black text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#FFA200]" />
            <span className="font-bold tracking-tight">EcoGuard SGA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:static inset-y-0 left-0 z-50
          w-64 bg-black text-white transition-transform duration-300 ease-in-out
          flex flex-col shadow-2xl border-r border-black/10
        `}>
          <div className="p-8 hidden md:flex flex-col items-center border-b border-white/10">
            <div className="bg-[#FFA200] p-3 rounded-2xl mb-4">
              <ShieldCheck className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter">ECOGUARD</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase">Gestão Ambiental</p>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFA200]/10 hover:text-[#FFA200] transition-all group"
            >
              <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link 
              to="/orgaos" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFA200]/10 hover:text-[#FFA200] transition-all group"
            >
              <Building2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Órgãos</span>
            </Link>

            <Link 
              to="/responsaveis" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFA200]/10 hover:text-[#FFA200] transition-all group"
            >
              <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Responsáveis</span>
            </Link>

            <div className="py-2 border-b border-white/5 my-2" />

            <Link 
              to="/cadastro" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFA200]/10 hover:text-[#FFA200] transition-all group"
            >
              <PlusCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Nova Obrigação</span>
            </Link>
            
            <Link 
              to="/listagem" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFA200]/10 hover:text-[#FFA200] transition-all group"
            >
              <ListTodo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Obrigações</span>
            </Link>
          </nav>

          <div className="p-6 text-center text-[10px] text-gray-500">
            v1.2.3 &copy; {new Date().getFullYear()} EcoGuard
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard obligations={obligations} onDelete={deleteObligation} onUpdate={updateObligation} orgaos={orgaos} responsaveis={responsaveis} />} />
              <Route path="/orgaos" element={<OrgaoManager items={orgaos} setItems={handleSetOrgaos} />} />
              <Route path="/responsaveis" element={<ResponsavelManager items={responsaveis} setItems={handleSetResponsaveis} />} />
              <Route path="/cadastro" element={<ObligationForm onSave={addObligation} orgaos={orgaos} responsaveis={responsaveis} />} />
              <Route path="/listagem" element={<ObligationList obligations={obligations} onDelete={deleteObligation} onUpdate={updateObligation} orgaos={orgaos} responsaveis={responsaveis} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;

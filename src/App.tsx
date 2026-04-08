import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Globe, Menu, X, Scissors, Plus, Trash2, Calendar as CalendarIcon, Check, LogOut, LogIn, Save, DollarSign, MessageSquare, CreditCard, BookOpen, QrCode, AlertCircle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isBefore, startOfDay, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from './firebase';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
          <Route path="/:shopId" element={<PublicPage />} />
          <Route path="/agendamento/:appointmentId" element={<ClientAppointmentPage />} />
        </Routes>
      </BrowserRouter>
  );
}

// --- LANDING PAGE COMPONENT ---
function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-indigo-600">
          <Scissors className="w-8 h-8" />
          <span className="text-2xl font-bold text-gray-900">ClientFlow</span>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Entrar / Cadastrar
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          A agenda inteligente que <span className="text-indigo-600">lota a sua barbearia</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Receba agendamentos 24h por dia, envie lembretes pelo WhatsApp com 1 clique e acabe com os furos de horário.
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Acessar o Sistema
        </button>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
            <Globe className="w-12 h-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Página Exclusiva</h3>
            <p className="text-gray-600 leading-relaxed">Seu link na bio do Instagram. O cliente agenda em 10 segundos sem precisar baixar aplicativo ou criar senha.</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-100 transition-colors">
            <MessageSquare className="w-12 h-12 text-green-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Lembretes no WhatsApp</h3>
            <p className="text-gray-600 leading-relaxed">Confirme horários com 1 clique direto no seu WhatsApp. Reduza as faltas dos clientes em até 80%.</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-yellow-100 transition-colors">
            <DollarSign className="w-12 h-12 text-yellow-500 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão Financeira</h3>
            <p className="text-gray-600 leading-relaxed">Saiba exatamente quanto você faturou no dia e na semana de forma automática, sem usar planilhas.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- AUTH WRAPPER ---
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      alert(`Erro no login: ${error.message || error.code || JSON.stringify(error)}`);
    }
  };

  if (!isAuthReady) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Carregando...</p></div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center mb-6 mt-4 text-indigo-600">
            <Scissors className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ClientFlow</h1>
          <p className="text-gray-600 mb-8">Faça login para gerenciar sua barbearia e seus agendamentos.</p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return <>{React.cloneElement(children as React.ReactElement, { user })}</>;
}

// --- DASHBOARD COMPONENT ---
function Dashboard({ user }: { user?: User }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [shopName, setShopName] = useState("Minha Barbearia");
  const [shopDescription, setShopDescription] = useState("A melhor experiência para o homem moderno.");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('pending'); // 'pending', 'active'

  useEffect(() => {
    if (!user) return;
    
    const unsubBarbershop = onSnapshot(doc(db, 'barbershops', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setShopName(data.shopName || "Minha Barbearia");
        setShopDescription(data.shopDescription || "");
        setPrimaryColor(data.primaryColor || "#4f46e5");
        setLogoUrl(data.logoUrl || "");
        setBannerUrl(data.bannerUrl || "");
        setSlug(data.slug || user.uid);
        setServices(data.services || []);
        
        // Subscription Logic
        let status = data.subscriptionStatus || 'pending';
        
        // Simulate active account for testing
        if (user.email === 'gustavo.medeiros.12@gmail.com' || user.email === 'gustavomedeirosg12@gmail.com') {
          status = 'active';
        }
        
        setSubscriptionStatus(status);
        
        if (status !== 'active') {
          setActiveTab('billing'); // Force them to billing tab
        }
      } else {
        const defaultServices = [
          { id: 1, name: 'Corte Degradê', desc: 'Corte na máquina e tesoura com disfarce', price: 35, time: '45 min' },
          { id: 2, name: 'Barba Terapia', desc: 'Barba com toalha quente e navalha', price: 25, time: '30 min' },
          { id: 3, name: 'Corte + Barba', desc: 'Pacote completo com desconto', price: 55, time: '1h 15 min' }
        ];
        setDoc(doc(db, 'barbershops', user.uid), {
          shopName: "Minha Barbearia",
          shopDescription: "A melhor experiência para o homem moderno.",
          primaryColor: "#4f46e5",
          services: defaultServices,
          subscriptionStatus: 'pending'
        });
        setServices(defaultServices);
      }
    });

    const q = query(collection(db, 'appointments'), where('barbershopId', '==', user.uid));
    const unsubAppointments = onSnapshot(q, (snapshot) => {
      const apts: any[] = [];
      snapshot.forEach(doc => apts.push({ id: doc.id, ...doc.data() }));
      apts.sort((a, b) => {
        if (a.date === b.date) return a.time.localeCompare(b.time);
        return a.date.localeCompare(b.date);
      });
      setAppointments(apts);
    });

    return () => {
      unsubBarbershop();
      unsubAppointments();
    };
  }, [user]);

  const handleLogout = () => signOut(auth);

  const isLocked = subscriptionStatus !== 'active';

  const menuItems = [
    { id: 'schedule', label: 'Agenda', icon: CalendarIcon, disabled: isLocked },
    { id: 'financial', label: 'Financeiro', icon: DollarSign, disabled: isLocked },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, disabled: isLocked },
    { id: 'settings', label: 'Configurações', icon: LayoutDashboard, disabled: isLocked },
    { id: 'billing', label: 'Assinatura', icon: CreditCard, disabled: false },
    { id: 'tutorial', label: 'Ajuda / Tutorial', icon: BookOpen, disabled: isLocked },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <Scissors className="w-6 h-6" />
            <span className="text-xl font-bold text-gray-900">ClientFlow</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => { if(!item.disabled) { setActiveTab(item.id); setIsMobileMenuOpen(false); } }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : item.disabled ? 'text-gray-400 opacity-50 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                  {item.label}
                </div>
                {item.disabled && <AlertCircle className="w-4 h-4 text-red-400" />}
              </button>
            );
          })}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link para Clientes</p>
            <Link 
              to={`/${slug || user?.uid}`} 
              target="_blank"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-100"
            >
              <Globe className="w-5 h-5 text-indigo-500" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-gray-900">Sua Página Pública</span>
                <span className="text-xs text-gray-500 font-normal">Link de Agendamento</span>
              </div>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0 space-y-2">
          <a 
            href="https://wa.me/5534992425286" 
            target="_blank" 
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Suporte (Ajuda)
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <Scissors className="w-6 h-6" />
            <span className="text-xl font-bold text-gray-900">ClientFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeTab === 'schedule' && <ScheduleTab appointments={appointments} />}
          {activeTab === 'financial' && <FinancialTab appointments={appointments} />}
          {activeTab === 'whatsapp' && <WhatsAppTab />}
          {activeTab === 'settings' && (
            <SettingsTab 
              user={user!} 
              shopName={shopName} setShopName={setShopName}
              shopDescription={shopDescription} setShopDescription={setShopDescription}
              primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
              logoUrl={logoUrl} setLogoUrl={setLogoUrl}
              bannerUrl={bannerUrl} setBannerUrl={setBannerUrl}
              slug={slug} setSlug={setSlug}
              services={services} setServices={setServices}
            />
          )}
          {activeTab === 'billing' && <BillingTab user={user!} status={subscriptionStatus} />}
          {activeTab === 'tutorial' && <TutorialTab />}
        </div>
      </main>
    </div>
  );
}

// --- DASHBOARD TABS ---

function ScheduleTab({ appointments }: { appointments: any[] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');

  const handleConfirm = async (id: string) => {
    await updateDoc(doc(db, 'appointments', id), { confirmed: true });
  };

  const handleCancel = async (id: string) => {
    if(window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda de Hoje</h1>
        <span className="text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {todaysAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum agendamento para hoje.</div>
          ) : (
            todaysAppointments.map(apt => (
              <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors bg-white hover:bg-indigo-50/30">
                <div className="w-20 font-bold text-gray-900 shrink-0 text-lg">{apt.time}</div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{apt.clientName}</p>
                    <p className="text-sm text-gray-500">{apt.service} • {apt.clientPhone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.clientPhone && (
                      <a 
                        href={`https://wa.me/55${apt.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${apt.clientName}, tudo bem? Passando para confirmar seu agendamento hoje às ${apt.time} na nossa barbearia.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </a>
                    )}
                    {apt.confirmed ? (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-lg flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Confirmado
                      </span>
                    ) : (
                      <button onClick={() => handleConfirm(apt.id)} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        Confirmar
                      </button>
                    )}
                    <button onClick={() => handleCancel(apt.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar Agendamento">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FinancialTab({ appointments }: { appointments: any[] }) {
  // Calculate metrics
  const confirmedApts = appointments.filter(a => a.status === 'booked' && a.confirmed);
  const totalRevenue = confirmedApts.reduce((acc, curr) => {
    // In a real app, we'd store the price in the appointment. 
    // For this MVP, we'll assume an average ticket of R$ 45 if price isn't saved.
    return acc + (curr.price || 45);
  }, 0);

  const pendingApts = appointments.filter(a => a.status === 'booked' && !a.confirmed);
  const potentialRevenue = pendingApts.reduce((acc, curr) => acc + (curr.price || 45), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Visão Financeira</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="w-6 h-6" /></div>
            <h3 className="font-medium text-gray-900">Faturamento Confirmado</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
          <p className="text-sm text-gray-500 mt-1">De {confirmedApts.length} agendamentos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 text-orange-500 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg"><CalendarIcon className="w-6 h-6" /></div>
            <h3 className="font-medium text-gray-900">Pendente (A Confirmar)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">R$ {potentialRevenue.toFixed(2).replace('.', ',')}</p>
          <p className="text-sm text-gray-500 mt-1">De {pendingApts.length} agendamentos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg"><Scissors className="w-6 h-6" /></div>
            <h3 className="font-medium text-gray-900">Total de Clientes</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{appointments.filter(a => a.status !== 'cancelled').length}</p>
          <p className="text-sm text-gray-500 mt-1">No período atual</p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Motor do WhatsApp</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lembretes pelo seu WhatsApp</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Para manter o sistema com o melhor custo-benefício do mercado, nós integramos o envio de mensagens diretamente no seu celular ou computador, sem custos adicionais de API.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left max-w-lg mx-auto w-full">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" /> Como funciona na prática?
            </h3>
            <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
              <li>O cliente agenda um horário na sua página pública.</li>
              <li>O agendamento aparece na sua aba <strong>Agenda</strong>.</li>
              <li>Ao lado do nome do cliente, você verá um ícone verde do WhatsApp.</li>
              <li>Ao clicar no ícone, o seu WhatsApp abrirá com uma <strong>mensagem pronta</strong> para enviar ao cliente.</li>
              <li>Basta apertar "Enviar" no seu WhatsApp!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ user, shopName, setShopName, shopDescription, setShopDescription, primaryColor, setPrimaryColor, logoUrl, setLogoUrl, bannerUrl, setBannerUrl, slug, setSlug, services, setServices }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [newService, setNewService] = useState({ name: '', desc: '', price: '', time: '' });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Basic slug formatting: lowercase, no spaces, no special chars
      const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setSlug(formattedSlug || user.uid);
      
      await setDoc(doc(db, 'barbershops', user.uid), { shopName, shopDescription, primaryColor, logoUrl, bannerUrl, slug: formattedSlug || user.uid, services }, { merge: true });
      alert("Configurações salvas!");
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    setServices([...services, { id: Date.now(), name: newService.name, desc: newService.desc, price: Number(newService.price), time: newService.time || '30 min' }]);
    setNewService({ name: '', desc: '', price: '', time: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Página</h1>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Link Share Section */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
        <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5" /> Seu Link de Agendamento
        </h2>
        <p className="text-sm text-indigo-700 mb-4">
          Copie o link abaixo e coloque na <strong>Bio do seu Instagram</strong> ou envie no WhatsApp para seus clientes agendarem sozinhos.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            readOnly 
            value={`${window.location.origin}/${slug || user.uid}`} 
            className="flex-1 border border-indigo-200 rounded-lg px-4 py-3 bg-white text-gray-700 font-medium outline-none" 
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${slug || user.uid}`);
              alert("Link copiado! Agora é só colar no seu Instagram.");
            }}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            Copiar Link
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Personalizado (Slug)</label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500 text-sm">
                clientflowsistema.vercel.app/
              </span>
              <input 
                type="text" 
                value={slug} 
                onChange={e => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  setSlug(val);
                }} 
                placeholder="barbearia-do-ze"
                className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Escolha um nome curto e sem espaços para o seu link ficar mais bonito.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Estabelecimento</label>
            <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
            <textarea value={shopDescription} onChange={e => setShopDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link da Foto/Logo da Barbearia (Opcional)</label>
            <input type="url" placeholder="https://exemplo.com/minha-foto.jpg" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <p className="text-xs text-gray-500 mt-1">Cole o link de uma imagem (ex: do seu Instagram ou Google Drive).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link da Imagem de Fundo / Banner (Opcional)</label>
            <input type="url" placeholder="https://exemplo.com/meu-banner.jpg" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <p className="text-xs text-gray-500 mt-1">Cole o link de uma imagem retangular para o topo da sua página.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor Principal</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-20 cursor-pointer rounded border border-gray-300 p-1" />
              <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{primaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Serviços</h2>
        <form onSubmit={handleAddService} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs text-gray-500 mb-1">Nome *</label><input required type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Preço (R$) *</label><input required type="number" step="0.01" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Descrição</label><input type="text" value={newService.desc} onChange={e => setNewService({...newService, desc: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Tempo Estimado</label><input type="text" value={newService.time} onChange={e => setNewService({...newService, time: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Adicionar Serviço
          </button>
        </form>
        <div className="space-y-3">
          {services.map(service => (
            <div key={service.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-white">
              <div>
                <p className="font-semibold text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500">R$ {service.price.toFixed(2)} • {service.time}</p>
              </div>
              <button onClick={() => setServices(services.filter((s:any) => s.id !== service.id))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingTab({ user, status }: { user: User, status: string }) {
  const pixKey = "02172219630";
  const pixName = "Gustavo Enrique Targino de Medeiros";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave Pix copiada com sucesso!");
  };

  const isActive = status === 'active';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assinatura do Sistema</h1>
      
      {/* Status Banner */}
      {!isActive && (
        <div className="p-4 rounded-xl border bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-600" />
            <div>
              <h3 className="font-bold text-yellow-900">
                Acesso Restrito
              </h3>
              <p className="text-sm mt-1 text-yellow-800">
                Realize o pagamento da sua assinatura abaixo para liberar o sistema e começar a receber agendamentos.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-indigo-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Plano Pro</h2>
              <p className="text-gray-600 mt-1">Acesso completo ao sistema e WhatsApp</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-600">R$ 49,00<span className="text-sm text-gray-500 font-normal">/mês</span></p>
              {isActive ? (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Ativo</span>
              ) : (
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Aguardando Pagamento</span>
              )}
            </div>
          </div>
        </div>
        
        {!isActive && (
          <div className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Como pagar sua assinatura</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* PIX MANUAL */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2 text-center">Opção 1: Pix Direto</h4>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Escaneie o QR Code ou copie a chave.
                </p>
                
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <QRCodeSVG value="00020101021126580014br.gov.bcb.pix013602172219630520400005303986540549.905802BR5925Gustavo Enrique Targino d6009Sao Paulo62070503***63041D3D" size={140} />
                  </div>
                </div>

                <div className="mt-auto bg-white p-3 border border-gray-300 rounded-lg text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Chave Pix</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{pixKey}</p>
                  <p className="text-xs text-gray-500 mt-1">Gustavo Enrique Targino De Medeiros</p>
                  <button 
                    onClick={handleCopyPix}
                    className="w-full mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Copiar Chave
                  </button>
                  <a 
                    href={`https://wa.me/5534992425286?text=Ol%C3%A1%20Gustavo,%20j%C3%A1%20paguei%20com%20Pix%20e%20meu%20email%20%C3%A9%20${user?.email}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full mt-2 block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Já paguei com Pix
                  </a>
                </div>
              </div>

              {/* MERCADO PAGO */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 flex flex-col">
                <h4 className="font-bold text-blue-900 mb-2 text-center flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Opção 2: Mercado Pago
                </h4>
                <p className="text-sm text-blue-800 mb-6 text-center">
                  Pague com Cartão de Crédito, Boleto ou Pix através do Mercado Pago.
                </p>
                
                <div className="flex-1 flex items-center justify-center mb-6">
                  <div className="w-32 h-32 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center justify-center text-blue-500">
                    <ShieldCheck className="w-16 h-16" />
                  </div>
                </div>
                
                <div className="mt-auto">
                  <a 
                    href={`https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=82a1d4268641460eb1ae6fe780b65ae1&external_reference=${user?.uid}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Pagar com Mercado Pago
                  </a>
                </div>
              </div>
            </div>

            {/* SUPORTE WHATSAPP */}
            <div className="bg-green-50 p-5 rounded-xl border border-green-200 flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-full shrink-0">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-900">Pagou e não liberou? Ou teve algum problema?</h4>
                <p className="text-sm text-green-800 mt-1 mb-3">
                  Como o sistema está em fase de lançamento, a liberação pode levar alguns minutos. Se demorar ou se você tiver qualquer dúvida, chame o suporte direto no WhatsApp.
                </p>
                <a 
                  href="https://wa.me/5534992425286?text=Ol%C3%A1%20Gustavo,%20fiz%20o%20pagamento%20do%20ClientFlow%20e%20preciso%20de%20ajuda." 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Falar com Suporte (WhatsApp)
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TutorialTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Como usar o sistema</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">1. Configure sua página</h3>
          <p className="text-gray-600">Vá na aba "Configurações", coloque o nome da sua barbearia, escolha a cor que combina com sua marca e cadastre todos os seus serviços com preço e tempo de duração.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">2. Conecte o WhatsApp</h3>
          <p className="text-gray-600">Vá na aba "WhatsApp", pegue o celular da barbearia e leia o QR Code. Isso fará com que o sistema envie mensagens automáticas do seu próprio número para os clientes.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">3. Divulgue seu Link</h3>
          <p className="text-gray-600">Copie o link da sua "Página Pública" (no menu lateral) e coloque na Bio do seu Instagram. Quando o cliente clicar, ele verá seus serviços e horários disponíveis.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">4. Gerencie a Agenda</h3>
          <p className="text-gray-600">Acompanhe a aba "Agenda". Quando um cliente agendar, aparecerá lá. Clique em "Confirmar" para avisar o cliente que está tudo certo!</p>
        </div>
      </div>
    </div>
  );
}

// --- DEBUG COMPONENT ---
function DebugSlugsList() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSlugs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'barbershops'));
        const allSlugs = querySnapshot.docs.map(doc => doc.data().slug || doc.id);
        setSlugs(allSlugs);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchAllSlugs();
  }, []);

  if (error) return <p className="text-red-500">Erro: {error}</p>;
  if (slugs.length === 0) return <p>Nenhuma barbearia no banco.</p>;
  
  return (
    <ul className="list-disc pl-4">
      {slugs.map((s, i) => <li key={i}>{s}</li>)}
    </ul>
  );
}

// --- PUBLIC BOOKING PAGE COMPONENT ---
function PublicPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState<any>(null);
  const [actualShopId, setActualShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Appointments for the selected date to block times
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Generate available times (09:00 to 19:00)
  const allTimes = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`);

  useEffect(() => {
    if (!shopId) return;
    
    const fetchShop = async () => {
      try {
        // Format the shopId from the URL just in case the user typed spaces or uppercase
        const formattedShopId = shopId.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        
        console.log("Fetching shop with ID/slug:", formattedShopId, "Original:", shopId);
        
        // Try to find by the exact slug in the URL first
        let q = query(collection(db, 'barbershops'), where('slug', '==', shopId));
        let querySnapshot = await getDocs(q);
        
        // If not found, try the formatted version
        if (querySnapshot.empty && formattedShopId !== shopId) {
           q = query(collection(db, 'barbershops'), where('slug', '==', formattedShopId));
           querySnapshot = await getDocs(q);
        }
        
        console.log("Query by slug empty?", querySnapshot.empty);
        
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          console.log("Found by slug:", docSnap.data());
          setShopData(docSnap.data());
          setActualShopId(docSnap.id);
        } else {
          // Fallback to finding by UID (for old links)
          const docSnap = await getDoc(doc(db, 'barbershops', shopId));
          console.log("Fallback by UID exists?", docSnap.exists());
          if (docSnap.exists()) {
            setShopData(docSnap.data());
            setActualShopId(docSnap.id);
          }
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  useEffect(() => {
    if (!actualShopId) return;
    // Fetch appointments for the selected date to block times
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const q = query(
      collection(db, 'appointments'), 
      where('barbershopId', '==', actualShopId),
      where('date', '==', dateStr),
      where('status', '==', 'booked')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const times = snapshot.docs.map(doc => doc.data().time);
      setBookedTimes(times);
    });

    return () => unsub();
  }, [actualShopId, selectedDate]);

  const handleBook = async () => {
    if (!selectedService || !selectedTime || !clientName || !clientPhone || !actualShopId) return;
    
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        barbershopId: actualShopId,
        clientName,
        clientPhone,
        service: selectedService.name,
        price: selectedService.price,
        time: selectedTime,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: 'booked',
        confirmed: false,
        createdAt: serverTimestamp()
      });
      navigate(`/agendamento/${docRef.id}`);
    } catch (error) {
      alert("Erro ao agendar. Tente novamente.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p>Carregando...</p></div>;
  if (!shopData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Barbearia não encontrada</h2>
          <p className="text-gray-600 mb-4">
            Não conseguimos encontrar nenhuma barbearia com o link:<br/>
            <strong className="text-gray-900 break-all">{shopId}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Verifique se o link foi digitado corretamente ou se o barbeiro já configurou o endereço.
          </p>
          
          {/* DEBUG INFO - REMOVE LATER */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto max-h-40">
            <p className="font-bold text-gray-700 mb-2">Debug Info (Slugs no Banco):</p>
            <DebugSlugsList />
          </div>
        </div>
      </div>
    );
  }

  // Calendar logic
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="h-48 w-full bg-gray-800 relative">
        <img src={shopData.bannerUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80"} alt="Banner" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
          <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-white shadow-sm overflow-hidden -mt-16 mb-4">
            <img src={shopData.logoUrl || "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=200&q=80"} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{shopData.shopName}</h1>
          <p className="text-gray-600 mt-2 text-sm">{shopData.shopDescription}</p>
        </div>

        {/* Step 1: Select Service */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">1. Escolha o Serviço</h2>
          <div className="space-y-3">
            {shopData.services?.map((service: any) => (
              <div 
                key={service.id} 
                onClick={() => setSelectedService(service)}
                style={selectedService?.id === service.id ? { borderColor: shopData.primaryColor || '#4f46e5', backgroundColor: `${shopData.primaryColor || '#4f46e5'}10` } : {}}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedService?.id === service.id ? 'ring-1' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.time}</p>
                  </div>
                  <p className="font-bold text-gray-900">R$ {service.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Calendar & Time (Only show if service is selected) */}
        {selectedService && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">2. Escolha Data e Horário</h2>
            
            {/* Week Calendar */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
              <span className="font-medium capitalize">{format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</span>
              <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-6">
              {daysInWeek.map(day => {
                const isSelected = isSameDay(day, selectedDate);
                const isPast = isBefore(day, startOfDay(new Date()));
                return (
                  <button
                    key={day.toISOString()}
                    disabled={isPast}
                    onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                    style={isSelected && !isPast ? { backgroundColor: shopData.primaryColor || '#4f46e5', color: 'white' } : {}}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isPast ? 'opacity-30 cursor-not-allowed' : isSelected ? '' : 'hover:bg-gray-100'}`}
                  >
                    <span className="text-xs mb-1">{format(day, 'EEE', { locale: ptBR }).substring(0, 3)}</span>
                    <span className="font-bold">{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {allTimes.map(time => {
                const isBooked = bookedTimes.includes(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    style={isSelected && !isBooked ? { backgroundColor: shopData.primaryColor || '#4f46e5', color: 'white', borderColor: shopData.primaryColor || '#4f46e5' } : {}}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' : isSelected ? 'shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Confirm (Only show if time is selected) */}
        {selectedTime && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">3. Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome Completo</label>
                <input 
                  type="text" 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)} 
                  placeholder="Ex: João Silva"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu WhatsApp</label>
                <input 
                  type="tel" 
                  value={clientPhone} 
                  onChange={e => setClientPhone(e.target.value)} 
                  placeholder="Ex: 11999999999"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <button 
                onClick={handleBook}
                disabled={!clientName || !clientPhone}
                style={{ backgroundColor: shopData.primaryColor || '#4f46e5' }}
                className="w-full py-4 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- CLIENT APPOINTMENT PAGE ---
function ClientAppointmentPage() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;

    const unsub = onSnapshot(doc(db, 'appointments', appointmentId), async (docSnap) => {
      if (docSnap.exists()) {
        const aptData = docSnap.data();
        setAppointment(aptData);
        
        // Fetch shop data
        const shopSnap = await getDoc(doc(db, 'barbershops', aptData.barbershopId));
        if (shopSnap.exists()) {
          setShopData(shopSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [appointmentId]);

  const handleCancel = async () => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await updateDoc(doc(db, 'appointments', appointmentId!), { status: 'cancelled' });
        alert("Agendamento cancelado com sucesso.");
      } catch (error) {
        alert("Erro ao cancelar.");
      }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p>Carregando...</p></div>;
  if (!appointment) return <div className="flex h-screen items-center justify-center"><p>Agendamento não encontrado.</p></div>;

  const isCancelled = appointment.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {isCancelled ? <X className="w-8 h-8" /> : <Check className="w-8 h-8" />}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isCancelled ? 'Agendamento Cancelado' : 'Agendamento Confirmado!'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isCancelled 
            ? 'Este horário foi liberado na agenda.' 
            : 'Guarde este link. Você pode usá-lo para consultar ou cancelar seu horário.'}
        </p>

        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-8 border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Barbearia</p>
            <p className="font-medium text-gray-900">{shopData?.shopName || 'Carregando...'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Data</p>
              <p className="font-medium text-gray-900">{appointment.date.split('-').reverse().join('/')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Horário</p>
              <p className="font-medium text-gray-900">{appointment.time}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Serviço</p>
            <p className="font-medium text-gray-900">{appointment.service}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cliente</p>
            <p className="font-medium text-gray-900">{appointment.clientName}</p>
          </div>
        </div>

        {!isCancelled && (
          <button 
            onClick={handleCancel}
            className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            Cancelar Agendamento
          </button>
        )}
        
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiado!");
          }}
          className="w-full mt-2 py-3 text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors"
        >
          Copiar Link deste Agendamento
        </button>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Trash2, CreditCard, Home, ShoppingCart, Car, Tv,
    Zap, TrendingUp, Calendar, MoreVertical, X, Wallet,
    ChevronLeft, ChevronRight, Wifi, ArrowUpCircle, DollarSign,
    Save, PieChart, Target, LayoutDashboard, Menu, Bell,
    Search, LogOut, Filter, Pencil, Smartphone
} from 'lucide-react';
import {
    PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import Login from './components/Login';
import { db, auth } from './firebase';
import {
    collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const BASE_DATE = new Date();

function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

const CATEGORY_MAP = {
    tech: { icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Eletrônicos', hex: '#c084fc' },
    education: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Educação', hex: '#60a5fa' },
    debt: { icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Dívidas', hex: '#fb7185' },
    home: { icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Casa', hex: '#34d399' },
    food: { icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Alimentação', hex: '#fbbf24' },
    transport: { icon: Car, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', label: 'Transporte', hex: '#38bdf8' },
    leisure: { icon: Tv, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', label: 'Lazer', hex: '#e879f9' },
    services: { icon: Wifi, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'Serviços', hex: '#818cf8' },
    others: { icon: MoreVertical, color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', label: 'Outros', hex: '#94a3b8' },
};

const TYPE_MAP = {
    fixed: { label: 'Recorrente', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    installment: { label: 'Parcelado', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    'one-time': { label: 'Avulso', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' }
};

export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);

            if (currentUser) {
                setLoadingExpenses(true);
                const expensesCollectionRef = collection(db, `users/${currentUser.uid}/expenses`);
                const q = query(expensesCollectionRef, orderBy('createdAt', 'desc'));

                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const fetchedExpenses = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setExpenses(fetchedExpenses);
                    setLoadingExpenses(false);
                }, (error) => {
                    console.error("Error fetching expenses: ", error);
                    setLoadingExpenses(false);
                });
                return () => unsubscribeSnapshot();
            } else {
                setExpenses([]);
                setLoadingExpenses(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const [income, setIncome] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('income');
            return saved ? JSON.parse(saved) : { default: 6000, exceptions: {} };
        }
        return { default: 6000, exceptions: {} };
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterType, setFilterType] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        type: 'fixed',
        current: 1,
        total: 12,
        category: 'others'
    });

    useEffect(() => {
        localStorage.setItem('income', JSON.stringify(income));
    }, [income]);

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        if (!isDarkMode) {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
    const currentMonthKey = getMonthKey(selectedDate);
    const isUsingCustomIncome = income.exceptions.hasOwnProperty(currentMonthKey);
    const currentIncome = isUsingCustomIncome ? income.exceptions[currentMonthKey] : income.default;

    const changeMonth = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const handleIncomeChange = (e) => {
        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
        setIncome(prev => {
            if (isUsingCustomIncome) {
                return {
                    ...prev,
                    exceptions: {
                        ...prev.exceptions,
                        [currentMonthKey]: val
                    }
                };
            } else {
                return {
                    ...prev,
                    default: val
                };
            }
        });
    };

    const currentMonthExpenses = useMemo(() => {
        return expenses.map(item => {
            if (item.type === 'fixed') return item;
            if (item.type === 'one-time') {
                const itemDate = item.date ? new Date(item.date) : (item.createdAt ? new Date(item.createdAt) : new Date());
                const itemMonthDiff = (selectedDate.getFullYear() - itemDate.getFullYear()) * 12 + (selectedDate.getMonth() - itemDate.getMonth());
                return itemMonthDiff === 0 ? item : null;
            }
            if (item.type === 'installment') {
                const itemDate = item.date ? new Date(item.date) : (item.createdAt ? new Date(item.createdAt) : new Date());
                const diffFromStart = (selectedDate.getFullYear() - itemDate.getFullYear()) * 12 + (selectedDate.getMonth() - itemDate.getMonth());
                const projectedCurrent = (item.current || 1) + diffFromStart;

                if (projectedCurrent > 0 && projectedCurrent <= item.total) {
                    return { ...item, current: projectedCurrent };
                }
                return null;
            }
            return item;
        }).filter(Boolean);
    }, [expenses, selectedDate]);

    const stats = useMemo(() => {
        const totalMonthly = currentMonthExpenses.reduce((acc, item) => acc + item.value, 0);
        const incomeVal = Number(currentIncome) || 0;
        const balance = incomeVal - totalMonthly;
        const expenseRatio = incomeVal > 0 ? (totalMonthly / incomeVal) * 100 : 0;

        return { totalMonthly, balance, income: incomeVal, expenseRatio };
    }, [currentMonthExpenses, currentIncome]);

    const filteredDisplayList = useMemo(() => {
        if (filterType === 'all') return currentMonthExpenses;
        if (filterType === 'fixed') return currentMonthExpenses.filter(e => e.type === 'fixed' || e.type === 'one-time');
        return currentMonthExpenses.filter(e => e.type === filterType);
    }, [currentMonthExpenses, filterType]);

    const handleDelete = async (id) => {
        if (!user) return;
        if (window.confirm('Excluir este lançamento permanentemente?')) {
            try {
                await deleteDoc(doc(db, `users/${user.uid}/expenses`, id));
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Erro ao excluir: " + error.message);
            }
        }
    };

    const handleEdit = (item) => {
        const original = expenses.find(e => e.id === item.id);
        if (!original) return;
        setEditingId(original.id);
        setFormData({
            name: original.name,
            value: original.value.toString(),
            type: original.type,
            current: original.current || 1,
            total: original.total || 12,
            category: original.category
        });
        setIsModalOpen(true);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!user) return;

        const expenseData = {
            name: formData.name,
            value: parseFloat(formData.value),
            type: formData.type,
            category: formData.category,
            ...(formData.type === 'installment' && {
                current: parseInt(formData.current),
                total: parseInt(formData.total)
            }),
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        try {
            if (editingId) {
                const { createdAt, ...updateData } = expenseData;
                await updateDoc(doc(db, `users/${user.uid}/expenses`, editingId), updateData);
            } else {
                await addDoc(collection(db, `users/${user.uid}/expenses`), expenseData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', value: '', type: 'fixed', current: 1, total: 12, category: 'others' });
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({ name: '', value: '', type: 'fixed', current: 1, total: 12, category: 'others' });
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const displayDate = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    if (authLoading || loadingExpenses) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0914]">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <Zap size={24} className="absolute text-purple-500 animate-pulse" />
                </div>
                <p className="mt-8 text-[11px] font-bold uppercase tracking-widest animate-pulse text-purple-400">
                    {authLoading ? 'Autenticando...' : 'Preparando Painel...'}
                </p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden font-inter transition-colors duration-500 relative">

            {/* Ambient Animated Glows */}
            <div className="fixed top-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }}></div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in-up"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-72 border-r transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 backdrop-blur-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white/80 border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
                <div className="flex flex-col h-full p-6 relative z-10">
                    <div className="flex items-center justify-between mb-10 px-2 lg:justify-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Zap size={20} className="text-white fill-white/20" />
                            </div>
                            <div>
                                <h1 className={`text-xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Finance<span className="text-gradient">Flow</span>
                                </h1>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-slate-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <div className={`text-[10px] font-bold uppercase tracking-widest px-4 mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Monitoramento</div>
                        <button
                            onClick={() => { setFilterType('all'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'all' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <LayoutDashboard size={18} className={filterType === 'all' ? 'text-purple-400' : ''} /> <span>Visão Geral</span>
                        </button>
                        <button
                            onClick={() => { setFilterType('fixed'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'fixed' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <Target size={18} className={filterType === 'fixed' ? 'text-purple-400' : ''} /> <span>Recorrentes & Avulsas</span>
                        </button>
                        <button
                            onClick={() => { setFilterType('installment'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'installment' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <CreditCard size={18} className={filterType === 'installment' ? 'text-purple-400' : ''} /> <span>Acompanhar Parcelas</span>
                        </button>
                    </nav>

                    <div className="pt-6 border-t mt-auto space-y-4 border-white/5">
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm text-white shadow-inner shrink-0">
                                {user?.displayName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.displayName?.split(' ')[0] || 'Usuário'}</p>
                                <p className="text-[10px] text-purple-400 truncate font-bold uppercase tracking-widest">Premium Assiant</p>
                            </div>
                            <button className={`p-2 rounded-xl transition-colors shrink-0 ${isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`} onClick={handleLogout} title="Sair do sistema">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 h-screen overflow-y-auto relative scroll-smooth bg-transparent px-2 lg:px-0">
                <div className="max-w-[1400px] mx-auto">
                    {/* HEADER */}
                    <header className={`sticky top-0 z-40 backdrop-blur-3xl border-b h-20 flex items-center justify-between px-6 lg:px-10 transition-colors ${isDarkMode ? 'bg-[#0b0914]/60 border-white/5' : 'bg-white/80 border-slate-200'}`}>
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <Menu size={20} />
                            </button>

                            <div className={`hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl border w-full max-w-md transition-all ${isDarkMode ? 'bg-black/20 border-white/5 focus-within:border-purple-500/50 focus-within:bg-white/5 text-white' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-400 text-slate-900'}`}>
                                <Search size={16} className="text-slate-400 shrink-0" />
                                <input type="text" placeholder="Consultar lançamentos..." className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-slate-500" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 outline-none">
                            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl transition-all hidden sm:block border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {isDarkMode ? <Home size={18} /> : <Zap size={18} />}
                            </button>

                            <button className={`p-2.5 rounded-xl transition-all relative hidden sm:block border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}>
                                <Bell size={18} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#1a1428] shadow-sm"></span>
                            </button>

                            <div className={`w-px h-6 mx-2 hidden sm:block ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

                            <button onClick={openNewModal} className="hbo-button px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                <Plus size={18} className="hidden sm:block" /> Novo Lançamento
                            </button>
                        </div>
                    </header>

                    <main className="p-4 lg:p-8 pb-32 space-y-6 lg:space-y-8">

                        {/* HERO / METRICS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                            <div className="md:col-span-2 xl:col-span-3 hbo-card p-6 lg:p-8 flex flex-col md:flex-row items-end justify-between gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_100%_0%,_rgba(124,58,237,0.15)_0%,_transparent_50%)] rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                                <div className="relative z-10 w-full md:w-auto">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5">
                                            <Wallet className="text-white" size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Saldo Disponível</span>
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">
                                        {formatMoney(stats.balance)}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${stats.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                            {stats.balance >= 0 ? 'Operando no Azul' : 'Limite Excedido'}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mês projetado</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl relative z-10 w-full md:w-auto justify-between md:justify-center shrink-0">
                                    <button onClick={() => changeMonth(-1)} className="p-2 lg:p-3 rounded-xl text-purple-400 hover:bg-white/10 hover:text-white transition-all"><ChevronLeft size={20} /></button>
                                    <div className="px-5 lg:px-8 text-center border-x border-white/5">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Período</p>
                                        <p className="text-base lg:text-lg font-bold capitalize text-white min-w-[110px]">
                                            {displayDate.split(' de ')[0]} <span className="text-purple-400 opacity-80">{displayDate.split(' de ')[1]}</span>
                                        </p>
                                    </div>
                                    <button onClick={() => changeMonth(1)} className="p-2 lg:p-3 rounded-xl text-purple-400 hover:bg-white/10 hover:text-white transition-all"><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            <div className="hbo-card p-8 flex flex-col justify-between min-h-[220px]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shadow-inner">
                                        <DollarSign size={20} />
                                    </div>
                                    {isUsingCustomIncome && (
                                        <button onClick={() => setIncome(prev => { const n = { ...prev }; delete n.exceptions[currentMonthKey]; return n; })} className="text-[9px] font-bold text-indigo-400 hover:text-white uppercase tracking-widest transition-colors bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/20">Resetar</button>
                                    )}
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Receita Projetada</span>
                                    <div className="flex items-center gap-2 relative group/input cursor-text">
                                        <div className="flex items-baseline gap-1 flex-1">
                                            <span className="text-base font-bold text-slate-500">R$</span>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                value={currentIncome} 
                                                onChange={handleIncomeChange} 
                                                className="bg-transparent text-3xl lg:text-4xl font-black outline-none w-full !border-none !ring-0 p-0 text-white tracking-tight focus:text-purple-400 transition-colors min-h-[44px]" 
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <Pencil size={14} className="text-purple-400/50 group-hover/input:text-purple-400 transition-colors shrink-0" />
                                    </div>
                                </div>
                            </div>

                            <div className="hbo-card p-5 lg:p-6 flex flex-col justify-between min-h-[160px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 shadow-inner">
                                        <ArrowUpCircle size={20} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Comprometido</span>
                                    <h3 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">{formatMoney(stats.totalMonthly)}</h3>
                                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.expenseRatio, 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="hbo-card p-5 lg:p-6 flex flex-col justify-between min-h-[160px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-inner">
                                        <Target size={20} />
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Saudável</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Eficiência</span>
                                    <h3 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">{((100 - stats.expenseRatio) || 0).toFixed(1)}%</h3>
                                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${Math.min(Math.max(100 - stats.expenseRatio, 0), 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* LIST & CHART SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 mt-6">

                            {/* HISTORY / TRANSACTIONS */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm lg:text-base font-black uppercase tracking-tight flex items-center gap-3">
                                        <Filter size={18} className="text-purple-400" /> Relatório Detalhado
                                    </h3>
                                    <span className="hbo-badge">
                                        {filteredDisplayList.length} ocorrências
                                    </span>
                                </div>

                                {filteredDisplayList.length === 0 ? (
                                    <div className="hbo-card py-24 flex flex-col items-center justify-center text-center border-dashed border-white/20">
                                        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-6 shadow-inner">
                                            <Search size={28} />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 text-white">Base limpa</h3>
                                        <p className="text-sm font-medium text-slate-500">Não há registros detectados neste recorte temporal.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredDisplayList.map((item) => {
                                            const Config = CATEGORY_MAP[item.category] || CATEGORY_MAP.others;
                                            const progress = item.total ? (item.current / item.total) * 100 : 0;
                                            const remaining = item.total ? (item.total - item.current) * item.value : 0;

                                            return (
                                                <div key={item.id} className="hbo-card overflow-hidden group transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-2xl">
                                                    <div className="p-4 lg:p-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            {/* Left Section: Icon & Identity */}
                                                            <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                                                                <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex shrink-0 items-center justify-center border shadow-lg ${Config.bg} ${Config.border} ${Config.color} transition-transform group-hover:scale-105 duration-300`}>
                                                                    <div className="lg:hidden"><Config.icon size={20} strokeWidth={2.5} /></div>
                                                                    <div className="hidden lg:block"><Config.icon size={26} strokeWidth={2.5} /></div>
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm lg:text-lg font-bold text-white tracking-tight leading-snug lg:truncate mb-1">
                                                                        {item.name}
                                                                    </h4>
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shadow-sm ${TYPE_MAP[item.type].bg} ${TYPE_MAP[item.type].color} ${TYPE_MAP[item.type].border}`}>
                                                                            {TYPE_MAP[item.type].label}
                                                                        </span>
                                                                        {item.type === 'installment' && (
                                                                            <span className="text-[9px] font-bold text-slate-400 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded">
                                                                                {item.current}/{item.total}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Category Label (Desktop position) */}
                                                                    <div className="hidden lg:block mt-3">
                                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${Config.color}`}>
                                                                            {Config.label}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right Section: Finance & Controls */}
                                                            <div className="flex flex-col items-end gap-3 lg:gap-4">
                                                                <div className="text-right">
                                                                    <div className="text-lg lg:text-3xl font-black text-white leading-none mb-1">{formatMoney(item.value)}</div>
                                                                    <div className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                                        Impacto Mensal
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1 lg:gap-1.5">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="p-2 lg:p-3 rounded-xl lg:rounded-2xl text-slate-300 hover:text-white bg-white/5 border border-white/5 lg:border-white/10 lg:hover:bg-white/10 transition-all shadow-sm group/btn"
                                                                        title="Editar"
                                                                    >
                                                                        <Pencil className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover/btn:scale-110" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="p-2 lg:p-3 rounded-xl lg:rounded-2xl text-slate-300 hover:text-rose-400 bg-white/5 border border-white/5 lg:border-white/10 lg:hover:bg-rose-500/10 transition-all shadow-sm group/btn"
                                                                        title="Excluir"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover/btn:scale-110" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Category & Status (Mobile position, bottom left) */}
                                                        <div className="lg:hidden mt-6 flex items-center justify-between">
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded bg-white/5 border border-white/5 ${Config.color}`}>
                                                                {Config.label}
                                                            </span>
                                                            {item.type === 'installment' && (
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                                                    Falta: {formatMoney(remaining)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar (Very extremity) */}
                                                    {item.type === 'installment' && (
                                                        <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
                                                            <div
                                                                className="absolute inset-y-0 left-0 transition-all duration-1000"
                                                                style={{
                                                                    width: `${progress}%`,
                                                                    backgroundColor: Config.hex,
                                                                    boxShadow: `0 0 10px ${Config.hex}60`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CHARTS / METRICS */}
                            <div className="xl:col-span-4 space-y-6">
                                <h3 className="text-sm lg:text-base font-black uppercase tracking-tight flex items-center gap-3 px-2 mb-2">
                                    <PieChart size={18} className="text-purple-400" /> Inteligência do Mix
                                </h3>
                                <div className="hbo-card p-5 lg:p-6 xl:sticky xl:top-28">
                                    <div className="h-[220px] w-full mb-6 relative">
                                        {/* Drop shadow glow behind chart */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={Object.entries(CATEGORY_MAP)
                                                        .map(([key, config]) => ({
                                                            name: config.label,
                                                            value: currentMonthExpenses.filter(e => e.category === key).reduce((acc, i) => acc + i.value, 0),
                                                        }))
                                                        .filter(d => d.value > 0)}
                                                    cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none"
                                                >
                                                    {Object.entries(CATEGORY_MAP).map(([key], index) => {
                                                        const val = currentMonthExpenses.filter(e => e.category === key).reduce((acc, i) => acc + i.value, 0);
                                                        if (val === 0) return null;
                                                        return <Cell key={`cell-${index}`} fill={CATEGORY_MAP[key].hex} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgba(11, 9, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', padding: '12px' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}
                                                    formatter={(value) => formatMoney(value)}
                                                />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(CATEGORY_MAP).map(([key, config]) => {
                                            const amount = currentMonthExpenses.filter(e => e.category === key).reduce((acc, i) => acc + i.value, 0);
                                            const totalMonthlyUsed = currentMonthExpenses.reduce((acc, e) => acc + e.value, 0);
                                            const perc = totalMonthlyUsed > 0 ? (amount / totalMonthlyUsed) * 100 : 0;
                                            if (amount === 0) return null;
                                            return (
                                                <div key={key} className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: config.hex }}></div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{config.label} <span className="text-white ml-1 opacity-50">({perc.toFixed(0)}%)</span></span>
                                                        </div>
                                                        <span className="text-sm font-bold text-white">{formatMoney(amount)}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div className="h-full rounded-full opacity-80" style={{ width: `${perc}%`, backgroundColor: config.hex, boxShadow: `0 0 8px ${config.hex}` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className={`py-12 px-6 border-t font-medium transition-all ${isDarkMode ? 'border-white/5 text-slate-500 bg-black/20' : 'border-slate-100 text-slate-400 bg-slate-50/50'}`}>
                        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <div className="flex items-center gap-2.5 mb-1 group cursor-default">
                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110">
                                        <Zap size={14} className="text-white fill-white/20" />
                                    </div>
                                    <span className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Finance<span className="text-purple-500">Flow</span>
                                    </span>
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.25em] font-bold opacity-60">© {new Date().getFullYear()} Todos os direitos reservados</p>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-1.5">
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50 mb-1">Engenharia e Design por</p>
                                <span className={`text-sm font-black tracking-widest uppercase flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    LUP <span className="text-indigo-400">Soluções Inteligentes</span>
                                </span>
                                <a 
                                    href="mailto:devjuniorcoelho@gmail.com" 
                                    className="text-[11px] font-bold text-purple-400/80 hover:text-purple-400 transition-colors mt-2 underline decoration-purple-500/30 underline-offset-4"
                                >
                                    devjuniorcoelho@gmail.com
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* FAB MOBILE */}
            <button
                onClick={openNewModal}
                className="lg:hidden fixed bottom-8 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
            >
                <Plus size={28} />
            </button>

            {/* MODAL / BOTTOM SHEET */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 animate-fade-in-up">
                    <div className="w-full lg:max-w-2xl bg-[#0b0914]/90 backdrop-blur-2xl rounded-t-[2rem] lg:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                                    {editingId ? <Pencil size={20} /> : <Plus size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase">{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Módulo de Inserção</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="p-6 lg:p-8 space-y-6 max-h-[80vh] overflow-y-auto relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Especificação do Gasto</label>
                                <input
                                    required type="text"
                                    className="hbo-input w-full p-4 font-bold text-lg"
                                    placeholder="Ex: Aluguel do Escritório"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Valor do Montante (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500 font-black">R$</span>
                                        <input
                                            required type="number" step="0.01"
                                            className="hbo-input w-full pl-12 p-4 font-black text-xl"
                                            placeholder="0,00"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Classificação</label>
                                    <select
                                        className="hbo-input w-full p-4 font-bold text-base cursor-pointer"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {Object.entries(CATEGORY_MAP).map(([key, config]) => (
                                            <option key={key} value={key} className="bg-slate-900 text-white font-bold">{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Natureza da Transação</label>
                                <div className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    {['fixed', 'installment', 'one-time'].map(type => (
                                        <button
                                            key={type} type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${formData.type === type ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {TYPE_MAP[type].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.type === 'installment' && (
                                <div className="grid grid-cols-2 gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 animate-fade-in-up">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Mês Correspondente</label>
                                        <input
                                            type="number"
                                            className="hbo-input w-full p-3.5 text-center text-lg font-black"
                                            value={formData.current}
                                            onChange={e => setFormData({ ...formData, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Extensão Total</label>
                                        <input
                                            type="number"
                                            className="hbo-input w-full p-3.5 text-center text-lg font-black"
                                            value={formData.total}
                                            onChange={e => setFormData({ ...formData, total: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="hbo-button w-full h-[64px] rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] mt-8 flex items-center justify-center gap-2">
                                {editingId ? <><Pencil size={18} /> Consolidar Alteração</> : <><Plus size={20} /> Aprovar Lançamento</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

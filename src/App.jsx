import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Trash2, CreditCard, Home, ShoppingCart, Car, Tv,
    Zap, TrendingUp, Calendar, MoreVertical, X, Wallet,
    ChevronLeft, ChevronRight, ChevronDown, Wifi, ArrowUpCircle, DollarSign,
    Save, PieChart, Target, LayoutDashboard, Menu, Bell,
    Search, LogOut, Filter, Pencil, Smartphone, Sparkles, Check, Info
} from 'lucide-react';
import {
    PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import Login from './components/Login';
import { db, auth } from './firebase';
import {
    collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, getDoc, setDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

const PricingModal = ({ isOpen, onClose, isPremium }) => {
    if (!isOpen) return null;

    const plans = [
        {
            name: 'Membro Free',
            price: 'R$ 0',
            period: '/mês',
            features: [
                'Controle de Gastos Diários',
                'Categorias de Gastos Básicas',
                'Lançamentos Ilimitados',
                'Resumo Mensal Visual'
            ],
            current: !isPremium,
            buttonText: 'Plano Atual',
            highlight: false
        },
        {
            name: 'Assinante Premium',
            price: 'R$ 19',
            period: ',90/mês',
            features: [
                'Tudo do Plano Free',
                'Sincronização em Nuvem em Tempo Real',
                'Relatórios Avançados de Performance',
                'IA Financeira para Sugestões',
                'Filtros de Pagamento Exclusivos',
                'Suporte Prioritário VIP'
            ],
            current: isPremium,
            buttonText: isPremium ? 'Seu Plano Ativo' : 'Evoluir para o Pro',
            highlight: true,
            tag: 'Mais Popular'
        }
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0b0914]/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
            <div className="bg-[#151225] border border-white/10 rounded-[32px] w-full max-w-4xl p-8 lg:p-12 relative z-10 animate-fade-in-up overflow-y-auto max-h-[90vh] custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-12 px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles size={12} /> Desbloqueie o próximo nível
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">Potencialize seu Controle Financeiro</h2>
                    <p className="text-slate-400 text-base lg:text-lg max-w-2xl mx-auto">Escolha o plano que melhor se adapta ao seu estilo de vida e conquiste sua liberdade financeira.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-4">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`relative p-8 lg:p-10 rounded-[40px] border flex flex-col transition-all duration-500 hover:scale-[1.02] ${plan.highlight ? 'bg-gradient-to-b from-purple-600/10 to-transparent border-purple-500/30 ring-1 ring-purple-500/10 shadow-2xl shadow-purple-500/5' : 'bg-white/[0.02] border-white/5'}`}>
                            {plan.tag && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/20">
                                    {plan.tag}
                                </span>
                            )}
                            <div className="mb-0">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                                    <span className="text-slate-500 font-bold text-lg">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-5 mb-10 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3.5 text-sm lg:text-base font-medium text-slate-300 leading-tight">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight ? 'bg-purple-500/20 text-purple-400 border border-purple-500/10' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={plan.current}
                                onClick={() => {
                                    if (!plan.current && plan.highlight) {
                                        // Futura integração com Stripe/MercadoPago
                                        alert('Simulação: Redirecionando para o Checkout...');
                                    }
                                }}
                                className={`w-full py-5 rounded-[22px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${plan.current ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed' : plan.highlight ? 'hbo-button shadow-xl shadow-purple-600/20 hover:shadow-purple-600/40 text-sm' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm'}`}
                            >
                                {plan.highlight && !plan.current && <Zap size={18} fill="currentColor" />}
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
                
                <p className="text-center mt-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                    Pagamento 100% seguro processado via criptografia de ponta. Cancelamento fácil a qualquer momento.
                </p>
            </div>
        </div>
    );
};

const CategoryReportModal = ({ isOpen, onClose, category, expenses, selectedDate, isDarkMode }) => {
    if (!isOpen || !category) return null;

    const config = CATEGORY_MAP[category];
    const categoryExpenses = expenses.filter(e => e.category === category);

    const total = categoryExpenses.reduce((sum, e) => sum + e.value, 0);

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0b0914]/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
            <div className={`w-full max-w-2xl rounded-[32px] border relative z-10 animate-fade-in-up overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#151225] border-white/10' : 'bg-white border-slate-200'}`}>
                {/* Header do Modal */}
                <div className={`p-8 border-b ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${config.bg} ${config.color}`}>
                                <config.icon size={28} />
                            </div>
                            <div>
                                <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{config.label}</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Detalhamento Mensal</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Acumulado</div>
                            <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatMoney(total)}</div>
                        </div>
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Lançamentos</div>
                            <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{categoryExpenses.length}</div>
                        </div>
                    </div>
                </div>

                {/* Lista de Gastos */}
                <div className="p-8 max-h-[400px] overflow-y-auto no-scrollbar">
                    <div className="space-y-3">
                        {categoryExpenses.length > 0 ? (
                            categoryExpenses.map(expense => (
                                <div key={expense.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-200 hover:bg-white '}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center opacity-80 ${isDarkMode ? 'bg-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
                                            <Calendar size={18} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{expense.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${TYPE_MAP[expense.type].bg} ${TYPE_MAP[expense.type].color}`}>
                                                    {TYPE_MAP[expense.type].label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatMoney(expense.value)}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-30 font-bold text-slate-500 italic">Nenhum gasto encontrado.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


function App() {
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

                const incomeRef = doc(db, `users/${currentUser.uid}/config/income`);
                const unsubscribeIncome = onSnapshot(incomeRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setIncome(docSnap.data());
                    } else {
                        setIncome({ default: 6000, exceptions: {} });
                    }
                });

                return () => {
                    unsubscribeSnapshot();
                    unsubscribeIncome();
                };
            } else {
                setExpenses([]);
                setIncome({ default: 6000, exceptions: {} });
                setLoadingExpenses(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const [income, setIncome] = useState({ default: 6000, exceptions: {} });
    const [isEditingIncome, setIsEditingIncome] = useState(false);
    const [tempIncome, setTempIncome] = useState('');
    const [readNotifications, setReadNotifications] = useState(() => {
        const saved = localStorage.getItem('readNotifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterType, setFilterType] = useState('all');
    const [isPremium, setIsPremium] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExpenseDetail, setSelectedExpenseDetail] = useState(null);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        totalValue: '',
        type: 'fixed',
        total: '',
        paidCount: '',
        category: '',
        dueDay: '',
        inputMode: 'total'
    });

    useEffect(() => {
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    }, [readNotifications]);

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
            setIsSidebarOpen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Bloquear scroll do fundo de forma robusta para Mobile/iOS
    useEffect(() => {
        if (isSidebarOpen && window.innerWidth < 1024) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

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
        // Máscara monetária simples
        const value = e.target.value.replace(/\D/g, "");
        const numericValue = value ? parseInt(value) / 100 : 0;
        setTempIncome(numericValue.toString());
    };

    const saveIncome = async () => {
        if (!user) return;
        const val = parseFloat(tempIncome) || 0;
        const newIncome = { 
            ...income,
            exceptions: {
                ...income.exceptions,
                [currentMonthKey]: val
            }
        };

        setIncome(newIncome);
        setIsEditingIncome(false);
        try {
            await setDoc(doc(db, `users/${user.uid}/config/income`), newIncome);
        } catch (error) {
            console.error("Error saving income: ", error);
        }
    };

    const handleResetIncome = async () => {
        if (!user) return;
        const newIncome = { ...income };
        delete newIncome.exceptions[currentMonthKey];

        setIncome(newIncome);
        try {
            await setDoc(doc(db, `users/${user.uid}/config/income`), newIncome);
        } catch (error) {
            console.error("Error resetting income: ", error);
        }
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

        const fixedTotal = currentMonthExpenses.filter(e => e.type === 'fixed').reduce((acc, e) => acc + e.value, 0);
        const oneTimeTotal = currentMonthExpenses.filter(e => e.type === 'one-time').reduce((acc, e) => acc + e.value, 0);
        const installmentTotal = currentMonthExpenses.filter(e => e.type === 'installment').reduce((acc, e) => acc + e.value, 0);

        const chartData = Object.entries(CATEGORY_MAP).map(([key, config]) => {
            const value = currentMonthExpenses
                .filter(e => e.category === key)
                .reduce((sum, e) => sum + e.value, 0);
            return {
                key,
                name: config.label,
                value,
                color: config.hex
            };
        }).filter(item => item.value > 0);

        const incomeVal = Number(currentIncome) || 0;
        const balance = incomeVal - totalMonthly;
        const expenseRatio = incomeVal > 0 ? (totalMonthly / incomeVal) * 100 : 0;

        return { totalMonthly, balance, income: incomeVal, expenseRatio, chartData, fixedTotal, oneTimeTotal, installmentTotal };
    }, [currentMonthExpenses, currentIncome]);

    const notifications = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        return currentMonthExpenses.filter(e => {
            if (!e.dueDay) return false;
            const dueDay = parseInt(e.dueDay);
            
            // Verifica se o vencimento é neste mês e se faltam 3 dias ou menos
            const dueDate = new Date(currentYear, currentMonth, dueDay);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays >= 0 && diffDays <= 3;
        }).map(e => ({
            id: `notif-${e.id}-${currentMonth}`,
            title: `Vencimento Próximo`,
            message: `A fatura de "${e.name}" vence em ${e.dueDay}/${currentMonth + 1}.`,
            expense: e
        }));
    }, [currentMonthExpenses]);

    const unreadNotifications = notifications.filter(n => !readNotifications.includes(n.id));

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadNotifications(prev => [...new Set([...prev, ...allIds])]);
    };

    const { chartData, totalMonthly: totalExpensesValue } = stats;

    const filteredDisplayList = useMemo(() => {
        let list = [...currentMonthExpenses];
        
        if (filterType !== 'all') {
            if (filterType === 'fixed') {
                list = list.filter(e => e.type === 'fixed' || e.type === 'one-time');
            } else {
                list = list.filter(e => e.type === filterType);
            }
        }

        return list;
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

        // item.current = parcela projetada para o mês que o usuário está vendo (ex: 4 em Março)
        // paidCount = parcelas já pagas = projectedCurrent - 1 (ex: 3)
        // Ao salvar, a lógica sempre grava current=1 e recalcula a data de início
        const projectedCurrent = item.current || 1;

        setEditingId(original.id);
        setFormData({
            name: original.name,
            value: original.value.toString(),
            totalValue: (original.totalValue || (original.value * (original.total || 1))).toString(),
            type: original.type,
            current: projectedCurrent,
            total: original.total || '',
            paidCount: projectedCurrent - 1, // quantas já foram pagas
            category: original.category || '',
            dueDay: original.dueDay || '',
            inputMode: 'total'
        });
        setIsModalOpen(true);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!user) return;
        
        if (!formData.category) {
            alert("Por favor, selecione uma categoria para o gasto.");
            return;
        }
        
        if ((formData.type === 'installment' || formData.type === 'fixed') && !formData.dueDay) {
            alert("Por favor, informe o dia do vencimento.");
            return;
        }

        let calculatedValue = parseFloat(formData.value) || 0;
        let startCurrentForSave = 1;  // current da parcela que ficará salva no banco
        let expenseSaveDate;

        const today = new Date();
        const todayDay = today.getDate();
        const dueDayInt = parseInt(formData.dueDay);
        const closingDay = dueDayInt - 10;
        let effectiveDate = new Date();
        
        if (!isNaN(closingDay) && todayDay > closingDay) {
            effectiveDate.setMonth(effectiveDate.getMonth() + 1);
        }

        if (formData.type === 'installment') {
            const total = parseInt(formData.total) || 12;
            
            if (formData.inputMode === 'installment') {
                calculatedValue = parseFloat(formData.value) || 0;
            } else {
                const totalVal = parseFloat(formData.totalValue) || 0;
                calculatedValue = totalVal / total;
            }

            startCurrentForSave = 1;

            const paid = Math.max(0, parseInt(formData.paidCount || 0));
            const refDate = new Date(effectiveDate); // Apply closing date rule first
            refDate.setDate(1); // avoid jumping months on days like 31
            refDate.setMonth(refDate.getMonth() - paid);
            refDate.setDate(parseInt(formData.dueDay) || 1);
            expenseSaveDate = refDate.toISOString();
        }

        const finalDate = (formData.type === 'installment' && expenseSaveDate)
            ? expenseSaveDate
            : effectiveDate.toISOString();

        const expenseData = {
            name: formData.name,
            value: calculatedValue,
            type: formData.type,
            category: formData.category,
            ...(formData.type === 'installment' && {
                current: startCurrentForSave,
                total: parseInt(formData.total),
                totalValue: formData.inputMode === 'installment' 
                    ? calculatedValue * parseInt(formData.total) 
                    : (parseFloat(formData.totalValue) || calculatedValue * parseInt(formData.total))
            }),
            dueDay: formData.dueDay,
            date: finalDate,
            createdAt: new Date().toISOString(),
            isFutureBilling: todayDay > closingDay
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
            setFormData({ name: '', value: '', totalValue: '', type: 'fixed', current: 1, total: '', paidCount: '', category: '', dueDay: '', inputMode: 'total' });
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({ 
            name: '', 
            value: '', 
            totalValue: '',
            type: 'fixed', 
            total: '', 
            paidCount: '',
            category: '',
            dueDay: '',
            inputMode: 'total'
        });
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
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                    <div className="w-24 h-24 border-4 border-purple-500/10 border-t-purple-500/80 rounded-full animate-spin"></div>
                    <div className="absolute w-12 h-12 overflow-hidden rounded-xl shadow-2xl">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse text-purple-400">
                    {authLoading ? 'Autenticando...' : 'Carregando Equilíbrio...'}
                </p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden font-inter transition-colors duration-500 relative pt-[env(safe-area-inset-top,20px)] lg:pt-0">

            {/* Ambient Animated Glows */}
            <div className="fixed top-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }}></div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in-up touch-none"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-72 border-r transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 backdrop-blur-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white/80 border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
                <div className="flex flex-col h-full p-6 relative z-10 overflow-y-auto no-scrollbar overscroll-contain">
                    <div className="flex items-center justify-between mb-10 px-2 lg:justify-start shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20 shrink-0">
                                <img src="/logo.png" alt="Equilibra+ Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className={`text-xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Equilibra<span className="text-gradient">+</span>
                                </h1>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-slate-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 pr-1">
                        <div className={`text-[10px] font-bold uppercase tracking-widest px-4 mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Monitoramento</div>
                        <button
                            onClick={() => { setFilterType('all'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'all' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={18} className={filterType === 'all' ? 'text-purple-400' : ''} /> <span>Visão Geral</span>
                            </div>
                            <span className={`text-[10px] font-black tracking-tight ${filterType === 'all' ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                                {formatMoney(stats.totalMonthly)}
                            </span>
                        </button>
                        
                        <div className="pt-6 pb-2">
                             <div className={`text-[10px] font-bold uppercase tracking-widest px-4 mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Transações</div>
                        </div>
                        <button
                            onClick={() => { setFilterType('fixed'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'fixed' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Target size={18} className={filterType === 'fixed' ? 'text-purple-400' : ''} /> <span>Gastos Fixos</span>
                            </div>
                            <span className={`text-[10px] font-black tracking-tight ${filterType === 'fixed' ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                                {formatMoney(stats.fixedTotal)}
                            </span>
                        </button>
                        <button
                            onClick={() => { setFilterType('one-time'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'one-time' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className={filterType === 'one-time' ? 'text-purple-400' : ''} /> <span>Gastos Avulsos</span>
                            </div>
                            <span className={`text-[10px] font-black tracking-tight ${filterType === 'one-time' ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                                {formatMoney(stats.oneTimeTotal)}
                            </span>
                        </button>
                        <button
                            onClick={() => { setFilterType('installment'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${filterType === 'installment' ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-white border border-purple-500/20 shadow-inner' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className={filterType === 'installment' ? 'text-purple-400' : ''} /> <span>Acompanhar Parcelas</span>
                            </div>
                            <span className={`text-[10px] font-black tracking-tight ${filterType === 'installment' ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                                {formatMoney(stats.installmentTotal)}
                            </span>
                        </button>
                    </nav>

                <div className="pt-6 border-t mt-auto space-y-4 border-white/5">
                    {!isPremium && (
                        <button
                            onClick={() => setIsPricingModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 group p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300 shadow-lg shadow-purple-500/10 group"
                        >
                            <Sparkles size={16} className="text-purple-400 group-hover:animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">Upgrade to PRO</span>
                        </button>
                    )}

                    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm text-white shadow-inner shrink-0">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.displayName?.split(' ')[0] || 'Usuário'}</p>
                            <p className={`text-[10px] truncate font-bold uppercase tracking-widest ${isPremium ? 'text-purple-400' : 'text-slate-500'}`}>
                                {isPremium ? 'Assinante Premium' : 'Membro Free'}
                            </p>
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

                            <div className="relative">
                                <button 
                                    onClick={() => { setIsNotificationOpen(!isNotificationOpen); markAllAsRead(); }}
                                    className={`p-2.5 rounded-xl transition-all relative hidden sm:block border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}
                                >
                                    <Bell size={18} />
                                    {unreadNotifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#1a1428] shadow-sm animate-pulse">
                                            {unreadNotifications.length}
                                        </span>
                                    )}
                                </button>

                                {isNotificationOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                                        <div className={`absolute top-full right-0 mt-3 w-80 z-50 p-4 rounded-3xl border shadow-2xl animate-fade-in-up origin-top-right ${isDarkMode ? 'bg-[#1a172e] border-white/10' : 'bg-white border-slate-200'}`}>
                                            <div className="flex items-center justify-between mb-4 px-1">
                                                <h3 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notificações</h3>
                                                <button onClick={() => setIsNotificationOpen(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                                            </div>
                                            <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map(n => (
                                                        <div key={n.id} className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-200'}`}>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{n.message}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-8 text-center">
                                                        <Bell size={24} className="mx-auto text-slate-500/30 mb-2" />
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">Nenhuma conta vencendo nos próximos 3 dias</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={`w-px h-6 mx-2 hidden sm:block ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

                            <button onClick={openNewModal} className="hbo-button px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                <Plus size={18} className="hidden sm:block" /> Novo Lançamento
                            </button>
                        </div>
                    </header>

                    <main className="p-4 lg:p-8 pb-32 space-y-6 lg:space-y-8">

                        {/* HERO / METRICS GRID */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 lg:px-0 max-w-7xl mx-auto w-full">
                            {/* Card 1: Renda do Mês (Novo Posicionamento) */}
                            <div 
                                onClick={() => { if(!isEditingIncome) { setTempIncome(currentIncome.toString()); setIsEditingIncome(true); } }}
                                className="aspect-square max-w-[180px] mx-auto w-full rounded-full hbo-card p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer border-2 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-500"
                            >
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 border border-emerald-500/10">
                                    <DollarSign className="text-emerald-400" size={16} />
                                </div>
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Renda do Mês</span>
                                <div className="text-base lg:text-2xl font-black tracking-tighter text-white">
                                    {isEditingIncome ? (
                                        <input 
                                            autoFocus
                                            type="text"
                                            className="bg-transparent text-center w-full outline-none font-black text-purple-400"
                                            value={tempIncome}
                                            onChange={(e) => setTempIncome(e.target.value)}
                                            onBlur={saveIncome}
                                        />
                                    ) : (
                                        formatMoney(currentIncome).replace('R$', '')
                                    )}
                                </div>
                                <div className="w-6 h-1 rounded-full bg-emerald-500 mt-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            </div>

                            {/* Card 2: Renda Comprometida */}
                            <div className="aspect-square max-w-[180px] mx-auto w-full rounded-full hbo-card p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group border-2 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-500">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2 border border-rose-500/10">
                                    <ArrowUpCircle className="text-rose-400" size={16} />
                                </div>
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Renda Comprometida</span>
                                <h3 className="text-base lg:text-2xl font-black tracking-tighter text-white">
                                    {formatMoney(stats.totalMonthly).replace('R$', '')}
                                </h3>
                                <div className="w-6 h-1 rounded-full bg-rose-500 mt-2 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                            </div>

                            {/* Card 3: Renda Livre */}
                            <div className="aspect-square max-w-[180px] mx-auto w-full rounded-full hbo-card p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group border-2 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/5">
                                    <Wallet className="text-purple-400" size={16} />
                                </div>
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Renda Livre</span>
                                <h2 className="text-base lg:text-2xl font-black tracking-tighter text-white">
                                    {formatMoney(stats.balance).replace('R$', '')}
                                </h2>
                                <div className="w-6 h-1 rounded-full bg-purple-500 mt-2 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                            </div>

                            {/* Card 4: Eficiência */}
                            <div className="aspect-square max-w-[180px] mx-auto w-full rounded-full hbo-card p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group border-2 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-500">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/10">
                                    <Target className="text-cyan-400" size={16} />
                                </div>
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Eficiência</span>
                                <h3 className="text-base lg:text-2xl font-black tracking-tighter text-white">
                                    {((100 - stats.expenseRatio) || 0).toFixed(0)}%
                                </h3>
                                <div className="w-6 h-1 rounded-full bg-cyan-500 mt-2 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            </div>
                        </div>

                        {/* Seletor de Mês (Posicionamento Premium) */}
                        <div className="flex items-center justify-center mt-2">
                             <div className="flex items-center gap-4 lg:gap-8 p-1.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl">
                                <button onClick={() => changeMonth(-1)} className="p-2 lg:p-3 rounded-xl text-purple-400 hover:bg-white/10 transition-all"><ChevronLeft size={20} /></button>
                                <div className="text-center px-4 border-x border-white/5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Visão Geral</p>
                                    <p className="text-sm lg:text-lg font-bold capitalize text-white">
                                        {displayDate.split(' de ')[0]} <span className="text-purple-400 opacity-80">{displayDate.split(' de ')[1]}</span>
                                    </p>
                                </div>
                                <button onClick={() => changeMonth(1)} className="p-2 lg:p-3 rounded-xl text-purple-400 hover:bg-white/10 transition-all"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        {/* LIST & CHART SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 mt-6">

                            {/* HISTORY / TRANSACTIONS */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                            <Filter size={14} className="text-purple-400" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Transações</span>
                                    </div>
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
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => { setSelectedExpenseDetail(item); setIsDetailModalOpen(true); }}
                                                    className="hbo-card overflow-hidden group transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl cursor-pointer"
                                                >
                                                    <div className="p-4 lg:p-5">
                                                        <div className="flex items-start gap-4">
                                                            {/* Icone */}
                                                            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border shadow-lg ${Config.bg} ${Config.border} ${Config.color} transition-transform group-hover:scale-105 duration-300`}>
                                                                <Config.icon size={22} strokeWidth={2.5} />
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0">
                                                                        <h4 className="text-sm font-bold text-white truncate flex items-center gap-2 mb-1">
                                                                            {item.name}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                                            <span className={Config.color}>{Config.label}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                                        <span className="text-base font-black text-white leading-none mt-0.5">{formatMoney(item.value)}</span>
                                                                        
                                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/5 text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all">
                                                                            <ChevronRight size={18} />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Progress Bar (Extremity) */}
                                                                {item.type === 'installment' && (
                                                                    <div className="space-y-1.5 mt-3 pt-3 border-t border-white/5">
                                                                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest px-0.5">
                                                                            <span className="text-slate-500">
                                                                                Restam <span className="text-white">{formatMoney((item.total - item.current + 1) * item.value)}</span>
                                                                            </span>
                                                                            <span className={Config.color}>
                                                                                {((item.current / item.total) * 100).toFixed(0)}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="h-1 w-full bg-white/5 rounded-full relative overflow-hidden ring-1 ring-white/5 shadow-inner">
                                                                            <div
                                                                                className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full"
                                                                                style={{
                                                                                    width: `${(item.current / item.total) * 100}%`,
                                                                                    backgroundImage: `linear-gradient(to right, ${Config.hex}90, ${Config.hex})`,
                                                                                    boxShadow: `0 0 12px ${Config.hex}40`
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
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
                                <div className="hbo-card p-5 lg:p-6 xl:sticky xl:top-28 flex flex-col gap-6">
                                    <div className="h-[240px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    animationBegin={0}
                                                    animationDuration={1500}
                                                    stroke="none"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                                                            onClick={() => {
                                                                setSelectedCategory(entry.key);
                                                                setIsReportModalOpen(true);
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className={`p-3 rounded-xl border shadow-xl animate-fade-in-up ${isDarkMode ? 'bg-[#151225] border-white/10' : 'bg-white border-slate-200'}`}>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: data.color }} />
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{data.name}</span>
                                                                    </div>
                                                                    <div className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatMoney(data.value)}</div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-1.5 min-h-[160px]">
                                        {chartData.map((entry, index) => (
                                            <button
                                                key={entry.key}
                                                onClick={() => {
                                                    setSelectedCategory(entry.key);
                                                    setIsReportModalOpen(true);
                                                }}
                                                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all group hover:bg-white/5 border border-transparent hover:border-white/5 ${isDarkMode ? '' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full transition-transform group-hover:scale-125`} style={{ backgroundColor: entry.color }} />
                                                    <span className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>{entry.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black tracking-tighter transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-purple-400' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                                                        {totalExpensesValue > 0 ? ((entry.value / totalExpensesValue) * 100).toFixed(0) : 0}%
                                                    </span>
                                                    <ChevronRight size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <footer className={`py-6 px-6 border-t font-medium transition-all ${isDarkMode ? 'border-white/5 text-slate-600 bg-black/10' : 'border-slate-50 text-slate-400 bg-slate-50/30'}`}>
                        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex flex-col items-center md:items-start gap-1">
                                <div className="flex items-center gap-2 group cursor-default">
                                    <div className="w-5 h-5 rounded-lg overflow-hidden shadow-lg shadow-purple-500/10 shrink-0">
                                        <img src="/logo.png" alt="Equilibra+ Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Equilibra<span className="text-indigo-400">+</span>
                                    </span>
                                </div>
                                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">© {new Date().getFullYear()} Direitos Reservados</p>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-1">
                                <p className="text-[9px] uppercase font-bold tracking-widest opacity-40">Engenharia e Design</p>
                                <span className={`text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    LUP <span className="text-indigo-400/50">Soluções Inteligentes</span>
                                </span>
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
                    <div className="w-full lg:max-w-2xl bg-[#0b0914]/90 backdrop-blur-2xl rounded-t-[2rem] lg:rounded-[2rem] border border-white/10 shadow-2xl relative flex flex-col max-h-[90svh]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="shrink-0 p-5 lg:p-6 border-b border-white/5 flex justify-between items-center relative z-10 rounded-t-[2rem]">
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

                        <form onSubmit={handleAddExpense} className="flex-1 p-5 lg:p-6 space-y-5 overflow-y-auto relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Especificação do Gasto</label>
                                <input
                                    required type="text"
                                    className="hbo-input w-full p-3 font-bold text-sm"
                                    placeholder="Ex: Aluguel do Escritório"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {formData.type === 'installment' 
                                                ? (formData.inputMode === 'installment' ? 'Valor da Parcela (R$)' : 'Valor Total da Compra (R$)') 
                                                : 'Valor do Montante (R$)'}
                                        </label>
                                        {formData.type === 'installment' && (
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData({...formData, inputMode: formData.inputMode === 'total' ? 'installment' : 'total', totalValue: '', value: ''})} 
                                                className="text-[9px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300"
                                            >
                                                Alternar
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-500 font-black">R$</span>
                                        <input
                                            required type="number" step="0.01"
                                            className="hbo-input w-full pl-10 p-3 font-black text-lg"
                                            placeholder="0.00"
                                            value={formData.type === 'installment' 
                                                ? (formData.inputMode === 'installment' ? formData.value : formData.totalValue) 
                                                : formData.value}
                                            onChange={e => {
                                                if(formData.type === 'installment') {
                                                    if (formData.inputMode === 'installment') {
                                                        setFormData({ ...formData, value: e.target.value });
                                                    } else {
                                                        setFormData({ ...formData, totalValue: e.target.value });
                                                    }
                                                } else {
                                                    setFormData({ ...formData, value: e.target.value });
                                                }
                                            }}
                                        />
                                    </div>
                                    {formData.type === 'installment' && (
                                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest ml-1 animate-pulse">
                                            {formData.inputMode === 'installment' 
                                                ? (formData.value && formData.total ? `Total: ${formatMoney(parseFloat(formData.value) * parseInt(formData.total))}` : '')
                                                : (formData.totalValue && formData.total ? `${formData.total}x de ${formatMoney(parseFloat(formData.totalValue) / parseInt(formData.total))}` : '')}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2 relative">
                                    <label className={`text-[10px] font-black uppercase tracking-widest px-2 flex items-center justify-between ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <span>Categoria</span>
                                        {formData.category && (
                                            <span className={`animate-fade-in ${CATEGORY_MAP[formData.category].color}`}>{CATEGORY_MAP[formData.category].label}</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                            className={`w-full group flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 mt-1 ${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {formData.category ? (
                                                    <>
                                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${CATEGORY_MAP[formData.category].bg} ${CATEGORY_MAP[formData.category].color}`}>
                                                            {(() => {
                                                                const Icon = CATEGORY_MAP[formData.category].icon;
                                                                return <Icon size={16} strokeWidth={2.5} />;
                                                            })()}
                                                        </div>
                                                        <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                            {CATEGORY_MAP[formData.category].label}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-white/5 text-slate-500`}>
                                                            <LayoutDashboard size={16} />
                                                        </div>
                                                        <span className="text-slate-500 font-bold text-sm italic">Selecionar categoria...</span>
                                                    </>
                                                )}
                                            </div>
                                            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-500 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isCategoryDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-[110]"
                                                    onClick={() => setIsCategoryDropdownOpen(false)}
                                                />
                                                <div className={`absolute top-full mt-3 left-0 right-0 z-[120] p-2 rounded-3xl border shadow-2xl animate-fade-in-up origin-top overflow-hidden ${isDarkMode ? 'bg-[#1a172e] border-white/10' : 'bg-white border-slate-200'}`}>
                                                    <div className="grid grid-cols-1 gap-1 max-h-[320px] overflow-y-auto no-scrollbar">
                                                        {Object.entries(CATEGORY_MAP).map(([key, config]) => (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, category: key });
                                                                    setIsCategoryDropdownOpen(false);
                                                                }}
                                                                className={`flex items-center justify-between p-3 rounded-2xl transition-all group ${formData.category === key ? (isDarkMode ? 'bg-white/5 border border-white/10 shadow-inner' : 'bg-slate-100 border border-slate-200 shadow-inner') : 'hover:bg-white/[0.03] border border-transparent'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${config.bg} ${config.color}`}>
                                                                        <config.icon size={20} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{config.label}</div>
                                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Impacto Mensal</div>
                                                                    </div>
                                                                </div>
                                                                {formData.category === key && (
                                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center animate-scale-in ${config.bg} ${config.color}`}>
                                                                        <Check size={12} strokeWidth={4} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className="space-y-1.5 pt-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Natureza da Transação</label>
                                <div className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5 mt-1">
                                    {['fixed', 'installment', 'one-time'].map(type => (
                                        <button
                                            key={type} type="button"
                                            onClick={() => {
                                                let newValue = formData.value;
                                                let newTotalValue = formData.totalValue;
                                                
                                                if (type === 'installment' && formData.type !== 'installment') {
                                                    newTotalValue = formData.value;
                                                } else if (type !== 'installment' && formData.type === 'installment') {
                                                    newValue = formData.totalValue;
                                                }

                                                setFormData({ ...formData, type, value: newValue, totalValue: newTotalValue });
                                            }}
                                            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${formData.type === type ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {TYPE_MAP[type].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(formData.type === 'installment' || formData.type === 'fixed') && (
                                <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-fade-in-up mt-1">
                                    {formData.type === 'installment' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Total de Parcelas</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="hbo-input w-full p-2.5 text-center text-base font-bold"
                                                    placeholder="Ex: 12"
                                                    value={formData.total}
                                                    onChange={e => setFormData({ ...formData, total: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Parcelas Pagas</label>
                                                <input
                                                    type="number"
                                                    className="hbo-input w-full p-2.5 text-center text-base font-bold"
                                                    placeholder="Ex: 2"
                                                    min="0"
                                                    value={formData.paidCount}
                                                    onChange={e => setFormData({ ...formData, paidCount: e.target.value })}
                                                />
                                                <p className="text-[9px] text-slate-500 text-center">
                                                    {parseInt(formData.paidCount) > 0 ? `Este mês será ${parseInt(formData.paidCount) + 1}/${formData.total || '?'}` : `Começa este mês (1/${formData.total || '?'})`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Dia do Vencimento (1-31)</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            max="31"
                                            className="hbo-input w-full p-2.5 text-center text-base font-bold"
                                            placeholder="Ex: 15"
                                            value={formData.dueDay}
                                            onChange={e => setFormData({ ...formData, dueDay: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* INTELIGÊNCIA DE FATURA - AVISO NO MODAL */}
                            {((formData.type === 'installment' || formData.type === 'fixed') && formData.dueDay && formData.dueDay !== '') && (
                                (() => {
                                    const todayDay = new Date().getDate();
                                    const dueDayInt = parseInt(formData.dueDay);
                                    if (isNaN(dueDayInt) || dueDayInt < 1 || dueDayInt > 31) return null;

                                    // Dia de fechamento: 10 dias antes do vencimento
                                    const closingDay = dueDayInt - 10;

                                    // Fatura fechou se hoje passou do dia de fechamento
                                    // Se closingDay <= 0, o fechamento foi no mês anterior (sempre fechado no mês atual)
                                    const isClosed = closingDay <= 0 ? true : todayDay > closingDay;
                                    
                                    if (isClosed) {
                                        const nextMonth = new Date();
                                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                                        const nextMonthName = nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

                                        return (
                                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-3 animate-fade-in-up">
                                                <div className="shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                                    <Info size={16} className="text-purple-400" />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-purple-400 mb-0.5">Fatura Fechada</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                                        A fatura já fechou. Este lançamento será projetado para{' '}
                                                        <strong className="text-emerald-400 font-bold capitalize">{nextMonthName}</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()
                            )}

                            <button type="submit" className="hbo-button w-full h-[64px] rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] mt-8 flex items-center justify-center gap-2">
                                {editingId ? <><Pencil size={18} /> Consolidar Alteração</> : <><Plus size={20} /> Aprovar Lançamento</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} isPremium={isPremium} />
            <CategoryReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                category={selectedCategory}
                expenses={currentMonthExpenses}
                selectedDate={selectedDate}
                isDarkMode={isDarkMode}
            />

            <ExpenseDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                expense={selectedExpenseDetail}
                onEdit={(item) => {
                    setIsDetailModalOpen(false);
                    handleEdit(item);
                }}
                onDelete={(id) => {
                    setIsDetailModalOpen(false);
                    handleDelete(id);
                }}
                isDarkMode={isDarkMode}
                currentIncome={currentIncome}
            />
        </div>
    );
}

// NOVO COMPONENTE: MODAL DE DETALHES
const ExpenseDetailModal = ({ isOpen, onClose, expense, onEdit, onDelete, isDarkMode, currentIncome }) => {
    if (!isOpen || !expense) return null;

    const config = CATEGORY_MAP[expense.category] || CATEGORY_MAP.others;
    const commitment = ((expense.value / currentIncome) * 100).toFixed(2);
    
    // Cálculos de datas
    const dateObj = new Date(expense.date);
    const day = (expense.dueDay || dateObj.getDate().toString()).padStart(2, '0');
    const firstPayment = `${day}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    
    // Para parcelados, calcular a última parcela
    let lastPayment = '-';
    if (expense.type === 'installment') {
        const lastDate = new Date(dateObj);
        lastDate.setMonth(lastDate.getMonth() + (expense.total - expense.current));
        lastPayment = `${day}/${(lastDate.getMonth() + 1).toString().padStart(2, '0')}/${lastDate.getFullYear()}`;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 lg:p-10 animate-fade-in transition-all">
            <div className={`w-full max-w-lg border rounded-[2.5rem] overflow-hidden shadow-2xl relative ${isDarkMode ? 'bg-[#0b0914] border-white/10' : 'bg-white border-slate-200'}`}>
                {/* Glow Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header Section */}
                <div className="p-8 pb-4 relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${config.bg} ${config.border} ${config.color}`}>
                            <config.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${config.color}`}>{config.label}</p>
                            <h2 className={`text-2xl font-black tracking-tight uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{expense.name}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Value */}
                <div className="px-8 py-6 text-center">
                    <div className={`text-4xl font-black tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatMoney(expense.value)}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${TYPE_MAP[expense.type].bg} ${TYPE_MAP[expense.type].color} ${TYPE_MAP[expense.type].border}`}>
                            {TYPE_MAP[expense.type].label}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fluxo Mensal</span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="px-8 pb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Parcelas" value={expense.type === 'installment' ? `${expense.current} de ${expense.total}` : (expense.type === 'fixed' ? 'Contínuo' : 'Único')} isDarkMode={isDarkMode} />
                        <DetailItem label="Vencimento" value={expense.dueDay ? `Dia ${expense.dueDay}` : 'Imediato'} isDarkMode={isDarkMode} />
                        <DetailItem label="Início / Primeira" value={firstPayment} isDarkMode={isDarkMode} />
                        <DetailItem label="Final / Última" value={lastPayment} isDarkMode={isDarkMode} />
                        <DetailItem label="Valor de Compra" value={expense.type === 'installment' ? formatMoney(expense.totalValue || expense.total * expense.value) : formatMoney(expense.value)} isDarkMode={isDarkMode} />
                        <DetailItem label="Comprometimento" value={`${commitment}% da Renda`} isDarkMode={isDarkMode} highlight />
                    </div>

                    {expense.type === 'installment' && (
                        <div className="py-4 px-6 rounded-3xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Progresso do Pagamento</span>
                                <span className={`text-[10px] font-black ${config.color}`}>{((expense.current / expense.total) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ 
                                        width: `${(expense.current / expense.total) * 100}%`,
                                        backgroundColor: config.hex,
                                        boxShadow: `0 0 15px ${config.hex}50`
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 text-center mt-3 font-medium italic">
                                Falta quitar {formatMoney((expense.total - expense.current + 1) * expense.value)}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button 
                            onClick={() => onEdit(expense)}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-300 font-black uppercase text-[11px] tracking-widest hover:bg-white/10 hover:text-white transition-all"
                        >
                            <Pencil size={16} /> Editar Registro
                        </button>
                        <button 
                            onClick={() => onDelete(expense.id)}
                            className="w-16 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, isDarkMode, highlight }) => (
    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">{label}</p>
        <p className={`text-xs font-black tracking-tight ${highlight ? 'text-emerald-400' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>{value}</p>
    </div>
);
export default App;

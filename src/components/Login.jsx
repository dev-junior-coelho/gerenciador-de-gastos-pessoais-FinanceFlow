import React, { useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Zap, ShieldCheck, PieChart, TrendingUp, Sparkles } from 'lucide-react';

export default function Login() {
    useEffect(() => {
        getRedirectResult(auth).catch((error) => {
            console.error("Login redirect error:", error);
            alert("Erro ao entrar com Google (Redirect): " + error.message);
        });
    }, []);

    const handleGoogleLogin = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                await FirebaseAuthentication.signOut().catch(() => {});
                
                const result = await FirebaseAuthentication.signInWithGoogle({
                    webClientId: '1013466792204-d3pi5nc2jud6oas8473h68d5topb3kr0.apps.googleusercontent.com'
                });
                
                const idToken = result.idToken || (result.credential && result.credential.idToken);
                
                if (idToken) {
                    const credential = GoogleAuthProvider.credential(idToken);
                    await signInWithCredential(auth, credential);
                }
            } else {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    await signInWithRedirect(auth, googleProvider);
                } else {
                    await signInWithPopup(auth, googleProvider);
                }
            }
        } catch (error) {
            console.error("Erro no login:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0914] text-slate-100 flex overflow-hidden selection:bg-purple-500/30 font-inter">
            {/* Background Glows (Global) */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            {/* Left Column - Branding & Value Props */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 z-10">
                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0s' }}>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Zap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">
                            Equilibra<span className="text-gradient">+</span>
                        </h1>
                    </div>
                </div>

                {/* Main Copy */}
                <div className="relative z-10 max-w-xl shrink-0 my-auto py-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-8">
                        <Sparkles size={14} /> Solução Premium
                    </div>
                    <h2 className="text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
                        Controle financeiro<br />
                        <span className="text-gradient">
                            inteligente
                        </span> e preciso.
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed font-medium mb-12 max-w-lg">
                        A plataforma definitiva para organizar seus gastos, projetar o futuro e alcançar a independência financeira com inteligência de dados.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="hbo-card p-6 border-white/5 bg-white/[0.02] backdrop-blur-md">
                            <PieChart className="text-purple-400 mb-4" size={28} />
                            <h3 className="text-base font-bold mb-2 text-white">Análise Clara</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">Entenda para onde seu dinheiro vai com gráficos precisos e detalhados.</p>
                        </div>
                        <div className="hbo-card p-6 border-white/5 bg-white/[0.02] backdrop-blur-md">
                            <TrendingUp className="text-cyan-400 mb-4" size={28} />
                            <h3 className="text-base font-bold mb-2 text-white">Previsibilidade</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">Controle de parcelas e projeções fixas em uma única interface inteligente.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center gap-2 text-sm text-slate-500 font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <ShieldCheck size={18} className="text-emerald-500" />
                    Auditoria e segurança nível bancário
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Zap size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            Equilibra<span className="text-gradient">+</span>
                        </h1>
                    </div>

                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white">Bem-vindo(a)</h2>
                        <p className="text-slate-400 text-base font-medium">Faça login para acessar o seu painel financeiro exclusivo.</p>
                    </div>

                    <div className="hbo-card p-8 sm:p-10 !rounded-[2rem]">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full h-14 bg-white hover:bg-slate-100 text-[#0b0914] rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                                <path fill="#EA4335" d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar com Google
                        </button>

                        <div className="relative mt-8 mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-[#0b0914] text-slate-500 font-bold uppercase tracking-widest rounded-full border border-white/5 py-1">Acesso seguro</span>
                            </div>
                        </div>

                        <p className="text-[13px] text-center text-slate-500 font-medium leading-relaxed">
                            Ao entrar, você concorda com nossos <br className="hidden sm:block" />
                            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">Termos de Serviço</a> e <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">Política de Privacidade</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

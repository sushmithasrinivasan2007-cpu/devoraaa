import React, { useState } from 'react';
import { Shield, GraduationCap, Briefcase, Eye, EyeOff, ArrowRight, Sparkles, Lock, User, ChevronRight } from 'lucide-react';
import { Role } from '../types';

interface LoginPageProps {
  onLogin: (role: Role, name: string) => void;
}

type RolePanel = 'ADMIN' | 'TEACHER' | 'STUDENT';

const roleData: Record<RolePanel, {
  label: string;
  icon: React.ElementType;
  credentials: { username: string; password: string; name: string }[];
}> = {
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    credentials: [{ username: 'admin@devora.edu', password: 'admin123', name: 'Dr. Alistair Vance' }]
  },
  TEACHER: {
    label: 'Staff',
    icon: Briefcase,
    credentials: [{ username: 'teacher@devora.edu', password: 'teacher123', name: 'Sarah Jenkins' }]
  },
  STUDENT: {
    label: 'Student',
    icon: GraduationCap,
    credentials: [{ username: 'student@devora.edu', password: 'student123', name: 'Aiden Sharma' }]
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<RolePanel>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const role = roleData[selectedRole];

  const handleRoleSelect = (r: RolePanel) => {
    setSelectedRole(r);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleAutoFill = () => {
    setUsername(role.credentials[0].username);
    setPassword(role.credentials[0].password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 900));

    const match = role.credentials.find(
      c => c.username === username && c.password === password
    );

    if (match) {
      onLogin(selectedRole, match.name);
    } else {
      setError('Invalid credentials. Please check your email and password.');
    }
    setIsLoading(false);
  };

  const RoleIcon = role.icon;

  return (
    <div className="min-h-screen bg-[#F3EBDD] flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B1E2B]/7 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A85C68]/8 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#E8DDCA]/80 rounded-full blur-[100px]" />

      {/* Logo & Brand */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6B1E2B] shadow-lg shadow-[#6B1E2B]/30 mb-4">
          <Sparkles className="w-7 h-7 text-[#FFF8EC]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2020] tracking-tight">Devora AI</h1>
      </div>

      {/* Main login card */}
      <div className="w-full max-w-5xl z-10">
        <div className="rounded-3xl bg-[#FFF8EC]/70 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-12px_rgba(107,30,43,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* LEFT: Role Selector Panel (50% glass surface) */}
            <div className="lg:col-span-6 bg-[#6B1E2B]/6 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-[#6B1E2B]/12 p-6 sm:p-8 flex flex-col gap-4">
              <div className="mb-2">
                <h2 className="text-sm font-mono font-bold text-[#6B1E2B] uppercase tracking-widest">Select Role</h2>
              </div>

              {(Object.keys(roleData) as RolePanel[]).map((r) => {
                const rd = roleData[r];
                const Icon = rd.icon;
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? 'bg-[#6B1E2B] border-[#6B1E2B] text-white shadow-lg shadow-[#6B1E2B]/25 scale-[1.02]'
                        : 'bg-white/50 border-[#6B1E2B]/15 text-[#2B2020] hover:bg-white/70 hover:border-[#6B1E2B]/30 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : 'bg-[#6B1E2B]/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#6B1E2B]'}`} />
                        </div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#2B2020]'}`}>
                          {rd.label}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-[#756565] opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  </button>
                );
              })}


            </div>

            {/* RIGHT: Login Form (50% cream + glass) */}
            <div className="lg:col-span-6 p-6 sm:p-10">
              {/* Form header */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                    <RoleIcon className="w-4 h-4 text-[#6B1E2B]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-widest">
                    {role.label}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#2B2020] leading-tight">
                  Welcome back to<br />Devora Campus
                </h3>
              </div>



              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756565] hover:text-[#6B1E2B] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[#B94A55]/10 border border-[#B94A55]/25 text-xs font-mono text-[#B94A55]">
                    {error}
                  </div>
                )}

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-mono font-bold text-sm bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-lg shadow-[#6B1E2B]/20 hover:shadow-[#6B1E2B]/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Access {role.label} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security note */}
              <div className="mt-6 pt-4 border-t border-[#6B1E2B]/10 flex items-center justify-center gap-2 text-[11px] font-mono text-[#9A8989]">
                <Lock className="w-3 h-3 text-[#6B1E2B]" />
                <span>Secured · Devora AI Campus Intelligence Platform · v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Heart,
  Shield,
  Users,
  Building2,
  Code2,
  Plus,
  Bell,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { Patient } from '../types';

export type ActiveView = 'PACIENTE' | 'ADMIN' | 'FARMACIAS' | 'ARQUITETURA';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  patients,
  selectedPatient,
  onSelectPatient,
  onOpenNewPatientModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => setActiveView('PACIENTE')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                  Saúde Fácil
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                    MZ
                  </span>
                </h1>
                <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                  Micro-Seguro de Saúde por Assinatura
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveView('PACIENTE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'PACIENTE'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Área do Paciente
            </button>
            <button
              onClick={() => setActiveView('ADMIN')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'ADMIN'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Painel Administrador
            </button>
            <button
              onClick={() => setActiveView('FARMACIAS')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'FARMACIAS'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Farmácias Parceiras
            </button>
            <button
              onClick={() => setActiveView('ARQUITETURA')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'ARQUITETURA'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              Arquitetura & Código
            </button>
          </nav>

          {/* Right Action: Patient Selector & New Patient Button */}
          <div className="flex items-center gap-2.5">
            {/* Patient Switcher */}
            {activeView === 'PACIENTE' && (
              <div className="relative flex items-center">
                <select
                  value={selectedPatient.id}
                  onChange={(e) => {
                    const found = patients.find((p) => p.id === e.target.value);
                    if (found) onSelectPatient(found);
                  }}
                  aria-label="Seleccionar Paciente para Testar"
                  className="text-xs font-semibold bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl pl-3 pr-7 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none max-w-[160px] sm:max-w-[200px] truncate"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.subscription?.status || 'PEND'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-gray-400 pointer-events-none" />
              </div>
            )}

            <button
              onClick={onOpenNewPatientModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo Cadastro</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-gray-100">
          <button
            onClick={() => setActiveView('PACIENTE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeView === 'PACIENTE'
                ? 'bg-sky-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Área do Paciente
          </button>
          <button
            onClick={() => setActiveView('ADMIN')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeView === 'ADMIN'
                ? 'bg-sky-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Painel Admin
          </button>
          <button
            onClick={() => setActiveView('FARMACIAS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeView === 'FARMACIAS'
                ? 'bg-sky-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Farmácias
          </button>
          <button
            onClick={() => setActiveView('ARQUITETURA')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeView === 'ARQUITETURA'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Arquitetura
          </button>
        </div>
      </div>
    </header>
  );
};

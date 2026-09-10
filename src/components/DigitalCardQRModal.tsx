import React, { useState } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Heart,
  Calendar,
  Phone,
  Droplet,
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';
import { Patient } from '../types';

interface DigitalCardQRModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalCardQRModal: React.FC<DigitalCardQRModalProps> = ({
  patient,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'CARD' | 'QR_FULL'>('CARD');

  if (!isOpen) return null;

  const isSubActive = patient.subscription?.status === 'ATIVA';
  const planName = patient.subscription?.planName || 'Plano Básico Individual';
  const verificationUrl = `https://saudefacil.mz/verify/${patient.memberNumber}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(patient.memberNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Cartão Digital de Beneficiário</h3>
              <p className="text-xs text-sky-100">Apresente nas Farmácias e Clínicas Conveniadas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('CARD')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'CARD'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Cartão de Saúde
          </button>
          <button
            onClick={() => setActiveTab('QR_FULL')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'QR_FULL'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            QR Code do Balcão (POS)
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh]">
          {activeTab === 'CARD' ? (
            <div className="space-y-4">
              {/* Virtual Membership Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-sky-500/30">
                {/* Background watermarks */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute right-4 top-4 text-white/5 pointer-events-none">
                  <ShieldCheck className="w-32 h-32" />
                </div>

                {/* Card Top Row */}
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-md">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm tracking-wide text-white block leading-none">SAÚDE FÁCIL</span>
                      <span className="text-[10px] text-sky-300 font-medium">Micro-Seguro de Saúde Moçambique</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isSubActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {isSubActive ? '● Cobertura Ativa' : '● Pagamento Pendente'}
                  </span>
                </div>

                {/* Patient Details Middle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 my-4 items-center">
                  <div className="sm:col-span-2">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Titular da Apólice</p>
                    <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">{patient.fullName}</h4>
                    <p className="text-xs text-sky-300 mt-0.5 flex items-center gap-1.5 font-mono">
                      <span>Doc: {patient.idNumber}</span>
                      <span>•</span>
                      <span>Nasc: {patient.dateOfBirth}</span>
                    </p>
                  </div>

                  {/* SVG QR Code */}
                  <div className="flex flex-col items-center sm:items-end justify-center">
                    <div className="bg-white p-2 rounded-xl shadow-md border border-white/20">
                      <svg
                        className="w-20 h-20 text-slate-900"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        {/* Static visual representation of 2D QR matrix */}
                        <rect width="100" height="100" fill="white" />
                        {/* Top-left corner finder */}
                        <rect x="5" y="5" width="28" height="28" fill="#0f172a" />
                        <rect x="9" y="9" width="20" height="20" fill="white" />
                        <rect x="13" y="13" width="12" height="12" fill="#0284c7" />
                        {/* Top-right corner finder */}
                        <rect x="67" y="5" width="28" height="28" fill="#0f172a" />
                        <rect x="71" y="9" width="20" height="20" fill="white" />
                        <rect x="75" y="13" width="12" height="12" fill="#0284c7" />
                        {/* Bottom-left corner finder */}
                        <rect x="5" y="67" width="28" height="28" fill="#0f172a" />
                        <rect x="9" y="71" width="20" height="20" fill="white" />
                        <rect x="13" y="75" width="12" height="12" fill="#0284c7" />
                        {/* Data dots matrix */}
                        <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
                        <rect x="52" y="8" width="6" height="6" fill="#0f172a" />
                        <rect x="40" y="20" width="6" height="6" fill="#0f172a" />
                        <rect x="46" y="26" width="6" height="6" fill="#0f172a" />
                        <rect x="10" y="40" width="6" height="6" fill="#0f172a" />
                        <rect x="22" y="40" width="6" height="6" fill="#0f172a" />
                        <rect x="34" y="40" width="6" height="6" fill="#0f172a" />
                        <rect x="46" y="40" width="8" height="8" fill="#0284c7" />
                        <rect x="60" y="40" width="6" height="6" fill="#0f172a" />
                        <rect x="75" y="40" width="6" height="6" fill="#0f172a" />
                        <rect x="88" y="40" width="6" height="6" fill="#0f172a" />
                        <rect x="10" y="52" width="6" height="6" fill="#0f172a" />
                        <rect x="28" y="52" width="6" height="6" fill="#0f172a" />
                        <rect x="40" y="52" width="6" height="6" fill="#0f172a" />
                        <rect x="55" y="52" width="6" height="6" fill="#0f172a" />
                        <rect x="70" y="52" width="6" height="6" fill="#0f172a" />
                        <rect x="85" y="52" width="6" height="6" fill="#0f172a" />
                        <rect x="40" y="68" width="6" height="6" fill="#0f172a" />
                        <rect x="52" y="68" width="6" height="6" fill="#0f172a" />
                        <rect x="65" y="68" width="6" height="6" fill="#0f172a" />
                        <rect x="80" y="68" width="6" height="6" fill="#0f172a" />
                        <rect x="40" y="80" width="6" height="6" fill="#0f172a" />
                        <rect x="55" y="80" width="6" height="6" fill="#0f172a" />
                        <rect x="70" y="80" width="6" height="6" fill="#0f172a" />
                        <rect x="85" y="80" width="6" height="6" fill="#0f172a" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 font-mono">{patient.memberNumber}</span>
                  </div>
                </div>

                {/* Card Footer Row */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <div>
                    <span className="text-[10px] text-gray-400 block leading-none">Nº DE MEMBRO</span>
                    <span className="font-mono font-bold text-sky-400 text-sm tracking-wider">{patient.memberNumber}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block leading-none">PLANO CONTRATADO</span>
                    <span className="font-bold text-white text-xs">{planName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block leading-none">TIPO SANGUÍNEO</span>
                    <span className="font-bold text-rose-400 text-xs flex items-center gap-0.5">
                      <Droplet className="w-3 h-3 fill-rose-400" />
                      {patient.bloodType || 'O+'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block leading-none">VALIDADE</span>
                    <span className="font-mono font-medium text-gray-200 text-xs">
                      {patient.subscription?.nextBillingDate || '30/09/2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Details List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 font-medium block">Telefone M-Pesa / Contacto:</span>
                  <span className="font-bold text-gray-800">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Província / Bairro:</span>
                  <span className="font-bold text-gray-800">{patient.address.neighborhood}, {patient.address.province}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Desconto Farmácias:</span>
                  <span className="font-bold text-emerald-600">
                    Até {patient.subscription?.planId === 'PREMIUM' ? '35%' : patient.subscription?.planId === 'FAMILIAR' ? '25%' : '15%'} de desconto
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Alergias Documentadas:</span>
                  <span className={`font-bold ${patient.allergies && patient.allergies.length > 0 ? 'text-rose-600' : 'text-gray-600'}`}>
                    {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Nenhuma alergia registada'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Full-Screen QR for Counter Scanning */
            <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-2 border-sky-500 inline-block">
                <svg
                  className="w-48 h-48 sm:w-56 sm:h-56 text-slate-900"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="28" height="28" fill="#0f172a" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="#0284c7" />
                  <rect x="67" y="5" width="28" height="28" fill="#0f172a" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="#0284c7" />
                  <rect x="5" y="67" width="28" height="28" fill="#0f172a" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="#0284c7" />
                  <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="20" width="6" height="6" fill="#0f172a" />
                  <rect x="46" y="26" width="6" height="6" fill="#0f172a" />
                  <rect x="10" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="22" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="34" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="46" y="40" width="8" height="8" fill="#0284c7" />
                  <rect x="60" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="75" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="88" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="10" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="28" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="55" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="70" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="85" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="65" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="80" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="80" width="6" height="6" fill="#0f172a" />
                  <rect x="55" y="80" width="6" height="6" fill="#0f172a" />
                  <rect x="70" y="80" width="6" height="6" fill="#0f172a" />
                  <rect x="85" y="80" width="6" height="6" fill="#0f172a" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">{patient.fullName}</p>
                <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">{patient.memberNumber}</p>
                <p className="text-xs text-gray-500 mt-2 max-w-sm">
                  Aponte o leitor de QR Code ou a câmara do POS na farmácia ou clínica parceira para autenticar a cobertura instantaneamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            {copied ? 'Código Copiado!' : 'Copiar Nº Membro'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500" />
              Imprimir Cartão
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

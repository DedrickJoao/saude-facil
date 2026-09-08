import React, { useState } from 'react';
import { Smartphone, CheckCircle, ShieldCheck, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Patient, SubscriptionPlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockDatabase';

interface MpesaPaymentModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transaction: any, updatedSubscription: any) => void;
}

export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  patient,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(
    patient.subscription?.planId || 'FAMILIAR'
  );
  const [mpesaPhone, setMpesaPhone] = useState(
    patient.subscription?.mpesaNumber || patient.phone.replace(/[^0-9]/g, '').slice(-9) || '845519021'
  );
  const [step, setStep] = useState<'DETAILS' | 'USSD_PUSH' | 'SUCCESS'>('DETAILS');
  const [loading, setLoading] = useState(false);
  const [simulatedPin, setSimulatedPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  if (!isOpen) return null;

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mpesaPhone.replace(/[^0-9]/g, '').length < 9) {
      setPinError('Insira um número M-Pesa válido de 9 dígitos (ex: 84XXXXXXX ou 85XXXXXXX)');
      return;
    }

    setPinError(null);
    setLoading(true);

    // Simulate backend call to /api/payments/mpesa/c2b
    setTimeout(() => {
      setLoading(false);
      setStep('USSD_PUSH');
    }, 900);
  };

  const handleConfirmPin = async () => {
    if (simulatedPin.length !== 4) {
      setPinError('O PIN M-Pesa deve conter 4 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setPinError(null);

    try {
      const response = await fetch('/api/payments/mpesa/c2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          mpesaPhone: mpesaPhone,
          amountMzn: currentPlan.priceMzn,
          planId: currentPlan.id
        })
      });

      const data = await response.json();

      setLoading(false);
      if (data.success) {
        setTransactionData(data.transaction);
        setStep('SUCCESS');

        // Confetti burst
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // fallback if confetti fails
        }

        onPaymentSuccess(data.transaction, data.subscription);
      } else {
        setPinError(data.error || 'Erro ao validar transação M-Pesa');
      }
    } catch (err: any) {
      setLoading(false);
      setPinError('Erro ao comunicar com o servidor de pagamento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
              M
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pagamento M-Pesa Moçambique</h3>
              <p className="text-xs text-red-100">Micro-Seguro de Saúde por Assinatura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Payment Details & Phone */}
        {step === 'DETAILS' && (
          <form onSubmit={handleInitiatePayment} className="p-6 space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <p className="text-xs font-medium text-gray-500">Beneficiário / Utente</p>
              <p className="text-sm font-bold text-gray-800">{patient.fullName}</p>
              <p className="text-xs text-gray-600 font-mono">Nº Membro: {patient.memberNumber}</p>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Seleccione o Plano de Saúde
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedPlanId === plan.id
                        ? 'border-red-600 bg-red-50/70 ring-2 ring-red-500/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-800">{plan.name.split(' ')[1]}</p>
                    <p className="text-sm font-extrabold text-red-600 mt-0.5">{plan.priceMzn} MZN</p>
                    <p className="text-[10px] text-gray-500">/mês</p>
                  </button>
                ))}
              </div>
            </div>

            {/* M-Pesa Phone Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Número Telemóvel Vodacom M-Pesa
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-gray-500">
                  +258
                </span>
                <input
                  type="tel"
                  placeholder="84 XXX XXXX ou 85 XXX XXXX"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-sm font-semibold pl-14 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Será enviado um pedido de autorização USSD para o seu telemóvel.
              </p>
            </div>

            {pinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pinError}
              </div>
            )}

            {/* Amount Summary */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total a Debitar</p>
                <p className="text-xl font-extrabold text-gray-900">{currentPlan.priceMzn}.00 MZN</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A Iniciar...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: USSD Prompt Simulation */}
        {step === 'USSD_PUSH' && (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center animate-pulse">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base">Autorização M-Pesa (USSD Push)</h4>
              <p className="text-xs text-gray-500 mt-1">
                Uma notificação foi enviada para o número <span className="font-bold text-gray-800">+258 {mpesaPhone}</span>
              </p>
            </div>

            {/* Simulated Phone Prompt Box */}
            <div className="bg-slate-950 text-sky-400 font-mono p-4 rounded-xl text-left border border-slate-800 shadow-inner">
              <p className="text-[11px] text-gray-400 border-b border-slate-800 pb-1 mb-2">
                Vodacom M-Pesa STK Prompt
              </p>
              <p className="text-xs text-slate-200">
                Pagar <span className="text-amber-400 font-bold">{currentPlan.priceMzn}.00 MZN</span> a SAUDE FACIL ({currentPlan.name})?
              </p>
              <p className="text-xs text-slate-400 mt-2">Introduza o seu PIN M-Pesa (4 dígitos):</p>
              
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  value={simulatedPin}
                  onChange={(e) => setSimulatedPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-28 text-center text-lg font-bold bg-slate-800 text-white rounded-lg border border-slate-700 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  autoFocus
                />
                <span className="text-[11px] text-gray-400">(Ex: 1234)</span>
              </div>
            </div>

            {pinError && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pinError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmPin}
                disabled={loading || simulatedPin.length !== 4}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirmar PIN
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'SUCCESS' && transactionData && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-extrabold text-gray-900 text-lg">Pagamento Confirmado!</h4>
              <p className="text-xs text-gray-600 mt-1">
                A sua assinatura do <span className="font-bold text-gray-900">{currentPlan.name}</span> está activa.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Cód. Transacção M-Pesa:</span>
                <span className="font-mono font-bold text-gray-800">{transactionData.mpesaTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valor Pago:</span>
                <span className="font-bold text-sky-600">{transactionData.amountMzn}.00 MZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Número M-Pesa:</span>
                <span className="font-mono text-gray-700">+258 {transactionData.mpesaPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status da Cobertura:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                  ATIVA (30 Dias)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              Enviámos uma mensagem SMS de confirmação para o seu telemóvel.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Concluir e Aceder ao Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

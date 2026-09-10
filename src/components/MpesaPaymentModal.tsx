import React, { useState } from 'react';
import { Smartphone, CheckCircle, ShieldCheck, ArrowRight, Loader2, X, AlertCircle, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Patient, SubscriptionPlanId, PaymentProvider } from '../types';
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
  const [provider, setProvider] = useState<PaymentProvider>('MPESA');
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

  const providerConfig = {
    MPESA: {
      name: 'Vodacom M-Pesa',
      ussdCode: '*150#',
      bgClass: 'bg-red-600',
      activeBorder: 'border-red-600 bg-red-50/70 ring-2 ring-red-500/20 text-red-700',
      tagColor: 'bg-red-100 text-red-800',
      pinLength: 4,
      samplePrefix: '84 / 85'
    },
    EMOLA: {
      name: 'Movitel e-Mola',
      ussdCode: '*898#',
      bgClass: 'bg-amber-600',
      activeBorder: 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 text-amber-800',
      tagColor: 'bg-amber-100 text-amber-800',
      pinLength: 4,
      samplePrefix: '86 / 87'
    },
    MKESH: {
      name: 'Tmcel mKesh',
      ussdCode: '*500#',
      bgClass: 'bg-yellow-600',
      activeBorder: 'border-yellow-600 bg-yellow-50/70 ring-2 ring-yellow-500/20 text-yellow-900',
      tagColor: 'bg-yellow-100 text-yellow-900',
      pinLength: 4,
      samplePrefix: '82 / 83'
    },
    SIMO_CARD: {
      name: 'Cartão Nacional SIMO',
      ussdCode: 'SIMO Rede',
      bgClass: 'bg-sky-600',
      activeBorder: 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20 text-sky-800',
      tagColor: 'bg-sky-100 text-sky-800',
      pinLength: 4,
      samplePrefix: 'Visa / EMV'
    }
  };

  const activeConfig = providerConfig[provider] || providerConfig.MPESA;

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mpesaPhone.replace(/[^0-9]/g, '').length < 9) {
      setPinError(`Insira um número válido de 9 dígitos (ex: ${activeConfig.samplePrefix}XXXXXXX)`);
      return;
    }

    setPinError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep('USSD_PUSH');
    }, 700);
  };

  const handleConfirmPin = async () => {
    if (simulatedPin.length !== 4) {
      setPinError('O PIN deve conter 4 dígitos numéricos.');
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
          planId: currentPlan.id,
          provider
        })
      });

      const data = await response.json();

      setLoading(false);
      if (data.success) {
        setTransactionData(data.transaction);
        setStep('SUCCESS');

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // fallback
        }

        onPaymentSuccess(data.transaction, data.subscription);
      } else {
        setPinError(data.error || 'Erro ao validar transação');
      }
    } catch (err: any) {
      setLoading(false);
      setPinError('Erro ao comunicar com a operadora.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${activeConfig.bgClass} px-6 py-4 text-white flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Pagamento Móvel (C2B)</h3>
              <p className="text-xs text-white/80">{activeConfig.name} • Moçambique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Selection and phone input */}
        {step === 'DETAILS' && (
          <form onSubmit={handleInitiatePayment} className="p-6 space-y-4">
            {/* Operator tabs */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Escolha a Operadora / Carteira</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('MPESA')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    provider === 'MPESA'
                      ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-2 ring-red-500/20'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="block text-xs font-bold">M-Pesa</span>
                  <span className="block text-[10px] text-gray-500">Vodacom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('EMOLA')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    provider === 'EMOLA'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="block text-xs font-bold">e-Mola</span>
                  <span className="block text-[10px] text-gray-500">Movitel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('MKESH')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    provider === 'MKESH'
                      ? 'border-yellow-600 bg-yellow-50 text-yellow-900 font-bold ring-2 ring-yellow-500/20'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="block text-xs font-bold">mKesh</span>
                  <span className="block text-[10px] text-gray-500">Tmcel</span>
                </button>
              </div>
            </div>

            {/* Patient overview */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Beneficiário</p>
              <p className="text-sm font-bold text-gray-900">{patient.fullName}</p>
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
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlanId === plan.id
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20 font-bold'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{plan.name.split(' ')[1]}</p>
                    <p className="text-sm font-extrabold text-sky-700 mt-0.5">{plan.priceMzn} MZN</p>
                    <p className="text-[10px] text-gray-500">/mês</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Número Telemóvel {activeConfig.name}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-gray-500">
                  +258
                </span>
                <input
                  type="tel"
                  placeholder={`${activeConfig.samplePrefix} XXX XXXX`}
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-sm font-semibold pl-14 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Receberá um prompt USSD ({activeConfig.ussdCode}) directo no ecrã para introduzir o seu PIN secreto.
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
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ${activeConfig.bgClass} hover:opacity-90 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A Iniciar...
                  </>
                ) : (
                  <>
                    Solicitar Débito
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
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center animate-pulse">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base">Autorização {activeConfig.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Simulação de prompt USSD enviado para <strong>+258 {mpesaPhone}</strong>
              </p>
            </div>

            {/* Simulated Phone Screen */}
            <div className="bg-slate-900 text-white p-4 rounded-xl max-w-xs mx-auto text-left font-mono text-xs shadow-inner border border-slate-700 space-y-2">
              <div className="text-emerald-400 font-bold border-b border-slate-700 pb-1 flex justify-between">
                <span>{activeConfig.name}</span>
                <span>{activeConfig.ussdCode}</span>
              </div>
              <p className="text-gray-200">
                Pagar <span className="text-white font-bold">{currentPlan.priceMzn}.00 MZN</span> a:
                <br />
                <span className="text-sky-300 font-bold">SAÚDE FÁCIL SEGUROS</span>
                <br />
                Ref: <span className="text-gray-300">{patient.memberNumber}</span>
              </p>
              <div className="pt-2">
                <label className="text-[10px] text-gray-400 block mb-1">Introduza o PIN (4 dígitos):</label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  value={simulatedPin}
                  onChange={(e) => setSimulatedPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-center text-base tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-medium">{pinError}</p>
            )}

            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmPin}
                disabled={loading || simulatedPin.length < 4}
                className={`px-5 py-2 rounded-xl ${activeConfig.bgClass} hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{loading ? 'A Confirmar...' : 'Confirmar PIN'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 'SUCCESS' && transactionData && (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900">Assinatura Ativada com Sucesso!</h4>
              <p className="text-xs text-gray-600 mt-1">
                O pagamento de <strong>{transactionData.amountMzn}.00 MZN</strong> foi processado via{' '}
                <strong>{activeConfig.name}</strong>.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-left border border-gray-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">ID Transação:</span>
                <span className="font-bold text-gray-800">{transactionData.mpesaTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plano:</span>
                <span className="font-bold text-sky-700">{transactionData.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado:</span>
                <span className="font-bold text-emerald-600">● ATIVA</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Concluir e Ir para o Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  UserCheck,
  Building2,
  Percent,
  Check,
  Send,
  Droplet,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PartnerPharmacy, PharmacyDiscountRedemption } from '../types';

interface PharmacyScannerModalProps {
  pharmacies: PartnerPharmacy[];
  isOpen: boolean;
  onClose: () => void;
  onDiscountApplied: (redemption: PharmacyDiscountRedemption) => void;
}

export const PharmacyScannerModal: React.FC<PharmacyScannerModalProps> = ({
  pharmacies,
  isOpen,
  onClose,
  onDiscountApplied
}) => {
  const [identifier, setIdentifier] = useState<string>('SF-84920');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(pharmacies[0]?.id || 'farm-01');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Discount application form
  const [medicationList, setMedicationList] = useState<string>('Paracetamol 500mg, Amoxicilina 500mg, Multivitamínico');
  const [originalPriceMzn, setOriginalPriceMzn] = useState<number>(1200);
  const [applying, setApplying] = useState<boolean>(false);
  const [receiptResult, setReceiptResult] = useState<PharmacyDiscountRedemption | null>(null);

  if (!isOpen) return null;

  const activePharmacies = pharmacies.filter((p) => p.active);
  const selectedPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0];

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) return;

    setVerifying(true);
    setErrorMsg(null);
    setVerificationData(null);
    setReceiptResult(null);

    try {
      const response = await fetch(`/api/verify-member/${encodeURIComponent(identifier.trim())}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Membro não encontrado');
      }

      const data = await response.json();
      setVerificationData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao consultar sistema central');
    } finally {
      setVerifying(false);
    }
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationData) return;

    setApplying(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/pharmacies/apply-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberNumber: verificationData.patient.memberNumber,
          pharmacyId: selectedPharmacyId,
          medicationList,
          originalPriceMzn
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao aplicar desconto');
      }

      const data = await response.json();
      setReceiptResult(data.redemption);
      onDiscountApplied(data.redemption);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao registar redenção');
    } finally {
      setApplying(false);
    }
  };

  // Quick discount calculation
  const discountRate = verificationData
    ? Math.max(
        selectedPharmacy?.discountPercentage || 0,
        verificationData.subscription?.discountPharmacyRate || 0
      )
    : selectedPharmacy?.discountPercentage || 20;

  const savedMzn = Math.round((originalPriceMzn * discountRate) / 100);
  const finalPriceMzn = originalPriceMzn - savedMzn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>Terminal POS & Balcão Farmacêutico</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  ONLINE
                </span>
              </h3>
              <p className="text-xs text-gray-400">Validação instantânea de apólices e descontos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[80vh] space-y-5">
          {/* Pharmacy Selection & Search input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">Ponto de Atendimento</label>
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {activePharmacies.map((pharm) => (
                  <option key={pharm.id} value={pharm.id}>
                    {pharm.name} ({pharm.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Leitor de QR Code / Nº de Membro / Telefone
              </label>
              <form onSubmit={handleVerify} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex: SF-84920 ou 843001200 ou 110100..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                  <QrCode className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{verifying ? 'A Verificar...' : 'Validar'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 text-[11px] font-medium">Testar pacientes exemplo:</span>
            <button
              type="button"
              onClick={() => {
                setIdentifier('SF-84920');
              }}
              className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-[11px] cursor-pointer"
            >
              SF-84920 (Maria)
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier('SF-99201');
              }}
              className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-[11px] cursor-pointer"
            >
              SF-99201 (Fátima)
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier('SF-77192');
              }}
              className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-[11px] cursor-pointer"
            >
              SF-77192 (António - Pendente)
            </button>
          </div>

          {/* Verification Results Panel */}
          {verificationData && (
            <div className="space-y-4">
              {/* Member Card Summary */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  verificationData.subscription.isActive
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-rose-50/70 border-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                      verificationData.subscription.isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {verificationData.patient.fullName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                        {verificationData.patient.fullName}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          verificationData.subscription.isActive
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {verificationData.subscription.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">
                      Nº Membro: <strong>{verificationData.patient.memberNumber}</strong> • Doc:{' '}
                      {verificationData.patient.idNumber}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Plano: <strong>{verificationData.subscription.planName}</strong> • Cidade:{' '}
                      {verificationData.patient.city}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
                  <span className="text-[11px] text-gray-600 block">Desconto Autorizado</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {discountRate}% OFF
                  </span>
                </div>
              </div>

              {/* Clinical Allergy Warnings */}
              {verificationData.patient.allergies && verificationData.patient.allergies.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">ALERTA CLÍNICO DE ALERGIAS:</span>
                    <span>
                      O utente possui alergia documentada a:{' '}
                      <strong className="underline">{verificationData.patient.allergies.join(', ')}</strong>. Verifique
                      a composição dos medicamentos antes de dispensar!
                    </span>
                  </div>
                </div>
              )}

              {/* Discount Application Calculator Form */}
              {verificationData.subscription.isActive ? (
                <form
                  onSubmit={handleApplyDiscount}
                  className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3"
                >
                  <h5 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-sky-600" />
                    Emitir Desconto Farmacêutico
                  </h5>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Medicamentos / Itens a Dispensar
                    </label>
                    <input
                      type="text"
                      required
                      value={medicationList}
                      onChange={(e) => setMedicationList(e.target.value)}
                      placeholder="Ex: Paracetamol 500mg, Amoxicilina 500mg..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Valor Balcão (MZN)</label>
                      <input
                        type="number"
                        min="10"
                        required
                        value={originalPriceMzn}
                        onChange={(e) => setOriginalPriceMzn(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-700 mb-1">
                        Poupança Saúde Fácil ({discountRate}%)
                      </label>
                      <div className="px-3 py-2 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-900">
                        - {savedMzn.toLocaleString()} MZN
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">A Pagar pelo Utente</label>
                      <div className="px-3 py-2 bg-white border-2 border-sky-600 rounded-xl text-xs font-extrabold text-sky-900">
                        {finalPriceMzn.toLocaleString()} MZN
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                    >
                      {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{applying ? 'A Registar...' : 'Aplicar Desconto & Enviar SMS de Recibo'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800">
                  <p className="font-bold">❌ Não é possível aplicar desconto</p>
                  <p className="mt-1">
                    A assinatura deste utente encontra-se com estado{' '}
                    <strong>{verificationData.subscription.status}</strong>. O utente precisa de regularizar a
                    mensalidade via M-Pesa para reativar o desconto.
                  </p>
                </div>
              )}

              {/* Receipt Success Banner */}
              {receiptResult && (
                <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-700 pb-2">
                    <span className="font-bold text-sm flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Desconto Aplicado com Sucesso!
                    </span>
                    <span className="font-mono text-xs text-emerald-200">{receiptResult.receiptNumber}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-emerald-300 text-[11px] block">Farmácia:</span>
                      <span className="font-semibold">{receiptResult.pharmacyName}</span>
                    </div>
                    <div>
                      <span className="text-emerald-300 text-[11px] block">Utente:</span>
                      <span className="font-semibold">{receiptResult.patientName}</span>
                    </div>
                    <div>
                      <span className="text-emerald-300 text-[11px] block">Total Poupado:</span>
                      <span className="font-bold text-emerald-300">{receiptResult.savedAmountMzn} MZN</span>
                    </div>
                    <div>
                      <span className="text-emerald-300 text-[11px] block">Total Pago:</span>
                      <span className="font-bold text-white">{receiptResult.finalPriceMzn} MZN</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-300 pt-1">
                    ✓ SMS de confirmação enviado automaticamente para o utente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar Terminal
          </button>
        </div>
      </div>
    </div>
  );
};

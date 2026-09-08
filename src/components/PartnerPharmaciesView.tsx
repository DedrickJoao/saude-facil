import React, { useState } from 'react';
import {
  Pill,
  MapPin,
  Phone,
  Clock,
  Search,
  CheckCircle,
  Percent,
  Receipt,
  Sparkles,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { PartnerPharmacy, Patient, PharmacyDiscountRedemption } from '../types';
import { INITIAL_REDEMPTIONS } from '../data/mockDatabase';

interface PartnerPharmaciesViewProps {
  pharmacies: PartnerPharmacy[];
  patients: Patient[];
  selectedPatient?: Patient | null;
}

export const PartnerPharmaciesView: React.FC<PartnerPharmaciesViewProps> = ({
  pharmacies,
  patients,
  selectedPatient
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  // Discount validation form state
  const [memberCode, setMemberCode] = useState(selectedPatient?.memberNumber || 'SF-88410');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(pharmacies[0]?.id || 'farm-01');
  const [medicationList, setMedicationList] = useState('Losartan 50mg (30 comp) + Paracetamol 500mg');
  const [originalPrice, setOriginalPrice] = useState('1200');
  const [validationResult, setValidationResult] = useState<PharmacyDiscountRedemption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<PharmacyDiscountRedemption[]>(INITIAL_REDEMPTIONS);

  const filteredPharmacies = pharmacies.filter((f) => {
    const matchCity = selectedCity === 'TODAS' || f.city === selectedCity;
    const matchSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCity && matchSearch;
  });

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await fetch('/api/pharmacies/apply-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberNumber: memberCode.trim(),
          pharmacyId: selectedPharmacyId,
          medicationList: medicationList.trim(),
          originalPriceMzn: parseFloat(originalPrice) || 0
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        setValidationResult(data.redemption);
        setRecentRedemptions((prev) => [data.redemption, ...prev]);
      } else {
        setError(data.error || 'Não foi possível validar o desconto na farmácia.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Erro de ligação ao terminal de farmácias.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-3 border border-sky-500/30">
            <Percent className="w-3.5 h-3.5" /> Rede de Descontos Farmacêuticos
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            Farmácias Parceiras Saúde Fácil
          </h2>
          <p className="text-xs md:text-sm text-sky-100 mt-2 leading-relaxed">
            Beneficiários com assinatura activa têm acesso a até 35% de desconto imediato na compra de medicamentos e produtos de saúde nas melhores farmácias de Moçambique.
          </p>
        </div>
      </div>

      {/* Terminal de Validação de Desconto (Simulador) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Terminal de Validação de Desconto de Receita Médica
            </h3>
            <p className="text-xs text-gray-500">
              Insira o número do beneficiário e o valor da compra para aplicar o desconto contratado
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyDiscount} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nº do Beneficiário (Apólice)
            </label>
            <input
              type="text"
              placeholder="Ex: SF-88410"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Farmácia Parceira
            </label>
            <select
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
            >
              {pharmacies.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.city} - {f.discountPercentage}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Medicamentos da Receita
            </label>
            <input
              type="text"
              placeholder="Ex: Losartan, Cetirizina..."
              value={medicationList}
              onChange={(e) => setMedicationList(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Valor Total Balcão (MZN)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Ex: 1200"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calcular'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Validation Result Box */}
        {validationResult && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold">
                <CheckCircle className="w-4 h-4 text-sky-600" />
                Desconto Aplicado com Sucesso! (Recibo: {validationResult.receiptNumber})
              </div>
              <span className="text-gray-500">Utente: {validationResult.patientName} ({validationResult.memberNumber})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-sky-100">
              <div>
                <p className="text-gray-500 text-[11px]">Valor de Tabela:</p>
                <p className="font-bold text-gray-800">{validationResult.originalPriceMzn} MZN</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px]">Taxa de Desconto:</p>
                <p className="font-bold text-sky-600">{validationResult.discountPercentage}% OFF</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px]">Poupança Total:</p>
                <p className="font-extrabold text-sky-700">-{validationResult.savedAmountMzn} MZN</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px]">Total a Cobrar:</p>
                <p className="font-black text-gray-900 text-sm">{validationResult.finalPriceMzn} MZN</p>
              </div>
            </div>

            <p className="text-[11px] text-sky-700 mt-2">
              ✓ Um SMS de confirmação com o recibo foi enviado automaticamente para o telemóvel do utente.
            </p>
          </div>
        )}
      </div>

      {/* Directório de Farmácias Parceiras */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Directório de Farmácias Conveniadas ({filteredPharmacies.length})
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* City Filter */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              {['TODAS', 'Maputo', 'Matola', 'Beira', 'Nampula'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar farmácia ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {pharmacy.chainName || 'Parceiro Saúde Fácil'}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{pharmacy.name}</h4>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-sky-100 text-sky-800 font-extrabold text-xs shrink-0">
                    {pharmacy.discountPercentage}% OFF
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mt-3">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {pharmacy.address}, {pharmacy.neighborhood} ({pharmacy.city})
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{pharmacy.openingHours}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{pharmacy.phone}</span>
                  </p>
                </div>

                {pharmacy.locationNotes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg text-[11px] text-gray-500">
                    ℹ️ {pharmacy.locationNotes}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Avaliação: ⭐ {pharmacy.rating}</span>
                <button
                  onClick={() => {
                    setSelectedPharmacyId(pharmacy.id);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="text-sky-700 hover:text-sky-800 font-bold cursor-pointer"
                >
                  Usar no Terminal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico Recente de Descontos Farmacêuticos */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-sky-600" />
          Últimos Descontos Resgatados na Rede Farmacêutica
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                <th className="pb-2">Recibo</th>
                <th className="pb-2">Beneficiário</th>
                <th className="pb-2">Farmácia</th>
                <th className="pb-2">Medicamentos</th>
                <th className="pb-2 text-right">Valor Original</th>
                <th className="pb-2 text-right">Poupança</th>
                <th className="pb-2 text-right">Total Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRedemptions.slice(0, 5).map((red) => (
                <tr key={red.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 font-mono font-bold text-gray-700">{red.receiptNumber}</td>
                  <td className="py-2.5 font-semibold text-gray-900">{red.patientName}</td>
                  <td className="py-2.5 text-gray-600">{red.pharmacyName}</td>
                  <td className="py-2.5 text-gray-500 max-w-xs truncate">{red.medicationList}</td>
                  <td className="py-2.5 text-right font-medium text-gray-600">{red.originalPriceMzn} MZN</td>
                  <td className="py-2.5 text-right font-bold text-emerald-600">-{red.savedAmountMzn} MZN</td>
                  <td className="py-2.5 text-right font-black text-gray-900">{red.finalPriceMzn} MZN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

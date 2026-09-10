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
  Building2,
  QrCode,
  Calendar,
  Stethoscope,
  Star,
  Compass
} from 'lucide-react';
import { PartnerPharmacy, PartnerClinic, Patient, PharmacyDiscountRedemption } from '../types';
import { INITIAL_REDEMPTIONS } from '../data/mockDatabase';

interface PartnerPharmaciesViewProps {
  pharmacies: PartnerPharmacy[];
  clinics?: PartnerClinic[];
  patients: Patient[];
  selectedPatient?: Patient | null;
  onOpenScanner?: () => void;
  onBookAppointment?: (clinicName?: string) => void;
}

export const PartnerPharmaciesView: React.FC<PartnerPharmaciesViewProps> = ({
  pharmacies,
  clinics = [],
  patients,
  selectedPatient,
  onOpenScanner,
  onBookAppointment
}) => {
  const [activeTab, setActiveTab] = useState<'PHARMACIES' | 'CLINICS'>('PHARMACIES');
  const [selectedCity, setSelectedCity] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  // POS / Direct discount terminal state
  const [memberCode, setMemberCode] = useState(selectedPatient?.memberNumber || 'SF-84920');
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

  const filteredClinics = clinics.filter((c) => {
    const matchCity = selectedCity === 'TODAS' || c.city === selectedCity;
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
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
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-3 border border-sky-500/30">
            <Percent className="w-3.5 h-3.5" /> Rede Credenciada Nacional
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            Rede Convencionada Saúde Fácil
          </h2>
          <p className="text-xs md:text-sm text-sky-100 mt-2 leading-relaxed">
            Beneficiários com assinatura activa têm acesso a consultas gratuitas ou comparticipadas e até 35% de desconto imediato em medicamentos nas principais farmácias e clínicas de Moçambique.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Terminal POS / Validar QR Code
              </button>
            )}

            {onBookAppointment && (
              <button
                type="button"
                onClick={() => onBookAppointment()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Marcar Consulta Médica
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switcher (Pharmacies vs Clinics) */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('PHARMACIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'PHARMACIES'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Farmácias Parceiras ({pharmacies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLINICS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CLINICS'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Clínicas & Hospitais ({clinics.length})</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-gray-500 font-medium mr-1">Cidade:</span>
          {['TODAS', 'Maputo', 'Matola', 'Beira', 'Nampula'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Pesquisar ${activeTab === 'PHARMACIES' ? 'farmácias por nome, bairro ou morada...' : 'clínicas, especialidades médicas ou médicos...'}`}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Grid of Results */}
      {activeTab === 'PHARMACIES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                      {pharmacy.chainName}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm">{pharmacy.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs shrink-0 border border-emerald-200">
                    {pharmacy.discountPercentage}% OFF
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {pharmacy.address}, {pharmacy.neighborhood} ({pharmacy.city})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{pharmacy.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800">{pharmacy.phone}</span>
                  </div>
                </div>

                {pharmacy.locationNotes && (
                  <p className="text-[11px] text-sky-700 bg-sky-50 p-2 rounded-lg mt-3 border border-sky-100 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                    <span>{pharmacy.locationNotes}</span>
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{pharmacy.rating}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPharmacyId(pharmacy.id);
                    if (onOpenScanner) onOpenScanner();
                  }}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  Validar no Balcão →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Clinics Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                      {clinic.type === 'HOSPITAL' ? 'Hospital Privado' : clinic.type === 'CENTRO_MEDICO' ? 'Centro Médico Especializado' : 'Clínica Geral'}
                    </span>
                    <h4 className="font-bold text-gray-900 text-base">{clinic.name}</h4>
                  </div>
                  {clinic.acceptsEmergency && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                      Urgências 24h
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {clinic.address}, {clinic.neighborhood} — {clinic.city} ({clinic.province})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{clinic.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800">{clinic.phone}</span>
                  </div>
                </div>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {clinic.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{clinic.rating} (Avaliação Convénio)</span>
                </div>

                {onBookAppointment && (
                  <button
                    type="button"
                    onClick={() => onBookAppointment(clinic.name)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar Consulta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POS Quick Redemptions Log */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Últimos Descontos Validados na Rede</h3>
            <p className="text-xs text-gray-500">Transações recentes registradas nos balcões parceiros</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Tempo Real (SMS Ativo)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Recibo / Data</th>
                <th className="py-2.5 px-3">Beneficiário</th>
                <th className="py-2.5 px-3">Farmácia</th>
                <th className="py-2.5 px-3">Medicamentos</th>
                <th className="py-2.5 px-3">Desconto</th>
                <th className="py-2.5 px-3 text-right">Poupou</th>
                <th className="py-2.5 px-3 text-right">Valor Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRedemptions.slice(0, 5).map((red) => (
                <tr key={red.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-mono text-gray-500">
                    <span className="font-bold text-gray-800 block">{red.receiptNumber}</span>
                    <span className="text-[10px]">{new Date(red.redemptionDate).toLocaleDateString('pt-MZ')}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">
                    {red.patientName}
                    <span className="block text-[10px] font-mono text-gray-500">{red.memberNumber}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">{red.pharmacyName}</td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">{red.medicationList}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {red.discountPercentage}% OFF
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                    {red.savedAmountMzn} MZN
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                    {red.finalPriceMzn} MZN
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

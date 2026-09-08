import React, { useState } from 'react';
import {
  UserPlus,
  X,
  Shield,
  FileText,
  Heart,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { DocumentUploader } from './DocumentUploader';
import { DocumentType, Patient, SubscriptionPlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockDatabase';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (newPatient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1994-05-12');
  const [gender, setGender] = useState<'MASCULINO' | 'FEMININO' | 'OUTRO'>('FEMININO');
  const [idNumber, setIdNumber] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [allergiesText, setAllergiesText] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Maputo');
  const [province, setProvince] = useState('Maputo Cidade');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Cônjuge');

  // Plan
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('FAMILIAR');

  // Uploaded docs
  const [documentsList, setDocumentsList] = useState<
    Array<{
      type: DocumentType;
      documentNumber: string;
      fileName: string;
      fileSize: string;
      fileData?: string;
    }>
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddDocument = (doc: {
    type: DocumentType;
    documentNumber: string;
    fileName: string;
    fileSize: string;
    fileData?: string;
  }) => {
    setDocumentsList((prev) => [...prev, doc]);
  };

  const handleRemoveDoc = (index: number) => {
    setDocumentsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Por favor introduza o nome completo do paciente.');
      return;
    }
    if (!phone.trim()) {
      setError('Por favor introduza o contacto telefónico.');
      return;
    }
    if (!idNumber.trim()) {
      setError('Por favor introduza o número do BI ou Passaporte.');
      return;
    }

    setLoading(true);
    setError(null);

    const allergiesArray = allergiesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@saudefacil.mz`,
      dateOfBirth,
      gender,
      idNumber: idNumber.trim(),
      bloodType,
      allergies: allergiesArray,
      address: {
        street: street.trim() || 'Av. Principal',
        neighborhood: neighborhood.trim() || 'Central',
        city,
        province
      },
      emergencyContact: emergencyName
        ? {
            name: emergencyName.trim(),
            phone: emergencyPhone.trim(),
            relationship: emergencyRelation
          }
        : undefined,
      selectedPlanId,
      documents: documentsList
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao registar paciente');
      }

      const createdPatient: Patient = await response.json();
      setLoading(false);
      onPatientCreated(createdPatient);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Erro ao comunicar com o servidor');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Novo Cadastro de Paciente</h3>
              <p className="text-xs text-sky-100">
                Adesão ao Micro-Seguro de Saúde por Assinatura Saúde Fácil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Personal Data */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-sky-600" />
              1. Identificação Pessoal e Contactos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Amélia Celeste Sitoe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Telefone / M-Pesa <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-semibold text-gray-500">
                    +258
                  </span>
                  <input
                    type="tel"
                    placeholder="84 XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl pl-13 pr-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="exemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Data de Nascimento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Género</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="FEMININO">Feminino</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="OUTRO">Outro / Prefere não dizer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nº do BI ou Passaporte <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 110100482910M"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Grupo Sanguíneo</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-)</option>
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-)</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-)</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Alergias Conhecidas (Separe por vírgulas)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Penicilina, Sulfa, Amendoim"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              2. Endereço Residencial (Moçambique)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Província</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Maputo Cidade">Maputo Cidade</option>
                  <option value="Maputo Província">Maputo Província</option>
                  <option value="Gaza">Gaza</option>
                  <option value="Inhambane">Inhambane</option>
                  <option value="Sofala">Sofala (Beira)</option>
                  <option value="Manica">Manica</option>
                  <option value="Tete">Tete</option>
                  <option value="Zambézia">Zambézia</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Cabo Delgado">Cabo Delgado</option>
                  <option value="Niassa">Niassa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cidade / Distrito</label>
                <input
                  type="text"
                  placeholder="Ex: Maputo ou Matola"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                <input
                  type="text"
                  placeholder="Ex: Polana Cimento, Coop, Liberdade"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rua / Av. / Casa</label>
                <input
                  type="text"
                  placeholder="Ex: Av. Vladimir Lenine, Bloco C, Apt 4"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Plan Selection */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              3. Selecção do Plano de Micro-Seguro
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold">
                      Mais Popular
                    </span>
                  )}
                  <p className="text-xs font-bold text-gray-800">{plan.name}</p>
                  <p className="text-lg font-black text-sky-600 mt-1">
                    {plan.priceMzn} MZN <span className="text-[11px] font-normal text-gray-500">/mês</span>
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{plan.description}</p>
                  <div className="mt-2 text-[10px] text-sky-800 font-semibold">
                    ✓ {plan.discountPharmacyRate}% desc. farmácias
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Document Upload */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              4. Upload de Documentos (BI, Passaporte, Cartão de Saúde)
            </h4>

            {/* Render uploaded docs list */}
            {documentsList.length > 0 && (
              <div className="space-y-2 mb-3">
                {documentsList.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-sky-50 border border-sky-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                        {doc.type}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{doc.fileName}</p>
                        <p className="text-[10px] text-gray-500">
                          Nº: {doc.documentNumber} • {doc.fileSize}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <DocumentUploader onDocumentAdded={handleAddDocument} />
          </div>

          {/* Section 5: Emergency Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              5. Contacto de Emergência (Opcional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Contacto</label>
                <input
                  type="text"
                  placeholder="Ex: Manuel Sitoe"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Telefone de Emergência</label>
                <input
                  type="tel"
                  placeholder="Ex: +258 84 210 9988"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Parentesco / Relação</label>
                <input
                  type="text"
                  placeholder="Ex: Esposo, Mãe, Irmão"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gravando Cadastro...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Concluir Cadastro de Paciente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

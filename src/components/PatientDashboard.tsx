import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  FileDown,
  Plus,
  CheckCircle2,
  Bell,
  Pill,
  Stethoscope,
  FileText,
  CreditCard,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Patient, MedicalRecord, HealthReminder } from '../types';
import { generateMedicalHistoryPDF } from '../utils/pdfGenerator';
import { MpesaPaymentModal } from './MpesaPaymentModal';
import { MedicalRecordModal } from './MedicalRecordModal';
import { DocumentUploader } from './DocumentUploader';

interface PatientDashboardProps {
  patient: Patient;
  onUpdatePatient: (updated: Patient) => void;
  onOpenPharmacyView: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  onUpdatePatient,
  onOpenPharmacyView
}) => {
  const [activeTab, setActiveTab] = useState<'HISTORICO' | 'LEMBRETES' | 'DOCUMENTOS' | 'CARTAO'>(
    'HISTORICO'
  );
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderType, setReminderType] = useState<'CHECKUP' | 'VACINA' | 'MEDICACAO'>('CHECKUP');
  const [reminderDate, setReminderDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reminderPriority, setReminderPriority] = useState<'ALTA' | 'MEDIA' | 'BAIXA'>('MEDIA');
  const [showDocUploader, setShowDocUploader] = useState(false);

  const subscription = patient.subscription;
  const isSubscriptionActive = subscription?.status === 'ATIVA';
  const isSubscriptionPending = subscription?.status === 'PENDENTE';
  const isSubscriptionExpired = subscription?.status === 'EXPIRADA';

  const handleExportPDF = () => {
    generateMedicalHistoryPDF(patient);
  };

  const handlePaymentSuccess = (transaction: any, updatedSub: any) => {
    const updatedPatient: Patient = {
      ...patient,
      subscription: updatedSub,
      reminders: patient.reminders?.map((r) =>
        r.type === 'PAGAMENTO' ? { ...r, completed: true } : r
      )
    };
    onUpdatePatient(updatedPatient);
  };

  const handleRecordCreated = (newRecord: MedicalRecord) => {
    const updated: Patient = {
      ...patient,
      medicalRecords: [newRecord, ...(patient.medicalRecords || [])]
    };
    onUpdatePatient(updated);
  };

  const handleToggleReminder = async (reminderId: string) => {
    try {
      await fetch(`/api/reminders/${reminderId}/toggle`, { method: 'PATCH' });
    } catch (e) {
      // optimistic update
    }

    const updatedReminders = (patient.reminders || []).map((r) =>
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    );

    onUpdatePatient({
      ...patient,
      reminders: updatedReminders
    });
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          title: reminderTitle,
          type: reminderType,
          dueDate: reminderDate,
          priority: reminderPriority,
          channel: 'SMS'
        })
      });

      if (response.ok) {
        const createdReminder: HealthReminder = await response.json();
        onUpdatePatient({
          ...patient,
          reminders: [createdReminder, ...(patient.reminders || [])]
        });
        setReminderTitle('');
        setShowAddReminder(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDocAdded = async (doc: any) => {
    try {
      const res = await fetch(`/api/patients/${patient.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const newDoc = await res.json();
        onUpdatePatient({
          ...patient,
          documents: [newDoc, ...(patient.documents || [])]
        });
        setShowDocUploader(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Subscription Status & Key Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{patient.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gray-100 text-gray-700">
                  {patient.memberNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {patient.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {patient.address.neighborhood}, {patient.address.city}
                </span>
                <span>•</span>
                <span className="font-semibold text-sky-700">Sangue: {patient.bloodType || 'O+'}</span>
              </div>
            </div>
          </div>

          {/* Subscription Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
              title="Baixar histórico clínico completo em PDF"
            >
              <FileDown className="w-4 h-4 text-sky-600" />
              Exportar Histórico (PDF)
            </button>
            <button
              onClick={() => setIsMpesaModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              {isSubscriptionActive ? 'Gerir M-Pesa' : 'Pagar via M-Pesa'}
            </button>
          </div>
        </div>

        {/* Subscription Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
          {/* Status Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              isSubscriptionActive
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : isSubscriptionPending
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isSubscriptionActive
                  ? 'bg-emerald-600 text-white'
                  : isSubscriptionPending
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isSubscriptionActive ? (
                <ShieldCheck className="w-5 h-5" />
              ) : isSubscriptionPending ? (
                <Clock className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold opacity-80">Estado do Micro-Seguro</p>
              <p className="text-sm font-extrabold uppercase tracking-wide">
                {subscription?.status || 'PENDENTE'}
              </p>
            </div>
          </div>

          {/* Plan Details */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Plano Seleccionado</p>
              <p className="text-xs font-bold text-gray-800">{subscription?.planName || 'Básico'}</p>
              <p className="text-[11px] font-medium text-sky-600">{subscription?.priceMzn || 250} MZN / mês</p>
            </div>
          </div>

          {/* Next Billing / Benefit */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Próxima Mensalidade</p>
                <p className="text-xs font-bold text-gray-800">
                  {subscription?.nextBillingDate || 'Aguardando Activação'}
                </p>
                <p className="text-[10px] text-gray-500">Débito Automático M-Pesa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inactive alert banner if pending */}
        {!isSubscriptionActive && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-between flex-wrap gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Para aceder a consultas gratuitas e até 35% de desconto nas farmácias, efectue a taxa mensal via M-Pesa.
              </span>
            </div>
            <button
              onClick={() => setIsMpesaModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
            >
              Activar Agora (M-Pesa)
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('HISTORICO')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'HISTORICO'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Histórico Médico ({patient.medicalRecords?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('LEMBRETES')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'LEMBRETES'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          Lembretes & Vacinas ({patient.reminders?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('CARTAO')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'CARTAO'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Cartão Digital de Membro
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTOS')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTOS'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Documentos ({patient.documents?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Histórico Médico */}
      {activeTab === 'HISTORICO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              Consultas, Exames e Prescrições Registadas
            </h3>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Registo Clínico
            </button>
          </div>

          {(!patient.medicalRecords || patient.medicalRecords.length === 0) ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">Nenhum registo médico cadastrado</p>
              <p className="text-xs text-gray-500 mt-1">
                Adicione a sua primeira consulta ou exame para acompanhar o seu histórico de saúde.
              </p>
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Registo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {patient.medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {record.type}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{record.title}</h4>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{record.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    <p>
                      <strong className="text-gray-800">Médico:</strong> {record.doctorName} ({record.specialty})
                    </p>
                    <p>
                      <strong className="text-gray-800">Unidade de Saúde:</strong> {record.healthUnit}
                    </p>
                  </div>

                  {record.diagnosis && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                      <strong className="text-gray-800 block mb-0.5">Diagnóstico & Observações:</strong>
                      <p className="text-gray-600">{record.diagnosis}</p>
                    </div>
                  )}

                  {record.treatmentNotes && (
                    <p className="text-xs text-gray-600">
                      <strong className="text-gray-800">Recomendações:</strong> {record.treatmentNotes}
                    </p>
                  )}

                  {/* Medications with Pharmacy discount badge */}
                  {record.medications && record.medications.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className="text-xs text-gray-800 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-sky-600" />
                          Medicamentos Receitados:
                        </strong>
                        <button
                          onClick={onOpenPharmacyView}
                          className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Ver Farmácias com Desconto <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {record.medications.map((med) => (
                          <div
                            key={med.id}
                            className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-gray-800">{med.name}</p>
                              <p className="text-[11px] text-gray-500">
                                {med.dosage} • {med.frequency} ({med.duration})
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white shrink-0">
                              Desconto Elegível
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Lembretes e Vacinas */}
      {activeTab === 'LEMBRETES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" />
              Lembretes de Saúde, Vacinas e Check-Ups
            </h3>
            <button
              onClick={() => setShowAddReminder(!showAddReminder)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Lembrete
            </button>
          </div>

          {/* New Reminder Form */}
          {showAddReminder && (
            <form
              onSubmit={handleCreateReminder}
              className="p-4 bg-white border border-sky-200 rounded-2xl shadow-xs space-y-3"
            >
              <h4 className="text-xs font-bold text-gray-800">Criar Novo Lembrete de Saúde</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Descrição do Lembrete (Ex: Vacina da Hepatite B)"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="CHECKUP">Check-Up</option>
                    <option value="VACINA">Vacinação</option>
                    <option value="MEDICACAO">Medicação</option>
                  </select>
                </div>
                <div>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <select
                    value={reminderPriority}
                    onChange={(e) => setReminderPriority(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="ALTA">Prioridade Alta</option>
                    <option value="MEDIA">Prioridade Média</option>
                    <option value="BAIXA">Prioridade Baixa</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddReminder(false)}
                    className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {(patient.reminders || []).map((reminder) => (
              <div
                key={reminder.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  reminder.completed
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-white border-gray-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(reminder.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      reminder.completed
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'border-gray-300 hover:border-sky-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        reminder.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}
                    >
                      {reminder.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-semibold text-sky-700">Data: {reminder.dueDate}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {reminder.type}
                      </span>
                      <span>•</span>
                      <span className="text-gray-400">Canal: {reminder.channel}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    reminder.priority === 'ALTA'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {reminder.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Cartão Digital de Membro */}
      {activeTab === 'CARTAO' && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 text-white p-6 rounded-3xl shadow-xl border border-sky-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center font-black text-white text-sm">
                  SF
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight text-white">SAÚDE FÁCIL</h4>
                  <p className="text-[10px] text-sky-400 font-medium">Cartão de Micro-Seguro</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {subscription?.status || 'PENDENTE'}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Titular do Seguro</p>
                <p className="text-base font-extrabold tracking-wide text-slate-100">{patient.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Nº de Membro / Apólice</p>
                  <p className="font-mono font-bold text-sky-300">{patient.memberNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">BI / Passaporte</p>
                  <p className="font-mono font-semibold text-slate-200">{patient.idNumber}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Plano Contratado</p>
                <p className="text-xs font-bold text-slate-200">{subscription?.planName || 'Básico'}</p>
              </div>
              <div className="p-1.5 bg-white rounded-lg">
                <QrCode className="w-9 h-9 text-slate-900" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 space-y-1.5 text-center">
            <p className="font-bold text-gray-800">Como utilizar este cartão?</p>
            <p>
              Apresente este cartão digital no seu telemóvel ao chegar a clínicas ou farmácias conveniadas da rede Saúde Fácil para ter acesso imediato às consultas gratuitas e descontos de até 35%.
            </p>
          </div>
        </div>
      )}

      {/* 4. Documentos Anexados */}
      {activeTab === 'DOCUMENTOS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              Documentos Submetidos (BI, Passaporte, Cartão de Saúde)
            </h3>
            <button
              onClick={() => setShowDocUploader(!showDocUploader)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Anexar Novo Documento
            </button>
          </div>

          {showDocUploader && (
            <div className="p-4 bg-white border border-sky-200 rounded-2xl shadow-xs">
              <DocumentUploader onDocumentAdded={handleDocAdded} />
            </div>
          )}

          {(!patient.documents || patient.documents.length === 0) ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">Nenhum documento anexado</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Faça o upload do seu BI para facilitar o atendimento nas unidades de saúde.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {doc.type}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{doc.fileName}</p>
                      <p className="text-[11px] text-gray-500">Nº: {doc.documentNumber}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{doc.fileSize}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 shrink-0">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <MpesaPaymentModal
        patient={patient}
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Medical Record Creation Modal */}
      <MedicalRecordModal
        patientId={patient.id}
        patientName={patient.fullName}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  );
};

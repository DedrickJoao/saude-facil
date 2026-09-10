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
  ChevronRight,
  Video,
  Building2,
  AlertCircle,
  XCircle,
  Check
} from 'lucide-react';
import { Patient, MedicalRecord, HealthReminder, Appointment, PartnerClinic } from '../types';
import { generateMedicalHistoryPDF } from '../utils/pdfGenerator';
import { MpesaPaymentModal } from './MpesaPaymentModal';
import { MedicalRecordModal } from './MedicalRecordModal';
import { DocumentUploader } from './DocumentUploader';
import { DigitalCardQRModal } from './DigitalCardQRModal';
import { AppointmentBookingModal } from './AppointmentBookingModal';

interface PatientDashboardProps {
  patient: Patient;
  clinics?: PartnerClinic[];
  onUpdatePatient: (updated: Patient) => void;
  onOpenPharmacyView: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  clinics = [],
  onUpdatePatient,
  onOpenPharmacyView
}) => {
  const [activeTab, setActiveTab] = useState<'HISTORICO' | 'CONSULTAS' | 'LEMBRETES' | 'DOCUMENTOS' | 'CARTAO'>(
    'HISTORICO'
  );
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Reminder creation
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

  const handleAppointmentCreated = (newAppointment: Appointment) => {
    const updated: Patient = {
      ...patient,
      appointments: [newAppointment, ...(patient.appointments || [])]
    };
    onUpdatePatient(updated);
    setActiveTab('CONSULTAS');
  };

  const handleToggleAppointmentStatus = async (appointmentId: string, newStatus: 'REALIZADA' | 'CANCELADA') => {
    try {
      await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      // optimistic
    }

    const updatedApts = (patient.appointments || []).map((a) =>
      a.id === appointmentId ? { ...a, status: newStatus } : a
    );

    onUpdatePatient({
      ...patient,
      appointments: updatedApts
    });
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
          description: `Lembrete de saúde para ${patient.fullName}`,
          type: reminderType,
          dueDate: reminderDate,
          priority: reminderPriority,
          channel: 'SMS'
        })
      });

      if (response.ok) {
        const newRem = await response.json();
        onUpdatePatient({
          ...patient,
          reminders: [newRem, ...(patient.reminders || [])]
        });
        setReminderTitle('');
        setShowAddReminder(false);
      }
    } catch (err) {
      console.error(err);
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
                {patient.allergies && patient.allergies.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Alergia: {patient.allergies.join(', ')}
                  </span>
                )}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Exibir cartão virtual e QR code para farmácias"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              Cartão Digital (QR)
            </button>

            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Agendar consulta médica coberta"
            >
              <Calendar className="w-4 h-4" />
              Marcar Consulta
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
              title="Baixar histórico clínico completo em PDF"
            >
              <FileDown className="w-4 h-4 text-sky-600" />
              PDF
            </button>

            <button
              onClick={() => setIsMpesaModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              {isSubscriptionActive ? 'M-Pesa / Renovação' : 'Pagar M-Pesa'}
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
          Histórico Clínico ({patient.medicalRecords?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('CONSULTAS')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'CONSULTAS'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Consultas Agendadas ({patient.appointments?.length || 0})
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
          Cartão Digital & QR Code
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
              Histórico de Atendimentos Clínicos e Prescrições
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
            </div>
          ) : (
            <div className="space-y-3">
              {patient.medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                        {record.type === 'CONSULTA' ? (
                          <Stethoscope className="w-5 h-5" />
                        ) : record.type === 'EXAME' ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Pill className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                          {record.type}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{record.title}</h4>
                      </div>
                    </div>
                    <div className="text-left sm:text-right text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{record.date}</span>
                      <p className="text-[11px] text-gray-400">{record.healthUnit}</p>
                    </div>
                  </div>

                  {/* Diagnosis and Notes */}
                  <div className="space-y-2 text-xs text-gray-700">
                    {record.diagnosis && (
                      <p>
                        <strong className="text-gray-900">Diagnóstico:</strong> {record.diagnosis}
                      </p>
                    )}
                    {record.treatmentNotes && (
                      <p>
                        <strong className="text-gray-900">Recomendações:</strong> {record.treatmentNotes}
                      </p>
                    )}
                    {record.doctorName && (
                      <p className="text-[11px] text-gray-500">
                        Médico(a): <strong>{record.doctorName}</strong> ({record.specialty})
                      </p>
                    )}
                  </div>

                  {/* Prescribed Medications */}
                  {record.medications && record.medications.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 bg-sky-50/50 p-3 rounded-xl">
                      <p className="text-[11px] font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-sky-700" />
                        Medicamentos Prescritos com Desconto em Farmácias:
                      </p>
                      <div className="space-y-1">
                        {record.medications.map((med) => (
                          <div
                            key={med.id}
                            className="text-xs text-gray-800 flex items-center justify-between"
                          >
                            <span>
                              • <strong>{med.name}</strong> — {med.dosage} ({med.frequency})
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                              Desconto Válido
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

      {/* 2. Consultas Agendadas */}
      {activeTab === 'CONSULTAS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Marcações e Consultas da Rede Convencionada
            </h3>
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Marcar Nova Consulta
            </button>
          </div>

          {(!patient.appointments || patient.appointments.length === 0) ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-2">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">Nenhuma consulta agendada no momento</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Agende a sua consulta médica de Clínica Geral, Pediatria ou Cardiologia coberta pelo seu plano Saúde Fácil.
              </p>
              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" /> Marcar Consulta Agora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {patient.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.status === 'CONFIRMADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'REALIZADA'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        ● {apt.status}
                      </span>
                      {apt.isTeleconsultation ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Teleconsulta
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Presencial
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-800">
                        {apt.specialty} — {apt.doctorName}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-sky-900">{apt.clinicName}</p>
                    <p className="text-xs text-gray-600">
                      Motivo: <em>{apt.reason}</em>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-gray-800">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" /> {apt.date} às {apt.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {apt.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span
                      className={`text-xs font-extrabold ${
                        apt.coveredByPlan ? 'text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200' : 'text-gray-800'
                      }`}
                    >
                      {apt.coveredByPlan ? '0 MZN (Incluído)' : `${apt.costMzn} MZN`}
                    </span>

                    {apt.status === 'CONFIRMADA' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAppointmentStatus(apt.id, 'REALIZADA')}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Concluir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAppointmentStatus(apt.id, 'CANCELADA')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Lembretes e Vacinas */}
      {activeTab === 'LEMBRETES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" />
              Lembretes de Saúde, Vacinação e Check-Ups
            </h3>
            <button
              onClick={() => setShowAddReminder(!showAddReminder)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Lembrete
            </button>
          </div>

          {/* Form to add reminder */}
          {showAddReminder && (
            <form
              onSubmit={handleCreateReminder}
              className="bg-white border border-sky-200 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <h4 className="text-xs font-bold text-gray-800">Novo Lembrete Preventivo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vacina contra tétano"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-800 focus:bg-white"
                  >
                    <option value="CHECKUP">Check-up Preventivo</option>
                    <option value="VACINA">Vacinação</option>
                    <option value="MEDICACAO">Medicação</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Data Limite</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={reminderPriority}
                    onChange={(e) => setReminderPriority(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-800"
                  >
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Média</option>
                    <option value="BAIXA">Baixa</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminder(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-xs hover:bg-sky-700 cursor-pointer"
                >
                  Salvar Lembrete
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {(patient.reminders || []).map((reminder) => (
              <div
                key={reminder.id}
                className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 transition-all ${
                  reminder.completed
                    ? 'border-gray-200 bg-gray-50/50 opacity-60'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(reminder.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                      reminder.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 hover:border-sky-500'
                    }`}
                  >
                    {reminder.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <h5
                      className={`text-xs font-bold ${
                        reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {reminder.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>Data: {reminder.dueDate}</span>
                      <span>•</span>
                      <span className="font-semibold text-sky-700 uppercase text-[10px]">
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

      {/* 4. Cartão Digital de Membro */}
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
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="p-2 bg-white rounded-xl shadow-md hover:bg-sky-50 transition-colors cursor-pointer"
                title="Ampliar QR Code"
              >
                <QrCode className="w-8 h-8 text-slate-900" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Ver Cartão Digital Completo & QR Code
            </button>
          </div>
        </div>
      )}

      {/* 5. Documentos Anexados */}
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

      {/* Medical Record Creation Modal with Allergy Checks */}
      <MedicalRecordModal
        patientId={patient.id}
        patientName={patient.fullName}
        patientAllergies={patient.allergies}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onRecordCreated={handleRecordCreated}
      />

      {/* Digital Member Card & QR Modal */}
      <DigitalCardQRModal
        patient={patient}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        patient={patient}
        clinics={clinics}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  );
};

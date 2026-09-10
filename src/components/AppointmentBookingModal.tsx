import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Building2,
  UserCheck,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone
} from 'lucide-react';
import { Patient, PartnerClinic, Appointment } from '../types';

interface AppointmentBookingModalProps {
  patient: Patient;
  clinics: PartnerClinic[];
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  patient,
  clinics,
  isOpen,
  onClose,
  onAppointmentCreated
}) => {
  const [selectedClinicId, setSelectedClinicId] = useState<string>(clinics[0]?.id || 'cln-01');
  const [specialty, setSpecialty] = useState<string>('Clínica Geral');
  const [doctorName, setDoctorName] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00');
  const [reason, setReason] = useState<string>('Consulta de rotina e check-up preventivo');
  const [isTeleconsultation, setIsTeleconsultation] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId) || clinics[0];
  const isCovered = patient.subscription?.status === 'ATIVA';
  const planName = patient.subscription?.planName || 'Sem Plano Ativo';

  const timeSlots = ['08:30', '09:15', '10:00', '11:00', '14:00', '15:30', '16:45', '17:30'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          clinicName: selectedClinic ? selectedClinic.name : 'Centro Médico Parceiro',
          doctorName: doctorName || (specialty === 'Pediatria' ? 'Dra. Elsa Cossa' : 'Dr. Armando Mondlane'),
          specialty,
          date: appointmentDate,
          time: appointmentTime,
          reason,
          isTeleconsultation
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao agendar consulta');
      }

      const createdApt: Appointment = await response.json();
      onAppointmentCreated(createdApt);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na comunicação com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Marcar Nova Consulta Médica</h3>
              <p className="text-xs text-sky-100">Rede Convencionada Saúde Fácil</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto max-h-[75vh] space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Plan Coverage Badge */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-sky-900 block">Cobertura de Consultas:</span>
              <p className="text-xs text-sky-800">
                Beneficiário: <strong className="font-semibold">{patient.fullName}</strong> ({patient.memberNumber})
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isCovered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCovered ? '0 MZN (Incluída no Plano)' : '750 MZN (Taxa Utente)'}
              </span>
            </div>
          </div>

          {/* Mode Selector (In-Person vs Teleconsultation) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tipo de Atendimento</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsTeleconsultation(false)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  !isTeleconsultation
                    ? 'border-sky-600 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Building2 className={`w-5 h-5 shrink-0 ${!isTeleconsultation ? 'text-sky-600' : 'text-gray-400'}`} />
                <div>
                  <span className="block text-xs font-bold">Presencial na Clínica</span>
                  <span className="block text-[11px] text-gray-500">Atendimento físico em unidade parceira</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsTeleconsultation(true)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  isTeleconsultation
                    ? 'border-sky-600 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Video className={`w-5 h-5 shrink-0 ${isTeleconsultation ? 'text-sky-600' : 'text-gray-400'}`} />
                <div>
                  <span className="block text-xs font-bold">Teleconsulta Online</span>
                  <span className="block text-[11px] text-gray-500">Vídeo-chamada / WhatsApp Saúde</span>
                </div>
              </button>
            </div>
          </div>

          {/* Clinic selection (if in person) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {isTeleconsultation ? 'Centro Médico de Suporte' : 'Clínica / Centro Médico Parceiro'}
            </label>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name} — {clinic.city} ({clinic.neighborhood})
                </option>
              ))}
            </select>
            {selectedClinic && (
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                <span>{selectedClinic.address} • Tel: {selectedClinic.phone}</span>
              </p>
            )}
          </div>

          {/* Specialty & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Especialidade Médica</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="Clínica Geral">Clínica Geral / Medicina Familiar</option>
                <option value="Pediatria">Pediatria</option>
                <option value="Cardiologia">Cardiologia</option>
                <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
                <option value="Oftalmologia">Oftalmologia</option>
                <option value="Dermatologia">Dermatologia</option>
                <option value="Nutrição Clínica">Nutrição Clínica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Médico Preferencial (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Dr. Armando Mondlane"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Date and Time Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Data da Consulta</label>
              <input
                type="date"
                required
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Horário Disponível</label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time} horas
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo da consulta */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Motivo / Sintomas Principais</label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva brevemente o motivo da consulta (ex: dores de cabeça, renovação de receita, febre)..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Notification Info */}
          <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            📲 Enviaremos uma confirmação e lembrete automático via <strong>SMS e WhatsApp</strong> para o número{' '}
            <strong>{patient.phone}</strong> 24h antes da consulta.
          </p>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'A Agendar...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

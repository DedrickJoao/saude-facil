import React, { useState, useMemo } from 'react';
import { Stethoscope, X, Plus, Trash2, CheckCircle2, Loader2, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MedicalRecord, MedicalRecordType, PrescribedMedication } from '../types';

interface MedicalRecordModalProps {
  patientId: string;
  patientName: string;
  patientAllergies?: string[];
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated: (newRecord: MedicalRecord) => void;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  patientId,
  patientName,
  patientAllergies = [],
  isOpen,
  onClose,
  onRecordCreated
}) => {
  const [type, setType] = useState<MedicalRecordType>('CONSULTA');
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Armando Mondlane');
  const [specialty, setSpecialty] = useState('Clínica Geral');
  const [healthUnit, setHealthUnit] = useState('Centro Médico Polana Care');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [labResults, setLabResults] = useState('');

  // Medications list
  const [medications, setMedications] = useState<PrescribedMedication[]>([
    {
      id: 'med-1',
      name: 'Paracetamol 500mg',
      dosage: '1 comprimido de 8/8h',
      frequency: '3x ao dia',
      duration: '5 dias',
      discountEligible: true
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute real-time allergy alerts
  const allergyWarnings = useMemo(() => {
    if (!patientAllergies || patientAllergies.length === 0) return [];
    const patientAlgs = patientAllergies.map((a) => a.toLowerCase());
    const warnings: string[] = [];

    medications.forEach((med) => {
      const medName = med.name.toLowerCase();
      if (!medName) return;

      if (
        (medName.includes('penicil') || medName.includes('amoxicil') || medName.includes('ampicil')) &&
        patientAlgs.some((a) => a.includes('penicil') || a.includes('amoxicil'))
      ) {
        warnings.push(`Contra-indicação: "${med.name}" contém Penicilina/Betalactâmico e o utente é ALÉRGICO.`);
      }

      if (
        (medName.includes('ibuprof') || medName.includes('aspirin') || medName.includes('diclofenac') || medName.includes('cetoprof')) &&
        patientAlgs.some((a) => a.includes('ibuprof') || a.includes('aspirin') || a.includes('aine'))
      ) {
        warnings.push(`Alerta de AINE: "${med.name}" é um anti-inflamatório e o utente possui intolerância/alergia.`);
      }

      if (
        (medName.includes('sulfa') || medName.includes('bactrim') || medName.includes('cotrimox')) &&
        patientAlgs.some((a) => a.includes('sulfa'))
      ) {
        warnings.push(`Risco Severo: "${med.name}" contém Sulfonamidas e o utente é alérgico.`);
      }
    });

    return warnings;
  }, [medications, patientAllergies]);

  if (!isOpen) return null;

  const handleAddMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        name: '',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        duration: '5 dias',
        discountEligible: true
      }
    ]);
  };

  const handleUpdateMed = (index: number, field: keyof PrescribedMedication, value: any) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMed = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor indique o título ou motivo da consulta/exame.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      patientId,
      type,
      title: title.trim(),
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      healthUnit: healthUnit.trim(),
      date,
      diagnosis: diagnosis.trim(),
      symptoms: symptoms.trim(),
      treatmentNotes: treatmentNotes.trim(),
      labResults: labResults.trim(),
      medications: medications.filter((m) => m.name.trim().length > 0)
    };

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar registo clínico');
      }

      const created: MedicalRecord = await response.json();
      setLoading(false);
      onRecordCreated(created);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Erro de ligação');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Novo Registo Clínico</h3>
              <p className="text-xs text-sky-100">Utente: {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Evento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MedicalRecordType)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="CONSULTA">Consulta Médica</option>
                <option value="EXAME">Exame Clínico / Laboratorial</option>
                <option value="CHECKUP_GERAL">Check-Up Preventivo</option>
                <option value="MEDICAMENTO_RECEITADO">Prescrição Farmacêutica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Data do Atendimento</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Título / Motivo da Consulta <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Consulta de Rotina e Controlo de Tensão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Médico Responsável</label>
              <input
                type="text"
                placeholder="Ex: Dr. Armando Mondlane"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Especialidade / Unidade</label>
              <input
                type="text"
                placeholder="Ex: Clínica Geral - Centro Médico Polana"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Diagnóstico Clínico</label>
              <textarea
                rows={2}
                placeholder="Ex: Hipertensão arterial grau 1 compensada."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Recomendações e Plano Terapêutico
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Manter dieta hipossódica e realizar caminhadas de 30 min."
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Medications Section */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-800">
                Medicamentos Prescritos (Com desconto nas Farmácias Parceiras)
              </label>
              <button
                type="button"
                onClick={handleAddMedication}
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Medicamento
              </button>
            </div>

            {/* Real-time Allergy Conflict Warning */}
            {allergyWarnings.length > 0 && (
              <div className="p-3 bg-rose-50 border-2 border-rose-400 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>ALERTA DE SEGURANÇA FARMACOLÓGICA ({allergyWarnings.length})</span>
                </div>
                {allergyWarnings.map((warn, i) => (
                  <p key={i} className="text-[11px] text-rose-700 pl-6 leading-tight">
                    • {warn}
                  </p>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {medications.map((med, index) => (
                <div
                  key={med.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                >
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nome do Medicamento (Ex: Losartan 50mg)"
                      value={med.name}
                      onChange={(e) => handleUpdateMed(index, 'name', e.target.value)}
                      className="w-full text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Posologia (Ex: 1 comp/dia)"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMed(index, 'dosage', e.target.value)}
                      className="w-full text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      placeholder="Duração (30 dias)"
                      value={med.duration}
                      onChange={(e) => handleUpdateMed(index, 'duration', e.target.value)}
                      className="w-full text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMed(index)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Registo Clínico
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

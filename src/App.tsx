import React, { useState, useEffect } from 'react';
import { Header, ActiveView } from './components/Header';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PartnerPharmaciesView } from './components/PartnerPharmaciesView';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { PharmacyScannerModal } from './components/PharmacyScannerModal';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import {
  INITIAL_PATIENTS,
  INITIAL_PHARMACIES,
  PARTNER_CLINICS,
  INITIAL_APPOINTMENTS,
  calculateMetrics,
  INITIAL_TRANSACTIONS,
  INITIAL_REDEMPTIONS
} from './data/mockDatabase';
import { Patient, PartnerPharmacy, PartnerClinic, Appointment, AdminDashboardMetrics } from './types';
import { Heart, Shield, Phone, Mail, MapPin, QrCode } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [pharmacies, setPharmacies] = useState<PartnerPharmacy[]>(INITIAL_PHARMACIES);
  const [clinics, setClinics] = useState<PartnerClinic[]>(PARTNER_CLINICS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0]?.id || 'pat-01');
  const [activeView, setActiveView] = useState<ActiveView>('PACIENTE');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [preselectedClinicName, setPreselectedClinicName] = useState<string | undefined>(undefined);

  // Compute metrics dynamically from current state
  const metrics: AdminDashboardMetrics = calculateMetrics(
    patients,
    INITIAL_TRANSACTIONS,
    INITIAL_REDEMPTIONS,
    pharmacies
  );

  // Find currently selected patient
  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0] || INITIAL_PATIENTS[0];

  // Fetch initial data from backend API if available
  useEffect(() => {
    async function loadData() {
      try {
        const [patientsRes, pharmaciesRes, clinicsRes, appointmentsRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/pharmacies'),
          fetch('/api/clinics'),
          fetch('/api/appointments')
        ]);

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          if (Array.isArray(pData) && pData.length > 0) {
            setPatients(pData);
          }
        }
        if (pharmaciesRes.ok) {
          const phData = await pharmaciesRes.json();
          if (Array.isArray(phData) && phData.length > 0) {
            setPharmacies(phData);
          }
        }
        if (clinicsRes.ok) {
          const clData = await clinicsRes.json();
          if (Array.isArray(clData) && clData.length > 0) {
            setClinics(clData);
          }
        }
        if (appointmentsRes.ok) {
          const apData = await appointmentsRes.json();
          if (Array.isArray(apData) && apData.length > 0) {
            setAppointments(apData);
          }
        }
      } catch (err) {
        // Fallback to local state
        console.log('Utilizando base de dados em memória');
      }
    }
    loadData();
  }, []);

  const handleUpdatePatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setActiveView('PACIENTE');
  };

  const handleSelectPatientFromAdmin = (p: Patient) => {
    setSelectedPatientId(p.id);
    setActiveView('PACIENTE');
  };

  const handleAppointmentCreated = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    // Also attach to patient
    setPatients((prev) =>
      prev.map((p) =>
        p.id === newApt.patientId
          ? { ...p, appointments: [newApt, ...(p.appointments || [])] }
          : p
      )
    );
  };

  const handleOpenAppointmentModal = (clinicName?: string) => {
    setPreselectedClinicName(clinicName);
    setIsAppointmentModalOpen(true);
  };

  const handleRefreshData = async () => {
    try {
      const [resP, resA] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/appointments')
      ]);
      if (resP.ok) {
        const data = await resP.json();
        setPatients(data);
      }
      if (resA.ok) {
        const aData = await resA.json();
        setAppointments(aData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      {/* App Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        patients={patients}
        selectedPatient={currentPatient}
        onSelectPatient={(p) => setSelectedPatientId(p.id)}
        onOpenNewPatientModal={() => setIsRegistrationModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeView === 'PACIENTE' && (
          <PatientDashboard
            patient={currentPatient}
            clinics={clinics}
            onUpdatePatient={handleUpdatePatient}
            onOpenPharmacyView={() => setActiveView('FARMACIAS')}
          />
        )}

        {activeView === 'ADMIN' && (
          <AdminDashboard
            patients={patients}
            metrics={metrics}
            appointments={appointments}
            onSelectPatient={handleSelectPatientFromAdmin}
            onOpenNewPatientModal={() => setIsRegistrationModalOpen(true)}
            onRefreshData={handleRefreshData}
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        )}

        {activeView === 'FARMACIAS' && (
          <PartnerPharmaciesView
            pharmacies={pharmacies}
            clinics={clinics}
            patients={patients}
            selectedPatient={currentPatient}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onBookAppointment={handleOpenAppointmentModal}
          />
        )}

        {activeView === 'ARQUITETURA' && <ArchitectureExplorer />}
      </main>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

      {/* Pharmacy Scanner & Verification Modal */}
      <PharmacyScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        pharmacies={pharmacies}
      />

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        patient={currentPatient}
        clinics={clinics}
        preselectedClinicName={preselectedClinicName}
        onAppointmentCreated={handleAppointmentCreated}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              SF
            </div>
            <span className="font-bold text-gray-800">Saúde Fácil Moçambique</span>
            <span>• Micro-Seguro de Saúde por Assinatura Mensal</span>
          </div>

          <div className="flex items-center gap-4 text-gray-500 flex-wrap">
            <span>Pagamentos: Vodacom M-Pesa • Movitel e-Mola • Tmcel mKesh</span>
            <span>•</span>
            <span>Suporte: 800 4400 (Linha Gratuita)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

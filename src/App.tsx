import React, { useState, useEffect } from 'react';
import { Header, ActiveView } from './components/Header';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PartnerPharmaciesView } from './components/PartnerPharmaciesView';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import {
  INITIAL_PATIENTS,
  INITIAL_PHARMACIES,
  calculateMetrics,
  INITIAL_TRANSACTIONS,
  INITIAL_REDEMPTIONS
} from './data/mockDatabase';
import { Patient, PartnerPharmacy, AdminDashboardMetrics } from './types';
import { Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [pharmacies, setPharmacies] = useState<PartnerPharmacy[]>(INITIAL_PHARMACIES);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0]?.id || 'pat-01');
  const [activeView, setActiveView] = useState<ActiveView>('PACIENTE');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

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
        const [patientsRes, pharmaciesRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/pharmacies')
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

  const handleRefreshData = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
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
            onUpdatePatient={handleUpdatePatient}
            onOpenPharmacyView={() => setActiveView('FARMACIAS')}
          />
        )}

        {activeView === 'ADMIN' && (
          <AdminDashboard
            patients={patients}
            metrics={metrics}
            onSelectPatient={handleSelectPatientFromAdmin}
            onOpenNewPatientModal={() => setIsRegistrationModalOpen(true)}
            onRefreshData={handleRefreshData}
          />
        )}

        {activeView === 'FARMACIAS' && (
          <PartnerPharmaciesView
            pharmacies={pharmacies}
            patients={patients}
            selectedPatient={currentPatient}
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

          <div className="flex items-center gap-4 text-gray-500">
            <span>Pagamentos: Vodacom M-Pesa</span>
            <span>•</span>
            <span>Suporte: 800 4400 (Linha Gratuita)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  Percent,
  Search,
  Filter,
  Send,
  FileDown,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
  Eye,
  MessageSquare,
  Building2,
  QrCode,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Patient, AdminDashboardMetrics, PaymentTransaction, NotificationLog, Appointment } from '../types';
import { generateMedicalHistoryPDF } from '../utils/pdfGenerator';
import { INITIAL_TRANSACTIONS, INITIAL_NOTIFICATIONS } from '../data/mockDatabase';

interface AdminDashboardProps {
  patients: Patient[];
  metrics: AdminDashboardMetrics;
  appointments?: Appointment[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  onRefreshData: () => void;
  onOpenScanner?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  patients,
  metrics,
  appointments = [],
  onSelectPatient,
  onOpenNewPatientModal,
  onRefreshData,
  onOpenScanner
}) => {
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVA' | 'PENDENTE' | 'EXPIRADA'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'PACIENTES' | 'CONSULTAS' | 'PAGAMENTOS' | 'NOTIFICACOES'>('PACIENTES');

  // SMS Broadcast form
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL_PENDING' | 'ALL_ACTIVE' | 'CUSTOM'>('ALL_PENDING');
  const [broadcastMsg, setBroadcastMsg] = useState(
    'Saúde Fácil: A sua mensalidade está pendente. Regularize via M-Pesa para manter as consultas gratuitas e até 35% de desconto nas farmácias parceiras.'
  );
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);
  const [notificationsLogs, setNotificationsLogs] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);

  const filteredPatients = patients.filter((p) => {
    const matchStatus = statusFilter === 'TODOS' || p.subscription?.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.memberNumber.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.idNumber.toLowerCase().includes(q) ||
      p.medicalRecords?.some(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.diagnosis?.toLowerCase().includes(q) ||
          m.medications?.some((med) => med.name.toLowerCase().includes(q))
      );
    return matchStatus && matchSearch;
  });

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBroadcast(true);
    setBroadcastFeedback(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Aviso Saúde Fácil',
          message: broadcastMsg,
          recipient: broadcastTarget === 'ALL_PENDING' ? 'Todos os Utentes Pendentes' : 'Todos os Utentes Activos',
          type: 'SMS'
        })
      });

      const log = await response.json();
      setNotificationsLogs((prev) => [log, ...prev]);
      setSendingBroadcast(false);
      setBroadcastFeedback('Disparo de notificações SMS enviado com sucesso!');
    } catch (e) {
      setSendingBroadcast(false);
      setBroadcastFeedback('Erro ao disparar notificações.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Painel do Administrador & Operações</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Gestão de micro-seguros de saúde, base de pacientes, convénios clínicos e faturamento M-Pesa
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Actualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              Validar Membro (POS/QR)
            </button>
          )}

          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Paciente
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Active Subscribers */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Assinantes Activos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{metrics.activeSubscribers}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {metrics.totalPatients} pacientes no total ({metrics.pendingSubscribers} pendentes)
          </p>
        </div>

        {/* Metric 2: Monthly Revenue */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Receita Mensal (MRR)
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {metrics.totalMonthlyRevenueMzn}.00 <span className="text-xs font-bold text-gray-500">MZN</span>
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Cobrança recorrente via M-Pesa / e-Mola
          </p>
        </div>

        {/* Metric 3: Consultations Done */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Consultas na Rede
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{metrics.totalConsultationsHeld}</p>
          <p className="text-[11px] text-sky-700 font-semibold mt-1">
            Taxa de satisfação: ⭐ {metrics.averageSatisfactionRate} / 5.0
          </p>
        </div>

        {/* Metric 4: Pharmacy Discounts */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Descontos Aplicados
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {metrics.totalDiscountsAppliedMzn}.00 <span className="text-xs font-bold text-gray-500">MZN</span>
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Economia gerada aos pacientes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedTab('PACIENTES')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'PACIENTES'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Pacientes e Assinaturas ({patients.length})
        </button>

        <button
          onClick={() => setSelectedTab('CONSULTAS')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'CONSULTAS'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agendamentos na Rede ({appointments.length})
        </button>

        <button
          onClick={() => setSelectedTab('PAGAMENTOS')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'PAGAMENTOS'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Transações Financeiras
        </button>

        <button
          onClick={() => setSelectedTab('NOTIFICACOES')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'NOTIFICACOES'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Disparador de SMS & Alertas
        </button>
      </div>

      {/* TAB 1: Patients & Subscriptions List */}
      {selectedTab === 'PACIENTES' && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, BI, telefone ou diagnóstico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Status Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-semibold mr-1">Status:</span>
              {(['TODOS', 'ATIVA', 'PENDENTE', 'EXPIRADA'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? status === 'ATIVA'
                        ? 'bg-emerald-600 text-white'
                        : status === 'PENDENTE'
                        ? 'bg-amber-500 text-white'
                        : status === 'EXPIRADA'
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">Utente / Nº Membro</th>
                    <th className="py-3 px-4">Contactos</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Próximo Vencimento</th>
                    <th className="py-3 px-4">Histórico</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Nenhum paciente encontrado com os filtros actuais.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => {
                      const sub = patient.subscription;
                      const isActive = sub?.status === 'ATIVA';
                      const isPending = sub?.status === 'PENDENTE';

                      return (
                        <tr
                          key={patient.id}
                          className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                          onClick={() => onSelectPatient(patient)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs shrink-0">
                                {patient.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{patient.fullName}</p>
                                <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                  {patient.memberNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                            {patient.phone}
                            <p className="text-[10px] text-gray-400">{patient.email}</p>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-800">{sub?.planName || 'Básico'}</span>
                            <p className="text-[10px] text-gray-500">{sub?.priceMzn || 250} MZN/mês</p>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              ● {sub?.status || 'PENDENTE'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-gray-700 font-medium">
                            {sub?.nextBillingDate || '—'}
                          </td>

                          <td className="py-3 px-4 text-gray-600">
                            <span className="font-bold text-gray-800">
                              {patient.medicalRecords?.length || 0}
                            </span>{' '}
                            atendimentos
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectPatient(patient);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver Perfil
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Appointments Across Network */}
      {selectedTab === 'CONSULTAS' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Marcações Médicas nas Clínicas Conveniadas</h3>
              <span className="text-xs text-gray-500">{appointments.length} registos no total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">Paciente</th>
                    <th className="py-3 px-4">Clínica / Especialidade</th>
                    <th className="py-3 px-4">Médico</th>
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Comparticipação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Nenhum agendamento registado na rede.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4 font-bold text-gray-900">{apt.patientName}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-sky-900">{apt.clinicName}</span>
                          <span className="block text-[10px] text-gray-500">{apt.specialty}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{apt.doctorName}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {apt.date} às {apt.time}
                        </td>
                        <td className="py-3 px-4">
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
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                          {apt.coveredByPlan ? '100% Coberto' : `${apt.costMzn} MZN`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Payments / Transactions */}
      {selectedTab === 'PAGAMENTOS' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Histórico de Transações de Pagamento</h3>
            <span className="text-xs text-gray-500">Conciliação M-Pesa & e-Mola</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Transação ID</th>
                  <th className="py-3 px-4">Beneficiário</th>
                  <th className="py-3 px-4">Número Móvel</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {INITIAL_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-4 font-mono font-bold text-gray-800">{tx.mpesaTransactionId}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-900">{tx.patientName}</td>
                    <td className="py-2.5 px-4 font-mono text-gray-600">+258 {tx.mpesaPhone}</td>
                    <td className="py-2.5 px-4 text-gray-600">{tx.planName}</td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-emerald-600">{tx.amountMzn}.00 MZN</td>
                    <td className="py-2.5 px-4 text-gray-500">{new Date(tx.createdAt).toLocaleString('pt-MZ')}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SMS Broadcast & Notification Logs */}
      {selectedTab === 'NOTIFICACOES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Send SMS Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600" />
              Disparo de Notificações SMS aos Utentes
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Destinatários</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL_PENDING">Todos os Utentes com Pagamento Pendente ({metrics.pendingSubscribers})</option>
                  <option value="ALL_ACTIVE">Todos os Utentes com Assinatura Activa ({metrics.activeSubscribers})</option>
                  <option value="CUSTOM">Todos os Pacientes Cadastrados ({metrics.totalPatients})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mensagem SMS</label>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
                <p className="text-[11px] text-gray-400 text-right mt-0.5">{broadcastMsg.length} caracteres</p>
              </div>

              {broadcastFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {broadcastFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={sendingBroadcast}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {sendingBroadcast ? 'Enviando Mensagens...' : 'Disparar SMS via Gateway'}
              </button>
            </form>
          </div>

          {/* Notification Logs */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              Histórico de Notificações Enviadas
            </h3>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {notificationsLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{log.patientName} ({log.recipient})</span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {log.type} - {log.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px]">{log.message}</p>
                  <p className="text-[10px] text-gray-400">{new Date(log.sentAt).toLocaleString('pt-MZ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

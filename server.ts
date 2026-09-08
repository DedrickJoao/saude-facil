import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PATIENTS,
  INITIAL_PHARMACIES,
  INITIAL_TRANSACTIONS,
  INITIAL_REDEMPTIONS,
  INITIAL_NOTIFICATIONS,
  SUBSCRIPTION_PLANS,
  calculateMetrics
} from './src/data/mockDatabase';
import {
  Patient,
  PartnerPharmacy,
  PaymentTransaction,
  PharmacyDiscountRedemption,
  NotificationLog,
  MedicalRecord,
  HealthReminder,
  PatientDocument
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store (Stateful backend)
let patientsStore: Patient[] = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
let pharmaciesStore: PartnerPharmacy[] = JSON.parse(JSON.stringify(INITIAL_PHARMACIES));
let transactionsStore: PaymentTransaction[] = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
let redemptionsStore: PharmacyDiscountRedemption[] = JSON.parse(JSON.stringify(INITIAL_REDEMPTIONS));
let notificationsStore: NotificationLog[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ==========================================
  // API ROUTES - SAÚDE FÁCIL BACKEND
  // ==========================================

  // 1. Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      system: 'Saúde Fácil Micro-Seguro API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Subscription Plans
  app.get('/api/plans', (req: Request, res: Response) => {
    res.json(SUBSCRIPTION_PLANS);
  });

  // 3. Patients (List & Filter)
  app.get('/api/patients', (req: Request, res: Response) => {
    const { status, search } = req.query;
    let results = [...patientsStore];

    if (status && typeof status === 'string' && status !== 'TODOS') {
      results = results.filter((p) => p.subscription?.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.memberNumber.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.idNumber.toLowerCase().includes(q) ||
          p.medicalRecords?.some(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              m.diagnosis?.toLowerCase().includes(q) ||
              m.medications?.some((med) => med.name.toLowerCase().includes(q))
          )
      );
    }

    res.json(results);
  });

  // 4. Patient by ID
  app.get('/api/patients/:id', (req: Request, res: Response) => {
    const patient = patientsStore.find((p) => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(patient);
  });

  // 5. Register New Patient (Formulário de Cadastro)
  app.post('/api/patients', (req: Request, res: Response) => {
    try {
      const {
        fullName,
        phone,
        email,
        dateOfBirth,
        gender,
        address,
        idNumber,
        bloodType,
        allergies,
        emergencyContact,
        selectedPlanId = 'BASICO',
        documents = []
      } = req.body;

      if (!fullName || !phone || !dateOfBirth) {
        return res.status(400).json({ error: 'Nome, telefone e data de nascimento são obrigatórios' });
      }

      const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];
      const newPatientId = `pat-${Date.now()}`;
      const memberCode = `SF-${Math.floor(10000 + Math.random() * 90000)}`;

      const newPatient: Patient = {
        id: newPatientId,
        memberNumber: memberCode,
        fullName,
        phone,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@saudefacil.mz`,
        dateOfBirth,
        gender: gender || 'OUTRO',
        address: address || {
          street: 'Av. Principal',
          neighborhood: 'Bairro Central',
          city: 'Maputo',
          province: 'Maputo Cidade'
        },
        idNumber: idNumber || `BI-${Date.now()}`,
        bloodType: bloodType || 'O+',
        allergies: allergies || [],
        emergencyContact,
        createdAt: new Date().toISOString(),
        subscription: {
          id: `sub-${Date.now()}`,
          patientId: newPatientId,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          priceMzn: selectedPlan.priceMzn,
          status: 'PENDENTE', // Ativada após primeiro pagamento M-Pesa
          startDate: new Date().toISOString().split('T')[0],
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentMethod: 'MPESA',
          autoRenew: true,
          mpesaNumber: phone.replace(/[^0-9]/g, '').slice(-9)
        },
        documents: documents.map((doc: any, index: number) => ({
          id: `doc-${Date.now()}-${index}`,
          patientId: newPatientId,
          type: doc.type || 'BI',
          documentNumber: doc.documentNumber || idNumber,
          fileName: doc.fileName || `documento_${index + 1}.pdf`,
          fileSize: doc.fileSize || '1.1 MB',
          uploadedAt: new Date().toISOString(),
          status: 'VALIDADO',
          notes: 'Documento submetido no cadastro inicial'
        })),
        medicalRecords: [
          {
            id: `med-init-${Date.now()}`,
            patientId: newPatientId,
            type: 'CHECKUP_GERAL',
            title: 'Inscrição e Triagem Inicial Saúde Fácil',
            doctorName: 'Equipa de Triagem Saúde Fácil',
            specialty: 'Enfermagem / Clínica Geral',
            healthUnit: 'Central Digital Saúde Fácil',
            date: new Date().toISOString().split('T')[0],
            diagnosis: 'Cadastro concluído com sucesso. Elegível para plano de micro-seguro.',
            treatmentNotes: 'Realizar primeiro check-up de boas-vindas após activação da assinatura.'
          }
        ],
        reminders: [
          {
            id: `rem-init-${Date.now()}`,
            patientId: newPatientId,
            title: 'Activação de Assinatura via M-Pesa',
            description: `Efectue o pagamento de ${selectedPlan.priceMzn} MZN via M-Pesa para activar todos os benefícios.`,
            type: 'PAGAMENTO',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completed: false,
            priority: 'ALTA',
            channel: 'SMS'
          },
          {
            id: `rem-check-${Date.now()}`,
            patientId: newPatientId,
            title: 'Check-Up Inicial de Boas-Vindas',
            description: 'Agende a sua consulta médica de rotina incluída no seu plano.',
            type: 'CHECKUP',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completed: false,
            priority: 'MEDIA',
            channel: 'SMS'
          }
        ]
      };

      patientsStore.unshift(newPatient);

      // Log notification
      notificationsStore.unshift({
        id: `notif-${Date.now()}`,
        patientId: newPatient.id,
        patientName: newPatient.fullName,
        recipient: newPatient.phone,
        type: 'SMS',
        subject: 'Bem-vindo ao Saúde Fácil',
        message: `Bem-vindo ao Saúde Fácil, ${newPatient.fullName.split(' ')[0]}! O seu número de membro é ${newPatient.memberNumber}. Pague a sua taxa de ${selectedPlan.priceMzn} MZN via M-Pesa para activar a sua cobertura.`,
        status: 'ENVIADO',
        sentAt: new Date().toISOString()
      });

      res.status(201).json(newPatient);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao cadastrar paciente', details: err.message });
    }
  });

  // 6. Upload Patient Document
  app.post('/api/patients/:id/documents', (req: Request, res: Response) => {
    const patient = patientsStore.find((p) => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const { type, documentNumber, fileName, fileSize, fileData, notes } = req.body;
    const newDoc: PatientDocument = {
      id: `doc-${Date.now()}`,
      patientId: patient.id,
      type: type || 'BI',
      documentNumber: documentNumber || 'DOC-REG',
      fileName: fileName || 'documento_anexo.pdf',
      fileSize: fileSize || '1.4 MB',
      fileData,
      uploadedAt: new Date().toISOString(),
      status: 'VALIDADO',
      notes: notes || 'Documento validado digitalmente'
    };

    if (!patient.documents) patient.documents = [];
    patient.documents.unshift(newDoc);

    res.status(201).json(newDoc);
  });

  // 7. M-Pesa C2B Payment & Subscription Activation
  app.post('/api/payments/mpesa/c2b', (req: Request, res: Response) => {
    const { patientId, mpesaPhone, amountMzn, planId } = req.body;

    const patient = patientsStore.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Clean phone number (Format: 84XXXXXXX or 85XXXXXXX)
    const cleanPhone = (mpesaPhone || patient.phone).replace(/[^0-9]/g, '').slice(-9);
    const mpesaTxId = `MP${new Date().toISOString().slice(2, 10).replace(/-/g, '')}.${Math.floor(1000 + Math.random() * 9000)}.${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS.find((p) => p.id === patient.subscription?.planId) || SUBSCRIPTION_PLANS[0];
    const finalAmount = amountMzn || plan.priceMzn;

    const newTransaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      subscriptionId: patient.subscription?.id || `sub-${Date.now()}`,
      amountMzn: finalAmount,
      mpesaPhone: cleanPhone,
      mpesaTransactionId: mpesaTxId,
      status: 'CONCLUIDO',
      createdAt: new Date().toISOString(),
      planName: plan.name
    };

    transactionsStore.unshift(newTransaction);

    // Update patient subscription to ATIVA
    if (patient.subscription) {
      patient.subscription.status = 'ATIVA';
      patient.subscription.planId = plan.id;
      patient.subscription.planName = plan.name;
      patient.subscription.priceMzn = plan.priceMzn;
      patient.subscription.lastPaymentDate = new Date().toISOString().split('T')[0];
      patient.subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      patient.subscription.mpesaNumber = cleanPhone;
    }

    // Mark payment reminder as completed
    if (patient.reminders) {
      patient.reminders.forEach((r) => {
        if (r.type === 'PAGAMENTO') {
          r.completed = true;
        }
      });
    }

    // Send instant confirmation SMS
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      recipient: cleanPhone,
      type: 'SMS',
      subject: 'M-Pesa: Pagamento Confirmado',
      message: `Confirmado: ${mpesaTxId} - Transferência de ${finalAmount}.00 MZN para SAUDE FACIL efectuada com sucesso. A sua assinatura está ATIVA até ${patient.subscription?.nextBillingDate}.`,
      status: 'ENVIADO',
      sentAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Pagamento M-Pesa processado com sucesso!',
      transaction: newTransaction,
      subscription: patient.subscription
    });
  });

  // 8. Add Medical Record (Consultas, Exames, Medicamentos)
  app.post('/api/medical-records', (req: Request, res: Response) => {
    const { patientId, type, title, doctorName, specialty, healthUnit, date, diagnosis, symptoms, treatmentNotes, medications, labResults } = req.body;

    const patient = patientsStore.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const newRecord: MedicalRecord = {
      id: `med-${Date.now()}`,
      patientId: patient.id,
      type: type || 'CONSULTA',
      title: title || 'Registo Clínico',
      doctorName: doctorName || 'Dr. Médico Assistente',
      specialty: specialty || 'Clínica Geral',
      healthUnit: healthUnit || 'Rede Saúde Fácil',
      date: date || new Date().toISOString().split('T')[0],
      diagnosis,
      symptoms,
      treatmentNotes,
      medications,
      labResults
    };

    if (!patient.medicalRecords) patient.medicalRecords = [];
    patient.medicalRecords.unshift(newRecord);

    res.status(201).json(newRecord);
  });

  // 9. Add & Toggle Reminders (Lembretes de Check-ups e Vacinação)
  app.post('/api/reminders', (req: Request, res: Response) => {
    const { patientId, title, description, type, dueDate, priority, channel } = req.body;
    const patient = patientsStore.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const newReminder: HealthReminder = {
      id: `rem-${Date.now()}`,
      patientId: patient.id,
      title,
      description: description || '',
      type: type || 'CHECKUP',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      priority: priority || 'MEDIA',
      channel: channel || 'SMS'
    };

    if (!patient.reminders) patient.reminders = [];
    patient.reminders.unshift(newReminder);

    res.status(201).json(newReminder);
  });

  app.patch('/api/reminders/:id/toggle', (req: Request, res: Response) => {
    const reminderId = req.params.id;
    let found = false;

    for (const p of patientsStore) {
      const rem = p.reminders?.find((r) => r.id === reminderId);
      if (rem) {
        rem.completed = !rem.completed;
        found = true;
        return res.json(rem);
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }
  });

  // 10. Partner Pharmacies (List & Register Discounts)
  app.get('/api/pharmacies', (req: Request, res: Response) => {
    res.json(pharmaciesStore);
  });

  // Validate discount for a patient at a partner pharmacy
  app.post('/api/pharmacies/apply-discount', (req: Request, res: Response) => {
    const { memberNumber, pharmacyId, medicationList, originalPriceMzn } = req.body;

    const patient = patientsStore.find((p) => p.memberNumber === memberNumber || p.id === memberNumber);
    if (!patient) {
      return res.status(404).json({ error: 'Número de membro Saúde Fácil não encontrado' });
    }

    if (patient.subscription?.status !== 'ATIVA') {
      return res.status(400).json({
        error: `Assinatura do membro está ${patient.subscription?.status || 'INACTIVA'}. É necessário estar com a assinatura ATIVA para usufruir de descontos.`
      });
    }

    const pharmacy = pharmaciesStore.find((f) => f.id === pharmacyId) || pharmaciesStore[0];
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === patient.subscription?.planId) || SUBSCRIPTION_PLANS[0];
    
    // Effective discount rate is the maximum between pharmacy rate and plan benefit rate
    const discountRate = Math.max(pharmacy.discountPercentage, plan.discountPharmacyRate);
    const originalPrice = parseFloat(originalPriceMzn) || 1000;
    const savedAmount = Math.round((originalPrice * discountRate) / 100);
    const finalPrice = originalPrice - savedAmount;
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const redemption: PharmacyDiscountRedemption = {
      id: `red-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      memberNumber: patient.memberNumber,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      medicationList: medicationList || 'Medicamentos Prescritos',
      originalPriceMzn: originalPrice,
      discountPercentage: discountRate,
      savedAmountMzn: savedAmount,
      finalPriceMzn: finalPrice,
      redemptionDate: new Date().toISOString(),
      receiptNumber: receiptNum
    };

    redemptionsStore.unshift(redemption);

    // Send SMS receipt
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      recipient: patient.phone,
      type: 'SMS',
      subject: 'Desconto Farmacêutico Aplicado',
      message: `Saúde Fácil: Desconto de ${discountRate}% aplicado na ${pharmacy.name}. Poupou ${savedAmount} MZN. Total pago: ${finalPrice} MZN. Código: ${receiptNum}`,
      status: 'ENVIADO',
      sentAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Desconto validado e aplicado com sucesso!',
      redemption
    });
  });

  // 11. Notifications (Send and List)
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(notificationsStore);
  });

  app.post('/api/notifications/send', (req: Request, res: Response) => {
    const { patientId, type, subject, message, recipient } = req.body;
    const patient = patientsStore.find((p) => p.id === patientId);

    const log: NotificationLog = {
      id: `notif-${Date.now()}`,
      patientId: patient ? patient.id : 'broadcast',
      patientName: patient ? patient.fullName : 'Utente',
      recipient: recipient || (patient ? patient.phone : '+258 84 000 0000'),
      type: type || 'SMS',
      subject: subject || 'Notificação Saúde Fácil',
      message: message || '',
      status: 'ENVIADO',
      sentAt: new Date().toISOString()
    };

    notificationsStore.unshift(log);
    res.status(201).json(log);
  });

  // 12. Admin Metrics & Analytics
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    const metrics = calculateMetrics(patientsStore, transactionsStore, redemptionsStore, pharmaciesStore);
    res.json({
      metrics,
      recentTransactions: transactionsStore.slice(0, 10),
      recentRedemptions: redemptionsStore.slice(0, 10),
      recentNotifications: notificationsStore.slice(0, 10)
    });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🏥 SAÚDE FÁCIL - SERVIDOR ATIVO EM http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor Saúde Fácil:', err);
});

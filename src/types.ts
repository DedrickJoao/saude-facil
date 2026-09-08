export type DocumentType = 'BI' | 'PASSAPORTE' | 'CARTAO_SAUDE' | 'OUTRO';
export type DocumentStatus = 'VALIDADO' | 'PENDENTE' | 'REJEITADO';

export interface PatientDocument {
  id: string;
  patientId: string;
  type: DocumentType;
  documentNumber: string;
  fileName: string;
  fileSize: string;
  fileData?: string; // base64 or preview url
  uploadedAt: string;
  status: DocumentStatus;
  notes?: string;
}

export type SubscriptionPlanId = 'BASICO' | 'FAMILIAR' | 'PREMIUM';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  priceMzn: number;
  period: 'mensal' | 'anual';
  description: string;
  benefits: string[];
  discountPharmacyRate: number;
  includedConsultations: number;
  popular?: boolean;
}

export type SubscriptionStatus = 'ATIVA' | 'PENDENTE' | 'EXPIRADA' | 'CANCELADA';

export interface Subscription {
  id: string;
  patientId: string;
  planId: SubscriptionPlanId;
  planName: string;
  priceMzn: number;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  paymentMethod: 'MPESA' | 'EMOLA' | 'CARTAO';
  autoRenew: boolean;
  mpesaNumber?: string;
  lastPaymentDate?: string;
}

export interface PaymentTransaction {
  id: string;
  patientId: string;
  patientName: string;
  subscriptionId: string;
  amountMzn: number;
  mpesaPhone: string;
  mpesaTransactionId: string;
  status: 'CONCLUIDO' | 'PENDENTE' | 'FALHOU';
  createdAt: string;
  planName: string;
}

export type MedicalRecordType = 'CONSULTA' | 'EXAME' | 'MEDICAMENTO_RECEITADO' | 'CHECKUP_GERAL';

export interface PrescribedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  discountEligible: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: MedicalRecordType;
  title: string;
  doctorName: string;
  specialty: string;
  healthUnit: string;
  date: string;
  diagnosis?: string;
  symptoms?: string;
  treatmentNotes?: string;
  medications?: PrescribedMedication[];
  labResults?: string;
}

export type ReminderType = 'CHECKUP' | 'VACINA' | 'PAGAMENTO' | 'MEDICACAO';
export type ReminderPriority = 'ALTA' | 'MEDIA' | 'BAIXA';
export type NotificationChannel = 'SMS' | 'EMAIL' | 'WHATSAPP';

export interface HealthReminder {
  id: string;
  patientId: string;
  title: string;
  description: string;
  type: ReminderType;
  dueDate: string;
  completed: boolean;
  priority: ReminderPriority;
  channel: NotificationChannel;
  lastNotifiedAt?: string;
}

export interface Patient {
  id: string;
  memberNumber: string; // Ex: SF-84920
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  address: {
    street: string;
    neighborhood: string;
    city: string;
    province: string;
  };
  idNumber: string; // BI ou Passaporte
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  subscription?: Subscription;
  documents?: PatientDocument[];
  medicalRecords?: MedicalRecord[];
  reminders?: HealthReminder[];
}

export interface PartnerPharmacy {
  id: string;
  name: string;
  chainName?: string;
  address: string;
  neighborhood: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  discountPercentage: number;
  active: boolean;
  openingHours: string;
  rating: number;
  supportedPlans: SubscriptionPlanId[];
  locationNotes: string;
}

export interface PharmacyDiscountRedemption {
  id: string;
  patientId: string;
  patientName: string;
  memberNumber: string;
  pharmacyId: string;
  pharmacyName: string;
  medicationList: string;
  originalPriceMzn: number;
  discountPercentage: number;
  savedAmountMzn: number;
  finalPriceMzn: number;
  redemptionDate: string;
  receiptNumber: string;
}

export interface NotificationLog {
  id: string;
  patientId: string;
  patientName: string;
  recipient: string; // Phone or email
  type: 'SMS' | 'EMAIL';
  subject: string;
  message: string;
  status: 'ENVIADO' | 'PENDENTE' | 'FALHOU';
  sentAt: string;
}

export interface AdminDashboardMetrics {
  totalPatients: number;
  activeSubscribers: number;
  pendingSubscribers: number;
  expiredSubscribers: number;
  totalMonthlyRevenueMzn: number;
  totalConsultationsHeld: number;
  totalDiscountsAppliedMzn: number;
  totalPartnerPharmacies: number;
  averageSatisfactionRate: number;
}

export interface CodeSnippet {
  title: string;
  language: 'typescript' | 'sql' | 'json' | 'bash';
  fileName: string;
  description: string;
  code: string;
}

export const ARCHITECTURE_TREE = `
saude-facil/
├── .env.example
├── package.json
├── tsconfig.json
├── server.ts                  # Servidor Express principal (Rotas, M-Pesa, Vite)
├── database/
│   ├── schema.sql             # Definição relacional DDL (PostgreSQL)
│   └── seed.sql               # Dados iniciais para testes
├── prisma/
│   └── schema.prisma          # Modelo Prisma ORM para PostgreSQL
├── server/
│   ├── config/
│   │   ├── mpesa.ts           # Configuração de chaves e endpoints Vodacom M-Pesa
│   │   └── database.ts        # Conexão PostgreSQL / MongoDB
│   ├── controllers/
│   │   ├── patient.controller.ts
│   │   ├── subscription.controller.ts
│   │   ├── mpesa.controller.ts
│   │   ├── medical-record.controller.ts
│   │   └── pharmacy.controller.ts
│   ├── models/                # Modelos MongoDB Mongoose
│   │   ├── Patient.ts
│   │   ├── Subscription.ts
│   │   ├── MedicalRecord.ts
│   │   ├── Document.ts
│   │   └── Pharmacy.ts
│   ├── services/
│   │   ├── mpesa.service.ts   # Integração C2B & Webhook da Vodacom Moçambique
│   │   ├── notification.service.ts # Envio de SMS via Gateway & Email
│   │   └── pdf.service.ts     # Geração de relatórios médicos
│   └── middlewares/
│       ├── auth.middleware.ts # Validação de token JWT e permissões RBAC
│       └── upload.middleware.ts # Gestão de upload de BI/Passaportes (Multer)
└── src/
    ├── components/
    │   ├── PatientRegistrationModal.tsx # Formulário de cadastro + upload
    │   ├── PatientDashboard.tsx         # Dashboard com histórico, status e M-Pesa
    │   ├── AdminDashboard.tsx           # Gestão de utentes, relatórios e métricas
    │   ├── PartnerPharmaciesView.tsx    # Validação de descontos em farmácias
    │   ├── MpesaPaymentModal.tsx        # Modal com simulação de prompt USSD
    │   ├── DocumentUploader.tsx         # Drag & Drop de BI, Passaporte e Cartão
    │   ├── MedicalRecordModal.tsx       # Registo de novas consultas e receitas
    │   └── ArchitectureExplorer.tsx    # Visualizador do scaffold e código
    ├── data/
    │   ├── mockDatabase.ts
    │   └── architectureDocs.ts
    ├── utils/
    │   └── pdfGenerator.ts
    ├── types.ts
    ├── App.tsx
    └── main.tsx
`;

export const CODE_SCAFFOLDS: CodeSnippet[] = [
  {
    title: '1. Modelo Relacional PostgreSQL (Prisma ORM)',
    language: 'typescript',
    fileName: 'prisma/schema.prisma',
    description: 'Schema completo para PostgreSQL com relacionamentos 1:1, 1:N e N:N entre Pacientes, Assinaturas, Documentos, Histórico Clínico e Farmácias.',
    code: `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Gender {
  MASCULINO
  FEMININO
  OUTRO
}

enum SubscriptionStatus {
  ATIVA
  PENDENTE
  EXPIRADA
  CANCELADA
}

enum DocumentType {
  BI
  PASSAPORTE
  CARTAO_SAUDE
  OUTRO
}

enum ReminderPriority {
  ALTA
  MEDIA
  BAIXA
}

model Patient {
  id               String            @id @default(uuid())
  memberNumber     String            @unique // Ex: SF-88410
  fullName         String
  phone            String            @unique
  email            String            @unique
  dateOfBirth      DateTime
  gender           Gender
  idNumber         String            @unique // BI ou Passaporte
  bloodType        String?
  allergies        String[]
  street           String
  neighborhood     String
  city             String
  province         String
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  // Relacionamentos
  subscription     Subscription?
  documents        Document[]
  medicalRecords   MedicalRecord[]
  reminders        HealthReminder[]
  payments         PaymentTransaction[]
  pharmacyRedemptions PharmacyDiscountRedemption[]

  @@index([memberNumber])
  @@index([phone])
}

model Subscription {
  id              String             @id @default(uuid())
  patientId       String             @unique
  patient         Patient            @relation(fields: [patientId], references: [id], onDelete: Cascade)
  planId          String             // BASICO, FAMILIAR, PREMIUM
  planName        String
  priceMzn        Decimal            @db.Decimal(10, 2)
  status          SubscriptionStatus @default(PENDENTE)
  startDate       DateTime           @default(now())
  nextBillingDate DateTime
  paymentMethod   String             @default("MPESA")
  autoRenew       Boolean            @default(true)
  mpesaNumber     String?
  lastPaymentDate DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  payments        PaymentTransaction[]
}

model Document {
  id             String       @id @default(uuid())
  patientId      String
  patient        Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  type           DocumentType
  documentNumber String
  fileName       String
  fileUrl        String
  fileSize       String
  uploadedAt     DateTime     @default(now())
  status         String       @default("VALIDADO")
  notes          String?
}

model MedicalRecord {
  id             String       @id @default(uuid())
  patientId      String
  patient        Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  type           String       // CONSULTA, EXAME, CHECKUP
  title          String
  doctorName     String
  specialty      String
  healthUnit     String
  date           DateTime     @default(now())
  diagnosis      String?
  symptoms       String?
  treatmentNotes String?
  labResults     String?
  medications    Json?        // Lista de medicamentos prescritos
  createdAt      DateTime     @default(now())
}

model HealthReminder {
  id             String           @id @default(uuid())
  patientId      String
  patient        Patient          @relation(fields: [patientId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  type           String           // CHECKUP, VACINA, PAGAMENTO
  dueDate        DateTime
  completed      Boolean          @default(false)
  priority       ReminderPriority @default(MEDIA)
  channel        String           @default("SMS")
  lastNotifiedAt DateTime?
  createdAt      DateTime         @default(now())
}

model PartnerPharmacy {
  id                 String                       @id @default(uuid())
  name               String
  chainName          String?
  address            String
  neighborhood       String
  city               String
  province           String
  phone              String
  email              String
  discountPercentage Int                          @default(20)
  active             Boolean                      @default(true)
  openingHours       String
  rating             Decimal                      @db.Decimal(3, 2) @default(4.8)
  redemptions        PharmacyDiscountRedemption[]
}

model PharmacyDiscountRedemption {
  id                 String          @id @default(uuid())
  patientId          String
  patient            Patient         @relation(fields: [patientId], references: [id])
  pharmacyId         String
  pharmacy           PartnerPharmacy @relation(fields: [pharmacyId], references: [id])
  medicationList     String
  originalPriceMzn   Decimal         @db.Decimal(10, 2)
  discountPercentage Int
  savedAmountMzn     Decimal         @db.Decimal(10, 2)
  finalPriceMzn      Decimal         @db.Decimal(10, 2)
  receiptNumber      String          @unique
  redemptionDate     DateTime        @default(now())
}

model PaymentTransaction {
  id                 String       @id @default(uuid())
  patientId          String
  patient            Patient      @relation(fields: [patientId], references: [id])
  subscriptionId     String
  subscription       Subscription @relation(fields: [subscriptionId], references: [id])
  amountMzn          Decimal      @db.Decimal(10, 2)
  mpesaPhone         String
  mpesaTransactionId String       @unique
  status             String       // CONCLUIDO, PENDENTE, FALHOU
  createdAt          DateTime     @default(now())
}
`
  },
  {
    title: '2. Modelos NoSQL MongoDB (Mongoose Schema)',
    language: 'typescript',
    fileName: 'server/models/Patient.ts',
    description: 'Definição Mongoose com validações rigorosas, índices e suporte a subdocumentos para MongoDB.',
    code: `// server/models/Patient.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientDocument extends Document {
  memberNumber: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  gender: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  idNumber: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    province: string;
  };
  bloodType?: string;
  allergies: string[];
  documents: Array<{
    type: string;
    documentNumber: string;
    fileUrl: string;
    uploadedAt: Date;
    status: string;
  }>;
  createdAt: Date;
}

const PatientSchema = new Schema<IPatientDocument>(
  {
    memberNumber: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MASCULINO', 'FEMININO', 'OUTRO'], default: 'OUTRO' },
    idNumber: { type: String, required: true, unique: true },
    address: {
      street: { type: String, required: true },
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true }
    },
    bloodType: { type: String, default: 'O+' },
    allergies: [{ type: String }],
    documents: [
      {
        type: { type: String, enum: ['BI', 'PASSAPORTE', 'CARTAO_SAUDE', 'OUTRO'] },
        documentNumber: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        status: { type: String, default: 'VALIDADO' }
      }
    ]
  },
  { timestamps: true }
);

export const PatientModel = mongoose.model<IPatientDocument>('Patient', PatientSchema);
`
  },
  {
    title: '3. Serviço de Integração M-Pesa C2B (Vodacom Moçambique)',
    language: 'typescript',
    fileName: 'server/services/mpesa.service.ts',
    description: 'Serviço pronto para iniciar cobrança STK Push / C2B via API oficial da Vodacom M-Pesa Moçambique.',
    code: `// server/services/mpesa.service.ts
import axios from 'axios';
import crypto from 'crypto';

interface MpesaC2BPayload {
  amount: number;
  msisdn: string; // Ex: 25884XXXXXXX ou 25885XXXXXXX
  reference: string;
  thirdPartyReference: string;
}

export class MpesaService {
  private static apiKey = process.env.MPESA_API_KEY || '';
  private static publicKey = process.env.MPESA_PUBLIC_KEY || '';
  private static serviceProviderCode = process.env.MPESA_SERVICE_PROVIDER_CODE || '171717';
  private static baseUrl = process.env.MPESA_ENV === 'production'
    ? 'https://api.vm.co.mz:18352/ipg/v1x/'
    : 'https://api.sandbox.vm.co.mz:18352/ipg/v1x/';

  /**
   * Gera o Bearer Token cifrado com a chave pública RSA da Vodacom
   */
  private static generateBearerToken(): string {
    const buffer = Buffer.from(this.apiKey);
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );
    return encrypted.toString('base64');
  }

  /**
   * Inicia o pagamento C2B (Customer to Business) com push USSD para o telemóvel do utente
   */
  public static async initiateC2BPayment(payload: MpesaC2BPayload) {
    try {
      // Normaliza o número para o padrão moçambicano 25884/85...
      let phone = payload.msisdn.replace(/[^0-9]/g, '');
      if (phone.length === 9) phone = '258' + phone;

      const endpoint = \`\${this.baseUrl}c2bPayment/singleStage/\`;
      const token = this.generateBearerToken();

      const requestBody = {
        input_TransactionReference: payload.reference,
        input_CustomerMSISDN: phone,
        input_Amount: payload.amount.toString(),
        input_ThirdPartyReference: payload.thirdPartyReference,
        input_ServiceProviderCode: this.serviceProviderCode
      };

      const response = await axios.post(endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`,
          'Origin': 'developer.mpesa.vm.co.mz'
        },
        timeout: 25000
      });

      return {
        success: response.data.output_ResponseCode === 'INS-0',
        responseCode: response.data.output_ResponseCode,
        transactionId: response.data.output_TransactionID,
        conversationId: response.data.output_ConversationID,
        description: response.data.output_ResponseDesc
      };
    } catch (error: any) {
      console.error('Erro na chamada M-Pesa:', error.response?.data || error.message);
      throw new Error(error.response?.data?.output_ResponseDesc || 'Falha ao comunicar com a Vodacom M-Pesa');
    }
  }
}
`
  },
  {
    title: '4. Controller de Gestão de Pacientes & Assinaturas',
    language: 'typescript',
    fileName: 'server/controllers/patient.controller.ts',
    description: 'Controlador Express com validação de dados, geração de número de membro e disparo de boas-vindas.',
    code: `// server/controllers/patient.controller.ts
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class PatientController {
  public static async register(req: Request, res: Response) {
    try {
      const { fullName, phone, email, dateOfBirth, gender, address, idNumber, planId } = req.body;

      if (!fullName || !phone || !dateOfBirth || !idNumber) {
        return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
      }

      // 1. Gera código exclusivo do associado
      const memberNumber = \`SF-\${Math.floor(10000 + Math.random() * 90000)}\`;

      // 2. Cria paciente e plano pendente na base de dados
      const patient = {
        memberNumber,
        fullName,
        phone,
        email,
        dateOfBirth,
        gender,
        address,
        idNumber,
        status: 'PENDENTE'
      };

      // 3. Envia SMS de confirmação de cadastro
      await NotificationService.sendSMS({
        to: phone,
        message: \`Saúde Fácil: Olá \${fullName.split(' ')[0]}! O seu cadastro foi concluído com sucesso. Número de Membro: \${memberNumber}. Efectue o pagamento da mensalidade para activar os benefícios.\`
      });

      return res.status(201).json({
        message: 'Paciente cadastrado com sucesso!',
        patient
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
    }
  }
}
`
  },
  {
    title: '5. Middleware de Autenticação JWT e Segurança (RBAC)',
    language: 'typescript',
    fileName: 'server/middlewares/auth.middleware.ts',
    description: 'Protege rotas sensíveis administrativas e de pacientes garantindo que apenas utilizadores autorizados acedam aos dados de saúde.',
    code: `// server/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  role: 'PACIENTE' | 'ADMIN' | 'FARMACIA_PARCEIRA';
  memberNumber?: string;
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado: Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'chave-secreta-saude-facil-mz';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Sessão expirada ou token inválido.' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente para executar esta operação.' });
    }
    next();
  };
}
`
  },
  {
    title: '6. Comandos para Rodar no VS Code',
    language: 'bash',
    fileName: 'terminal-commands.sh',
    description: 'Passo a passo rápido para clonar, configurar variáveis e iniciar frontend e backend em modo desenvolvimento no VS Code.',
    code: `# 1. Instalar dependências completas
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha no seu .env:
# DATABASE_URL="postgresql://postgres:senha@localhost:5432/saude_facil"
# MPESA_API_KEY="sua_chave_mpesa"
# JWT_SECRET="chave_segura_jwt"

# 3. Executar migrações do banco de dados (se usar Prisma)
npx prisma db push

# 4. Iniciar a aplicação full-stack (Express + Vite)
npm run dev

# O aplicativo estará rodando em: http://localhost:3000
`
  }
];

import {
  Patient,
  PartnerPharmacy,
  PartnerClinic,
  Appointment,
  SubscriptionPlan,
  PaymentTransaction,
  PharmacyDiscountRedemption,
  NotificationLog,
  AdminDashboardMetrics
} from '../types';

export const PARTNER_CLINICS: PartnerClinic[] = [
  {
    id: 'cln-01',
    name: 'Centro Médico Polana Care',
    type: 'CENTRO_MEDICO',
    address: 'Av. Julius Nyerere, nº 2140',
    neighborhood: 'Polana',
    city: 'Maputo',
    province: 'Maputo Cidade',
    phone: '+258 21 498 800',
    specialties: ['Clínica Geral', 'Pediatria', 'Cardiologia', 'Ginecologia', 'Nutrição'],
    openingHours: '24 Horas (Seg a Dom)',
    rating: 4.9,
    acceptsEmergency: true
  },
  {
    id: 'cln-02',
    name: 'Clínica da Matola Viva',
    type: 'CLINICA',
    address: 'Av. da União Africana, nº 450',
    neighborhood: 'Matola Central',
    city: 'Matola',
    province: 'Maputo Província',
    phone: '+258 84 550 1122',
    specialties: ['Clínica Geral', 'Pediatria', 'Oftalmologia', 'Dermatologia'],
    openingHours: '07:30 - 20:00 (Seg a Sáb)',
    rating: 4.8,
    acceptsEmergency: false
  },
  {
    id: 'cln-03',
    name: 'Hospital Privado da Beira - Policlínica',
    type: 'HOSPITAL',
    address: 'Rua Major Serpa Pinto, nº 88',
    neighborhood: 'Chiveve',
    city: 'Beira',
    province: 'Sofala',
    phone: '+258 82 990 3344',
    specialties: ['Clínica Geral', 'Cirurgia Geral', 'Ortopedia', 'Ginecologia', 'Pediatria'],
    openingHours: '24 Horas (Seg a Dom)',
    rating: 4.9,
    acceptsEmergency: true
  },
  {
    id: 'cln-04',
    name: 'Laboratório & Clínica Nampula Med',
    type: 'LABORATORIO',
    address: 'Av. Eduardo Mondlane, nº 120',
    neighborhood: 'Centro',
    city: 'Nampula',
    province: 'Nampula',
    phone: '+258 84 888 7766',
    specialties: ['Análises Clínicas', 'Clínica Geral', 'Infecciologia', 'Medicina do Trabalho'],
    openingHours: '07:00 - 18:00 (Seg a Sex)',
    rating: 4.7,
    acceptsEmergency: false
  }
];

export const DRUG_INTERACTION_RULES: Array<{
  substanceKey: string;
  matchedAllergies: string[];
  severity: 'CRITICA' | 'ALTA' | 'MODERADA';
  warningMessage: string;
  alternatives: string;
}> = [
  {
    substanceKey: 'penicil',
    matchedAllergies: ['penicilina', 'penicilinas', 'amoxicilina', 'ampicilina', 'beta-lactamicos'],
    severity: 'CRITICA',
    warningMessage: 'Risco de Choque Anafilático / Reação Alérgica Grave: O utente possui alergia documentada a Penicilinas.',
    alternatives: 'Considere Macrolídeos (Azitromicina, Claritromicina) ou Quinolonas.'
  },
  {
    substanceKey: 'amoxicil',
    matchedAllergies: ['penicilina', 'amoxicilina', 'ampicilina'],
    severity: 'CRITICA',
    warningMessage: 'Contra-indicação absoluta: Paciente alérgico a Penicilinas/Amoxicilina.',
    alternatives: 'Azitromicina 500mg ou Ciprofloxacina.'
  },
  {
    substanceKey: 'ibuprof',
    matchedAllergies: ['ibuprofeno', 'aine', 'aines', 'aspirina', 'acido acetilsalicilico', 'dipirona'],
    severity: 'ALTA',
    warningMessage: 'Alerta de AINE: Paciente alérgico a anti-inflamatórios não-esteróides.',
    alternatives: 'Considere Paracetamol 500mg/1000mg ou Tramadol.'
  },
  {
    substanceKey: 'aspirin',
    matchedAllergies: ['aspirina', 'acido acetilsalicilico', 'aine', 'aines'],
    severity: 'ALTA',
    warningMessage: 'Alerta de Hipersensibilidade a Salicilatos.',
    alternatives: 'Paracetamol.'
  },
  {
    substanceKey: 'sulfa',
    matchedAllergies: ['sulfa', 'sulfas', 'cotrimoxazol', 'bactrim'],
    severity: 'CRITICA',
    warningMessage: 'Alerta de Alergia a Sulfonamidas: Risco de Síndrome de Stevens-Johnson.',
    alternatives: 'Amoxicilina (se não alérgico) ou Doxiciclina.'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'BASICO',
    name: 'Plano Básico Individual',
    priceMzn: 250,
    period: 'mensal',
    description: 'Ideal para jovens e trabalhadores que precisam de cobertura essencial a custo acessível.',
    benefits: [
      '1 Consulta de Clínica Geral por mês incluída',
      'Até 15% de desconto em medicamentos em farmácias parceiras',
      'Lembretes automáticos de check-ups e vacinação via SMS',
      'Cartão digital de beneficiário com QR Code',
      'Acesso a rede de parceiros em Maputo, Matola e Beira'
    ],
    discountPharmacyRate: 15,
    includedConsultations: 1,
    popular: false
  },
  {
    id: 'FAMILIAR',
    name: 'Plano Familiar Protegido',
    priceMzn: 650,
    period: 'mensal',
    description: 'A melhor proteção para toda a família com maior economia em consultas e medicamentos.',
    benefits: [
      '3 Consultas médicas por mês (Clínica Geral ou Pediatria)',
      'Até 25% de desconto em todas as farmácias parceiras',
      'Cobertura para o titular + 3 dependentes (filhos/cônjuge)',
      'Lembretes de saúde personalizados para toda a família',
      'Atendimento prioritário e linha de triagem telefónica 24/7',
      'Histórico médico digital unificado'
    ],
    discountPharmacyRate: 25,
    includedConsultations: 3,
    popular: true
  },
  {
    id: 'PREMIUM',
    name: 'Plano Premium Total',
    priceMzn: 1200,
    period: 'mensal',
    description: 'Cobertura médica completa, exames laboratoriais e os maiores descontos farmacêuticos.',
    benefits: [
      'Consultas ilimitadas com marcação preferencial',
      'Até 35% de desconto em medicamentos e produtos de saúde',
      'Check-up geral anual completo com análises clínicas incluído',
      'Apoio em emergências com transporte de ambulância',
      'Gestor de saúde dedicado e relatórios médicos em PDF',
      'Cobertura nacional em mais de 50 clínicas e farmácias'
    ],
    discountPharmacyRate: 35,
    includedConsultations: 999,
    popular: false
  }
];

export const INITIAL_PHARMACIES: PartnerPharmacy[] = [
  {
    id: 'farm-01',
    name: 'Farmácia Moderna Central',
    chainName: 'Rede FarmaMais',
    address: 'Av. 24 de Julho, nº 1420',
    neighborhood: 'Polana Cimento',
    city: 'Maputo',
    province: 'Maputo Cidade',
    phone: '+258 84 300 1200',
    email: 'contacto@farmaciamoderna.co.mz',
    discountPercentage: 25,
    active: true,
    openingHours: '07:30 - 22:00 (Seg a Dom)',
    rating: 4.9,
    supportedPlans: ['BASICO', 'FAMILIAR', 'PREMIUM'],
    locationNotes: 'Em frente ao Hospital Central de Maputo'
  },
  {
    id: 'farm-02',
    name: 'Farmácia Vida & Saúde Matola',
    chainName: 'Farmácias do Povo',
    address: 'Av. das FPLM, nº 310, Próximo ao Monumento',
    neighborhood: 'Matola C',
    city: 'Matola',
    province: 'Maputo Província',
    phone: '+258 82 450 8890',
    email: 'matola@vidasaude.co.mz',
    discountPercentage: 20,
    active: true,
    openingHours: '08:00 - 20:00 (Seg a Sáb)',
    rating: 4.7,
    supportedPlans: ['BASICO', 'FAMILIAR', 'PREMIUM'],
    locationNotes: 'Ao lado do Supermercado VIP'
  },
  {
    id: 'farm-03',
    name: 'Farmácia Popular da Beira',
    chainName: 'Grupo Saúde Chaimite',
    address: 'Rua General Vieira da Rocha, 45',
    neighborhood: 'Chaimite',
    city: 'Beira',
    province: 'Sofala',
    phone: '+258 84 772 1100',
    email: 'beira@farmaciapopular.co.mz',
    discountPercentage: 30,
    active: true,
    openingHours: '24 Horas (Plantão Permanente)',
    rating: 4.8,
    supportedPlans: ['BASICO', 'FAMILIAR', 'PREMIUM'],
    locationNotes: 'Próximo ao Porto da Beira'
  },
  {
    id: 'farm-04',
    name: 'Farmácia Estrela do Norte',
    chainName: 'Rede FarmaMais',
    address: 'Av. do Trabalho, Edifício Sol, Loja 3',
    neighborhood: 'Centro Comercial',
    city: 'Nampula',
    province: 'Nampula',
    phone: '+258 85 990 4433',
    email: 'nampula@farmaestrela.co.mz',
    discountPercentage: 20,
    active: true,
    openingHours: '08:00 - 19:30 (Seg a Sáb)',
    rating: 4.6,
    supportedPlans: ['BASICO', 'FAMILIAR', 'PREMIUM'],
    locationNotes: 'Perto da Catedral de Nampula'
  },
  {
    id: 'farm-05',
    name: 'Farmácia Saúde Total Alto Maé',
    chainName: 'Saúde Total Farmas',
    address: 'Av. Eduardo Mondlane, nº 890',
    neighborhood: 'Alto Maé',
    city: 'Maputo',
    province: 'Maputo Cidade',
    phone: '+258 87 221 4455',
    email: 'altomae@saudetotal.co.mz',
    discountPercentage: 25,
    active: true,
    openingHours: '08:00 - 21:00 (Todos os dias)',
    rating: 4.8,
    supportedPlans: ['BASICO', 'FAMILIAR', 'PREMIUM'],
    locationNotes: 'Esquina com Av. Karl Marx'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-01',
    memberNumber: 'SF-88410',
    fullName: 'Amélia Celeste Sitoe',
    phone: '+258 84 551 9021',
    email: 'amelia.sitoe@gmail.com',
    dateOfBirth: '1992-06-15',
    gender: 'FEMININO',
    address: {
      street: 'Av. Vladimir Lenine, Bloco C, Apt 4',
      neighborhood: 'Coop',
      city: 'Maputo',
      province: 'Maputo Cidade'
    },
    idNumber: '110100482910M',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Sulfa'],
    emergencyContact: {
      name: 'Manuel Sitoe (Esposo)',
      phone: '+258 84 210 9988',
      relationship: 'Esposo'
    },
    createdAt: '2025-11-10T08:30:00Z',
    subscription: {
      id: 'sub-01',
      patientId: 'pat-01',
      planId: 'FAMILIAR',
      planName: 'Plano Familiar Protegido',
      priceMzn: 650,
      status: 'ATIVA',
      startDate: '2025-11-10',
      nextBillingDate: '2026-10-10',
      paymentMethod: 'MPESA',
      autoRenew: true,
      mpesaNumber: '845519021',
      lastPaymentDate: '2026-09-10'
    },
    documents: [
      {
        id: 'doc-01',
        patientId: 'pat-01',
        type: 'BI',
        documentNumber: '110100482910M',
        fileName: 'bi_amelia_sitoe.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2025-11-10T08:35:00Z',
        status: 'VALIDADO',
        notes: 'Bilhete de Identidade emitido pela Direcção Nacional de Identificação Civil'
      },
      {
        id: 'doc-02',
        patientId: 'pat-01',
        type: 'CARTAO_SAUDE',
        documentNumber: 'CS-MZ-9941',
        fileName: 'cartao_vacinacao_amelia.pdf',
        fileSize: '840 KB',
        uploadedAt: '2025-11-10T08:40:00Z',
        status: 'VALIDADO',
        notes: 'Cartão de Saúde e Registo de Vacinas actualizado'
      }
    ],
    medicalRecords: [
      {
        id: 'med-01',
        patientId: 'pat-01',
        type: 'CONSULTA',
        title: 'Consulta Geral de Rotina e Rastreio de Hipertensão',
        doctorName: 'Dr. Armando Mondlane',
        specialty: 'Medicina Geral e Familiar',
        healthUnit: 'Centro Médico Polana',
        date: '2026-08-20',
        diagnosis: 'Hipertensão Arterial Grau 1 (Controlada). Sem queixas cardiovasculares agudas.',
        symptoms: 'Cefaleia ligeira ao final da tarde, fadiga moderada.',
        treatmentNotes: 'Manter dieta hipossódica e actividade física moderada 3x por semana.',
        medications: [
          {
            id: 'm1',
            name: 'Losartan Potássico 50mg',
            dosage: '1 comprimido pela manhã',
            frequency: '1x ao dia',
            duration: '30 dias',
            discountEligible: true
          },
          {
            id: 'm2',
            name: 'Complexo Vitamínico B',
            dosage: '1 cápsula ao almoço',
            frequency: '1x ao dia',
            duration: '15 dias',
            discountEligible: true
          }
        ]
      },
      {
        id: 'med-02',
        patientId: 'pat-01',
        type: 'EXAME',
        title: 'Painel Lipídico e Hemograma Completo',
        doctorName: 'Dra. Elsa Cossa',
        specialty: 'Patologia Clínica',
        healthUnit: 'Laboratório Central FarmaMais',
        date: '2026-07-14',
        diagnosis: 'Perfil lipídico normal. Hemoglobina 13.2 g/dL. Glicemia em jejum 88 mg/dL.',
        treatmentNotes: 'Resultados normais e dentro dos valores de referência.',
        labResults: 'Colesterol Total: 178 mg/dL | HDL: 52 mg/dL | Triglicerídeos: 120 mg/dL'
      },
      {
        id: 'med-03',
        patientId: 'pat-01',
        type: 'CHECKUP_GERAL',
        title: 'Check-Up Preventivo Saúde Fácil',
        doctorName: 'Dr. Armando Mondlane',
        specialty: 'Clínica Geral',
        healthUnit: 'Clínica Saúde Fácil Maputo',
        date: '2026-03-05',
        diagnosis: 'Bom estado geral. IMC 23.4 (Peso ideal).',
        treatmentNotes: 'Agendado próximo check-up para Março de 2027.'
      }
    ],
    reminders: [
      {
        id: 'rem-01',
        patientId: 'pat-01',
        title: 'Check-up Semestral de Tensão Arterial',
        description: 'Medição de controlo de tensão arterial e reavaliação médica.',
        type: 'CHECKUP',
        dueDate: '2026-09-20',
        completed: false,
        priority: 'ALTA',
        channel: 'SMS',
        lastNotifiedAt: '2026-09-01T09:00:00Z'
      },
      {
        id: 'rem-02',
        patientId: 'pat-01',
        title: 'Vacina Anual contra Gripe Sazonal',
        description: 'Campanha de vacinação com desconto em farmácias parceiras.',
        type: 'VACINA',
        dueDate: '2026-10-05',
        completed: false,
        priority: 'MEDIA',
        channel: 'SMS'
      },
      {
        id: 'rem-03',
        patientId: 'pat-01',
        title: 'Renovação Mensalidade M-Pesa (650 MZN)',
        description: 'Lembrete automático para débito mensal do Plano Familiar.',
        type: 'PAGAMENTO',
        dueDate: '2026-10-10',
        completed: false,
        priority: 'MEDIA',
        channel: 'SMS'
      }
    ],
    appointments: [
      {
        id: 'apt-01',
        patientId: 'pat-01',
        patientName: 'Maria Helena Sitoe',
        memberNumber: 'SF-84920',
        clinicName: 'Centro Médico Polana Care',
        doctorName: 'Dr. Armando Mondlane',
        specialty: 'Clínica Geral',
        date: '2026-09-18',
        time: '10:30',
        status: 'CONFIRMADA',
        reason: 'Controlo de Tensão Arterial e Renovação de Receita',
        location: 'Av. Julius Nyerere, nº 2140, Polana, Maputo',
        isTeleconsultation: false,
        costMzn: 0,
        coveredByPlan: true,
        createdAt: '2026-09-01T08:30:00Z'
      }
    ]
  },
  {
    id: 'pat-02',
    memberNumber: 'SF-77192',
    fullName: 'António Carlos Mabote',
    phone: '+258 82 904 3311',
    email: 'antonio.mabote@outlook.com',
    dateOfBirth: '1985-11-28',
    gender: 'MASCULINO',
    address: {
      street: 'Av. 25 de Setembro, Casa 12',
      neighborhood: 'Liberdade',
      city: 'Matola',
      province: 'Maputo Província'
    },
    idNumber: '110200891230B',
    bloodType: 'A+',
    allergies: ['Aspirina'],
    emergencyContact: {
      name: 'Joana Mabote (Irmã)',
      phone: '+258 84 991 2233',
      relationship: 'Irmã'
    },
    createdAt: '2025-12-01T10:15:00Z',
    subscription: {
      id: 'sub-02',
      patientId: 'pat-02',
      planId: 'BASICO',
      planName: 'Plano Básico Individual',
      priceMzn: 250,
      status: 'PENDENTE',
      startDate: '2025-12-01',
      nextBillingDate: '2026-09-01',
      paymentMethod: 'MPESA',
      autoRenew: true,
      mpesaNumber: '829043311',
      lastPaymentDate: '2026-08-01'
    },
    documents: [
      {
        id: 'doc-03',
        patientId: 'pat-02',
        type: 'BI',
        documentNumber: '110200891230B',
        fileName: 'bi_antonio_mabote.jpg',
        fileSize: '950 KB',
        uploadedAt: '2025-12-01T10:20:00Z',
        status: 'VALIDADO'
      }
    ],
    medicalRecords: [
      {
        id: 'med-04',
        patientId: 'pat-02',
        type: 'CONSULTA',
        title: 'Consulta Pediátrica de Acompanhamento (Filho)',
        doctorName: 'Dra. Luísa Machava',
        specialty: 'Pediatria',
        healthUnit: 'Centro de Saúde Matola',
        date: '2026-06-18',
        diagnosis: 'Rinite alérgica sazonal leve.',
        medications: [
          {
            id: 'm3',
            name: 'Cetirizina Xarope 5mg/5ml',
            dosage: '5ml ao deitar',
            frequency: '1x ao dia',
            duration: '7 dias',
            discountEligible: true
          }
        ]
      }
    ],
    reminders: [
      {
        id: 'rem-04',
        patientId: 'pat-02',
        title: 'Regularização da Mensalidade M-Pesa (250 MZN)',
        description: 'Pagamento pendente para manter benefícios activos.',
        type: 'PAGAMENTO',
        dueDate: '2026-09-05',
        completed: false,
        priority: 'ALTA',
        channel: 'SMS'
      }
    ]
  },
  {
    id: 'pat-03',
    memberNumber: 'SF-99201',
    fullName: 'Fátima Ibrahimo Baúque',
    phone: '+258 84 112 8844',
    email: 'fatima.bauque@gmail.com',
    dateOfBirth: '1998-03-22',
    gender: 'FEMININO',
    address: {
      street: 'Bairro Ponta Gêa, Rua das Acácias',
      neighborhood: 'Ponta Gêa',
      city: 'Beira',
      province: 'Sofala'
    },
    idNumber: '110300129840P',
    bloodType: 'B+',
    allergies: [],
    emergencyContact: {
      name: 'Ibrahimo Baúque (Pai)',
      phone: '+258 84 332 9900',
      relationship: 'Pai'
    },
    createdAt: '2026-01-15T14:00:00Z',
    subscription: {
      id: 'sub-03',
      patientId: 'pat-03',
      planId: 'PREMIUM',
      planName: 'Plano Premium Total',
      priceMzn: 1200,
      status: 'ATIVA',
      startDate: '2026-01-15',
      nextBillingDate: '2026-10-15',
      paymentMethod: 'MPESA',
      autoRenew: true,
      mpesaNumber: '841128844',
      lastPaymentDate: '2026-09-15'
    },
    documents: [
      {
        id: 'doc-04',
        patientId: 'pat-03',
        type: 'PASSAPORTE',
        documentNumber: 'MZ994012A',
        fileName: 'passaporte_fatima.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-01-15T14:10:00Z',
        status: 'VALIDADO'
      }
    ],
    medicalRecords: [
      {
        id: 'med-05',
        patientId: 'pat-03',
        type: 'EXAME',
        title: 'Ecografia Abdominal e Rastreio Ginecológico',
        doctorName: 'Dr. Salomão Guambe',
        specialty: 'Ginecologia e Obstetrícia',
        healthUnit: 'Clínica Chaimite Beira',
        date: '2026-08-10',
        diagnosis: 'Exame ecográfico sem alterações patológicas. Estruturas anatómicas preservadas.',
        treatmentNotes: 'Recomendada manutenção de hábitos saudáveis e hidratação.'
      }
    ],
    reminders: [
      {
        id: 'rem-05',
        patientId: 'pat-03',
        title: 'Check-Up Odontológico Preventivo',
        description: 'Limpeza e destartarização anual coberta pelo plano Premium.',
        type: 'CHECKUP',
        dueDate: '2026-09-28',
        completed: false,
        priority: 'MEDIA',
        channel: 'EMAIL'
      }
    ],
    appointments: [
      {
        id: 'apt-02',
        patientId: 'pat-03',
        patientName: 'Fátima Ibrahimo Baúque',
        memberNumber: 'SF-99201',
        clinicName: 'Hospital Privado da Beira - Policlínica',
        doctorName: 'Dr. Salomão Guambe',
        specialty: 'Ginecologia e Obstetrícia',
        date: '2026-09-25',
        time: '14:00',
        status: 'CONFIRMADA',
        reason: 'Consulta de Rotina e Revisão de Ecografia',
        location: 'Rua Major Serpa Pinto, nº 88, Chiveve, Beira',
        isTeleconsultation: false,
        costMzn: 0,
        coveredByPlan: true,
        createdAt: '2026-09-02T11:00:00Z'
      }
    ]
  },
  {
    id: 'pat-04',
    memberNumber: 'SF-65330',
    fullName: 'Joaquim Tomás Macuácua',
    phone: '+258 87 660 1928',
    email: 'joaquim.macuacua@sapo.mz',
    dateOfBirth: '1979-09-04',
    gender: 'MASCULINO',
    address: {
      street: 'Av. Eduardo Mondlane, Prédio Lusitana',
      neighborhood: 'Central',
      city: 'Nampula',
      province: 'Nampula'
    },
    idNumber: '110400551980K',
    bloodType: 'AB+',
    allergies: ['Ibuprofeno'],
    createdAt: '2025-08-10T11:00:00Z',
    subscription: {
      id: 'sub-04',
      patientId: 'pat-04',
      planId: 'BASICO',
      planName: 'Plano Básico Individual',
      priceMzn: 250,
      status: 'EXPIRADA',
      startDate: '2025-08-10',
      nextBillingDate: '2026-07-10',
      paymentMethod: 'MPESA',
      autoRenew: false,
      mpesaNumber: '876601928',
      lastPaymentDate: '2026-06-10'
    },
    documents: [],
    medicalRecords: [],
    reminders: [
      {
        id: 'rem-06',
        patientId: 'pat-04',
        title: 'Reactivar Assinatura Saúde Fácil',
        description: 'Sua assinatura expirou em Julho. Pague via M-Pesa para retomar benefícios.',
        type: 'PAGAMENTO',
        dueDate: '2026-09-10',
        completed: false,
        priority: 'ALTA',
        channel: 'SMS'
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-1001',
    patientId: 'pat-01',
    patientName: 'Amélia Celeste Sitoe',
    subscriptionId: 'sub-01',
    amountMzn: 650,
    mpesaPhone: '845519021',
    mpesaTransactionId: 'MP260910.8841.A91',
    status: 'CONCLUIDO',
    createdAt: '2026-09-10T09:12:45Z',
    planName: 'Plano Familiar Protegido'
  },
  {
    id: 'tx-1002',
    patientId: 'pat-03',
    patientName: 'Fátima Ibrahimo Baúque',
    subscriptionId: 'sub-03',
    amountMzn: 1200,
    mpesaPhone: '841128844',
    mpesaTransactionId: 'MP260915.9920.F14',
    status: 'CONCLUIDO',
    createdAt: '2026-09-15T16:40:10Z',
    planName: 'Plano Premium Total'
  },
  {
    id: 'tx-1003',
    patientId: 'pat-02',
    patientName: 'António Carlos Mabote',
    subscriptionId: 'sub-02',
    amountMzn: 250,
    mpesaPhone: '829043311',
    mpesaTransactionId: 'MP260801.7719.M02',
    status: 'CONCLUIDO',
    createdAt: '2026-08-01T11:05:00Z',
    planName: 'Plano Básico Individual'
  }
];

export const INITIAL_REDEMPTIONS: PharmacyDiscountRedemption[] = [
  {
    id: 'red-01',
    patientId: 'pat-01',
    patientName: 'Amélia Celeste Sitoe',
    memberNumber: 'SF-88410',
    pharmacyId: 'farm-01',
    pharmacyName: 'Farmácia Moderna Central',
    medicationList: 'Losartan 50mg (30 comp) + Complexo Vitamínico B (15 caps)',
    originalPriceMzn: 1400,
    discountPercentage: 25,
    savedAmountMzn: 350,
    finalPriceMzn: 1050,
    redemptionDate: '2026-08-21T14:30:00Z',
    receiptNumber: 'REC-2026-88190'
  },
  {
    id: 'red-02',
    patientId: 'pat-02',
    patientName: 'António Carlos Mabote',
    memberNumber: 'SF-77192',
    pharmacyId: 'farm-02',
    pharmacyName: 'Farmácia Vida & Saúde Matola',
    medicationList: 'Cetirizina Xarope 5mg/5ml + Paracetamol 500mg',
    originalPriceMzn: 680,
    discountPercentage: 20,
    savedAmountMzn: 136,
    finalPriceMzn: 544,
    redemptionDate: '2026-06-19T10:15:00Z',
    receiptNumber: 'REC-2026-44120'
  },
  {
    id: 'red-03',
    patientId: 'pat-03',
    patientName: 'Fátima Ibrahimo Baúque',
    memberNumber: 'SF-99201',
    pharmacyId: 'farm-03',
    pharmacyName: 'Farmácia Popular da Beira',
    medicationList: 'Suplemento Ferro & Ácido Fólico + Protector Solar Dermatológico',
    originalPriceMzn: 2200,
    discountPercentage: 35,
    savedAmountMzn: 770,
    finalPriceMzn: 1430,
    redemptionDate: '2026-08-11T16:00:00Z',
    receiptNumber: 'REC-2026-90214'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-01',
    patientId: 'pat-01',
    patientName: 'Maria Helena Sitoe',
    memberNumber: 'SF-84920',
    clinicName: 'Centro Médico Polana Care',
    doctorName: 'Dr. Armando Mondlane',
    specialty: 'Clínica Geral',
    date: '2026-09-18',
    time: '10:30',
    status: 'CONFIRMADA',
    reason: 'Controlo de Tensão Arterial e Renovação de Receita',
    location: 'Av. Julius Nyerere, nº 2140, Polana, Maputo',
    isTeleconsultation: false,
    costMzn: 0,
    coveredByPlan: true,
    createdAt: '2026-09-01T08:30:00Z'
  },
  {
    id: 'apt-02',
    patientId: 'pat-02',
    patientName: 'António Carlos Mabote',
    memberNumber: 'SF-77192',
    clinicName: 'Clínica 24 Matola',
    doctorName: 'Dra. Elsa Cossa',
    specialty: 'Cardiologia',
    date: '2026-09-22',
    time: '14:00',
    status: 'CONFIRMADA',
    reason: 'Avaliação Cardiovascular Preventiva',
    location: 'Av. das Indústrias, Matola',
    isTeleconsultation: false,
    costMzn: 0,
    coveredByPlan: true,
    createdAt: '2026-09-02T11:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-01',
    patientId: 'pat-01',
    patientName: 'Amélia Celeste Sitoe',
    recipient: '+258 84 551 9021',
    type: 'SMS',
    subject: 'Lembrete de Check-up',
    message: 'Saúde Fácil: Olá Amélia! Lembrete do seu Check-up de Tensão Arterial agendado para 20/09 no Centro Médico Polana.',
    status: 'ENVIADO',
    sentAt: '2026-09-01T09:00:00Z'
  },
  {
    id: 'notif-02',
    patientId: 'pat-02',
    patientName: 'António Carlos Mabote',
    recipient: '+258 82 904 3311',
    type: 'SMS',
    subject: 'Aviso de Mensalidade M-Pesa',
    message: 'Saúde Fácil: Sua mensalidade de 250 MZN do Plano Básico está pendente. Regularize via M-Pesa no app para manter consultas e descontos.',
    status: 'ENVIADO',
    sentAt: '2026-09-02T10:30:00Z'
  },
  {
    id: 'notif-03',
    patientId: 'pat-03',
    patientName: 'Fátima Ibrahimo Baúque',
    recipient: 'fatima.bauque@gmail.com',
    type: 'EMAIL',
    subject: 'Confirmação de Pagamento M-Pesa Recebida',
    message: 'Recebemos o seu pagamento de 1.200 MZN referente ao Plano Premium. Obrigado por confiar no Saúde Fácil!',
    status: 'ENVIADO',
    sentAt: '2026-09-15T16:41:00Z'
  }
];

export function calculateMetrics(
  patients: Patient[],
  transactions: PaymentTransaction[],
  redemptions: PharmacyDiscountRedemption[],
  pharmacies: PartnerPharmacy[]
): AdminDashboardMetrics {
  const activeSubscribers = patients.filter((p) => p.subscription?.status === 'ATIVA').length;
  const pendingSubscribers = patients.filter((p) => p.subscription?.status === 'PENDENTE').length;
  const expiredSubscribers = patients.filter((p) => p.subscription?.status === 'EXPIRADA').length;

  const totalMonthlyRevenueMzn = patients
    .filter((p) => p.subscription?.status === 'ATIVA')
    .reduce((acc, p) => acc + (p.subscription?.priceMzn || 0), 0);

  const totalConsultationsHeld = patients.reduce(
    (acc, p) => acc + (p.medicalRecords?.length || 0),
    0
  );

  const totalDiscountsAppliedMzn = redemptions.reduce(
    (acc, r) => acc + r.savedAmountMzn,
    0
  );

  return {
    totalPatients: patients.length,
    activeSubscribers,
    pendingSubscribers,
    expiredSubscribers,
    totalMonthlyRevenueMzn,
    totalConsultationsHeld,
    totalDiscountsAppliedMzn,
    totalPartnerPharmacies: pharmacies.filter((p) => p.active).length,
    averageSatisfactionRate: 4.85
  };
}

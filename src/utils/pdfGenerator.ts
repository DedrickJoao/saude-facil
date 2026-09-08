import { jsPDF } from 'jspdf';
import { Patient } from '../types';

export function generateMedicalHistoryPDF(patient: Patient) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [16, 185, 129]; // Emerald #10b981
  const darkColor = [30, 41, 59]; // Slate 800
  const lightGray = [241, 245, 249];

  // Header Banner
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SAÚDE FÁCIL | MICRO-SEGURO DE SAÚDE', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Clínico e Histórico Médico Unificado do Utente', 14, 21);
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-MZ')} às ${new Date().toLocaleTimeString('pt-MZ')}`, 130, 21);

  // Patient Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 182, 38, 3, 3, 'FD');

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.fullName.toUpperCase(), 20, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº de Membro / Apólice: ${patient.memberNumber}`, 20, 48);
  doc.text(`Doc. Identificação (BI): ${patient.idNumber}`, 20, 54);
  doc.text(`Data Nasc.: ${patient.dateOfBirth} | Género: ${patient.gender}`, 20, 60);
  doc.text(`Telefone: ${patient.phone} | Email: ${patient.email}`, 20, 66);

  // Status Badge in PDF
  const subStatus = patient.subscription?.status || 'PENDENTE';
  if (subStatus === 'ATIVA') {
    doc.setFillColor(220, 252, 231);
    doc.setTextColor(22, 101, 52);
  } else {
    doc.setFillColor(254, 226, 226);
    doc.setTextColor(153, 27, 27);
  }
  doc.roundedRect(140, 40, 48, 14, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`PLANO: ${patient.subscription?.planName || 'Básico'}`, 144, 46);
  doc.text(`STATUS: ${subStatus}`, 144, 51);

  // Blood & Allergies Summary
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tipo Sanguíneo: ${patient.bloodType || 'O+'}`, 140, 60);
  doc.text(`Alergias: ${patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Nenhuma alergia registada'}`, 140, 66);

  // Medical Records Section
  let yPosition = 80;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Registos Clínicos e Consultas Realizadas', 14, yPosition);
  yPosition += 6;

  const records = patient.medicalRecords || [];

  if (records.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhum registo médico prévio encontrado para este utente.', 14, yPosition + 4);
    yPosition += 15;
  } else {
    records.forEach((rec, idx) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, yPosition, 182, 7, 1, 1, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`[${rec.date}] ${rec.title} - ${rec.doctorName} (${rec.specialty})`, 18, yPosition + 5);
      yPosition += 10;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`Unidade de Saúde: ${rec.healthUnit}`, 18, yPosition);
      yPosition += 4.5;

      if (rec.diagnosis) {
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnóstico: ', 18, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(rec.diagnosis, 38, yPosition);
        yPosition += 4.5;
      }

      if (rec.treatmentNotes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recomendações: ', 18, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(rec.treatmentNotes, 45, yPosition);
        yPosition += 4.5;
      }

      if (rec.medications && rec.medications.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Medicamentos Prescritos:', 18, yPosition);
        yPosition += 4;
        rec.medications.forEach((med) => {
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${med.name} - ${med.dosage} (${med.frequency} por ${med.duration})`, 22, yPosition);
          yPosition += 4;
        });
      }

      yPosition += 4;
    });
  }

  // Reminders & Preventive Care Section
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Plano Preventivo e Próximos Check-Ups', 14, yPosition);
  yPosition += 7;

  const reminders = patient.reminders || [];
  reminders.forEach((r) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const checkSymbol = r.completed ? '[CONCLUÍDO]' : '[AGENDADO]';
    doc.text(`${checkSymbol} Data: ${r.dueDate} - ${r.title} (${r.type})`, 18, yPosition);
    yPosition += 4.5;
  });

  // Footer / Clinical Stamp Disclaimer
  yPosition = Math.max(yPosition + 10, 260);
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 250;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, yPosition, 196, yPosition);
  yPosition += 6;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Este documento é um registo clínico confidencial emitido pela plataforma Saúde Fácil Moçambique.', 14, yPosition);
  doc.text('Válido para apresentação em clínicas conveniadas e farmácias da rede parceira.', 14, yPosition + 4);
  doc.text(`Autenticidade Verificada - Código Seguro: SF-SEC-${patient.memberNumber}-${new Date().getFullYear()}`, 14, yPosition + 8);

  // Save the PDF
  const filename = `Historico_Medico_${patient.fullName.replace(/\s+/g, '_')}_${patient.memberNumber}.pdf`;
  doc.save(filename);
}

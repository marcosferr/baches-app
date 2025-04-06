import { Report } from '@/types';
import { format } from 'date-fns';

// Helper functions
export const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'submitted': return 'Enviado';
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En Proceso';
    case 'resolved': return 'Resuelto';
    case 'rejected': return 'Rechazado';
    default: return status || '';
  }
};

export const getSeverityText = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'low': return 'Baja';
    case 'medium': return 'Media';
    case 'high': return 'Alta';
    default: return severity || '';
  }
};

// Escape CSV values to handle commas and special characters
export const escapeCSV = (value: string): string => {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If the value contains a comma, double quote, or newline, wrap it in double quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Double any existing double quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

// Format reports for CSV export
export const formatReportsForCSV = (reports: Report[]) => {
  // Define headers
  const headers = [
    { label: 'ID', key: 'id' },
    { label: 'Dirección', key: 'address' },
    { label: 'Descripción', key: 'description' },
    { label: 'Estado', key: 'status' },
    { label: 'Gravedad', key: 'severity' },
    { label: 'Latitud', key: 'latitude' },
    { label: 'Longitud', key: 'longitude' },
    { label: 'Reportado Por', key: 'reportedBy' },
    { label: 'Fecha de Creación', key: 'createdAt' },
    { label: 'Última Actualización', key: 'updatedAt' },
    { label: 'Número de Comentarios', key: 'commentCount' },
  ];

  // Format data
  const data = reports.map(report => ({
    id: report.id,
    address: report.address || 'No disponible',
    description: report.description,
    status: getStatusText(report.status),
    severity: getSeverityText(report.severity),
    latitude: report.latitude,
    longitude: report.longitude,
    reportedBy: report.user?.name || report.author?.name || 'Anónimo',
    createdAt: formatDate(report.createdAt),
    updatedAt: formatDate(report.updatedAt),
    commentCount: report.comments?.length || report._count?.comments || 0,
  }));

  return { headers, data };
};

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font,
  Link
} from '@react-pdf/renderer';
import { Report } from '@/types';
import { format } from 'date-fns';

// Register fonts if needed
// Font.register({
//   family: 'Open Sans',
//   fonts: [
//     { src: '/fonts/OpenSans-Regular.ttf' },
//     { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
//   ]
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 12,
    color: '#6b7280',
  },
  value: {
    width: '70%',
    fontSize: 12,
    color: '#1f2937',
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 150,
    objectFit: 'cover',
    marginBottom: 5,
    borderRadius: 5,
  },
  description: {
    fontSize: 12,
    color: '#1f2937',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  commentSection: {
    marginTop: 15,
  },
  comment: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  commentDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  commentText: {
    fontSize: 10,
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    width: 80,
  },
  severityBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    width: 80,
  },
});

// Helper functions
const getStatusBadgeStyle = (status: string) => {
  const baseStyle = { ...styles.statusBadge };
  
  switch (status.toLowerCase()) {
    case 'submitted':
      return { ...baseStyle, backgroundColor: '#eab308' }; // yellow
    case 'pending':
      return { ...baseStyle, backgroundColor: '#f97316' }; // orange
    case 'in_progress':
      return { ...baseStyle, backgroundColor: '#3b82f6' }; // blue
    case 'resolved':
      return { ...baseStyle, backgroundColor: '#22c55e' }; // green
    case 'rejected':
      return { ...baseStyle, backgroundColor: '#ef4444' }; // red
    default:
      return baseStyle;
  }
};

const getSeverityBadgeStyle = (severity: string) => {
  const baseStyle = { ...styles.severityBadge };
  
  switch (severity.toLowerCase()) {
    case 'low':
      return { ...baseStyle, backgroundColor: '#22c55e' }; // green
    case 'medium':
      return { ...baseStyle, backgroundColor: '#f97316' }; // orange
    case 'high':
      return { ...baseStyle, backgroundColor: '#ef4444' }; // red
    default:
      return baseStyle;
  }
};

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'submitted': return 'Enviado';
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En Proceso';
    case 'resolved': return 'Resuelto';
    case 'rejected': return 'Rechazado';
    default: return status;
  }
};

const getSeverityText = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'low': return 'Baja';
    case 'medium': return 'Media';
    case 'high': return 'Alta';
    default: return severity;
  }
};

// PDF Document Component
interface ReportPDFProps {
  reports: Report[];
  title?: string;
  subtitle?: string;
  showComments?: boolean;
}

export const ReportPDF: React.FC<ReportPDFProps> = ({ 
  reports, 
  title = 'Reporte de Baches', 
  subtitle = 'Generado por el Sistema de Gestión de Baches',
  showComments = true
}) => {
  return (
    <Document>
      {reports.map((report, index) => (
        <Page key={report.id || index} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {formatDate(new Date())}
            </Text>
          </View>

          {/* Report Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del Reporte</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>ID:</Text>
              <Text style={styles.value}>{report.id}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{report.address || 'No disponible'}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Fecha de Reporte:</Text>
              <Text style={styles.value}>{formatDate(report.createdAt)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Reportado por:</Text>
              <Text style={styles.value}>{report.user?.name || report.author?.name || 'Anónimo'}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Estado:</Text>
              <View style={getStatusBadgeStyle(report.status)}>
                <Text>{getStatusText(report.status)}</Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Gravedad:</Text>
              <View style={getSeverityBadgeStyle(report.severity)}>
                <Text>{getSeverityText(report.severity)}</Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Coordenadas:</Text>
              <Text style={styles.value}>
                {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Report Image */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagen del Bache</Text>
            <View style={styles.imageContainer}>
              {report.picture ? (
                <Image src={report.picture} style={styles.image} />
              ) : (
                <Text style={styles.value}>No hay imagen disponible</Text>
              )}
            </View>
          </View>

          {/* Report Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{report.description || 'Sin descripción'}</Text>
          </View>

          {/* Comments Section */}
          {showComments && report.comments && report.comments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comentarios ({report.comments.length})</Text>
              
              {report.comments.map((comment, i) => (
                <View key={comment.id || i} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.user?.name || 'Usuario'}
                    </Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>
              Reporte generado el {formatDate(new Date())} • Página {index + 1} de {reports.length}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default ReportPDF;

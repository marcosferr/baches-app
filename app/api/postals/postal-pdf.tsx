import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font
} from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 10,
    display: 'flex',
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
    marginTop: 4,
  },
  imagesGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  imageContainer: {
    width: '31%',
    marginBottom: 15,
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
  },
  imageCaption: {
    fontSize: 8,
    color: '#4b5563',
    padding: 5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  noReports: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 100,
  },
});

// Format date helper
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

// Get status text helper
const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'submitted': return 'Enviado';
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En Proceso';
    case 'resolved': return 'Resuelto';
    case 'rejected': return 'Rechazado';
    default: return status || '';
  }
};

// Get severity text helper
const getSeverityText = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'low': return 'Baja';
    case 'medium': return 'Media';
    case 'high': return 'Alta';
    default: return severity || '';
  }
};

// PDF Document Component
interface PostalPDFProps {
  name: string;
  reports: any[];
  date: Date;
}

export const PostalPDF: React.FC<PostalPDFProps> = ({ 
  name, 
  reports, 
  date 
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={styles.headerSubtitle}>
              Postal generada el {formatDate(date)}
            </Text>
          </View>
        </View>

        {/* Images Grid */}
        {reports.length > 0 ? (
          <View style={styles.imagesGrid}>
            {reports.map((report) => (
              <View key={report.id} style={styles.imageContainer}>
                <Image 
                  src={report.picture} 
                  style={styles.image} 
                />
                <Text style={styles.imageCaption}>
                  {report.address || `Lat: ${report.latitude.toFixed(6)}, Lng: ${report.longitude.toFixed(6)}`}
                  {'\n'}
                  Estado: {getStatusText(report.status)} | Severidad: {getSeverityText(report.severity)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noReports}>
            No se encontraron reportes en el área seleccionada.
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Postal generada desde la aplicación de Reporte de Baches • {formatDate(date)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

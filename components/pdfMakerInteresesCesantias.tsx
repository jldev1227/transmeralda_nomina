import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { Liquidacion } from "@/context/NominaContext";
import { formatToCOP } from "@/helpers/helpers";

// Estilos para el desprendible de Intereses de Cesantías
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: "#FFF",
    fontSize: 12,
  },
  header: {
    fontWeight: "bold",
    fontSize: 13,
    maxWidth: 300,
    marginBottom: 2,
    color: "#2E8B57",
  },
  subHeader: {
    fontSize: 10,
    fontWeight: "medium",
  },
  comprobante: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "semibold",
    color: "#2E8B57",
  },
  table: {
    display: "flex",
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  tableRowLast: {
    flexDirection: "row",
    alignItems: "center",
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  labelText: {
    fontSize: 12,
  },
  valueText: {
    fontSize: 12,
  },
  blueValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
  },
  greenValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5710",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    color: "#9E9E9E",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2E8B57",
    marginVertical: 15,
  },
  destacado: {
    backgroundColor: "#E6F4FF",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#91D5FF",
    marginVertical: 10,
  },
});

type InteresesCesantiasPDFProps = {
  item: Liquidacion | null;
  firmas: any[];
};

const safeValue = (value: any, defaultValue = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

export const InteresesCesantiasPDF = ({
  item,
  firmas,
}: InteresesCesantiasPDFProps) => {
  if (!item) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No hay datos disponibles para generar el PDF</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={styles.header}>
              TRANSPORTES Y SERVICIOS ESMERALDA S.A.S
            </Text>
            <Text style={styles.subHeader}>NIT: 901528440-3</Text>
            <Text style={styles.comprobante}>
              DESPRENDIBLE DE INTERESES DE CESANTÍAS
            </Text>
          </View>
          <Image
            source={"/assets/codi.png"}
            style={{
              width: 175,
              position: "absolute",
              height: 100,
              right: -50,
              objectFit: "contain",
            }}
          />
        </View>

        {/* Datos del empleado */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Nombre</Text>
            </View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.conductor?.nombre, "N/A")}{" "}
                {safeValue(item.conductor?.apellido, "N/A")}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>C.C.</Text>
            </View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.conductor?.numero_identificacion, "N/A")}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRowLast, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Periodo</Text>
            </View>
            <View>
              <Text style={styles.valueText}>Año 2025</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>
          DETALLE DE INTERESES DE CESANTÍAS
        </Text>

        {/* Información destacada */}
        <View style={styles.destacado}>
          <Text style={{ fontSize: 10, marginBottom: 5, fontWeight: "bold" }}>
            Información importante:
          </Text>
          <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
            Este desprendible corresponde al pago de los intereses de cesantías
            correspondientes al año 2025. Los valores que se detallan a
            continuación fueron cancelados dentro de los términos legales
            establecidos y se presentan en este documento para su información y
            registro.
          </Text>
        </View>

        {/* Detalle de intereses */}
        <View style={styles.table}>
          <View style={[styles.tableRowLast, styles.flex]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelText}>Intereses de cesantías</Text>
              <Text
                style={[
                  styles.labelText,
                  { fontSize: 8, color: "#666", fontStyle: "italic" },
                ]}
              >
                Calculado sobre el saldo de cesantías al 31 de diciembre
              </Text>
            </View>
            <View>
              <Text style={styles.greenValue}>
                {formatToCOP(
                  parseFloat(safeValue(item.interes_cesantias, "0")),
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {firmas[0]?.presignedUrl && (
            <View
              style={{
                width: 220,
                height: 110,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={firmas[0].presignedUrl}
                style={{
                  width: 180,
                  height: 50,
                  objectFit: "contain",
                }}
              />
              <View
                style={{
                  width: "80%",
                  height: 1,
                  backgroundColor: "#BDBDBD",
                  marginBottom: 2,
                  alignSelf: "center",
                }}
              />
              <Text
                style={{
                  fontSize: 9,
                  color: "#424242",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {firmas[0].nombre}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  color: "#757575",
                  textAlign: "center",
                }}
              >
                {firmas[0].cargo}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 9, color: "#9E9E9E" }}>
            Documento generado el {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Función para generar el PDF de intereses de cesantías
const handleGenerateInteresesCesantiasPDF = async (
  item: Liquidacion | null,
  firmas: any[],
): Promise<void> => {
  try {
    if (!item) {
      return;
    }

    const blob = await pdf(
      <InteresesCesantiasPDF firmas={firmas} item={item} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const pdfWindow = window.open(url, "_blank");

    if (!pdfWindow) {
      alert(
        "El navegador bloqueó la apertura del PDF. Por favor, permita ventanas emergentes.",
      );
    }
  } catch (error: any) {
    const message =
      error.message ||
      "Ocurrió un error al generar el PDF. Por favor, inténtelo de nuevo.";

    alert(message);
  }
};

export default handleGenerateInteresesCesantiasPDF;

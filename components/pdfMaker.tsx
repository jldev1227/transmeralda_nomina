import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { parseDate } from "@internationalized/date";

import {
  BonificacionesAcc,
  Bonificacion,
  Liquidacion,
  Recargo,
} from "@/context/NominaContext";
import {
  agruparFechasConsecutivas,
  formatDate,
  formatToCOP,
  MesyAño,
  obtenerDiferenciaDias,
} from "@/helpers/helpers";

// Estilos para el PDF con un diseño más elegante tipo tabla
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
  period: {
    textAlign: "center",
    fontSize: 12,
    color: "#2E8B57",
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 5,
    textTransform: "uppercase",
  },
  // Table styles
  table: {
    display: "flex",
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginBottom: 15,
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

  tableHeader: {
    backgroundColor: "#2E8B5715",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
    width: "100%", // Asegúrate que ocupe todo el ancho disponible
  },

  // Estilos para cada columna con proporciones específicas
  tableColHeader1: {
    width: "30%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
  },
  tableColHeader2: {
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
  },
  tableColHeader3: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
  },
  tableColHeader4: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
  },

  // Estilos similares para las filas de datos (no solo el encabezado)
  tableCol1: {
    width: "30%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%", // Ocupar toda la altura disponible
  },
  tableCol2: {
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%", // Ocupar toda la altura disponible
  },
  tableCol3: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%", // Ocupar toda la altura disponible
  },
  tableCol4: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%", // Ocupar toda la altura disponible
  },
  // Text styles
  labelText: {
    fontSize: 12,
  },
  valueText: {
    fontSize: 12,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
  },
  // Value styles with color
  blueValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
  },
  grayValue: {
    color: "#00000074",
    backgroundColor: "#F0F0F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
  },
  orangeValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
  },
  redValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
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
    color: "#9E9E9E",
  },
  // Section headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 15,
  },
});

type LiquidacionPDFProps = {
  item: Liquidacion | null; // Tipado del item basado en el tipo Liquidacion
  totalRecargosParex: number;
  recargosParex: Recargo[];
  recargosActualizados: Recargo[];
};

// Función para manejar valores undefined/null
const safeValue = (value: any, defaultValue = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

// Componente que genera el PDF con la información del item
export const LiquidacionPDF = ({
  item,
  totalRecargosParex,
  recargosParex,
  recargosActualizados,
}: LiquidacionPDFProps) => {
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
              TRANSPORTES Y SERVICIOS ESMERALDA S.A.S ZOMAC
            </Text>
            <Text style={styles.subHeader}>NIT: 901528440-3</Text>
            <Text style={styles.comprobante}>
              COMPROBANTE DE NOMINA - {MesyAño(item.periodo_end)}
            </Text>
          </View>
          <Image
            source={"/codi.png"}
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
                {safeValue(item.conductor?.nombre)}{" "}
                {safeValue(item.conductor?.apellido)}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>C.C.</Text>
            </View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.conductor?.numero_identificacion)}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Días laborados</Text>
            </View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.dias_laborados, "0")}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Salario devengado</Text>
            </View>
            <View>
              <Text style={styles.blueValue}>
                {formatToCOP(safeValue(item.salario_devengado, "0"))}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Auxilio de transporte</Text>
            </View>
            <View>
              <Text style={styles.grayValue}>
                {formatToCOP(safeValue(item.auxilio_transporte, "0"))}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRowLast, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Ajuste villanueva</Text>
            </View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.dias_laborados_villanueva, "0")} días
              </Text>
            </View>
            <View>
              <Text style={styles.orangeValue}>
                {formatToCOP(safeValue(item.ajuste_salarial, "0"))}
              </Text>
            </View>
          </View>
        </View>

        {/* Periodo */}
        <Text style={styles.period}>
          {formatDate(item.periodo_start)} - {formatDate(item.periodo_end)}
        </Text>

        {/* Tabla de Conceptos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColHeader1}>
              <Text
                style={[styles.labelText, { color: "#2E8B57", fontSize: 10 }]}
              >
                CONCEPTO
              </Text>
            </View>
            <View style={styles.tableColHeader2}>
              <Text
                style={[styles.labelText, { color: "#2E8B57", fontSize: 10 }]}
              >
                OBSERVACIÓN
              </Text>
            </View>
            <View style={styles.tableColHeader3}>
              <Text
                style={[
                  styles.labelText,
                  { color: "#2E8B57", fontSize: 10, textAlign: "center" },
                ]}
              >
                CANTIDAD
              </Text>
            </View>
            <View style={styles.tableColHeader4}>
              <Text
                style={[styles.labelText, { color: "#2E8B57", fontSize: 10 }]}
              >
                VALOR
              </Text>
            </View>
          </View>

          {/* Mapping bonificaciones */}
          {item.bonificaciones && item.bonificaciones.length > 0
            ? Object.values(
                item.bonificaciones.reduce(
                  (acc: BonificacionesAcc, bonificacion: Bonificacion) => {
                    // Sumamos la cantidad de bonificaciones y el valor total
                    const totalQuantity = bonificacion.values.reduce(
                      (sum: number, val: any) => sum + (val.quantity || 0),
                      0,
                    );

                    if (acc[bonificacion.name]) {
                      acc[bonificacion.name].quantity += totalQuantity;
                      acc[bonificacion.name].totalValue +=
                        totalQuantity * bonificacion.value;
                    } else {
                      acc[bonificacion.name] = {
                        name: bonificacion.name,
                        quantity: totalQuantity,
                        totalValue: totalQuantity * bonificacion.value,
                      };
                    }

                    return acc;
                  },
                  {},
                ),
              ).map((bono: any, index, array) => (
                <View
                  key={bono.name}
                  style={
                    index === array.length - 1 &&
                    recargosActualizados.length === 0 &&
                    recargosParex.length === 0 &&
                    (!item.pernotes || item.pernotes.length === 0)
                      ? styles.tableRowLast
                      : styles.tableRow
                  }
                >
                  <View style={styles.tableCol1}>
                    <Text style={styles.valueText}>{bono.name || ""}</Text>
                  </View>
                  <View style={styles.tableCol2}>
                    <Text style={styles.valueText} />
                  </View>
                  <View style={styles.tableCol3}>
                    <Text style={styles.valueText}>{bono.quantity}</Text>
                  </View>
                  <View style={styles.tableCol4}>
                    <Text style={styles.valueText}>
                      {formatToCOP(bono.totalValue)}
                    </Text>
                  </View>
                </View>
              ))
            : // Bonificaciones por defecto si el array está vacío o no existe
              [
                "Bono de alimentación",
                "Bono día trabajado",
                "Bono día trabajado doble",
                "Bono festividades",
              ].map((conceptName, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCol1}>
                    <Text style={styles.valueText}>{conceptName}</Text>
                  </View>
                  <View style={styles.tableCol2}>
                    <Text style={styles.valueText} />
                  </View>
                  <View style={styles.tableCol3}>
                    <Text style={styles.valueText}>0</Text>
                  </View>
                  <View style={styles.tableCol4}>
                    <Text style={styles.valueText}>{formatToCOP(0)}</Text>
                  </View>
                </View>
              ))}

          {/* Recargos */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.valueText}>Recargos</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.valueText} />
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.valueText}>
                {recargosActualizados?.length}
              </Text>
            </View>
            <View style={styles.tableCol4}>
              <Text style={styles.valueText}>
                {formatToCOP(
                  totalRecargosParex !== undefined &&
                    item.total_recargos !== undefined
                    ? item.total_recargos - totalRecargosParex
                    : item.total_recargos || 0,
                )}
              </Text>
            </View>
          </View>

          {/* Recargos PAREX */}
          {recargosParex.length > 0 && (
            <View
              style={
                !item.pernotes || item.pernotes.length === 0
                  ? styles.tableRowLast
                  : styles.tableRow
              }
            >
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Recargos PAREX</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.valueText} />
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.valueText}>{recargosParex.length}</Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.valueText}>
                  {formatToCOP(totalRecargosParex)}
                </Text>
              </View>
            </View>
          )}

          {/* Pernotes */}
          {item.pernotes && item.pernotes.length > 0 ? (
            <View style={styles.tableRowLast}>
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Pernotes</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={[styles.valueText, { fontSize: 10 }]}>
                  {(() => {
                    try {
                      // Recolectar todas las fechas de todos los pernotes
                      const todasLasFechas: string[] = [];

                      item.pernotes.forEach((pernote) => {
                        if (pernote.fechas && pernote.fechas.length > 0) {
                          todasLasFechas.push(...pernote.fechas);
                        }
                      });

                      // Usar la función agruparFechasConsecutivas
                      const rangos = agruparFechasConsecutivas(todasLasFechas);

                      return rangos.join(", ");
                    } catch (error: any) {
                      return (
                        error.message || "Error al recolectar fechas pernotes"
                      );
                    }
                  })()}
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.valueText}>
                  {item.pernotes.reduce((total, pernote) => {
                    return total + (pernote.fechas ? pernote.fechas.length : 0);
                  }, 0) || 0}
                </Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.valueText}>
                  {formatToCOP(safeValue(item.total_pernotes, "0"))}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.tableRowLast}>
              <View>
                <Text style={styles.valueText}>Pernotes</Text>
              </View>
              <View>
                <Text style={styles.valueText} />
              </View>
              <View>
                <Text style={styles.valueText} />
              </View>
              <View>
                <Text style={styles.valueText}>{formatToCOP(0)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Deducciones */}
        <Text style={styles.sectionHeader}>DEDUCCIONES</Text>

        <View style={styles.table}>
          {/* Salud */}
          <View style={[styles.tableRow, styles.flex]}>
            <View>
              <Text style={styles.labelText}>Salud</Text>
            </View>
            <View>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.salud, "0"))}
              </Text>
            </View>
          </View>

          {/* Pensión */}
          <View
            style={
              item.anticipos && item.anticipos.length == 0
                ? [styles.tableRowLast, styles.flex]
                : [styles.tableRow, styles.flex]
            }
          >
            <View>
              <Text style={styles.labelText}>Pensión</Text>
            </View>
            <View>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.pension, "0"))}
              </Text>
            </View>
          </View>

          {/* Anticipos */}
          {item.anticipos && item?.anticipos.length > 0 && (
            <View style={[styles.tableRowLast, styles.flex]}>
              <View>
                <Text style={styles.labelText}>Anticipos</Text>
              </View>
              <View>
                <Text style={styles.redValue}>
                  {formatToCOP(safeValue(item.total_anticipos, "0"))}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionHeader}>RESUMEN FINAL</Text>

        {/* Total */}
        <View style={[styles.table]}>
          {/* Vacaciones (si existen) */}
          {safeValue(item.total_vacaciones, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View>
                <Text style={styles.labelText}>Vacaciones</Text>
              </View>
              <View>
                <Text style={styles.valueText}>
                  {item.periodo_start_vacaciones && item.periodo_end_vacaciones
                    ? obtenerDiferenciaDias({
                        start: parseDate(item.periodo_start_vacaciones),
                        end: parseDate(item.periodo_end_vacaciones),
                      })
                    : 0}{" "}
                  días
                </Text>
              </View>
              <View>
                <Text style={styles.orangeValue}>
                  {formatToCOP(safeValue(item.total_vacaciones, "0"))}
                </Text>
              </View>
            </View>
          )}

          {/* Interés Cesantías (si existe) */}
          {safeValue(item.interes_cesantias, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View>
                <Text style={styles.labelText}>Interes cesantias</Text>
              </View>
              <View>
                <Text style={styles.blueValue}>
                  {formatToCOP(safeValue(item.interes_cesantias, "0"))}
                </Text>
              </View>
            </View>
          )}
          <View style={[styles.tableRowLast, styles.flex]}>
            <View>
              <Text style={[styles.labelText]}>Salario total</Text>
            </View>
            <View>
              <Text style={styles.greenValue}>
                {formatToCOP(safeValue(item.sueldo_total, "0"))}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Documento generado el {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Función para generar el PDF y descargarlo
const handleGeneratePDF = async (item: Liquidacion | null): Promise<void> => {
  try {
    if (!item) {
      return;
    }

    // Filtrar recargos de PAREX
    const recargosParex =
      item?.recargos?.filter(
        (recargo) =>
          recargo.empresa_id === "cfb258a6-448c-4469-aa71-8eeafa4530ef",
      ) || [];

    // Calcular el total de recargos PAREX
    const totalRecargosParex = recargosParex.reduce(
      (sum, recargo) => sum + (recargo.valor || 0),
      0,
    );

    // Obtener recargos que no son de PAREX
    const recargosActualizados =
      item?.recargos?.filter(
        (recargo) =>
          recargo.empresa_id !== "cfb258a6-448c-4469-aa71-8eeafa4530ef",
      ) || [];

    // Generar el PDF con los datos filtrados
    const blob = await pdf(
      <LiquidacionPDF
        item={item}
        recargosActualizados={recargosActualizados}
        recargosParex={recargosParex}
        totalRecargosParex={Number(totalRecargosParex)}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const pdfWindow = window.open(url, "_blank");

    if (!pdfWindow) {
      alert(
        "El navegador bloqueó la apertura del PDF. Por favor, permita ventanas emergentes.",
      );
    }

    // Limpiar URL después de abrir el PDF
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error: any) {
    const message =
      error.message ||
      "Ocurrió un error al generar el PDF. Por favor, inténtelo de nuevo.";

    alert(message);
  }
};

export default handleGeneratePDF;

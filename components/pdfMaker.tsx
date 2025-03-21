import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { BonificacionesAcc, Bonificacion, Liquidacion, Recargo } from "@/context/NominaContext";
import { formatDate, formatToCOP, MesyAño, obtenerDiferenciaDias } from "@/helpers/helpers";
import { parseDate } from "@internationalized/date";

// Estilos para el PDF con un diseño más elegante tipo tabla
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: "#FFF",
    fontSize: 10,
  },
  header: {
    fontWeight: "bold",
    fontSize: 13,
    maxWidth: 300,
    marginBottom: 2,
    color: "#2E8B57",
  },
  subHeader: {
    fontSize: 9,
    fontWeight: "medium",
  },
  comprobante: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "semibold",
    color: "#2E8B57",
  },
  period: {
    textAlign: 'center',
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 5,
    textTransform: 'uppercase'
  },
  // Table styles
  table: {
    display: "flex",
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    minHeight: 24,
    alignItems: "center",
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 24,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#2E8B5715",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    minHeight: 26,
    alignItems: "center",
  },
  tableCol1: {
    width: "40%",
    paddingLeft: 8,
    paddingVertical: 5,
  },
  tableCol2: {
    width: "30%",
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: "center",
  },
  tableCol3: {
    width: "30%",
    paddingRight: 8,
    paddingVertical: 5,
    textAlign: "right",
  },
  // Text styles
  labelText: {
    fontWeight: "semibold",
    fontSize: 10,
  },
  valueText: {
    fontSize: 10,
  },
  // Value styles with color
  blueValue: {
    color: "#007AFF",
    backgroundColor: "#007AFF10",
    padding: 3,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: "semibold",
  },
  grayValue: {
    color: "#00000074",
    backgroundColor: "#00000010",
    padding: 3,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: "semibold",
  },
  orangeValue: {
    color: "#FF9500",
    backgroundColor: "#FF950010",
    padding: 3,
    borderRadius: 3, 
    fontSize: 10,
    fontWeight: "semibold",
  },
  redValue: {
    color: "#e60f0f",
    backgroundColor: "#e60f0f10",
    padding: 3,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: "semibold",
  },
  greenValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5710",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "semibold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 1,
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
    marginTop: 15,
    marginBottom: 5,
  }
});

type LiquidacionPDFProps = {
  item: Liquidacion | null; // Tipado del item basado en el tipo Liquidacion
  totalRecargosParex: number;
  recargosParex: Recargo[];
  recargosActualizados: Recargo[];
};

// Función para manejar valores undefined/null
const safeValue = (value, defaultValue = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

// Componente que genera el PDF con la información del item
const LiquidacionPDF = ({ item, totalRecargosParex, recargosParex, recargosActualizados }: LiquidacionPDFProps) => {
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
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ gap: 2 }}>
            <Text style={styles.header}>
              TRANSPORTES Y SERVICIOS ESMERALDA S.A.S ZOMAC
            </Text>
            <Text style={styles.subHeader}>
              NIT: 901528440
            </Text>
            <Text style={styles.comprobante}>
              Comprobante de nomina - {MesyAño(item.periodoEnd)}
            </Text>
          </View>
          <Image
            style={{
              width: 175,
              position: "absolute",
              height: 100,
              right: -50,
              objectFit: "contain",
            }}
            source={"/codi.png"}
          />
        </View>

        {/* Datos del empleado */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Nombre</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.valueText}>
                {safeValue(item.conductor?.nombre)} {safeValue(item.conductor?.apellido)}
              </Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>C.C.</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.valueText}>{safeValue(item.conductor?.numero_identificacion)}</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Días laborados</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.valueText}>{safeValue(item.diasLaborados, 0)}</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Salario devengado</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.blueValue}>
                {formatToCOP(safeValue(item.salarioDevengado, 0))}
              </Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Auxilio de transporte</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.grayValue}>
                {formatToCOP(safeValue(item.auxilioTransporte, 0))}
              </Text>
            </View>
          </View>
          
          <View style={styles.tableRowLast}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Ajuste villanueva</Text>
            </View>
            <View style={[styles.tableCol2, { width: "30%", textAlign: "center" }]}>
              <Text style={styles.valueText}>
                {safeValue(item.diasLaboradosVillanueva, 0)} días
              </Text>
            </View>
            <View style={[styles.tableCol3, { width: "30%" }]}>
              <Text style={styles.orangeValue}>
                {formatToCOP(safeValue(item.ajusteSalarial, 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Periodo */}
        <Text style={styles.period}>
          {formatDate(item.periodoStart)} - {formatDate(item.periodoEnd)}
        </Text>

        {/* Tabla de Conceptos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableCol1}>
              <Text style={[styles.labelText, { color: "#2E8B57" }]}>Concepto</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={[styles.labelText, { color: "#2E8B57" }]}>Observación</Text>
            </View>
            <View style={[styles.tableCol2, { width: "15%" }]}>
              <Text style={[styles.labelText, { color: "#2E8B57" }]}>Cantidad</Text>
            </View>
            <View style={[styles.tableCol3, { width: "15%" }]}>
              <Text style={[styles.labelText, { color: "#2E8B57" }]}>Valor</Text>
            </View>
          </View>

          {/* Mapping bonificaciones */}
          {item.bonificaciones && item.bonificaciones.length > 0 ? 
            Object.values(
              item.bonificaciones.reduce(
                (acc: BonificacionesAcc, bonificacion: Bonificacion) => {
                  // Sumamos la cantidad de bonificaciones y el valor total
                  const totalQuantity = bonificacion.values.reduce(
                    (sum, val) => sum + (val.quantity || 0),
                    0
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
                {}
              )
            ).map((bono: any, index, array) => (
              <View key={bono.name} style={index === array.length - 1 && recargosActualizados.length === 0 && recargosParex.length === 0 && (!item.pernotes || item.pernotes.length === 0) ? styles.tableRowLast : styles.tableRow}>
                <View style={styles.tableCol1}>
                  <Text style={styles.valueText}>{bono.name || ""}asas</Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.valueText}></Text>
                </View>
                <View style={[styles.tableCol2, { width: "15%" }]}>
                  <Text style={styles.valueText}>{bono.quantity}</Text>
                </View>
                <View style={[styles.tableCol3, { width: "15%" }]}>
                  <Text style={styles.valueText}>{formatToCOP(bono.totalValue)}</Text>
                </View>
              </View>
            ))
          : 
            // Bonificaciones por defecto si el array está vacío o no existe
            [
              "Bono de alimentación", 
              "Bono día trabajado", 
              "Bono día trabajado doble", 
              "Bono festividades"
            ].map((conceptName, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol1}>
                  <Text style={styles.valueText}>{conceptName}</Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.valueText}></Text>
                </View>
                <View style={[styles.tableCol2, { width: "15%" }]}>
                  <Text style={styles.valueText}>0</Text>
                </View>
                <View style={[styles.tableCol3, { width: "15%" }]}>
                  <Text style={styles.valueText}>{formatToCOP(0)}</Text>
                </View>
              </View>
            ))
          }

          {/* Recargos */}
          <View style={recargosParex.length === 0 && (!item.pernotes || item.pernotes.length === 0) ? styles.tableRowLast : styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.valueText}>Recargos</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.valueText}></Text>
            </View>
            <View style={[styles.tableCol2, { width: "15%" }]}>
              <Text style={styles.valueText}>{recargosActualizados?.length}</Text>
            </View>
            <View style={[styles.tableCol3, { width: "15%" }]}>
              <Text style={styles.valueText}>
                {formatToCOP(
                  totalRecargosParex !== undefined && item.totalRecargos !== undefined
                    ? item.totalRecargos - totalRecargosParex
                    : item.totalRecargos || 0
                )}
              </Text>
            </View>
          </View>

          {/* Recargos PAREX */}
          {recargosParex.length > 0 && (
            <View style={!item.pernotes || item.pernotes.length === 0 ? styles.tableRowLast : styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Recargos PAREX</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.valueText}></Text>
              </View>
              <View style={[styles.tableCol2, { width: "15%" }]}>
                <Text style={styles.valueText}>{recargosParex.length}</Text>
              </View>
              <View style={[styles.tableCol3, { width: "15%" }]}>
                <Text style={styles.valueText}>{formatToCOP(totalRecargosParex)}</Text>
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
                <Text style={[styles.valueText, { fontSize: 8 }]}>
                  {item.pernotes.map((pernote) => {
                    try {
                      const fechas = pernote.fechas || [];
                      return fechas.map((fecha) => {
                        if (!fecha) return '';
                        const fechaFormateada = safeFormatDate(fecha);
                        const fechaSeparada = fechaFormateada.split("-");
                        return `${fechaSeparada[0]}-${fechaSeparada[1]} `;
                      });
                    } catch (error) {
                      console.error("Error formatting pernote date:", error);
                      return '';
                    }
                  })}
                </Text>
              </View>
              <View style={[styles.tableCol2, { width: "15%" }]}>
                <Text style={styles.valueText}>
                  {item.pernotes.reduce((total, pernote) => {
                    return total + (pernote.fechas ? pernote.fechas.length : 0);
                  }, 0) || 0}
                </Text>
              </View>
              <View style={[styles.tableCol3, { width: "15%" }]}>
                <Text style={styles.valueText}>
                  {formatToCOP(safeValue(item.totalPernotes, 0))}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.tableRowLast}>
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Pernotes</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.valueText}></Text>
              </View>
              <View style={[styles.tableCol2, { width: "15%" }]}>
                <Text style={styles.valueText}>0</Text>
              </View>
              <View style={[styles.tableCol3, { width: "15%" }]}>
                <Text style={styles.valueText}>{formatToCOP(0)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Deducciones */}
        <Text style={styles.sectionHeader}>Deducciones</Text>
        <View style={styles.table}>
          {/* Vacaciones (si existen) */}
          {(safeValue(item.totalVacaciones, 0) > 0) && (
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.labelText}>Vacaciones</Text>
              </View>
              <View style={[styles.tableCol2, { width: "30%" }]}>
                <Text style={styles.valueText}>
                  {
                    item.periodoStartVacaciones && item.periodoEndVacaciones ?
                    obtenerDiferenciaDias({
                      start: parseDate(item.periodoStartVacaciones),
                      end: parseDate(item.periodoEndVacaciones),
                    }) :
                    0
                  } días
                </Text>
              </View>
              <View style={[styles.tableCol3, { width: "30%" }]}>
                <Text style={styles.orangeValue}>
                  {formatToCOP(safeValue(item.totalVacaciones, 0))}
                </Text>
              </View>
            </View>
          )}
          
          {/* Cesantías (si existen) */}
          {safeValue(item.cesantias, 0) > 0 && (
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.labelText}>Cesantias</Text>
              </View>
              <View style={[styles.tableCol2, { width: "30%" }]}>
                <Text style={styles.valueText}>
                  {safeValue(item.diasLaboradosAnual, 0)} días
                </Text>
              </View>
              <View style={[styles.tableCol3, { width: "30%" }]}>
                <Text style={styles.blueValue}>
                  {formatToCOP(safeValue(item.cesantias, 0))}
                </Text>
              </View>
            </View>
          )}

          {/* Salud */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Salud</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.salud, 0))}
              </Text>
            </View>
          </View>

          {/* Pensión */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Pensión</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.pension, 0))}
              </Text>
            </View>
          </View>

          {/* Interés Cesantías (si existe) */}
          {safeValue(item.interesCesantias, 0) > 0 && (
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.labelText}>Interes cesantias</Text>
              </View>
              <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
                <Text style={styles.redValue}>
                  {formatToCOP(safeValue(item.interesCesantias, 0))}
                </Text>
              </View>
            </View>
          )}

          {/* Anticipos */}
          <View style={styles.tableRowLast}>
            <View style={styles.tableCol1}>
              <Text style={styles.labelText}>Anticipos</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.totalAnticipos, 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={[styles.table, { marginTop: 5 }]}>
          <View style={styles.tableRowLast}>
            <View style={styles.tableCol1}>
              <Text style={[styles.labelText, { fontSize: 11 }]}>Salario total</Text>
            </View>
            <View style={[styles.tableCol2, styles.tableCol3, { width: "60%", textAlign: "right" }]}>
              <Text style={styles.greenValue}>
                {formatToCOP(safeValue(item.sueldoTotal, 0))}
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
      console.error("No se proporcionaron datos para generar el PDF");
      return;
    }
    
    // Filtrar recargos de PAREX
    const recargosParex = item?.recargos?.filter(recargo =>
      recargo.empresa_id === "cfb258a6-448c-4469-aa71-8eeafa4530ef" || recargo.id === "1768"
    ) || [];

    // Calcular el total de recargos PAREX
    const totalRecargosParex = recargosParex.reduce((sum, recargo) =>
      sum + (recargo.valor || 0), 0
    );

    // Obtener recargos que no son de PAREX
    const recargosActualizados = item?.recargos?.filter(recargo =>
      recargo.empresa_id !== "cfb258a6-448c-4469-aa71-8eeafa4530ef" && recargo.id !== "1768"
    ) || [];

    // Generar el PDF con los datos filtrados
    const blob = await pdf(
      <LiquidacionPDF
        item={item}
        totalRecargosParex={totalRecargosParex}
        recargosParex={recargosParex}
        recargosActualizados={recargosActualizados}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const pdfWindow = window.open(url, '_blank');
    
    if (!pdfWindow) {
      alert("El navegador bloqueó la apertura del PDF. Por favor, permita ventanas emergentes.");
    }
    
    // Limpiar URL después de abrir el PDF
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    alert("Ocurrió un error al generar el PDF. Por favor, inténtelo de nuevo.");
  }
};

export default handleGeneratePDF;
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
  formatearHora,
  formatToCOP,
  MonthAndYear,
  obtenerDiferenciaDias,
  toDateValue,
} from "@/helpers/helpers";

// Estilos mejorados para ambas páginas
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
  subHeaderCenter: {
    textAlign: "center",
    fontSize: 12,
    color: "#2E8B57",
    fontWeight: "bold",
    marginTop: 5,
    textTransform: "uppercase",
  },

  // Estilos de tabla principales
  table: {
    display: "flex",
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  tableNoBorder: {
    display: "flex",
    width: "100%",
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
    width: "100%",
  },

  // Columnas para página 1 (desprendible)
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
    borderColor: "#E0E0E0",
    fontWeight: "bold",
  },

  tableCol1: {
    width: "30%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
  },
  tableCol2: {
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
  },
  tableCol3: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
  },
  tableCol4: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    borderColor: "#E0E0E0",
    height: "100%",
  },

  // Estilos específicos para página 2 (detalles de recargos)
  detailHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E8B57",
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
  },

  // Tabla de detalles con columnas más específicas
  detailTableHeader: {
    backgroundColor: "#2E8B5715",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
    width: "100%",
  },

  // Columnas para detalles de recargos - Ajustadas para mejor visualización
  detailCol1: { // Fecha
    width: "11%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
  },
  detailCol2: { // Horario
    width: "13%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 7,
    textAlign: "center",
  },
  detailCol3: { // Total Horas
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol4: { // Tipo día
    width: "10%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 7,
    textAlign: "center",
  },
  detailCol5: { // HED
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol6: { // HEN
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol7: { // HEFD
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol8: { // HEFN
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol9: { // RN
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol10: { // RD
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol11: { // Estado/Observaciones
    width: "10%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 7,
    textAlign: "center",
  },

  // Estilos de texto
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
    padding: 5,
  },

  // Estilos de valores con colores
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

  // Resumen de totales para página 2
  summaryBox: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#666",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2E8B57",
  },

  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2E8B57",
    textAlign: "center",
    padding: 2,
  },

  tableCellCompact: {
    fontSize: 10,
    textAlign: "center",
    padding: 1
  }
});

type LiquidacionPDFProps = {
  item: Liquidacion | null;
  totalRecargosParex: number;
  recargosParex: Recargo[];
  recargosActualizados: Recargo[];
  firmas: any[];
};

const safeValue = (value: any, defaultValue = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

const calcularAlturaGrupo = (grupo) => {
  const alturaBase = 120; // Header + empresa info
  const alturaDiasPorFila = 25; // Aproximado por fila de día laboral
  const alturaTablaRecargos = 60; // Header + totales de tabla de recargos
  const alturaRecargosPorFila = 22; // Por cada tipo de recargo
  const alturaFooter = 40; // Información adicional

  const diasConRecargos = grupo.dias_laborales_unificados?.filter(dia => {
    const tieneRecargos = (dia.hed || 0) > 0 || (dia.hen || 0) > 0 ||
      (dia.hefd || 0) > 0 || (dia.hefn || 0) > 0 ||
      (dia.rn || 0) > 0 || (dia.rd || 0) > 0;
    return tieneRecargos || dia.es_domingo || dia.es_festivo;
  }).length || 0;

  const tiposRecargos = grupo.tipos_recargos_consolidados?.length || 0;

  return alturaBase +
    (diasConRecargos * alturaDiasPorFila) +
    alturaTablaRecargos +
    (tiposRecargos * alturaRecargosPorFila) +
    alturaFooter;
};

// Función para agrupar elementos por páginas
const agruparEnPaginas = (recargosAgrupados) => {
  const paginas = [];
  let paginaActual = [];
  let alturaAcumulada = 80; // Margen para título
  const alturaMaximaPagina = 700; // Altura disponible en página A4

  recargosAgrupados.forEach((grupo, index) => {
    const alturaGrupo = calcularAlturaGrupo(grupo);

    // Si agregar este grupo excede la altura de página
    if (alturaAcumulada + alturaGrupo > alturaMaximaPagina && paginaActual.length > 0) {
      // Cerrar página actual y comenzar nueva
      paginas.push(paginaActual);
      paginaActual = [grupo];
      alturaAcumulada = 80 + alturaGrupo; // Título + grupo actual
    } else {
      // Agregar a página actual
      paginaActual.push(grupo);
      alturaAcumulada += alturaGrupo;
    }
  });

  // Agregar última página si tiene contenido
  if (paginaActual.length > 0) {
    paginas.push(paginaActual);
  }

  return paginas;
};

// Componente de página de recargos
const PaginaRecargos = ({ grupos, numeroPagina, totalPaginas }) => (
  <Page size="A4" style={styles.page} wrap={false}>
    {/* Título con número de página */}
    <Text style={[styles.subHeaderCenter, { marginBottom: 15 }]}>
      HORAS EXTRAS Y RECARGOS {totalPaginas > 1 && `(${numeroPagina}/${totalPaginas})`}
    </Text>

    {grupos.map((grupo, index) => {
      const valorHoraBase = grupo.configuracion_salarial ?
        parseFloat(grupo.configuracion_salarial.valor_hora_trabajador) : 8741;

      return (
        <View
          key={`${grupo.vehiculo.placa}-${grupo.mes}-${grupo.año}-${grupo.empresa.nit}`}
          style={{
            border: "1px solid #ddd",
            marginBottom: 15,
            breakInside: "avoid", // Evita que se corte el grupo
          }}
          wrap={false} // No permitir wrap dentro del grupo
        >
          {/* Header del vehículo */}
          <View style={{ backgroundColor: "#2E8B57", padding: 8, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 10 }}>
              VEHÍCULO: {grupo.vehiculo.placa}
            </Text>
            <Text style={{ color: "white", fontSize: 10, textTransform: "uppercase", fontWeight: "bold", textAlign: "center" }}>
              MES: {new Date(grupo.año, grupo.mes - 1).toLocaleString("es-ES", {
                month: "long",
              })}
            </Text>
          </View>

          {/* Empresa info compacta */}
          <View style={{ backgroundColor: "#f9f9f9", padding: 5, fontSize: 10 }}>
            <Text style={{ fontWeight: "semibold" }}>
              EMPRESA: <Text style={{ fontWeight: "normal" }}>{grupo.empresa.nombre} - NIT: {grupo.empresa.nit}</Text>
            </Text>
            {grupo.recargos.length > 1 && (
              <Text style={{ fontWeight: "semibold", color: "#2E8B57", marginTop: 2 }}>
                CONSOLIDADO DE {grupo.recargos.length} REGISTROS
              </Text>
            )}
            <Text style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
              Valor/Hora Base: ${Math.floor(valorHoraBase).toLocaleString()}
              {grupo.configuracion_salarial?.empresa && ` (${grupo.empresa.nombre})`}
            </Text>
          </View>

          {/* Tabla de días laborales */}
          <View style={styles.tableNoBorder}>
            {/* Header de tabla */}
            <View style={{ flexDirection: "row", backgroundColor: "#2E8B5730", padding: 4 }}>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>FECHA</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>HORARIO</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>HORAS</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>HED</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>RN</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>HEN</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>RD</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>HEFD</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>HEFN</Text>
            </View>

            {/* Filas con datos unificados */}
            {grupo.dias_laborales_unificados?.filter(dia => {
              const tieneRecargos = (dia.hed || 0) > 0 || (dia.hen || 0) > 0 ||
                (dia.hefd || 0) > 0 || (dia.hefn || 0) > 0 ||
                (dia.rn || 0) > 0 || (dia.rd || 0) > 0;
              return tieneRecargos || dia.es_domingo || dia.es_festivo;
            }).map((dia, diaIndex) => (
              <View key={`${dia.id}-${index}-${diaIndex}`} style={{ flexDirection: "row", padding: 3, borderBottom: "1px solid #eee" }}>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {dia.dia}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {formatearHora(dia.hora_inicio)}-{formatearHora(dia.hora_fin)}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {dia.total_horas}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {(dia.hed || 0) > 0 ? `${dia.hed}` : '-'}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {(dia.rn || 0) > 0 ? `${dia.rn}` : '-'}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {(dia.hen || 0) > 0 ? `${dia.hen}` : '-'}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {(dia.rd || 0) > 0 ? `${dia.rd}` : '-'}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {(dia.hefd || 0) > 0 ? `${dia.hefd}` : '-'}
                </Text>
                <Text style={[styles.tableCellCompact, { flex: 1, textAlign: 'center' }]}>
                  {(dia.hefn || 0) > 0 ? `${dia.hefn}` : '-'}
                </Text>
              </View>
            ))}
          </View>

          {/* Totales de días */}
          <View style={{ backgroundColor: "#2E8B5715", padding: 4 }}>
            <Text style={{ fontWeight: "bold", fontSize: 11, color: "#2E8B57", textAlign: "center" }}>
              TOTALES CONSOLIDADOS
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 4 }}>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_dias}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>-</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_horas}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_hed}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_rn}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_hen}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_rd}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_hefd}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: "center" }}>{grupo.totales.total_hefn}</Text>
          </View>

          {/* Tabla de tipos de recargos */}
          {grupo.tipos_recargos_consolidados.length > 0 && (
            <View style={{ marginTop: 8, borderTop: "1px solid #ddd" }}>
              {/* Header */}
              <View style={{ flexDirection: "row", backgroundColor: "#2E8B5715", padding: 6 }}>
                <View style={{ width: "35%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textTransform: "uppercase" }}>
                    TIPO RECARGO
                  </Text>
                </View>
                <View style={{ width: "15%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
                    %
                  </Text>
                </View>
                <View style={{ width: "15%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
                    V/BASE
                  </Text>
                </View>
                <View style={{ width: "15%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
                    V/+ %
                  </Text>
                </View>
                <View style={{ width: "10%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
                    UDS
                  </Text>
                </View>
                <View style={{ width: "10%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
                    TOTAL
                  </Text>
                </View>
              </View>

              {/* Filas de recargos */}
              {grupo.tipos_recargos_consolidados.map((tipo, tipoIndex) => {
                return (
                  <View key={tipo.codigo} style={{
                    flexDirection: "row",
                    padding: 4,
                    borderBottom: tipoIndex !== grupo.tipos_recargos_consolidados.length - 1 ? "1px solid #eee" : "none",
                    fontSize: 8,
                  }}>
                    <View style={{ width: "35%", paddingHorizontal: 3 }}>
                      <Text style={{ fontSize: 8 }}>
                        {tipo.nombre.toUpperCase()}
                        {tipo.codigo !== "BONO_FESTIVO" && (
                          <Text style={{ color: "#007AFF" }}> - {tipo.codigo}</Text>
                        )}
                      </Text>
                    </View>
                    <View style={{ width: "15%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8 }}>
                        {tipo.porcentaje}%
                      </Text>
                    </View>
                    <View style={{ width: "15%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8, color: "#666" }}>
                        ${Math.floor(tipo.valor_hora_base).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ width: "15%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8, fontWeight: "bold", color: "#2E8B57" }}>
                        ${Math.floor(tipo.valor_hora_con_recargo).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ width: "10%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8 }}>
                        {tipo.horas}
                      </Text>
                    </View>
                    <View style={{ width: "10%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8, fontWeight: "bold" }}>
                        ${Math.floor(tipo.valor_calculado).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Total */}
              <View style={{ flexDirection: "row", padding: 4, backgroundColor: "#2E8B57" }}>
                <View style={{ width: "35%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>TOTALES</Text>
                </View>
                <View style={{ width: "45%", paddingHorizontal: 3 }}></View>
                <View style={{ width: "10%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "white", fontSize: 8, textAlign: "center", fontWeight: "bold" }}>
                    {grupo.tipos_recargos_consolidados.reduce((sum, tipo) => sum + (tipo.es_bono_festivo ? 0 : tipo.horas), 0)}
                  </Text>
                </View>
                <View style={{ width: "10%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "white", fontSize: 8, textAlign: "center", fontWeight: "bold" }}>
                    ${Math.floor(grupo.totales.valor_total).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    })}

    {/* Footer */}
    <View style={{ position: "absolute", bottom: 20, right: 20 }}>
      <Text style={{ fontSize: 8, color: "#666" }}>
        Generado: {new Date().toLocaleDateString()} - Pág. {numeroPagina}/{totalPaginas}
      </Text>
    </View>
  </Page>
);

const getColorByPercentage = (percentage: number) => {
  if (percentage < 80) {
    return "#2E8B57"; // Verde
  } else if (percentage >= 80 && percentage < 100) {
    return "#007AFF"; // Azul
  } else {
    return "#E60F0F"; // Rojo
  }
};

const getColorByPercentageBackground = (percentage: number) => {
  if (percentage < 80) {
    return "#2E8B5710"; // Verde
  } else if (percentage >= 80 && percentage < 100) {
    return "#F0F7FF"; // Azul
  } else {
    return "#FDF1F1"; // Rojo
  }
};

const agruparRecargos = (recargos, configuraciones_salario) => {
  const grupos = {};

  recargos.forEach(recargo => {
    // Crear clave única para agrupar por vehículo, mes y empresa
    const clave = `${recargo.vehiculo.placa}-${recargo.mes}-${recargo.año}-${recargo.empresa.nit}`;

    if (!grupos[clave]) {
      grupos[clave] = {
        vehiculo: recargo.vehiculo,
        mes: recargo.mes,
        año: recargo.año,
        empresa: recargo.empresa,
        recargos: [],
        configuracion_salarial: null,
        valor_hora_base: 8741, // Valor por defecto
        totales: {
          total_dias: 0,
          total_horas: 0,
          total_hed: 0,
          total_rn: 0,
          total_hen: 0,
          total_rd: 0,
          total_hefd: 0,
          total_hefn: 0,
          valor_total: 0,
          // Nuevos contadores para días festivos
          total_dias_festivos: 0,
          total_dias_domingos: 0
        },
        dias_laborales_unificados: [],
        tipos_recargos_consolidados: []
      };

      // Determinar configuración salarial para este grupo
      const configEmpresa = configuraciones_salario?.find(config =>
        config.empresa_id === recargo.empresa.id && config.activo === true
      );

      if (configEmpresa) {
        grupos[clave].configuracion_salarial = configEmpresa;
        grupos[clave].valor_hora_base = parseFloat(configEmpresa.valor_hora_trabajador);
      } else {
        // Usar configuración base del sistema
        const configBase = configuraciones_salario?.find(config =>
          config.empresa_id === null && config.activo === true
        );
        if (configBase) {
          grupos[clave].configuracion_salarial = configBase;
          grupos[clave].valor_hora_base = parseFloat(configBase.valor_hora_trabajador);
        }
      }
    }

    grupos[clave].recargos.push(recargo);

    // Acumular totales
    grupos[clave].totales.total_dias += recargo.total_dias || 0;
    grupos[clave].totales.total_horas += recargo.total_horas || 0;

    // Procesar días laborales
    if (recargo.dias_laborales) {
      recargo.dias_laborales.forEach(dia => {
        // Contar días festivos y domingos
        if (dia.es_festivo || dia.es_domingo) {
          if (dia.es_festivo) {
            grupos[clave].totales.total_dias_festivos++;
          }
          if (dia.es_domingo) {
            grupos[clave].totales.total_dias_domingos++;
          }
        }

        // Buscar si ya existe un día con la misma fecha
        const diaExistente = grupos[clave].dias_laborales_unificados.find(d => d.dia === dia.dia);

        if (diaExistente) {
          // Sumar las horas al día existente
          diaExistente.hed = (diaExistente.hed || 0) + (dia.hed || 0);
          diaExistente.rn = (diaExistente.rn || 0) + (dia.rn || 0);
          diaExistente.hen = (diaExistente.hen || 0) + (dia.hen || 0);
          diaExistente.rd = (diaExistente.rd || 0) + (dia.rd || 0);
          diaExistente.hefd = (diaExistente.hefd || 0) + (dia.hefd || 0);
          diaExistente.hefn = (diaExistente.hefn || 0) + (dia.hefn || 0);
          diaExistente.total_horas = (diaExistente.total_horas || 0) + (dia.total_horas || 0);
        } else {
          // Agregar nuevo día
          grupos[clave].dias_laborales_unificados.push({
            ...dia,
            hed: dia.hed || 0,
            rn: dia.rn || 0,
            hen: dia.hen || 0,
            rd: dia.rd || 0,
            hefd: dia.hefd || 0,
            hefn: dia.hefn || 0
          });
        }

        // Consolidar tipos de recargos
        if (dia.tipos_recargos) {
          dia.tipos_recargos.forEach(tipo => {
            // ===== VERIFICAR SI SE EXCLUYE POR CONFIGURACIÓN DE DÍAS FESTIVOS =====
            const configSalarial = grupos[clave].configuracion_salarial;
            const pagaDiasFestivos = configSalarial?.paga_dias_festivos || false;

            // Si la configuración paga días festivos, excluir recargos dominicales y festivos
            if (pagaDiasFestivos && (tipo.codigo === 'RD')) {
              return; // Saltar este tipo de recargo
            }

            const tipoExistente = grupos[clave].tipos_recargos_consolidados.find(t => t.codigo === tipo.codigo);

            const valorHoraBase = grupos[clave].valor_hora_base;
            const porcentaje = parseFloat(tipo.porcentaje) || 0;
            const horas = parseFloat(tipo.horas) || 0;

            // ===== CÁLCULO BASADO EN tipo_recargo.adicional =====
            let valorHoraConRecargo;
            let valorCalculadoCorreto;

            const esAdicional = tipo.adicional || false;

            if (esAdicional) {
              // MODO ADICIONAL: valor_hora + (valor_hora * porcentaje/100)
              const incremento = valorHoraBase * (porcentaje / 100);
              valorHoraConRecargo = valorHoraBase + incremento;
              valorCalculadoCorreto = horas * valorHoraConRecargo;
            } else {
              // MODO MULTIPLICATIVO: valor_hora * (1 + porcentaje/100)
              valorHoraConRecargo = valorHoraBase * (porcentaje / 100);
              valorCalculadoCorreto = horas * valorHoraConRecargo;
            }

            if (tipoExistente) {
              // Sumar horas y recalcular total
              tipoExistente.horas += horas;

              // Recalcular el valor total con las nuevas horas
              if (esAdicional) {
                const incremento = valorHoraBase * (porcentaje / 100);
                const valorHoraFinal = valorHoraBase + incremento;
                tipoExistente.valor_calculado = tipoExistente.horas * valorHoraFinal;
              } else {
                const valorHoraFinal = valorHoraBase * (porcentaje / 100);
                tipoExistente.valor_calculado = tipoExistente.horas * valorHoraFinal;
              }

              tipoExistente.valor_hora_con_recargo = tipoExistente.valor_calculado / tipoExistente.horas;
              tipoExistente.es_adicional = esAdicional;
            } else {
              // Crear nuevo tipo de recargo
              grupos[clave].tipos_recargos_consolidados.push({
                codigo: tipo.codigo,
                nombre: tipo.nombre,
                porcentaje: porcentaje,
                horas: horas,
                valor_calculado: valorCalculadoCorreto,
                valor_hora_base: valorHoraBase,
                valor_hora_con_recargo: valorHoraConRecargo,
                es_adicional: esAdicional
              });
            }
          });
        }
      });
    }
  });

  // Calcular totales finales para cada grupo
  Object.values(grupos).forEach(grupo => {
    const configSalarial = grupo.configuracion_salarial;

    const pagaDiasFestivos = configSalarial?.paga_dias_festivos || false;

    grupo.totales.total_hed = grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.hed || 0), 0);
    grupo.totales.total_rn = grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.rn || 0), 0);
    grupo.totales.total_hen = grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.hen || 0), 0);
    grupo.totales.total_hefd = grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.hefd || 0), 0);
    grupo.totales.total_hefn = grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.hefn || 0), 0);

    // Solo sumar RD si NO se pagan días festivos
    grupo.totales.total_rd = pagaDiasFestivos ? 0 : grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.rd || 0), 0);

    // ===== AGREGAR TIPO DE RECARGO PARA PAGO POR DÍAS FESTIVOS =====
    if (pagaDiasFestivos && (grupo.totales.total_dias_festivos > 0 || grupo.totales.total_dias_domingos > 0)) {
      const salarioBasico = parseFloat(configSalarial.salario_basico) || 0;
      const porcentajeFestivos = parseFloat(configSalarial.porcentaje_festivos) || 0;

      // Calcular valor unitario por día festivo: (salario_base / 30) * (porcentaje/100)
      const valorDiarioBase = salarioBasico / 30;
      const valorDiarioConRecargo = valorDiarioBase * (porcentajeFestivos / 100);

      // Total de días festivos/domingos (evitar duplicados)
      const totalDiasEspeciales = grupo.totales.total_dias_festivos + grupo.totales.total_dias_domingos;
      const valorTotalDiasFestivos = totalDiasEspeciales * valorDiarioConRecargo;

      // Agregar tipo de recargo especial para días festivos
      grupo.tipos_recargos_consolidados.push({
        codigo: 'BONO_FESTIVO',
        nombre: 'Bono Días Festivos/Dominicales',
        porcentaje: porcentajeFestivos,
        horas: totalDiasEspeciales, // En este caso representan días
        valor_calculado: valorTotalDiasFestivos,
        valor_hora_base: valorDiarioBase, // En este contexto es valor diario base
        valor_hora_con_recargo: valorDiarioConRecargo, // Valor por día con recargo
        es_adicional: false,
        es_bono_festivo: true // Flag especial para identificarlo
      });
    }

    // Calcular valor total de recargos usando los valores recalculados
    grupo.totales.valor_total = grupo.tipos_recargos_consolidados.reduce((sum, tipo) => sum + tipo.valor_calculado, 0);

    // Ordenar días por fecha y tipos de recargos por porcentaje
    grupo.dias_laborales_unificados.sort((a, b) => new Date(a.dia) - new Date(b.dia));
    grupo.tipos_recargos_consolidados.sort((a, b) => {
      // Poner el bono festivo al final
      if (a.es_bono_festivo) return 1;
      if (b.es_bono_festivo) return -1;
      return a.porcentaje - b.porcentaje;
    });
  });

  return Object.values(grupos);
};

export const LiquidacionPDF = ({
  item,
  totalRecargosParex,
  recargosParex,
  recargosActualizados,
  firmas,
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
      {/* PÁGINA 1: DESPRENDIBLE DE NÓMINA */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ gap: 2 }}>
            <Text style={styles.header}>
              TRANSPORTES Y SERVICIOS ESMERALDA S.A.S ZOMAC
            </Text>
            <Text style={styles.subHeader}>NIT: 901528440-3</Text>
            <Text style={styles.comprobante}>
              COMPROBANTE DE NOMINA - {MonthAndYear(item.periodo_end)}
            </Text>
            <Text style={styles.comprobante}>
              BÁSICO CORRESPONDIENTE AL MES DE {MonthAndYear(item.periodo_end)}
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
            <View><Text style={styles.labelText}>Nombre</Text></View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.conductor?.nombre)} {safeValue(item.conductor?.apellido)}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View><Text style={styles.labelText}>C.C.</Text></View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.conductor?.numero_identificacion)}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View><Text style={styles.labelText}>Días laborados</Text></View>
            <View>
              <Text style={styles.valueText}>
                {safeValue(item.dias_laborados, "0")}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View><Text style={styles.labelText}>Salario devengado</Text></View>
            <View>
              <Text style={styles.blueValue}>
                {formatToCOP(safeValue(item.salario_devengado, "0"))}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.flex]}>
            <View><Text style={styles.labelText}>Auxilio de transporte</Text></View>
            <View>
              <Text style={styles.grayValue}>
                {formatToCOP(safeValue(item.auxilio_transporte, "0"))}
              </Text>
            </View>
          </View>

          {safeValue(item.valor_incapacidad, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View><Text style={styles.labelText}>Remuneración por incapacidad</Text></View>
              <View>
                <Text style={[styles.valueText, { marginLeft: -55 }]}>
                  {item.periodo_start_incapacidad && item.periodo_end_incapacidad
                    ? `${obtenerDiferenciaDias({
                      start: toDateValue(parseDate(item.periodo_start_incapacidad)),
                      end: toDateValue(parseDate(item.periodo_end_incapacidad)),
                    })} días`
                    : "-"}
                </Text>
              </View>
              <View>
                <Text style={styles.greenValue}>
                  {formatToCOP(safeValue(item.valor_incapacidad))}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.tableRowLast, styles.flex]}>
            <View><Text style={styles.labelText}>Ajuste villanueva</Text></View>
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
        <Text style={[styles.subHeaderCenter, { marginVertical: 12 }]}>
          ADICIONALES {formatDate(item.periodo_start)} - {formatDate(item.periodo_end)}
        </Text>

        {/* Tabla de Conceptos (misma lógica original) */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColHeader1}>
              <Text style={[styles.labelText, { color: "#2E8B57", fontSize: 10 }]}>CONCEPTO</Text>
            </View>
            <View style={styles.tableColHeader2}>
              <Text style={[styles.labelText, { color: "#2E8B57", fontSize: 10 }]}>OBSERVACIÓN</Text>
            </View>
            <View style={styles.tableColHeader3}>
              <Text style={[styles.labelText, { color: "#2E8B57", fontSize: 10, textAlign: "center" }]}>CANTIDAD</Text>
            </View>
            <View style={styles.tableColHeader4}>
              <Text style={[styles.labelText, { color: "#2E8B57", fontSize: 10 }]}>VALOR</Text>
            </View>
          </View>

          {/* Bonificaciones */}
          {item.bonificaciones && item.bonificaciones.length > 0
            ? Object.values(
              item.bonificaciones.reduce(
                (acc: BonificacionesAcc, bonificacion: Bonificacion) => {
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
            )
              .filter((bono: any) => bono.quantity > 0)
              .map((bono: any) => (
                <View key={bono.name} style={styles.tableRow}>
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
                    <Text style={styles.valueText}>{formatToCOP(bono.totalValue)}</Text>
                  </View>
                </View>
              ))
            : null}

          {/* Recargos */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.valueText}>Recargos</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={[styles.valueText, { fontSize: 10 }]}>Ver recargos detallados más adelante</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.valueText}>{recargosActualizados?.length}</Text>
            </View>
            <View style={styles.tableCol4}>
              <Text style={styles.valueText}>{formatToCOP(item.total_recargos - totalRecargosParex)}</Text>
            </View>
          </View>

          {/* Recargos PAREX */}
          {recargosParex.length > 0 && (
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Recargos PAREX</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.valueText}>Ver detalle en página 2</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.valueText}>{recargosParex.length}</Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.valueText}>{formatToCOP(totalRecargosParex)}</Text>
              </View>
            </View>
          )}

          {/* Pernotes (lógica original mantenida) */}
          {item.pernotes && item.pernotes.length > 0 ? (
            <View style={styles.tableRowLast}>
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Pernotes</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={[styles.valueText, { fontSize: 10 }]}>
                  {(() => {
                    try {
                      const todasLasFechas: string[] = [];
                      item.pernotes.forEach((pernote) => {
                        if (pernote.fechas && pernote.fechas.length > 0) {
                          todasLasFechas.push(...pernote.fechas);
                        }
                      });
                      const rangos = agruparFechasConsecutivas(todasLasFechas);
                      return rangos.join(", ");
                    } catch (error: any) {
                      return error.message || "Error al recolectar fechas pernotes";
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
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Pernotes</Text>
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
          )}
        </View>

        {/* Deducciones */}
        <Text style={styles.sectionHeader}>DEDUCCIONES</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.flex]}>
            <View><Text style={styles.labelText}>Salud</Text></View>
            <View>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.salud, "0"))}
              </Text>
            </View>
          </View>

          <View style={
            item.anticipos && item.anticipos.length == 0
              ? [styles.tableRowLast, styles.flex]
              : [styles.tableRow, styles.flex]
          }>
            <View><Text style={styles.labelText}>Pensión</Text></View>
            <View>
              <Text style={styles.redValue}>
                {formatToCOP(safeValue(item.pension, "0"))}
              </Text>
            </View>
          </View>

          {item.anticipos && item?.anticipos.length > 0 && (
            <View style={[styles.tableRowLast, styles.flex]}>
              <View><Text style={styles.labelText}>Anticipos</Text></View>
              <View>
                <Text style={styles.redValue}>
                  {formatToCOP(safeValue(item.total_anticipos, "0"))}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionHeader}>RESUMEN FINAL</Text>
        <View style={[styles.table]}>
          {safeValue(item.total_vacaciones, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View><Text style={styles.labelText}>Vacaciones</Text></View>
              <View>
                <Text style={styles.valueText}>
                  {item.periodo_start_vacaciones && item.periodo_end_vacaciones
                    ? obtenerDiferenciaDias({
                      start: parseDate(item.periodo_start_vacaciones),
                      end: parseDate(item.periodo_end_vacaciones),
                    })
                    : 0} días
                </Text>
              </View>
              <View>
                <Text style={styles.orangeValue}>
                  {formatToCOP(safeValue(item.total_vacaciones, "0"))}
                </Text>
              </View>
            </View>
          )}

          {safeValue(item.interes_cesantias, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View><Text style={styles.labelText}>Interes cesantias</Text></View>
              <View>
                <Text style={styles.blueValue}>
                  {formatToCOP(safeValue(item.interes_cesantias, "0"))}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.tableRowLast, styles.flex]}>
            <View><Text style={[styles.labelText]}>Salario total</Text></View>
            <View>
              <Text style={styles.greenValue}>
                {formatToCOP(safeValue(item.sueldo_total, "0"))}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Página 1 */}
        <View style={styles.footer}>
          {firmas[0]?.presignedUrl && (
            <View style={{
              width: 220,
              height: 110,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Image
                source={firmas[0].presignedUrl}
                style={{
                  width: 180,
                  height: 50,
                  objectFit: "contain",
                }}
              />
              <View style={{
                width: "80%",
                height: 1,
                backgroundColor: "#BDBDBD",
                marginBottom: 2,
                alignSelf: "center",
              }} />
              <Text style={{
                fontSize: 10,
                color: "#2E8B57",
                textAlign: "center",
                fontWeight: "bold",
                marginTop: 4,
                marginBottom: 7,
              }}>
                Firma de recibido
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 9, color: "#9E9E9E" }}>
            Documento generado el {new Date().toLocaleDateString()} - Página 1 de 2
          </Text>
        </View>
      </Page>

      {(() => {
        if (!item.recargos_planilla?.recargos) return null;

        const recargosAgrupados = agruparRecargos(item.recargos_planilla.recargos, item.configuraciones_salario);
        const paginasAgrupadas = agruparEnPaginas(recargosAgrupados);

        return paginasAgrupadas.map((gruposPagina, indicePagina) => (
          <PaginaRecargos
            key={`pagina-recargos-${indicePagina}`}
            grupos={gruposPagina}
            numeroPagina={indicePagina + 2} // Asumiendo que es la segunda página del documento
            totalPaginas={paginasAgrupadas.length + 1} // +1 por la página principal
          />
        ));
      })()}
    </Document >
  );
};

// Función para generar el PDF y descargarlo
const handleGeneratePDF = async (
  item: Liquidacion | null,
  firmas: any[],
): Promise<void> => {
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
        firmas={firmas}
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
  } catch (error: any) {
    const message =
      error.message ||
      "Ocurrió un error al generar el PDF. Por favor, inténtelo de nuevo.";

    alert(message);
  }
};

export default handleGeneratePDF;
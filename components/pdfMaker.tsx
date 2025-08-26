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
      const valorHoraBase = grupo.configuracion_salarial.salario_basico / grupo.configuracion_salarial.horas_mensuales_base;

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
              Valor/Hora Base: ${Math.round(valorHoraBase).toLocaleString()}
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
                <View style={{ width: "10%", paddingHorizontal: 3 }}>
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
                <View style={{ width: "15%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#2E8B57", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
                    CANTIDAD
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
                    <View style={{ width: "10%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8 }}>
                        {tipo.porcentaje}%
                      </Text>
                    </View>
                    <View style={{ width: "15%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8, color: "#666" }}>
                        ${Math.round(tipo.valor_hora_base).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ width: "15%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8, fontWeight: "bold", color: "#2E8B57" }}>
                        ${Math.round(tipo.valor_hora_con_recargo).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ width: "15%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8 }}>
                        {tipo.horas}
                      </Text>
                    </View>
                    <View style={{ width: "10%", paddingHorizontal: 3 }}>
                      <Text style={{ textAlign: "center", fontSize: 8, fontWeight: "bold" }}>
                        ${Math.round(tipo.valor_calculado).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Total */}
              <View style={{ flexDirection: "row", padding: 4, backgroundColor: "#2E8B57" }}>
                <View style={{ width: "90%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>TOTALES</Text>
                </View>
                <View style={{ width: "10%", paddingHorizontal: 3 }}>
                  <Text style={{ color: "white", fontSize: 8, textAlign: "center", fontWeight: "bold" }}>
                    ${Math.round(grupo.totales.valor_total).toLocaleString()}
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
        Página {numeroPagina} de {totalPaginas}
      </Text>
    </View>
  </Page>
);

const agruparRecargos = (recargos, configuraciones_salario) => {
  console.log('\n=== INICIANDO AGRUPACIÓN DE RECARGOS ===');
  console.log('Total de recargos a procesar:', recargos.length);

  const grupos = {};

  // Función auxiliar para crear clave única
  const crearClave = (recargo) =>
    `${recargo.vehiculo.placa}-${recargo.mes}-${recargo.año}-${recargo.empresa.nit}`;

  // Función auxiliar para obtener configuración salarial
  const obtenerConfiguracion = (empresaId) => {
    if (!configuraciones_salario) {
      console.warn("No hay configuraciones de salario disponibles");
      return null;
    }

    // Buscar configuración específica de la empresa
    const configEmpresa = configuraciones_salario.find(config =>
      config.empresa_id === empresaId && config.activo === true
    );

    if (configEmpresa) {
      console.log(`Configuración específica encontrada para empresa ${empresaId}`);
      return configEmpresa;
    }

    // Buscar configuración base del sistema
    const configBase = configuraciones_salario.find(config =>
      config.empresa_id === null && config.activo === true
    );

    if (configBase) {
      console.log(`Usando configuración base del sistema para empresa ${empresaId}`);
      return configBase;
    }

    console.warn(`No se encontró configuración para empresa ${empresaId}`);
    return null;
  };

  // Función auxiliar para inicializar grupo
  const inicializarGrupo = (recargo) => {
    console.log(`\n--- INICIALIZANDO GRUPO ---`);
    console.log(`Clave: ${crearClave(recargo)}`);
    console.log(`Empresa: ${recargo.empresa.nombre}`);
    console.log(`Vehículo: ${recargo.vehiculo.placa}`);
    console.log(`Período: ${recargo.mes}/${recargo.año}`);

    const configuracion = obtenerConfiguracion(recargo.empresa.id);

    const grupo = {
      vehiculo: recargo.vehiculo,
      mes: recargo.mes,
      año: recargo.año,
      empresa: recargo.empresa,
      recargos: [],
      configuracion_salarial: configuracion,
      valor_hora_base: configuracion?.salario_basico / configuracion?.horas_mensuales_base || 0,
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
        total_dias_festivos: 0,
        total_dias_domingos: 0
      },
      dias_laborales_unificados: [],
      tipos_recargos_consolidados: []
    };

    if (configuracion) {
      console.log('--- CONFIGURACIÓN SALARIAL ENCONTRADA ---');
      console.log('Salario básico:', configuracion.salario_basico);
      console.log('Valor hora trabajador:', configuracion.salario_basico / configuracion.horas_mensuales_base);
      console.log('Paga días festivos:', configuracion.paga_dias_festivos);
    }

    return grupo;
  };

  // Función auxiliar para procesar día laboral
  const procesarDiaLaboral = (grupo, dia, recargoIndex) => {
    console.log(`\n  --- PROCESANDO DÍA LABORAL (Recargo ${recargoIndex + 1}) ---`);
    console.log(`  Fecha: ${dia.dia}`);
    console.log(`  Es festivo: ${dia.es_festivo}`);
    console.log(`  Es domingo: ${dia.es_domingo}`);
    console.log(`  Total horas: ${dia.total_horas}`);

    // Contar días especiales
    if (dia.es_festivo) {
      grupo.totales.total_dias_festivos++;
      console.log(`  ✓ Día festivo contado. Total festivos: ${grupo.totales.total_dias_festivos}`);
    }
    if (dia.es_domingo) {
      grupo.totales.total_dias_domingos++;
      console.log(`  ✓ Día domingo contado. Total domingos: ${grupo.totales.total_dias_domingos}`);
    }

    // Buscar si ya existe un día con la misma fecha
    const diaExistente = grupo.dias_laborales_unificados.find(d => d.dia === dia.dia);

    if (diaExistente) {
      console.log(`  >> Unificando con día existente`);
      // Sumar horas al día existente
      const camposHoras = ['hed', 'rn', 'hen', 'rd', 'hefd', 'hefn', 'total_horas'];
      camposHoras.forEach(campo => {
        const valorAnterior = diaExistente[campo] || 0;
        const valorNuevo = dia[campo] || 0;
        diaExistente[campo] = valorAnterior + valorNuevo;
        if (valorNuevo > 0) {
          console.log(`    ${campo}: ${valorAnterior} + ${valorNuevo} = ${diaExistente[campo]}`);
        }
      });
    } else {
      console.log(`  >> Agregando nuevo día`);
      // Agregar nuevo día con valores por defecto
      const nuevoDia = {
        ...dia,
        hed: dia.hed || 0,
        rn: dia.rn || 0,
        hen: dia.hen || 0,
        rd: dia.rd || 0,
        hefd: dia.hefd || 0,
        hefn: dia.hefn || 0
      };
      grupo.dias_laborales_unificados.push(nuevoDia);

      // Mostrar horas del nuevo día
      const camposConHoras = Object.entries(nuevoDia)
        .filter(([key, value]) => ['hed', 'rn', 'hen', 'rd', 'hefd', 'hefn'].includes(key) && value > 0)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      if (camposConHoras) {
        console.log(`    Horas: ${camposConHoras}`);
      }
    }
  };

  // Función auxiliar para calcular valor por hora con recargo
  const calcularValorRecargo = (valorBase, porcentaje, horas, esAdicional, esValorFijo = false, valorFijo = 0) => {
    console.log(`    --- CALCULANDO VALOR RECARGO ---`);
    console.log(`    Valor base por hora: ${valorBase}`);
    console.log(`    Horas: ${horas}`);
    console.log(`    Porcentaje: ${porcentaje}%`);
    console.log(`    Es adicional: ${esAdicional}`);
    console.log(`    Es valor fijo: ${esValorFijo}`);

    if (esValorFijo && valorFijo > 0) {
      console.log(`    >>> MODO VALOR FIJO <<<`);
      console.log(`    Valor fijo configurado: ${valorFijo}`);
      const valorFijoRedondeado = Number(valorFijo);
      console.log(`    Valor fijo redondeado: ${valorFijoRedondeado}`);
      return valorFijoRedondeado;
    }

    console.log(`    >>> MODO PORCENTAJE <<<`);

    let valorHoraConRecargo;
    let valorTotal;

    if (esAdicional) {
      console.log(`    -- Calculando como ADICIONAL --`);
      // MODO ADICIONAL: valor_hora * (1 + porcentaje/100)
      valorHoraConRecargo = valorBase * (1 + porcentaje / 100);
      console.log(`    Valor hora con recargo (antes de redondeo): ${valorHoraConRecargo}`);

      // Redondear el valor por hora
      valorHoraConRecargo = Number(valorHoraConRecargo);
      console.log(`    Valor hora con recargo (redondeado): ${valorHoraConRecargo}`);

      valorTotal = valorHoraConRecargo * horas;
      console.log(`    Valor total: ${valorHoraConRecargo} * ${horas} = ${valorTotal}`);
    } else {
      console.log(`    -- Calculando como MULTIPLICATIVO --`);
      // MODO MULTIPLICATIVO: valor_hora * (porcentaje/100)
      valorHoraConRecargo = valorBase * (porcentaje / 100);
      console.log(`    Valor hora con recargo (antes de redondeo): ${valorHoraConRecargo}`);

      // Redondear el valor por hora
      valorHoraConRecargo = Number(valorHoraConRecargo);
      console.log(`    Valor hora con recargo (redondeado): ${valorHoraConRecargo}`);

      valorTotal = valorHoraConRecargo * horas;
      console.log(`    Valor total: ${valorHoraConRecargo} * ${horas} = ${valorTotal}`);
    }

    // Redondear también el valor total
    valorTotal = Number(valorTotal);
    console.log(`    ✓ Resultado final (redondeado): ${valorTotal}`);
    return { valorTotal, valorHoraConRecargo };
  };

  // Función auxiliar para consolidar tipos de recargos
  const consolidarTipoRecargo = (grupo, tipo, diaIndex) => {
    console.log(`\n    >> CONSOLIDANDO TIPO DE RECARGO: ${tipo.codigo} - ${tipo.nombre}`);
    console.log(`       Día: ${diaIndex + 1}`);
    console.log(`       Porcentaje: ${tipo.porcentaje}%`);
    console.log(`       Horas: ${tipo.horas}`);
    console.log(`       Es adicional: ${tipo.adicional}`);

    const configSalarial = grupo.configuracion_salarial;
    const pagaDiasFestivos = configSalarial?.paga_dias_festivos || false;

    // Excluir recargos dominicales si la configuración paga días festivos
    if (pagaDiasFestivos && tipo.codigo === 'RD') {
      console.log(`       ⚠️ EXCLUIDO: La configuración paga días festivos, saltando RD`);
      return; // Saltar este tipo de recargo
    }

    const tipoExistente = grupo.tipos_recargos_consolidados.find(t => t.codigo === tipo.codigo);
    const valorHoraBase = grupo.valor_hora_base;
    const porcentaje = parseFloat(tipo.porcentaje) || 0;
    const horas = parseFloat(tipo.horas) || 0;
    const esAdicional = tipo.adicional || false;

    if (horas <= 0) {
      console.log(`       ⚠️ Sin horas válidas para ${tipo.codigo}. Saltando...`);
      return;
    }

    const resultado = calcularValorRecargo(valorHoraBase, porcentaje, horas, esAdicional);

    if (tipoExistente) {
      console.log(`       >> ACTUALIZANDO TIPO EXISTENTE`);
      console.log(`       Horas anteriores: ${tipoExistente.horas}`);

      // Sumar horas y recalcular total
      tipoExistente.horas += horas;
      console.log(`       Horas nuevas: ${tipoExistente.horas}`);

      // Recalcular el valor total con las nuevas horas
      const nuevoResultado = calcularValorRecargo(valorHoraBase, porcentaje, tipoExistente.horas, esAdicional);
      tipoExistente.valor_calculado = nuevoResultado.valorTotal;
      tipoExistente.valor_hora_con_recargo = nuevoResultado.valorHoraConRecargo;
      tipoExistente.es_adicional = esAdicional;

      console.log(`       ✓ Valor recalculado: ${tipoExistente.valor_calculado}`);
    } else {
      console.log(`       >> CREANDO NUEVO TIPO DE RECARGO`);
      // Crear nuevo tipo de recargo
      const nuevoTipo = {
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        porcentaje: porcentaje,
        horas: horas,
        valor_calculado: resultado.valorTotal,
        valor_hora_base: valorHoraBase,
        valor_hora_con_recargo: resultado.valorHoraConRecargo,
        es_adicional: esAdicional
      };

      grupo.tipos_recargos_consolidados.push(nuevoTipo);
      console.log(`       ✓ Tipo agregado: ${nuevoTipo.valor_calculado}`);
    }
  };

  // Función auxiliar para agregar bono festivo
  const agregarBonoFestivo = (grupo) => {
    const configSalarial = grupo.configuracion_salarial;
    const totalDiasEspeciales = grupo.totales.total_dias_festivos + grupo.totales.total_dias_domingos;

    if (!configSalarial?.paga_dias_festivos || totalDiasEspeciales === 0) {
      return;
    }

    console.log(`\n--- AGREGANDO BONO FESTIVO ---`);
    console.log(`Total días festivos: ${grupo.totales.total_dias_festivos}`);
    console.log(`Total días domingos: ${grupo.totales.total_dias_domingos}`);
    console.log(`Total días especiales: ${totalDiasEspeciales}`);

    const salarioBasico = parseFloat(configSalarial.salario_basico) || 0;
    const porcentajeFestivos = parseFloat(configSalarial.porcentaje_festivos) || 0;

    console.log(`Salario básico: ${salarioBasico}`);
    console.log(`Porcentaje festivos: ${porcentajeFestivos}%`);

    const valorDiarioBase = salarioBasico / 30;
    console.log(`Valor diario base (salario/30): ${valorDiarioBase}`);

    // FÓRMULA: valorDiarioBase * (porcentaje/100)
    const valorDiarioConRecargoTemp = valorDiarioBase * (porcentajeFestivos / 100);
    console.log(`Valor diario con recargo (antes de redondeo): ${valorDiarioConRecargoTemp}`);

    // Redondear el valor diario con recargo
    const valorDiarioConRecargo = Number(valorDiarioConRecargoTemp);
    console.log(`Valor diario con recargo (redondeado): ${valorDiarioConRecargo}`);

    const valorTotalDiasFestivos = totalDiasEspeciales * valorDiarioConRecargo;
    console.log(`Valor total: ${totalDiasEspeciales} * ${valorDiarioConRecargo} = ${valorTotalDiasFestivos}`);

    grupo.tipos_recargos_consolidados.push({
      codigo: 'BONO_FESTIVO',
      nombre: 'Bono Días Festivos/Dominicales',
      porcentaje: porcentajeFestivos,
      horas: totalDiasEspeciales,
      valor_calculado: valorTotalDiasFestivos,
      valor_hora_base: valorDiarioBase,
      valor_hora_con_recargo: valorDiarioConRecargo,
      es_adicional: false,
      es_bono_festivo: true
    });

    console.log(`✓ Bono festivo agregado: ${valorTotalDiasFestivos}`);
  };

  // Función auxiliar para calcular totales finales
  const calcularTotalesFinales = (grupo) => {
    console.log(`\n--- CALCULANDO TOTALES FINALES ---`);
    console.log(`Grupo: ${grupo.empresa.nombre} - ${grupo.vehiculo.placa}`);

    const configSalarial = grupo.configuracion_salarial;
    const pagaDiasFestivos = configSalarial?.paga_dias_festivos || false;

    // Calcular totales de horas por tipo
    const campos = ['hed', 'rn', 'hen', 'hefd', 'hefn'];
    campos.forEach(campo => {
      const total = grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia[campo] || 0), 0);
      grupo.totales[`total_${campo}`] = total;
      if (total > 0) {
        console.log(`Total ${campo}: ${total} horas`);
      }
    });

    // Solo sumar RD si NO se pagan días festivos
    grupo.totales.total_rd = pagaDiasFestivos ? 0 :
      grupo.dias_laborales_unificados.reduce((sum, dia) => sum + (dia.rd || 0), 0);

    if (grupo.totales.total_rd > 0) {
      console.log(`Total rd: ${grupo.totales.total_rd} horas`);
    } else if (pagaDiasFestivos) {
      console.log(`Total rd: 0 horas (excluido por configuración de días festivos)`);
    }

    // Agregar bono festivo si aplica
    agregarBonoFestivo(grupo);

    // Calcular valor total
    const valorAnterior = grupo.totales.valor_total;
    grupo.totales.valor_total = grupo.tipos_recargos_consolidados
      .reduce((sum, tipo) => sum + tipo.valor_calculado, 0);

    console.log(`\n--- RESUMEN DE RECARGOS ---`);
    grupo.tipos_recargos_consolidados.forEach((tipo, index) => {
      console.log(`${index + 1}. ${tipo.codigo}: ${tipo.horas}h × $${tipo.valor_hora_con_recargo.toFixed(2)} = $${tipo.valor_calculado.toFixed(2)}`);
    });

    console.log(`\n=== VALOR TOTAL DEL GRUPO: $${grupo.totales.valor_total.toFixed(2)} ===`);

    // Ordenar resultados
    grupo.dias_laborales_unificados.sort((a, b) => new Date(a.dia) - new Date(b.dia));
    grupo.tipos_recargos_consolidados.sort((a, b) => {
      if (a.es_bono_festivo) return 1;
      if (b.es_bono_festivo) return -1;
      return a.porcentaje - b.porcentaje;
    });
  };

  // PROCESO PRINCIPAL
  console.log('\n--- INICIANDO PROCESAMIENTO ---');

  recargos.forEach((recargo, recargoIndex) => {
    console.log(`\n=== PROCESANDO RECARGO ${recargoIndex + 1}/${recargos.length} ===`);
    console.log(`ID: ${recargo.id}`);
    console.log(`Empresa: ${recargo.empresa.nombre}`);
    console.log(`Vehículo: ${recargo.vehiculo.placa}`);
    console.log(`Total días: ${recargo.total_dias}`);
    console.log(`Total horas: ${recargo.total_horas}`);

    const clave = crearClave(recargo);

    // Crear grupo si no existe
    if (!grupos[clave]) {
      grupos[clave] = inicializarGrupo(recargo);
    }

    // Agregar recargo al grupo
    grupos[clave].recargos.push(recargo);

    // Acumular totales básicos
    grupos[clave].totales.total_dias += recargo.total_dias || 0;
    grupos[clave].totales.total_horas += recargo.total_horas || 0;

    // Procesar días laborales
    if (recargo.dias_laborales && recargo.dias_laborales.length > 0) {
      console.log(`\n--- PROCESANDO ${recargo.dias_laborales.length} DÍAS LABORALES ---`);

      recargo.dias_laborales.forEach((dia, diaIndex) => {
        procesarDiaLaboral(grupos[clave], dia, recargoIndex);

        // Procesar tipos de recargos del día
        if (dia.tipos_recargos && dia.tipos_recargos.length > 0) {
          console.log(`\n  --- PROCESANDO ${dia.tipos_recargos.length} TIPOS DE RECARGOS DEL DÍA ---`);
          dia.tipos_recargos.forEach(tipo => {
            consolidarTipoRecargo(grupos[clave], tipo, diaIndex);
          });
        }
      });
    } else {
      console.log(`⚠️ Sin días laborales para procesar`);
    }
  });

  console.log('\n=== CALCULANDO TOTALES FINALES PARA TODOS LOS GRUPOS ===');

  // Calcular totales finales para cada grupo
  Object.values(grupos).forEach((grupo, index) => {
    console.log(`\n--- GRUPO ${index + 1}/${Object.keys(grupos).length} ---`);
    calcularTotalesFinales(grupo);
  });

  const resultado = Object.values(grupos);
  console.log(`\n=== AGRUPACIÓN COMPLETADA ===`);
  console.log(`Total de grupos generados: ${resultado.length}`);
  console.log(`==============================\n`);

  return resultado;
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
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
  RecargoPlanilla,
  ConfiguracionSalario,
  Empresa,
  Vehiculo,
  RecargoDetallado,
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
import { DiaLaboral, TipoRecargo } from "@/types";

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
  detailCol1: {
    // Fecha
    width: "11%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
  },
  detailCol2: {
    // Horario
    width: "13%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 7,
    textAlign: "center",
  },
  detailCol3: {
    // Total Horas
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol4: {
    // Tipo día
    width: "10%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 7,
    textAlign: "center",
  },
  detailCol5: {
    // HED
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol6: {
    // HEN
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol7: {
    // HEFD
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol8: {
    // HEFN
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol9: {
    // RN
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol10: {
    // RD
    width: "8%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    fontSize: 8,
    textAlign: "center",
  },
  detailCol11: {
    // Estado/Observaciones
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
    fontSize: 9,
    textAlign: "center",
    padding: 1,
  },
});

type LiquidacionPDFProps = {
  item: Liquidacion | null;
  totalRecargosParex: number;
  recargosParex: Recargo[];
  firmas: any[];
  isAdmin: boolean;
};

type CampoTotal = "hed" | "rn" | "hen" | "hefd" | "hefn";

interface Totales {
  total_dias: number;
  total_horas: number;
  total_hed: number;
  total_rn: number;
  total_hen: number;
  total_rd: number;
  total_hefd: number;
  total_hefn: number;
  valor_total: number;
  total_dias_festivos: number;
  total_dias_domingos: number;
}

interface GrupoRecargo {
  vehiculo: Vehiculo;
  mes: number;
  año: number;
  empresa: Empresa;
  recargos: RecargoPlanilla[];
  configuracion_salarial: ConfiguracionSalario;
  valor_hora_base: number;
  totales: Totales;
  dias_laborales_unificados: DiaLaboral[];
  tipos_recargos_consolidados: TipoRecargoConsolidado[];
}

interface TipoRecargoConsolidado extends TipoRecargo {
  es_bono_festivo?: boolean;
}

const safeValue = (value: any, defaultValue = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

const calcularAlturaGrupo = (grupo: GrupoPaginas) => {
  const alturaBase = 120; // Header + empresa info
  const alturaDiasPorFila = 25; // Aproximado por fila de día laboral
  const alturaTablaRecargos = 60; // Header + totales de tabla de recargos
  const alturaRecargosPorFila = 22; // Por cada tipo de recargo
  const alturaFooter = 40; // Información adicional

  const diasConRecargos =
    grupo.dias_laborales_unificados?.filter((dia) => {
      return dia;
    }).length || 0;

  const tiposRecargos = grupo.tipos_recargos_consolidados?.length || 0;

  return (
    alturaBase +
    diasConRecargos * alturaDiasPorFila +
    alturaTablaRecargos +
    tiposRecargos * alturaRecargosPorFila +
    alturaFooter
  );
};

// Función para agrupar elementos por páginas
const agruparEnPaginas = (
  recargosAgrupados: GrupoRecargo[],
): GrupoRecargo[][] => {
  const paginas: GrupoRecargo[][] = [];
  let paginaActual: GrupoRecargo[] = [];
  let alturaAcumulada = 80; // Margen para título
  const alturaMaximaPagina = 700; // Altura disponible en página A4

  recargosAgrupados.forEach((grupo) => {
    const alturaGrupo = calcularAlturaGrupo(grupo);

    // Si agregar este grupo excede la altura de página
    if (
      alturaAcumulada + alturaGrupo > alturaMaximaPagina &&
      paginaActual.length > 0
    ) {
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

type GrupoPaginas = GrupoRecargo;

// Actualizar el tipo PaginasRecargos para ser más específico
type PaginasRecargos = {
  grupos: GrupoRecargo[];
  numeroPagina: number;
  totalPaginas: number;
  isAdmin: boolean;
};

// Componente de página de recargos
const PaginaRecargos = ({
  grupos,
  numeroPagina,
  totalPaginas,
  isAdmin,
}: PaginasRecargos) => (
  <Page size="A4" style={styles.page} wrap={false}>
    {/* Título con número de página */}
    <Text style={[styles.subHeaderCenter, { marginBottom: 15 }]}>
      {totalPaginas > 1 && numeroPagina === 2 && "HORAS EXTRAS Y RECARGOS"}
    </Text>

    {/* Avisos si hay días especiales */}
    {(() => {
      // Verificar en todos los grupos si hay días especiales
      const hayDiasFestivosODomingos = grupos.some((grupo) =>
        grupo.dias_laborales_unificados?.some(
          (dia) => dia && (dia.es_festivo === true || dia.es_domingo === true),
        ),
      );

      const hayDiasDisponibles = grupos.some((grupo) =>
        grupo.dias_laborales_unificados?.some(
          (dia) => dia && dia.disponibilidad === true,
        ),
      );

      return (
        <View>
          {hayDiasFestivosODomingos && (
            <Text
              style={{
                fontSize: 9,
                color: "#92400E",
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Aviso: Los días dominicales o festivos se resaltan en naranja.
            </Text>
          )}

          {hayDiasDisponibles && (
            <Text
              style={{
                fontSize: 9,
                color: "#B91C1C",
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Aviso: Los días marcados como disponibilidad no son reconocidos.
              Se muestran en rojo y no suman a los totales.
            </Text>
          )}
        </View>
      );
    })()}

    {grupos.map((grupo, index: number) => {
      const valorHoraBase =
        grupo.configuracion_salarial.salario_basico /
        grupo.configuracion_salarial.horas_mensuales_base;

      const valorSeguridadSocial = Math.round(
        (grupo.configuracion_salarial?.seguridad_social *
          grupo.totales.valor_total) /
          100,
      );
      const valorPrestacionesSociales = Math.round(
        (grupo.configuracion_salarial?.prestaciones_sociales *
          grupo.totales.valor_total) /
          100,
      );
      const valorAdministracion = Math.round(
        (grupo.configuracion_salarial?.administracion *
          (grupo.totales.valor_total +
            valorSeguridadSocial +
            valorPrestacionesSociales)) /
          100,
      );

      const total = Math.round(
        valorSeguridadSocial +
          valorPrestacionesSociales +
          valorAdministracion +
          grupo.totales.valor_total,
      );

      return (
        <View
          key={`${grupo.vehiculo.placa}-${grupo.mes}-${grupo.año}-${grupo.empresa.nit}`}
          style={{
            border: "1px solid #ddd",
            marginBottom: 15,
          }}
          wrap={false} // No permitir wrap dentro del grupo
        >
          {/* Header del vehículo */}
          <View
            style={{
              backgroundColor: "#2E8B57",
              padding: 8,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 10 }}>
              VEHÍCULO: {grupo.vehiculo.placa}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 10,
                textTransform: "uppercase",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              MES:{" "}
              {new Date(grupo.año, grupo.mes - 1).toLocaleString("es-ES", {
                month: "long",
              })}
            </Text>
          </View>

          {/* Empresa info compacta */}
          <View
            style={{
              backgroundColor: "#f9f9f9",
              padding: 5,
              fontSize: 10,
              borderBottom: "1px solid #E0E0E0",
            }}
          >
            <Text style={{ fontWeight: "semibold" }}>
              EMPRESA:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {grupo.empresa.nombre}
              </Text>
            </Text>
            <Text style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
              Valor/Hora Base: ${Math.round(valorHoraBase).toLocaleString()}
              {grupo.configuracion_salarial?.empresa &&
                ` (${grupo.empresa.nombre})`}
            </Text>
          </View>

          {/* Tabla de días laborales */}
          <View style={styles.tableNoBorder}>
            {/* Header de tabla */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F3F8F5",
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                DÍA
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                HORARIO
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                HORAS
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                HED
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                RN
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                HEN
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                RD
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                    borderRightWidth: 1,
                    borderRightColor: "#E0E0E0",
                  },
                ]}
              >
                HEFD
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  {
                    flex: 1,
                    padding: 4,
                    textAlign: "center",
                  },
                ]}
              >
                HEFN
              </Text>
            </View>

            {/* Filas con datos unificados */}
            {grupo.dias_laborales_unificados?.map(
              (dia: DiaLaboral, diaIndex: number) => (
                <View
                  key={`${dia.id}-${index}-${diaIndex}`}
                  style={{
                    flexDirection: "row",
                    backgroundColor: (() => {
                      const colorFondoBase =
                        diaIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
                      const esDisponible = dia.disponibilidad;
                      const esEspecial = dia.es_festivo || dia.es_domingo;

                      // Rojo claro para disponibilidad, Naranja claro para dominical/festivo
                      return esDisponible
                        ? "#FEE2E2"
                        : esEspecial
                          ? "#FEF3C7"
                          : colorFondoBase;
                    })(),
                  }}
                >
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#eee",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {dia.dia}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {formatearHora(dia.hora_inicio)}-
                    {formatearHora(dia.hora_fin)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {dia.total_horas}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {(dia.hed || 0) !== 0 ? `${dia.hed}` : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {(dia.rn || 0) !== 0 ? `${dia.rn}` : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {(dia.hen || 0) !== 0 ? `${dia.hen}` : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {(dia.rd || 0) !== 0 ? `${dia.rd}` : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {(dia.hefd || 0) !== 0 ? `${dia.hefd}` : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCompact,
                      {
                        flex: 1,
                        textAlign: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        paddingVertical: 3,
                        color: (() => {
                          const esDisponible = dia.disponibilidad;
                          const esEspecial = dia.es_festivo || dia.es_domingo;

                          return esDisponible
                            ? "#B91C1C"
                            : esEspecial
                              ? "#92400E"
                              : "#333333";
                        })(),
                      },
                    ]}
                  >
                    {(dia.hefn || 0) !== 0 ? `${dia.hefn}` : "-"}
                  </Text>
                </View>
              ),
            )}
          </View>

          {/* Totales de días */}
          <View style={{ backgroundColor: "#2E8B5715", padding: 4 }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 11,
                color: "#2E8B57",
                textAlign: "center",
              }}
            >
              TOTALES CONSOLIDADOS
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_dias}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              -
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_horas}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_hed}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_rn}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_hen}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_rd}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                borderRightWidth: 1,
                borderRightColor: "#E0E0E0",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_hefd}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: "center",
                paddingVertical: 4,
              }}
            >
              {grupo.totales.total_hefn}
            </Text>
          </View>

          {/* Tabla de tipos de recargos */}
          {grupo.tipos_recargos_consolidados.length > 0 &&
            (() => {
              // Calcular anchos basándose en 9 columnas totales (como la tabla principal)
              const anchoBase = 100 / 9; // ~11.11%
              const col1 = anchoBase * 4.025; // TIPO RECARGO (4 columnas) ~44.44%
              const col2 = anchoBase; // % ~11.11%
              const col3 = anchoBase; // V/BASE ~11.11%
              const col4 = anchoBase; // V/+ % ~11.11%
              const col5 = anchoBase; // CANTIDAD ~11.11%
              const col6 = anchoBase; // TOTAL ~11.11%

              return (
                <View style={{ borderTop: "1px solid #ddd" }}>
                  {/* Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#2E8B5715",
                      borderBottomWidth: 1,
                      borderBottomColor: "#E0E0E0",
                    }}
                  >
                    <View
                      style={{
                        width: `${col1}%`,
                        paddingHorizontal: 3,
                        paddingVertical: 6,
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: "#2E8B57",
                          fontSize: 9,
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        TIPO RECARGO
                      </Text>
                    </View>
                    <View
                      style={{
                        width: `${col2}%`,
                        paddingHorizontal: 3,
                        paddingVertical: 6,
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: "#2E8B57",
                          fontSize: 9,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        %
                      </Text>
                    </View>
                    <View
                      style={{
                        width: `${col3}%`,
                        paddingHorizontal: 3,
                        paddingVertical: 6,
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: "#2E8B57",
                          fontSize: 9,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        V/BASE
                      </Text>
                    </View>
                    <View
                      style={{
                        width: `${col4}%`,
                        paddingHorizontal: 3,
                        paddingVertical: 6,
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: "#2E8B57",
                          fontSize: 9,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        V/+ %
                      </Text>
                    </View>
                    <View
                      style={{
                        width: `${col5}%`,
                        paddingHorizontal: 3,
                        paddingVertical: 6,
                        borderRightWidth: 1,
                        borderRightColor: "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: "#2E8B57",
                          fontSize: 9,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        CANTIDAD
                      </Text>
                    </View>
                    <View
                      style={{
                        width: `${col6}%`,
                        paddingHorizontal: 3,
                        paddingVertical: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#2E8B57",
                          fontSize: 9,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        TOTAL
                      </Text>
                    </View>
                  </View>

                  {grupo.tipos_recargos_consolidados.map(
                    (tipo: TipoRecargo, tipoIndex: number) => {
                      return (
                        <View
                          key={tipo.codigo}
                          style={{
                            flexDirection: "row",
                            borderBottom:
                              tipoIndex !==
                              grupo.tipos_recargos_consolidados.length - 1
                                ? "1px solid #eee"
                                : "none",
                            fontSize: 10,
                          }}
                        >
                          <View
                            style={{
                              width: `${col1}%`,
                              paddingHorizontal: 3,
                              borderRightWidth: 1,
                              borderRightColor: "#E0E0E0",
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ fontSize: 10 }}>
                              {tipo.nombre.toUpperCase()}
                              {tipo.codigo !== "BONO_FESTIVO" && (
                                <Text style={{ color: "#007AFF" }}>
                                  {" "}
                                  - {tipo.codigo}
                                </Text>
                              )}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: `${col2}%`,
                              paddingHorizontal: 3,
                              borderRightWidth: 1,
                              borderRightColor: "#E0E0E0",
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ textAlign: "center", fontSize: 10 }}>
                              {tipo.porcentaje}%
                            </Text>
                          </View>
                          <View
                            style={{
                              width: `${col3}%`,
                              paddingHorizontal: 3,
                              borderRightWidth: 1,
                              borderRightColor: "#E0E0E0",
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 10,
                                color: "#666",
                              }}
                            >
                              $
                              {Math.round(
                                tipo.valor_hora_base,
                              ).toLocaleString()}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: `${col4}%`,
                              paddingHorizontal: 3,
                              borderRightWidth: 1,
                              borderRightColor: "#E0E0E0",
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 10,
                                fontWeight: "bold",
                                color: "#2E8B57",
                              }}
                            >
                              $
                              {Math.round(
                                tipo.valor_hora_con_recargo,
                              ).toLocaleString()}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: `${col5}%`,
                              paddingHorizontal: 3,
                              borderRightWidth: 1,
                              borderRightColor: "#E0E0E0",
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ textAlign: "center", fontSize: 10 }}>
                              {tipo.horas}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: `${col6}%`,
                              paddingHorizontal: 3,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 10,
                                fontWeight: "bold",
                              }}
                            >
                              $
                              {Math.round(
                                tipo.valor_calculado,
                              ).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  )}

                  {/* SUBTOTAL */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 4,
                      backgroundColor: "#2E8B57",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {isAdmin ? "SUBTOTAL" : "TOTAL"}
                    </Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      ${Math.round(grupo.totales.valor_total).toLocaleString()}
                    </Text>
                  </View>

                  {isAdmin && (
                    <View>
                      <View
                        style={{
                          fontSize: 10,
                          flexDirection: "row",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Text
                          style={{
                            width: "45%",
                            padding: 4,
                            borderRightWidth: 1,
                            borderRightColor: "#E0E0E0",
                          }}
                        >
                          SEGURIDAD SOCIAL
                        </Text>
                        <Text
                          style={{
                            width: "10%",
                            padding: 4,
                            borderRightWidth: 1,
                            borderRightColor: "#E0E0E0",
                            textAlign: "center",
                          }}
                        >
                          {grupo.configuracion_salarial?.seguridad_social}%
                        </Text>
                        <Text
                          style={{
                            width: "45%",
                            padding: 4,
                            textAlign: "right",
                          }}
                        >
                          ${valorSeguridadSocial.toLocaleString()}
                        </Text>
                      </View>

                      <View
                        style={{
                          fontSize: 10,
                          flexDirection: "row",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Text
                          style={{
                            width: "45%",
                            padding: 4,
                            borderRightWidth: 1,
                            borderRightColor: "#E0E0E0",
                          }}
                        >
                          PRESTACIONES SOCIALES
                        </Text>
                        <Text
                          style={{
                            width: "10%",
                            padding: 4,
                            textAlign: "center",
                            borderRightWidth: 1,
                            borderRightColor: "#E0E0E0",
                          }}
                        >
                          {grupo.configuracion_salarial?.prestaciones_sociales}%
                        </Text>
                        <Text
                          style={{
                            width: "45%",
                            padding: 4,
                            textAlign: "right",
                          }}
                        >
                          ${valorPrestacionesSociales.toLocaleString()}
                        </Text>
                      </View>

                      <View
                        style={{
                          fontSize: 10,
                          flexDirection: "row",
                          borderBottomWidth: 1,
                          borderBottomColor: "#E0E0E0",
                        }}
                      >
                        <Text
                          style={{
                            width: "45%",
                            padding: 4,
                            borderRightWidth: 1,
                            borderRightColor: "#E0E0E0",
                          }}
                        >
                          ADMINISTRACIÓN
                        </Text>
                        <Text
                          style={{
                            width: "10%",
                            padding: 4,
                            textAlign: "center",
                            borderRightWidth: 1,
                            borderRightColor: "#E0E0E0",
                          }}
                        >
                          {grupo.configuracion_salarial?.administracion}%
                        </Text>
                        <Text
                          style={{
                            width: "45%",
                            padding: 4,
                            textAlign: "right",
                          }}
                        >
                          ${valorAdministracion.toLocaleString()}
                        </Text>
                      </View>

                      {/* TOTAL */}
                      <View
                        style={{
                          flexDirection: "row",
                          padding: 4,
                          backgroundColor: "#2E8B57",
                        }}
                      >
                        <View style={{ width: "85%", paddingHorizontal: 3 }}>
                          <Text
                            style={{
                              color: "white",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          >
                            TOTAL
                          </Text>
                        </View>
                        <View style={{ width: "15%", paddingHorizontal: 3 }}>
                          <Text
                            style={{
                              color: "white",
                              fontSize: 10,
                              textAlign: "right",
                              fontWeight: "bold",
                            }}
                          >
                            ${total.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })()}
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

const agruparRecargos = (
  recargo: RecargoPlanilla,
  configuraciones_salario: ConfiguracionSalario[],
): GrupoRecargo[] => {
  const grupos: any = {};

  // Función auxiliar para crear clave única
  const crearClave = (recargo: RecargoDetallado) =>
    `${recargo.vehiculo.placa}-${recargo.mes}-${recargo.año}-${recargo.empresa.nit}`;

  // Función auxiliar para obtener configuración salarial
  const obtenerConfiguracion = (empresaId: string, sede?: string) => {
    if (!configuraciones_salario) {
      console.warn("No hay configuraciones de salario disponibles");

      return null;
    }

    // PRIORIDAD 1: Buscar configuración específica de la empresa
    const configEmpresa = configuraciones_salario.find(
      (config: ConfiguracionSalario) =>
        config.empresa_id === empresaId &&
        config.activo === true &&
        config.sede === null, // Sin sede específica
    );

    if (configEmpresa) {
      return configEmpresa;
    }

    // PRIORIDAD 2: Buscar configuración por sede (si se proporciona)
    if (sede) {
      const configSede = configuraciones_salario.find(
        (config: ConfiguracionSalario) =>
          config.empresa_id === null &&
          config.activo === true &&
          config.sede?.toLowerCase() === sede.toLowerCase(),
      );

      if (configSede) {
        return configSede;
      }
    }

    // PRIORIDAD 3: Buscar configuración base del sistema
    const configBase = configuraciones_salario.find(
      (config: ConfiguracionSalario) =>
        config.empresa_id === null &&
        config.activo === true &&
        config.sede === null,
    );

    if (configBase) {
      return configBase;
    }

    console.warn("No se encontró ninguna configuración aplicable");

    return null;
  };

  // Función auxiliar para inicializar grupo
  const inicializarGrupo = (recargo: RecargoDetallado) => {
    const configuracion = obtenerConfiguracion(
      recargo.empresa.id,
      recargo.conductor.sede_trabajo,
    );

    if (!configuracion) return;

    const grupo = {
      vehiculo: recargo.vehiculo,
      mes: recargo.mes,
      año: recargo.año,
      empresa: recargo.empresa,
      recargos: [],
      configuracion_salarial: configuracion,
      valor_hora_base:
        configuracion.salario_basico / configuracion.horas_mensuales_base || 0,
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
        total_dias_domingos: 0,
      },
      dias_laborales_unificados: [],
      tipos_recargos_consolidados: [],
    };

    return grupo;
  };

  // Función auxiliar para procesar día laboral
  const procesarDiaLaboral = (grupo: GrupoRecargo, dia: DiaLaboral) => {
    // Contar días especiales
    if (dia.es_festivo) {
      grupo.totales.total_dias_festivos++;
    }
    if (dia.es_domingo) {
      grupo.totales.total_dias_domingos++;
    }

    // Agregar nuevo día con valores por defecto
    const nuevoDia: DiaLaboral = {
      ...dia,
      hed: dia.hed || 0,
      rn: dia.rn || 0,
      hen: dia.hen || 0,
      rd: dia.rd || 0,
      hefd: dia.hefd || 0,
      hefn: dia.hefn || 0,
    };

    grupo.dias_laborales_unificados.push(nuevoDia);
  };

  interface ValorRecargo {
    valorTotal: number;
    valorHoraConRecargo: number;
  }

  // Función auxiliar para calcular valor por hora con recargo
  interface ValorRecargo {
    valorTotal: number;
    valorHoraConRecargo: number;
  }

  // Función auxiliar para calcular valor por hora con recargo
  const calcularValorRecargo = (
    valorBase: number,
    porcentaje: number,
    horas: number,
    esAdicional: boolean,
    esValorFijo = false,
    valorFijo = 0,
  ): ValorRecargo => {
    if (esValorFijo && valorFijo > 0) {
      const valorFijoRedondeado = Number(valorFijo);
      const valorHoraConRecargo = valorFijoRedondeado / horas; // Calcular valor por hora

      return {
        valorTotal: valorFijoRedondeado,
        valorHoraConRecargo: Number(valorHoraConRecargo),
      };
    }

    let valorHoraConRecargo;
    let valorTotal;

    if (esAdicional) {
      // MODO ADICIONAL: valor_hora * (1 + porcentaje/100)
      valorHoraConRecargo = valorBase * (1 + porcentaje / 100);

      // Redondear el valor por hora
      valorHoraConRecargo = Number(valorHoraConRecargo);
      valorTotal = valorHoraConRecargo * horas;
    } else {
      // MODO MULTIPLICATIVO: valor_hora * (porcentaje/100)
      valorHoraConRecargo = valorBase * (porcentaje / 100);

      // Redondear el valor por hora
      valorHoraConRecargo = Number(valorHoraConRecargo);
      valorTotal = valorHoraConRecargo * horas;
    }

    // Redondear también el valor total
    valorTotal = Number(valorTotal);

    return { valorTotal, valorHoraConRecargo };
  };

  const consolidarTipoRecargo = (
    grupo: GrupoRecargo,
    tipo: TipoRecargo,
    diaLaboral: DiaLaboral, // Agregar el día laboral como parámetro
  ) => {
    const configSalarial = grupo.configuracion_salarial;
    const pagaDiasFestivos = configSalarial?.paga_dias_festivos || false;

    // EXCLUIR si el día es de disponibilidad
    if (diaLaboral.disponibilidad) {
      return; // No procesar este recargo
    }

    // Excluir recargos dominicales si la configuración paga días festivos
    if (pagaDiasFestivos && tipo.codigo === "RD") {
      return; // Saltar este tipo de recargo
    }

    const tipoExistente = grupo.tipos_recargos_consolidados.find(
      (t: TipoRecargoConsolidado) => t.codigo === tipo.codigo,
    );

    const valorHoraBase = grupo.valor_hora_base;
    const porcentaje = tipo.porcentaje || 0;
    const horas = tipo.horas || 0;
    const esAdicional = tipo.adicional || false;

    const resultado = calcularValorRecargo(
      valorHoraBase,
      porcentaje,
      horas,
      esAdicional,
    );

    if (tipoExistente) {
      // Sumar horas y recalcular total
      tipoExistente.horas += horas;

      // Recalcular el valor total con las nuevas horas
      const nuevoResultado = calcularValorRecargo(
        valorHoraBase,
        porcentaje,
        tipoExistente.horas,
        esAdicional,
      );

      tipoExistente.valor_calculado = nuevoResultado.valorTotal;
      tipoExistente.valor_hora_con_recargo = nuevoResultado.valorHoraConRecargo;
      tipoExistente.adicional = esAdicional;
    } else {
      // Crear nuevo tipo de recargo
      const nuevoTipo: TipoRecargoConsolidado = {
        ...tipo, // Spread todas las propiedades del tipo original
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        porcentaje: porcentaje,
        horas: horas,
        valor_calculado: resultado.valorTotal,
        valor_hora_base: valorHoraBase,
        valor_hora_con_recargo: resultado.valorHoraConRecargo,
        adicional: esAdicional,
      };

      grupo.tipos_recargos_consolidados.push(nuevoTipo);
    }
  };

  // Función auxiliar para agregar bono festivo
  const agregarBonoFestivo = (grupo: GrupoRecargo) => {
    const configSalarial = grupo.configuracion_salarial;
    const totalDiasEspeciales =
      grupo.totales.total_dias_festivos + grupo.totales.total_dias_domingos;

    if (!configSalarial?.paga_dias_festivos || totalDiasEspeciales === 0) {
      return;
    }

    const salarioBasico =
      parseFloat(configSalarial.salario_basico.toString()) || 0;
    const porcentajeFestivos =
      parseFloat(configSalarial.porcentaje_festivos?.toString() || "0") || 0;

    const valorDiarioBase = salarioBasico / 30;

    // FÓRMULA: valorDiarioBase * (porcentaje/100)
    const valorDiarioConRecargoTemp =
      valorDiarioBase * (porcentajeFestivos / 100);

    // Redondear el valor diario con recargo
    const valorDiarioConRecargo = Number(valorDiarioConRecargoTemp);

    const valorTotalDiasFestivos = totalDiasEspeciales * valorDiarioConRecargo;

    const bonoFestivo: TipoRecargoConsolidado = {
      id: `bono_festivo_${grupo.empresa.nit}_${grupo.mes}_${grupo.año}`,
      codigo: "BONO_FESTIVO",
      nombre: "Bono Días Festivos/Dominicales",
      descripcion: "Bono por días festivos y dominicales trabajados",
      subcategoria: "bonos",
      porcentaje: porcentajeFestivos,
      adicional: false,
      es_valor_fijo: false,
      valor_fijo: null,
      aplica_festivos: true,
      aplica_domingos: true,
      aplica_nocturno: null,
      aplica_diurno: null,
      orden_calculo: 999,
      es_hora_extra: false,
      requiere_horas_extras: false,
      limite_horas_diarias: null,
      activo: true,
      vigencia_desde: new Date().toISOString(),
      vigencia_hasta: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      horas: totalDiasEspeciales,
      valor_hora_base: valorDiarioBase,
      valor_hora_con_recargo: valorDiarioConRecargo,
      valor_calculado: valorTotalDiasFestivos,
      es_bono_festivo: true,
    };

    grupo.tipos_recargos_consolidados.push(bonoFestivo);
  };

  // Función auxiliar para calcular totales finales
  const calcularTotalesFinales = (grupo: GrupoRecargo) => {
    const configSalarial = grupo.configuracion_salarial;
    const pagaDiasFestivos = configSalarial?.paga_dias_festivos || false;

    // Calcular totales de horas por tipo
    const campos: CampoTotal[] = ["hed", "rn", "hen", "hefd", "hefn"];

    campos.forEach((campo) => {
      const total = grupo.dias_laborales_unificados.reduce(
        (sum: number, dia: DiaLaboral) => sum + (dia[campo] || 0),
        0,
      );

      // Usar key assertion para acceso dinámico a propiedades
      (grupo.totales as any)[`total_${campo}`] = total;
    });

    // Solo sumar RD si NO se pagan días festivos
    grupo.totales.total_rd = pagaDiasFestivos
      ? 0
      : grupo.dias_laborales_unificados.reduce(
          (sum: number, dia: DiaLaboral) => sum + (dia.rd || 0),
          0,
        );

    // Agregar bono festivo si aplica
    agregarBonoFestivo(grupo);

    // Calcular valor total
    grupo.totales.valor_total = grupo.tipos_recargos_consolidados.reduce(
      (sum: number, tipo: TipoRecargoConsolidado) => sum + tipo.valor_calculado,
      0,
    );

    // Ordenar resultados
    grupo.dias_laborales_unificados.sort(
      (a, b) => new Date(a.dia).getTime() - new Date(b.dia).getTime(),
    );

    grupo.tipos_recargos_consolidados.sort((a, b) => {
      if (a.es_bono_festivo) return 1;
      if (b.es_bono_festivo) return -1;

      return a.porcentaje - b.porcentaje;
    });
  };

  recargo.recargos.forEach((detalles: RecargoDetallado) => {
    const clave = crearClave(detalles);

    // Crear grupo si no existe
    if (!grupos[clave]) {
      grupos[clave] = inicializarGrupo(detalles);
    }

    // Agregar detalles al grupo
    grupos[clave].recargos.push(detalles);

    // Acumular totales básicos
    grupos[clave].totales.total_dias += detalles.total_dias || 0;
    grupos[clave].totales.total_horas += detalles.total_horas || 0;

    // Procesar días laborales
    if (detalles.dias_laborales && detalles.dias_laborales.length > 0) {
      detalles.dias_laborales.forEach((dia: DiaLaboral) => {
        procesarDiaLaboral(grupos[clave], dia);

        console.log(grupos[clave]);

        // Procesar tipos de recargos del día
        if (dia.tipos_recargos && dia.tipos_recargos.length > 0) {
          dia.tipos_recargos.forEach((tipo) => {
            consolidarTipoRecargo(grupos[clave], tipo, dia);
          });
        }
      });
    }
  });

  // Calcular totales finales para cada grupo
  Object.values(grupos).forEach((grupo: any) => {
    calcularTotalesFinales(grupo);
  });

  const resultado = Object.values(grupos);

  return resultado as GrupoRecargo[];
};

export const LiquidacionPDF = ({
  item,
  totalRecargosParex,
  recargosParex,
  firmas,
  isAdmin,
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

          {safeValue(item.valor_incapacidad, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View>
                <Text style={styles.labelText}>
                  Remuneración por incapacidad
                </Text>
              </View>
              <View>
                <Text style={[styles.valueText, { marginLeft: -55 }]}>
                  {item.periodo_start_incapacidad &&
                  item.periodo_end_incapacidad
                    ? `${obtenerDiferenciaDias({
                        start: toDateValue(
                          parseDate(item.periodo_start_incapacidad),
                        ),
                        end: toDateValue(
                          parseDate(item.periodo_end_incapacidad),
                        ),
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
        <Text style={[styles.subHeaderCenter, { marginVertical: 12 }]}>
          ADICIONALES {formatDate(item.periodo_start)} -{" "}
          {formatDate(item.periodo_end)}
        </Text>

        {/* Tabla de Conceptos (misma lógica original) */}
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
                      <Text style={styles.valueText}>
                        {formatToCOP(bono.totalValue)}
                      </Text>
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
              <Text style={[styles.valueText, { fontSize: 10 }]}>
                Ver recargos detallados más adelante
              </Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.valueText}> </Text>
            </View>
            <View style={styles.tableCol4}>
              <Text style={styles.valueText}>
                {formatToCOP(item.total_recargos - totalRecargosParex)}
              </Text>
            </View>
          </View>

          {/* Recargos PAREX */}
          {recargosParex.length > 0 && (
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.valueText}>Recargos PAREX</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={[styles.valueText, { fontSize: 10 }]}>
                  Ver recargos detallados más adelante
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.valueText}> </Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.valueText}>
                  {formatToCOP(totalRecargosParex)}
                </Text>
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

        {/* Conceptos Adicionales */}
        {item.conceptos_adicionales &&
          item.conceptos_adicionales.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>CONCEPTOS ADICIONALES</Text>
              <View style={styles.table}>
                {item.conceptos_adicionales.map((concepto, index) => {
                  const isNegative = concepto.valor < 0;
                  const isLast =
                    index === (item.conceptos_adicionales?.length || 0) - 1;

                  return (
                    <View
                      key={index}
                      style={isLast ? styles.tableRowLast : styles.tableRow}
                    >
                      <View style={styles.tableCol1}>
                        <Text style={styles.valueText}>Ajuste adicional</Text>
                      </View>
                      <View style={styles.tableCol2}>
                        <Text style={[styles.valueText, { fontSize: 10 }]}>
                          {concepto.observaciones}
                        </Text>
                      </View>
                      <View style={styles.tableCol3}>
                        <Text style={styles.valueText}>1</Text>
                      </View>
                      <View style={styles.tableCol4}>
                        <Text
                          style={
                            isNegative ? styles.redValue : styles.greenValue
                          }
                        >
                          {isNegative ? "" : "+"}
                          {formatToCOP(concepto.valor)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

        {/* Deducciones */}
        <Text style={styles.sectionHeader}>DEDUCCIONES</Text>
        <View style={styles.table}>
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
        <View style={[styles.table]}>
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

          {safeValue(item.prima, "0") > 0 && (
            <View style={[styles.tableRow, styles.flex]}>
              <View style={{flex: 1}}>
                <Text style={styles.labelText}>Prima</Text>
                <Text style={[styles.labelText, {fontSize: 8, color: '#666', fontStyle: 'italic'}]}>
                  Saldo pendiente del mes anterior
                </Text>
              </View>
              <View>
                <Text style={[styles.blueValue, {color: '#2563EB'}]}>
                  {formatToCOP(safeValue(item.prima, "0"))}
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

        {/* Footer Página 1 */}
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
                  fontSize: 10,
                  color: "#2E8B57",
                  textAlign: "center",
                  fontWeight: "bold",
                  marginTop: 4,
                  marginBottom: 7,
                }}
              >
                Firma de recibido
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 9, color: "#9E9E9E" }}>
            Documento generado el {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>

      {(() => {
        if (!item.recargos_planilla?.recargos) return null;

        const recargosAgrupados = agruparRecargos(
          item.recargos_planilla,
          item.configuraciones_salario,
        );
        const paginasAgrupadas = agruparEnPaginas(recargosAgrupados);

        return paginasAgrupadas.map((gruposPagina, indicePagina) => (
          <PaginaRecargos
            key={`pagina-recargos-${indicePagina}`}
            grupos={gruposPagina}
            isAdmin={isAdmin}
            numeroPagina={indicePagina + 2} // Asumiendo que es la segunda página del documento
            totalPaginas={paginasAgrupadas.length + 1} // +1 por la página principal
          />
        ));
      })()}
    </Document>
  );
};

// Función para generar el PDF y descargarlo
const handleGeneratePDF = async (
  item: Liquidacion | null,
  firmas: any[],
  isAdmin: boolean,
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

    // Generar el PDF con los datos filtrados
    const blob = await pdf(
      <LiquidacionPDF
        firmas={firmas}
        isAdmin={isAdmin}
        item={item}
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

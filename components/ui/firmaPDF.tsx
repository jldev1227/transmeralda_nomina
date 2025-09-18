import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// Estilos para el componente de primera firma
const styles = StyleSheet.create({
  firmaContainer: {
    marginTop: 25,
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  firmaTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
  },
  firmaWrapper: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    width: 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  firmaImage: {
    width: 160,
    height: 80,
    objectFit: "contain",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 4,
  },
  firmaInfo: {
    alignItems: "center",
    width: "100%",
  },
  firmaNombre: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 6,
    width: "100%",
    marginBottom: 3,
  },
  firmaFecha: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  firmaRol: {
    fontSize: 7,
    color: "#2E8B57",
    textAlign: "center",
    marginTop: 1,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  noFirmaContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  noFirmaText: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  noFirmaIcon: {
    fontSize: 16,
    color: "#CCC",
    marginBottom: 5,
  },
});

// Interfaz para el tipo de firma
interface FirmaData {
  id: string;
  url: string;
  nombre: string;
  fecha?: string;
  rol?: string;
}

interface PrimeraFirmaProps {
  firmas: FirmaData[];
  titulo?: string;
  mostrarFecha?: boolean;
  mostrarRol?: boolean;
}

// Componente principal para mostrar solo la primera firma
const PrimeraFirma = ({
  firmas,
  titulo = "FIRMA DIGITAL",
  mostrarFecha = true,
  mostrarRol = true,
}: PrimeraFirmaProps) => {
  // Obtener solo la primera firma
  const primeraFirma = firmas && firmas.length > 0 ? firmas[0] : null;

  return (
    <View style={styles.firmaContainer}>
      <Text style={styles.firmaTitle}>{titulo}</Text>

      {primeraFirma ? (
        <View style={styles.firmaWrapper}>
          <Image
            src={
              "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ooCAVSRSQIAAAQIECBCICQhYMS/VBAgQIECAAIGigIBVJFJAgAABAgQIEIgJCFgxL9UECBAgQIAAgaKAgFUkUkCAAAECBAgQiAkIWDEv1QQIECBAgACBooCAVSRSQIAAAQIECBCICQhYMS/VBAgQIECAAIGigIBVJFJAgAABAgQIEIgJCFgxL9UECBAgQIAAgaKAgFUkUkCAAAECBAgQiAkIWDEv1QQIECBAgACBooCAVSRSQIAAAQIECBCICQhYMS/VBAgQIECAAIGigIBVJFJAgAABAgQIEIgJCFgxL9UECBAgQIAAgaKAgFUkUkCAAAECBAgQiAkIWDEv1QQIECBAgACBooCAVSRSQIAAAQIECBCICQhYMS/VBAgQIECAAIGigIBVJFJAgAABAgQIEIgJCFgxL9UECBAgQIAAgaKAgFUkUkCAAAECBAgQiAkIWDEv1QQIECBAgACBooCAVSRSQIAAAQIECBCICQhYMS/VBAgQIECAAIGigIBVJFJAgAABAgQIEIgJCFgxL9UECBAgQIAAgaKAgFUkUkCAAAECBAgQiAkIWDEv1QQIECBAgACBooCAVSRSQIAAAQIECBCICfwPxG/n9MIMVRoAAAAASUVORK5CYII="
            }
            style={styles.firmaImage}
          />

          <View style={styles.firmaInfo}>
            <Text style={styles.firmaNombre}>
              {primeraFirma.nombre || "Firma Autorizada"}
            </Text>

            {mostrarFecha && primeraFirma.fecha && (
              <Text style={styles.firmaFecha}>
                Firmado el{" "}
                {new Date(primeraFirma.fecha).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}

            {mostrarRol && (
              <Text style={styles.firmaRol}>
                {primeraFirma.rol || "Empleado Autorizado"}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noFirmaContainer}>
          <Text style={styles.noFirmaText}>
            No hay firma disponible para este documento
          </Text>
        </View>
      )}
    </View>
  );
};

export default PrimeraFirma;

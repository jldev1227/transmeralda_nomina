"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Pernote } from "@/context/NominaContext";

interface CalendarPernoteProps {
  pernotes: Pernote[];
  onDatesChange?: (dates: Date[]) => void;
  dateSelected: {
    start: {
      calendar: { identifier: string };
      era: string;
      year: number;
      month: number;
      day: number;
    };
    end: {
      calendar: { identifier: string };
      era: string;
      year: number;
      month: number;
      day: number;
    };
  } | null;
}

const CalendarPernote = ({
  pernotes = [],
  onDatesChange,
  dateSelected,
}: CalendarPernoteProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Inicializar con el mes del dateSelected o el mes actual
    if (dateSelected?.start) {
      return new Date(dateSelected.start.year, dateSelected.start.month - 1, 1);
    }

    return new Date();
  });

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const weekdayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Cargar fechas existentes de pernotes al inicio
  useEffect(() => {
    if (pernotes && pernotes.length > 0) {
      const allDates: Date[] = [];

      pernotes.forEach((pernote) => {
        if (pernote.fechas && Array.isArray(pernote.fechas)) {
          pernote.fechas.forEach((fechaStr) => {
            const fecha = new Date(fechaStr + "T00:00:00");

            allDates.push(fecha);
          });
        }
      });

      setSelectedDates(allDates);
    }
  }, [pernotes]);

  // Notificar cambios al componente padre
  const notifyChanges = (newDates: Date[]) => {
    if (onDatesChange) {
      onDatesChange(newDates);
    }
  };

  // Función para cambiar mes
  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);

    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    setCurrentMonth(newDate);
  };

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      const dateExists = selectedDates.some(
        (date) => date.toDateString() === value.toDateString(),
      );

      let newDates: Date[];

      if (dateExists) {
        newDates = selectedDates.filter(
          (date) => date.toDateString() !== value.toDateString(),
        );
      } else {
        newDates = [...selectedDates, value];
      }

      setSelectedDates(newDates);
      notifyChanges(newDates);
    }
  };

  const clearAll = () => {
    setSelectedDates([]);
    notifyChanges([]);
  };

  // Filtrar fechas del mes actual mostrado
  const currentMonthDates = selectedDates.filter(
    (date) =>
      date.getFullYear() === currentMonth.getFullYear() &&
      date.getMonth() === currentMonth.getMonth(),
  );

  return (
    <div className="calendar-container">
      {/* Resumen */}
      <div className="summary">
        <div className="summary-info">
          <span>Total: {selectedDates.length} fechas seleccionadas</span>
          <span>
            En {monthNames[currentMonth.getMonth()]}: {currentMonthDates.length}{" "}
            días
          </span>
        </div>
        {selectedDates.length > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>
            Limpiar todo
          </button>
        )}
      </div>

      {/* Calendario único */}
      <div className="calendar-wrapper">
        {/* Header con navegación */}
        <div className="month-header">
          <button
            aria-label="Mes anterior"
            className="nav-btn"
            onClick={() => changeMonth("prev")}
          >
            <ArrowLeft size={16} />
          </button>
          <h3>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            aria-label="Mes siguiente"
            className="nav-btn"
            onClick={() => changeMonth("next")}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Calendario */}
        <Calendar
          activeStartDate={currentMonth}
          calendarType="gregory"
          className="calendar"
          formatShortWeekday={(locale, date) => weekdayNames[date.getDay()]}
          locale="es-ES"
          minDetail="month"
          showFixedNumberOfWeeks={true}
          showNavigation={false}
          showNeighboringMonth={true}
          tileClassName={({ date, view }) => {
            if (view === "month") {
              // Verificar si el día pertenece al mes actual
              const isCurrentMonth =
                date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear();

              // Si no es del mes actual, marcarlo como día de otro mes
              if (!isCurrentMonth) {
                return "neighboring-month-disabled";
              }

              // Si es del mes actual y está seleccionado
              if (
                selectedDates.some(
                  (selectedDate) =>
                    selectedDate.toDateString() === date.toDateString(),
                )
              ) {
                return "selected-date";
              }
            }

            return null;
          }}
          tileDisabled={({ date, view }) => {
            if (view === "month") {
              // Deshabilitar días que no pertenecen al mes actual
              return !(
                date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear()
              );
            }

            return false;
          }}
          value={null}
          onChange={handleDateChange}
        />
      </div>

      <style jsx>{`
        .calendar-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
        }

        .summary-info {
          display: flex;
          gap: 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .clear-all-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .clear-all-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .calendar-wrapper {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .month-header {
          padding: 16px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .month-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          text-transform: capitalize;
          text-align: center;
        }

        .nav-btn {
          background: #e2e8f0;
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: #cbd5e1;
          color: #1e293b;
          transform: scale(1.05);
        }

        .nav-btn:active {
          transform: scale(0.95);
        }

        :global(.calendar) {
          width: 100% !important;
          border: none !important;
          border-radius: 0 !important;
          font-family: inherit !important;
          background: white !important;
          box-shadow: none !important;
        }

        :global(.calendar .react-calendar__month-view__weekdays) {
          background: #f8fafc !important;
          padding: 12px 0 !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        :global(.calendar .react-calendar__month-view__weekdays__weekday) {
          color: #64748b !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }

        :global(.calendar .react-calendar__month-view__days) {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 2px !important;
        }

        :global(.calendar .react-calendar__month-view__days__day) {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 45px !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        :global(
            .calendar .react-calendar__month-view__days__day--neighboringMonth
          ) {
          color: #e2e8f0 !important;
          background: #f8fafc !important;
          opacity: 0.4 !important;
          visibility: visible !important;
          display: flex !important;
          pointer-events: none !important;
        }

        :global(.calendar .react-calendar__tile) {
          height: 45px !important;
          border: none !important;
          background: none !important;
          color: #1e293b !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          border-radius: 6px !important;
          margin: 2px !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          visibility: visible !important;
        }

        :global(.calendar .react-calendar__tile:hover) {
          background: #f1f5f9 !important;
          transform: scale(1.05) !important;
        }

        :global(.calendar .react-calendar__tile--now) {
          background: #2e8b5723 !important;
          color: #2e8b57 !important;
          font-weight: 600 !important;
        }

        :global(.calendar .selected-date) {
          background: #2e8b57 !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
        }

        :global(.calendar .selected-date:hover) {
          background: #2e8b57b1 !important;
          transform: scale(1.05) !important;
        }

        :global(.calendar .neighboring-month-disabled) {
          color: #cbd5e1 !important;
          background: #f8fafc !important;
          cursor: not-allowed !important;
          opacity: 0.5 !important;
        }

        :global(.calendar .neighboring-month-disabled:hover) {
          background: #f8fafc !important;
          transform: none !important;
          cursor: not-allowed !important;
        }

        :global(.calendar .react-calendar__tile:disabled) {
          color: #cbd5e1 !important;
          background: #f8fafc !important;
          cursor: not-allowed !important;
          opacity: 0.5 !important;
        }

        :global(.calendar .react-calendar__tile:disabled:hover) {
          background: #f8fafc !important;
          transform: none !important;
          cursor: not-allowed !important;
        }

        .selected {
          padding: 16px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .dates {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #2e8b57;
          color: white;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .chip:hover {
          transform: translateY(-1px);
        }

        .chip button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          line-height: 1;
        }

        .chip button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        @media (max-width: 480px) {
          .calendar-container {
            max-width: 100%;
            padding: 0 8px;
          }

          .summary {
            padding: 12px 16px;
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .summary-info {
            justify-content: center;
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          :global(.calendar .react-calendar__tile) {
            height: 40px !important;
            font-size: 13px !important;
          }

          .chip {
            font-size: 12px;
            padding: 5px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPernote;

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import moment from "moment";

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  description?: string;
  location?: string;
  time?: string;
  color?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  currentDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onDateClick,
  onEventClick,
  currentDate = new Date(),
}) => {
  const [viewDate, setViewDate] = useState(moment(currentDate));
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);

  const startOfMonth = viewDate.clone().startOf("month");
  const endOfMonth = viewDate.clone().endOf("month");
  const startOfCalendar = startOfMonth.clone().startOf("week");
  const endOfCalendar = endOfMonth.clone().endOf("week");

  const days: moment.Moment[] = [];
  let day = startOfCalendar.clone();
  while (day.isSameOrBefore(endOfCalendar, "day")) {
    days.push(day.clone());
    day.add(1, "day");
  }

  const getEventsForDate = (date: moment.Moment): CalendarEvent[] => {
    return events.filter(
      (event) => moment(event.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  const isToday = (date: moment.Moment): boolean => {
    return date.isSame(moment(), "day");
  };

  const isCurrentMonth = (date: moment.Moment): boolean => {
    return date.isSame(viewDate, "month");
  };

  const previousMonth = () => {
    setViewDate(viewDate.clone().subtract(1, "month"));
  };

  const nextMonth = () => {
    setViewDate(viewDate.clone().add(1, "month"));
  };

  const goToToday = () => {
    setViewDate(moment());
    setSelectedDate(moment());
  };

  const handleDateClick = (date: moment.Moment) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date.toDate());
    }
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 text-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold">
            {viewDate.format("MMMM YYYY")}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-semibold"
        >
          Hari Ini
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs sm:text-sm font-semibold text-gray-400 py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const isDayToday = isToday(day);
          const isDayCurrentMonth = isCurrentMonth(day);
          const isDaySelected = selectedDate?.isSame(day, "day");

          return (
            <div
              key={idx}
              className={`
                min-h-[80px] sm:min-h-[100px] border border-gray-700 rounded-lg p-1 sm:p-2
                ${isDayCurrentMonth ? "bg-gray-800" : "bg-gray-900/50"}
                ${isDayToday ? "ring-2 ring-blue-500" : ""}
                ${isDaySelected ? "bg-blue-900/30" : ""}
                hover:bg-gray-700/50 transition-colors cursor-pointer
              `}
              onClick={() => handleDateClick(day)}
            >
              <div
                className={`
                  text-xs sm:text-sm font-semibold mb-1
                  ${isDayCurrentMonth ? "text-white" : "text-gray-600"}
                  ${isDayToday ? "text-blue-400" : ""}
                `}
              >
                {day.format("D")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`
                      text-[10px] sm:text-xs px-1 py-0.5 rounded truncate
                      ${event.color || "bg-blue-600"}
                      hover:opacity-80 transition-opacity cursor-pointer
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEventClick) {
                        onEventClick(event);
                      }
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-400 px-1">
                    +{dayEvents.length - 3} lagi
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-3">
            Aktivitas {selectedDate.format("DD MMMM YYYY")}
          </h3>
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-400 text-sm">Tidak ada aktivitas pada tanggal ini</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => {
                    if (onEventClick) {
                      onEventClick(event);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;

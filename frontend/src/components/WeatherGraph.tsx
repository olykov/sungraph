import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DayData {
  date: Date;
  sunnyLevel: number; // 0-5, where 5 is very sunny (high sunshine %)
  sunshine: number; // sunshine percentage (0-100)
}

interface WeatherGraphProps {
  data: DayData[];
  isLoading: boolean;
  city?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getSunnyColor = (level: number): string => {
  switch (level) {
    case 5: return "bg-sunny-5";
    case 4: return "bg-sunny-4";
    case 3: return "bg-sunny-3";
    case 2: return "bg-sunny-2";
    case 1: return "bg-sunny-1";
    default: return "bg-cloudy";
  }
};

const getSunnyLabel = (level: number): string => {
  switch (level) {
    case 5: return "Very Sunny";
    case 4: return "Sunny";
    case 3: return "Partly Cloudy";
    case 2: return "Mostly Cloudy";
    case 1: return "Cloudy";
    default: return "Overcast";
  }
};

const WeatherGraph = ({ data, isLoading, city }: WeatherGraphProps) => {
  const { weeks, monthLabels } = useMemo(() => {
    if (data.length === 0) {
      return { weeks: [], monthLabels: [] };
    }

    // Group data by weeks
    const weeks: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];

    // Fill in empty days at the start of the first week
    const firstDayOfWeek = data[0]?.date.getDay() || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    data.forEach((day) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    // Fill in remaining days of the last week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);

    // Calculate month labels
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d !== null);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full animate-fade-in">
        {/* Desktop: horizontal */}
        <div className="hidden md:flex gap-1 overflow-x-auto pb-2">
          {Array.from({ length: 52 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="w-3 h-3 rounded-sm bg-muted animate-pulse-warm"
                  style={{ animationDelay: `${(weekIndex + dayIndex) * 20}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Mobile: vertical */}
        <div className="flex md:hidden flex-col gap-1 overflow-y-auto max-h-[60vh] items-center">
          {Array.from({ length: 52 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="w-5 h-5 rounded-sm bg-muted animate-pulse-warm"
                  style={{ animationDelay: `${(weekIndex + dayIndex) * 20}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {city
          ? `No historical weather data available for ${city} yet. It will be generated over time.`
          : "Search for a city to see the sunny days graph"}
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* DESKTOP LAYOUT - Horizontal */}
      <div className="hidden md:block">
        {/* Month labels */}
        <div className="flex mb-2 text-xs text-muted-foreground ml-10">
          {monthLabels.map(({ label, weekIndex }, index) => (
            <div
              key={index}
              className="absolute"
              style={{ marginLeft: `${weekIndex * 16 + 40}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1 mt-6">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
            {DAYS.map((day, index) => (
              <div key={day} className="h-3 flex items-center justify-end pr-1">
                {index % 2 === 1 ? day : ""}
              </div>
            ))}
          </div>

          {/* Graph grid */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  day ? (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm ${getSunnyColor(day.sunnyLevel)} cursor-pointer transition-all hover:scale-125 hover:ring-2 hover:ring-foreground/20`}
                          style={{ animationDelay: `${(weekIndex + dayIndex) * 10}ms` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-card border-border shadow-soft"
                      >
                        <div className="text-sm font-medium">
                          {day.date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getSunnyLabel(day.sunnyLevel)} ({day.sunshine}% sunshine)
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm bg-transparent"
                    />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT - Vertical */}
      <div className="block md:hidden">
        {/* Day labels (header row) */}
        <div className="flex gap-1 mb-2 text-xs text-muted-foreground justify-center">
          {DAYS.map((day) => (
            <div key={day} className="w-5 text-center text-[10px]">
              {day.charAt(0)}
            </div>
          ))}
        </div>

        {/* Graph grid - vertical scroll */}
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[55vh] items-center">
          {weeks.map((week, weekIndex) => {
            const firstValidDay = week.find(d => d !== null);
            const showMonth = monthLabels.some(m => m.weekIndex === weekIndex);
            const monthLabel = showMonth && firstValidDay
              ? MONTHS[firstValidDay.date.getMonth()]
              : "";

            return (
              <div key={weekIndex} className="relative">
                {/* Month label overlay */}
                {monthLabel && (
                  <div className="absolute -top-1 -left-10 text-[10px] text-muted-foreground font-medium text-right w-8">
                    {monthLabel}
                  </div>
                )}

                {/* Week row */}
                <div className="flex gap-1">
                  {week.map((day, dayIndex) => (
                    day ? (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-5 h-5 rounded-sm ${getSunnyColor(day.sunnyLevel)} cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-foreground/20`}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-card border-border shadow-soft"
                        >
                          <div className="text-sm font-medium">
                            {day.date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getSunnyLabel(day.sunnyLevel)} ({day.sunshine}% sunshine)
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="w-5 h-5 rounded-sm bg-transparent"
                      />
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Cloudy</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-cloudy" />
          <div className="w-3 h-3 rounded-sm bg-sunny-1" />
          <div className="w-3 h-3 rounded-sm bg-sunny-2" />
          <div className="w-3 h-3 rounded-sm bg-sunny-3" />
          <div className="w-3 h-3 rounded-sm bg-sunny-4" />
          <div className="w-3 h-3 rounded-sm bg-sunny-5" />
        </div>
        <span>Sunny</span>
      </div>
    </div >
  );
};

export default WeatherGraph;
export type { DayData };

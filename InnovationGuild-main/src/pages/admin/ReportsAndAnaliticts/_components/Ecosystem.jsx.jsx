import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import LocationGroup from '../../../../components/ui/LocationGroup';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetAdminEcosystem } from '../../../../hooks/queries/admin';

const USERS = ["All Users", "Affiliated Organizations", "Nodal Organizations", "VLEs"];

const BAR_ROLES = {
  "All Users":               ["VLE", "AO", "NO"],
  "Affiliated Organizations":["AO"],
  "Nodal Organizations":     ["NO"],
  "VLEs":                    ["VLE"],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

function GenericDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 px-3 py-[24px] border border-accent-green-dark rounded-xl text-md text-gray-500 bg-[#fef2eb] whitespace-nowrap min-w-[130px]"
      >
        {value || "Select"}
        <ChevronDown />
      </button>

      {open && (
        <div
          className="absolute top-16 left-0 z-50 bg-white border border-accent-green-light rounded-2xl shadow-lg overflow-hidden"
          style={{ minWidth: 200 }}
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full text-left px-5 py-3 text-sm transition-colors
                ${value === option
                  ? "bg-[#fef2eb] text-gray-800 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function formatDate(date) {
  if (!date) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}
function formatDateLabel(date) {
  if (!date) return "";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
function isSameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}
function isBetween(date, start, end) {
  if (!start || !end) return false;
  const d = date.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return d > s && d < e;
}

function CalendarMonth({ year, month, startDate, endDate, hoverDate, onSelect, onHover }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-64">
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const date = new Date(year, month, day);
          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate);
          const rangeEnd = endDate || hoverDate;
          const inRange = isBetween(date, startDate, rangeEnd);

          let cls = "text-center text-sm py-1 cursor-pointer select-none rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors ";
          if (isStart || isEnd) {
            cls += "bg-green-700 text-white font-semibold";
          } else if (inRange) {
            cls += "bg-green-100 text-green-800";
          } else {
            cls += "text-gray-700 hover:bg-gray-100";
          }

          return (
            <div key={day} className="flex justify-center py-0.5">
              <div className={cls} onClick={() => onSelect(date)} onMouseEnter={() => onHover(date)}>
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [leftMonth, setLeftMonth] = useState(() => {
    const d = startDate || new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const ref = useRef(null);

  const rightMonth = {
    month: (leftMonth.month + 1) % 12,
    year: leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year,
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (date) => {
    if (!selecting || selecting === null) {
      onChange({ start: date, end: null });
      setSelecting("end");
    } else {
      let start = startDate;
      let end = date;
      if (end < start) { [start, end] = [end, start]; }
      onChange({ start, end });
      setSelecting(null);
      setOpen(false);
    }
  };

  const prevMonth = () => {
    setLeftMonth((lm) => ({
      month: lm.month === 0 ? 11 : lm.month - 1,
      year: lm.month === 0 ? lm.year - 1 : lm.year,
    }));
  };

  const nextMonth = () => {
    setLeftMonth((lm) => ({
      month: lm.month === 11 ? 0 : lm.month + 1,
      year: lm.month === 11 ? lm.year + 1 : lm.year,
    }));
  };

  const displayText =
    startDate && endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : startDate
      ? `${formatDate(startDate)} – ...`
      : "05/01/2026 – 11/01/2026";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(true); setSelecting(null); }}
        className="flex items-center justify-between gap-2 px-3 py-[22px] border border-accent-green-dark rounded-xl text-md text-gray-500 bg-[#fef2eb] whitespace-nowrap min-w-[130px]"
      >
        {displayText}
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute top-11 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3" style={{ minWidth: 560 }}>
          <div className="flex items-center justify-between mb-1">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft /></button>
            <div className="flex gap-16">
              <span className="text-sm font-semibold text-gray-700">{MONTHS[leftMonth.month]} {leftMonth.year}</span>
              <span className="text-sm font-semibold text-gray-700">{MONTHS[rightMonth.month]} {rightMonth.year}</span>
            </div>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight /></button>
          </div>
          <div className="flex gap-6">
            <CalendarMonth year={leftMonth.year} month={leftMonth.month} startDate={startDate} endDate={endDate} hoverDate={selecting === "end" ? hoverDate : null} onSelect={handleSelect} onHover={setHoverDate} />
            <div className="w-px bg-gray-100" />
            <CalendarMonth year={rightMonth.year} month={rightMonth.month} startDate={startDate} endDate={endDate} hoverDate={selecting === "end" ? hoverDate : null} onSelect={handleSelect} onHover={setHoverDate} />
          </div>
          <p className="text-xs text-gray-400 text-center">
            {!startDate || selecting === null ? "Click to select start date" : "Now click to select end date"}
          </p>
        </div>
      )}
    </div>
  );
}

const CustomLegend = ({ activeBars }) => (
  <div className="flex items-center gap-6 mt-4 ml-2">
    {activeBars.includes("VLE") && (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#7c6fcd" }} />
        <span className="text-sm text-gray-600">VLE</span>
      </div>
    )}
    {activeBars.includes("AO") && (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f5a623" }} />
        <span className="text-sm text-gray-600">AO</span>
      </div>
    )}
    {activeBars.includes("NO") && (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#e8622a" }} />
        <span className="text-sm text-gray-600">NO</span>
      </div>
    )}
  </div>
);

export default function EcosystemGrowthTrends() {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });
  const [userType, setUserType] = useState("All Users");

  const { control, watch, setValue, formState: { errors } } = useForm();
  const state = watch('state');

  // Build stable params object — only include defined values
  const params = useMemo(() => ({
    ...(dateRange.start ? { startDate: dateRange.start.toISOString() } : {}),
    ...(dateRange.end   ? { endDate:   dateRange.end.toISOString()   } : {}),
    ...(state ? { state } : {}),
  }), [dateRange.start, dateRange.end, state]);

  // Don't fetch mid-selection (start chosen, end not yet chosen)
  const { data: ecosystemApiData, isLoading } = useGetAdminEcosystem(params, {
    enabled: !dateRange.start || !!dateRange.end,
  });

  const chartData = ecosystemApiData?.data?.items || [];

  const maxVal = Math.max(5, ...chartData.flatMap(d => [d.VLE, d.AO, d.NO]));
  const yMax   = Math.ceil(maxVal / 5) * 5;
  const yTicks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);

  const activeBars = BAR_ROLES[userType] || ["VLE", "AO", "NO"];

  const dateLabel = (() => {
    if (dateRange.start && dateRange.end) {
      return `${formatDateLabel(dateRange.start)} – ${formatDateLabel(dateRange.end)}`;
    }
    if (dateRange.start) return formatDateLabel(dateRange.start);
    return "Last 6 months";
  })();

  return (
    <>
      <h1 className="text-4xl font-regular text-[#273228] mb-1">Ecosystem Growth Trends</h1>
      <p className="text-gray-500 text-sm mb-6">Track expansion and engagement across the platform</p>

      <div className="bg-white border border-accent-green-light rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <DateRangePicker startDate={dateRange.start} endDate={dateRange.end} onChange={({ start, end }) => setDateRange({ start, end })} />

          <div className="location-filter-wrap">
            <LocationGroup
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
              isDisabled={false}
              showDistrict={false}
              showLabels={false}
            />
          </div>
          <GenericDropdown value={userType} options={USERS} onChange={setUserType} />
        </div>

        <p className="font-semibold text-gray-600 text-base mb-4">{dateLabel}</p>

        <style>{`
          .recharts-wrapper,.recharts-wrapper *,.recharts-surface{outline:none !important;}
          .location-filter-wrap > div { display: contents; }
          .location-filter-wrap .react-select__control {
            min-height: unset !important;
            height: auto;
            border: 1px solid var(--accent-green-light, #a3c9a8) !important;
            border-radius: 0.75rem !important;
            box-shadow: none !important;
            padding: 0;
            font-size: 0.875rem;
            color: #6b7280;
            background: #fff;
            cursor: pointer;
            white-space: nowrap;
            min-width: 130px;
          }
          .location-filter-wrap .react-select__control:hover { background: #f9fafb; }
          .location-filter-wrap .react-select__value-container { padding: 7px 0.75rem; }
          .location-filter-wrap .react-select__indicator-separator { display: none; }
          .location-filter-wrap .react-select__dropdown-indicator { padding: 0 0.5rem; color: #6b7280; }
          .location-filter-wrap .react-select__placeholder { color: #6b7280; margin: 0; }
          .location-filter-wrap .react-select__single-value { color: #6b7280; margin: 0; }
          .location-filter-wrap .react-select__menu {
            border-radius: 1rem;
            border: 1px solid var(--accent-green-light, #a3c9a8);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
            font-size: 0.875rem;
          }
          .location-filter-wrap .react-select__option {
            padding: 0.75rem 1.25rem;
            color: #4b5563;
          }
          .location-filter-wrap .react-select__option--is-selected {
            background: #fef2eb !important;
            color: #1f2937;
            font-weight: 500;
          }
          .location-filter-wrap .react-select__option--is-focused {
            background: #f9fafb;
          }
        `}</style>

        {isLoading ? (
          <div className="h-[360px] bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div onMouseDown={(e) => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={chartData}
                barCategoryGap="30%"
                barGap={3}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 13 }} ticks={yTicks} domain={[0, yMax]} />
                <Tooltip cursor={false} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
                {activeBars.includes("VLE") && <Bar dataKey="VLE" fill="#7c6fcd" radius={[3, 3, 0, 0]} />}
                {activeBars.includes("AO")  && <Bar dataKey="AO"  fill="#f5a623" radius={[3, 3, 0, 0]} />}
                {activeBars.includes("NO")  && <Bar dataKey="NO"  fill="#e8622a" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <CustomLegend activeBars={activeBars} />
      </div>
    </>
  );
}

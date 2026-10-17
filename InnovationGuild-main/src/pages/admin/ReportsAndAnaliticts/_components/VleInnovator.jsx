import { useState, useRef, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetAdminVleContactTrend } from '../../../../hooks/queries/admin';

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Calendar / Date Range Picker ────────────────────────────────────────────

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function formatDate(date) {
  if (!date) return "";
  return `${String(date.getMonth()+1).padStart(2,"0")}/${String(date.getDate()).padStart(2,"0")}/${date.getFullYear()}`;
}
function formatDateLabel(date) { if (!date) return ""; return `${MONTHS[date.getMonth()]} ${date.getDate()}`; }
function isSameDay(a, b) { return a && b && a.toDateString() === b.toDateString(); }
function isBetween(date, start, end) {
  if (!start || !end) return false;
  const d = date.getTime(), s = Math.min(start.getTime(), end.getTime()), e = Math.max(start.getTime(), end.getTime());
  return d > s && d < e;
}

function CalendarMonth({ year, month, startDate, endDate, hoverDate, onSelect, onHover }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-56">
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const date = new Date(year, month, day);
          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate);
          const inRange = isBetween(date, startDate, endDate || hoverDate);
          let cls = "text-center text-sm cursor-pointer select-none rounded-full mx-auto w-7 h-7 flex items-center justify-center transition-colors ";
          if (isStart || isEnd) cls += "bg-green-700 text-white font-semibold";
          else if (inRange) cls += "bg-green-100 text-green-800";
          else cls += "text-gray-700 hover:bg-gray-100";
          return (
            <div key={day} className="flex justify-center py-0.5">
              <div className={cls} onClick={() => onSelect(date)} onMouseEnter={() => onHover(date)}>{day}</div>
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

  const rightMonth = { month: (leftMonth.month + 1) % 12, year: leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (date) => {
    if (!selecting) { onChange({ start: date, end: null }); setSelecting("end"); }
    else {
      let start = startDate, end = date;
      if (end < start) [start, end] = [end, start];
      onChange({ start, end }); setSelecting(null); setOpen(false);
    }
  };

  const prevMonth = () => setLeftMonth((lm) => ({ month: lm.month === 0 ? 11 : lm.month - 1, year: lm.month === 0 ? lm.year - 1 : lm.year }));
  const nextMonth = () => setLeftMonth((lm) => ({ month: lm.month === 11 ? 0 : lm.month + 1, year: lm.month === 11 ? lm.year + 1 : lm.year }));

  const displayText = startDate && endDate
    ? `${formatDate(startDate)} – ${formatDate(endDate)}`
    : startDate ? `${formatDate(startDate)} – ...` : "Select date range";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(true); setSelecting(null); }}
        className="flex items-center justify-between gap-2 px-4 py-[22px] border border-[#c97b5a] rounded-2xl text-sm text-gray-600 bg-[#fef2eb] hover:bg-[#fde8d8] whitespace-nowrap min-w-[130px]"
      >
        <span>{displayText}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute top-16 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3" style={{ minWidth: 500 }}>
          <div className="flex items-center justify-between mb-1">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft /></button>
            <div className="flex gap-16">
              <span className="text-sm font-semibold text-gray-700">{MONTHS[leftMonth.month]} {leftMonth.year}</span>
              <span className="text-sm font-semibold text-gray-700">{MONTHS[rightMonth.month]} {rightMonth.year}</span>
            </div>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight /></button>
          </div>
          <div className="flex gap-4">
            <CalendarMonth year={leftMonth.year} month={leftMonth.month} startDate={startDate} endDate={endDate} hoverDate={selecting === "end" ? hoverDate : null} onSelect={handleSelect} onHover={setHoverDate} />
            <div className="w-px bg-gray-100" />
            <CalendarMonth year={rightMonth.year} month={rightMonth.month} startDate={startDate} endDate={endDate} hoverDate={selecting === "end" ? hoverDate : null} onSelect={handleSelect} onHover={setHoverDate} />
          </div>
          <p className="text-xs text-gray-400 text-center">{!startDate || !selecting ? "Click to select start date" : "Now click to select end date"}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VleInnovator() {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });

  const params = useMemo(() => ({
    ...(dateRange.start ? { startDate: dateRange.start.toISOString() } : {}),
    ...(dateRange.end   ? { endDate:   dateRange.end.toISOString()   } : {}),
  }), [dateRange.start, dateRange.end]);

  const { data: apiData, isLoading } = useGetAdminVleContactTrend(params, {
    enabled: !dateRange.start || !!dateRange.end,
  });

  const chartData = (apiData?.data?.items || []).map(d => ({ day: d.label, value: d.count }));

  const maxVal = Math.max(1, ...chartData.map(d => d.value));
  const step = maxVal <= 5 ? 1 : maxVal <= 50 ? 10 : maxVal <= 500 ? 50 : maxVal <= 5000 ? 500 : 1000;
  const yMax = Math.ceil(maxVal / step) * step;
  const yTicks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);
  const total = chartData.reduce((s, d) => s + d.value, 0);

  const dateLabel = (() => {
    if (dateRange.start && dateRange.end)
      return `${formatDateLabel(dateRange.start)} – ${formatDateLabel(dateRange.end)}`;
    if (dateRange.start) return formatDateLabel(dateRange.start);
    return "Last 6 months";
  })();

  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-3xl font-regular text-[#273228] mb-1 mt-10">VLE-Innovator</h2>
      <p className="text-gray-500 text-sm mb-6">VLEs who are getting in touch with Innovators directly</p>

      <div className="bg-white border border-accent-green-light rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <DateRangePicker startDate={dateRange.start} endDate={dateRange.end} onChange={setDateRange} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <p className="font-semibold text-gray-600 text-base">{dateLabel}</p>
          {!isLoading && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2">
              <p className="text-green-700 font-bold text-xl leading-tight">{total.toLocaleString()}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div onMouseDown={(e) => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 13 }} ticks={yTicks} domain={[0, yMax]} />
                <Tooltip cursor={false} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import map from '../../../../assets/images/map.png';
import loc2 from '../../../../assets/icons/loc2.svg';
import rep1 from '../../../../assets/icons/rep1.svg';
import rep4 from '../../../../assets/icons/rep4.svg';
import rep6 from '../../../../assets/icons/rep6.svg';
import { useGetAdminStateBreakdown } from '../../../../hooks/queries/admin';

const InfoPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const STATE_PINS = [
  { id: "jk", name: "Jammu & Kashmir",  top: "10%",  left: "25%" },
  { id: "la", name: "Ladakh",           top: "8%",  left: "35%" },
  { id: "hp", name: "Himachal Pradesh", top: "16%", left: "32%" },
  { id: "ch", name: "Chandigarh",       top: "20%", left: "30%" },
  { id: "uk", name: "Uttarakhand",      top: "22%", left: "38%" },
  { id: "pb", name: "Punjab",           top: "22%", left: "28%" },
  { id: "up", name: "Uttar Pradesh",    top: "36%", left: "47%" },
  { id: "br", name: "Bihar",            top: "37%", left: "60%" },
  { id: "hr", name: "Haryana",          top: "26%", left: "28%" },
  { id: "dl", name: "Delhi",            top: "28%", left: "31%" },
  { id: "jh", name: "Jharkhand",        top: "45%", left: "60%" },
  { id: "rj", name: "Rajasthan",        top: "33%", left: "18%" },
  { id: "mh", name: "Maharashtra",      top: "57%", left: "28%"},
  { id: "mp", name: "Madhya Pradesh",   top: "48%", left: "40%" },
  { id: "cg", name: "Chhattisgarh",    top: "55%", left: "47%" },
  { id: "wb", name: "West Bengal",      top: "44%", left: "68%" },
  { id: "as", name: "Assam",            top: "34%", left: "85%" },
  { id: "sk", name: "Sikkim",           top: "31%", left: "70%" },
  { id: "nl", name: "Nagaland",         top: "34%", left: "90%" },
  { id: "ar", name: "Arunachal Pradesh",top: "28%", left: "88%" },
  { id: "mn", name: "Manipur",          top: "40%", left: "89%" },
  { id: "ml", name: "Meghalaya",        top: "37%", left: "82%" },
  { id: "tr", name: "Tripura",          top: "44%", left: "82%" },
  { id: "mz", name: "Mizoram",          top: "47%", left: "87%" },
  { id: "od", name: "Odisha",           top: "53%", left: "58%" },
  { id: "ap", name: "Andhra Pradesh",   top: "75%", left: "38%" },
  { id: "ts", name: "Telangana",        top: "65%", left: "40%" },
  { id: "ka", name: "Karnataka",        top: "75%", left: "26%" },
  { id: "ga", name: "Goa",             top: "72%", left: "19.5%" },
  { id: "tn", name: "Tamil Nadu",       top: "88%", left: "35%" },
  { id: "kl", name: "Kerala",           top: "90%", left: "28%" },
  { id: "gj", name: "Gujarat",          top: "45%", left: "14%" },
  { id: "dn", name: "Dadra & Nagar Haveli and Daman & Diu", top: "53%", left: "8%"  },
  { id: "py", name: "Puducherry",       top: "82%", left: "43%" },
  { id: "an", name: "Andaman & Nicobar Islands", top: "75%", left: "85%" },
  { id: "ld", name: "Lakshadweep",      top: "85%", left: "10%"  },
];

const EMPTY_METRICS = { nos: 0, aos: 0, vles: 0, innovators: 0, commercial: 0, resolved: 0 };

const StatRow = ({ icon, label, value, labelClass = "text-gray-500", valueClass = "text-gray-800" }) => (
  <div className="flex items-center justify-between">
    <div className={`flex items-center gap-2 text-sm ${labelClass}`}>
      <img src={icon} alt={label} className="w-4 h-4 object-contain flex-shrink-0" />
      <span>{label}</span>
    </div>
    <span className={`font-semibold text-sm ${valueClass}`}>{value}</span>
  </div>
);

const TooltipCard = ({ state }) => (
  <div
    className="absolute bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-56 pointer-events-none"
    style={{
      top: "130%",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
    }}
  >
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      <InfoPinIcon />
      <span className="font-semibold text-gray-800 text-sm">{state.name}</span>
    </div>
    <div className="flex flex-col gap-2">
      <StatRow icon={rep1} label="NOs"        value={state.nos} />
      <StatRow icon={rep1} label="AOs"        value={state.aos} />
      <StatRow icon={rep4} label="VLEs"       value={state.vles.toLocaleString()} />
      <StatRow icon={rep4} label="Innovators" value={state.innovators.toLocaleString()} />
      <StatRow icon={rep6} label="Commercial" value={state.commercial.toLocaleString()} labelClass="text-green-600" valueClass="text-green-600" />
      <StatRow icon={rep6} label="Resolved"   value={state.resolved.toLocaleString()}   labelClass="text-blue-500" valueClass="text-blue-600" />
    </div>
  </div>
);

const Pin = ({ state, isHovered, onMouseEnter, onMouseLeave }) => (
  <div
    className="absolute"
    style={{
      top: state.top,
      left: state.left,
      transform: "translate(-50%, -50%)",
      zIndex: isHovered ? 1000 : 1,
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="relative cursor-pointer flex items-center justify-center">
      <img
        src={loc2}
        alt="location"
        style={{
          width: state.active ? 32 : 24,
          height: state.active ? 32 : 24,
          transform: isHovered ? "scale(1.45)" : "scale(1)",
          transition: "transform 0.2s ease",
          filter: isHovered
            ? "drop-shadow(0 2px 8px rgba(45,106,79,0.55))"
            : state.active
            ? "drop-shadow(0 1px 4px rgba(45,106,79,0.3))"
            : "none",
        }}
      />
      {isHovered && <TooltipCard state={state} />}
    </div>
  </div>
);

export default function RegionalImpactMap() {
  const [hoveredId, setHoveredId] = useState(null);
  const { data, isLoading } = useGetAdminStateBreakdown();

  const pins = STATE_PINS.map(s => ({
    ...s,
    ...(data?.data?.[s.id.toUpperCase()] ?? EMPTY_METRICS),
  }));

  return (
    <>
      <h2 className="text-3xl font-regular text-[#273228] mb-1 mt-10">Regional Impact Map</h2>
      <p className="text-gray-500 text-sm mb-6">State-wise ecosystem coverage and performance</p>

      <div className="flex justify-center">
        <div className="relative" style={{ width: 600, height: 600 }}>
          <img
            src={map}
            alt="India map"
            className="w-[600px] h-[600px] select-none"
            draggable={false}
          />
          {isLoading ? (
            <div className="absolute inset-0 bg-white/50 rounded-lg animate-pulse" />
          ) : (
            pins.map((state) => (
              <Pin
                key={state.id}
                state={state}
                isHovered={hoveredId === state.id}
                onMouseEnter={() => setHoveredId(state.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

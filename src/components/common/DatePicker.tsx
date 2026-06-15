import { useRef } from "react";

interface Props {
  value: string; // yyyy-MM-dd
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const toDisplay = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const toISO = (display: string) => {
  const [d, m, y] = display.split("/");
  if (d && m && y?.length === 4) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return "";
};

const applyMask = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) out += "/";
    out += digits[i];
  }
  return out;
};

function DatePicker({ value, onChange, className = "form-control", style }: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value);
    e.target.value = masked;
    const iso = toISO(masked);
    if (iso) onChange(iso);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const iso = toISO(e.target.value);
    if (!iso) e.target.value = toDisplay(value);
  };

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      {/* Visible text input showing dd/mm/yyyy */}
      <input
        type="text"
        className={className}
        style={{ paddingRight: "2rem", ...style }}
        defaultValue={toDisplay(value)}
        key={value}
        placeholder="dd/mm/yyyy"
        maxLength={10}
        onChange={handleTextChange}
        onBlur={handleBlur}
      />
      {/* Hidden native date input for the calendar icon */}
      <input
        ref={hiddenRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: "absolute", right: "6px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0, width: "22px", height: "22px",
          cursor: "pointer", border: "none", padding: 0,
        }}
      />
      {/* Calendar icon overlay */}
      <span
        onClick={() => hiddenRef.current?.showPicker?.()}
        style={{
          position: "absolute", right: "8px", top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer", pointerEvents: "none",
          color: "#6c757d", fontSize: "15px",
        }}
      >
        📅
      </span>
    </div>
  );
}

export default DatePicker;

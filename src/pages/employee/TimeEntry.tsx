import { useState, useEffect } from "react";
import DatePicker from "../../components/common/DatePicker";
import employeeService from "../../services/employeeService";
import { showSuccess, showError } from "../../utils/toast";

type AttendanceAction = "checkin" | "lunchstart" | "lunchend" | "breakstart" | "breakend" | "checkout";
type AttendancePayloadField = "inTime" | "outTime" | "lunchStart" | "lunchEnd" | "breakStart" | "breakEnd";

const CHECKIN_ONTIME_CUTOFF = "10:00";
const CHECKOUT_HALFDAY_CUTOFF = "14:00";
const MAX_LATE_ALLOWED = 2;
const getTodayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};

const formatDisplayTime = (value: string) =>
  value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

const getCheckinStatus = (time: string): "ontime" | "late" =>
  time <= CHECKIN_ONTIME_CUTOFF ? "ontime" : "late";

const isHalfDay = (time: string) => time < CHECKOUT_HALFDAY_CUTOFF;

const actionSettings: Array<{
  action: AttendanceAction;
  label: string;
  successMessage: string;
  color: string;
  payloadField: AttendancePayloadField;
  fixedTime?: string;
}> = [
  { action: "checkin",    label: "Check In",    successMessage: "Checked In Successfully",  color: "#2ec4b6", payloadField: "inTime" },
  { action: "lunchstart", label: "Lunch Start", successMessage: "Lunch Started",             color: "#f77f00", payloadField: "lunchStart" },
  { action: "lunchend",   label: "Lunch End",   successMessage: "Lunch Ended",               color: "#2a9d8f", payloadField: "lunchEnd" },
  { action: "breakstart", label: "Break Start", successMessage: "Break Started",             color: "#4361ee", payloadField: "breakStart" },
  { action: "breakend",   label: "Break End",   successMessage: "Break Ended",               color: "#f4a261", payloadField: "breakEnd" },
  { action: "checkout",   label: "Check Out",   successMessage: "Checked Out Successfully",  color: "#e63946", payloadField: "outTime" },
];

function TimeEntry() {
  const [loading, setLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(getTodayKey());
  const [completedActions, setCompletedActions] = useState<Set<AttendanceAction>>(new Set());
  const [recordedTimes, setRecordedTimes] = useState<Record<string, string>>({});
  const [checkinStatus, setCheckinStatus] = useState<"ontime" | "late" | null>(null);
  const [checkoutHalfDay, setCheckoutHalfDay] = useState(false);
  const [lateCount, setLateCount] = useState(0);
  const [entryTimes, setEntryTimes] = useState<Record<AttendanceAction, string>>({
    checkin: "", lunchstart: "", lunchend: "", breakstart: "", breakend: "", checkout: ""
  });
  const [lunchTimes, setLunchTimes] = useState({ lunchstart: "13:30", lunchend: "14:30" });

  const loadTodayAttendance = async (date: string) => {
    try {
      const res = await employeeService.getTodayAttendance(date);
      const data = res.data;
      const done = new Set<AttendanceAction>();
      const times: Record<string, string> = {};

      const updatedLunchTimes = { lunchstart: "13:30", lunchend: "14:30" };

      if (data?.inTime)    { done.add("checkin");    times.checkin    = formatDisplayTime(data.inTime);    setCheckinStatus(getCheckinStatus(new Date(data.inTime).toTimeString().slice(0, 5))); }
      if (data?.lunchOut)  { done.add("lunchstart"); times.lunchstart = formatDisplayTime(data.lunchOut);  updatedLunchTimes.lunchstart = new Date(data.lunchOut).toTimeString().slice(0, 5); }
      if (data?.lunchIn)   { done.add("lunchend");   times.lunchend   = formatDisplayTime(data.lunchIn);   updatedLunchTimes.lunchend   = new Date(data.lunchIn).toTimeString().slice(0, 5); }
      if (data?.breakOut)  { done.add("breakstart"); times.breakstart = formatDisplayTime(data.breakOut);  }
      if (data?.breakIn)   { done.add("breakend");   times.breakend   = formatDisplayTime(data.breakIn);   }
      if (data?.outTime)   { done.add("checkout");   times.checkout   = formatDisplayTime(data.outTime);   setCheckoutHalfDay(isHalfDay(new Date(data.outTime).toTimeString().slice(0, 5))); }

      setLunchTimes(updatedLunchTimes);
      setCompletedActions(done);
      setRecordedTimes(times);
    } catch {
      setCompletedActions(new Set());
      setRecordedTimes({});
      setCheckinStatus(null);
      setCheckoutHalfDay(false);
    }

    try {
      const lateRes = await employeeService.getLateCount();
      setLateCount(lateRes.data?.lateCount ?? 0);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadTodayAttendance(attendanceDate); }, [attendanceDate]);

  const updateEntryTime = (action: AttendanceAction, value: string) =>
    setEntryTimes((cur) => ({ ...cur, [action]: value }));

  const performAction = async (action: AttendanceAction) => {
    const settings = actionSettings.find((x) => x.action === action);
    if (!settings) return;

    if (completedActions.has(action)) {
      showError(`${settings.label} already recorded for this date`);
      return;
    }

    const selectedTime = (action === "lunchstart" || action === "lunchend")
      ? lunchTimes[action]
      : (settings.fixedTime || entryTimes[action]);
    if (!selectedTime) { showError(`Please enter ${settings.label} time`); return; }

    const entryTime = `${attendanceDate}T${selectedTime}`;
    const payload = { attendanceDate, time: selectedTime, entryTime, [settings.payloadField]: entryTime };

    try {
      setLoading(true);

      switch (action) {
        case "checkin": {
          const status = getCheckinStatus(selectedTime);
          await employeeService.checkIn(payload);
          setCheckinStatus(status);
          if (status === "late") {
            const newCount = lateCount + 1;
            setLateCount(newCount);
            if (newCount > MAX_LATE_ALLOWED) {
              showError(`🔴 ${newCount} late check-ins! A half-day will be deducted.`);
            } else {
              showError(`🟡 Late check-in! ${newCount}/${MAX_LATE_ALLOWED} late marks used.`);
            }
          }
          break;
        }
        case "lunchstart": await employeeService.lunchStart(payload); break;
        case "lunchend":   await employeeService.lunchEnd(payload);   break;
        case "breakstart": await employeeService.breakStart(payload); break;
        case "breakend":   await employeeService.breakEnd(payload);   break;
        case "checkout": {
          const half = isHalfDay(selectedTime);
          await employeeService.checkOut(payload);
          setCheckoutHalfDay(half);
          if (half) showError("⚠️ Early checkout — attendance marked as Half Day.");
          break;
        }
      }

      showSuccess(settings.successMessage);
      setCompletedActions((prev) => new Set([...prev, action]));
      setRecordedTimes((prev) => ({ ...prev, [action]: formatDisplayTime(entryTime) }));
    } catch (error: any) {
      showError(error?.response?.data?.message || "Operation Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Time Entry</h4>
          <small className="text-muted">Manual Attendance Entry</small>
        </div>
      </div>

      {/* Policy Info */}
      <div className="alert alert-info py-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius: "10px", fontSize: "13px" }}>
        <span>ℹ️</span>
        <span>
          Check-in buffer: <strong>9:00 AM – 10:00 AM</strong> (on time). After <strong>10:00 AM</strong> = Late.
          Max <strong>{MAX_LATE_ALLOWED} late marks</strong> allowed — exceeding causes a <strong>half-day deduction</strong>.
          Checkout before <strong>2:00 PM</strong> = <strong>Half Day</strong>.
        </span>
      </div>

      {/* Late count banner */}
      {lateCount > 0 && (
        <div className="alert py-2 mb-3 d-flex align-items-center gap-2" style={{
          borderRadius: "10px", fontSize: "13px",
          background: lateCount > MAX_LATE_ALLOWED ? "#fde8e8" : "#fff8e1",
          border: `1px solid ${lateCount > MAX_LATE_ALLOWED ? "#e63946" : "#f4a261"}`,
          color: lateCount > MAX_LATE_ALLOWED ? "#c1121f" : "#d46b00"
        }}>
          <span>{lateCount > MAX_LATE_ALLOWED ? "🔴" : "🟡"}</span>
          <span>
            {lateCount > MAX_LATE_ALLOWED
              ? `Half-day deduction applied — ${lateCount} late check-ins this month.`
              : `Late check-ins this month: ${lateCount} / ${MAX_LATE_ALLOWED} allowed.`}
          </span>
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">

          <div className="mb-4">
            <label className="form-label fw-semibold">Attendance Date</label>
            <DatePicker
              value={attendanceDate}
              onChange={setAttendanceDate}
              style={{ maxWidth: "220px" }}
            />
          </div>

          <div className="row g-3">
            {actionSettings.map((item) => {
              const isDone = completedActions.has(item.action);
              const isFixedTime = Boolean(item.fixedTime);

              // Live badge for checkin
              const liveCheckinStatus = item.action === "checkin" && !isDone && entryTimes.checkin
                ? getCheckinStatus(entryTimes.checkin) : null;

              // Live badge for checkout
              const liveHalfDay = item.action === "checkout" && !isDone && entryTimes.checkout
                ? isHalfDay(entryTimes.checkout) : false;

              return (
                <div className="col-xl-2 col-lg-4 col-md-6" key={item.action}>
                  <div className="border rounded-3 p-3 h-100" style={{
                    borderColor: isDone ? item.color + "88" : "#e0e0e0",
                    background: isDone ? item.color + "11" : "#fff"
                  }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0" style={{ color: item.color, fontSize: "13px" }}>
                        {item.label}
                      </label>
                      {isDone && (
                        <span className="badge" style={{ background: item.color, fontSize: "10px" }}>✓ Done</span>
                      )}
                    </div>

                    {/* Recorded time + status badge */}
                    {isDone && recordedTimes[item.action] && (
                      <div className="mb-2">
                        <div style={{
                          fontSize: "15px", fontWeight: 600, color: item.color,
                          border: `1px solid ${item.color}55`,
                          borderRadius: "8px", padding: "6px 10px",
                          background: item.color + "11", textAlign: "center"
                        }}>
                          {recordedTimes[item.action]}
                        </div>
                        {item.action === "checkin" && checkinStatus && (
                          <span className="badge mt-1" style={{
                            background: checkinStatus === "ontime" ? "#2ec4b6" : "#e63946", fontSize: "10px"
                          }}>
                            {checkinStatus === "ontime" ? "✅ On Time" : "⚠️ Late"}
                          </span>
                        )}
                        {item.action === "checkout" && checkoutHalfDay && (
                          <span className="badge mt-1" style={{ background: "#e63946", fontSize: "10px" }}>
                            ⚠️ Half Day
                          </span>
                        )}
                      </div>
                    )}

                    {/* Time input — only show when not yet recorded */}
                    {!isDone && ((item.action === "lunchstart" || item.action === "lunchend") ? (
                      <input
                        type="time"
                        className="form-control mb-1"
                        style={{ fontSize: "13px" }}
                        value={lunchTimes[item.action]}
                        disabled={loading}
                        onChange={(e) => setLunchTimes((prev) => ({ ...prev, [item.action]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="time"
                        className="form-control mb-1"
                        style={{ fontSize: "13px" }}
                        value={item.fixedTime || entryTimes[item.action]}
                        disabled={isFixedTime || loading}
                        onChange={(e) => updateEntryTime(item.action, e.target.value)}
                      />
                    ))}

                    {/* Live preview badges */}
                    {liveCheckinStatus && (
                      <div className="mb-2">
                        <span className="badge" style={{
                          background: liveCheckinStatus === "ontime" ? "#2ec4b6" : "#e63946", fontSize: "10px"
                        }}>
                          {liveCheckinStatus === "ontime" ? "✅ On Time" : "⚠️ Late"}
                        </span>
                      </div>
                    )}
                    {liveHalfDay && (
                      <div className="mb-2">
                        <span className="badge" style={{ background: "#e63946", fontSize: "10px" }}>⚠️ Half Day</span>
                      </div>
                    )}

                    <button
                      className="btn btn-sm w-100 text-white mt-1"
                      style={{ background: isDone ? "#aaa" : item.color, border: "none", borderRadius: "8px" }}
                      disabled={isDone || loading}
                      onClick={() => performAction(item.action)}
                    >
                      {isDone ? `${item.label} Recorded` : `Save ${item.label}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeEntry;

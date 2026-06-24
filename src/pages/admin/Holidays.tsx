import { useEffect, useState, useMemo } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AppDataGrid from "../../components/common/AppDataGrid";
import DatePicker from "../../components/common/DatePicker";
import holidayService from "../../services/holidayService";
import type { Holiday } from "../../types/holiday";
import { showSuccess, showError, showWarning } from "../../utils/toast";
import { confirmDelete } from "../../utils/confirm";

function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");

  const getHolidayYear = (date: string) => Number(date.slice(0, 4));

  const formatDate = (val: string | null) => {
    if (!val) return "-";
    const [y, m, d] = val.slice(0, 10).split("-");

    if (!y || !m || !d) {
      return val;
    }

    return `${d}/${m}/${y}`;
  };

  const loadHolidays = async (year?: number) => {
    try {
      setLoading(true);
      const response = await holidayService.getHolidays(year);
      setHolidays(response.data);
    } catch {
      showError("Failed To Load Holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays(selectedYear || undefined);
  }, [selectedYear]);

  const addHoliday = async () => {
    if (!holidayName || !holidayDate) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      await holidayService.addHoliday({
        holidayName,
        holidayDate,
        year: Number(holidayDate.slice(0, 4))
      });

      showSuccess("Holiday Added Successfully");
      setHolidayName("");
      setHolidayDate("");
      loadHolidays();
    } catch {
      showError("Unable To Add Holiday");
    }
  };

  const deleteHoliday = async (holidayId: number) => {
    const confirmed = await confirmDelete();

    if (!confirmed) {
      return;
    }

    try {
      await holidayService.softDeleteHoliday(holidayId);
      showSuccess("Holiday Deleted Successfully");
      loadHolidays(selectedYear || undefined);
    } catch {
      showError("Unable To Delete Holiday");
    }
  };

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    holidays.forEach(h => {
      const y = getHolidayYear(h.holidayDate);

      if (!Number.isNaN(y)) {
        yearSet.add(y);
      }
    });

    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 2; y <= currentYear + 2; y++) {
      yearSet.add(y);
    }
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [holidays]);

  const filteredHolidays = selectedYear
    ? holidays
        .filter(h => getHolidayYear(h.holidayDate) === selectedYear)
        .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
    : [];

  const columns: GridColDef[] = [
    {
      field: "srNo",
      headerName: "Sr. No.",
      width: 80,
      sortable: false
    },
    {
      field: "holidayDate",
      headerName: "Date",
      flex: 1,
      valueFormatter: (val) => formatDate(val)
    },
    {
      field: "holidayName",
      headerName: "Holiday Name",
      flex: 1
    },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          color="error"
          variant="contained"
          size="small"
          onClick={() => deleteHoliday(params.row.holidayId)}
        >
          Delete
        </Button>
      )
    }
  ];

  const rows = filteredHolidays.map((h, index) => ({
    id: h.holidayId,
    holidayId: h.holidayId,
    holidayName: h.holidayName,
    holidayDate: h.holidayDate,
    srNo: index + 1
  }));

  return (
    <div>
      <h2>Holiday Management</h2>

      <div className="card p-3 mt-3">
        <div className="mb-3">
          <label className="form-label fw-semibold">Add Holiday</label>
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label">Date</label>
            <DatePicker
              value={holidayDate}
              onChange={setHolidayDate}
            />
          </div>

          <div className="col-12 col-md-5">
            <TextField
              label="Holiday Name"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              fullWidth
              size="small"
            />
          </div>

          <div className="col-12 col-md-2">
            <Button
              variant="contained"
              onClick={addHoliday}
              className="w-100"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="card p-3 mt-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "" ? "" : Number(e.target.value))}
              className="form-select"
            >
              <option value="">Select Year</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedYear && (
          <div className="mt-4">
            <AppDataGrid
              rows={rows}
              columns={columns}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Holidays;

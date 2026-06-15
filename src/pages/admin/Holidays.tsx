import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AppDataGrid from "../../components/common/AppDataGrid";
import holidayService from "../../services/holidayService";
import type { Holiday } from "../../types/holiday";
import { showSuccess, showError, showWarning } from "../../utils/toast";
import { confirmDelete } from "../../utils/confirm";

function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const response = await holidayService.getHolidays();
      setHolidays(response.data);
    } catch {
      showError("Failed To Load Holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const addHoliday = async () => {
    if (!holidayName || !holidayDate) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      await holidayService.addHoliday({
        holidayName,
        holidayDate
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
      await holidayService.deleteHoliday(holidayId);
      showSuccess("Holiday Deleted Successfully");
      loadHolidays();
    } catch {
      showError("Unable To Delete Holiday");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "holidayName",
      headerName: "Holiday Name",
      flex: 1
    },
    {
      field: "holidayDate",
      headerName: "Holiday Date",
      flex: 1
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
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

  const filteredHolidays = holidays.filter(
    x => x.holidayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Holiday Management</h2>

      <div className="card p-3 mt-3">
        <h5>Add Holiday</h5>

        <TextField
          label="Holiday Name"
          value={holidayName}
          onChange={(e) => setHolidayName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          type="date"
          value={holidayDate}
          onChange={(e) => setHolidayDate(e.target.value)}
          fullWidth
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Button
          variant="contained"
          onClick={addHoliday}
        >
          Add Holiday
        </Button>
      </div>

      <div className="mt-4">
        <TextField
          label="Search Holiday"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <AppDataGrid
          rows={filteredHolidays}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default Holidays;
import api from "../api/axios";

interface HolidayPayload {
    holidayName: string;

    holidayDate: string;

    year: number;
}

const holidayService = {

    getHolidays: (
        year?: number
    ) =>
        api.get(
            "/api/Holiday",
            {
                params:
                {
                    year
                }
            }
        ),

    addHoliday: (
        data: HolidayPayload
    ) =>
        api.post(
            "/api/Holiday",
            data
        ),

    updateHoliday: (
        id: number,
        data: any
    ) =>
        api.put(
            `/api/Holiday/${id}`,
            data
        ),

    softDeleteHoliday: (
        id: number
    ) =>
        api.post(
            `/api/Holiday/Delete/${id}`
        ),

    deleteHoliday: (
        id: number
    ) =>
        api.delete(
            `/api/Holiday/${id}`
        )
};

export default holidayService;

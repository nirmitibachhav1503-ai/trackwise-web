import api from "../api/axios";

const holidayService = {

    getHolidays: () =>
        api.get(
            "/api/Holiday"
        ),

    addHoliday: (
        data: any
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

    deleteHoliday: (
        id: number
    ) =>
        api.delete(
            `/api/Holiday/${id}`
        )
};

export default holidayService;
import type SectionSchedule from "../../../interfaces/section/SectionSchedule";

export async function fetchUpdateSectionSchedule (scheduleId : number, schedule : SectionSchedule):Promise<boolean> {
    const BASE = `http://localhost:8080/sections/updateSectionSchedule/${scheduleId}`;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(BASE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ day: schedule.day, startTime: schedule.startTime, endTime: schedule.endTime }),
        });
        if (!res.ok) {
            console.error("Request failed with status:", res.status);
            return false;
        }
        return res.ok;
    } catch {
        console.log("something went wrong");
        return false;
    }
}
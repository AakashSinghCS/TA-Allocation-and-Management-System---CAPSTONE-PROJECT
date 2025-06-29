export async function fetchAllExistingSemesters(deptCode: string, courseNum: string, section: string, year: number): Promise<string[] | null> {
    const BASE = `http://localhost:8080/courses/allSemesters?deptCode=${deptCode}&courseNum=${courseNum}&section=${section}&year=${year}`;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(BASE, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) {
            console.error("Request failed with status:", res.status);
            return null;
            // return ["W1"];
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        // return ["W1"];
        return null;
    }
}
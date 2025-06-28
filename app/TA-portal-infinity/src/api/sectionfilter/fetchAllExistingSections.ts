export async function fetchAllExistingSections(deptCode:string, courseNum: string): Promise<string[] | null> {
    const BASE = "http://localhost:8080/mock/mock";
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
            // return null;
            return ["001","L01"];
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        return ["001","L01"];
        // return null;
    }
}
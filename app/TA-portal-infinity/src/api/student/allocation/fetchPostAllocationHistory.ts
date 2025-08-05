import type Section from "../../../interfaces/section/Section";

interface AllocationHistoryRequest {
  studentId: number;
  year: number;
  semester: string;
}

export async function fetchPostAllocationHistory(
  studentId: number,
  sections: Section[],
  initialSections: Section[]
): Promise<boolean> {
  const token = localStorage.getItem("token");

  // Identify which to delete (in initial, but not in current)
  const toDelete = initialSections.filter(init =>
    !sections.some(s => s.course?.id === init.course?.id)
  );

  // Identify which to add (in current, but not in initial)
  const initialKeys = new Set(
  initialSections.map(init =>
    `${init.course?.id}-${init.semester}-${init.year}`
  )
);

  const seen = new Set();
  const toAdd = sections.filter(s => {
    const key = `${s.course?.id}-${s.semester}-${s.year}`;

    if (initialKeys.has(key)) return false;
    
    if (seen.has(key)) return false;
    
    seen.add(key);
    return true;
  });

  // DELETE all that are gone
  for (const sec of toDelete) {
    const id = sec.course?.id;
    if (id == null) continue;
    const deleteUrl = `http://localhost:8080/courses/studentTaught/delete/${studentId}/${id}/${sec.semester}/${sec.year}`;
    try {
      const delRes = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!delRes.ok) {
        console.error("Failed to delete", deleteUrl, await delRes.text());
        return false;
      }
    } catch (err) {
      console.error("Delete request error:", err);
      return false;
    }
  }

  // POST all the new ones
  for (const sec of toAdd) {
    const details = sec;
    if (!details?.id || !details.year || !details.semester) {
      console.warn("Skipping invalid section", sec);
      continue;
    }

    const postUrl = `http://localhost:8080/courses/studentTaught/add/${details.course?.id}`;
    const body: AllocationHistoryRequest = {
      studentId,
      year: details.year,
      semester: details.semester,
    };

    try {
      const postRes = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!postRes.ok) {
        console.error("Failed to post", postUrl, await postRes.text());
        return false;
      }
    } catch (err) {
      console.error("Post request error:", err);
      return false;
    }
  }

  return true;
}

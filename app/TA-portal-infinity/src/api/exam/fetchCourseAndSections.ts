export async function fetchCourseByDeptAndNum(
  deptCode: string,
  courseNum: string,
  token: string
) {
  const res = await fetch(
    `http://localhost:8080/courses/getByDeptCodeAndCourseNum/${deptCode}/${courseNum}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error(`Course fetch failed with status ${res.status}`);
  return await res.json();
}

export async function fetchSectionsForCourse(
  deptCode: string,
  courseNum: string,
  token: string
) {
  const res = await fetch(
    `http://localhost:8080/courses/allSections?deptCode=${deptCode}&courseNum=${courseNum}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error(`Section fetch failed with status ${res.status}`);
  return await res.json();
}

export async function getSectionByCourseIdAndName(
  courseId: number,
  section: string,
  token: string
) {
  const url = `http://localhost:8080/courses/sections/getByCourseAndName?courseId=${courseId}&section=${encodeURIComponent(section)}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.json();
}

export async function fetchCourseById(courseId: number, token: string) {
  const res = await fetch(`http://localhost:8080/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch course");
  return await res.json();
}

export async function fetchSectionById(sectionId: number, token: string) {
  const res = await fetch(`http://localhost:8080/sections/get/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch section");
  return await res.json();
}


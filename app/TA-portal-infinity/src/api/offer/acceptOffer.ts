
export const acceptOffer = async (allocationId: number) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:8080/allocations/${allocationId}/acceptOffer`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to accept offer");
  }
  const text = await response.text();
  console.log('Accept offer raw response text:', text);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', e, 'Raw text:', text);
    return null;
  }

};

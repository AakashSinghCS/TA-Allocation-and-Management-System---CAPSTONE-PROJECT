
export const denyOffer = async (allocationId: number) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:8080/allocations/${allocationId}/denyOffer`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to deny offer");
  }

  // Always parse as JSON, backend returns a number (e.g., 1)
  return response.json();
};

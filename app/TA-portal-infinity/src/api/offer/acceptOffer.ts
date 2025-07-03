
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

  return response.json();
};

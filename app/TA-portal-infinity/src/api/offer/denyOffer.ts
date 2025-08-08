
export const denyOffer = async (allocationId: number) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:8080/allocations/${allocationId}/denyOffer`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Just return the response object for status checking
  return response;
};

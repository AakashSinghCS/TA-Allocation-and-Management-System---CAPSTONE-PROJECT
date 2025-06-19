// add caching here later using react-query library. Make it be an optional field to the interface below.
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

interface GenericContainerProps<T> {
  fetchFunction: () => Promise<T>;
  render: (data: T) => JSX.Element;
}

export function GenericAPIContainer<T>({
  fetchFunction,
  render,
}: GenericContainerProps<T>) {
  const navigate = useNavigate();
  const [data, setData] = useState<T>();

  useEffect(() => {
    fetchFunction()
      .then(setData)
      .catch((e: Error) =>
        navigate("/error", { replace: true, state: { message: e.message } })
      );
  }, [navigate, fetchFunction]);

  if (!data) return <p>Loading…</p>;
  return <>{render(data)}</>;
}
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

interface GenericContainerProps<T, P = {}> {
  fetchFunction: () => Promise<T>;
  render: (data: T, extra: P) => JSX.Element;
  extra?: P;
}

export function GenericAPIContainer<T, P={}>({
  fetchFunction,
  render,
  extra
}: GenericContainerProps<T,P>) {
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
  return <>{render(data, extra as P)}</>;
}
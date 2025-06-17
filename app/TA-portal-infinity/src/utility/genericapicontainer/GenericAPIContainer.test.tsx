import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { GenericAPIContainer } from "./GenericAPIContainer";

const renderMock = (data: string) => <div>Data: {data}</div>;

const successfulFetch = () => Promise.resolve("hello world");
const failingFetch = () => Promise.reject(new Error("fetch failed"));

describe("GenericAPIContainer", () => {
  it("shows loading initially", () => {
    render(
      <MemoryRouter>
        <GenericAPIContainer fetchFunction={successfulFetch} render={renderMock} />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders fetched data", async () => {
    render(
      <MemoryRouter>
        <GenericAPIContainer fetchFunction={successfulFetch} render={renderMock} />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Data: hello world")).toBeInTheDocument();
    });
  });

  it("redirects to error page on fetch failure", async () => {
    const LocationLogger = () => {
      const location = useLocation();
      return <div data-testid="location">{location.pathname}</div>;
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <GenericAPIContainer fetchFunction={failingFetch} render={renderMock} />
        <LocationLogger />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/error");
    });
  });
});

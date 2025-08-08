import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AssignedStudentsList from "../../../pages/coordinator/exampage/AssignedStudentsList";
import { AuthContext } from "../../../context/AuthContext";
import { vi } from "vitest";


const mockAssignments = [
  {
    id: 1,
    examId: 10,
    studentId: 100,
    task: "Marking",
    startTime: "10:00",
    endTime: "12:00"
  }
];

const mockStudent = {
  id: 100,
  firstName: "John",
  lastName: "Doe",
  studentNum: 1234567,
  dept: "COSC",
  year: 2022
};

const mockToken = "mocked_token";

beforeEach(() => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockAssignments
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudent
    });
});

afterEach(() => {
  vi.resetAllMocks();
});

it("renders loading and then assigned student", async () => {
  render(
    <AuthContext.Provider
        value={{
            token: mockToken,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
            userRoles: [],
            userId: 1,
        }}
      >
      <AssignedStudentsList examId={10} />
    </AuthContext.Provider>
  );

  await waitFor(() => {
    expect(screen.getByText("Assigned Students:")).toBeInTheDocument();
    expect(screen.getByText("John Doe (1234567)")).toBeInTheDocument();
    expect(screen.getByText("Task: Marking", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("10:00 - 12:00", { exact: false })).toBeInTheDocument();
  });
});


it("clicking Delete triggers unassign", async () => {
  const mockDeleteResponse = { ok: true, json: async () => ({}) };

  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => mockAssignments })
    .mockResolvedValueOnce({ ok: true, json: async () => mockStudent })
    .mockResolvedValueOnce(mockDeleteResponse)
    .mockResolvedValueOnce({ ok: true, json: async () => [] });

  render(
    <AuthContext.Provider
      value={{
        token: mockToken,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
        userRoles: [],
        userId: 1,
      }}
    >
      <AssignedStudentsList examId={10} />
    </AuthContext.Provider>
  );

  await waitFor(() => {
    expect(screen.getByText("John Doe (1234567)")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText("Delete"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/exams/assignments/1",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    );
  });
});


// it("clicking Update opens modal", async () => {
//   render(
//     <AuthContext.Provider
//         value={{
//             token: mockToken,
//             login: vi.fn(),
//             logout: vi.fn(),
//             isAuthenticated: true,
//             userRoles: [],
//             userId: 1,
//         }}
//       >
//       <AssignedStudentsList examId={10} />
//     </AuthContext.Provider>
//   );

//   await waitFor(() => {
//     expect(screen.getByText("John Doe (1234567)")).toBeInTheDocument();
//   });

//   fireEvent.click(screen.getByText("Update"));

//   await waitFor(() => {
//     expect(screen.getByText("Update Assignment"))
//       .toBeInTheDocument();
//   });
// });
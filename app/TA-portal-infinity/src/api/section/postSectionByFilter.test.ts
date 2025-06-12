import { describe, it, expect, vi, afterEach } from 'vitest';
import { postSectionByFilter } from './postSectionByFilter';

// Mock the global fetch function before each test
global.fetch = vi.fn();

// Mock console.error to avoid polluting the test output during error tests
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('postSectionByFilter', () => {

  // Clean up mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test Case 1: Successful API call
  it('should call fetch with the correct payload and handle a successful response', async () => {
    // Arrange: Prepare the test
    const mockSuccessResponse = { message: 'Course created successfully' };
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse),
    });

    const filterData = {
      term: "Fall 2025",
      searchQuery: "Advanced JavaScript",
      deptCode: "COSC",
      type: "Lecture",
    };

    // Act: Run the function
    await postSectionByFilter(filterData);

    // Assert: Check the results
    const expectedApiEndpoint = 'http://localhost:5173/courses';
    const expectedPayload = {
      sectionDetails: {
        id: 0,
        courseNum: "000",
        section: "000",
        name: "Advanced JavaScript",
        deptCode: "COSC",
        term: "Fall 2025",
        type: "Lecture",
      },
      sectionSchedule: [],
    };

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expectedApiEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedPayload),
      })
    );
  });

  // Test Case 2: Failed API call
  it('should handle a failed API response', async () => {
    // Arrange: Prepare the test for a failure
    (fetch as vi.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const filterData = {
      term: "Spring 2025",
      searchQuery: "Database Systems",
      deptCode: "DATA",
      type: "Laboratory",
    };

    // Act: Run the function
    await postSectionByFilter(filterData);

    // Assert: Check that an error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to post section data:',
      expect.any(Error)
    );
  });
});
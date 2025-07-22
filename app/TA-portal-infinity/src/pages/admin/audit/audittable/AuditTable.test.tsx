import { render, screen, fireEvent } from '@testing-library/react';
import AuditTable from './AuditTable';
import type AuditEvent from '../../../../interfaces/admin/audit/AuditEvent';
import { vi } from 'vitest';

describe('AuditTable (with updated AuditEvent interface)', () => {
  const mockEvents: AuditEvent[] = [
    {
      id: 1,
      timestamp: '2025-07-16T08:30:00Z',
      actorId: 11,
      actorName: 'Alice Smith',
      action: 'CREATE',
      entityType: 'User',
      entityId: 101,
      entityName: 'Bob Johnson',
      summary: 'Created a user',
      service: 'user-service',
      beforeJson: '{"foo":"bar"}',
      afterJson: '{"foo":"baz"}',
    },
    {
      id: 2,
      timestamp: '2025-07-16T08:30:00Z',
      actorId: 22,
      actorName: 'Carol Lee',
      action: 'UPDATE',
      entityType: 'Book',
      entityId: 'ISBN-1234',
      entityName: 'JavaScript Basics',
      summary: 'Updated book title',
      service: 'catalog-service',
    },
  ];

  beforeAll(() => {
    vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => '08:30 UTC');
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders a loading indicator when loading=true', () => {
    render(<AuditTable events={[]} loading={true} onSelect={vi.fn()} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders headers and rows correctly, and handles row clicks', () => {
    const onSelect = vi.fn();
    render(<AuditTable events={mockEvents} loading={false} onSelect={onSelect} />);

    // Check headers
    ['When', 'Service', 'Actor Id', 'Action', 'Entity'].forEach(header => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    // Actor name and ID combined
    expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    expect(screen.getByText(/\(11\)/)).toBeInTheDocument();

    // Entity name and ID combined
    expect(screen.getByText(/Bob Johnson/)).toBeInTheDocument();
    expect(screen.getByText(/User #101/)).toBeInTheDocument();

    // Second row
    expect(screen.getByText(/Carol Lee/)).toBeInTheDocument();
    expect(screen.getByText(/\(22\)/)).toBeInTheDocument();
    expect(screen.getByText(/JavaScript Basics/)).toBeInTheDocument();
    expect(screen.getByText(/Book #ISBN-1234/)).toBeInTheDocument();

    // Clicking the second row
    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[2]); // second data row
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});

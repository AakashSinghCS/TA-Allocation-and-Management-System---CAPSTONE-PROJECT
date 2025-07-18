import { render, screen, fireEvent } from '@testing-library/react';
import AuditTable from './AuditTable';
import type AuditEvent from '../../../../interfaces/admin/audit/AuditEvent';
import { vi } from 'vitest';

describe('AuditTable (with updated AuditEvent interface)', () => {
  // Two mock events: one numeric entityId, one string
  const mockEvents: AuditEvent[] = [
    {
      id: 1,
      timestamp: '2025-07-16T08:30:00Z',
      actorId: 11,
      action: 'CREATE',
      entityType: 'User',
      entityId: 101,            // number
      summary: 'Created a user',
      service: 'user-service',
      beforeJson: '{"foo":"bar"}',
      afterJson: '{"foo":"baz"}',
    },
    {
      id: 2,
      timestamp: '2025-07-16T08:30:00Z',
      actorId: 22,
      action: 'UPDATE',
      entityType: 'Book',
      entityId: 'ISBN-1234',    // string
      summary: 'Updated book title',
      service: 'catalog-service',
      // beforeJson/afterJson omitted to test optionality
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

    // Check column headers
    ['When', 'Service', 'Actor Id', 'Action', 'Entity'].forEach((header) => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    // Check first row cells
    expect(
        screen.getAllByRole('cell', { name: '08:30 UTC' })[0]
        ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'user-service' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '11' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'CREATE' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'User, ID: 101' })
    ).toBeInTheDocument();

    // Check second row cells (string entityId)
    expect(
        screen.getAllByRole('cell', { name: '08:30 UTC' })[1]
        ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'catalog-service' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '22' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'UPDATE' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Book, ID: ISBN-1234' })
    ).toBeInTheDocument();

    // Clicking the second row should call onSelect with id=2
    const rows = screen.getAllByRole('row');
    const secondDataRow = rows[2]; // index 0 = header, 1 = first, 2 = second
    fireEvent.click(secondDataRow);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});

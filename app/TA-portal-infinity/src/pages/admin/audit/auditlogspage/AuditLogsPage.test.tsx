import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuditLogsPage from './AuditLogsPage';
import { vi } from 'vitest';

// 1️⃣ Mock the data‐fetching hook
const mockRefetch = vi.fn();
vi.mock('../../../../api/admin/audit/useAuditEvents', () => ({
  useAuditEvents: vi.fn(() => ({
    data: {
      content: [
        { /* minimal event shape */ id: 1, service: 'svc', actorId: 7, action: 'CREATE', entityType: 'E', entityId: 5, timestamp: '2025-01-01T00:00:00Z', beforeJson: '{}', afterJson: '{}' },
      ],
      totalPages: 2,
    },
    isLoading: false,
    refetch: mockRefetch,
  })),
}));

// 2️⃣ Mock all child components to simplify behavior
vi.mock('../auditfilters/AuditFilters', () => ({
  __esModule: true,
  default: (props: any) => (
    <button
      data-testid="apply-filters"
      onClick={() => {
        // simulate user filling in drafts and clicking apply
        props.onServiceChange('new-svc');
        props.onEntityChange('Ent');
        props.onEntityIdChange(42);
        props.onActionChange('UPDATE');
        props.onActorIdChange(99);
        props.onWhenChange('2025-02-02');
        props.onApply();
      }}
    >
      Apply
    </button>
  ),
}));

vi.mock('../audittable/AuditTable', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="audit-table">
      {/* show how many events */}
      {props.loading ? 'loading' : `rows:${props.events.length}`}
      <button
        data-testid="select-row"
        onClick={() => props.onSelect(123)}
      >
        Select
      </button>
    </div>
  ),
}));

vi.mock('../../../../utility/pagination/pagination/Pagination', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="pagination">
      page:{props.page}/of:{props.pageCount}
      <button data-testid="prev" onClick={props.onPrev}>
        Prev
      </button>
      <button data-testid="next" onClick={props.onNext}>
        Next
      </button>
    </div>
  ),
}));

vi.mock('../auditdetailmodal/AuditDetailModal', () => ({
  __esModule: true,
  default: (props: any) =>
    props.id != null ? (
      <div data-testid="detail-modal">
        Modal: id={props.id}, svc={props.serviceFilter}
        <button data-testid="close-modal" onClick={props.onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

// Mock ToastContainer so it doesn't break render
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toaster" />,
  toast: { error: vi.fn() },
}));

describe('AuditLogsPage', () => {
  beforeEach(() => {
    mockRefetch.mockClear();
  });

  it('renders table and pagination with initial state', () => {
    render(<AuditLogsPage />);

    // Apply filters to show the table
    fireEvent.click(screen.getByTestId('apply-filters'));

    // Table should show one row
    expect(screen.getByTestId('audit-table')).toHaveTextContent('rows:1');

    // Pagination: page 0 of 2
    expect(screen.getByTestId('pagination')).toHaveTextContent('page:0/of:2');
  });

  it('increments page on Next click', () => {
    render(<AuditLogsPage />);
    
    // Apply filters to show the table
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    fireEvent.click(screen.getByTestId('next'));

    // Now page should be 1
    expect(screen.getByTestId('pagination')).toHaveTextContent('page:1/of:2');
  });

  it('calls refetch and resets to page 0 on Apply filters', async () => {
    render(<AuditLogsPage />);

    // Apply filters to show the table initially
    fireEvent.click(screen.getByTestId('apply-filters'));

    // move to page 1 so we can see reset
    fireEvent.click(screen.getByTestId('next'));
    expect(screen.getByTestId('pagination')).toHaveTextContent('page:1');

    // click the Apply button again
    fireEvent.click(screen.getByTestId('apply-filters'));

    // refetch should be called once more (was called once already)
    expect(mockRefetch).toHaveBeenCalledTimes(2);

    // page should reset back to 0
    await waitFor(() =>
      expect(screen.getByTestId('pagination')).toHaveTextContent('page:0')
    );
  });

  it('opens detail modal when a row is selected and closes it', () => {
    render(<AuditLogsPage />);

    // Apply filters to show the table
    fireEvent.click(screen.getByTestId('apply-filters'));

    // no modal initially
    expect(screen.queryByTestId('detail-modal')).toBeNull();

    // click the "Select" button in the table
    fireEvent.click(screen.getByTestId('select-row'));

    // modal should show up with id=123 and default serviceFilter=''
    expect(screen.getByTestId('detail-modal')).toHaveTextContent(
      'Modal: id=123, svc='
    );

    // close it
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('detail-modal')).toBeNull();
  });
});

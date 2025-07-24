import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AllocationBanner from './AllocationBanner';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type Section from '../../../../interfaces/section/Section';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';

// ---------- Hoisted mocks ----------
type DeallocateFn = (allocationId: number, token?: string) => Promise<boolean>;

const mocks = vi.hoisted(() => ({
  deallocateMock: vi.fn<DeallocateFn>(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../../../api/allocation/deallocateAllocation', () => ({
  deallocateAllocation: mocks.deallocateMock,
}));

vi.mock('react-toastify', () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

// ---------- Test data helpers ----------
function makeApp(): ApplicationDto {
  return {
    applicationId: 11,
    student: { id: 7, firstName: 'Ada', lastName: 'Lovelace' } as any,
    wantWorkingHours: 12,
  } as ApplicationDto;
}

function makeSection(): Section {
  return {
    id: 99,
    course: { deptCode: 'COSC', courseNum: '101' } as any,
    section: '001',
  } as unknown as Section;
}

function makeHistory(withMatch = true): Allocation[] {
  return withMatch
    ? [{ id: 555, application: { applicationId: 11 } as any, section: { id: 99 } as any } as Allocation]
    : [{ id: 777, application: { applicationId: 222 } as any, section: { id: 123 } as any } as Allocation];
}

// ---------- Render helper ----------
const setup = ({
  showBanner = true,
  historyMatch = true,
}: {
  showBanner?: boolean;
  historyMatch?: boolean;
} = {}) => {
  const selApp = makeApp();
  const selCourse = makeSection();
  const setSelApp = vi.fn();
  const refreshHistory = vi.fn();
  const setShowBanner = vi.fn();

  const token = 'fake-token';
  const history = makeHistory(historyMatch);

  render(
    <AllocationBanner
      selApp={selApp}
      setSelApp={setSelApp}
      selCourse={selCourse}
      refreshHistory={refreshHistory}
      token={token}
      history={history}
      showBanner={showBanner}
      setShowBanner={setShowBanner}
    />
  );

  return { selApp, selCourse, setSelApp, refreshHistory, token, history, setShowBanner };
};

// ---------- Tests ----------
describe('AllocationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct text when showBanner=true (new offer just sent)', () => {
    setup({ showBanner: true });

    expect(screen.getByText('Offer Sent')).toBeInTheDocument();
    expect(screen.getByText(/You’ve sent an offer to/)).toBeInTheDocument();
    expect(screen.getByText(/They’ve been offered 12 hours\./)).toBeInTheDocument();
  });

  it('renders correct text when showBanner=false (existing offer)', () => {
    setup({ showBanner: false });

    expect(screen.getByText('Existing Offer')).toBeInTheDocument();
    expect(screen.getByText(/An offer was already sent to/)).toBeInTheDocument();
    expect(screen.getByText(/They were offered 12 hours earlier\./)).toBeInTheDocument();
  });

  it('clicking Revoke deallocates, updates state, refreshes history, and shows success toast', async () => {
    const { setShowBanner, setSelApp, refreshHistory, selApp, token } = setup({
      showBanner: true,
      historyMatch: true,
    });

    mocks.deallocateMock.mockResolvedValueOnce(true);

    fireEvent.click(screen.getByRole('button', { name: /revoke/i }));

    await waitFor(() => expect(mocks.deallocateMock).toHaveBeenCalledTimes(1));
    expect(mocks.deallocateMock).toHaveBeenCalledWith(555, token);

    expect(setShowBanner).toHaveBeenCalledWith(false);
    expect(setSelApp).toHaveBeenCalledWith(null);

    await waitFor(() => expect(refreshHistory).toHaveBeenCalledWith(selApp.student.id, token));

    expect(mocks.toastSuccess).toHaveBeenCalledWith('Offer revoked successfully.');
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('handles failed deallocation (API returns false) and shows error toast', async () => {
    const { setShowBanner, setSelApp, refreshHistory } = setup({
      showBanner: true,
      historyMatch: true,
    });

    mocks.deallocateMock.mockResolvedValueOnce(false);

    fireEvent.click(screen.getByRole('button', { name: /revoke/i }));

    await waitFor(() => expect(mocks.deallocateMock).toHaveBeenCalled());

    expect(setShowBanner).not.toHaveBeenCalled();
    expect(setSelApp).not.toHaveBeenCalled();
    expect(refreshHistory).not.toHaveBeenCalled();

    expect(mocks.toastError).toHaveBeenCalledWith('Failed to revoke Offer.');
  });

  it('does nothing if matching allocation is not found', async () => {
    const { setShowBanner, setSelApp, refreshHistory } = setup({
      showBanner: true,
      historyMatch: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /revoke/i }));

    expect(mocks.deallocateMock).not.toHaveBeenCalled();
    expect(setShowBanner).not.toHaveBeenCalled();
    expect(setSelApp).not.toHaveBeenCalled();
    expect(refreshHistory).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });
});

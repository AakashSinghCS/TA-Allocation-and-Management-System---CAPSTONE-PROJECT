import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import EditSectionSchedule from '../editsectionschedule/EditSectionSchedule';
import type SectionSchedule from '../../../../interfaces/section/SectionSchedule';

describe('EditSectionSchedule component', () => {
  const initial: SectionSchedule = { id: 1, day: 'Tue', startTime: '09:00', endTime: '10:00' };
  const onSave: Mock = vi.fn(async () => true);
  const onCancel: Mock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial schedule values', () => {
    render(<EditSectionSchedule initial={initial} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByDisplayValue('Tue')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
  });

  it('calls onSave with correct schedule when Save clicked', () => {
    render(<EditSectionSchedule onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByDisplayValue('Mon'), { target: { value: 'Fri' } });
    fireEvent.change(screen.getByDisplayValue('00:00'), { target: { value: '08:30' } });
    fireEvent.change(screen.getByDisplayValue('00:30'), { target: { value: '09:30' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ day: 'Fri', startTime: '08:30', endTime: '09:30' }));
  });

  it('calls onCancel when Cancel clicked', () => {
    render(<EditSectionSchedule onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
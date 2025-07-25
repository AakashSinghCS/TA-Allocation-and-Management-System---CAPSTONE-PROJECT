import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';
import { vi } from 'vitest';

describe('Pagination', () => {
  it('renders with Prev disabled on first page and Next enabled', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<Pagination page={0} pageCount={3} onPrev={onPrev} onNext={onNext} />);

    const prevButton = screen.getByRole('button', { name: /prev/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(screen.getByLabelText('Page 1 of 3')).toBeInTheDocument();

    // Prev should be disabled on first page
    expect(prevButton).toBeDisabled();
    // Next should be enabled
    expect(nextButton).toBeEnabled();
    // Label should show correct page numbers (1-based)

    // Clicking disabled Prev does nothing
    fireEvent.click(prevButton);
    expect(onPrev).not.toHaveBeenCalled();

    // Clicking Next calls onNext once
    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders with Next disabled on last page and Prev enabled', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    // pageCount = 3 means pages 0,1,2; here page=2 is last
    render(<Pagination page={2} pageCount={3} onPrev={onPrev} onNext={onNext} />);

    const prevButton = screen.getByRole('button', { name: /prev/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(screen.getByLabelText('Page 3 of 3')).toBeInTheDocument();

    // Prev should be enabled
    expect(prevButton).toBeEnabled();
    // Next should be disabled on last page
    expect(nextButton).toBeDisabled();
    // Label should show correct page number

    // Clicking Prev calls onPrev once
    fireEvent.click(prevButton);
    expect(onPrev).toHaveBeenCalledTimes(1);

    // Clicking disabled Next does nothing
    fireEvent.click(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('renders with both buttons enabled for a middle page', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<Pagination page={1} pageCount={4} onPrev={onPrev} onNext={onNext} />);

    const prevButton = screen.getByRole('button', { name: /prev/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(screen.getByLabelText('Page 2 of 4')).toBeInTheDocument();

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(prevButton);
    fireEvent.click(nextButton);
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

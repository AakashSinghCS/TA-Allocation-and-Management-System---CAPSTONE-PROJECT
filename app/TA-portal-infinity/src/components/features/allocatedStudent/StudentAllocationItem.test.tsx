import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentAllocationItem from './StudentAllocationItem';
import type { Allocation } from '../../../interfaces/allocation/Allocation';

const mockAllocation: Allocation = {
  id: 1,
  gradingHours: 15,
  student: {
    id: 123,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
  },
};

const mockAllocationWithoutEmail: Allocation = {
  id: 2,
  gradingHours: 20,
  student: {
    id: 456,
    firstName: 'John',
    lastName: 'Doe',
    email: undefined,
  },
};

const mockAllocationWithoutHours: Allocation = {
  id: 3,
  gradingHours: undefined,
  student: {
    id: 789,
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
  },
};

const mockAllocationWithoutStudent: Allocation = {
  id: 4,
  gradingHours: 10,
  student: undefined,
};

describe('StudentAllocationItem', () => {
  const renderWithRouter = (allocation: Allocation) => {
    return render(
      <BrowserRouter>
        <StudentAllocationItem allocation={allocation} />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderWithRouter(mockAllocation);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays student name correctly', () => {
    renderWithRouter(mockAllocation);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays student email when available', () => {
    renderWithRouter(mockAllocation);
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
  });

  it('does not display email when not available', () => {
    renderWithRouter(mockAllocationWithoutEmail);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('@')).not.toBeInTheDocument();
  });

  it('displays hours allocated correctly', () => {
    renderWithRouter(mockAllocation);
    expect(screen.getByText('15 Grading Hours')).toBeInTheDocument();
  });

  it('displays 0h when gradingHours is undefined', () => {
    renderWithRouter(mockAllocationWithoutHours);
    expect(screen.getByText('0 Grading Hours')).toBeInTheDocument();
  });

  it('displays student initials in avatar', () => {
    renderWithRouter(mockAllocation);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('handles student initials when only first name available', () => {
    const allocationWithOnlyFirstName: Allocation = {
      id: 5,
      gradingHours: 10,
      student: {
        id: 999,
        firstName: 'Alice',
        lastName: undefined,
        email: 'alice@example.com',
      },
    };
    
    renderWithRouter(allocationWithOnlyFirstName);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('creates correct link to student profile', () => {
    renderWithRouter(mockAllocation);
    const studentLink = screen.getByRole('link', { name: 'Jane Smith' });
    expect(studentLink).toHaveAttribute('href', '/user/profile/123');
  });

  it('has correct title attribute for accessibility', () => {
    renderWithRouter(mockAllocation);
    const studentLink = screen.getByRole('link', { name: 'Jane Smith' });
    expect(studentLink).toHaveAttribute('title', "Go to student's profile page");
  });

  it('applies hover effects with correct CSS classes', () => {
    const { container } = renderWithRouter(mockAllocation);
    const mainDiv = container.firstChild as HTMLElement;
    
    expect(mainDiv).toHaveClass(
      'flex',
      'items-center',
      'justify-between',
      'p-3',
      'rounded-md',
      'border',
      'border-gray-100',
      'hover:border-[#0089b2]',
      'hover:bg-blue-50',
      'transition-all',
      'duration-200',
      'group'
    );
  });

  it('displays avatar with correct styling', () => {
    renderWithRouter(mockAllocation);
    const avatar = screen.getByText('JS');
    
    expect(avatar).toHaveClass(
      'w-8',
      'h-8',
      'bg-[#040941]',
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
      'text-white',
      'font-bold',
      'text-xs'
    );
  });

  it('displays hours badge with correct styling', () => {
    renderWithRouter(mockAllocation);
    const hoursBadge = screen.getByText('15 Grading Hours');
    
    expect(hoursBadge).toHaveClass(
      'inline-flex',
      'items-center',
      'px-2',
      'py-1',
      'rounded',
      'bg-[#0089b2]',
      'text-white',
      'text-xs',
      'font-medium'
    );
  });

  it('handles missing student data gracefully', () => {
    renderWithRouter(mockAllocationWithoutStudent);
    
    // Should still render the hours
    expect(screen.getByText('10 Grading Hours')).toBeInTheDocument();
    
    // Should not crash when trying to access student properties
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('handles empty student names gracefully', () => {
    const allocationWithEmptyNames: Allocation = {
      id: 6,
      gradingHours: 5,
      student: {
        id: 888,
        firstName: '',
        lastName: '',
        email: 'empty@example.com',
      },
    };
    
    renderWithRouter(allocationWithEmptyNames);
    
    // Should still display email
    expect(screen.getByText('empty@example.com')).toBeInTheDocument();
    
    // Should display empty initials
    expect(screen.getByText('5 Grading Hours')).toBeInTheDocument();
  });

  it('maintains proper layout structure', () => {
    renderWithRouter(mockAllocation);
    
    // Check that the main container has two child sections
    const container = screen.getByText('Jane Smith').closest('div');
    expect(container?.parentElement?.children).toHaveLength(2); // Student info and hours badge sections
  });

  it('displays multiple students with different data correctly', () => {
    const { rerender } = renderWithRouter(mockAllocation);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('15 Grading Hours')).toBeInTheDocument();
    
    rerender(
      <BrowserRouter>
        <StudentAllocationItem allocation={mockAllocationWithoutEmail} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('20 Grading Hours')).toBeInTheDocument();
    expect(screen.queryByText('jane.smith@example.com')).not.toBeInTheDocument();
  });
});

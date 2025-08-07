import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ViewProfileQuestionsPage from './ViewProfileQuestionsPage';
import { vi } from 'vitest';

// Mock all the dependencies
vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render: renderProp }: any) => {
    const mockData = {
      roles: ['STUDENT'],
      id: 123,
      firstName: 'Test',
      lastName: 'User'
    };
    return <div data-testid="generic-api-container">{renderProp(mockData)}</div>;
  },
}));

vi.mock('../../../api/user/fetchUserDetails', () => ({
  fetchUserDetails: vi.fn(() => Promise.resolve({
    roles: ['STUDENT'],
    id: 123,
    firstName: 'Test',
    lastName: 'User'
  })),
}));

vi.mock('../../../api/question/fetchAllStudentQuestion', () => ({
  fetchAllStudentQuestions: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../../../components/layout/tabnav/TabNav', () => ({
  default: ({ roles }: { roles: string[] }) => (
    <div data-testid="tab-nav" data-roles={JSON.stringify(roles)}>Tab Navigation</div>
  ),
}));

vi.mock('../taprofilepage/profilequestionssection/ProfileQuestionsSection', () => ({
  default: () => (
    <div data-testid="profile-questions-section">Profile Questions Section</div>
  ),
}));

describe('ViewProfileQuestionsPage', () => {
  const renderComponent = (userId: string = '123') => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/profile-questions/${userId}`]}>
          <ViewProfileQuestionsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders the main container with correct styling', () => {
    const { container } = renderComponent();
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('mx-auto', 'space-y-6', 'p-4');
  });

  it('renders the info message about profile questions', () => {
    renderComponent();
    
    expect(screen.getByText(/Below are the answers provided by the student/)).toBeInTheDocument();
    expect(screen.getByText(/These answers help in understanding the student's background/)).toBeInTheDocument();
  });

  it('renders GenericAPIContainer components', () => {
    renderComponent();
    
    const containers = screen.getAllByTestId('generic-api-container');
    expect(containers).toHaveLength(2);
  });

  it('renders TabNav component with user roles', () => {
    renderComponent();
    
    expect(screen.getByTestId('tab-nav')).toBeInTheDocument();
  });

  it('renders ProfileQuestionsSection component', () => {
    renderComponent();
    
    expect(screen.getByTestId('profile-questions-section')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TasksOverview from '../TasksOverview';

describe('TasksOverview', () => {
  const deadlines = [
    { name: 'test_deadline', startTime: '', endTime: new Date(Date.now() + 86400000).toISOString() },
  ];
  const daysUntilList = [1];
  const formatDeadlineName = (name: string) => name;

  it('renders tasks overview with deadlines and profile questions', () => {
    render(
      <MemoryRouter>
        <TasksOverview
          totalDeadlines={3}
          activeDeadlines={1}
          deadlines={deadlines}
          daysUntilList={daysUntilList}
          formatDeadlineName={formatDeadlineName}
          progressColor="text-green-700"
          tasksDash1={50}
          tasksDash2={50}
          sectionsNeedingTAs={2}
          profileDash1={60}
          profileDash2={40}
          profileColor="text-yellow-700"
          questionsCount={4}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Tasks Overview')).toBeInTheDocument();
    expect(screen.getByText('Deadline(s)')).toBeInTheDocument();
    expect(screen.getByText('Profile Question(s)')).toBeInTheDocument();
    expect(screen.getByText('Courses Requiring TAs')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

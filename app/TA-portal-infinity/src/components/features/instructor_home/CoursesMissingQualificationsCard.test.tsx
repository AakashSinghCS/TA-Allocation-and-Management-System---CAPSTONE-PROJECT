import { render, screen } from '@testing-library/react';
import { CoursesMissingQualificationsCard } from './CoursesMissingQualificationsCard';

describe('CoursesMissingQualificationsCard', () => {
  it('renders missing qualifications card', () => {
    render(
      <CoursesMissingQualificationsCard
        sections={[]}
        qualifications={[]}
        userId={"1"}
      />
    );
    expect(screen.getByText(/Courses Missing Skills\/TA Qualifications/)).toBeInTheDocument();
  });
});

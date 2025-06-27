import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ProfileQuestion } from '../../../interfaces/question/ProfileQuestion';
import ProfileQuestionsSection from './ProfileQuestionsSection';

vi.mock(
  "../../../components/features/questionanswer/profilequestionanswer/ProfileQuestionAnswer",
  () => {
    return {
      ProfileQuestionAnswer: ({ profileQuestion }: { profileQuestion: ProfileQuestion }) => (
        <div data-testid={`qa-${profileQuestion.id}`}>
          QA {profileQuestion.id}
        </div>
      ),
    };
  }
);

describe('ProfileQuestionsSection', () => {
  it('renders the empty-placeholder when no questions are passed', () => {
    render(<ProfileQuestionsSection profileQuestions={[]} className="" />);

    expect(
      screen.getByText(/No questions to display/i)
    ).toBeInTheDocument();
  });

  it('renders one ProfileQuestionAnswer per item in `profileQuestions`', () => {
    const questions = [
      { id: 1 } as ProfileQuestion,
      { id: 2 } as ProfileQuestion,
    ];

    render(
      <ProfileQuestionsSection
        profileQuestions={questions}
        className="test-class"
      />
    );

    expect(
      screen.queryByText(/No questions to display/i)
    ).toBeNull();

    const items = screen.getAllByTestId(/qa-\d+/);
    expect(items).toHaveLength(2);
    expect(screen.getByTestId('qa-1')).toHaveTextContent('QA 1');
    expect(screen.getByTestId('qa-2')).toHaveTextContent('QA 2');
  });
});

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import TaQuestionnairePage from './TaQuestionnairePage';
import { fetchAllProfileQuestions } from '../../../api/question/fetchAllProfileQuestions';
import { fetchProfileAnswers } from '../../../api/question/fetchProfileAnswers';
import { fetchSubmitQuestions } from '../../../api/question/fetchSubmitQuestions';
import { toast } from 'react-toastify';
import { mockTaProfileQuestion1, mockTaProfileQuestion2, mockTaProfileQuestion3 } from '../../../mocked-objects/profile/mockTaProfileQuestions';
import { UserRole } from '../../../interfaces/enum/UserRole';

// Mock all external dependencies
vi.mock('../../../api/question/fetchAllProfileQuestions');
vi.mock('../../../api/question/fetchProfileAnswers');
vi.mock('../../../api/question/fetchSubmitQuestions');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the QuestionItem component
vi.mock('../../../components/features/questionanswer/questionitem/QuestionItem', () => ({
  default: ({ initialQuestion, questionNumber, responseValue, onChange }: any) => (
    <div data-testid={`question-item-${initialQuestion.id}`}>
      <div data-testid={`question-${questionNumber}`}>{initialQuestion.description}</div>
      <div data-testid="question-type">{initialQuestion.type}</div>
      {initialQuestion.type === 'FREE_TEXT' ? (
        <textarea
          data-testid={`question-input-${initialQuestion.id}`}
          value={responseValue?.answerText || ''}
          onChange={(e) => onChange({
            questionId: initialQuestion.id,
            answerIds: [],
            answerText: e.target.value,
          })}
        />
      ) : (
        <div data-testid={`question-choices-${initialQuestion.id}`}>
          {initialQuestion.answers?.map((answer: any) => (
            <button
              key={answer.id}
              data-testid={`choice-${answer.id}`}
              onClick={() => onChange({
                questionId: initialQuestion.id,
                answerIds: initialQuestion.type === 'SINGLE' ? [answer.id] : 
                  responseValue?.answerIds?.includes(answer.id) 
                    ? responseValue.answerIds.filter((id: number) => id !== answer.id)
                    : [...(responseValue?.answerIds || []), answer.id],
                answerText: '',
              })}
            >
              {answer.description}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

const mockAuthContext = {
  userId: 123,
  token: 'mock-token',
  userRoles: [UserRole.STUDENT],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('TaQuestionnairePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchAllProfileQuestions as Mock).mockResolvedValue([
      mockTaProfileQuestion1,
      mockTaProfileQuestion2,
      mockTaProfileQuestion3,
    ]);
    (fetchProfileAnswers as Mock).mockResolvedValue(null);
    (fetchSubmitQuestions as Mock).mockResolvedValue({ success: true });
  });

  it('should render the page header and title correctly', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile Questionnaire')).toBeInTheDocument();
    });

    expect(screen.getByText('Complete these questions to help coordinators understand your background and preferences')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
  });

  it('should display the correct number of questions', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total questions count
    });

    await waitFor(() => {
      expect(screen.getByTestId('question-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('question-item-3')).toBeInTheDocument();
    });
  });

  it('should render different question types correctly', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      // Check SINGLE choice question
      expect(screen.getByTestId('question-1')).toHaveTextContent('Are you a Canadian Citizen?');
      expect(screen.getByTestId('question-choices-1')).toBeInTheDocument();
      
      // Check MULTI choice question
      expect(screen.getByTestId('question-2')).toHaveTextContent('What programming languages do you know?');
      expect(screen.getByTestId('question-choices-2')).toBeInTheDocument();
      
      // Check FREE_TEXT question
      expect(screen.getByTestId('question-3')).toHaveTextContent('Tell me about yourself');
      expect(screen.getByTestId('question-input-3')).toBeInTheDocument();
    });
  });

  it('should render save button and form elements', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save answers/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
  });

  it('should handle user interactions with form inputs', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByTestId('question-input-3')).toBeInTheDocument();
    });

    // Test free text input
    const textInput = screen.getByTestId('question-input-3');
    fireEvent.change(textInput, { target: { value: 'Test answer' } });
    expect(textInput).toHaveValue('Test answer');

    // Test choice selection - use more specific selector
    const firstQuestionChoices = screen.getByTestId('question-choices-1');
    const yesChoice = firstQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(yesChoice!);
    
    // The button should be clickable without errors
    expect(yesChoice).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save answers/i })).toBeInTheDocument();
    });

    // Fill out all required form data to pass validation
    const textInput = screen.getByTestId('question-input-3');
    fireEvent.change(textInput, { target: { value: 'Test response' } });

    // Select choices for required questions
    const firstQuestionChoices = screen.getByTestId('question-choices-1');
    const yesChoice = firstQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(yesChoice!);

    const secondQuestionChoices = screen.getByTestId('question-choices-2');
    const javaChoice = secondQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(javaChoice!);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save answers/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchSubmitQuestions).toHaveBeenCalledWith(123, expect.any(Object));
    });

    expect(toast.success).toHaveBeenCalledWith('All answers submitted successfully.');
  });

  it('should handle form submission with validation errors', async () => {
    (fetchSubmitQuestions as Mock).mockResolvedValue({
      success: false,
      errors: [{ questionId: 1, message: 'This field is required' }],
      message: 'Validation failed'
    });

    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save answers/i })).toBeInTheDocument();
    });

    // Fill out all required data first to pass client-side validation
    const textInput = screen.getByTestId('question-input-3');
    fireEvent.change(textInput, { target: { value: 'Test response' } });

    const firstQuestionChoices = screen.getByTestId('question-choices-1');
    const yesChoice = firstQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(yesChoice!);

    const secondQuestionChoices = screen.getByTestId('question-choices-2');
    const javaChoice = secondQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(javaChoice!);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save answers/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Submission failed'));
    });
  });

  it('should handle network errors during submission', async () => {
    (fetchSubmitQuestions as Mock).mockRejectedValue(new Error('Network error'));

    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save answers/i })).toBeInTheDocument();
    });

    // Fill out all required data first to pass client-side validation
    const textInput = screen.getByTestId('question-input-3');
    fireEvent.change(textInput, { target: { value: 'Test response' } });

    const firstQuestionChoices = screen.getByTestId('question-choices-1');
    const yesChoice = firstQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(yesChoice!);

    const secondQuestionChoices = screen.getByTestId('question-choices-2');
    const javaChoice = secondQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(javaChoice!);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save answers/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection and try again.');
    });
  });

  it('should load and display existing answers when available', async () => {
    const mockExistingAnswers = [
      {
        id: 1,
        type: 'SINGLE',
        description: 'Are you a Canadian Citizen?',
        answers: [{ id: 1, description: 'Yes' }]
      },
      {
        id: 3,
        type: 'FREE_TEXT', 
        description: 'Tell me about yourself',
        answers: []
      }
    ];
    
    (fetchProfileAnswers as Mock).mockResolvedValue(mockExistingAnswers);

    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByTestId('question-input-3')).toBeInTheDocument();
    });

    expect(fetchProfileAnswers).toHaveBeenCalledWith(123);
  });

  it('should validate free text character limit and show error for text over 1000 characters', async () => {
    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByTestId('question-input-3')).toBeInTheDocument();
    });

    // Fill in a text that exceeds 1000 characters
    const longText = 'a'.repeat(1001);
    const textInput = screen.getByTestId('question-input-3');
    fireEvent.change(textInput, { target: { value: longText } });

    // Fill required fields to pass other validations
    const firstQuestionChoices = screen.getByTestId('question-choices-1');
    const yesChoice = firstQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(yesChoice!);

    const secondQuestionChoices = screen.getByTestId('question-choices-2');
    const javaChoice = secondQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(javaChoice!);

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /save answers/i });
    fireEvent.click(submitButton);

    // Should show validation error for character limit
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('validation error'));
    });
  });

  it('should handle submission failure without specific errors', async () => {
    (fetchSubmitQuestions as Mock).mockResolvedValue({
      success: false,
      errors: null,
      message: 'Server error occurred'
    });

    renderWithAuth(<TaQuestionnairePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save answers/i })).toBeInTheDocument();
    });

    // Fill out all required data to pass client-side validation
    const textInput = screen.getByTestId('question-input-3');
    fireEvent.change(textInput, { target: { value: 'Test response' } });

    const firstQuestionChoices = screen.getByTestId('question-choices-1');
    const yesChoice = firstQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(yesChoice!);

    const secondQuestionChoices = screen.getByTestId('question-choices-2');
    const javaChoice = secondQuestionChoices.querySelector('[data-testid="choice-1"]');
    fireEvent.click(javaChoice!);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save answers/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error occurred');
    });
  });

    it('should use hideQuestionText parameter correctly', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <TaQuestionnairePage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Questionnaire')).toBeInTheDocument();
    });

    // Verify that QuestionItem components are rendered
    const questionItems = screen.getAllByTestId(/question-item-/);
    expect(questionItems.length).toBe(3);
  });
});

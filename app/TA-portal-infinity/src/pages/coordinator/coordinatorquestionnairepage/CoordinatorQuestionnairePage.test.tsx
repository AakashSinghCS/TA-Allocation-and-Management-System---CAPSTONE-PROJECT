import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoordinatorQuestionnairePage, { CoordinatorQuestionnaire, emptyQuestion } from './CoordinatorQuestionnairePage';
import type { ProfileQuestion } from '../../../interfaces/question/ProfileQuestion';

// Mock dependencies
vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render }: any) => {
    const mockQuestions: ProfileQuestion[] = [
      {
        id: 1,
        description: 'What programming languages do you know?',
        type: 'MULTI',
        answers: [
          { id: 1, description: 'JavaScript', type: 'MC' },
          { id: 2, description: 'Python', type: 'MC' },
          { id: 3, description: 'Java', type: 'MC' }
        ]
      },
      {
        id: 2,
        description: 'Years of experience?',
        type: 'SINGLE',
        answers: [
          { id: 4, description: '0-1 years', type: 'MC' },
          { id: 5, description: '2-3 years', type: 'MC' }
        ]
      }
    ];
    return render(mockQuestions);
  }
}));

vi.mock('../../../api/question/fetchAllProfileQuestions', () => ({
  fetchAllProfileQuestions: vi.fn(() => Promise.resolve([]))
}));

vi.mock('../../../components/features/questionanswer/questionitem/QuestionItem', () => ({
  default: ({ initialQuestion, questionNumber, onSaved, onRemoved }: any) => (
    <div data-testid={`question-item-${questionNumber}`}>
      <div>Question {questionNumber}: {initialQuestion.description}</div>
      <div>Type: {initialQuestion.type}</div>
      <div>Answers: {initialQuestion.answers?.length || 0}</div>
      <button 
        onClick={() => onSaved({ ...initialQuestion, description: 'Updated question' })}
        data-testid={`save-question-${questionNumber}`}
      >
        Save
      </button>
      <button 
        onClick={() => onRemoved(initialQuestion.id ?? initialQuestion.tempId)}
        data-testid={`remove-question-${questionNumber}`}
      >
        Remove
      </button>
    </div>
  )
}));

vi.mock('../../../utility/fallbackTempId/fallbackTempId', () => ({
  fallbackTempId: vi.fn(() => 'temp-id-123'),
  toObjectWithTempId: vi.fn((items) => 
    items ? items.map((item: any, index: number) => ({ 
      ...item, 
      tempId: `temp-${index}` 
    })) : []
  )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  TriangleAlert: () => <div data-testid="triangle-alert-icon">⚠️</div>,
  Plus: () => <div data-testid="plus-icon">+</div>
}));

describe('CoordinatorQuestionnairePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main page with GenericAPIContainer', () => {
    render(<CoordinatorQuestionnairePage />);
    
    expect(screen.getByText('Profile Questionnaire Management')).toBeInTheDocument();
  });

  it('displays header with title and description', () => {
    const mockQuestions: ProfileQuestion[] = [];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    expect(screen.getByText('Profile Questionnaire Management')).toBeInTheDocument();
    expect(screen.getByText('Manage the questions that students must answer for their profiles')).toBeInTheDocument();
  });

  it('displays total questions count', () => {
    const mockQuestions: ProfileQuestion[] = [
      { id: 1, description: 'Test question', type: 'SINGLE', answers: [] }
    ];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
  });

  it('displays warning about profile question changes', () => {
    const mockQuestions: ProfileQuestion[] = [];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    expect(screen.getByTestId('triangle-alert-icon')).toBeInTheDocument();
    expect(screen.getByText('Profile Question Changes')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete all student responses/)).toBeInTheDocument();
  });

  it('renders add new question button', () => {
    const mockQuestions: ProfileQuestion[] = [];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    const addButton = screen.getByRole('button', { name: /add new question/i });
    expect(addButton).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('adds new question when add button is clicked', () => {
    const mockQuestions: ProfileQuestion[] = [];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    const addButton = screen.getByRole('button', { name: /add new question/i });
    fireEvent.click(addButton);
    
    // Should show 1 question after adding
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTestId('question-item-1')).toBeInTheDocument();
  });

  it('renders initial questions correctly', () => {
    const mockQuestions: ProfileQuestion[] = [
      {
        id: 1,
        description: 'Programming languages?',
        type: 'MULTI',
        answers: [
          { id: 1, description: 'JavaScript', type: 'MC' },
          { id: 2, description: 'Python', type: 'MC' }
        ]
      },
      {
        id: 2,
        description: 'Experience level?',
        type: 'SINGLE',
        answers: [
          { id: 3, description: 'Beginner', type: 'MC' }
        ]
      }
    ];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Total count
    expect(screen.getByTestId('question-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-item-2')).toBeInTheDocument();
    expect(screen.getByText('Question 1: Programming languages?')).toBeInTheDocument();
    expect(screen.getByText('Question 2: Experience level?')).toBeInTheDocument();
  });

  it('handles question saving correctly', () => {
    const mockQuestions: ProfileQuestion[] = [
      { id: 1, description: 'Original question', type: 'SINGLE', answers: [] }
    ];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    const saveButton = screen.getByTestId('save-question-1');
    fireEvent.click(saveButton);
    
    // Question should still be there after saving
    expect(screen.getByTestId('question-item-1')).toBeInTheDocument();
  });

  it('handles question removal correctly', () => {
    const mockQuestions: ProfileQuestion[] = [
      { id: 1, description: 'Question to remove', type: 'SINGLE', answers: [] },
      { id: 2, description: 'Question to keep', type: 'SINGLE', answers: [] }
    ];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Initial count
    
    const removeButton = screen.getByTestId('remove-question-1');
    fireEvent.click(removeButton);
    
    // Should have one less question
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const mockQuestions: ProfileQuestion[] = [];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    const mainContainer = screen.getByText('Profile Questionnaire Management').closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    
    const headerTitle = screen.getByText('Profile Questionnaire Management');
    expect(headerTitle).toHaveClass('text-2xl', 'md:text-3xl', 'font-bold', 'text-[#040941]');
  });

  it('handles null initial questions', () => {
    render(<CoordinatorQuestionnaire initial={null} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // No questions initially
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
  });

  it('renders questions management section', () => {
    const mockQuestions: ProfileQuestion[] = [];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    expect(screen.getByText('Questions Management')).toBeInTheDocument();
  });

  it('displays question cards with proper styling', () => {
    const mockQuestions: ProfileQuestion[] = [
      { id: 1, description: 'Test question', type: 'SINGLE', answers: [] }
    ];
    render(<CoordinatorQuestionnaire initial={mockQuestions} />);
    
    const questionCard = screen.getByTestId('question-item-1').closest('.bg-white');
    expect(questionCard).toBeInTheDocument();
    expect(questionCard).toHaveClass('rounded-xl', 'shadow-sm', 'border', 'border-gray-200');
  });
});

describe('emptyQuestion function', () => {
  it('creates a new empty question with correct structure', () => {
    const newQuestion = emptyQuestion();
    
    expect(newQuestion.id).toBeUndefined();
    expect(newQuestion.tempId).toBe('temp-id-123');
    expect(newQuestion.description).toBe('');
    expect(newQuestion.type).toBe('SINGLE');
    expect(newQuestion.answers).toHaveLength(2);
    expect(newQuestion.answers?.[0]?.description).toBe('');
    expect(newQuestion.answers?.[0]?.type).toBe('MC');
  });
});

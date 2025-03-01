import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import './QuestionnaireForm.css';
import { AssessmentHistory } from './AssessmentHistory';

const client = generateClient<Schema>();

interface QuestionnaireFormProps {
  kidProfileId: string;
}

type Category = "COGNITION" | "LANGUAGE" | "MOTOR" | "SOCIAL" | "EMOTIONAL";

interface Response {
  question: string;
  answer: string;
  category: Category;
}

export function QuestionnaireForm({ kidProfileId }: QuestionnaireFormProps) {
  const [questions, setQuestions] = useState<Schema["QuestionBank"]["type"][]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const DEFAULT_OPTIONS = ["Yes", "No", "Don't Know"];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions...');
      const response = await client.models.QuestionBank.list();
      console.log('Questions fetched:', response.data);
      console.log('Sample question:', response.data[0]);
      setQuestions(response.data.filter(q => q && q.question_text && q.category));
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
      setIsLoading(false);
    }
  };

  const saveResponse = async (answer: string) => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion?.id) return;

      await client.models.UserResponse.create({
        kidProfileId,
        questionId: currentQuestion.id,
        answer,
        timestamp: new Date().toISOString()
      });

      // Add to local responses array for summary
      if (currentQuestion.question_text && currentQuestion.category) {
        const newResponse: Response = {
          question: currentQuestion.question_text,
          answer: answer,
          category: currentQuestion.category as Category
        };
        setResponses(prev => [...prev, newResponse]);
      }

      console.log('Response saved successfully');
    } catch (err) {
      console.error('Error saving response:', err);
      setError('Failed to save response. Please try again.');
    }
  };

  const handleNext = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer before proceeding.');
      return;
    }

    await saveResponse(selectedAnswer);
    setSelectedAnswer('');
    setError(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const renderSummaryReport = () => {
    const categoryCounts = responses.reduce((acc, response) => {
      const category = response.category;
      acc[category] = acc[category] || { total: 0, yes: 0, no: 0, dontKnow: 0 };
      acc[category].total++;
      if (response.answer === 'Yes') acc[category].yes++;
      if (response.answer === 'No') acc[category].no++;
      if (response.answer === "Don't Know") acc[category].dontKnow++;
      return acc;
    }, {} as Record<Category, { total: number; yes: number; no: number; dontKnow: number }>);

    return (
      <div className="summary-report">
        <h2>Assessment Summary Report</h2>
        <div className="category-summaries">
          {Object.entries(categoryCounts).map(([category, counts]) => (
            <div key={category} className="category-summary">
              <h3>{category}</h3>
              <div className="category-stats">
                <p>Total Questions: {counts.total}</p>
                <p>Yes Responses: {counts.yes} ({Math.round(counts.yes / counts.total * 100)}%)</p>
                <p>No Responses: {counts.no} ({Math.round(counts.no / counts.total * 100)}%)</p>
                <p>Don't Know: {counts.dontKnow} ({Math.round(counts.dontKnow / counts.total * 100)}%)</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="detailed-responses">
          <h3>Detailed Responses</h3>
          {responses.map((response, index) => (
            <div key={index} className="response-item">
              <p className="question-text">Q{index + 1}: {response.question}</p>
              <p className="answer-text">Answer: <strong>{response.answer}</strong></p>
              <p className="category-text">Category: {response.category}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (showHistory) {
    return <AssessmentHistory kidProfileId={kidProfileId} onClose={() => setShowHistory(false)} />;
  }

  if (isLoading) {
    return <div className="questionnaire-status">Loading questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!questions.length) {
    return <div className="questionnaire-status">No questions available.</div>;
  }

  if (isCompleted) {
    return (
      <div>
        {renderSummaryReport()}
        <div className="button-container" style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => setShowHistory(true)}
            className="history-button"
          >
            View Past Assessments
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="questionnaire-status">Error loading question.</div>;
  }

  return (
    <div className="questionnaire-form">
      <div className="header">
        <button 
          onClick={() => setShowHistory(true)}
          className="history-button"
        >
          View Past Assessments
        </button>
      </div>

      <div className="progress-bar">
        Question {currentQuestionIndex + 1} of {questions.length}
        <div 
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="question-card">
        <h3>{currentQuestion.question_text}</h3>
        <div className="options">
          {DEFAULT_OPTIONS.map((option, index) => (
            <label key={`option-${index}`} className="option">
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="button-container">
        <button 
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="next-button"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
} 
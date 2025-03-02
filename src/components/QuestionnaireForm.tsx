import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import './QuestionnaireForm.css';
import { AssessmentHistory } from './AssessmentHistory';

const client = generateClient<Schema>();

type QuestionCategory = 'COGNITION' | 'LANGUAGE' | 'MOTOR' | 'SOCIAL' | 'EMOTIONAL';

interface Question {
  id: string;
  question_text: string;
  category: QuestionCategory;
  options: string[];
}

interface QuestionnaireFormProps {
  kidProfileId: string;
  onBack?: () => void;
}

export function QuestionnaireForm({ kidProfileId, onBack }: QuestionnaireFormProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<QuestionCategory>('COGNITION');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const categories: QuestionCategory[] = ['COGNITION', 'LANGUAGE', 'MOTOR', 'SOCIAL', 'EMOTIONAL'];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await client.models.QuestionBank.list();
      const validQuestions = response.data
        .filter((q): q is NonNullable<typeof q> => 
          q !== null && 
          q.id != null &&
          q.question_text != null &&
          q.category != null &&
          categories.includes(q.category as QuestionCategory)
        )
        .map(q => ({
          id: q.id!,
          question_text: q.question_text!,
          category: q.category as QuestionCategory,
          options: Array.isArray(q.options) ? q.options.filter((opt): opt is string => opt != null) : ['Yes', 'No', "Don't Know"]
        }));

      setQuestions(validQuestions);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitCategory = async () => {
    const categoryQuestions = questions.filter(q => q.category === activeCategory);
    const allCategoryQuestionsAnswered = categoryQuestions.every(q => answers[q.id]);
    
    if (!allCategoryQuestionsAnswered) {
      alert('Please answer all questions in this category before submitting.');
      return;
    }

    try {
      // Submit answers for the current category
      await Promise.all(
        categoryQuestions.map(question => 
          client.models.UserResponse.create({
            kidProfileId,
            questionId: question.id,
            answer: answers[question.id],
            timestamp: new Date().toISOString()
          })
        )
      );

      // Clear answers for this category
      const newAnswers = { ...answers };
      categoryQuestions.forEach(q => delete newAnswers[q.id]);
      setAnswers(newAnswers);

      // Move to next category if available
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex < categories.length - 1) {
        setActiveCategory(categories[currentIndex + 1]);
      } else {
        // All categories completed
        alert('Assessment completed successfully!');
        onBack?.();
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Failed to submit answers. Please try again.');
    }
  };

  if (showHistory) {
    return <AssessmentHistory kidProfileId={kidProfileId} onClose={() => setShowHistory(false)} />;
  }

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const categoryQuestions = questions.filter(q => q.category === activeCategory);
  const answeredInCategory = categoryQuestions.filter(q => answers[q.id]).length;
  const progressPercent = (answeredInCategory / categoryQuestions.length) * 100;

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h2>Assessment Questions</h2>
        {onBack && (
          <button className="back-button" onClick={onBack}>
            ← Back to Profile
          </button>
        )}
      </div>

      <div className="tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`tab-button ${category === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0) + category.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="category-progress">
        <div className="progress-text">
          Progress: {answeredInCategory} of {categoryQuestions.length} questions answered
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="questions-section">
        {categoryQuestions.map(question => (
          <div key={question.id} className="question-card">
            <p className="question-text">{question.question_text}</p>
            <div className="options">
              {question.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button 
          className="submit-button"
          onClick={handleSubmitCategory}
          disabled={categoryQuestions.some(q => !answers[q.id])}
        >
          {categories.indexOf(activeCategory) === categories.length - 1 
            ? 'Complete Assessment'
            : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
} 
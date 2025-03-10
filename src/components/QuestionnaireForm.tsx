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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      alert('Please answer all questions in this category before continuing.');
      return;
    }

    // Move to next category if available
    const currentIndex = categories.indexOf(activeCategory);
    if (currentIndex < categories.length - 1) {
      setActiveCategory(categories[currentIndex + 1]);
    } else {
      // Check if all categories have answers
      const allAnswered = categories.every(category => {
        const categoryQuestions = questions.filter(q => q.category === category);
        return categoryQuestions.every(q => answers[q.id]);
      });

      if (!allAnswered) {
        alert('Please complete all questions in all categories before submitting.');
        return;
      }

      // All categories completed, submit all answers
      await handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Get all questions that should be answered
      const allQuestions = questions;
      
      if (allQuestions.length === 0) {
        alert('No questions available to submit.');
        return;
      }

      // Check if we have all answers
      const missingAnswers = allQuestions.filter(q => !answers[q.id]);
      if (missingAnswers.length > 0) {
        const missingCategories = new Set(missingAnswers.map(q => q.category));
        alert(`Please complete all questions in the following categories: ${Array.from(missingCategories).join(', ')}`);
        return;
      }

      // Use the same timestamp for all responses
      const submissionTimestamp = new Date().toISOString();
      console.log('Submitting all answers with timestamp:', submissionTimestamp);
      console.log('Total questions:', allQuestions.length);
      console.log('Total answers:', Object.keys(answers).length);

      // Track successful and failed submissions
      const results = {
        successful: 0,
        failed: [] as { questionId: string; error: any }[]
      };

      // Submit all answers with individual error handling
      for (const question of allQuestions) {
        try {
          console.log('Submitting answer:', {
            questionId: question.id,
            category: question.category,
            answer: answers[question.id]
          });
          
          await client.models.UserResponse.create({
            kidProfileId,
            questionId: question.id,
            answer: answers[question.id],
            timestamp: submissionTimestamp
          });
          
          results.successful++;
        } catch (error) {
          console.error('Failed to submit answer for question:', question.id, error);
          results.failed.push({ questionId: question.id, error });
        }
      }

      console.log('Submission results:', results);

      if (results.failed.length > 0) {
        console.error('Some answers failed to submit:', results.failed);
        setError(`${results.successful} answers saved, but ${results.failed.length} failed. Please try again.`);
        return;
      }

      if (results.successful !== allQuestions.length) {
        console.error('Not all answers were saved:', {
          saved: results.successful,
          total: allQuestions.length
        });
        setError(`Only ${results.successful} out of ${allQuestions.length} answers were saved. Please try again.`);
        return;
      }

      console.log('Successfully submitted all answers');
      
      // Clear the form
      setAnswers({});
      setActiveCategory('COGNITION');
      
      alert('Assessment completed successfully!');
      onBack?.();
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Failed to submit answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCategoryClick = (category: QuestionCategory) => {
    setActiveCategory(category);
    setIsMobileMenuOpen(false);
  };

  const handleBackClick = () => {
    setIsMobileMenuOpen(false);
    onBack?.();
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
        <div className="header-actions">
          {onBack && (
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Profile
            </button>
          )}
        </div>
        <button 
          className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {isMobileMenuOpen && (
          <div className="mobile-menu active">
            {onBack && (
              <button onClick={handleBackClick}>
                ← Back to Profile
              </button>
            )}
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={category === activeCategory ? 'active' : ''}
              >
                {category.charAt(0) + category.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`tab-button ${category === activeCategory ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
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
          disabled={categoryQuestions.some(q => !answers[q.id]) || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 
            categories.indexOf(activeCategory) === categories.length - 1 
              ? 'Complete Assessment'
              : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
} 
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import './QuestionnaireForm.css';
import { AssessmentHistory } from './AssessmentHistory';
import { ParentConcernsForm } from './ParentConcernsForm';

const client = generateClient<Schema>();

type QuestionCategory = 'COGNITION' | 'LANGUAGE' | 'MOTOR' | 'SOCIAL' | 'EMOTIONAL';
type PageType = 'CONCERNS' | QuestionCategory;

const isConcernsPage = (page: PageType): page is 'CONCERNS' => page === 'CONCERNS';
const isQuestionCategory = (page: PageType): page is QuestionCategory => !isConcernsPage(page);

interface Question {
  id: string;
  question_text: string;
  category: QuestionCategory;
  options: string[];
}

interface Assessment {
  id: string;
  date: string;
  responses: Array<{
    questionId: string;
    answer: string;
    category: QuestionCategory;
  }>;
}

interface QuestionnaireFormProps {
  kidProfileId: string;
  onBack?: () => void;
}

export function QuestionnaireForm({ kidProfileId, onBack }: QuestionnaireFormProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activePage, setActivePage] = useState<PageType>('CONCERNS');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assessmentId, setAssessmentId] = useState('');
  const [expandedAssessments, setExpandedAssessments] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const categories: QuestionCategory[] = ['COGNITION', 'LANGUAGE', 'MOTOR', 'SOCIAL', 'EMOTIONAL'];

  useEffect(() => {
    fetchQuestions();
    fetchAssessments();
    setAssessmentId(new Date().toISOString());
  }, []);

  const fetchAssessments = async () => {
    try {
      const responses = await client.models.UserResponse.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      // Group responses by assessment (using timestamp)
      const assessmentMap = new Map<string, Assessment>();
      
      responses.data.forEach(response => {
        if (!response?.timestamp) return;
        
        const date = new Date(response.timestamp).toISOString().split('T')[0];
        if (!assessmentMap.has(date)) {
          assessmentMap.set(date, {
            id: date,
            date,
            responses: []
          });
        }
        
        const assessment = assessmentMap.get(date)!;
        if (response.questionId && response.answer) {
          const question = questions.find(q => q.id === response.questionId);
          assessment.responses.push({
            questionId: response.questionId,
            answer: response.answer,
            category: question?.category || 'COGNITION'
          });
        }
      });

      setAssessments(Array.from(assessmentMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (err) {
      console.error('Error fetching assessments:', err);
    }
  };

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

  const handleParentConcerns = async (concerns: string) => {
    if (concerns.trim()) {
      try {
        await client.models.ParentConcerns.create({
          kidProfileId,
          concernText: concerns,
          timestamp: new Date().toISOString(),
          assessmentId
        });
      } catch (err) {
        console.error('Error saving parent concerns:', err);
      }
    }
    setActivePage('COGNITION');
  };

  const handleSubmitCategory = async () => {
    // Move to next category if not submitting the entire assessment
    const currentIndex = categories.indexOf(activePage as QuestionCategory);
    if (currentIndex < categories.length - 1) {
      setActivePage(categories[currentIndex + 1]);
    }
  };

  const handleCompleteAssessment = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get all questions that have been answered
      const answeredQuestions = questions.filter(q => answers[q.id]);
      
      if (answeredQuestions.length === 0) {
        alert('Please answer at least one question before submitting.');
        return;
      }

      const submissionTimestamp = new Date().toISOString();
      console.log('Submitting answers with timestamp:', submissionTimestamp);
      console.log('Total answered questions:', answeredQuestions.length);

      // Track successful and failed submissions
      const results = {
        successful: 0,
        failed: [] as { questionId: string; error: any }[]
      };

      // Submit all answered questions
      for (const question of answeredQuestions) {
        try {
          await client.models.UserResponse.create({
            kidProfileId,
            questionId: question.id,
            answer: answers[question.id],
            timestamp: submissionTimestamp
          });
          results.successful++;
        } catch (error) {
          console.error('Failed to submit answer:', error);
          results.failed.push({ questionId: question.id, error });
        }
      }

      if (results.failed.length > 0) {
        console.error('Some answers failed to submit:', results.failed);
        setError(`${results.successful} answers saved, but ${results.failed.length} failed. Please try again.`);
        return;
      }

      console.log('Successfully submitted assessment');
      setAnswers({});
      setActivePage('CONCERNS');
      setShowHistory(true);
      
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCategoryClick = (page: PageType) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  const handleBackClick = () => {
    setIsMobileMenuOpen(false);
    onBack?.();
  };

  const toggleAssessment = (assessmentId: string) => {
    setExpandedAssessments(prev => 
      prev.includes(assessmentId)
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  if (showHistory) {
    return (
      <div className="assessment-history">
        <div className="header">
          <h2>Assessment History</h2>
          <button className="close-button" onClick={() => setShowHistory(false)}>Close</button>
        </div>
        
        {assessments.map(assessment => (
          <div key={assessment.id} className="assessment-section">
            <div 
              className="assessment-header"
              onClick={() => toggleAssessment(assessment.id)}
            >
              <span className="assessment-date">{assessment.date}</span>
              <button className="assessment-toggle">
                {expandedAssessments.includes(assessment.id) ? '−' : '+'}
              </button>
            </div>
            
            <div className={`assessment-content ${expandedAssessments.includes(assessment.id) ? '' : 'collapsed'}`}>
              {categories.map(category => {
                const categoryResponses = assessment.responses.filter(r => r.category === category);
                if (categoryResponses.length === 0) return null;
                
                return (
                  <div key={category} className="category-summary">
                    <h3>{category}</h3>
                    <div className="category-stats">
                      <p>Questions Answered: {categoryResponses.length}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (isConcernsPage(activePage)) {
    return (
      <ParentConcernsForm
        onSubmit={handleParentConcerns}
        onNext={() => setActivePage('COGNITION')}
      />
    );
  }

  const categoryQuestions = questions.filter(q => 
    isQuestionCategory(activePage) && q.category === activePage
  );
  const answeredInCategory = categoryQuestions.filter(q => answers[q.id]).length;
  const progressPercent = (answeredInCategory / categoryQuestions.length) * 100;

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h2>Assessment Questions - {activePage}</h2>
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
            <button onClick={() => handleCategoryClick('CONCERNS')}>Parent Concerns</button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category as PageType)}
                className={category === activePage ? 'active' : ''}
              >
                {category.charAt(0) + category.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${isConcernsPage(activePage) ? 'active' : ''}`}
          onClick={() => handleCategoryClick('CONCERNS')}
        >
          Parent Concerns
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`tab-button ${activePage === category ? 'active' : ''}`}
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

      <div className="assessment-buttons">
        {categories.indexOf(activePage as QuestionCategory) < categories.length - 1 ? (
          <button
            className="assessment-button"
            onClick={handleSubmitCategory}
            disabled={isSubmitting}
          >
            Next Section
          </button>
        ) : (
          <button
            className="assessment-button"
            onClick={handleCompleteAssessment}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
          </button>
        )}
        
        <button
          className="assessment-button"
          onClick={() => setShowHistory(true)}
        >
          View History
        </button>
      </div>
    </div>
  );
} 
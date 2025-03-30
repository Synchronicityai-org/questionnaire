import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import './QuestionnaireForm.css';

const client = generateClient<Schema>();

interface Question {
  id: string;
  question_text: string;
  category: 'COGNITION' | 'LANGUAGE' | 'MOTOR' | 'SOCIAL' | 'EMOTIONAL';
}

interface AssessmentSummary {
  totalQuestions: number;
  answeredQuestions: number;
  skippedQuestions: number;
  categoryStats: {
    [key: string]: {
      total: number;
      answered: number;
      skipped: number;
    };
  };
  responses: {
    [key: string]: {
      question: string;
      response: string;
    }[];
  };
  parentConcerns?: string;
}

interface PastAssessment {
  date: string;
  parentConcerns?: string;
  responses: {
    questionId: string;
    answer: string;
    timestamp: string;
    questionText: string;
    category: string;
  }[];
  categoryStats: Record<string, {
    total: number;
    answered: number;
  }>;
  totalQuestions: number;
  answeredQuestions: number;
}

const QuestionnaireForm: React.FC = () => {
  const { kidProfileId } = useParams<{ kidProfileId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Question['category']>('COGNITION');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kidProfile, setKidProfile] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);
  const [showPastAssessments, setShowPastAssessments] = useState(false);
  const [pastAssessments, setPastAssessments] = useState<PastAssessment[]>([]);
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set());

  const categories: Question['category'][] = ['COGNITION', 'LANGUAGE', 'MOTOR', 'SOCIAL', 'EMOTIONAL'];

  useEffect(() => {
    fetchQuestions();
    fetchKidProfile();
  }, []);

  const fetchKidProfile = async () => {
    if (!kidProfileId) return;
    try {
      const { data: profile } = await client.models.KidProfile.get({
        id: kidProfileId
      });
      if (profile) {
        setKidProfile(profile);
        // Fetch parent concerns
        const { data: concerns } = await client.models.ParentConcerns.list({
          filter: {
            kidProfileId: { eq: kidProfileId }
          }
        });
        // Sort concerns by timestamp and get the most recent one
        const sortedConcerns = concerns.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        if (sortedConcerns.length > 0) {
          setKidProfile({
            ...profile,
            parentConcerns: sortedConcerns[0].concernText
          });
        }
      }
    } catch (error) {
      console.error('Error fetching kid profile:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: questionList } = await client.models.QuestionBank.list();
      setQuestions(questionList.filter(q => q.id && q.question_text && q.category).map(q => ({
          id: q.id!,
          question_text: q.question_text!,
        category: q.category!
      })));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const createAssessmentSummary = (): AssessmentSummary => {
    const summary: AssessmentSummary = {
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(responses).length,
      skippedQuestions: questions.length - Object.keys(responses).length,
      categoryStats: {},
      responses: {}
    };

    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const answeredInCategory = categoryQuestions.filter(q => responses[q.id]);
      
      summary.categoryStats[category] = {
        total: categoryQuestions.length,
        answered: answeredInCategory.length,
        skipped: categoryQuestions.length - answeredInCategory.length
      };

      summary.responses[category] = categoryQuestions.map(q => ({
        question: q.question_text,
        response: responses[q.id] || 'Skipped'
      }));
    });

    if (kidProfile?.parentConcerns) {
      summary.parentConcerns = kidProfile.parentConcerns;
    }

    return summary;
  };

  const handleCompleteAssessment = async () => {
    if (!kidProfileId) return;
    setSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const responsePromises = Object.entries(responses).map(([questionId, answer]) => {
        return client.models.UserResponse.create({
          kidProfileId,
          questionId,
          answer,
          timestamp
        });
      });

      await Promise.all(responsePromises);
      const summary = createAssessmentSummary();
      setAssessmentSummary(summary);
      setShowSummary(true);
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToProfile = () => {
    navigate(`/kid-profile/${kidProfileId}`);
  };

  const handleNextSection = () => {
    const currentIndex = categories.indexOf(currentPage);
    if (currentIndex < categories.length - 1) {
      setCurrentPage(categories[currentIndex + 1]);
    }
  };

  const fetchPastAssessments = async () => {
    if (!kidProfileId) return;
    try {
      // Fetch all responses for this kid profile
      const { data: responses } = await client.models.UserResponse.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      // Fetch all parent concerns
      const { data: concerns } = await client.models.ParentConcerns.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      // Group responses by timestamp (assessment date)
      const assessmentMap = new Map<string, PastAssessment>();
      
      responses.forEach(response => {
        if (!response?.timestamp || !response?.questionId || !response?.answer) return;
        
        // Get the date part only from timestamp
        const date = new Date(response.timestamp).toISOString().split('T')[0];
        
        if (!assessmentMap.has(date)) {
          assessmentMap.set(date, {
            date,
            responses: [],
            categoryStats: {} as Record<string, { total: number; answered: number }>,
            totalQuestions: 0,
            answeredQuestions: 0
          });
        }
        
        const assessment = assessmentMap.get(date)!;
        const question = questions.find(q => q.id === response.questionId);
        
        if (question) {
          assessment.responses.push({
            questionId: response.questionId,
            answer: response.answer,
            timestamp: response.timestamp,
            questionText: question.question_text,
            category: question.category
          });

          // Update category stats
          if (!assessment.categoryStats[question.category]) {
            assessment.categoryStats[question.category] = {
              total: 0,
              answered: 0
            };
          }
          assessment.categoryStats[question.category].total++;
          assessment.categoryStats[question.category].answered++;
          assessment.totalQuestions++;
          assessment.answeredQuestions++;
        }
      });

      // Add parent concerns to matching dates
      concerns.forEach(concern => {
        if (!concern?.timestamp || !concern?.concernText) return;
        const date = new Date(concern.timestamp).toISOString().split('T')[0];
        if (assessmentMap.has(date)) {
          assessmentMap.get(date)!.parentConcerns = concern.concernText;
        }
      });

      // Convert to array and sort by date (newest first)
      const sortedAssessments = Array.from(assessmentMap.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPastAssessments(sortedAssessments);
    } catch (error) {
      console.error('Error fetching past assessments:', error);
    }
  };

  const toggleAssessment = (date: string) => {
    setExpandedAssessments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const handleViewPastAssessments = () => {
    setShowPastAssessments(true);
    fetchPastAssessments();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (showSummary && assessmentSummary) {
    return (
      <div className="assessment-summary">
        <div className="header">
          <h2>Assessment Summary</h2>
        </div>
        <div className="summary-content">
          {assessmentSummary.parentConcerns && (
            <div className="parent-concerns">
              <h3>Parent Concerns</h3>
              <table className="summary-table">
                <tbody>
                  <tr>
                    <td><strong>Concerns:</strong></td>
                    <td>{assessmentSummary.parentConcerns}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <h3>Assessment Overview</h3>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Total Questions</th>
                <th>Answered</th>
                <th>Skipped</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{assessmentSummary.totalQuestions}</td>
                <td>{assessmentSummary.answeredQuestions}</td>
                <td>{assessmentSummary.skippedQuestions}</td>
              </tr>
            </tbody>
          </table>

          <h3>Responses by Category</h3>
          {Object.entries(assessmentSummary.responses).map(([category, responses]) => (
            <div key={category} className="category-section">
              <h4>{category}</h4>
              <table className="responses-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response, index) => (
                    <tr key={index}>
                      <td>{response.question}</td>
                      <td>{response.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="assessment-buttons">
            <button
              className="assessment-button primary"
              onClick={handleBackToProfile}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPastAssessments) {
    return (
      <div className="assessment-summary">
        <div className="header">
          <h2>Assessment History</h2>
          <button
            className="assessment-button secondary"
            onClick={() => setShowPastAssessments(false)}
          >
            Back to Assessment
          </button>
        </div>
        <div className="summary-content">
          {pastAssessments.length === 0 ? (
            <div className="no-assessments">
              <p>No past assessments found.</p>
            </div>
          ) : (
            pastAssessments.map(assessment => (
              <div key={assessment.date} className="past-assessment-section">
                <div 
                  className="assessment-header" 
                  onClick={() => toggleAssessment(assessment.date)}
                >
                  <h3>
                    Assessment on {new Date(assessment.date).toLocaleDateString()}
                    <span className="expand-icon">
                      {expandedAssessments.has(assessment.date) ? '▼' : '▶'}
                    </span>
                  </h3>
                </div>
                
                {expandedAssessments.has(assessment.date) && (
                  <div className="assessment-details">
                    {assessment.parentConcerns && (
                      <div className="parent-concerns">
                        <h3>Parent Concerns</h3>
                        <table className="summary-table">
                          <tbody>
                            <tr>
                              <td><strong>Concerns:</strong></td>
                              <td>{assessment.parentConcerns}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    <h3>Assessment Overview</h3>
                    <table className="summary-table">
                      <thead>
                        <tr>
                          <th>Total Questions</th>
                          <th>Answered Questions</th>
                          <th>Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{assessment.totalQuestions}</td>
                          <td>{assessment.answeredQuestions}</td>
                          <td>{Math.round((assessment.answeredQuestions / assessment.totalQuestions) * 100)}%</td>
                        </tr>
                      </tbody>
                    </table>

                    <h3>Category Statistics</h3>
                    <table className="summary-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Questions Answered</th>
                          <th>Total Questions</th>
                          <th>Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(assessment.categoryStats).map(([category, stats]) => (
                          <tr key={category}>
                            <td>{category}</td>
                            <td>{stats.answered}</td>
                            <td>{stats.total}</td>
                            <td>{Math.round((stats.answered / stats.total) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                <h3>Detailed Responses</h3>
                {categories.map(category => {
                      const categoryResponses = assessment.responses
                        .filter(r => r.category === category)
                        .sort((a, b) => a.questionText.localeCompare(b.questionText));

                      if (categoryResponses.length === 0) return null;

                  return (
                    <div key={category} className="category-section">
                          <h4>{category}</h4>
                          <table className="responses-table">
                            <thead>
                              <tr>
                                <th>Question</th>
                                <th>Response</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryResponses.map((response, index) => (
                                <tr key={index}>
                                  <td>{response.questionText}</td>
                                  <td>{response.answer}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                    </div>
                  );
                })}
              </div>
                )}
            </div>
            ))
          )}
          </div>
      </div>
    );
  }

  const currentQuestions = questions.filter(q => q.category === currentPage);

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h2>Assessment Questions - {currentPage}</h2>
        <div className="header-actions">
        <button 
            className="view-history-button"
            onClick={handleViewPastAssessments}
        >
            View Past Assessments
        </button>
          <button className="back-button" onClick={handleBackToProfile}>
                ← Back to Profile
              </button>
          </div>
      </div>

      <div className="tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`tab-button ${currentPage === category ? 'active' : ''}`}
            onClick={() => setCurrentPage(category)}
          >
            {category.charAt(0) + category.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="category-progress">
        <div className="progress-text">
          Progress: {currentQuestions.filter(q => responses[q.id]).length} of {currentQuestions.length} questions answered
        </div>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ 
              width: `${(currentQuestions.filter(q => responses[q.id]).length / currentQuestions.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      <div className="questions-section">
        {currentQuestions.map(question => (
          <div key={question.id} className="question-card">
            <p className="question-text">{question.question_text}</p>
            <div className="options">
              {['Yes', 'No', "Sometimes"].map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.toUpperCase()}
                    checked={responses[question.id] === option.toUpperCase()}
                    onChange={() => handleResponseChange(question.id, option.toUpperCase())}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="assessment-buttons">
        <button
          className="assessment-button primary"
          onClick={handleCompleteAssessment}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Complete Assessment'}
        </button>
        {currentPage !== categories[categories.length - 1] && (
          <button
            className="assessment-button secondary"
            onClick={handleNextSection}
            disabled={submitting}
          >
            Next Section
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireForm; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import './QuestionnaireForm.css';
import crypto from 'crypto';

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
  milestones?: {
    name: string;
    tasks: {
      name: string;
      description: string;
      strategies: string;
    }[];
  }[];
  developmentalOverview?: string;
  ahaMoment?: string;
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
  const [showSummary, setShowSummary] = useState(false);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);
  const [showPastAssessments, setShowPastAssessments] = useState(false);
  const [pastAssessments, setPastAssessments] = useState<PastAssessment[]>([]);
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const categories: Question['category'][] = ['COGNITION', 'LANGUAGE', 'MOTOR', 'SOCIAL', 'EMOTIONAL'];

  useEffect(() => {
    if (!kidProfileId) {
      setError('Kid Profile ID is required');
      return;
    }
    fetchQuestions();
  }, [kidProfileId]);

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

  const createAssessmentSummary = async (): Promise<AssessmentSummary> => {
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

    // Fetch parent concerns
    if (kidProfileId) {
      try {
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
          summary.parentConcerns = sortedConcerns[0].concernText || '';
        }
      } catch (error) {
        console.error('Error fetching parent concerns:', error);
      }
    }

    return summary;
  };

  // Add a function to fetch milestones
  const fetchMilestones = async () => {
    if (!kidProfileId) return;
    try {
      // First fetch all milestone type records
      const { data: milestoneTasks } = await client.models.MilestoneTask.list({
        filter: {
          and: [
            { kidProfileId: { eq: kidProfileId } },
            { type: { eq: 'MILESTONE' } }
          ]
        }
      });

      // For each milestone, fetch its associated tasks
      const milestonesWithTasks = await Promise.all(
        milestoneTasks.map(async (milestone) => {
          if (!milestone.id) return null;
          
          // Fetch tasks associated with this milestone
          const { data: tasks } = await client.models.MilestoneTask.list({
            filter: {
              and: [
                { kidProfileId: { eq: kidProfileId } },
                { type: { eq: 'TASK' } },
                { parentId: { eq: milestone.id } }
              ]
            }
          });

          return {
            name: milestone.title || '',
            tasks: tasks.map(task => ({
              name: task.title || '',
              description: task.parentFriendlyDescription || '',
              strategies: task.strategies || ''
            }))
          };
        })
      );

      // Filter out null milestones and update the assessment summary
      const validMilestones = milestonesWithTasks.filter((milestone): milestone is NonNullable<typeof milestone> => milestone !== null);

      // Update the assessment summary with the fetched milestones
      setAssessmentSummary(prev => {
        if (!prev) return null;
        return {
          ...prev,
          milestones: validMilestones,
          developmentalOverview: milestoneTasks[0]?.developmentalOverview || '',
          ahaMoment: milestoneTasks[0]?.developmentalOverview || '' // Using developmental overview as aha moment for now
        };
      });

    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const handleCompleteAssessment = async () => {
    if (!kidProfileId) {
      setError('Kid Profile ID is required');
      return;
    }
    setSubmitting(true);
    setError(null);

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
      const summary = await createAssessmentSummary();
      setAssessmentSummary(summary);
      setShowSummary(true);

      // Generate text summary from responses
      const responseSummary = categories.map(category => {
        const categoryQuestions = questions.filter(q => q.category === category);
        const categoryResponses = categoryQuestions.map(q => {
          const response = responses[q.id];
          return {
            question: q.question_text,
            answer: response || 'Not answered'
          };
        });

        return {
          category,
          responses: categoryResponses
        };
      });

      // Generate narrative summary with detailed responses
      const generateNarrativeSummary = (summary: Array<{
        category: string;
        responses: Array<{
          question: string;
          answer: string;
        }>;
      }>) => {
        const narrativeParts = summary.map(category => {
          const responses = category.responses;
          const yesResponses = responses.filter(r => r.answer === 'YES');
          const noResponses = responses.filter(r => r.answer === 'NO');
          const sometimesResponses = responses.filter(r => r.answer === 'SOMETIMES');

          let categoryNarrative = `In the ${category.category.toLowerCase()} category:\n\n`;
          
          // Add detailed responses
          responses.forEach(r => {
            categoryNarrative += `Question: ${r.question}\nResponse: ${r.answer}\n\n`;
          });

          // Add summary
          categoryNarrative += `Summary: `;
          
          if (yesResponses.length > 0) {
            categoryNarrative += `The child shows strength in ${yesResponses.map(r => r.question.toLowerCase()).join(', ')}. `;
          }
          
          if (noResponses.length > 0) {
            categoryNarrative += `However, they struggle with ${noResponses.map(r => r.question.toLowerCase()).join(', ')}. `;
          }
          
          if (sometimesResponses.length > 0) {
            categoryNarrative += `There is inconsistent performance in ${sometimesResponses.map(r => r.question.toLowerCase()).join(', ')}. `;
          }

          return categoryNarrative;
        });

        return narrativeParts.join('\n\n');
      };

      const summaryText = generateNarrativeSummary(responseSummary);

      // Log the summary text
      console.log('User Response Summary:', {
        summaryText,
        responseSummary,
        categories: categories.map(category => ({
          category,
          questionCount: questions.filter(q => q.category === category).length,
          answeredCount: questions.filter(q => q.category === category && responses[q.id]).length
        }))
      });

      // Fetch parent concerns
      const { data: concerns } = await client.models.ParentConcerns.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      // Get the most recent parent concerns
      const sortedConcerns = concerns.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latestConcerns = sortedConcerns[0]?.concernText || "No parent concerns provided.";

      // Log parent concerns
      console.log('Parent Concerns:', {
        latestConcerns,
        totalConcerns: concerns.length,
        timestamp: sortedConcerns[0]?.timestamp
      });

      // Call the milestones API using environment variables
      console.log('Calling milestones API...');
      try {
        const apiUrl = import.meta.env.VITE_MILESTONES_API_URL;
        const apiKey = import.meta.env.VITE_MILESTONES_API_KEY;

        if (!apiUrl || !apiKey) {
          throw new Error('API URL or Key is missing. Please check your environment variables.');
        }

        // Log the complete API payload
        console.log('API Payload:', {
          url: apiUrl,
          method: 'POST',
          headers: {
            'x-api-key': '***hidden***',
            'Content-Type': 'application/json'
          },
          body: {
            summary: summaryText,
            notes: latestConcerns
          }
        });

        const milestonesResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: summaryText,
            notes: latestConcerns
          })
        });

        if (!milestonesResponse.ok) {
          const errorText = await milestonesResponse.text();
          console.error('API Response:', {
            status: milestonesResponse.status,
            statusText: milestonesResponse.statusText,
            body: errorText,
            url: apiUrl
          });
          throw new Error(`Failed to fetch milestones: ${milestonesResponse.status} ${milestonesResponse.statusText}`);
        }

        const responseData = await milestonesResponse.json();
        console.log('API Response Data:', {
          status: milestonesResponse.status,
          data: responseData
        });

        // Log the raw document string to see what's wrong
        console.log('Raw document string:', responseData.content.document);

        try {
          // Parse the document string from the response
          const documentData = JSON.parse(responseData.content.document);
          console.log('Parsed Document Data:', {
            developmental_overview: documentData.developmental_overview,
            milestones: documentData.milestones,
            aha_moment: documentData.aha_moment
          });

          // Create new milestone tasks without deleting existing ones
          for (const milestoneData of documentData.milestones) {
            // Create milestone in new MilestoneTask structure
            const { data: milestoneTask } = await client.models.MilestoneTask.create({
              kidProfileId,
              title: milestoneData.name,
              type: 'MILESTONE',
              developmentalOverview: documentData.developmental_overview,
              status: 'NOT_STARTED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              externalId: milestoneData.id || crypto.randomUUID()
            });

            if (milestoneTask) {
              // Create tasks for new MilestoneTask structure
              const milestoneTaskPromises = milestoneData.tasks.map((task: any) => 
                client.models.MilestoneTask.create({
                  kidProfileId,
                  title: task.name,
                  type: 'TASK',
                  parentId: milestoneTask.id,
                  parentFriendlyDescription: task.parent_friendly_description,
                  strategies: task.home_friendly_strategies || '',
                  status: 'NOT_STARTED',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  externalId: task.id || crypto.randomUUID()
                })
              );
              await Promise.all(milestoneTaskPromises);
            }
          }

          // Update the assessment summary with the milestone data
          setAssessmentSummary(prev => ({
            ...prev!,
            milestones: documentData.milestones.map((milestone: any) => ({
              name: milestone.name,
              tasks: milestone.tasks.map((task: any) => ({
                name: task.name,
                description: task.parent_friendly_description,
                strategies: task.home_friendly_strategies
              }))
            })),
            developmentalOverview: documentData.developmental_overview,
            ahaMoment: documentData.aha_moment
          }));

          // Force a refresh of the milestone data
          await fetchMilestones();

          // Navigate back to profile with a timestamp to force refresh
          navigate(`/kid-profile/${kidProfileId}?t=${Date.now()}`);

        } catch (parseError: unknown) {
          console.error('Error parsing API response:', parseError);
          console.error('Raw response:', responseData);
          throw new Error(`Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

      } catch (apiError) {
        console.error('API Error:', apiError);
        throw new Error(`API Error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      }

      // After saving milestones and tasks, fetch them to update the UI
      await fetchMilestones();

    } catch (error) {
      console.error('Error saving assessment:', error);
      setError(error instanceof Error ? error.message : 'Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Add useEffect to fetch milestones when component mounts
  useEffect(() => {
    if (kidProfileId) {
      fetchMilestones();
    }
  }, [kidProfileId]);

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

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Go Back Home
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (showSummary && assessmentSummary) {
    return (
      <div className="assessment-summary">
        <div className="header">
          <h2>Assessment Summary</h2>
        </div>
        <div className="summary-content">
          <div className="parent-concerns">
            <h3>Parent Concerns</h3>
            <div className="concerns-text">
              {assessmentSummary.parentConcerns || 'No concerns reported'}
            </div>
          </div>

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
      {currentPage !== categories[categories.length - 1] && (
          <button
            className="assessment-button secondary"
            onClick={handleNextSection}
            disabled={submitting}
          >
            Next Section
          </button>
        )}
        <button
          className="assessment-button primary"
          onClick={handleCompleteAssessment}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Complete Assessment'}
        </button>
      </div>
    </div>
  );
};

export default QuestionnaireForm; 
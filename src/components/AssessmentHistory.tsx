import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import './QuestionnaireForm.css';

const client = generateClient<Schema>();

interface AssessmentHistoryProps {
  kidProfileId: string;
  onClose: () => void;
  displayFormat?: 'summary' | 'qa';
}

type Category = "COGNITION" | "LANGUAGE" | "MOTOR" | "SOCIAL" | "EMOTIONAL";

type GroupedResponse = {
  timestamp: string;
  responses: {
    question: string;
    answer: string;
    category: Category;
    questionId: string;
  }[];
};

export function AssessmentHistory({ kidProfileId, onClose, displayFormat = 'summary' }: AssessmentHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<GroupedResponse[]>([]);

  useEffect(() => {
    fetchAssessmentHistory();
  }, [kidProfileId]);

  const fetchAssessmentHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting to fetch assessment history');
      console.log('KidProfileId:', kidProfileId);
      
      // Fetch all responses for this kid
      const responses = await client.models.UserResponse.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        },
        limit: 1000 // Increase limit to ensure we get all responses
      });

      // Sort responses by timestamp in memory
      if (responses.data) {
        responses.data.sort((a, b) => {
          const timeA = new Date(a.timestamp || '').getTime();
          const timeB = new Date(b.timestamp || '').getTime();
          return timeB - timeA; // descending order
        });
      }

      console.log('Raw UserResponse data:', responses);
      console.log('Total responses:', responses.data?.length || 0);

      if (!responses.data || responses.data.length === 0) {
        console.log('No responses found for kidProfileId:', kidProfileId);
        setAssessments([]);
        setIsLoading(false);
        return;
      }

      // Group responses by timestamp to identify complete questionnaires
      const responsesByTimestamp = responses.data.reduce((acc, response) => {
        const timestamp = response.timestamp || '';
        if (!acc[timestamp]) {
          acc[timestamp] = [];
        }
        acc[timestamp].push(response);
        return acc;
      }, {} as Record<string, any[]>);

      console.log('Responses grouped by timestamp:', responsesByTimestamp);

      // Fetch all questions to get their text and category
      const questions = await client.models.QuestionBank.list();
      console.log('Questions fetched:', questions.data?.length || 0);

      if (!questions.data) {
        setError('Failed to load questions');
        setIsLoading(false);
        return;
      }

      // Create a map of question details for quick lookup
      const questionMap = questions.data.reduce((acc, q) => {
        if (q.id) acc[q.id] = q;
        return acc;
      }, {} as Record<string, any>);

      // Process each timestamp group
      const groupedAssessments = Object.entries(responsesByTimestamp)
        .map(([timestamp, responses]) => {
          const processedResponses = responses.map(response => ({
            question: questionMap[response.questionId]?.question_text || 'Unknown Question',
            answer: response.answer || 'No Answer',
            category: questionMap[response.questionId]?.category || 'Unknown',
            questionId: response.questionId
          }));

          return {
            timestamp,
            responses: processedResponses
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log('Processed assessments:', groupedAssessments.length);
      console.log('First assessment responses:', groupedAssessments[0]?.responses.length || 0);

      setAssessments(groupedAssessments);
      setIsLoading(false);
    } catch (err) {
      console.error('Error in fetchAssessmentHistory:', err);
      setError('Failed to load assessment history. Please try again later.');
      setIsLoading(false);
    }
  };

  const renderAssessmentSummary = (assessment: GroupedResponse) => {
    // Sort responses by category
    const responsesByCategory = assessment.responses.reduce((acc, response) => {
      if (!acc[response.category]) {
        acc[response.category] = [];
      }
      acc[response.category].push(response);
      return acc;
    }, {} as Record<Category, typeof assessment.responses>);

    const timestamp = new Date(assessment.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();

    return (
      <div className="summary-report">
        <h2>Assessment from {formattedDate} at {formattedTime}</h2>
        <p className="response-count">
          Total Responses: {assessment.responses.length} 
          {assessment.responses.length < 63 && " (Incomplete Assessment)"}
        </p>
        <div className="category-summaries">
          {Object.entries(responsesByCategory).map(([category, responses]) => {
            const counts = responses.reduce((acc, r) => {
              acc.total++;
              if (r.answer === 'Yes') acc.yes++;
              if (r.answer === 'No') acc.no++;
              if (r.answer === "Don't Know") acc.dontKnow++;
              return acc;
            }, { total: 0, yes: 0, no: 0, dontKnow: 0 });

            return (
              <div key={category} className="category-summary">
                <h3>{category}</h3>
                <div className="category-stats">
                  <p>Total Questions: {counts.total}</p>
                  <p>Yes Responses: {counts.yes} ({Math.round(counts.yes / counts.total * 100)}%)</p>
                  <p>No Responses: {counts.no} ({Math.round(counts.no / counts.total * 100)}%)</p>
                  <p>Don't Know: {counts.dontKnow} ({Math.round(counts.dontKnow / counts.total * 100)}%)</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="detailed-responses">
          <h3>Detailed Responses</h3>
          {Object.entries(responsesByCategory).map(([category, responses]) => (
            <div key={category} className="category-responses">
              <h4>{category} ({responses.length} questions)</h4>
              {responses.map((response, index) => (
                <div key={`${response.questionId}`} className="response-item">
                  <p className="question-text">Q{index + 1}: {response.question}</p>
                  <p className="answer-text">Answer: <strong>{response.answer}</strong></p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQAFormat = (assessment: GroupedResponse) => {
    // Sort responses by category
    const responsesByCategory = assessment.responses.reduce((acc, response) => {
      if (!acc[response.category]) {
        acc[response.category] = [];
      }
      acc[response.category].push(response);
      return acc;
    }, {} as Record<Category, typeof assessment.responses>);

    return (
      <div className="qa-format">
        <h2>Assessment from {new Date(assessment.timestamp).toLocaleString()}</h2>
        {Object.entries(responsesByCategory).map(([category, responses]) => (
          <div key={category} className="category-section">
            <h3>{category}</h3>
            <div className="qa-list">
              {responses.map((response, index) => (
                <div key={index} className="qa-item">
                  <div className="qa-question">
                    <span className="q-label">Q{index + 1}:</span>
                    <span className="q-text">{response.question}</span>
                  </div>
                  <div className="qa-answer">
                    <span className="a-label">A:</span>
                    <span className="a-text">{response.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="questionnaire-status">Loading assessment history...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!assessments.length) {
    return <div className="questionnaire-status">No past assessments found.</div>;
  }

  return (
    <div className="assessment-history">
      <div className="header">
        <h2>Assessment History</h2>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
      <div className="assessments-list">
        {assessments.map((assessment, index) => (
          <div key={index} className="assessment-entry">
            {displayFormat === 'qa' 
              ? renderQAFormat(assessment)
              : renderAssessmentSummary(assessment)
            }
          </div>
        ))}
      </div>
    </div>
  );
} 
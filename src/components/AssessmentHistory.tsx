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

interface GroupedResponse {
  timestamp: string;
  responses: {
    question: string;
    answer: string;
    category: Category;
  }[];
}

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
      // Fetch all responses for this kid
      const responses = await client.models.UserResponse.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      // Fetch all questions to get their text and category
      const questions = await client.models.QuestionBank.list();
      const questionsMap = new Map(questions.data.map(q => [q.id, q]));

      // Group responses by timestamp (treating same-day responses as one assessment)
      const groupedResponses = responses.data.reduce((acc, response) => {
        if (!response.timestamp) return acc;
        
        const date = new Date(response.timestamp).toLocaleDateString();
        const question = questionsMap.get(response.questionId);
        
        if (!question || !question.question_text || !question.category) return acc;

        const existingGroup = acc.find(group => 
          new Date(group.timestamp).toLocaleDateString() === date
        );

        const newResponse = {
          question: question.question_text,
          answer: response.answer || '',
          category: question.category as Category
        };

        if (existingGroup) {
          existingGroup.responses.push(newResponse);
        } else {
          acc.push({
            timestamp: response.timestamp,
            responses: [newResponse]
          });
        }

        return acc;
      }, [] as GroupedResponse[]);

      // Sort by most recent first
      groupedResponses.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAssessments(groupedResponses);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching assessment history:', err);
      setError('Failed to load assessment history. Please try again later.');
      setIsLoading(false);
    }
  };

  const renderAssessmentSummary = (assessment: GroupedResponse) => {
    const categoryCounts = assessment.responses.reduce((acc, response) => {
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
        <h2>Assessment from {new Date(assessment.timestamp).toLocaleDateString()}</h2>
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
          {assessment.responses.map((response, index) => (
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

  const renderQAFormat = (assessment: GroupedResponse) => {
    return (
      <div className="qa-format">
        <h2>Assessment from {new Date(assessment.timestamp).toLocaleDateString()}</h2>
        <div className="qa-list">
          {assessment.responses.map((response, index) => (
            <div key={index} className="qa-item">
              <div className="qa-category">{response.category}</div>
              <div className="qa-question">
                <span className="q-label">Q:</span>
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
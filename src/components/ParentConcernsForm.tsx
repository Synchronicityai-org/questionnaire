import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ParentConcernsForm.css';

interface ParentConcernsFormProps {
  onSubmit: (concerns: string) => void;
}

export function ParentConcernsForm({ onSubmit }: ParentConcernsFormProps) {
  const { kidProfileId } = useParams<{ kidProfileId: string }>();
  const navigate = useNavigate();
  const [concerns, setConcerns] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      onSubmit(concerns);
      if (kidProfileId) {
        navigate(`/questionnaire/${kidProfileId}`);
      }
    } catch (error) {
      console.error('Error saving concerns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-concerns-form">
      <div className="assessment-info">
        <h2>Child Development Assessment</h2>
        <div className="info-section">
          <h3>About This Assessment</h3>
          <p>This assessment will help us understand your child's development across five key areas:</p>
          <ul>
            <li><strong>Cognition:</strong> Problem-solving and learning abilities</li>
            <li><strong>Language:</strong> Communication and understanding</li>
            <li><strong>Motor Skills:</strong> Physical movement and coordination</li>
            <li><strong>Social Skills:</strong> Interaction with others</li>
            <li><strong>Emotional Development:</strong> Understanding and expressing feelings</li>
          </ul>
          <p>The assessment typically takes 15-20 minutes to complete. You can save your progress and return later.</p>
        </div>

        <div className="info-section">
          <h3>Parent Concerns</h3>
          <p>Before we begin, please share any specific concerns you have about your child's development. This information helps us better understand your child's needs.</p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="Share your concerns here (optional)"
              rows={5}
            />
            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:-translate-y-0"
              >
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
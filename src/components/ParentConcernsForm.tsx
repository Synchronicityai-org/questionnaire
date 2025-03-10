import { useState } from 'react';
import './ParentConcernsForm.css';

interface ParentConcernsFormProps {
  onSubmit: (concerns: string) => void;
  onNext: () => void;
}

export function ParentConcernsForm({ onSubmit, onNext }: ParentConcernsFormProps) {
  const [concerns, setConcerns] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(concerns);
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
          <textarea
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            placeholder="Example: I've noticed my child has difficulty following multi-step instructions..."
            rows={6}
          />
        </div>
      </div>

      <div className="assessment-buttons">
        <button
          className="assessment-button"
          onClick={handleSubmit}
        >
          Save Concerns & Continue
        </button>
        <button
          className="assessment-button"
          onClick={onNext}
        >
          Skip & Start Assessment
        </button>
      </div>
    </div>
  );
} 
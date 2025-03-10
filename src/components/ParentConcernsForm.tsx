import { useState } from 'react';
import './QuestionnaireForm.css';

interface ParentConcernsFormProps {
  onSubmit: (concerns: string) => void;
  onNext: () => void;
}

export function ParentConcernsForm({ onSubmit, onNext }: ParentConcernsFormProps) {
  const [concerns, setConcerns] = useState('');

  const handleSubmit = () => {
    onSubmit(concerns);
    onNext();
  };

  return (
    <div className="parent-concerns-container">
      <h2>Parent Concerns</h2>
      <p className="description">
        Before we begin the detailed assessment, please share any specific concerns you have about your child's development.
        This information will help us better understand your child's needs.
      </p>
      
      <div className="concerns-form">
        <textarea
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          placeholder="Please describe any concerns you have about your child's development (optional)"
          rows={6}
          className="concerns-textarea"
        />
      </div>

      <div className="form-actions">
        <button 
          className="submit-button"
          onClick={handleSubmit}
        >
          Continue to Assessment
        </button>
      </div>
    </div>
  );
} 
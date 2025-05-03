import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import styled from 'styled-components';

const client = generateClient<Schema>();

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
  font-family: 'Inter', system-ui, sans-serif;
`;

const PromptCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const PromptText = styled.p`
  font-size: 1.5rem;
  color: #2D3748;
  margin-bottom: 1.5rem;
`;

const PromptImage = styled.img`
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 8px;
`;

const Button = styled.button`
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #357ABD;
  }

  &:disabled {
    background: #CBD5E0;
    cursor: not-allowed;
  }
`;

const Progress = styled.div`
  color: #718096;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

interface GamePrompt {
  id: string;
  gameType: string;
  promptText: string;
  promptOrder: number;
  imageURL?: string;
}

const PromptGame: React.FC = () => {
  const [prompts, setPrompts] = useState<GamePrompt[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await client.models.GamePrompt.list({
        filter: {
          gameType: { eq: "Animal Sounds Quiz" }
        },
      });

      if (response.data) {
        const sortedPrompts = (response.data as GamePrompt[]).sort((a, b) => a.promptOrder - b.promptOrder);
        setPrompts(sortedPrompts);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPrompt = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <Container>
        <div>Loading prompts...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ color: '#E53E3E' }}>{error}</div>
        <Button onClick={fetchPrompts} style={{ marginTop: '1rem' }}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (prompts.length === 0) {
    return (
      <Container>
        <div>No prompts available.</div>
      </Container>
    );
  }

  const currentPrompt = prompts[currentPromptIndex];
  const isLastPrompt = currentPromptIndex === prompts.length - 1;

  return (
    <Container>
      <PromptCard>
        <PromptText>{currentPrompt.promptText}</PromptText>
        {currentPrompt.imageURL && (
          <PromptImage 
            src={currentPrompt.imageURL} 
            alt="Prompt illustration"
            loading="lazy"
          />
        )}
        <Button
          onClick={handleNextPrompt}
          disabled={isLastPrompt}
        >
          {isLastPrompt ? 'Complete' : 'Next Prompt'}
        </Button>
      </PromptCard>
      <Progress>
        Prompt {currentPromptIndex + 1} of {prompts.length}
      </Progress>
    </Container>
  );
};

export default PromptGame; 
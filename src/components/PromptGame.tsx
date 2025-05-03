import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import styled from 'styled-components';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

// We'll use the client in the fetchPrompts function
const client = generateClient<Schema>();

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
`;

const GameCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #60A5FA 0%, #34D399 100%);
  }
`;

const GameTitle = styled.h2`
  font-size: 1.5rem;
  color: #1E293B;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

const PromptText = styled.p`
  font-size: 1.75rem;
  color: #2D3748;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const PromptImage = styled.img`
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)'
    : '#F8FAFC'};
  color: ${props => props.variant === 'primary' ? 'white' : '#1E293B'};
  border: none;
  border-radius: 12px;
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: #CBD5E0;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Progress = styled.div`
  color: #64748B;
  margin-top: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
`;

const Score = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #F8FAFC;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  color: #1E293B;
`;

const Feedback = styled.div<{ type: 'correct' | 'incorrect' }>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.type === 'correct' ? '#DEF7EC' : '#FDE8E8'};
  color: ${props => props.type === 'correct' ? '#03543F' : '#9B1C1C'};
  font-weight: 500;
`;

interface GamePrompt {
  id: string | null;
  gameType: string;
  promptText: string;
  promptOrder: number;
  imageURL: string | null;
  soundURL: string | null;
  options: string[];
  correctAnswer: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const PromptGame: React.FC = () => {
  const [prompts, setPrompts] = useState<GamePrompt[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
    return () => {
      // Cleanup audio on unmount
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Reset states when moving to next question
    setImageLoading(true);
    setAudioError(null);
    setAudioLoading(false);
    if (audio) {
      audio.pause();
      audio.src = '';
    }
  }, [currentPromptIndex]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setError('Failed to load image. Please try refreshing the page.');
  };

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch prompts from the database
      const response = await client.models.GamePrompt.list({
        filter: {
          gameType: { eq: "Animal Sounds Quiz" }
        }
      });

      if (response.data && response.data.length > 0) {
        const formattedPrompts = response.data.map(prompt => ({
          ...prompt,
          options: prompt.options ? JSON.parse(prompt.options) : []
        }));
        
        // Sort prompts by promptOrder
        const sortedPrompts = formattedPrompts.sort((a, b) => a.promptOrder - b.promptOrder);
        setPrompts(sortedPrompts);
      } else {
        setError('No prompts available. Please run the seeding script first.');
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const currentPrompt = prompts[currentPromptIndex];
    const correct = answer === currentPrompt.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (currentPromptIndex < prompts.length - 1) {
        setCurrentPromptIndex(prev => prev + 1);
      }
    }, 2000);
  };

  const handlePlaySound = async () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    const currentPrompt = prompts[currentPromptIndex];
    if (currentPrompt.soundURL) {
      try {
        setAudioLoading(true);
        setAudioError(null);
        
        const newAudio = new Audio(currentPrompt.soundURL);
        
        newAudio.onerror = (e) => {
          console.error('Error loading audio:', e);
          setAudioError('Failed to load audio. Please try again.');
          setIsPlaying(false);
          setAudioLoading(false);
        };

        newAudio.oncanplaythrough = () => {
          setAudioLoading(false);
          setIsPlaying(true);
          newAudio.play().catch(error => {
            console.error('Error playing audio:', error);
            setAudioError('Failed to play audio. Please try again.');
            setIsPlaying(false);
          });
        };

        newAudio.onended = () => {
          setIsPlaying(false);
        };

        setAudio(newAudio);
      } catch (error) {
        console.error('Error creating audio element:', error);
        setAudioError('Failed to create audio element. Please try again.');
        setIsPlaying(false);
        setAudioLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <GameCard>
          <div>Loading game...</div>
        </GameCard>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <GameCard>
          <div style={{ color: '#E53E3E' }}>{error}</div>
          <Button onClick={fetchPrompts} style={{ marginTop: '1rem' }}>
            Try Again
          </Button>
        </GameCard>
      </Container>
    );
  }

  if (prompts.length === 0) {
    return (
      <Container>
        <GameCard>
          <div>No prompts available.</div>
        </GameCard>
      </Container>
    );
  }

  const currentPrompt = prompts[currentPromptIndex];

  return (
    <Container>
      <GameCard>
        <Score>Score: {score}/{prompts.length}</Score>
        <GameTitle>Animal Sounds Quiz</GameTitle>
        <PromptText>{currentPrompt.promptText}</PromptText>
        
        {currentPrompt.imageURL && (
          <>
            {imageLoading && <div>Loading image...</div>}
            <PromptImage 
              src={currentPrompt.imageURL} 
              alt="Animal illustration"
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </>
        )}

        <ButtonGroup>
          <Button 
            onClick={handlePlaySound}
            variant="secondary"
            disabled={isPlaying || audioLoading}
          >
            {audioLoading ? (
              <>Loading sound...</>
            ) : isPlaying ? (
              <>
                <SpeakerXMarkIcon />
                Playing...
              </>
            ) : (
              <>
                <SpeakerWaveIcon />
                Play Sound
              </>
            )}
          </Button>
        </ButtonGroup>

        {audioError && (
          <Feedback type="incorrect">
            {audioError}
          </Feedback>
        )}

        <div style={{ marginTop: '2rem' }}>
          {currentPrompt.options?.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
              variant="secondary"
              style={{ margin: '0.5rem' }}
              disabled={isPlaying || audioLoading}
            >
              {option}
            </Button>
          ))}
        </div>

        {showFeedback && (
          <Feedback type={isCorrect ? 'correct' : 'incorrect'}>
            {isCorrect ? 'Correct! 🎉' : 'Try again! 💪'}
          </Feedback>
        )}

        <Progress>
          Question {currentPromptIndex + 1} of {prompts.length}
        </Progress>
      </GameCard>
    </Container>
  );
};

export default PromptGame; 
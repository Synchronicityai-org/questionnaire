import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const GameCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
`;

const QuestionText = styled.h2`
  font-size: 1.75rem;
  color: #2D3748;
  margin: 1.5rem 0;
  font-weight: 600;
`;

const CategoryBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #EDF2F7;
  color: #4A5568;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const PromptText = styled.p`
  color: #4A5568;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const ResponseInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }

  &:disabled {
    background-color: #F7FAFC;
    cursor: not-allowed;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? '#EDF2F7' : 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)'};
  color: ${props => props.variant === 'secondary' ? '#4A5568' : 'white'};
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem auto;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EndButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #EDF2F7;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #E2E8F0;
  }
`;

const Summary = styled.div`
  text-align: left;
  margin-top: 2rem;

  h3 {
    color: #2D3748;
    margin-bottom: 1rem;
  }
`;

const QAPair = styled.div`
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;

  .question {
    font-weight: 600;
    color: #2D3748;
    margin-bottom: 0.5rem;
  }

  .answer {
    color: #4A5568;
  }

  .category {
    font-size: 0.9rem;
    color: #718096;
    margin-bottom: 0.5rem;
  }
`;

interface Question {
  id: string;
  category: 'daily_routine' | 'imagination' | 'social' | 'problem_solving';
  text: string;
  prompt: string;
  isImaginary?: boolean;
}

const questions: Question[] = [
  // Daily Routine Questions
  {
    id: '1',
    category: 'daily_routine',
    text: 'What happens next when you wake up in the morning?',
    prompt: 'Think about your morning routine. What do you like to do first?',
  },
  {
    id: '2',
    category: 'daily_routine',
    text: 'What happens next when you finish your milk?',
    prompt: 'What do you do with your cup when you\'re done?',
  },
  {
    id: '3',
    category: 'daily_routine',
    text: 'What happens next when your hands are dirty?',
    prompt: 'How do you like to clean your hands?',
  },
  {
    id: '4',
    category: 'daily_routine',
    text: 'What happens next when you\'re sleepy?',
    prompt: 'What helps you feel cozy and ready for sleep?',
  },

  // Imagination Questions
  {
    id: '5',
    category: 'imagination',
    text: 'What happens next when you find a big balloon?',
    prompt: 'What would you do with a big balloon? Let your imagination fly!',
    isImaginary: true
  },
  {
    id: '6',
    category: 'imagination',
    text: 'What happens next when your stuffed animal talks?',
    prompt: 'What would you talk about with your talking stuffed animal?',
    isImaginary: true
  },
  {
    id: '7',
    category: 'imagination',
    text: 'What happens next when you find a magic wand?',
    prompt: 'What would you create or change with your magic wand?',
    isImaginary: true
  },
  {
    id: '8',
    category: 'imagination',
    text: 'What happens next when you find a rainbow in your backyard?',
    prompt: 'What would you discover at the end of the rainbow?',
    isImaginary: true
  },

  // Problem Solving Questions
  {
    id: '9',
    category: 'problem_solving',
    text: 'What happens next when you can\'t reach something on a high shelf?',
    prompt: 'What would you do to get the thing you need?',
  },
  {
    id: '10',
    category: 'problem_solving',
    text: 'What happens next when you feel too hot outside?',
    prompt: 'How do you like to cool down when it\'s hot?',
  },
  {
    id: '11',
    category: 'problem_solving',
    text: 'What happens next when you spill something?',
    prompt: 'What would you do to clean up the spill?',
  },
  {
    id: '12',
    category: 'problem_solving',
    text: 'What happens next when you can\'t find your favorite toy?',
    prompt: 'Where would you look for your toy?',
  },

  // Social Questions
  {
    id: '13',
    category: 'social',
    text: 'What happens next when you see a new student in class?',
    prompt: 'How would you help them feel welcome?'
  },
  {
    id: '14',
    category: 'social',
    text: 'What happens next when someone looks sad?',
    prompt: 'What could you do or say to help them?'
  },
  {
    id: '15',
    category: 'social',
    text: 'What happens next when your friend shares their toy with you?',
    prompt: 'How do you show them you appreciate sharing?'
  },
  {
    id: '16',
    category: 'social',
    text: 'What happens next when you want to join a game others are playing?',
    prompt: 'How would you ask to join in?'
  },
  {
    id: '17',
    category: 'social',
    text: 'What happens next when someone helps you?',
    prompt: 'What would you say or do?'
  },
  {
    id: '18',
    category: 'social',
    text: 'What happens next when your friend falls down at recess?',
    prompt: 'How could you help your friend?'
  },
  {
    id: '19',
    category: 'social',
    text: 'What happens next when you and your friend want to play with the same toy?',
    prompt: 'How could you solve this together?'
  },
  {
    id: '20',
    category: 'social',
    text: 'What happens next when someone waves hello to you?',
    prompt: 'What would you do when you see them?'
  }
];

interface Answer {
  questionId: string;
  question: string;
  answer: string;
  category: string;
}

export const WhatHappensNext: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());

  const getRandomQuestion = () => {
    const availableQuestions = questions.filter(q => !usedQuestions.has(q.id));
    if (availableQuestions.length === 0) {
      return null;
    }
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  };

  useEffect(() => {
    setCurrentQuestion(getRandomQuestion());
  }, []);

  const handleSubmit = () => {
    if (userResponse.trim() && currentQuestion) {
      // Save the answer
      setAnswers(prev => [...prev, {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: userResponse.trim(),
        category: currentQuestion.category
      }]);

      // Move to next question
      setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));
      const nextQuestion = getRandomQuestion();
      
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setUserResponse('');
      } else {
        setIsGameEnded(true);
      }
    }
  };

  const handleEndGame = () => {
    if (userResponse.trim() && currentQuestion) {
      // Save the last answer before ending
      setAnswers(prev => [...prev, {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: userResponse.trim(),
        category: currentQuestion.category
      }]);
    }
    setIsGameEnded(true);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'daily_routine': return '📅 Daily Routine';
      case 'imagination': return '🌈 Imagination';
      case 'social': return '👥 Social Skills';
      case 'problem_solving': return '🧩 Problem Solving';
      default: return category;
    }
  };

  if (isGameEnded) {
    return (
      <Container>
        <GameCard>
          <h2>Game Summary</h2>
          <p>Here are all your answers:</p>
          <Summary>
            {answers.map((answer) => (
              <QAPair key={answer.questionId}>
                <div className="category">{getCategoryLabel(answer.category)}</div>
                <div className="question">{answer.question}</div>
                <div className="answer">{answer.answer}</div>
              </QAPair>
            ))}
          </Summary>
          <Button 
            variant="secondary"
            onClick={() => window.location.href = '/games'}
          >
            Back to Games
          </Button>
        </GameCard>
      </Container>
    );
  }

  if (!currentQuestion) return <div>Loading...</div>;

  return (
    <Container>
      <GameCard>
        <EndButton onClick={handleEndGame} title="End Game">
          <XMarkIcon style={{ width: 20, height: 20 }} />
        </EndButton>
        <CategoryBadge>{getCategoryLabel(currentQuestion.category)}</CategoryBadge>
        <QuestionText>{currentQuestion.text}</QuestionText>
        <PromptText>{currentQuestion.prompt}</PromptText>

        <ResponseInput
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder="Type your answer here..."
        />

        <Button 
          onClick={handleSubmit}
          disabled={!userResponse.trim()}
        >
          <SparklesIcon style={{ width: 24, height: 24 }} />
          Next Question
        </Button>
      </GameCard>
    </Container>
  );
}; 
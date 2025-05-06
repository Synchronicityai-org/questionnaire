import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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

const ImageContainer = styled.div`
  margin: 2rem 0;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 500px;
  height: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
`;

const PoseImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

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

const StartOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const CountdownTimer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: bold;
`;

// Use the actual image filenames from the public/resources/images/copyme directory
const images = [
  '/resources/images/copyme/Cheerful%20Boy%20with%20Vibrant%20Background.png',
  '/resources/images/copyme/Cheerful%20Girl%20with%20Bold%20Message.png',
  '/resources/images/copyme/Copy%20Me%20Pose%20Celebration.png',
  '/resources/images/copyme/Happy%20Boy%20Ready%20to%20Pose.png',
  '/resources/images/copyme/Happy%20Boy%20with%20Copy%20Me%20Text.png',
  '/resources/images/copyme/Imitate%20Me%20Playful%20Illustration.png',
  '/resources/images/copyme/Imitate%20My%20Pose!.png',
  '/resources/images/copyme/Jovial%20Girl%20with%20Bold%20Text.png',
  '/resources/images/copyme/Joyful%20Boy%20with%20_COPY%20ME!_%20Message.png',
  '/resources/images/copyme/Joyful%20Boy%20with%20Raised%20Arms.png',
  '/resources/images/copyme/Playful%20Girl%20in%20Bright%20Colors.png',
  '/resources/images/copyme/Réplicame!.png',
  '/resources/images/copyme/Tiny%20Wins%20Celebration.png',
  '/resources/images/copyme/Tiny%20Wins%20Hero.png',
];

// Encouraging phrases for subsequent images
const encouragingPhrases = [
  'Wow, great job! Now copy me again!',
  'Hey, great! Copy me!',
  "Awesome! Let's do another one - copy me!",
  "You're doing amazing! Copy me!",
  'Fantastic! Ready? Copy me!',
  'Super work! Now, copy me again!',
  'Excellent! Copy me!',
  'You rock! Copy me!',
  'Keep going! Copy me!'
];

export const CopyMe: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [isPaused, setIsPaused] = useState(false);

  // Play the MP3 or use TTS fallback with varied phrases
  const playPrompt = (index: number) => {
    const audio = new Audio('/resources/audio/copy-me.mp3');
    let played = false;
    audio.oncanplaythrough = () => {
      if (!played) {
        played = true;
        audio.play().catch(() => {});
      }
    };
    audio.onerror = () => {
      if (!played) {
        played = true;
        let phrase = 'Copy me!';
        if (index > 0) {
          // Pick a random phrase for subsequent images
          phrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
        }
        const msg = new window.SpeechSynthesisUtterance(phrase);
        msg.lang = 'en-US';
        msg.pitch = 1.4;
        msg.rate = 1.1;
        window.speechSynthesis.speak(msg);
      }
    };
    audio.play().then(() => { played = true; }).catch(() => {});
  };

  // Auto-advance timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (started && !isPaused && currentImageIndex < images.length - 1) {
      if (countdown > 0) {
        timer = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        handleNext();
        setCountdown(7);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [started, countdown, currentImageIndex, isPaused]);

  // Play prompt for images after the first, only when started
  useEffect(() => {
    if (started && currentImageIndex > 0) {
      playPrompt(currentImageIndex);
    }
  }, [currentImageIndex, started]);

  const handleStart = () => {
    setStarted(true);
    playPrompt(0);
    setCountdown(7);
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setCountdown(7);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setCountdown(7);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <Container>
      <GameCard>
        <h2>Copy Me!</h2>
        <p>Listen to the prompt and copy the pose shown in the image</p>
        <ImageContainer style={{ position: 'relative' }}>
          <PoseImage 
            src={images[currentImageIndex]} 
            alt={`Pose ${currentImageIndex + 1}`}
          />
          {started && !isPaused && countdown > 0 && (
            <CountdownTimer>
              {countdown}
            </CountdownTimer>
          )}
          {currentImageIndex === 0 && !started && (
            <StartOverlay>
              <h3>Ready to play?</h3>
              <button style={{
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700
              }} onClick={handleStart}>
                Start
              </button>
            </StartOverlay>
          )}
        </ImageContainer>

        <ButtonGroup>
          <Button 
            onClick={handlePrevious}
            disabled={currentImageIndex === 0 || !started}
          >
            <ArrowLeftIcon />
            Previous
          </Button>
          <Button
            onClick={togglePause}
            disabled={!started || currentImageIndex === images.length - 1}
            style={{
              background: isPaused ? '#EF4444' : '#10B981'
            }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentImageIndex === images.length - 1 || !started}
          >
            Next
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>

        <Progress>
          Pose {currentImageIndex + 1} of {images.length}
        </Progress>
      </GameCard>
    </Container>
  );
}; 
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowRightIcon, ArrowLeftIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

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

export const CopyMe: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Play the audio prompt
  const playPrompt = () => {
    const audio = new Audio('/resources/audio/copy-me.mp3');
    audio.play().catch(error => {
      // Most browsers will block until user interacts
      console.error('Error playing audio:', error);
    });
  };

  // Play sound on first mount if user has interacted
  useEffect(() => {
    if (hasInteracted) {
      playPrompt();
    }
    // eslint-disable-next-line
  }, [currentImageIndex, hasInteracted]);

  const handleNext = () => {
    setHasInteracted(true);
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      playPrompt();
    }
  };

  const handlePrevious = () => {
    setHasInteracted(true);
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      playPrompt();
    }
  };

  // Optionally, play sound on first mount after first user interaction
  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      playPrompt();
    }
  };

  return (
    <Container onClick={handleFirstInteraction}>
      <GameCard>
        <h2>Copy Me!</h2>
        <p>Listen to the prompt and copy the pose shown in the image</p>
        
        <ImageContainer>
          <PoseImage 
            src={images[currentImageIndex]} 
            alt={`Pose ${currentImageIndex + 1}`}
          />
        </ImageContainer>

        <ButtonGroup>
          <Button 
            onClick={handlePrevious}
            disabled={currentImageIndex === 0}
          >
            <ArrowLeftIcon />
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentImageIndex === images.length - 1}
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
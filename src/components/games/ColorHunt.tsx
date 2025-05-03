import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { CameraIcon } from '@heroicons/react/24/outline';

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
`;

const ColorTarget = styled.div<{ color: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color};
  margin: 2rem 0;
`;

const CameraButton = styled.button`
  background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const Preview = styled.img`
  max-width: 100%;
  margin-top: 1rem;
  border-radius: 12px;
`;

const Score = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #F8FAFC;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
`;

interface ColorInfo {
  name: string;
  hex: string;
}

const colors: ColorInfo[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' }
];

export const ColorHunt: React.FC = () => {
  const [currentColor, setCurrentColor] = useState<ColorInfo>(colors[0]);
  const [image, setImage] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        // Here we would add color detection logic
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    // Simulate color detection
    setTimeout(() => {
      const success = Math.random() > 0.5;
      if (success) {
        setScore(prev => prev + 1);
        // Move to next color
        const nextIndex = (colors.findIndex(c => c.name === currentColor.name) + 1) % colors.length;
        setCurrentColor(colors[nextIndex]);
      }
      setImage(null);
    }, 1000);
  };

  return (
    <Container>
      <GameCard>
        <Score>Score: {score}</Score>
        <h1>Color Hunt</h1>
        <p>Find something that is this color:</p>
        <ColorTarget color={currentColor.hex}>{currentColor.name}</ColorTarget>
        
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        <CameraButton onClick={handleCapture}>
          <CameraIcon className="w-6 h-6" />
          Take Photo
        </CameraButton>

        {image && (
          <Preview src={image} alt="Captured" />
        )}
      </GameCard>
    </Container>
  );
}; 
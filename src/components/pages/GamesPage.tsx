import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeftIcon, CameraIcon, QuestionMarkCircleIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #EDF2F7 0%, #F7FAFC 100%);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background-color: #FFFFFF;
  border-radius: 24px;
  box-shadow: 
    0 4px 6px rgba(31, 41, 55, 0.04),
    0 12px 16px rgba(31, 41, 55, 0.06);
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 2.75rem;
    color: #1E293B;
    margin: 0;
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(90deg, #1E293B 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #64748B;
    margin: 0.75rem 0 0;
    font-size: 1.25rem;
    font-weight: 400;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: #F8FAFC;
  color: #1E293B;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F1F5F9;
    transform: translateX(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const GameCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(31, 41, 55, 0.1);
  }

  .game-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #1E293B;
    margin: 0 0 0.75rem 0;
    font-weight: 600;
  }

  p {
    color: #64748B;
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

export function GamesPage() {
  const navigate = useNavigate();

  const games = [
    {
      id: 'copy-me',
      title: 'Copy Me',
      description: 'Listen and copy the poses shown in the images!',
      icon: <UserIcon style={{ color: 'white', width: 32, height: 32 }} />,
      path: '/games/copy-me'
    },
    {
      id: 'color-hunt',
      title: 'Color Hunt',
      description: 'Find and photograph objects matching the target color!',
      icon: <CameraIcon style={{ color: 'white', width: 32, height: 32 }} />,
      path: '/games/color-hunt'
    },
    {
      id: 'what-happens-next',
      title: 'What Happens Next?',
      description: 'Think about what happens next in different situations!',
      icon: <QuestionMarkCircleIcon style={{ color: 'white', width: 32, height: 32 }} />,
      path: '/games/what-happens-next'
    },
    {
      id: 'complete-the-story',
      title: 'Complete the Story',
      description: 'Use your imagination to complete exciting story adventures!',
      icon: <BookOpenIcon style={{ color: 'white', width: 32, height: 32 }} />,
      path: '/games/complete-the-story'
    }
    // Add more games here as they are developed
  ];

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Interactive Games</h1>
          <p>Fun learning activities to develop skills</p>
        </HeaderContent>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
          Back
        </BackButton>
      </Header>

      <GamesGrid>
        {games.map(game => (
          <GameCard key={game.id} onClick={() => navigate(game.path)}>
            <div className="game-icon">
              {game.icon}
            </div>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
          </GameCard>
        ))}
      </GamesGrid>
    </Container>
  );
} 
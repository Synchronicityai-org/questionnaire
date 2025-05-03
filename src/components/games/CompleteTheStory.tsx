import React, { useState } from 'react';
import styled from 'styled-components';
import { BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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

const StoryPrompt = styled.div`
  font-size: 1.25rem;
  color: #2D3748;
  margin: 1.5rem 0;
  text-align: left;
  line-height: 1.6;
`;

const VisualPrompt = styled.div`
  background: #F7FAFC;
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
  color: #4A5568;
  font-style: italic;
`;

const ResponseInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 1.1rem;
  margin: 1rem 0;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
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
  margin: 1rem auto;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Summary = styled.div`
  text-align: left;
  margin-top: 2rem;
`;

const StoryCard = styled.div`
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  .prompt {
    font-weight: 600;
    color: #2D3748;
    margin-bottom: 1rem;
  }

  .completion {
    color: #4A5568;
    font-style: italic;
  }
`;

interface Story {
  id: string;
  beginning: string;
  visualPrompt: string;
  emotionalContext?: string;
}

const stories: Story[] = [
  // Daily Routines (10 stories)
  {
    id: '1',
    beginning: "Sarah saw a colorful butterfly in the garden. The butterfly landed on a flower and...",
    visualPrompt: "Picture the butterfly: What colors do you see? What is the butterfly doing on the flower?",
    emotionalContext: "How do you think Sarah feels seeing the butterfly?"
  },
  {
    id: '2',
    beginning: "Every morning, Tommy helps make his bed. Today, he found his favorite toy under the covers and...",
    visualPrompt: "What toy did Tommy find? What does his bed look like?",
    emotionalContext: "How does Tommy feel about making his bed and finding his toy?"
  },
  {
    id: '3',
    beginning: "During breakfast, Emma spilled some milk on the table. She looked at the spill and decided to...",
    visualPrompt: "Can you see the spilled milk? What's on the breakfast table?",
    emotionalContext: "How does Emma feel about the spill? What should she do?"
  },
  {
    id: '4',
    beginning: "It was time to brush teeth before bed. Sam saw his toothbrush had a special new power and...",
    visualPrompt: "What does the special toothbrush look like? What can it do?",
    emotionalContext: "How does Sam feel about brushing teeth now?"
  },
  {
    id: '5',
    beginning: "Lisa was putting on her shoes to go to school. Suddenly, her shoelaces started to...",
    visualPrompt: "What are her shoes like? What's happening with the shoelaces?",
    emotionalContext: "How does Lisa feel about this shoe adventure?"
  },
  {
    id: '6',
    beginning: "During dinner, Daniel noticed his vegetables were arranged in a funny pattern. Then...",
    visualPrompt: "What pattern do you see on the plate? What vegetables are there?",
    emotionalContext: "How does Daniel feel about eating vegetables now?"
  },
  {
    id: '7',
    beginning: "While taking a bath, Maya's rubber duck started to glow and...",
    visualPrompt: "What color is the duck glowing? What else is in the bathtub?",
    emotionalContext: "How does Maya feel about her magical bath toy?"
  },
  {
    id: '8',
    beginning: "Jack was helping fold laundry when a sock jumped out of the pile and...",
    visualPrompt: "What does the sock look like? Where did it jump?",
    emotionalContext: "How does Jack feel about this surprising moment?"
  },
  {
    id: '9',
    beginning: "During cleanup time, Olivia found a toy that could organize everything by itself. It started to...",
    visualPrompt: "What does this special toy look like? How does it clean up?",
    emotionalContext: "How does Olivia feel about cleaning up now?"
  },
  {
    id: '10',
    beginning: "At bedtime, Noah's nightlight created magical shapes on the wall. The shapes began to...",
    visualPrompt: "What shapes do you see? What colors are they?",
    emotionalContext: "How does Noah feel about going to bed?"
  },

  // School and Learning (10 stories)
  {
    id: '11',
    beginning: "In art class, Mia's paintbrush started creating pictures all by itself. It painted...",
    visualPrompt: "What is the paintbrush drawing? What colors is it using?",
    emotionalContext: "How does Mia feel about this magical paintbrush?"
  },
  {
    id: '12',
    beginning: "During story time, the book Ben was reading suddenly came to life, and...",
    visualPrompt: "What story was in the book? What happened when it came alive?",
    emotionalContext: "How does Ben feel about books now?"
  },
  {
    id: '13',
    beginning: "At recess, Sofia discovered she could understand what the playground equipment was saying. The slide told her...",
    visualPrompt: "What does the playground look like? What might a slide say?",
    emotionalContext: "How does Sofia feel about this special ability?"
  },
  {
    id: '14',
    beginning: "In math class, the numbers on Lucas's worksheet jumped off the page and started dancing. They...",
    visualPrompt: "What do dancing numbers look like? What math problems were they from?",
    emotionalContext: "How does Lucas feel about math now?"
  },
  {
    id: '15',
    beginning: "During music class, Ava's recorder started playing a tune that made everyone...",
    visualPrompt: "What tune is playing? How are people reacting?",
    emotionalContext: "How does Ava feel about playing music?"
  },
  {
    id: '16',
    beginning: "In science class, David's experiment created a friendly bubble that could...",
    visualPrompt: "What does the bubble look like? What can it do?",
    emotionalContext: "How does David feel about his science experiment?"
  },
  {
    id: '17',
    beginning: "While writing in her journal, Lily noticed her pencil was writing in rainbow colors and...",
    visualPrompt: "What colors do you see? What is the pencil writing?",
    emotionalContext: "How does Lily feel about writing now?"
  },
  {
    id: '18',
    beginning: "During lunch break, Ethan's sandwich turned into a tiny spaceship that...",
    visualPrompt: "What kind of sandwich was it? Where did the spaceship go?",
    emotionalContext: "How does Ethan feel about this lunch adventure?"
  },
  {
    id: '19',
    beginning: "In PE class, Isabella's jump rope started glowing and could make her...",
    visualPrompt: "What color is the jump rope glowing? What can it help her do?",
    emotionalContext: "How does Isabella feel about PE class now?"
  },
  {
    id: '20',
    beginning: "While reading in the library, Mason found a book that knew exactly what story he wanted to read. It opened to...",
    visualPrompt: "What does the book look like? What story did it show?",
    emotionalContext: "How does Mason feel about this special book?"
  },

  // Making Friends (10 stories)
  {
    id: '21',
    beginning: "During lunch, Jamie shared their sandwich with a friend who forgot their lunch. Then...",
    visualPrompt: "Think about sharing: What kind of sandwich was it? What did the friends do next?",
    emotionalContext: "How do both friends feel after sharing?"
  },
  {
    id: '22',
    beginning: "Zoe saw a new student standing alone at recess. She walked over and...",
    visualPrompt: "What is happening on the playground? What games could they play?",
    emotionalContext: "How do both children feel about making a new friend?"
  },
  {
    id: '23',
    beginning: "Alex and Jordan disagreed about which game to play. They decided to...",
    visualPrompt: "What games did they want to play? How can they solve this?",
    emotionalContext: "How do they feel about finding a solution?"
  },
  {
    id: '24',
    beginning: "When Rachel saw her friend crying, she remembered her magic pocket could...",
    visualPrompt: "What might be in the magic pocket? How can it help?",
    emotionalContext: "How do both friends feel after helping?"
  },
  {
    id: '25',
    beginning: "Miguel noticed someone had left their favorite toy behind. He picked it up and...",
    visualPrompt: "What kind of toy is it? Where might its owner be?",
    emotionalContext: "How does Miguel feel about helping?"
  },
  {
    id: '26',
    beginning: "During group work, Hannah's partner had trouble understanding the task. Hannah thought of a way to help by...",
    visualPrompt: "What are they working on? How can Hannah explain it?",
    emotionalContext: "How do both students feel about working together?"
  },
  {
    id: '27',
    beginning: "Carlos noticed his friend was having a bad day. He remembered his collection of funny jokes and...",
    visualPrompt: "What kind of jokes might help? How can he cheer up his friend?",
    emotionalContext: "How do they both feel after sharing jokes?"
  },
  {
    id: '28',
    beginning: "When two friends both wanted to be team captain, Sophie suggested...",
    visualPrompt: "What game are they playing? How can they make it fair?",
    emotionalContext: "How do the friends feel about Sophie's idea?"
  },
  {
    id: '29',
    beginning: "During art time, Leo saw that someone needed the same color paint he was using. He...",
    visualPrompt: "What are they painting? How can they share the paint?",
    emotionalContext: "How do both children feel about sharing?"
  },
  {
    id: '30',
    beginning: "At the playground, Anna saw someone trying to learn how to swing. She remembered when she learned and...",
    visualPrompt: "What does the playground look like? How can Anna help?",
    emotionalContext: "How do both children feel about learning together?"
  },

  // Problem Solving (10 stories)
  {
    id: '31',
    beginning: "Max built a tall tower with blocks. When he added one more block...",
    visualPrompt: "Imagine the tower: How many blocks? What colors are they? What happens next?",
    emotionalContext: "How does Max feel about what happens to his tower?"
  },
  {
    id: '32',
    beginning: "The classroom pet hamster escaped from its cage. Lucy had an idea to...",
    visualPrompt: "Where might the hamster be? What's Lucy's plan?",
    emotionalContext: "How does Lucy feel about helping find the hamster?"
  },
  {
    id: '33',
    beginning: "Ryan's favorite game wouldn't start. Instead of getting upset, he tried to...",
    visualPrompt: "What kind of game is it? What could be wrong?",
    emotionalContext: "How does Ryan feel about solving problems?"
  },
  {
    id: '34',
    beginning: "The art supplies were all mixed up before class. Maria thought of a system to...",
    visualPrompt: "What supplies need organizing? How can they be sorted?",
    emotionalContext: "How does Maria feel about creating order?"
  },
  {
    id: '35',
    beginning: "When the soccer ball got stuck in a tree, Diego remembered his special whistle that could...",
    visualPrompt: "How high is the ball? What can the whistle do?",
    emotionalContext: "How does Diego feel about solving this problem?"
  },
  {
    id: '36',
    beginning: "The classroom plants were wilting. Nina discovered she could talk to plants and learned...",
    visualPrompt: "What do the plants look like? What might they say?",
    emotionalContext: "How does Nina feel about helping the plants?"
  },
  {
    id: '37',
    beginning: "When the classroom got too noisy, Sam invented a peaceful bubble that...",
    visualPrompt: "What does the bubble look like? How does it help?",
    emotionalContext: "How do the students feel inside the bubble?"
  },
  {
    id: '38',
    beginning: "The class pet fish looked sad. Jasmine noticed and decided to...",
    visualPrompt: "What does the fish tank look like? What might make the fish happy?",
    emotionalContext: "How does Jasmine feel about helping the fish?"
  },
  {
    id: '39',
    beginning: "When it started raining during outdoor play, Parker remembered his backpack had a special power to...",
    visualPrompt: "What does the backpack do? How does it help?",
    emotionalContext: "How do the children feel about Parker's solution?"
  },
  {
    id: '40',
    beginning: "The story book pages got mixed up. Alice had a creative idea to...",
    visualPrompt: "What story is it? How can the pages be fixed?",
    emotionalContext: "How does Alice feel about fixing the book?"
  },

  // Imagination and Magic (10 stories)
  {
    id: '41',
    beginning: "On a rainy day, Alex found a magical umbrella that could...",
    visualPrompt: "Imagine this special umbrella: What makes it magical? What can it do?",
    emotionalContext: "How does Alex feel about finding something magical?"
  },
  {
    id: '42',
    beginning: "The family's pet dog discovered a mysterious box in the backyard. Inside the box was...",
    visualPrompt: "Picture the box: What size is it? What could be inside?",
    emotionalContext: "How does the dog feel about finding the box?"
  },
  {
    id: '43',
    beginning: "When Liam drew a picture of a dragon, it flew right off the page and...",
    visualPrompt: "What does the dragon look like? Where does it fly?",
    emotionalContext: "How does Liam feel about his drawing coming to life?"
  },
  {
    id: '44',
    beginning: "Grace's garden gnome started moving at night and left her messages about...",
    visualPrompt: "What does the gnome look like? What messages does it leave?",
    emotionalContext: "How does Grace feel about her magical garden friend?"
  },
  {
    id: '45',
    beginning: "Owen's toy car shrank him down to its size, and together they...",
    visualPrompt: "What kind of car is it? Where do they go?",
    emotionalContext: "How does Owen feel about this tiny adventure?"
  },
  {
    id: '46',
    beginning: "The stars outside Penny's window started spelling out...",
    visualPrompt: "How do the stars look? What might they spell?",
    emotionalContext: "How does Penny feel about this magical night?"
  },
  {
    id: '47',
    beginning: "When Harper opened her lunch box, she found a door to...",
    visualPrompt: "What does the door look like? Where does it lead?",
    emotionalContext: "How does Harper feel about this discovery?"
  },
  {
    id: '48',
    beginning: "Felix's shadow started doing different things than he did. It decided to...",
    visualPrompt: "What is the shadow doing? How is it different from Felix?",
    emotionalContext: "How does Felix feel about his independent shadow?"
  },
  {
    id: '49',
    beginning: "Charlotte's collection of seashells started whispering stories about...",
    visualPrompt: "What do the seashells look like? What stories do they tell?",
    emotionalContext: "How does Charlotte feel about her storytelling shells?"
  },
  {
    id: '50',
    beginning: "When Adrian hummed a tune, the flowers in the garden started...",
    visualPrompt: "What kind of flowers are there? What do they do when Adrian hums?",
    emotionalContext: "How does Adrian feel about making the flowers move?"
  }
];

interface CompletedStory {
  storyId: string;
  beginning: string;
  completion: string;
}

export const CompleteTheStory: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story>(stories[0]);
  const [userResponse, setUserResponse] = useState('');
  const [completedStories, setCompletedStories] = useState<CompletedStory[]>([]);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [usedStories, setUsedStories] = useState<Set<string>>(new Set());

  const getRandomStory = () => {
    const availableStories = stories.filter(s => !usedStories.has(s.id));
    if (availableStories.length === 0) {
      return null;
    }
    return availableStories[Math.floor(Math.random() * availableStories.length)];
  };

  const handleSubmit = () => {
    if (userResponse.trim()) {
      // Save the completed story
      setCompletedStories(prev => [...prev, {
        storyId: currentStory.id,
        beginning: currentStory.beginning,
        completion: userResponse.trim()
      }]);

      // Move to next story
      setUsedStories(prev => new Set([...prev, currentStory.id]));
      const nextStory = getRandomStory();
      
      if (nextStory) {
        setCurrentStory(nextStory);
        setUserResponse('');
      } else {
        setIsGameEnded(true);
      }
    }
  };

  const handleEndGame = () => {
    if (userResponse.trim()) {
      // Save the last story before ending
      setCompletedStories(prev => [...prev, {
        storyId: currentStory.id,
        beginning: currentStory.beginning,
        completion: userResponse.trim()
      }]);
    }
    setIsGameEnded(true);
  };

  if (isGameEnded) {
    return (
      <Container>
        <GameCard>
          <h2>Your Story Collection</h2>
          <p>Here are all the stories you completed:</p>
          <Summary>
            {completedStories.map((story) => (
              <StoryCard key={story.storyId}>
                <div className="prompt">{story.beginning}</div>
                <div className="completion">{story.completion}</div>
              </StoryCard>
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

  return (
    <Container>
      <GameCard>
        <h1>Complete the Story</h1>
        <StoryPrompt>
          {currentStory.beginning}
        </StoryPrompt>
        
        <VisualPrompt>
          {currentStory.visualPrompt}
          {currentStory.emotionalContext && (
            <>
              <br />
              {currentStory.emotionalContext}
            </>
          )}
        </VisualPrompt>

        <ResponseInput
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder="What happens next in the story? Type your ideas here..."
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button 
            onClick={handleSubmit}
            disabled={!userResponse.trim()}
          >
            <BookOpenIcon style={{ width: 24, height: 24 }} />
            Next Story
          </Button>

          <Button 
            variant="secondary"
            onClick={handleEndGame}
          >
            <ArrowRightIcon style={{ width: 24, height: 24 }} />
            Finish
          </Button>
        </div>
      </GameCard>
    </Container>
  );
}; 
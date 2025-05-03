import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsconfig from '../../amplify_outputs.json' assert { type: 'json' };

// Configure Amplify
Amplify.configure(awsconfig);

const client = generateClient();

const gamePrompts = [
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'What animal makes this sound?',
    promptOrder: 1,
    imageURL: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/lion-roar-2.mp3',
    options: JSON.stringify(['Lion', 'Tiger', 'Bear', 'Elephant']),
    correctAnswer: 'Lion'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Listen carefully! Which animal is this?',
    promptOrder: 2,
    imageURL: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/dog-barking.mp3',
    options: JSON.stringify(['Dog', 'Wolf', 'Fox', 'Coyote']),
    correctAnswer: 'Dog'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Can you guess this animal?',
    promptOrder: 3,
    imageURL: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/cat-meow.mp3',
    options: JSON.stringify(['Cat', 'Lion', 'Tiger', 'Leopard']),
    correctAnswer: 'Cat'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Which animal makes this sound?',
    promptOrder: 4,
    imageURL: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/elephant.mp3',
    options: JSON.stringify(['Elephant', 'Hippo', 'Rhino', 'Giraffe']),
    correctAnswer: 'Elephant'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Listen! What animal is this?',
    promptOrder: 5,
    imageURL: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/bubbles.mp3',
    options: JSON.stringify(['Clownfish', 'Goldfish', 'Angelfish', 'Guppy']),
    correctAnswer: 'Clownfish'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Can you identify this animal sound?',
    promptOrder: 6,
    imageURL: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/duck.mp3',
    options: JSON.stringify(['Duck', 'Goose', 'Chicken', 'Turkey']),
    correctAnswer: 'Duck'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'What animal makes this sound?',
    promptOrder: 7,
    imageURL: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/owl.mp3',
    options: JSON.stringify(['Owl', 'Eagle', 'Hawk', 'Falcon']),
    correctAnswer: 'Owl'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Listen carefully! Which animal is this?',
    promptOrder: 8,
    imageURL: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.myinstants.com/media/sounds/monkey.mp3',
    options: JSON.stringify(['Monkey', 'Gorilla', 'Chimpanzee', 'Orangutan']),
    correctAnswer: 'Monkey'
  }
];

async function seedGamePrompts() {
  try {
    console.log('Starting to seed game prompts...');
    
    // First, check if we already have prompts
    const existingPrompts = await client.models.GamePrompt.list();
    if (existingPrompts.data && existingPrompts.data.length > 0) {
      console.log('Updating existing prompts...');
      // Delete existing prompts
      for (const prompt of existingPrompts.data) {
        await client.models.GamePrompt.delete({ id: prompt.id });
      }
    }

    // Create prompts
    for (const prompt of gamePrompts) {
      await client.models.GamePrompt.create(prompt);
      console.log(`Created prompt: ${prompt.promptText}`);
    }

    console.log('Successfully seeded game prompts!');
  } catch (error) {
    console.error('Error seeding game prompts:', error);
  }
}

// Run the seed function
seedGamePrompts(); 
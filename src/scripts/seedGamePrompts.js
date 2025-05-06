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
    imageURL: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/lion-1.mp3',
    options: JSON.stringify(['Lion', 'Tiger', 'Bear', 'Elephant']),
    correctAnswer: 'Lion'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Listen carefully! Which animal is this?',
    promptOrder: 2,
    imageURL: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/dog-1.mp3',
    options: JSON.stringify(['Dog', 'Wolf', 'Fox', 'Coyote']),
    correctAnswer: 'Dog'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Can you guess this animal?',
    promptOrder: 3,
    imageURL: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/cat-1.mp3',
    options: JSON.stringify(['Cat', 'Lion', 'Tiger', 'Leopard']),
    correctAnswer: 'Cat'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Which animal makes this sound?',
    promptOrder: 4,
    imageURL: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/elephant-1.mp3',
    options: JSON.stringify(['Elephant', 'Hippo', 'Rhino', 'Giraffe']),
    correctAnswer: 'Elephant'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Listen! What animal is this?',
    promptOrder: 5,
    imageURL: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/nature/sounds/water-1.mp3',
    options: JSON.stringify(['Clownfish', 'Goldfish', 'Angelfish', 'Guppy']),
    correctAnswer: 'Clownfish'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Can you identify this animal sound?',
    promptOrder: 6,
    imageURL: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/dog-2.mp3',
    options: JSON.stringify(['Dog', 'Wolf', 'Fox', 'Coyote']),
    correctAnswer: 'Dog'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'What animal makes this sound?',
    promptOrder: 7,
    imageURL: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/owl-1.mp3',
    options: JSON.stringify(['Owl', 'Eagle', 'Hawk', 'Falcon']),
    correctAnswer: 'Owl'
  },
  {
    gameType: 'Animal Sounds Quiz',
    promptText: 'Listen carefully! Which animal is this?',
    promptOrder: 8,
    imageURL: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=60',
    soundURL: 'https://www.soundjay.com/animal/sounds/monkey-1.mp3',
    options: JSON.stringify(['Monkey', 'Gorilla', 'Chimpanzee', 'Orangutan']),
    correctAnswer: 'Monkey'
  }
];

function validateGamePrompt(prompt) {
  const errors = [];
  
  // Check required fields
  if (!prompt.gameType) errors.push('gameType is required');
  if (!prompt.promptText) errors.push('promptText is required');
  if (!prompt.promptOrder) errors.push('promptOrder is required');
  if (!prompt.imageURL) errors.push('imageURL is required');
  if (!prompt.soundURL) errors.push('soundURL is required');
  if (!prompt.options) errors.push('options is required');
  if (!prompt.correctAnswer) errors.push('correctAnswer is required');

  // Validate URLs
  const urlRegex = /^https:\/\/.+/;
  if (!urlRegex.test(prompt.imageURL)) errors.push('imageURL must be a valid HTTPS URL');
  if (!urlRegex.test(prompt.soundURL)) errors.push('soundURL must be a valid HTTPS URL');

  // Validate options
  try {
    const parsedOptions = typeof prompt.options === 'string' ? JSON.parse(prompt.options) : prompt.options;
    if (!Array.isArray(parsedOptions)) errors.push('options must be an array');
    if (!parsedOptions.includes(prompt.correctAnswer)) errors.push('correctAnswer must be one of the options');
  } catch (e) {
    errors.push('options must be valid JSON');
  }

  return errors;
}

async function seedGamePrompts() {
  try {
    console.log('Starting to seed game prompts...');
    
    // Validate all prompts first
    const validationErrors = gamePrompts.map((prompt, index) => {
      const errors = validateGamePrompt(prompt);
      if (errors.length > 0) {
        return `Prompt ${index + 1} (${prompt.promptText}) has errors:\n${errors.join('\n')}`;
      }
      return null;
    }).filter(Boolean);

    if (validationErrors.length > 0) {
      console.error('Validation failed:\n', validationErrors.join('\n\n'));
      return;
    }

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
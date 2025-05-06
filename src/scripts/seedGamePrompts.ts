import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'apiKey'
});

// Animal Sounds Quiz feature has been removed
const gamePrompts: any[] = [];

async function seedGamePrompts() {
  try {
    console.log('Starting to seed game prompts...');
    
    // First, check if we already have prompts
    const existingPrompts = await client.models.GamePrompt.list();
    if (existingPrompts.data && existingPrompts.data.length > 0) {
      console.log('Game prompts already exist. Skipping seed...');
      return;
    }

    // Create prompts
    for (const prompt of gamePrompts) {
      await client.models.GamePrompt.create({
        gameType: prompt.gameType,
        promptText: prompt.promptText,
        promptOrder: prompt.promptOrder,
        imageURL: prompt.imageURL,
        soundURL: prompt.soundURL,
        options: JSON.stringify(prompt.options),
        correctAnswer: prompt.correctAnswer
      });
      console.log(`Created prompt: ${prompt.promptText}`);
    }

    console.log('Successfully seeded game prompts!');
  } catch (error) {
    console.error('Error seeding game prompts:', error);
  }
}

// Run the seed function
seedGamePrompts(); 
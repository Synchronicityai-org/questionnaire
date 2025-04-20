const PLACEHOLDER_IMAGE = '/resources/sensory-activities/images/placeholder.svg';

export interface ActivityGuide {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  duration: string;
  setting: string;
  materials: string[];
  steps: string[];
  tips: string[];
  downloadUrl: string;
  imageUrl?: string;
}

export interface SensoryResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'cards' | 'article';
  imageUrl: string;
  downloadUrl?: string;
  content?: string;
}

// Sample data - In a real app, this would come from a backend API
export const sensoryResources: SensoryResource[] = [
  {
    id: 'quick-start-guide',
    title: 'Sensory Activities Quick Start Guide',
    description: 'A comprehensive guide to get started with sensory activities, including checklists, schedules, and expert tips.',
    type: 'guide',
    imageUrl: PLACEHOLDER_IMAGE,
    downloadUrl: '/resources/sensory-activities/downloads/quick-start-guide.html'
  },
  {
    id: 'sensory-cards',
    title: 'Printable Sensory Activity Cards',
    description: '30 ready-to-print activity cards with visual guides, step-by-step instructions, and progress tracking sheets.',
    type: 'cards',
    imageUrl: PLACEHOLDER_IMAGE,
    downloadUrl: '/resources/sensory-activities/downloads/sensory-cards.pdf'
  }
];

export const activityGuides: ActivityGuide[] = [
  {
    id: 'texture-box',
    title: 'Texture Discovery Box',
    description: 'A guided exploration of different textures with clear progression steps, perfect for developing tactile awareness.',
    ageRange: '2-7 years',
    duration: '15 mins',
    setting: 'Indoor',
    materials: [
      'Large shallow box or tray',
      'Various textured materials (soft fabric, rough sandpaper, smooth plastic)',
      'Small toys or objects for hiding',
      'Optional: blindfold for older children',
      'Container for storing materials',
      'Cleaning supplies for easy cleanup'
    ],
    steps: [
      'Set up a comfortable space with good lighting',
      'Introduce one texture at a time, starting with preferred textures',
      'Demonstrate gentle touching and exploration techniques',
      'Play "find the hidden toy" games within the textures',
      'Practice naming and describing the textures',
      'Gradually introduce new and more challenging textures',
      'End the session with a familiar, comfortable texture'
    ],
    tips: [
      'Watch for signs of sensory overload or discomfort',
      'Make it playful and never force interaction',
      'Use descriptive language to build vocabulary',
      'Keep sessions short and positive',
      'Clean and organize materials after each use'
    ],
    downloadUrl: '/resources/sensory-activities/downloads/texture-box-guide.pdf',
    imageUrl: PLACEHOLDER_IMAGE
  },
  {
    id: 'sensory-garden',
    title: 'Sensory Garden',
    description: 'Create an engaging outdoor sensory experience with natural materials and planned activity zones.',
    ageRange: 'All ages',
    duration: 'Ongoing',
    setting: 'Outdoor',
    materials: [
      'Various plants with different textures (soft lamb\'s ear, rough lavender)',
      'Wind chimes or bells at different heights',
      'Water feature or sand/water table',
      'Natural materials (smooth stones, bark chips, sand)',
      'Safe, defined walking paths',
      'Comfortable seating areas',
      'Weather-appropriate equipment'
    ],
    steps: [
      'Select a safe, accessible outdoor space',
      'Plan different sensory zones (touch, sound, smell)',
      'Install weather-resistant elements first',
      'Plant hardy, safe plants in designated areas',
      'Create clear pathways between zones',
      'Add interactive elements at child height',
      'Include quiet spaces for calming',
      'Set up a maintenance schedule'
    ],
    tips: [
      'Research all plants to ensure they\'re non-toxic',
      'Create clear boundaries for safety',
      'Include shaded rest areas',
      'Plan for different weather conditions',
      'Make it accessible for all mobility levels',
      'Regular maintenance keeps it safe and inviting'
    ],
    downloadUrl: '/resources/sensory-activities/downloads/sensory-garden-guide.pdf',
    imageUrl: PLACEHOLDER_IMAGE
  }
];

export const downloadResource = async (resourceId: string) => {
  // In a real app, this would make an API call to get the file
  const resource = [...sensoryResources, ...activityGuides].find(r => r.id === resourceId);
  
  if (!resource || !resource.downloadUrl) {
    throw new Error('Resource not found');
  }

  try {
    // For now, we'll just simulate a download by opening the HTML file in a new tab
    if (resource.downloadUrl.endsWith('.html')) {
      window.open(resource.downloadUrl, '_blank');
    } else {
      // For other resources, show an alert
      alert(`Downloading ${resource.title}...\nIn a production environment, this would download ${resource.downloadUrl}`);
    }
    
    // In a real implementation, you would:
    // 1. Make an API call to get the file
    // 2. Use file-saver to download it:
    // const response = await fetch(resource.downloadUrl);
    // const blob = await response.blob();
    // saveAs(blob, `${resource.title}.pdf`);
  } catch (error) {
    console.error('Error downloading resource:', error);
    throw error;
  }
}; 
import natural from 'natural';

const TfIdf = natural.TfIdf;

interface TagScore {
  tag: string;
  score: number;
}

export const generateTags = (content: string, maxTags: number = 5): string[] => {
  // Initialize TF-IDF
  const tfidf = new TfIdf();
  
  // Add the content to TF-IDF
  tfidf.addDocument(content);
  
  // Get all terms from the document
  const terms = new Set<string>();
  tfidf.listTerms(0).forEach(item => {
    terms.add(item.term);
  });
  
  // Score each term
  const tagScores: TagScore[] = [];
  terms.forEach(term => {
    // Skip very short terms
    if (term.length < 3) return;
    
    // Get TF-IDF score for the term
    const score = tfidf.tfidf(term, 0);
    
    // Add to scores if it's a meaningful term
    if (score > 0.1) { // Threshold to filter out less important terms
      tagScores.push({ tag: term, score });
    }
  });
  
  // Sort by score and get top tags
  return tagScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTags)
    .map(item => item.tag);
};

// Function to clean and normalize text
export const cleanText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
};

// Function to combine user-selected tags with auto-generated tags
export const combineTags = (
  userTags: string[],
  content: string,
  maxAutoTags: number = 3
): string[] => {
  const autoTags = generateTags(content, maxAutoTags);
  const allTags = [...new Set([...userTags, ...autoTags])]; // Remove duplicates
  return allTags;
}; 
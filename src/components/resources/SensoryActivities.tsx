import React, { useState } from 'react';
import { ArrowDownTrayIcon, PrinterIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { downloadResource, sensoryResources, activityGuides } from '../../utils/resourceUtils';
import './Resources.css';

const SensoryActivities: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (resourceId: string) => {
    setIsDownloading(true);
    try {
      await downloadResource(resourceId);
    } catch (error) {
      console.error('Failed to download resource:', error);
      alert('Failed to download resource. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredGuides = activityGuides.filter(guide => {
    if (selectedAge !== 'all' && !guide.ageRange.includes(selectedAge)) {
      return false;
    }
    if (selectedEnvironment !== 'all' && !guide.setting.toLowerCase().includes(selectedEnvironment.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="resource-page">
      <div className="hero-section">
        <h1>Sensory Activities Hub</h1>
        <p className="hero-subtitle">Expert-curated activities, printable guides, and practical tools for your child's sensory development</p>
        <div className="cta-buttons">
          <button 
            className="primary-button flex items-center gap-2"
            onClick={() => handleDownload('quick-start-guide')}
            disabled={isDownloading}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {isDownloading ? 'Downloading...' : 'Download Quick Start Guide'}
          </button>
          <button 
            className="secondary-button flex items-center gap-2"
            onClick={() => handleDownload('sensory-cards')}
            disabled={isDownloading}
          >
            <PrinterIcon className="h-5 w-5" />
            Print Activity Cards
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Age Group:</label>
          <select 
            value={selectedAge} 
            onChange={(e) => setSelectedAge(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ages</option>
            <option value="2-4">2-4 years</option>
            <option value="5-7">5-7 years</option>
            <option value="8-12">8-12 years</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Environment:</label>
          <select 
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Settings</option>
            <option value="home">Home</option>
            <option value="school">School</option>
            <option value="outdoors">Outdoors</option>
          </select>
        </div>
      </div>

      <div className="featured-resources">
        <h2>Featured Resources</h2>
        <div className="featured-grid">
          {sensoryResources.map(resource => (
            <div key={resource.id} className="featured-card">
              <img src={resource.imageUrl} alt={resource.title} className="featured-image" />
              <div className="featured-content">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <button 
                  className="text-button flex items-center gap-2"
                  onClick={() => handleDownload(resource.id)}
                  disabled={isDownloading}
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download Guide'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="activity-collections">
        <h2>Activity Collections</h2>
        <div className="collection-grid">
          {filteredGuides.map(guide => (
            <div key={guide.id} className="activity-item">
              <h4>{guide.title}</h4>
              <p>{guide.description}</p>
              <div className="tags">
                <span className="tag">{guide.ageRange}</span>
                <span className="tag">{guide.duration}</span>
                <span className="tag">{guide.setting}</span>
              </div>
              <div className="materials-section">
                <h5>Materials Needed:</h5>
                <ul className="list-disc pl-5 mb-4">
                  {guide.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>
              <div className="steps-section">
                <h5>Steps:</h5>
                <ol className="list-decimal pl-5 mb-4">
                  {guide.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="tips-section bg-blue-50 p-4 rounded-lg mb-4">
                <h5>Tips:</h5>
                <ul className="list-disc pl-5">
                  {guide.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
              <button 
                className="outline-button"
                onClick={() => handleDownload(guide.id)}
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download Full Guide'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="expert-tips">
        <h2>Expert Tips & Articles</h2>
        <div className="articles-grid">
          <article className="article-card">
            <img src="/resources/sensory-activities/images/sensory-signs.jpg" alt="Understanding Sensory Signs" className="article-image" />
            <div className="article-content">
              <h3>Understanding Your Child's Sensory Signs</h3>
              <p>Learn to recognize and respond to sensory seeking and avoiding behaviors.</p>
              <button 
                className="text-button flex items-center gap-2"
                onClick={() => handleDownload('sensory-signs-article')}
                disabled={isDownloading}
              >
                <BookmarkIcon className="h-4 w-4" />
                Read Article
              </button>
            </div>
          </article>
          <article className="article-card">
            <img src="/resources/sensory-activities/images/sensory-diet.jpg" alt="Sensory Diet" className="article-image" />
            <div className="article-content">
              <h3>Creating an Effective Sensory Diet</h3>
              <p>A practical guide to building a personalized sensory activity schedule.</p>
              <button 
                className="text-button flex items-center gap-2"
                onClick={() => handleDownload('sensory-diet-article')}
                disabled={isDownloading}
              >
                <BookmarkIcon className="h-4 w-4" />
                Read Article
              </button>
            </div>
          </article>
        </div>
      </div>

      <div className="community-section">
        <h2>Parent Community</h2>
        <p>Join our community to share experiences and get personalized activity recommendations.</p>
        <button className="primary-button">Join Community</button>
      </div>
    </div>
  );
};

export default SensoryActivities; 
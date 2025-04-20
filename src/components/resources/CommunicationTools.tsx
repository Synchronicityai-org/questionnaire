import React from 'react';
import './Resources.css';

export const CommunicationTools: React.FC = () => {
  return (
    <div className="resource-page">
      <header className="resource-header">
        <h1>Communication Tools & Strategies</h1>
        <p className="subtitle">Empowering effective communication through proven tools and approaches</p>
      </header>

      <section className="content-section">
        <h2>Understanding Communication Support</h2>
        <div className="info-card">
          <p>Communication support tools are essential for developing and enhancing communication skills. These tools can help individuals express their needs, thoughts, and feelings more effectively.</p>
          <ul>
            <li>Supports both verbal and non-verbal communication</li>
            <li>Adapts to individual needs and preferences</li>
            <li>Promotes independence and self-expression</li>
            <li>Enhances social interaction and engagement</li>
          </ul>
        </div>
      </section>

      <section className="content-section">
        <h2>Communication Tools</h2>
        <div className="content-grid">
          <div className="resource-card">
            <div className="card-icon">📱</div>
            <h3>Picture Exchange Communication (PECS)</h3>
            <p>A structured system using pictures to facilitate communication.</p>
            <div className="tips-section">
              <h4>Implementation Tips:</h4>
              <ul>
                <li>Start with highly motivating items</li>
                <li>Use clear, consistent pictures</li>
                <li>Follow the six-phase protocol</li>
                <li>Maintain a positive learning environment</li>
              </ul>
            </div>
          </div>

          <div className="resource-card">
            <div className="card-icon">💻</div>
            <h3>AAC Apps and Devices</h3>
            <p>Digital tools that assist in communication through symbols, text, and speech output.</p>
            <div className="tips-section">
              <h4>Key Features:</h4>
              <ul>
                <li>Customizable vocabulary</li>
                <li>Text-to-speech capabilities</li>
                <li>Symbol-based communication</li>
                <li>Progress tracking</li>
              </ul>
            </div>
          </div>

          <div className="resource-card">
            <div className="card-icon">🖼️</div>
            <h3>Visual Supports</h3>
            <p>Visual aids that help structure daily activities and communication.</p>
            <div className="tips-section">
              <h4>Common Uses:</h4>
              <ul>
                <li>Daily schedules</li>
                <li>Choice boards</li>
                <li>Social stories</li>
                <li>Behavior expectations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>Implementation Process</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Assessment</h4>
            <p>Evaluate communication needs and preferences</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Tool Selection</h4>
            <p>Choose appropriate tools based on assessment</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Training</h4>
            <p>Learn how to use selected tools effectively</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Integration</h4>
            <p>Incorporate tools into daily routines</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>Success Strategies</h2>
        <div className="best-practices-grid">
          <div className="practice-card">
            <h4>Consistency</h4>
            <p>Use tools consistently across different environments and with all communication partners.</p>
          </div>
          <div className="practice-card">
            <h4>Positive Reinforcement</h4>
            <p>Encourage and celebrate successful communication attempts using the tools.</p>
          </div>
          <div className="practice-card">
            <h4>Regular Review</h4>
            <p>Monitor progress and adjust tools and strategies as needed.</p>
          </div>
          <div className="practice-card">
            <h4>Team Approach</h4>
            <p>Involve all caregivers and professionals in the implementation process.</p>
          </div>
        </div>
      </section>
    </div>
  );
}; 
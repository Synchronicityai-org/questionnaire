import React from 'react';
import { SunIcon, MoonIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const VisualSchedules: React.FC = () => {
  return (
    <div className="resource-page">
      <div className="resource-header">
        <h1>Visual Schedules</h1>
        <p className="subtitle">Help your child understand and follow daily routines with visual supports</p>
      </div>

      <div className="content-section">
        <h2>Why Visual Schedules?</h2>
        <div className="info-card">
          <p>Visual schedules can help children with autism by:</p>
          <ul>
            <li>Reducing anxiety about what comes next</li>
            <li>Building independence in daily routines</li>
            <li>Making transitions between activities easier</li>
            <li>Providing a sense of accomplishment</li>
            <li>Supporting executive functioning skills</li>
          </ul>
        </div>
      </div>

      <div className="content-grid">
        <div className="resource-card">
          <div className="card-icon">
            <SunIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3>Morning Routine</h3>
          <ul className="routine-list">
            <li>Wake up</li>
            <li>Use bathroom</li>
            <li>Brush teeth</li>
            <li>Get dressed</li>
            <li>Eat breakfast</li>
            <li>Pack backpack</li>
          </ul>
          <div className="tips-section">
            <h4>Tips:</h4>
            <ul>
              <li>Use pictures for each step</li>
              <li>Keep the routine consistent</li>
              <li>Celebrate completing each step</li>
            </ul>
          </div>
        </div>

        <div className="resource-card">
          <div className="card-icon">
            <AcademicCapIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3>School Day Schedule</h3>
          <ul className="routine-list">
            <li>Arrival/Unpack</li>
            <li>Morning circle</li>
            <li>Learning time</li>
            <li>Snack break</li>
            <li>Outside play</li>
            <li>Lunch time</li>
            <li>Quiet time</li>
            <li>Activities</li>
            <li>Pack up</li>
          </ul>
          <div className="tips-section">
            <h4>Tips:</h4>
            <ul>
              <li>Review schedule at start of day</li>
              <li>Use a "now" and "next" system</li>
              <li>Include transition warnings</li>
            </ul>
          </div>
        </div>

        <div className="resource-card">
          <div className="card-icon">
            <MoonIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3>Evening Routine</h3>
          <ul className="routine-list">
            <li>Dinner time</li>
            <li>Clean up</li>
            <li>Bath time</li>
            <li>Put on pajamas</li>
            <li>Brush teeth</li>
            <li>Bedtime story</li>
            <li>Sleep time</li>
          </ul>
          <div className="tips-section">
            <h4>Tips:</h4>
            <ul>
              <li>Start routine at same time</li>
              <li>Use calming activities</li>
              <li>Dim lights gradually</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>Creating Your Own Visual Schedule</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Choose Activities</h4>
            <p>List out the regular activities in your child's day</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Select Images</h4>
            <p>Use clear, consistent pictures for each activity</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Organize Schedule</h4>
            <p>Arrange activities in chronological order</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Review Together</h4>
            <p>Go through the schedule with your child daily</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>Best Practices</h2>
        <div className="best-practices-grid">
          <div className="practice-card">
            <h4>Consistency is Key</h4>
            <p>Use the same images and routines consistently to build familiarity</p>
          </div>
          <div className="practice-card">
            <h4>Keep it Simple</h4>
            <p>Start with 3-4 steps and gradually add more as your child masters the routine</p>
          </div>
          <div className="practice-card">
            <h4>Make it Interactive</h4>
            <p>Let your child move or check off completed activities</p>
          </div>
          <div className="practice-card">
            <h4>Be Flexible</h4>
            <p>Have backup plans for schedule changes and teach flexibility gradually</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSchedules; 
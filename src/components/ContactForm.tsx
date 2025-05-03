import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const ContactForm = () => {
  useEffect(() => {
    console.log('ContactForm component mounted');
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    kidConcerns: '',
    feedback: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.models.ContactForm.create({
        ...formData,
        createdAt: new Date().toISOString()
      });
      alert('Thank you for your submission!');
      setFormData({
        name: '',
        email: '',
        kidConcerns: '',
        feedback: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full max-w-xl mx-auto p-2 sm:p-4 md:p-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">Join the Movement</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        <img 
          src="/resources/images/tinywins-hero-1.png" 
          alt="TinyWins Movement" 
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }} 
        />
        <img 
          src="/resources/images/tinywins-aha.png" 
          alt="Aha Moment" 
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }} 
        />
        <img 
          src="/resources/images/tinywins-flip.png" 
          alt="Flipping the Script" 
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }} 
        />
        <img 
          src="/resources/images/tinywins-synchronicity.png" 
          alt="Synchronicity" 
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }} 
        />
      </div>
      <img 
        src="/resources/images/tinywins-hero.png" 
        alt="TinyWins Hero" 
        style={{
          width: '100%',
          maxWidth: '700px',
          display: 'block',
          margin: '0 auto 1.5rem auto',
          borderRadius: '20px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
        }}
      />
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label htmlFor="name" className="w-full sm:w-1/5 text-base font-medium">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full sm:w-4/5 p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label htmlFor="email" className="w-full sm:w-1/5 text-base font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full sm:w-4/5 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
          <label htmlFor="kidConcerns" className="w-full sm:w-1/5 text-base font-medium">Kid Concerns</label>
          <textarea
            id="kidConcerns"
            name="kidConcerns"
            value={formData.kidConcerns}
            onChange={handleChange}
            rows={4}
            className="w-full sm:w-4/5 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
          <label htmlFor="feedback" className="w-full sm:w-1/5 text-base font-medium">Feedback</label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            rows={4}
            className="w-full sm:w-4/5 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-bold"
          >
            Join the Movement
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm; 
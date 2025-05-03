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
    <div className="w-2/3 mx-auto p-4 sm:p-6 md:p-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Join the Movement</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm; 
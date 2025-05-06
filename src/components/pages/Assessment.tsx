import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function Assessment() {
  const navigate = useNavigate();
  const { kidProfileId } = useParams();

  useEffect(() => {
    // Redirect to parent concerns form if we have a kidProfileId
    if (kidProfileId) {
      navigate(`/parent-concerns/${kidProfileId}`);
    } else {
      // If no kidProfileId, redirect to home
      navigate('/');
    }
  }, [kidProfileId, navigate]);

  // Return null since this is just a redirect component
  return null;
} 
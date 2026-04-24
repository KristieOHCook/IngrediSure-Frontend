/**
 * IngrediSure Custom Hook — useAuth
 * Centralized authentication check logic
 * Used across all protected components
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

export default function useAuth() {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.token) { navigate('/'); return; }
    } catch {
      navigate('/');
    }
  }, [navigate]);

  return { user };
}
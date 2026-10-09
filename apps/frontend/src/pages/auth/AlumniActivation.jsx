import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../shared/components/Button.jsx';

export default function AlumniActivation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      return showToast('Password must be at least 6 characters', 'error');
    }
    if (formData.password !== formData.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/activate/${token}`, {
        password: formData.password
      });
      showToast('Account activated successfully!', 'success');
      
      // Save tokens
      localStorage.setItem('token', res.data.data.tokens.accessToken);

      // Redirect to Alumni Dashboard
      navigate('/alumni');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to activate account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card text-foreground p-10 rounded-xl shadow-lg border border-border ">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Activate Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-muted ">
            Create a secure password to activate your Alumni account.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted ">New Password</label>
              <input name="password" required type="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-card text-foreground border border-border  rounded-md shadow-sm sm:text-sm text-foreground" />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted ">Confirm Password</label>
              <input name="confirmPassword" required type="password" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-card text-foreground border border-border  rounded-md shadow-sm sm:text-sm text-foreground" />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={submitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              {submitting ? 'Activating...' : 'ACTIVATE ACCOUNT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

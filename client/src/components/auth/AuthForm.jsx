
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, register } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../common/ErrorMessage';

const AuthForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { username, email, password } = formData;
      if (isRegister) {
        await register({ username, email, password });
        navigate('/login');
      } else {
        const response = await login({ email, password });
        localStorage.setItem('token', response.access_token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred.');
    }
  };

  return (
    <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md'>
      <h2 className='text-2xl font-bold text-center text-gray-900'>
        {isRegister ? 'Create an Account' : 'Sign in to your Account'}
      </h2>
      <form className='space-y-6' onSubmit={handleSubmit}>
        {isRegister && (
          <Input
            label='Username'
            id='username'
            name='username'
            type='text'
            autoComplete='username'
            required
            value={formData.username}
            onChange={handleChange}
          />
        )}
        <Input
          label='Email address'
          id='email'
          name='email'
          type='email'
          autoComplete='email'
          required
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          label='Password'
          id='password'
          name='password'
          type='password'
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
          value={formData.password}
          onChange={handleChange}
        />
        {error && <ErrorMessage message={error} />}
        <Button type='submit' className='w-full'>
          {isRegister ? 'Register' : 'Sign In'}
        </Button>
      </form>
      <p className='text-sm text-center text-gray-600'>
        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
        <a href={isRegister ? '/login' : '/register'} className='font-medium text-primary hover:underline'>
          {isRegister ? 'Sign In' : 'Register'}
        </a>
      </p>
    </div>
  );
};

export default AuthForm;

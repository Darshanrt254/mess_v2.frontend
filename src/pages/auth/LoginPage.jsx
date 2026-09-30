import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Utensils, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';

// Zod validation schema for login input
const loginSchema = z.object({
  identifier: z.string().min(1, 'Phone number or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setAuthError('');

    // Zod validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const { role } = await login({
        loginIdentifier: formData.identifier.trim(),
        password: formData.password,
      });

      // Redirect according to authoritative backend role
      const from = location.state?.from?.pathname;
      if (
        from &&
        ((role === 'OWNER' && from.startsWith('/owner')) ||
          (role === 'CUSTOMER' && from.startsWith('/customer')))
      ) {
        navigate(from, { replace: true });
      } else if (role === 'OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow flex flex-col justify-center items-center p-4 selection:bg-brand-orange selection:text-white font-nunito">
      {/* Decorative Brand Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-brand bg-brand-darkGreen border-3 border-brand-orange text-brand-yellow shadow-brand mb-3">
          <Utensils className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-darkGreen tracking-tight text-shadow-sm">
          SWAYAMSIDDHA
        </h1>
        <p className="text-xs sm:text-sm font-extrabold text-brand-green uppercase tracking-widest mt-1">
          Tiffin & Mess Management
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-brand-card rounded-brand border-3 border-brand-orange shadow-brand-lg p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-black text-brand-darkGreen">
            Welcome Back
          </h2>
          <p className="text-xs font-bold text-brand-green mt-1">
            Sign in to access your daily meals, attendance & dashboard
          </p>
        </div>

        {authError && (
          <Alert variant="danger" className="mb-4">
            {authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number or Username"
            type="text"
            placeholder="e.g. 9876543210 or owner@swayamsiddha.local"
            value={formData.identifier}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, identifier: e.target.value }))
            }
            error={errors.identifier}
            leftIcon={<User className="w-4 h-4" />}
            required
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-xs font-bold text-brand-darkGreen/70">
        © Swayamsiddha Mess & Tiffin Services
      </footer>
    </div>
  );
}

export default LoginPage;

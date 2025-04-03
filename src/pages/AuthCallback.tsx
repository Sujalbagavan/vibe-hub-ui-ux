
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data?.session) {
          toast.success('Successfully signed in');
          navigate('/events');
        } else {
          toast.error('No session found');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;

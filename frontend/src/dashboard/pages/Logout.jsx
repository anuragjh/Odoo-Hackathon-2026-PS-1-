import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertCircle } from 'lucide-react';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session details or simply redirect back to landing page
    navigate('/');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-slide-in-up">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <LogOut className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-foreground">Confirm Console Logout</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to terminate your current administrative session? Unsaved progress logs will be discarded.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-4 py-2 border rounded-lg text-xs hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-md"
          >
            Logout Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;

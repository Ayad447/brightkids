import React, { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    let errorMessage = "Something went wrong. Please try again.";
    
    try {
      const firestoreError = JSON.parse(error?.message || '');
      if (firestoreError.error && firestoreError.error.includes('Missing or insufficient permissions')) {
        errorMessage = "You don't have permission to do that! Please check if you're signed in as a parent.";
      }
    } catch (e) {
      // Not a JSON error
    }

    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white rounded-3xl shadow-xl border-4 border-red-100">
        <div className="text-6xl">Oops! 😵‍💫</div>
        <h2 className="text-2xl font-black text-[#2F3061]">{errorMessage}</h2>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#FF6B6B] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// components/ErrorBoundary.jsx
'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center h-screen gap-5'>
          <h1 className='text-xl font-bold text-red-500'>Something went wrong</h1>
          <button className=' bg-filgreen px-5 py-3 text-white  text-2xl rounded-md hover:bg-filgreen/80 font-oswald' onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
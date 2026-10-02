'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-qc-bg flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-red-400">Something went wrong</h2>
            <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-qc-primary rounded-lg hover:bg-opacity-90 transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

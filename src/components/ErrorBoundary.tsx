import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Badge } from './ui/badge';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
          <div className="bg-slate-900 border border-red-500/30 p-8 rounded-xl max-w-2xl w-full space-y-4">
            <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <span className="text-3xl">⚠️</span> Application Error
            </h1>
            <p className="text-slate-300 border-b border-white/10 pb-4">
              Nou regrèt sa, yon erè fèt nan paj la (Crush). Men detay teknik la:
            </p>
            <div className="bg-black/50 p-4 rounded-lg overflow-x-auto">
              <code className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                {this.state.error?.toString()}
              </code>
            </div>
            
            {this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-sm text-slate-400 cursor-pointer hover:text-white">Wè Stack Trace la</summary>
                <div className="mt-2 bg-black/50 p-4 rounded-lg overflow-auto max-h-60">
                   <code className="text-slate-500 text-xs font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                   </code>
                </div>
              </details>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-slate-800 hover:bg-slate-700 w-full py-3 rounded-lg text-white font-medium border border-white/10 transition-colors"
            >
              Rafrechi Paj la (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

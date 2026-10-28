import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LocalConnect UI ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('localconnect_static_db');
    localStorage.removeItem('localconnect_token');
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 text-[#172B4D]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#16324F]">Something went wrong</h1>
              <p className="text-sm text-[#64748B] mt-2">
                An unexpected display error occurred. You can reload the page or reset the demo cache.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-left text-slate-700 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#16324F] text-white font-medium hover:bg-[#16324F]/90 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Demo State
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

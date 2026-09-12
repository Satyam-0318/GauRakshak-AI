import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f4ea] text-slate-800 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center space-y-5">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-800">
              <AlertTriangle className="h-8 w-8 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#092615]">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                कुछ समस्या आई है। कृपया पुनः प्रयास करें।
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-slate-100 rounded-xl text-left font-mono text-[11px] text-rose-700 max-h-32 overflow-y-auto border border-slate-200">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#092615] text-[#faecc4] font-bold text-xs flex items-center space-x-2 hover:bg-[#164426] transition-all shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again / पुनः प्रयास</span>
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-xs"
              >
                <Home className="h-4 w-4" />
                <span>Home / होम</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

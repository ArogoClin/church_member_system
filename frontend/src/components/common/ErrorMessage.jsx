import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-danger-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4 text-center">{message || 'Failed to load data'}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="group flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
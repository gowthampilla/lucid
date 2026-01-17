'use client';

import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">LucidAI</h1>
          </div>
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Question Submitted
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your career question has been received. Our team will review it and you&apos;ll receive a structured, AI-powered response within 24 hours.
          </p>

          {/* Next Steps */}
          <div className="bg-gray-100 rounded-lg p-6 mb-8 max-w-md mx-auto">
            <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">1.</span>
                Our experts review your question
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">2.</span>
                We structure a comprehensive response
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">3.</span>
                AI polishes the answer for clarity
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">4.</span>
                You receive guidance via email
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Return to Home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Have another question?</p>
              <Link 
                href="/ask" 
                className="text-gray-900 font-medium hover:underline"
              >
                Ask another question →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 LucidAI. Professional career guidance.</p>
      </footer>
    </div>
  );
}
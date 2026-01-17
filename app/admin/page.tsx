'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  name: string;
  email: string;
  current_role_field: string;
  target_role: string;
  question: string;
  status: string;
  created_at: string;
  skills: string;
  years_experience: number | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  file_url: string | null;
}

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    fetchQuestions();
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin?password=' + encodeURIComponent(password));
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      } else {
        setMessage('Failed to fetch questions');
      }
    } catch (error) {
      setMessage('Error loading questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuestion || !response.trim()) return;

    try {
      const res = await fetch('/api/admin/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          response,
          password
        })
      });

      if (res.ok) {
        setMessage('Response sent successfully!');
        setResponse('');
        fetchQuestions();
        setSelectedQuestion(null);
      } else {
        setMessage('Failed to send response');
      }
    } catch (error) {
      setMessage('Error sending response');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">LucidAI Admin</h1>
              <p className="text-sm text-black">Career Guidance Portal</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-black"
                placeholder="Enter admin password"
                required
              />
              <p className="text-xs text-black mt-2">
                Use the password from your .env.local file
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800"
            >
              Enter Admin Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold text-black">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="text-sm text-black hover:text-gray-900"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-black' : 'bg-red-50 text-black'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b">
                <h2 className="font-bold text-black">
                  Questions ({questions.length})
                  {isLoading && <span className="text-sm font-normal text-black ml-2">Loading...</span>}
                </h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {questions.length === 0 ? (
                  <div className="p-4 text-black text-center">
                    No questions yet.
                  </div>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedQuestion?.id === q.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setResponse('');
                        setMessage('');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-black truncate">{q.name}</h3>
                          <p className="text-sm text-black truncate">
                            {q.current_role_field || 'No role'} → {q.target_role || 'No target'}
                          </p>
                          {/* Show FULL question in list - no truncation */}
                          <div className="mt-2">
                            <p className="text-sm text-black whitespace-pre-line max-h-[150px] overflow-y-auto pr-2">
                              {q.question}
                            </p>
                          </div>
                          {q.file_name && (
                            <div className="flex items-center mt-2">
                              <span className="text-xs bg-gray-200 text-black px-2 py-1 rounded">
                                📎 File
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          q.status === 'pending' 
                            ? 'bg-yellow-100 text-black' 
                            : 'bg-green-100 text-black'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <div className="text-xs text-black mt-2">
                        {new Date(q.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Question Details & Response */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">{selectedQuestion.name}</h2>
                      <div className="space-y-2 text-black">
                        <p><strong>Email:</strong> {selectedQuestion.email}</p>
                        <p><strong>Current Role:</strong> {selectedQuestion.current_role_field || 'Not specified'}</p>
                        <p><strong>Target Role:</strong> {selectedQuestion.target_role || 'Not specified'}</p>
                        <p><strong>Experience:</strong> {selectedQuestion.years_experience || 'Not specified'} years</p>
                        <p><strong>Skills:</strong> {selectedQuestion.skills || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedQuestion.status === 'pending' 
                          ? 'bg-yellow-100 text-black' 
                          : 'bg-green-100 text-black'
                      }`}>
                        {selectedQuestion.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Section */}
                {selectedQuestion.file_name && (
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-lg text-black mb-4">📎 Attached File</h3>
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {selectedQuestion.file_type?.startsWith('image/') ? (
                            <span className="text-2xl">🖼️</span>
                          ) : selectedQuestion.file_type?.includes('pdf') ? (
                            <span className="text-2xl">📄</span>
                          ) : (
                            <span className="text-2xl">📎</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-black">{selectedQuestion.file_name}</p>
                          <p className="text-sm text-black">
                            {selectedQuestion.file_type} • 
                            {((selectedQuestion.file_size || 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      
                      {selectedQuestion.file_url && (
                        <a
                          href={selectedQuestion.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-6 border-b">
                  <h3 className="font-bold text-lg text-black mb-4">Question</h3>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line max-h-[400px] overflow-y-auto text-black">
                    {selectedQuestion.question}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-black mb-4">Your Response</h3>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your response here. The user will receive this as guidance."
                    rows={8}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-black"
                  />
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedQuestion(null);
                        setResponse('');
                      }}
                      className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!response.trim()}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-black mb-2">Select a Question</h3>
                <p className="text-black">Choose a question from the list to view details and respond.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AskPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, file?: File, type?: 'error' | 'warning' | 'success' | 'info'}>>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkQuestion = (text: string): { isValid: boolean; message: string; type: 'error' | 'warning' | 'info' } => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    
    // Rule 1: Check for multiple questions
    const questionMarkCount = (text.match(/\?/g) || []).length;
    if (questionMarkCount > 1) {
      return {
        isValid: false,
        message: '❌ Multiple questions detected. Please ask only ONE career question.',
        type: 'error'
      };
    }
    
    // Check for career keywords
    const careerKeywords = [
      'career', 'job', 'promotion', 'salary', 'skills', 'learn', 'switch',
      'transition', 'interview', 'resume', 'CV', 'hire', 'hiring', 'position',
      'role', 'company', 'industry', 'field', 'advancement', 'growth',
      'developer', 'engineer', 'manager', 'director', 'lead', 'senior',
      'junior', 'entry', 'experience', 'certification', 'degree', 'education'
    ];
    
    const hasCareerKeyword = careerKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (!hasCareerKeyword && text.length > 20) {
      return {
        isValid: false,
        message: '⚠️ This doesn\'t seem career-related. Please ask about jobs, skills, or career growth.',
        type: 'warning'
      };
    }
    
    // Check minimum length
    if (text.length < 10) {
      return {
        isValid: false,
        message: 'Please provide more details for better guidance.',
        type: 'warning'
      };
    }
    
    return {
      isValid: true,
      message: '✅ Ready to submit. Your question will be reviewed by our team.',
      type: 'info'
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        addMessage('assistant', '❌ File too large. Maximum size is 10MB.', 'error');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        addMessage('assistant', '❌ File type not allowed. Use PDF, DOC, TXT, JPG, or PNG.', 'error');
        return;
      }
      
      setFile(selectedFile);
      addMessage('assistant', `📎 File attached: ${selectedFile.name}`, 'info');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string, type: 'error' | 'warning' | 'success' | 'info' = 'info', file?: File) => {
    setMessages(prev => [...prev, { role, content, type, file }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!input.trim() && !file) {
      addMessage('assistant', '❌ Please type a question or attach a file.', 'error');
      return;
    }
    
    if (input.trim()) {
      const check = checkQuestion(input);
      if (!check.isValid) {
        addMessage('assistant', check.message, check.type);
        return;
      }
    }
    
    // Add user message
    const userContent = input.trim() || (file ? `📎 File only: ${file.name}` : '');
    addMessage('user', userContent, 'info', file || undefined);
    
    // Clear input
    const currentInput = input;
    const currentFile = file;
    setInput('');
    setFile(null);
    setIsSubmitting(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('question', currentInput || 'File submission');
      formData.append('name', 'Anonymous');
      formData.append('email', 'user@example.com');
      formData.append('current_role_field', '');
      formData.append('target_role', '');
      formData.append('skills', '');
      formData.append('years_experience', 'null');
      
      if (currentFile) {
        formData.append('file', currentFile);
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'not_career_related') {
          addMessage('assistant', '❌ ' + (data.message || 'This doesn\'t seem to be a career-related question.'), 'error');
          
          addMessage('assistant', 
            `📝 **Examples of valid career questions:**\n\n` +
            `• "Should I switch from software engineering to product management?"\n` +
            `• "What skills do I need to become a data scientist?"\n` +
            `• "How can I negotiate a higher salary in my current role?"\n` +
            `• "Is an MBA worth it for career advancement in tech?"`, 
            'info'
          );
        } else {
          addMessage('assistant', `❌ Error: ${data.error || 'Failed to submit'}`, 'error');
        }
      } else {
        // Success
        addMessage('assistant', '✅ **Question Submitted Successfully!**\n\nOur career experts will review your question and provide detailed, personalized guidance within 24 hours.', 'success');
        
        // Redirect after delay
        setTimeout(() => {
          router.push('/confirmation');
        }, 4000);
      }
    } catch (error) {
      addMessage('assistant', '❌ Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 py-3 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">LucidAI</h1>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Home
          </Link>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-none'
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                    : msg.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-bl-none'
                    : msg.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200 rounded-bl-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold">AI</span>
                    </div>
                    <span className="text-xs text-gray-600">LucidAI</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {msg.file && (
                  <div className={`mt-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-white">
                          {msg.file.name.split('.').pop()?.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{msg.file.name}</p>
                        <p className="text-xs opacity-75">
                          {(msg.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isSubmitting && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-gray-100 text-gray-900 px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Processing your question...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border border-gray-300 rounded-2xl bg-white shadow-sm">
          {/* File Preview */}
          {file && (
            <div className="px-4 pt-3 border-b">
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-700">
                      {file.name.split('.').pop()?.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="p-2">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask ONE specific career question here..."
              rows={3}
              className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Bottom Bar */}
          <div className="px-3 py-2 border-t flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Attach supporting document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <span className="text-xs text-gray-500">
                {file ? 'Supporting document attached' : 'Attach resume/portfolio (optional)'}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!input.trim() && !file)}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Question</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ Submissions with multiple questions or non-career topics will be rejected.
          </p>
        </div>
      </div>
    </div>
  );
}
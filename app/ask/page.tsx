'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type ConversationPhase = 'welcome' | 'collect_name' | 'collect_email' | 'collect_career_info' | 'ask_question' | 'processing' | 'submitted';
type MessageType = 'error' | 'warning' | 'success' | 'info';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  file?: File;
  type?: MessageType;
}

interface UserInfo {
  name?: string;
  email?: string;
  currentRole?: string;
  targetRole?: string;
  experience?: string;
  skills?: string;
}

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hi! I\'m LucidAI Career Assistant. Before we start, what\'s your name?',
      type: 'info'
    }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [phase, setPhase] = useState<ConversationPhase>('collect_name');
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const processingStepRef = useRef(0);
  const [initialized, setInitialized] = useState(false);

  // Demo questions
  const demoQuestions = [
    "How to transition from marketing to product?",
    "Skills for data scientist role?",
    "How to negotiate salary?",
    "MBA for tech career?",
    "Software to product management?",
    "Certifications for PM?",
    "Senior developer interview?",
    "Teacher to tech?",
    "Build portfolio?",
    "Ask for promotion?"
  ];

  // Processing steps for AI animation
  const processingSteps = [
    "Analyzing your career question...",
    "Filtering through career success patterns...",
    "Finding best suggestions for your specific situation...",
    "Polishing personalized insights...",
    "Finalizing recommendations..."
  ];

  // Initialize session and load count from localStorage
  useEffect(() => {
    if (initialized) return;

    let sessionId = localStorage.getItem('lucidai_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('lucidai_session_id', sessionId);
    }
    setSessionId(sessionId);

    // Check if they've already submitted
    const hasSubmittedQuestion = localStorage.getItem(`lucidai_has_submitted_${sessionId}`);
    
    if (hasSubmittedQuestion === 'true') {
      // User has already submitted - show LIMIT EXCEEDED
      setHasSubmitted(true);
      setPhase('submitted');
      
      // Load user info if available
      const savedInfo = localStorage.getItem(`lucidai_userinfo_${sessionId}`);
      if (savedInfo) {
        const info = JSON.parse(savedInfo);
        setUserInfo(info);
        
        // Set messages for already submitted state
        setMessages([
          {
            role: 'assistant',
            content: `LIMIT EXCEEDED. You have already submitted your career question.`,
            type: 'error'
          },
          {
            role: 'assistant',
            content: `Our experts have received your question and will send personalized guidance to: ${info.email || 'your email'}`,
            type: 'info'
          },
          {
            role: 'assistant',
            content: `Thank you for using LucidAI Career Assistant. You cannot submit another question from this session.`,
            type: 'info'
          }
        ]);
      } else {
        // No user info but still submitted (edge case)
        setMessages([
          {
            role: 'assistant',
            content: 'LIMIT EXCEEDED. You have already submitted your career question.',
            type: 'error'
          }
        ]);
      }
    } else {
      // User hasn't submitted yet - check for saved user info
      const savedInfo = localStorage.getItem(`lucidai_userinfo_${sessionId}`);
      if (savedInfo) {
        setUserInfo(JSON.parse(savedInfo));
        setPhase('ask_question');
        setMessages([
          { 
            role: 'assistant', 
            content: 'Welcome back! What career question would you like to ask?',
            type: 'info'
          }
        ]);
      }
      // Otherwise continue with default messages (collect_name phase)
    }

    setInitialized(true);
  }, [initialized]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll demo questions
  useEffect(() => {
    if (phase !== 'ask_question' || hasSubmitted) return;
    
    const container = document.getElementById('demo-questions');
    if (!container) return;

    let position = 0;
    const speed = 0.3;
    const gap = 24;
    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      const items = container.children;
      if (items.length === 0) return;

      const itemWidth = items[0].clientWidth;
      const singleSetWidth = (itemWidth + gap) * demoQuestions.length;
      
      position -= speed * (deltaTime / 16);
      
      if (position <= -singleSetWidth) {
        position += singleSetWidth;
      }
      
      container.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, hasSubmitted]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
  };

  const addMessage = (role: 'user' | 'assistant', content: string, type: MessageType = 'info', file?: File) => {
    setMessages(prev => [...prev, { role, content, type, file }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase === 'submitted' || hasSubmitted) return;
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        addMessage('assistant', 'Maximum file size is 10MB.', 'error');
        return;
      }
      
      setFile(selectedFile);
      addMessage('assistant', `Attached file: ${selectedFile.name}`, 'info');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDemoQuestionClick = (question: string) => {
    if (phase !== 'ask_question' || hasSubmitted) return;
    setInput(question);
    setTimeout(() => document.querySelector('textarea')?.focus(), 50);
  };

  const processInput = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    addMessage('user', trimmedInput, 'info');
    
    switch (phase) {
      case 'collect_name':
        if (!isValidName(trimmedInput)) {
          addMessage('assistant', 'Please enter a valid name (letters and spaces only, at least 2 characters).', 'error');
          return;
        }
        const name = trimmedInput;
        setUserInfo(prev => ({ ...prev, name }));
        addMessage('assistant', `Nice to meet you, ${name}! What\'s your email address? We\'ll send career guidance there.`, 'info');
        setPhase('collect_email');
        break;

      case 'collect_email':
        if (!isValidEmail(trimmedInput)) {
          addMessage('assistant', 'Please enter a valid email address.', 'error');
          return;
        }
        const email = trimmedInput.toLowerCase();
        setUserInfo(prev => ({ ...prev, email }));
        addMessage('assistant', 
          `Great! Now, let\'s understand your career situation.\n\n` +
          `Current Role: What's your current job title or field?\n` +
          `(e.g., "Software Engineer", "Marketing Manager", "Student")`,
          'info'
        );
        setPhase('collect_career_info');
        break;

      case 'collect_career_info':
        if (!userInfo.currentRole) {
          setUserInfo(prev => ({ ...prev, currentRole: trimmedInput }));
          addMessage('assistant', 
            `Target Role: What role are you aiming for?\n` +
            `(e.g., "Product Manager", "Data Scientist", "Senior Developer")`,
            'info'
          );
        } else if (!userInfo.targetRole) {
          setUserInfo(prev => ({ ...prev, targetRole: trimmedInput }));
          addMessage('assistant', 
            `Experience: How many years of experience do you have?\n` +
            `(e.g., "2 years", "Entry-level", "10+ years")`,
            'info'
          );
        } else if (!userInfo.experience) {
          setUserInfo(prev => ({ ...prev, experience: trimmedInput }));
          addMessage('assistant', 
            `Profile complete!\n\n` +
            `Your Info:\n` +
            `• Name: ${userInfo.name}\n` +
            `• Email: ${userInfo.email}\n` +
            `• Current: ${userInfo.currentRole}\n` +
            `• Target: ${userInfo.targetRole}\n` +
            `• Experience: ${trimmedInput}\n\n` +
            `Now, what career question would you like to ask?`,
            'info'
          );
          
          // Save user info to localStorage
          const finalInfo = { ...userInfo, experience: trimmedInput };
          setUserInfo(finalInfo);
          localStorage.setItem(`lucidai_userinfo_${sessionId}`, JSON.stringify(finalInfo));
          
          setPhase('ask_question');
        }
        break;

      case 'ask_question':
        await showAiProcessingAnimation(trimmedInput);
        break;
    }
    
    setInput('');
  };

  const showAiProcessingAnimation = async (question: string) => {
    setPhase('processing');
    setIsSubmitting(true);
    processingStepRef.current = 0;
    
    // Add initial processing message
    addMessage('assistant', processingSteps[0], 'info');
    
    // Start updating the same message
    const interval = setInterval(() => {
      processingStepRef.current += 1;
      
      if (processingStepRef.current < processingSteps.length) {
        // Update the last message (which is the processing message)
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: processingSteps[processingStepRef.current],
            type: 'info'
          };
          return newMessages;
        });
      } else {
        clearInterval(interval);
        // After animation completes, submit the question
        submitCareerQuestion(question);
      }
    }, 800); // Update every 800ms
  };

  const submitCareerQuestion = async (question: string) => {
    try {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('name', userInfo.name || '');
      formData.append('email', userInfo.email || '');
      formData.append('current_role_field', userInfo.currentRole || '');
      formData.append('target_role', userInfo.targetRole || '');
      formData.append('skills', userInfo.skills || '');
      formData.append('years_experience', userInfo.experience || '');
      formData.append('session_id', sessionId);
      
      if (file) {
        formData.append('file', file);
        setFile(null);
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        setPhase('ask_question');
        if (data.error === 'not_career_related') {
          addMessage('assistant', 'This is not career-related. Please ask about jobs, skills, or career growth.', 'error');
        } else if (data.error === 'session_limit_exceeded') {
          // This should not happen as we check locally, but handle just in case
          addMessage('assistant', 'LIMIT EXCEEDED. You have already submitted your career question.', 'error');
          setHasSubmitted(true);
          localStorage.setItem(`lucidai_has_submitted_${sessionId}`, 'true');
          setPhase('submitted');
        } else {
          addMessage('assistant', `${data.error || 'Error submitting question'}`, 'error');
        }
      } else {
        // Success - mark as submitted
        setHasSubmitted(true);
        localStorage.setItem(`lucidai_has_submitted_${sessionId}`, 'true');
        
        const firstSubmissionTime = localStorage.getItem('lucidai_first_submission');
        if (!firstSubmissionTime) {
          localStorage.setItem('lucidai_first_submission', Date.now().toString());
        }
        
        // Replace the processing message with final result
        setMessages(prev => {
          const newMessages = [...prev];
          // Replace the last message (which was the processing message)
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `AI Analysis Complete!\n\n` +
              `Your career question has been submitted:\n` +
              `"${question}"\n\n` +
              `What happens next:\n` +
              `1. Our career experts review your specific situation\n` +
              `2. We create a personalized action plan\n` +
              `3. Final report will be sent to: ${userInfo.email}\n` +
              `4. Delivery within 24 hours\n\n` +
              `Status: In expert review queue\n` +
              `Reference ID: #${data.id || 'Pending'}`,
            type: 'info'
          };
          return newMessages;
        });
        
        setTimeout(() => {
          addMessage('assistant', 
            'Thank you for your question! Our experts will review it and provide personalized career guidance directly to your email.',
            'info'
          );
          setPhase('submitted');
        }, 2000);
      }
    } catch {
      setPhase('ask_question');
      addMessage('assistant', 'Network error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      if (phase === 'processing') {
        setPhase('ask_question');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase !== 'submitted' && !isSubmitting && !hasSubmitted) {
        handleSubmit(e);
      }
    }
  };

  const resetSession = () => {
    localStorage.removeItem('lucidai_session_id');
    localStorage.removeItem(`lucidai_has_submitted_${sessionId}`);
    localStorage.removeItem(`lucidai_userinfo_${sessionId}`);
    localStorage.removeItem('lucidai_first_submission');
    
    setHasSubmitted(false);
    setUserInfo({});
    setPhase('collect_name');
    setInitialized(false);
    
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('lucidai_session_id', newSessionId);
    setSessionId(newSessionId);
    
    setMessages([
      { 
        role: 'assistant', 
        content: 'Hi! I\'m LucidAI Career Assistant. Before we start, what\'s your name?',
        type: 'info'
      }
    ]);
  };

  const isSessionExpired = () => {
    const firstSubmissionTime = localStorage.getItem('lucidai_first_submission');
    if (!firstSubmissionTime) return false;
    
    const elapsedTime = Date.now() - parseInt(firstSubmissionTime, 10);
    return elapsedTime > 24 * 60 * 60 * 1000;
  };

  useEffect(() => {
    if (isSessionExpired() && hasSubmitted) {
      resetSession();
    }
  }, [hasSubmitted]);

  const getInputPlaceholder = () => {
    if (phase === 'submitted' || hasSubmitted) {
      return "LIMIT EXCEEDED";
    }
    
    switch (phase) {
      case 'collect_name':
        return "Enter your name...";
      case 'collect_email':
        return "Enter your email address...";
      case 'collect_career_info':
        if (!userInfo.currentRole) {
          return "Current role (e.g., Software Engineer)...";
        } else if (!userInfo.targetRole) {
          return "Target role (e.g., Product Manager)...";
        } else {
          return "Years of experience (e.g., 3 years)...";
        }
      case 'ask_question':
        return "Ask your career question...";
      case 'processing':
        return "AI is analyzing your question...";
      default:
        return "Type your message...";
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-100 py-2 px-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white text-xs">L</span>
            </div>
            <span className="text-sm font-medium text-gray-900">LucidAI Career</span>
            {userInfo.name && (
              <span className="text-xs text-gray-500">• {userInfo.name}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-700">
              {hasSubmitted ? 'LIMIT EXCEEDED' : '0/1'}
            </span>
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900">
              ←
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-3 py-1.5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium text-gray-700">
              {phase === 'collect_name' ? 'Step 1 of 4: Your Name' :
               phase === 'collect_email' ? 'Step 2 of 4: Email' :
               phase === 'collect_career_info' ? 'Step 3 of 4: Career Info' :
               phase === 'ask_question' ? 'Step 4 of 4: Ask Question' :
               phase === 'processing' ? 'AI Processing...' :
               hasSubmitted ? 'LIMIT EXCEEDED' :
               'Complete'}
            </div>
            <button
              onClick={resetSession}
              className="text-xs text-blue-600 hover:text-blue-800"
              title="Start over"
            >
              Reset
            </button>
          </div>
          <div className="flex space-x-1">
            {['collect_name', 'collect_email', 'collect_career_info', 'ask_question'].map((step, index) => {
              let isActive = false;
              let isCompleted = false;
              
              if (phase === step) isActive = true;
              if (index < 
                (phase === 'collect_name' ? 0 :
                 phase === 'collect_email' ? 1 :
                 phase === 'collect_career_info' ? 2 :
                 phase === 'ask_question' || phase === 'processing' ? 3 : 4)) {
                isCompleted = true;
              }
              
              return (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full ${
                    isActive ? 'bg-gray-900' :
                    isCompleted ? 'bg-gray-700' :
                    'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Demo Questions (only show in ask_question phase and not submitted) */}
      {phase === 'ask_question' && !hasSubmitted && (
        <div className="border-b border-gray-100 overflow-hidden">
          <div className="max-w-2xl mx-auto py-1.5 px-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            <div className="relative overflow-hidden">
              <div 
                id="demo-questions"
                className="flex space-x-6 items-center"
              >
                {demoQuestions.map((question, index) => (
                  <button
                    key={`first-${index}`}
                    onClick={() => handleDemoQuestionClick(question)}
                    className="flex-shrink-0 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors whitespace-nowrap"
                  >
                    {question}
                  </button>
                ))}
                {demoQuestions.map((question, index) => (
                  <button
                    key={`second-${index}`}
                    onClick={() => handleDemoQuestionClick(question)}
                    className="flex-shrink-0 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors whitespace-nowrap"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-3">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-2 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-2.5 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-100'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center mb-1">
                    <div className={`w-4 h-4 ${msg.type === 'error' ? 'bg-red-200' : 'bg-gray-300'} rounded-full flex items-center justify-center mr-1`}>
                      <span className={`text-xs ${msg.type === 'error' ? 'text-red-700' : 'text-gray-700'}`}>AI</span>
                    </div>
                    <span className={`text-xs ${msg.type === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                      {msg.type === 'error' ? 'Limit Exceeded' : 'LucidAI Career'}
                    </span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {msg.file && (
                  <div className={`mt-1 p-1 rounded ${msg.role === 'user' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-white">
                          {msg.file.name.split('.').pop()?.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate">{msg.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(msg.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Circle Animation for Processing */}
          {phase === 'processing' && (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-lg bg-gray-50 text-gray-800 px-2.5 py-2 text-sm">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs">Processing</span>
                  <div className="flex space-x-0.5">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Only show if not submitted */}
        {!hasSubmitted && phase !== 'submitted' && phase !== 'processing' && (
          <div className="border border-gray-200 rounded-lg bg-white">
            {/* File Preview (only in ask_question phase) */}
            {phase === 'ask_question' && file && (
              <div className="px-2.5 pt-1.5 border-b">
                <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-700">
                        {file.name.split('.').pop()?.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium truncate max-w-[120px]">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-gray-500 hover:text-gray-700 text-xs"
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Text Input */}
            <div className="p-1.5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getInputPlaceholder()}
                rows={1}
                className="w-full px-2 py-1.5 border-0 focus:outline-none focus:ring-0 resize-none text-gray-900 placeholder-gray-400 text-sm"
                disabled={isSubmitting || hasSubmitted}
              />
            </div>

            {/* Bottom Bar */}
            <div className="px-2 py-1.5 border-t flex justify-between items-center">
              <div className="flex items-center space-x-1">
                {phase === 'ask_question' && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      disabled={isSubmitting || hasSubmitted}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || hasSubmitted}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-500">
                      {file ? 'File attached' : 'Attach resume'}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !input.trim() || hasSubmitted}
                className="px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Question</span>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-1 text-center">
          <p className="text-xs text-gray-400">
            {hasSubmitted || phase === 'submitted'
              ? 'LIMIT EXCEEDED. Career question submitted. Our experts will review and send guidance to your email.' 
              : phase === 'processing'
              ? 'AI is analyzing your question to provide the best career guidance.'
              : phase === 'ask_question'
              ? 'Ask your career question for personalized guidance.'
              : 'Step-by-step career guidance setup.'}
          </p>
        </div>
      </div>
    </div>
  );
}
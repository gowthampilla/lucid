'use client';

import { ArrowRight, MessageSquare, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Company interface for TypeScript
interface Company {
  name: string;
  logo: string;
}

export default function Home() {
  // State for changing text animation
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Words to cycle through every 4 seconds
  const changingWords = [
    "Clear Career Guidance",
    "Smart Career Decisions",
    "Confident Career Moves",
    "Strategic Career Planning"
  ];

  // Company logos - only logos, no names
  const companies: Company[] = [
    { name: 'Google', logo: 'https://www.google.com/favicon.ico' },
    { name: 'NVIDIA', logo: 'https://www.nvidia.com/favicon.ico' },
    { name: 'Amazon', logo: 'https://www.amazon.com/favicon.ico' },
    { name: 'Microsoft', logo: 'https://www.microsoft.com/favicon.ico' },
    { name: 'Meta', logo: 'https://www.facebook.com/favicon.ico' },
    { name: 'Apple', logo: 'https://www.apple.com/favicon.ico' },
    { name: 'Tesla', logo: 'https://www.tesla.com/favicon.ico' },
    { name: 'Netflix', logo: 'https://www.netflix.com/favicon.ico' },
  ];

  // Effect for word rotation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % changingWords.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [changingWords.length]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation with YOUR LOGO - INCREASED SIZE */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Your Logo - INCREASED SIZE */}
              <div className="h-10 w-10 md:h-12 md:w-12 relative">
  <Image 
    src="/logo.png"
    alt="LUCID AI Logo"
    width={48}
    height={48}
    className="object-contain"
    priority
  />

              </div>
              <div className="flex flex-col">
        
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                How it works
              </a>
              <a href="/ask" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2">
                <span>Ask a Question</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="text-center">
            {/* Main Heading with Changing Text - FIXED POSITION */}
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                {/* Animated changing text - Fixed container height */}
                <div className="relative h-[72px] md:h-[84px] flex items-center justify-center mb-2">
                  {changingWords.map((word, index) => (
                    <div
                      key={word}
                      className={`absolute left-0 right-0 mx-auto transition-all duration-1000 ${
                        index === currentWordIndex
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                      style={{ lineHeight: '1.2' }}
                    >
                      {word}
                    </div>
                  ))}
                </div>
                {/* CHANGED: Much lower - from mt-8 to mt-16 (or even mt-20 for extreme) */}
                <span className="text-gray-600 block mt-16">AI-Enhanced</span>
              </h1>
            </div>
            
            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Submit your career questions. Receive structured, AI-polished guidance from experts within 24 hours.
            </p>

            {/* CTA Button */}
            <div className="mb-16">
              <a
                href="/ask"
                className="inline-flex items-center bg-gray-900 text-white px-10 py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-3 h-5 w-5" />
              </a>
            </div>

            {/* Company Logos - SMOOTH INFINITE LOOP ANIMATION */}
            <div className="mt-16 mb-20 overflow-hidden">
              <p className="text-gray-600 font-medium mb-8 text-center text-sm">
                Trusted by professionals at:
              </p>
              
              {/* Marquee Container - Smooth infinite loop */}
              <div className="relative overflow-hidden py-4">
                <div className="flex">
                  <div className="flex animate-marquee-infinite">
                    {companies.map((company, index) => (
                      <div key={index} className="mx-6 md:mx-8 flex-shrink-0 flex items-center justify-center">
                        <div className="h-14 w-14 md:h-16 md:w-16 bg-gray-100 rounded-full flex items-center justify-center shadow-sm">
                          <img 
                            src={company.logo}
                            alt={company.name}
                            className="h-6 w-6 md:h-8 md:w-8 object-contain"
                          />
                        </div>
                      </div>
                    ))}
                    {/* Duplicate set for seamless infinite loop */}
                    {companies.map((company, index) => (
                      <div key={`dup-${index}`} className="mx-6 md:mx-8 flex-shrink-0 flex items-center justify-center">
                        <div className="h-14 w-14 md:h-16 md:w-16 bg-gray-100 rounded-full flex items-center justify-center shadow-sm">
                          <img 
                            src={company.logo}
                            alt={company.name}
                            className="h-6 w-6 md:h-8 md:w-8 object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer - Only "© 2023 Lucid AI" */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">© 2023 Lucid AI</p>
          </div>
        </div>
      </footer>

      {/* Inline CSS for ANIMATIONS */}
      <style jsx>{`
        /* Marquee animation */
        @keyframes marquee-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee-infinite {
          animation: marquee-infinite 25s linear infinite;
          display: flex;
          width: max-content;
        }
        
        @media (max-width: 768px) {
          .animate-marquee-infinite {
            animation: marquee-infinite 20s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
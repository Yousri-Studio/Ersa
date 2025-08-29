'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen relative">
          {/* Background that extends to top */}
          <div className="absolute inset-0 hero-background" style={{top: '-100px'}}></div>
          
          {/* Main Content */}
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center min-h-screen">
            <div className="text-center">
              {/* Server Error Illustration */}
              <div className="mx-auto mb-8 w-80 h-72 flex items-center justify-center animate-bounce-in">
                <img 
                  src="/images/Server Error Iluustration.svg" 
                  alt="Server Error"
                  className="w-full h-full"
                />
              </div>
              
              {/* Error Title */}
              <h1 
                className="text-center font-cairo font-bold mb-6 animate-fade-in-up"
                style={{
                  color: '#292561',
                  fontSize: 'clamp(28px, 5vw, 44px)',
                  lineHeight: 'normal'
                }}
              >
                خطأ بالسيرفر
              </h1>
              
              {/* Error Description */}
              <p 
                className="font-cairo max-w-2xl mx-auto px-4 mb-8 animate-fade-in-up"
                style={{
                  color: '#6B7280',
                  fontSize: 'clamp(16px, 2.5vw, 18px)',
                  fontWeight: 400,
                  lineHeight: '28px',
                  textAlign: 'center',
                  animationDelay: '0.2s'
                }}
              >
                حدث خطأ غير متوقع في خادمنا. يرجى التحقق من اتصالك بالإنترنت أو إعادة المحاولة لاحقًا.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in" style={{animationDelay: '0.4s'}}>
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg btn-animate font-cairo"
                  style={{
                    backgroundColor: '#292561',
                    fontSize: '16px',
                    fontWeight: 600,
                    minWidth: '200px'
                  }}
                >
                  إعادة المحاولة
                </button>
                
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 btn-animate font-cairo"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    minWidth: '200px'
                  }}
                >
                  العودة للرئيسية
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

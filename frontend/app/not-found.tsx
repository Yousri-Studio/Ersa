'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen relative">
      {/* Background that extends to top */}
      <div className="absolute inset-0 hero-background" style={{top: '-5rem'}}></div>
      
      {/* Main Content */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          {/* 404 Error Illustration */}
          <div className="mx-auto mb-8 w-80 h-60 flex items-center justify-center animate-bounce-in">
            <img 
              src="/images/search empty state.svg" 
              alt="404 Error"
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
            الصفحة المطلوبة غير موجودة
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
            عذراً، الصفحة التي تبحث عنها غير موجودة. يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in" style={{animationDelay: '0.4s'}}>
            <Link
              href="/ar"
              className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg btn-animate font-cairo"
              style={{
                backgroundColor: '#292561',
                fontSize: '16px',
                fontWeight: 600,
                minWidth: '200px'
              }}
            >
              العودة للرئيسية
            </Link>
            
            <Link
              href="/ar/courses"
              className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg btn-animate font-cairo"
              style={{
                backgroundColor: '#00AC96',
                fontSize: '16px',
                fontWeight: 600,
                minWidth: '200px'
              }}
            >
              تصفح الدورات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

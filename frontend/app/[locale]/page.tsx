import { useTranslations } from 'next-intl';
import { HeroSection } from '@/components/home/hero-section';
import { ConsultationSection } from '@/components/home/consultation-section';
import { TrainingCategoriesSection } from '@/components/home/training-categories-section';
import { FeaturedCourses } from '@/components/home/featured-courses';
import { ServicesSection } from '@/components/home/services-section';
import { AIConsultationSection } from '@/components/home/ai-consultation-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { JoinUsSection } from '@/components/home/join-us-section';
import { AchievementsSection } from '@/components/home/achievements-section';
import FAQSection from '@/components/home/faq-section';
import { ScrollAnimations } from '@/components/scroll-animations';
export default function HomePage() {
  return (
    <>
      <ScrollAnimations />
      <div className="min-h-screen">
        {/* Hero Section - Scale animation */}
        <div className="scroll-item-scale">
          <HeroSection />
        </div>
        
        {/* Training Categories Section - Slide from left */}
        <div className="scroll-item-left">
          <TrainingCategoriesSection />
        </div>
        
        {/* Consultation Section - Fade up animation */}
        <div className="scroll-item">
          <ConsultationSection />
        </div>
        
        {/* Featured Courses Section - Fade up animation */}
        <div className="scroll-item">
          <FeaturedCourses />
        </div>
        
        {/* AI Consultation Section - Fade up animation */}
        <div className="scroll-item">
          <AIConsultationSection />
        </div>
        
        {/* Services Section - Slide from right */}
        <div className="scroll-item-right">
          <ServicesSection />
        </div>
        
        {/* Testimonials Section - Scale animation */}
        <div className="scroll-item-scale">
          <TestimonialsSection />
        </div>
        
        {/* Join Us Section - Fade up animation */}
        <div className="scroll-item">
          <JoinUsSection />
        </div>
        
        {/* Achievements Section - Slide from right with count animation */}
        <div className="scroll-item-right">
          <AchievementsSection />
        </div>
        
        {/* FAQ Section - Fade up animation */}
        <div className="scroll-item">
          <FAQSection />
        </div>
      </div>
    </>
  );
}
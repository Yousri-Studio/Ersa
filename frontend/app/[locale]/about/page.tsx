import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Metadata } from 'next';
import contentApi from '@/lib/content-api';

interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image: string;
}

interface AboutValue {
  title: string;
  description: string;
}

interface AboutContent {
  title: string;
  subtitle: string;
  vision: {
    title: string;
    description: string;
  };
  mission: {
    title: string;
    description: string;
  };
  values: AboutValue[];
  team: {
    title: string;
    members: TeamMember[];
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('about');
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('about');
  
  // Fetch about page content from the API
  let aboutContent: AboutContent;
  try {
    aboutContent = await contentApi.getAboutContent(locale);
  } catch (error) {
    console.error('Error loading about content:', error);
    // Fallback to default content if API fails
    aboutContent = {
      title: locale === 'ar' ? 'من نحن' : 'About Us',
      subtitle: locale === 'ar' ? 'تعرف على مهمتنا وقيمنا' : 'Learn more about our mission and values',
      vision: {
        title: locale === 'ar' ? 'رؤيتنا' : 'Our Vision',
        description: locale === 'ar' 
          ? 'أن نكون مزود التدريب الرائد في المنطقة'
          : 'To be the leading training provider in the region'
      },
      mission: {
        title: locale === 'ar' ? 'مهمتنا' : 'Our Mission',
        description: locale === 'ar'
          ? 'تمكين الأفراد والمنظمات من خلال برامج التدريب والتطوير عالية الجودة'
          : 'To empower individuals and organizations through high-quality training and development programs'
      },
      values: [
        {
          title: locale === 'ar' ? 'التميز' : 'Excellence',
          description: locale === 'ar'
            ? 'نسعى للتميز في كل ما نقوم به'
            : 'We strive for excellence in everything we do'
        },
        {
          title: locale === 'ar' ? 'الابتكار' : 'Innovation',
          description: locale === 'ar'
            ? 'نعتمد الابتكار في مناهجنا التعليمية'
            : 'We embrace innovation in our teaching methodologies'
        },
        {
          title: locale === 'ar' ? 'النزاهة' : 'Integrity',
          description: locale === 'ar'
            ? 'نتميز بأعلى معايير النزاهة والاحترافية'
            : 'We maintain the highest standards of integrity and professionalism'
        }
      ],
      team: {
        title: locale === 'ar' ? 'فريقنا' : 'Our Team',
        members: [
          {
            name: locale === 'ar' ? 'أحمد محمد' : 'John Doe',
            position: locale === 'ar' ? 'المدير التنفيذي' : 'CEO',
            bio: locale === 'ar'
              ? 'أكثر من 15 عامًا من الخبرة في مجال التدريب'
              : 'Over 15 years of experience in training',
            image: '/images/team/team-1.png'
          },
          {
            name: locale === 'ar' ? 'سارة أحمد' : 'Jane Smith',
            position: locale === 'ar' ? 'مدربة رئيسية' : 'Lead Trainer',
            bio: locale === 'ar'
              ? 'متخصصة في التطوير المهني والقيادة'
              : 'Specialized in professional development and leadership',
            image: '/images/team/team-2.png'
          },
          {
            name: locale === 'ar' ? 'علي خالد' : 'Ahmed Ali',
            position: locale === 'ar' ? 'مدرب تقني' : 'Technical Instructor',
            bio: locale === 'ar'
              ? 'خبير في التدريب التقني والتكنولوجيا الحديثة'
              : 'Expert in technical training and modern technologies',
            image: '/images/team/team-3.png'
          }
        ]
      }
    };
  }
  
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {aboutContent.title}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {aboutContent.subtitle}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
            <div className="grid md:grid-cols-2 gap-12">
              <div className={locale === 'ar' ? 'md:border-s-2 md:border-gray-200 md:ps-8' : 'md:border-e-2 md:border-gray-200 md:pe-8'}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {aboutContent.vision.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {aboutContent.vision.description}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {aboutContent.mission.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {aboutContent.mission.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {locale === 'ar' ? 'قيمنا' : 'Our Values'}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {locale === 'ar' ? 'القيم التي نؤمن بها ونعمل من خلالها' : 'The values we believe in and work through'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {aboutContent.values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        {aboutContent.team.members.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                {aboutContent.team.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {aboutContent.team.members.map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-64 w-full">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 font-medium mt-1">
                      {member.position}
                    </p>
                    <p className="mt-3 text-gray-600">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

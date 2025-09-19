import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations('about');
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations('about');
  
  // Get values from translations
  const values = [
    {
      title: t('values.excellence.title'),
      description: t('values.excellence.description')
    },
    {
      title: t('values.innovation.title'),
      description: t('values.innovation.description')
    },
    {
      title: t('values.integrity.title'),
      description: t('values.integrity.description')
    }
  ];
  
  // Team members from translations
  const teamMembers = [
    {
      name: t('team.members.ceo.name'),
      position: t('team.members.ceo.position'),
      bio: t('team.members.ceo.bio'),
      image: '/images/team/team-1.png'
    },
    {
      name: t('team.members.trainer.name'),
      position: t('team.members.trainer.position'),
      bio: t('team.members.trainer.bio'),
      image: '/images/team/team-2.png'
    },
    {
      name: t('team.members.instructor.name'),
      position: t('team.members.instructor.position'),
      bio: t('team.members.instructor.bio'),
      image: '/images/team/team-3.png' 
    }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
            <div className="grid md:grid-cols-2 gap-12">
              <div className={locale === 'ar' ? 'md:border-s-2 md:border-gray-200 md:ps-8' : 'md:border-e-2 md:border-gray-200 md:pe-8'}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('vision.title')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('vision.description')}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('mission.title')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('mission.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        {teamMembers.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                {t('team.title')}
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                {t('team.subtitle')}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600">
                      {member.position}
                    </p>
                    <p className="mt-2 text-gray-600">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values Section */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('values.title')}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-indigo-700 rounded-2xl overflow-hidden">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">
                {t('cta.title')}
              </span>
              <span className="block text-indigo-200">
                {t('cta.subtitle')}
              </span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  {t('cta.browseCourses')}
                </a>
              </div>
              <div className="ms-3 inline-flex rounded-md shadow">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70"
                >
                  {t('cta.contactUs')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

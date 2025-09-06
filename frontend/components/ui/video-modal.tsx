'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Icon } from './icon';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const getEmbedUrl = (url: string) => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    // Convert YouTube short URLs to embed URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    // Convert Vimeo URLs to embed URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    
    // For direct video files or already embedded URLs
    return url;
  };

  const isDirectVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const isDirect = isDirectVideo(videoUrl);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  {title && (
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 font-cairo"
                    >
                      {title}
                    </Dialog.Title>
                  )}
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <Icon name="x" className="h-6 w-6" />
                  </button>
                </div>

                {/* Video Content */}
                <div className="aspect-video bg-black">
                  {isDirect ? (
                    <video
                      className="w-full h-full"
                      controls
                      autoPlay
                      preload="metadata"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      className="w-full h-full"
                      src={embedUrl}
                      title={title || 'Course Video'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

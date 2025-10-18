'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { adminApi, OrderEnrollmentDto, AttachmentDto, CreateSecureLinksRequest, CreateEnrollmentSessionRequest, SessionDto } from '@/lib/admin-api';
import toast from 'react-hot-toast';
import SessionDetailsModal from './session-details-modal';
import { useLocale } from 'next-intl';

interface EnrollmentFulfillmentProps {
  orderId: string;
  orderStatus: number | string;
}

export default function EnrollmentFulfillment({ orderId, orderStatus }: EnrollmentFulfillmentProps) {
  const [enrollments, setEnrollments] = useState<OrderEnrollmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingEnrollments, setProcessingEnrollments] = useState<Set<string>>(new Set());

  // Check if order status is Paid (2) or Processed (4) - show fulfillment for both
  const isPaidOrder = orderStatus === 2 || orderStatus === 'Paid' || orderStatus === 'paid' || 
                      orderStatus === 4 || orderStatus === 'Processed' || orderStatus === 'processed';

  useEffect(() => {
    if (isPaidOrder) {
      fetchEnrollments();
    } else {
      setIsLoading(false);
    }
  }, [orderId, isPaidOrder]);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getOrderEnrollments(orderId);
      setEnrollments(response.data);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPaidOrder) {
    return null; // Only show for paid orders
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Fulfillment</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Fulfillment</h2>
      
      {enrollments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No enrollments found for this order</p>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              onRefresh={fetchEnrollments}
              isProcessing={processingEnrollments.has(enrollment.id)}
              setProcessing={(processing) => {
                setProcessingEnrollments(prev => {
                  const newSet = new Set(prev);
                  if (processing) {
                    newSet.add(enrollment.id);
                  } else {
                    newSet.delete(enrollment.id);
                  }
                  return newSet;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EnrollmentCardProps {
  enrollment: OrderEnrollmentDto;
  onRefresh: () => void;
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
}

function EnrollmentCard({ enrollment, onRefresh, isProcessing, setProcessing }: EnrollmentCardProps) {
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [sessionData, setSessionData] = useState<CreateEnrollmentSessionRequest>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    startAt: '',
    endAt: '',
    teamsLink: '',
    sendEmail: true,
  });

  const isPdfCourse = enrollment.courseType === 2; // PDF = 2
  const isLiveCourse = enrollment.courseType === 1; // Live = 1
  const hasFulfilledPdf = isPdfCourse && enrollment.secureLinks.length > 0;
  const isCompleted = enrollment.status === 4; // Completed = 4
  
  // For Live courses, we can have multiple sessions - load from courseSessions
  const [sessions, setSessions] = useState<any[]>(enrollment.courseSessions || []);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionDto | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const locale = useLocale();

  const getStatusBadge = () => {
    // EnrollmentStatus: Pending=1, Paid=2, Notified=3, Completed=4, Cancelled=5
    switch (enrollment.status) {
      case 1:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 2:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Paid</span>;
      case 3:
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Notified</span>;
      case 4:
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 5:
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const handleCreateSecureLinks = async () => {
    if (selectedAttachments.length === 0) {
      toast.error('Please select at least one attachment');
      return;
    }

    setProcessing(true);
    try {
      const request: CreateSecureLinksRequest = {
        attachmentIds: selectedAttachments,
        sendEmail,
      };
      await adminApi.createSecureLinks(enrollment.id, request);
      toast.success('Secure links created successfully');
      onRefresh();
      setSelectedAttachments([]);
    } catch (error: any) {
      console.error('Error creating secure links:', error);
      toast.error('Failed to create secure links');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionData.titleAr || !sessionData.titleEn || !sessionData.startAt || !sessionData.endAt || !sessionData.teamsLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      const response = await adminApi.createEnrollmentSession(enrollment.id, sessionData);
      toast.success('Session created successfully');
      
      // Add the new session to the list
      setSessions(prev => [...prev, response.data]);
      setShowSessionForm(false);
      
      // Reset form
      setSessionData({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        startAt: '',
        endAt: '',
        teamsLink: '',
        sendEmail: true,
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!confirm('Are you sure you want to mark this enrollment as completed?')) return;

    setProcessing(true);
    try {
      await adminApi.completeEnrollment(enrollment.id);
      toast.success('Enrollment marked as completed');
      onRefresh();
    } catch (error: any) {
      console.error('Error completing enrollment:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to mark enrollment as completed';
      const errorDetails = error.response?.data?.details;
      toast.error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {enrollment.courseTitle.en} / {enrollment.courseTitle.ar}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs rounded-full ${isPdfCourse ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
              {isPdfCourse ? 'PDF Course' : 'Live Course'}
            </span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* PDF Course Fulfillment */}
      {isPdfCourse && (
        <div>
          {hasFulfilledPdf ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Icon name="check-circle" className="text-green-600 mt-1 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Materials Delivered</h4>
                  <div className="space-y-1">
                    {enrollment.secureLinks.map((link) => (
                      <div key={link.id} className="text-sm text-green-700">
                        <Icon name="file" className="inline mr-1" />
                        {link.attachmentFileName}
                        <span className="text-xs text-green-600 ml-2">
                          (Created: {new Date(link.createdAt).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Select Course Materials</h4>
              {enrollment.courseAttachments.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <Icon name="exclamation-triangle" className="inline mr-2" />
                  No attachments found for this course. Please add attachments to the course first.
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {enrollment.courseAttachments.map((attachment) => (
                      <label key={attachment.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAttachments.includes(attachment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttachments([...selectedAttachments, attachment.id]);
                            } else {
                              setSelectedAttachments(selectedAttachments.filter(id => id !== attachment.id));
                            }
                          }}
                          className="mr-3"
                        />
                        <Icon name="file-pdf" className="mr-2 text-red-600" />
                        <span className="text-sm text-gray-900">{attachment.fileName}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Send email notification</span>
                    </label>
                    <button
                      onClick={handleCreateSecureLinks}
                      disabled={isProcessing || selectedAttachments.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Generate & Send Secure Links'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live Course Fulfillment */}
      {isLiveCourse && (
        <div>
          {/* Existing Sessions */}
          {sessions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Course Sessions ({sessions.length})
              </h4>
              <div className="space-y-3">
                {sessions.map((session: any, index: number) => (
                  <div key={session.id || index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <Icon name="video" className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="text-sm font-semibold text-blue-900 truncate">
                              {locale === 'ar' ? session.titleAr : session.titleEn}
                            </h5>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
                              {new Date(session.startAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            <div><strong>Start:</strong> {new Date(session.startAt).toLocaleString()}</div>
                            <div><strong>End:</strong> {new Date(session.endAt).toLocaleString()}</div>
                            {session.teamsLink && (
                              <div className="flex items-center gap-1">
                                <Icon name="link" className="h-3 w-3" />
                                <a
                                  href={session.teamsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Session Link
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowSessionModal(true);
                        }}
                        className="ml-2 p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex-shrink-0"
                        title="View Details"
                      >
                        <Icon name="eye" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Session Button/Form - Hide for completed enrollments */}
          {!isCompleted && (
            !showSessionForm ? (
              <button
                onClick={() => setShowSessionForm(true)}
                disabled={isProcessing}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon name="plus" />
                <span>Add New Session</span>
              </button>
            ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Create New Live Session</h4>
                <button
                  onClick={() => {
                    setShowSessionForm(false);
                    // Reset form
                    setSessionData({
                      titleAr: '',
                      titleEn: '',
                      descriptionAr: '',
                      descriptionEn: '',
                      startAt: '',
                      endAt: '',
                      teamsLink: '',
                      sendEmail: true,
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon name="times" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Session Title (English)*"
                  value={sessionData.titleEn}
                  onChange={(e) => setSessionData({ ...sessionData, titleEn: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Session Title (Arabic)*"
                  value={sessionData.titleAr}
                  onChange={(e) => setSessionData({ ...sessionData, titleAr: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <textarea
                  placeholder="Description (English)"
                  value={sessionData.descriptionEn}
                  onChange={(e) => setSessionData({ ...sessionData, descriptionEn: e.target.value })}
                  rows={2}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <textarea
                  placeholder="Description (Arabic)"
                  value={sessionData.descriptionAr}
                  onChange={(e) => setSessionData({ ...sessionData, descriptionAr: e.target.value })}
                  rows={2}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="datetime-local"
                  placeholder="Start Date/Time*"
                  value={sessionData.startAt}
                  onChange={(e) => setSessionData({ ...sessionData, startAt: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="datetime-local"
                  placeholder="End Date/Time*"
                  value={sessionData.endAt}
                  onChange={(e) => setSessionData({ ...sessionData, endAt: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="url"
                  placeholder="Microsoft Teams Link*"
                  value={sessionData.teamsLink}
                  onChange={(e) => setSessionData({ ...sessionData, teamsLink: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionData.sendEmail}
                    onChange={(e) => setSessionData({ ...sessionData, sendEmail: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Send email notification</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSessionForm(false);
                      setSessionData({
                        titleAr: '',
                        titleEn: '',
                        descriptionAr: '',
                        descriptionEn: '',
                        startAt: '',
                        endAt: '',
                        teamsLink: '',
                        sendEmail: true,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSession}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Create Session & Notify'}
                  </button>
                </div>
              </div>
            </div>
            )
          )}

          {/* Mark as Completed button for Live courses */}
          {sessions.length > 0 && !isCompleted && (
            <button
              onClick={handleMarkCompleted}
              disabled={isProcessing}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Mark Course as Completed'}
            </button>
          )}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && showSessionModal && (
        <SessionDetailsModal
          session={selectedSession}
          enrollmentId={enrollment.id}
          courseTitleEn={enrollment.courseTitle.en}
          courseTitleAr={enrollment.courseTitle.ar}
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedSession(null);
          }}
          onUpdate={onRefresh}
          locale={locale}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { SessionDto, UpdateEnrollmentSessionRequest, CancelEnrollmentSessionRequest, adminApi } from '@/lib/admin-api';
import toast from 'react-hot-toast';

interface SessionDetailsModalProps {
  session: SessionDto;
  enrollmentId: string;
  courseTitleEn: string;
  courseTitleAr: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  locale?: string;
  isCompleted?: boolean;
}

export default function SessionDetailsModal({
  session,
  enrollmentId,
  courseTitleEn,
  courseTitleAr,
  isOpen,
  onClose,
  onUpdate,
  locale = 'en',
  isCompleted = false
}: SessionDetailsModalProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'cancel'>('view');
  const [isProcessing, setIsProcessing] = useState(false);
  const isRTL = locale === 'ar';

  // Edit form state
  const [editData, setEditData] = useState<UpdateEnrollmentSessionRequest>({
    titleAr: session.titleAr,
    titleEn: session.titleEn,
    descriptionAr: session.descriptionAr || '',
    descriptionEn: session.descriptionEn || '',
    startAt: session.startAt,
    endAt: session.endAt,
    teamsLink: session.teamsLink || '',
    sendEmail: true,
  });

  // Cancel form state
  const [cancelData, setCancelData] = useState<CancelEnrollmentSessionRequest>({
    cancellationReasonEn: '',
    cancellationReasonAr: '',
    sendEmail: true,
  });

  if (!isOpen) return null;

  const handleResendNotification = async () => {
    try {
      setIsProcessing(true);
      await adminApi.resendSessionNotification(enrollmentId);
      toast.success(isRTL ? 'تم إرسال الإشعار بنجاح' : 'Notification sent successfully');
    } catch (error) {
      console.error('Error resending notification:', error);
      toast.error(isRTL ? 'فشل إرسال الإشعار' : 'Failed to send notification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!editData.titleEn || !editData.titleAr || !editData.startAt || !editData.endAt || !editData.teamsLink) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      setIsProcessing(true);
      await adminApi.updateEnrollmentSession(enrollmentId, editData);
      toast.success(isRTL ? 'تم تحديث الجلسة بنجاح' : 'Session updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error(isRTL ? 'فشل تحديث الجلسة' : 'Failed to update session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelData.cancellationReasonEn || !cancelData.cancellationReasonAr) {
      toast.error(isRTL ? 'يرجى إدخال سبب الإلغاء بكلا اللغتين' : 'Please enter cancellation reason in both languages');
      return;
    }

    try {
      setIsProcessing(true);
      await adminApi.cancelEnrollmentSession(enrollmentId, cancelData);
      toast.success(isRTL ? 'تم إلغاء الجلسة بنجاح' : 'Session cancelled successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error(isRTL ? 'فشل إلغاء الجلسة' : 'Failed to cancel session');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'view' && (isRTL ? 'تفاصيل الجلسة' : 'Session Details')}
            {mode === 'edit' && (isRTL ? 'تعديل الجلسة' : 'Edit Session')}
            {mode === 'cancel' && (isRTL ? 'إلغاء الجلسة' : 'Cancel Session')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon name="times" className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === 'view' && (
            <div className="space-y-4">
              {/* Course Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">{isRTL ? 'الدورة' : 'Course'}</p>
                <p className="font-semibold text-blue-900">{isRTL ? courseTitleAr : courseTitleEn}</p>
              </div>

              {/* Session Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'عنوان الجلسة' : 'Session Title'}
                </label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">{isRTL ? 'إنجليزي:' : 'English:'}</span>
                    <p className="text-gray-900">{session.titleEn}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{isRTL ? 'عربي:' : 'Arabic:'}</span>
                    <p className="text-gray-900">{session.titleAr}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {(session.descriptionEn || session.descriptionAr) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'الوصف' : 'Description'}
                  </label>
                  <div className="space-y-2">
                    {session.descriptionEn && (
                      <div>
                        <span className="text-xs text-gray-500">{isRTL ? 'إنجليزي:' : 'English:'}</span>
                        <p className="text-gray-600">{session.descriptionEn}</p>
                      </div>
                    )}
                    {session.descriptionAr && (
                      <div>
                        <span className="text-xs text-gray-500">{isRTL ? 'عربي:' : 'Arabic:'}</span>
                        <p className="text-gray-600">{session.descriptionAr}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'وقت البدء' : 'Start Time'}
                  </label>
                  <p className="text-gray-900">{new Date(session.startAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'وقت الانتهاء' : 'End Time'}
                  </label>
                  <p className="text-gray-900">{new Date(session.endAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Teams Link */}
              {session.teamsLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'رابط الجلسة' : 'Session Link'}
                  </label>
                  <a
                    href={session.teamsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {session.teamsLink}
                  </a>
                </div>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <div className="space-y-4">
              {/* Title EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.titleEn}
                  onChange={(e) => setEditData({ ...editData, titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Title AR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.titleAr}
                  onChange={(e) => setEditData({ ...editData, titleAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  dir="rtl"
                />
              </div>

              {/* Description EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  value={editData.descriptionEn}
                  onChange={(e) => setEditData({ ...editData, descriptionEn: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description AR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={editData.descriptionAr}
                  onChange={(e) => setEditData({ ...editData, descriptionAr: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  dir="rtl"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'وقت البدء' : 'Start Time'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={editData.startAt.slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, startAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'وقت الانتهاء' : 'End Time'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={editData.endAt.slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, endAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Teams Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'رابط الجلسة' : 'Session Link'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editData.teamsLink}
                  onChange={(e) => setEditData({ ...editData, teamsLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://teams.microsoft.com/..."
                />
              </div>

              {/* Send Email */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={editData.sendEmail}
                  onChange={(e) => setEditData({ ...editData, sendEmail: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-700">
                  {isRTL ? 'إرسال بريد إلكتروني للمستخدم بالتحديثات' : 'Send email notification to user about updates'}
                </label>
              </div>
            </div>
          )}

          {mode === 'cancel' && (
            <div className="space-y-4">
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <Icon name="exclamation-triangle" className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    {isRTL ? 'تحذير' : 'Warning'}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {isRTL
                      ? 'سيتم إلغاء ربط هذه الجلسة بالتسجيل. المستخدم سيتلقى إشعاراً بالإلغاء إذا اخترت إرسال بريد إلكتروني.'
                      : 'This session will be unlinked from the enrollment. The user will receive a cancellation notification if you choose to send an email.'}
                  </p>
                </div>
              </div>

              {/* Cancellation Reason EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'سبب الإلغاء (إنجليزي)' : 'Cancellation Reason (English)'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelData.cancellationReasonEn}
                  onChange={(e) => setCancelData({ ...cancelData, cancellationReasonEn: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>

              {/* Cancellation Reason AR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'سبب الإلغاء (عربي)' : 'Cancellation Reason (Arabic)'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelData.cancellationReasonAr}
                  onChange={(e) => setCancelData({ ...cancelData, cancellationReasonAr: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  dir="rtl"
                  placeholder="يرجى تقديم سبب الإلغاء..."
                />
              </div>

              {/* Send Email */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendCancelEmail"
                  checked={cancelData.sendEmail}
                  onChange={(e) => setCancelData({ ...cancelData, sendEmail: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="sendCancelEmail" className="ml-2 block text-sm text-gray-700">
                  {isRTL ? 'إرسال بريد إلكتروني للمستخدم بإشعار الإلغاء' : 'Send cancellation notification email to user'}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          {mode === 'view' && (
            <div className="flex items-center justify-between gap-3">
              {isCompleted ? (
                <div className="flex-1 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
                  <Icon name="info-circle" className="inline h-4 w-4 mr-1" />
                  {isRTL ? 'لا يمكن تعديل أو إلغاء الجلسات للتسجيلات المكتملة' : 'Cannot edit or cancel sessions for completed enrollments'}
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode('edit')}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Icon name="edit" className="h-4 w-4" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={handleResendNotification}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Icon name="envelope" className="h-4 w-4" />
                      {isRTL ? 'إعادة إرسال الإشعار' : 'Resend Notification'}
                    </button>
                  </div>
                  <button
                    onClick={() => setMode('cancel')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Icon name="times-circle" className="h-4 w-4" />
                    {isRTL ? 'إلغاء الجلسة' : 'Cancel Session'}
                  </button>
                </>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setMode('view');
                  setEditData({
                    titleAr: session.titleAr,
                    titleEn: session.titleEn,
                    descriptionAr: session.descriptionAr || '',
                    descriptionEn: session.descriptionEn || '',
                    startAt: session.startAt,
                    endAt: session.endAt,
                    teamsLink: session.teamsLink || '',
                    sendEmail: true,
                  });
                }}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleUpdate}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Icon name="check" className="h-4 w-4" />
                    {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          )}

          {mode === 'cancel' && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setMode('view');
                  setCancelData({
                    cancellationReasonEn: '',
                    cancellationReasonAr: '',
                    sendEmail: true,
                  });
                }}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isRTL ? 'جاري الإلغاء...' : 'Cancelling...'}
                  </>
                ) : (
                  <>
                    <Icon name="times-circle" className="h-4 w-4" />
                    {isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


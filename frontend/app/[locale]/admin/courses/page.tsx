'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { adminApi, AdminCourse, PagedResult, AdminCreateCourseRequest, AdminUpdateCourseRequest } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseForm, setCourseForm] = useState<AdminCreateCourseRequest>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: 0,
    isActive: true,
  });
  const { isHydrated } = useHydration();

  useEffect(() => {
    if (isHydrated) {
      fetchCourses();
    }
  }, [isHydrated, pagination.page, filters]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCourses({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        isActive: filters.isActive !== '' ? filters.isActive === 'true' : undefined,
      });
      
      setCourses(response.data.items);
      setPagination(prev => ({
        ...prev,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
      }));
    } catch (error: any) {
      toast.error('Failed to load courses');
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    try {
      await adminApi.createCourse(courseForm);
      toast.success('Course created successfully');
      setShowAddModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse) return;
    try {
      await adminApi.updateCourse(selectedCourse.id, courseForm);
      toast.success('Course updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    try {
      await adminApi.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (course: AdminCourse) => {
    setSelectedCourse(course);
    setCourseForm({
      titleAr: course.titleAr,
      titleEn: course.titleEn,
      descriptionAr: course.descriptionAr || '',
      descriptionEn: course.descriptionEn || '',
      price: course.price,
      isActive: course.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course: AdminCourse) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setCourseForm({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: 0,
      isActive: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6" style={{maxWidth: '90rem'}}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all courses on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Icon name="fa-search" className="mr-2" />
              Search
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Add Course
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Courses ({pagination.totalCount.toLocaleString()})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Icon name="fa-graduation-cap" className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.titleEn}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.titleAr}
                          </div>
                          {course.descriptionEn && (
                            <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {course.descriptionEn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(course.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(course.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(course.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(course)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Course"
                        >
                          <Icon name="fa-edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(course)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Course"
                        >
                          <Icon name="fa-trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.totalCount}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name="fa-chevron-left" className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name="fa-chevron-right" className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Course</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={courseForm.titleEn}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, titleEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic)</label>
                    <input
                      type="text"
                      value={courseForm.titleAr}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, titleAr: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Arabic title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                    <textarea
                      rows={3}
                      value={courseForm.descriptionEn}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
                    <textarea
                      rows={3}
                      value={courseForm.descriptionAr}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Arabic description"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={courseForm.isActive.toString()}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourse}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Add Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Course</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={courseForm.titleEn}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, titleEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic)</label>
                    <input
                      type="text"
                      value={courseForm.titleAr}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, titleAr: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Arabic title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                    <textarea
                      rows={3}
                      value={courseForm.descriptionEn}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
                    <textarea
                      rows={3}
                      value={courseForm.descriptionAr}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Arabic description"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={courseForm.isActive.toString()}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCourse}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Course</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete the course "{selectedCourse.titleEn}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

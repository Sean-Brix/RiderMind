import { useState } from 'react';
import { format } from 'date-fns';

export default function RegistrationRequestDetailModal({ request, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Approval sidebar state
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [orNumber, setOrNumber] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Helper function to format ID as 8-digit number
  const formatId = (id) => String(id).padStart(8, '0');

  const isPending = request.status === 'PENDING';

  // Handle receipt file selection
  function handleReceiptChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setReceiptFile(file);
    setError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(''); // No preview for PDFs
    }
  }

  async function handleApprove() {
    if (!receiptFile) {
      setError('Please upload a payment receipt');
      return;
    }

    if (!orNumber.trim()) {
      setError('Please enter the OR number');
      return;
    }

    setShowConfirmModal(true);
  }

  async function confirmApproval() {
    setShowConfirmModal(false);

    try {
      setError('');
      setLoading(true);
      setUploadingReceipt(true);
      const token = localStorage.getItem('token');

      // Upload receipt first
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('orNumber', orNumber);
      formData.append('requestId', request.id);
      
      const uploadRes = await fetch(`/api/auth/registration-requests/${request.id}/upload-receipt`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Failed to upload receipt');
      }

      setUploadingReceipt(false);

      // Then approve the registration
      const res = await fetch(`/api/auth/registration-requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiptUrl: uploadData.receiptUrl,
          orNumber: orNumber
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to approve request');
      }

      setSuccessMessage(`Registration approved! User account created with ID: ${data.data.userId}`);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        setShowApprovalForm(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setUploadingReceipt(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/auth/registration-requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reject request');
      }

      setSuccessMessage('Registration request rejected successfully');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    setShowDeleteModal(false);

    try {
      setError('');
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/auth/registration-requests/${request.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete request');
      }

      setSuccessMessage('Registration request deleted successfully');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Build full name properly - name_extension might contain full name, so check if it's actually an extension
  const nameExtension = request.name_extension;
  const isActualExtension = nameExtension && ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'].some(ext => 
    nameExtension.toUpperCase().includes(ext.toUpperCase())
  );
  
  const fullName = [
    request.first_name, 
    request.middle_name, 
    request.last_name,
    isActualExtension ? nameExtension : null
  ]
    .filter(Boolean)
    .join(' ') || 'No name provided';

  return (
    <>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[70] animate-slide-in-right">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-green-200 dark:border-green-800 p-4 min-w-[300px] max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Success!</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full my-8 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 max-w-5xl">
          
          {/* Show Approval Form OR Main Content */}
          {showApprovalForm && request.status === 'PENDING' ? (
            // Approval Form View
            <div className="flex flex-col">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 flex-shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowApprovalForm(false);
                        setError('');
                        setReceiptFile(null);
                        setReceiptPreview('');
                        setOrNumber('');
                      }}
                      disabled={loading}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Approve Registration</h3>
                        <p className="text-sm text-green-100">Complete payment details to create account</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Applicant Name Display */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    Applicant Name
                  </label>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {fullName}
                  </p>
                </div>

                {/* Upload Receipt */}
                <div>
                  <label className="block text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Payment Receipt <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Upload proof of payment (JPEG, PNG, or PDF, max 5MB)
                  </p>
                  
                  <div className="relative">
                    <input
                      type="file"
                      id="receipt-upload"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleReceiptChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer bg-neutral-50 dark:bg-gray-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      {receiptPreview ? (
                        <div className="relative w-full h-full p-3">
                          <img 
                            src={receiptPreview} 
                            alt="Receipt preview" 
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setReceiptFile(null);
                              setReceiptPreview('');
                            }}
                            className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : receiptFile ? (
                        <div className="text-center">
                          <svg className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">{receiptFile.name}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setReceiptFile(null);
                              setReceiptPreview('');
                            }}
                            className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-16 w-16 text-neutral-400 dark:text-neutral-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">Click to upload receipt</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">JPEG, PNG, or PDF up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* OR Number */}
                <div>
                  <label className="block text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Official Receipt (OR) Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orNumber}
                    onChange={(e) => setOrNumber(e.target.value)}
                    placeholder="Enter OR number (e.g., OR-2024-00123)"
                    disabled={loading}
                    className="w-full px-4 py-3.5 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-gray-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono disabled:opacity-50"
                  />
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    This will be stored with the user's account information
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowApprovalForm(false);
                      setError('');
                      setReceiptFile(null);
                      setReceiptPreview('');
                      setOrNumber('');
                    }}
                    disabled={loading}
                    className="px-6 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-gray-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    disabled={loading || !receiptFile || !orNumber.trim()}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        {uploadingReceipt ? 'Uploading Receipt...' : 'Creating Account...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approve & Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Main Details View
            <div className="flex flex-col">
              {/* Header */}
              <div className="relative px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-5">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {(request.first_name?.[0] || request.email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {fullName}
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    request.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' :
                    request.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      request.status === 'PENDING' ? 'bg-yellow-500 animate-pulse' :
                      request.status === 'APPROVED' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></span>
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span className="font-mono">REQ-{formatId(request.id)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Submitted {format(new Date(request.requestedAt), 'MMM d, yyyy')}</span>
                  </div>
                  {request.student_type && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-brand-600 dark:text-brand-400">
                        {request.student_type === 'A' ? 'Motorcycle (A)' : request.student_type === 'B' ? 'Car (B)' : `Type ${request.student_type}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Personal Information */}
              <section className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30 border-b border-brand-200 dark:border-brand-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h3>
                  </div>
                </div>
                <dl className="divide-y divide-dotted divide-neutral-200 dark:divide-neutral-700">
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Full Name</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2 font-medium">{fullName}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Email Address</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.email || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Sex</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.sex || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Date of Birth</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.birthdate ? format(new Date(request.birthdate), 'MMMM d, yyyy') : <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Nationality</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.nationality || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Civil Status</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.civil_status || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                </dl>
              </section>

              {/* Physical Attributes */}
              <section className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-b border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Physical Attributes</h3>
                  </div>
                </div>
                <dl className="divide-y divide-dotted divide-neutral-200 dark:divide-neutral-700">
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Height</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.height ? `${request.height} cm` : <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Weight</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.weight ? `${request.weight} kg` : <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Blood Type</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.blood_type || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Eye Color</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.eye_color || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                </dl>
              </section>

              {/* Address Information */}
              <section className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-b border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Address</h3>
                  </div>
                </div>
                <dl className="divide-y divide-dotted divide-neutral-200 dark:divide-neutral-700">
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">House No.</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.address_house_no || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Street</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.address_street || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Barangay</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.address_barangay || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">City/Municipality</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.address_city_municipality || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Province</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.address_province || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                </dl>
              </section>

              {/* Contact Information */}
              <section className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-b border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h3>
                  </div>
                </div>
                <dl className="divide-y divide-dotted divide-neutral-200 dark:divide-neutral-700">
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Cellphone</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2 font-mono">{request.cellphone_number || <span className="text-neutral-400 font-sans">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Telephone</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2 font-mono">{request.telephone_number || <span className="text-neutral-400 font-sans">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Alternative Email</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2 break-all">{request.email_address || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                </dl>
              </section>

              {/* Emergency Contact */}
              <section className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-b border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Emergency Contact</h3>
                  </div>
                </div>
                <dl className="divide-y divide-dotted divide-neutral-200 dark:divide-neutral-700">
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Contact Name</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.emergency_contact_name || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Relationship</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.emergency_contact_relationship || <span className="text-neutral-400">Not provided</span>}</dd>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Contact Number</dt>
                    <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2 font-mono">{request.emergency_contact_number || <span className="text-neutral-400 font-sans">Not provided</span>}</dd>
                  </div>
                </dl>
              </section>

              {/* Review Information */}
              {request.status !== 'PENDING' && (
                <section className="bg-white dark:bg-gray-900 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-800/50 border-b border-neutral-300 dark:border-neutral-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Review Information</h3>
                    </div>
                  </div>
                  <dl className="divide-y divide-dotted divide-neutral-200 dark:divide-neutral-700">
                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Reviewed At</dt>
                      <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.reviewedAt ? format(new Date(request.reviewedAt), 'MMMM d, yyyy h:mm a') : <span className="text-neutral-400">Not provided</span>}</dd>
                    </div>
                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Reviewed By</dt>
                      <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.reviewer ? `${request.reviewer.first_name} ${request.reviewer.last_name}` : request.reviewedBy ? `User #${request.reviewedBy}` : <span className="text-neutral-400">Not provided</span>}</dd>
                    </div>
                    {request.rejectionReason && (
                      <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rejection Reason</dt>
                        <dd className="text-sm text-neutral-900 dark:text-neutral-100 sm:col-span-2">{request.rejectionReason}</dd>
                      </div>
                    )}
                    {request.status === 'APPROVED' && request.orNumber && (
                      <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">OR Number</dt>
                        <dd className="text-sm font-mono font-semibold text-green-700 dark:text-green-400 sm:col-span-2">#{request.orNumber}</dd>
                      </div>
                    )}
                    {request.status === 'APPROVED' && request.paymentReceiptUrl && (
                      <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Payment Receipt</dt>
                        <dd className="sm:col-span-2">
                          <button 
                            onClick={() => setShowReceiptModal(true)}
                            className="group inline-block"
                          >
                            <div className="relative overflow-hidden rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-green-400 dark:hover:border-green-500 transition-all shadow-sm hover:shadow-lg max-w-xs">
                              <img 
                                src={request.paymentReceiptUrl} 
                                alt="Payment Receipt" 
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                  e.target.parentElement.innerHTML = `
                                    <div class="flex items-center gap-2 px-4 py-3 bg-neutral-100 dark:bg-gray-900">
                                      <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span class="text-sm text-neutral-600 dark:text-neutral-400">View Receipt</span>
                                    </div>
                                  `;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-3 backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-neutral-700 dark:text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Click to preview receipt
                            </p>
                          </button>
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
            </div>
          </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-2xl">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Request
              </button>

              <div className="flex items-center gap-3">
                {isPending ? (
                  <>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => setShowApprovalForm(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Approve & Create Account
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-lg transition-all shadow-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
        </div>
      </div>
      )}
      </div>
    </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-700">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Reject Application</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">This action requires a reason</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Quick Select Reasons */}
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Common Reasons (Click to use)
              </label>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {[
                  'The email address provided does not match our institutional domain requirements. Please use your official educational institution email address.',
                  'The information provided could not be verified. Please ensure all details are accurate and complete.',
                  'Your registration does not meet the current eligibility criteria for this program.',
                  'Duplicate account detected. An account with this email address already exists in our system.',
                  'The submitted documentation is incomplete or does not meet our requirements.',
                  'Age requirement not met. Applicants must be at least 18 years old.',
                  'Invalid or incomplete contact information provided.'
                ].map((reason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className="text-left p-3 text-sm bg-neutral-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950/30 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-800 rounded-lg transition-all text-neutral-700 dark:text-neutral-300"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Select from above or provide your own reason..."
                rows={4}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-gray-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
              />
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                The applicant will receive this reason via email.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setError('');
                }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Confirm Approval</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Please review before proceeding</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  You are about to approve the registration request for:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{request.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">OR #{orNumber}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">⚠ This action will:</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Create a new user account with login credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Send a confirmation email to the applicant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Archive this registration request</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm Approval
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptModal && request.paymentReceiptUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowReceiptModal(false)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Payment Receipt</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">OR #{request.orNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Image */}
            <div className="overflow-auto max-h-[calc(90vh-80px)] bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
              <img 
                src={request.paymentReceiptUrl} 
                alt="Payment Receipt"
                className="max-w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center gap-4 py-12 px-6 text-center">
                      <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Failed to Load Receipt</h4>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400">The receipt image could not be loaded. It may have been moved or deleted.</p>
                      </div>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Delete Registration Request</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Are you sure you want to permanently delete this registration request?
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-red-900 dark:text-red-200">{fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-red-700 dark:text-red-300">{request.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm text-red-700 dark:text-red-300">Status: {request.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


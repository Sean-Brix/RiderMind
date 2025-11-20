import React from 'react';
import PropTypes from 'prop-types';

const Certificate = ({ 
  fullName, 
  vehicleCategory, 
  accountId, 
  dateIssued = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  certificateTitle = "Certificate of Completion",
  issuerName = "RiderMind",
  className = ""
}) => {
  return (
    <div className={`certificate-container ${className}`}>
      <div className="certificate bg-gradient-to-br from-rose-50 to-red-50 border-8 border-double border-brand-700 rounded-lg shadow-2xl p-12 w-[297mm] h-[210mm] mx-auto relative overflow-hidden" style={{ aspectRatio: '297/210' }}>
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></div>
        
        {/* Watermark/Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-brand-800">
            {issuerName}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-brand-800 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-serif font-bold text-brand-900 tracking-wide">
              {certificateTitle}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 mx-auto"></div>
          </div>

          {/* Body */}
          <div className="space-y-6 py-8">
            <p className="text-lg text-gray-700 font-light">
              This is to certify that
            </p>
            
            <div className="py-4">
              <h2 className="text-4xl font-serif font-bold text-brand-900 mb-2">
                {fullName}
              </h2>
              <div className="w-64 h-0.5 bg-brand-300 mx-auto"></div>
            </div>

            <p className="text-lg text-gray-700 font-light">
              has successfully completed the training program for
            </p>

            <div className="bg-white bg-opacity-60 rounded-lg py-4 px-8 inline-block shadow-md border-2 border-brand-200">
              <p className="text-2xl font-bold text-brand-800 uppercase tracking-wider">
                {vehicleCategory}
              </p>
            </div>

            <p className="text-lg text-gray-700 font-light pt-4">
              and has demonstrated proficiency in safe riding practices
            </p>
          </div>

          {/* Footer */}
          <div className="pt-8 space-y-6">
            <div className="flex justify-between items-end max-w-2xl mx-auto px-8">
              <div className="text-left space-y-2">
                <div className="w-48 h-0.5 bg-gray-800"></div>
                <p className="text-sm font-semibold text-gray-800">{issuerName}</p>
                <p className="text-xs text-gray-600">Authorized Issuer</p>
              </div>
              
              <div className="text-right space-y-2">
                <div className="w-48 h-0.5 bg-gray-800"></div>
                <p className="text-sm font-semibold text-gray-800">{dateIssued}</p>
                <p className="text-xs text-gray-600">Date Issued</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="pt-4 border-t border-gray-300 mt-8">
              <p className="text-xs text-gray-500 font-mono">
                Certificate ID: {accountId}
              </p>
            </div>
          </div>
        </div>

        {/* Seal/Badge */}
        <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg flex items-center justify-center border-4 border-amber-400 transform -rotate-12">
          <div className="text-center">
            <p className="text-white text-xs font-bold uppercase">Official</p>
            <p className="text-amber-300 text-lg font-bold">{issuerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Certificate.propTypes = {
  fullName: PropTypes.string.isRequired,
  vehicleCategory: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
  dateIssued: PropTypes.string,
  certificateTitle: PropTypes.string,
  issuerName: PropTypes.string,
  className: PropTypes.string
};

export default Certificate;

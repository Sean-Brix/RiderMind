import { forwardRef } from 'react';
import { Trophy, Award, Star } from 'lucide-react';

/**
 * Certificate Component
 * 
 * A professional certificate design for course completion
 * Optimized for PDF export and printing
 * 
 * @param {Object} props
 * @param {string} props.userName - Full name of the user
 * @param {string} props.courseName - Name of the completed course
 * @param {Date} props.completionDate - Date of course completion
 * @param {number} props.totalModules - Total number of modules completed
 * @param {number} props.averageScore - Average quiz score percentage
 * @param {string} props.certificateId - Unique certificate identifier
 * @param {string} props.refId - Reference ID generated from account and student module IDs
 */
const Certificate = forwardRef(({ 
  userName = 'Student Name',
  courseName = 'Driver Education Course',
  completionDate = new Date(),
  totalModules = 0,
  averageScore = 0,
  certificateId = 'CERT-0000-0000',
  refId = 'REF-0000-0000'
}, ref) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date(completionDate));

  // Hardcoded colors for PDF export - Red/Maroon theme
  const colors = {
    brand: '#e11d48',        // rose-600 (primary brand)
    brandLight: '#fb7185',   // rose-400
    brandDark: '#be123c',    // rose-700
    amber: '#f59e0b',
    green: '#16a34a',
    neutral900: '#171717',
    neutral700: '#404040',
    neutral600: '#525252',
    neutral300: '#d4d4d4',
    neutral200: '#e5e5e5',
    neutral100: '#f5f5f5',
    neutral50: '#fafafa',
    white: '#ffffff'
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          .certificate-container {
            width: 297mm !important;
            height: 210mm !important;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div 
        ref={ref}
        className="certificate-container"
        style={{ 
          width: '1122px', // A4 landscape width at 96 DPI (297mm)
          height: '794px', // A4 landscape height at 96 DPI (210mm)
          padding: '60px',
          fontFamily: 'Georgia, serif',
          backgroundColor: colors.white,
          border: `12px solid ${colors.brand}`,
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
      {/* Decorative Corner Elements */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100px', height: '100px' }}>
        <div style={{ 
          position: 'absolute',
          top: '20px', 
          left: '20px', 
          width: '80px', 
          height: '80px',
          borderTop: `5px solid ${colors.brandLight}`,
          borderLeft: `5px solid ${colors.brandLight}`,
          borderRadius: '30px 0 0 0'
        }}></div>
      </div>
      <div style={{ position: 'absolute', top: '0', right: '0', width: '100px', height: '100px' }}>
        <div style={{ 
          position: 'absolute',
          top: '20px', 
          right: '20px', 
          width: '80px', 
          height: '80px',
          borderTop: `5px solid ${colors.brandLight}`,
          borderRight: `5px solid ${colors.brandLight}`,
          borderRadius: '0 30px 0 0'
        }}></div>
      </div>
      <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100px', height: '100px' }}>
        <div style={{ 
          position: 'absolute',
          bottom: '20px', 
          left: '20px', 
          width: '80px', 
          height: '80px',
          borderBottom: `5px solid ${colors.brandLight}`,
          borderLeft: `5px solid ${colors.brandLight}`,
          borderRadius: '0 0 0 30px'
        }}></div>
      </div>
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '100px', height: '100px' }}>
        <div style={{ 
          position: 'absolute',
          bottom: '20px', 
          right: '20px', 
          width: '80px', 
          height: '80px',
          borderBottom: `5px solid ${colors.brandLight}`,
          borderRight: `5px solid ${colors.brandLight}`,
          borderRadius: '0 0 30px 0'
        }}></div>
      </div>

      {/* Decorative Background Pattern - Simplified for PDF */}
      <div style={{ 
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        opacity: '0.03',
        pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(45deg, ${colors.brand} 0, ${colors.brand} 1px, transparent 1px, transparent 40px)`,
        backgroundSize: '60px 60px'
      }}></div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: '10', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', paddingTop: '30px' }}>
        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '15px' }}>
            <Trophy style={{ width: '56px', height: '56px', color: colors.brand }} />
            <img 
              src="/logo.png" 
              alt="RiderMind Logo" 
              style={{ 
                width: '56px', 
                height: '56px', 
                objectFit: 'contain'
              }} 
            />
            <Star style={{ width: '56px', height: '56px', color: colors.amber, fill: colors.amber }} />
          </div>
          <h1 style={{ 
            fontSize: '52px', 
            fontWeight: 'bold', 
            color: colors.brand,
            marginBottom: '12px',
            margin: '0',
            lineHeight: '1.2'
          }}>
            Certificate of Completion
          </h1>
          <div style={{
            height: '5px',
            width: '250px',
            background: `linear-gradient(to right, transparent, ${colors.brand}, transparent)`,
            margin: '0 auto'
          }}></div>
        </div>

        {/* Presentation Line */}
        <p style={{ 
          fontSize: '22px', 
          color: colors.neutral700,
          fontStyle: 'italic',
          marginBottom: '20px',
          margin: '0 0 20px 0'
        }}>
          This is to certify that
        </p>

        {/* Student Name */}
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: 'bold', 
          color: colors.neutral900,
          marginBottom: '20px',
          borderBottom: `3px solid ${colors.neutral300}`,
          paddingBottom: '15px',
          paddingLeft: '60px',
          paddingRight: '60px',
          margin: '0 0 20px 0',
          lineHeight: '1.2'
        }}>
          {userName}
        </h2>

        {/* Achievement Description */}
        <p style={{ 
          fontSize: '20px', 
          color: colors.neutral700,
          marginBottom: '15px',
          textAlign: 'center',
          maxWidth: '700px',
          margin: '0 auto 15px auto'
        }}>
          has successfully completed the
        </p>

        {/* Course Name */}
        <h3 style={{ 
          fontSize: '40px', 
          fontWeight: 'bold', 
          color: colors.brand,
          marginBottom: '25px',
          margin: '0 0 25px 0',
          lineHeight: '1.2'
        }}>
          {courseName}
        </h3>

        {/* Stats Grid */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '25px',
          width: '100%'
        }}>
          <div style={{ 
            backgroundColor: colors.neutral50,
            borderRadius: '12px',
            padding: '20px 30px',
            textAlign: 'center',
            border: `2px solid ${colors.neutral200}`,
            minWidth: '180px'
          }}>
            <p style={{ fontSize: '14px', color: colors.neutral600, marginBottom: '8px', margin: '0 0 8px 0' }}>Modules Completed</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: colors.brand, margin: '0' }}>{totalModules}</p>
          </div>
          <div style={{ 
            backgroundColor: colors.neutral50,
            borderRadius: '12px',
            padding: '20px 30px',
            textAlign: 'center',
            border: `2px solid ${colors.neutral200}`,
            minWidth: '180px'
          }}>
            <p style={{ fontSize: '14px', color: colors.neutral600, marginBottom: '8px', margin: '0 0 8px 0' }}>Average Score</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: colors.green, margin: '0' }}>{averageScore}%</p>
          </div>
          <div style={{ 
            backgroundColor: colors.neutral50,
            borderRadius: '12px',
            padding: '20px 30px',
            textAlign: 'center',
            border: `2px solid ${colors.neutral200}`,
            minWidth: '180px'
          }}>
            <p style={{ fontSize: '14px', color: colors.neutral600, marginBottom: '8px', margin: '0 0 8px 0' }}>Completion Date</p>
            <p style={{ fontSize: '20px', fontWeight: '600', color: colors.neutral900, margin: '0 0 4px 0' }}>{formattedDate.split(' ')[0]}</p>
            <p style={{ fontSize: '14px', color: colors.neutral600, margin: '0' }}>{formattedDate.split(' ').slice(1).join(' ')}</p>
          </div>
        </div>

        {/* Achievement Statement */}
        <p style={{ 
          fontSize: '17px', 
          color: colors.neutral700,
          marginBottom: '30px',
          textAlign: 'center',
          maxWidth: '750px',
          lineHeight: '1.7',
          margin: '0 auto 30px auto'
        }}>
          demonstrating excellence, dedication, and mastery of all course materials 
          and assessments required for successful completion.
        </p>

        {/* Signature Section */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '80px',
          width: '100%',
          marginTop: 'auto',
          paddingTop: '30px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              borderTop: `3px solid ${colors.neutral900}`,
              paddingTop: '12px',
              marginBottom: '10px',
              minWidth: '220px'
            }}>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: colors.neutral900, margin: '0' }}>RiderMind Academy</p>
            </div>
            <p style={{ fontSize: '14px', color: colors.neutral600, margin: '0' }}>Certification Authority</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              borderTop: `3px solid ${colors.neutral900}`,
              paddingTop: '12px',
              marginBottom: '10px',
              minWidth: '220px'
            }}>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: colors.neutral900, margin: '0' }}>{formattedDate}</p>
            </div>
            <p style={{ fontSize: '14px', color: colors.neutral600, margin: '0' }}>Date of Completion</p>
          </div>
        </div>

        {/* Certificate ID and Reference Number */}
        <div style={{ marginTop: '25px', textAlign: 'center', paddingBottom: '10px' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: colors.neutral50,
            border: `2px solid ${colors.brand}`,
            borderRadius: '8px',
            padding: '12px 24px',
            marginBottom: '8px'
          }}>
            <p style={{ 
              fontSize: '11px', 
              color: colors.neutral600,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Certificate ID
            </p>
            <p style={{ 
              fontSize: '13px', 
              color: colors.neutral900,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              fontWeight: 'bold',
              margin: '0 0 8px 0'
            }}>
              {certificateId}
            </p>
            <div style={{
              height: '1px',
              backgroundColor: colors.neutral300,
              margin: '8px 0'
            }}></div>
            <p style={{ 
              fontSize: '11px', 
              color: colors.brand,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Reference Number
            </p>
            <p style={{ 
              fontSize: '15px', 
              color: colors.brand,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              fontWeight: 'bold',
              margin: '0'
            }}>
              {refId}
            </p>
          </div>
          <p style={{ 
            fontSize: '11px', 
            color: colors.neutral600,
            margin: '8px 0 0 0'
          }}>
            Verify at ridermind.com/verify
          </p>
        </div>

        {/* Seal/Badge */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <div style={{ 
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: `linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%)`,
              borderRadius: '50%',
              boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.2)'
            }}></div>
            <div style={{ 
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              backgroundColor: colors.white,
              borderRadius: '50%'
            }}></div>
            <div style={{ 
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              background: `linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award style={{ width: '38px', height: '38px', color: colors.white }} />
            </div>
            {/* Star decorations around seal */}
            <Star style={{ position: 'absolute', top: '-10px', left: '50%', marginLeft: '-10px', width: '20px', height: '20px', color: colors.amber, fill: colors.amber }} />
            <Star style={{ position: 'absolute', bottom: '-10px', left: '50%', marginLeft: '-10px', width: '20px', height: '20px', color: colors.amber, fill: colors.amber }} />
            <Star style={{ position: 'absolute', top: '50%', left: '-10px', marginTop: '-10px', width: '20px', height: '20px', color: colors.amber, fill: colors.amber }} />
            <Star style={{ position: 'absolute', top: '50%', right: '-10px', marginTop: '-10px', width: '20px', height: '20px', color: colors.amber, fill: colors.amber }} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
});

Certificate.displayName = 'Certificate';

export default Certificate;

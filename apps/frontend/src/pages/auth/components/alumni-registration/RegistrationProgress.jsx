import React from 'react';

const RegistrationProgress = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Personal Identity' },
    { num: 2, label: 'Academic Background' },
    { num: 3, label: 'Professional Journey' },
    { num: 4, label: 'Review & Submit' }
  ];

  return (
    <div className="d-flex align-items-center justify-content-between mb-5 position-relative">
      {/* Progress Line Background */}
      <div 
        className="position-absolute" 
        style={{ 
          top: '20px', 
          left: '10%', 
          right: '10%', 
          height: '2px', 
          backgroundColor: 'var(--fr-border)', 
          zIndex: 1 
        }}
      ></div>

      {/* Active Progress Line */}
      <div 
        className="position-absolute" 
        style={{ 
          top: '20px', 
          left: '10%', 
          width: `${(Math.max(0, currentStep - 1) / 3) * 80}%`, 
          height: '2px', 
          backgroundColor: 'var(--fr-primary)', 
          boxShadow: '0 0 10px var(--fr-primary-glow)',
          transition: 'width 0.4s ease',
          zIndex: 2 
        }}
      ></div>

      {steps.map((step, index) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;

        return (
          <div key={index} className="d-flex flex-column align-items-center position-relative z-3" style={{ width: '25%' }}>
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center mb-2`}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: isActive || isCompleted ? 'var(--fr-card-bg)' : 'var(--fr-bg-secondary)',
                border: `2px solid ${isActive || isCompleted ? 'var(--fr-primary)' : 'var(--fr-border)'}`,
                boxShadow: isActive ? '0 0 15px var(--fr-primary-glow)' : 'none',
                color: isActive || isCompleted ? 'var(--fr-primary)' : 'var(--fr-text-muted)',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {isCompleted ? '✓' : step.num}
            </div>
            <div 
              className={`text-center ${isActive ? 'fw-bold' : ''}`}
              style={{
                fontSize: '0.75rem',
                color: isActive || isCompleted ? 'var(--fr-text-main)' : 'var(--fr-text-muted)',
                lineHeight: '1.2'
              }}
            >
              {step.label.split(' ').map((word, i) => (
                <span key={i} className="d-block">{word}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RegistrationProgress;

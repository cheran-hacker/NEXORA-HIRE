import React from 'react';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="vh-100 d-flex flex-column align-items-center justify-content-center text-center px-3" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-primary-subtle text-primary rounded-circle p-4 mb-4 d-inline-flex align-items-center justify-content-center shadow-sm">
          <Wrench size={64} />
        </div>
        <h1 className="fw-black text-foreground mb-3" style={{ fontSize: '3rem' }}>Under Maintenance</h1>
        <p className="lead text-muted mx-auto fw-medium" style={{ maxWidth: '500px' }}>
          NEXORA is currently undergoing scheduled maintenance to improve your experience. We'll be back shortly!
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn btn-primary rounded-pill px-5 py-3 mt-4 fw-bold shadow-sm hover-lift"
        >
          Check Again
        </button>
      </motion.div>
    </div>
  );
}

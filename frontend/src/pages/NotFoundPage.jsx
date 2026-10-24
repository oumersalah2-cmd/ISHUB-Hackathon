import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AlertCircle, Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'var(--butter-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--clay-500)',
          marginBottom: '1.25rem',
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        404 — Page Not Found
      </h2>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '1.5rem' }}>
        The page or ticket record you requested does not exist or has been relocated.
      </p>
      <Button variant="primary" icon={<Home size={16} />} onClick={() => navigate('/')}>
        Return to Dashboard
      </Button>
    </div>
  );
};

export default NotFoundPage;

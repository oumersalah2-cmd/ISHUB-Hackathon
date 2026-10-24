import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, FileText } from 'lucide-react';

const NewTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    order_id: '',
    purchase_date: '',
    shipping_date: '',
    subject: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend checks
    if (!form.customer_name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!form.customer_email.trim() || !form.customer_email.includes('@')) {
      setError('A valid customer email is required.');
      return;
    }
    if (!form.subject.trim()) {
      setError('Subject line is required.');
      return;
    }
    if (!form.description.trim()) {
      setError('Complaint description is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        order_id: form.order_id.trim() || null,
        purchase_date: form.purchase_date.trim() || null,
        shipping_date: form.shipping_date.trim() || null,
        subject: form.subject.trim(),
        description: form.description.trim(),
      };

      const res = await api.createTicket(payload);
      toast.success(
        `Ticket ${res.ticket?.id || res.ticket?.ticketNumber || 'created'} added successfully!`,
        'Ticket Created'
      );

      // Reset form
      setForm({
        customer_name: '',
        customer_email: '',
        order_id: '',
        purchase_date: '',
        shipping_date: '',
        subject: '',
        description: '',
      });

      onClose();
      if (onTicketCreated) {
        onTicketCreated(res.ticket);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err.message || 'Failed to submit new ticket.');
      toast.error(err.message || 'Submission failed', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer Support Ticket"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Ticket'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Enter a fresh customer complaint to test the AI agent's grounding, policy retrieval, and resolution proposals.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Customer Full Name *
            </label>
            <input
              type="text"
              name="customer_name"
              placeholder="e.g. John Doe"
              value={form.customer_name}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Customer Email *
            </label>
            <input
              type="email"
              name="customer_email"
              placeholder="e.g. john@example.com"
              value={form.customer_email}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Order ID (Optional)
            </label>
            <input
              type="text"
              name="order_id"
              placeholder="e.g. ORD-1006"
              value={form.order_id}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Purchase Date (Optional)
            </label>
            <input
              type="date"
              name="purchase_date"
              value={form.purchase_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Shipping Date (Optional)
            </label>
            <input
              type="date"
              name="shipping_date"
              value={form.shipping_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            placeholder="e.g. Request for refund on damaged item"
            value={form.subject}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Complaint Description *
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Enter customer message or problem description..."
            value={form.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
            required
          />
        </div>
      </form>
    </Modal>
  );
};

export default NewTicketModal;

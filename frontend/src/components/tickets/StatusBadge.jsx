import React from 'react';
import Badge from '../common/Badge';

export const StatusBadge = ({ status = 'open' }) => {
  const norm = (status || 'open').toLowerCase().replace(/\s+/g, '_');

  let variant = 'open';
  let label = status;

  switch (norm) {
    case 'open':
    case 'new':
    case 'unassigned':
      variant = 'open';
      label = 'Open';
      break;
    case 'investigating':
    case 'in_progress':
    case 'analyzing':
      variant = 'investigating';
      label = 'Investigating';
      break;
    case 'needs_clarification':
    case 'clarification_needed':
    case 'pending_customer':
    case 'waiting_info':
      variant = 'clarification';
      label = 'Needs Clarification';
      break;
    case 'approved':
    case 'resolved':
    case 'completed':
      variant = 'approved';
      label = 'Approved / Resolved';
      break;
    case 'closed':
      variant = 'closed';
      label = 'Closed';
      break;
    default:
      variant = 'clay';
      label = status;
  }

  return <Badge variant={variant}>{label}</Badge>;
};

export const PriorityBadge = ({ priority = 'medium' }) => {
  const norm = (priority || 'medium').toLowerCase();

  let variant = 'medium';
  let label = priority;

  switch (norm) {
    case 'urgent':
    case 'critical':
      variant = 'urgent';
      label = 'Urgent';
      break;
    case 'high':
      variant = 'high';
      label = 'High';
      break;
    case 'medium':
    case 'normal':
      variant = 'medium';
      label = 'Medium';
      break;
    case 'low':
      variant = 'low';
      label = 'Low';
      break;
    default:
      variant = 'medium';
      label = priority;
  }

  return (
    <Badge variant={variant} dot={false}>
      {label}
    </Badge>
  );
};

import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import Button from '../common/Button';

const TicketFilterBar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  onRefresh,
  loading = false,
  totalCount = 0,
}) => {
  return (
    <div className="filter-toolbar">
      <div className="filter-group-left">
        <div className="search-input-wrap">
          <Search className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search tickets by ID, subject, or customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="needs_clarification">Needs Clarification</option>
          <option value="approved">Approved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-group-right">
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {totalCount} {totalCount === 1 ? 'ticket' : 'tickets'}
        </span>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={14} className={loading ? 'spinner' : ''} />}
          onClick={onRefresh}
          disabled={loading}
          title="Refresh ticket queue from API"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default TicketFilterBar;

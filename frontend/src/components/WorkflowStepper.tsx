import React from 'react';
import { Search, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Database, Loader2 } from 'lucide-react';
import type { AgentStage } from '../types';

interface WorkflowStepperProps {
  currentStage: AgentStage;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ currentStage }) => {
  const steps = [
    {
      id: 'reading',
      label: 'Read Ticket',
      icon: FileText,
      activeWhen: ['reading_ticket'],
      completedWhen: ['searching_policies', 'checking_completeness', 'clarification_needed', 'proposal_ready', 'awaiting_approval', 'saving', 'saved']
    },
    {
      id: 'policies',
      label: 'Search Policies',
      icon: Search,
      activeWhen: ['searching_policies'],
      completedWhen: ['checking_completeness', 'clarification_needed', 'proposal_ready', 'awaiting_approval', 'saving', 'saved']
    },
    {
      id: 'completeness',
      label: 'Check Completeness',
      icon: AlertTriangle,
      activeWhen: ['checking_completeness', 'clarification_needed'],
      completedWhen: ['proposal_ready', 'awaiting_approval', 'saving', 'saved']
    },
    {
      id: 'proposal',
      label: 'Draft Proposal',
      icon: CheckCircle2,
      activeWhen: ['proposal_ready'],
      completedWhen: ['awaiting_approval', 'saving', 'saved']
    },
    {
      id: 'approval',
      label: 'Human Review',
      icon: ShieldCheck,
      activeWhen: ['awaiting_approval'],
      completedWhen: ['saving', 'saved']
    },
    {
      id: 'persist',
      label: 'Committed to D1',
      icon: Database,
      activeWhen: ['saving'],
      completedWhen: ['saved']
    }
  ];

  return (
    <div className="workflow-stepper">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.activeWhen.includes(currentStage);
        const isCompleted = step.completedWhen.includes(currentStage);

        let statusClass = '';
        if (isActive) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';

        return (
          <div key={step.id} className={`step-item ${statusClass}`}>
            <div className="step-icon">
              {isActive ? (
                <Loader2 size={13} className="spin" />
              ) : (
                <Icon size={13} />
              )}
            </div>
            <span>{step.label}</span>
            {idx < steps.length - 1 && (
              <span style={{ color: 'var(--border-color)', margin: '0 0.2rem' }}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

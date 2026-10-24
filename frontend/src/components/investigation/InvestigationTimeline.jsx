import React from 'react';
import { Check, Clock, Sparkles, BookOpen, Send } from 'lucide-react';

const InvestigationTimeline = ({ currentStage = 1 }) => {
  // Stages:
  // 1: Received / Queued
  // 2: AI Investigation In Progress
  // 3: Policy Grounding & Clarification
  // 4: Resolution Proposal Ready
  // 5: Final Human Approved

  const steps = [
    { number: 1, title: 'Received', icon: <Clock size={13} /> },
    { number: 2, title: 'AI Analysis', icon: <Sparkles size={13} /> },
    { number: 3, title: 'Grounding', icon: <BookOpen size={13} /> },
    { number: 4, title: 'Proposal', icon: <Check size={13} /> },
    { number: 5, title: 'Approved', icon: <Send size={13} /> },
  ];

  return (
    <div className="investigation-stepper">
      {steps.map((step, index) => {
        const isCompleted = currentStage > step.number;
        const isActive = currentStage === step.number;
        const itemClass = isCompleted ? 'completed' : isActive ? 'active' : '';

        return (
          <React.Fragment key={step.number}>
            <div className={`step-item ${itemClass}`}>
              <div className="step-node">
                {isCompleted ? <Check size={14} /> : step.icon}
              </div>
              <span className="step-title">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${currentStage > step.number ? 'active' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default InvestigationTimeline;

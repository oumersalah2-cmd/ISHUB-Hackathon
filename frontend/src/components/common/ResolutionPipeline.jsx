import React from 'react';
import { Inbox, Bot, FileCheck, CheckCircle, Layers } from 'lucide-react';

/**
 * Calculates (x, y) coordinates on a circle given center, radius, and angle in degrees (0 = 12 o'clock).
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Returns an SVG path string for a circular arc from startAngle to endAngle (clockwise).
 */
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const diff = (endAngle - startAngle + 360) % 360;
  const largeArcFlag = diff > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * Computes the 3 points of an arrowhead polygon at the given angle on the circle.
 */
function getArrowPoints(cx, cy, r, angleInDegrees, size = 9) {
  const tip = polarToCartesian(cx, cy, r, angleInDegrees);
  // Tangent angle in radians for clockwise direction
  const tangentRad = (angleInDegrees * Math.PI) / 180.0;
  const perpRad = tangentRad + Math.PI / 2;

  const backX = tip.x - Math.cos(tangentRad) * size;
  const backY = tip.y - Math.sin(tangentRad) * size;

  const leftX = backX + Math.cos(perpRad) * (size * 0.55);
  const leftY = backY + Math.sin(perpRad) * (size * 0.55);

  const rightX = backX - Math.cos(perpRad) * (size * 0.55);
  const rightY = backY - Math.sin(perpRad) * (size * 0.55);

  return `${tip.x},${tip.y} ${leftX},${leftY} ${rightX},${rightY}`;
}

const STEPS = [
  {
    step: 'STEP 1',
    title: 'Receive Ticket',
    description: 'Customer questions land in your inbox. Sort and open any ticket in one click.',
    icon: <Inbox size={26} color="#FFFFFF" strokeWidth={2.2} />,
    color: '#0084D4',
    dashedArc: { start: 120, end: 280 },
    solidArc: { start: 280, end: 55 },
    arrowAngle: 55,
  },
  {
    step: 'STEP 2',
    title: 'AI Checks Rules',
    description: 'Lucy reads your company policies and warranty rules to write an accurate draft.',
    icon: <Bot size={26} color="#FFFFFF" strokeWidth={2.2} />,
    color: '#F97316',
    dashedArc: { start: 230, end: 40 },
    solidArc: { start: 40, end: 165 },
    arrowAngle: 165,
  },
  {
    step: 'STEP 3',
    title: 'Review & Edit',
    description: 'Add missing details if prompted. Polish the wording so it sounds friendly.',
    icon: <FileCheck size={26} color="#FFFFFF" strokeWidth={2.2} />,
    color: '#1E293B',
    dashedArc: { start: 110, end: 260 },
    solidArc: { start: 260, end: 95 },
    arrowAngle: 95,
  },
  {
    step: 'STEP 4',
    title: 'Approve & Save',
    description: 'Confirm the solution with one click. Everything is safely stored in your Outbox.',
    icon: <CheckCircle size={26} color="#FFFFFF" strokeWidth={2.2} />,
    color: '#10B981',
    dashedArc: { start: 230, end: 35 },
    solidArc: { start: 35, end: 170 },
    arrowAngle: 170,
  },
];

const ResolutionPipeline = ({ className = '', style = {} }) => {
  const cx = 125;
  const cy = 125;
  const radius = 114;

  return (
    <div className={`resolution-pipeline-wrapper ${className}`} style={style}>
      {/* Centered Header Section */}
      <div className="pipeline-header">
        <div className="pipeline-badge">
          <Layers size={13} color="#D97706" />
          <span>RESOLUTION PIPELINE</span>
        </div>
        <h2 className="pipeline-heading">How Lucy Resolves Tickets</h2>
        <p className="pipeline-subheading">
          From customer request to approved solution in four connected steps.
        </p>
      </div>

      {/* 4 Connected Circular Steps */}
      <div className="pipeline-steps-grid">
        {STEPS.map((step, idx) => {
          const dashedPath = describeArc(cx, cy, radius, step.dashedArc.start, step.dashedArc.end);
          const solidPath = describeArc(cx, cy, radius, step.solidArc.start, step.solidArc.end);
          const arrowPoints = getArrowPoints(cx, cy, radius, step.arrowAngle, 9);

          return (
            <div key={idx} className="pipeline-circle-container">
              {/* Outer SVG orbital ring with dashed and solid directional arc */}
              <svg
                className="pipeline-orbital-svg"
                width="250"
                height="250"
                viewBox="0 0 250 250"
                aria-hidden="true"
              >
                {/* Dashed Arc */}
                <path
                  d={dashedPath}
                  fill="none"
                  stroke={step.color}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {/* Solid Arc */}
                <path
                  d={solidPath}
                  fill="none"
                  stroke={step.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Arrowhead */}
                <polygon
                  points={arrowPoints}
                  fill={step.color}
                />
              </svg>

              {/* Inner Solid Circle Card */}
              <div
                className="pipeline-solid-circle"
                style={{ backgroundColor: step.color }}
              >
                <div className="pipeline-icon-box">{step.icon}</div>
                <div className="pipeline-step-badge">{step.step}</div>
                <h3 className="pipeline-step-title">{step.title}</h3>
                <p className="pipeline-step-desc">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResolutionPipeline;

import React from 'react';

const statuses = ['Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

export default function OrderTracker({ currentStatus }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="order-cancelled-banner">
        <span className="cancelled-icon">✕</span>
        <span>Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="order-tracker">
      {statuses.map((status, index) => (
        <div
          key={status}
          className={`tracker-step ${index < currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}`}
        >
          <div className="step-circle">
            {index < currentIndex ? '✓' : index + 1}
          </div>
          <span className="step-label">{status}</span>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { Package, Clock, ShoppingBag, CheckCircle } from 'lucide-react';
import '../../assets/styles/OrderTracker.css';

const milestones = [
  { id: 'Order Placed', label: 'Placed', icon: ShoppingBag },
  { id: 'In Transit', label: 'Transit', icon: Clock },
  { id: 'Out for Delivery', label: 'Out', icon: Package },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

const OrderTracker = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="order-tracker-container cancelled-tracker">
        <div className="cancelled-notice">
          <div className="cancelled-line"></div>
          <span>This order has been cancelled</span>
        </div>
      </div>
    );
  }

  const currentStep = milestones.findIndex(m => m.id === status);
  const progressPercentage = (currentStep / (milestones.length - 1)) * 100;

  return (
    <div className="order-tracker-container">
      <div className="milestones-row">
        {/* The Continuous Track */}
        <div className="tracker-line-bg">
          <div 
            className="tracker-line-progress" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isActive = index <= currentStep;

          return (
            <div 
              key={milestone.id} 
              className={`milestone-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="milestone-icon-wrapper">
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={16} />}
              </div>
              <span className="milestone-label">{milestone.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;

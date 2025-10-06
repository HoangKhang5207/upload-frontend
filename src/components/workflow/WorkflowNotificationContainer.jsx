import React from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowNotification from './WorkflowNotification';

const WorkflowNotificationContainer = () => {
  const { state, dispatch } = useWorkflow();
  
  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  if (state.notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.notifications.map((notification) => (
        <WorkflowNotification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          autoDismiss={notification.autoDismiss}
          dismissTime={notification.dismissTime}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default WorkflowNotificationContainer;
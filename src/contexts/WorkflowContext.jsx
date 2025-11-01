import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  workflows: [],
  selectedWorkflow: null,
  loading: false,
  error: null,
  // notifications: []
};

// Action types
export const actionTypes = {
  SET_WORKFLOWS: 'SET_WORKFLOWS',
  SET_SELECTED_WORKFLOW: 'SET_SELECTED_WORKFLOW',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  // ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  // REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer
const workflowReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_WORKFLOWS:
      return {
        ...state,
        workflows: action.payload,
        loading: false,
        error: null,
      };
    case actionTypes.SET_SELECTED_WORKFLOW:
      return {
        ...state,
        selectedWorkflow: action.payload,
        loading: false,
        error: null,
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    // case actionTypes.ADD_NOTIFICATION:
    //   return {
    //     ...state,
    //     notifications: [...state.notifications, action.payload]
    //   };
    // case actionTypes.REMOVE_NOTIFICATION:
    //   return {
    //     ...state,
    //     notifications: state.notifications.filter(notification => notification.id !== action.payload)
    //   };
    default:
      return state;
  }
};

// Create context
const WorkflowContext = createContext();

// Provider component
export const WorkflowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  return (
    <WorkflowContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Custom hook to use the context
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export default WorkflowContext;
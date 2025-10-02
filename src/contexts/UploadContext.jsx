import React, { createContext, useReducer, useContext } from 'react';

// --- Định nghĩa State ban đầu cho toàn bộ luồng upload ---
const initialState = {
    step: 1, // 1: Select file, 2: Processing, 3: Review, 4: Result
    file: null,
    uploadProgress: 0,
    processingSteps: [],
    isLoading: false,
    permissions: null,
    categories: [],
    metadata: {
        title: '',
        category: '',
        tags: [],
        accessType: 'private',
        confidentiality: 'INTERNAL',
        key_values: {},
    },
    // Lưu trữ toàn bộ kết quả trả về từ API xử lý file
    apiResponse: {
        ocrContent: '',
        suggestedMetadata: {},
        warnings: [],
        conflicts: [], // Dành cho việc kiểm tra mâu thuẫn
        denoiseInfo: null, // Dành cho kết quả khử nhiễu
        watermarkInfo: null,
    },
    // Lưu kết quả cuối cùng sau khi hoàn tất upload
    uploadResult: null, 
};

// --- Định nghĩa các loại Action để thay đổi State ---
export const actionTypes = {
    SET_STEP: 'SET_STEP',
    SET_FILE: 'SET_FILE',
    UPDATE_PROGRESS: 'UPDATE_PROGRESS',
    SET_PROCESSING_STEPS: 'SET_PROCESSING_STEPS',
    UPDATE_STEP_STATUS: 'UPDATE_STEP_STATUS',
    SET_METADATA: 'SET_METADATA',
    UPDATE_METADATA_FIELD: 'UPDATE_METADATA_FIELD',
    SET_API_RESPONSE: 'SET_API_RESPONSE',
    SET_UPLOAD_RESULT: 'SET_UPLOAD_RESULT',
    SET_INITIAL_DATA: 'SET_INITIAL_DATA',
    RESET_STATE: 'RESET_STATE',
};

// --- Reducer: Bộ xử lý trung tâm cho các Action ---
const uploadReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_STEP:
            return { ...state, step: action.payload };
        
        case actionTypes.SET_FILE:
            return { ...state, file: action.payload, metadata: { ...state.metadata, title: action.payload?.name || '' } };

        case actionTypes.UPDATE_PROGRESS:
            return { ...state, uploadProgress: action.payload };

        case actionTypes.SET_PROCESSING_STEPS:
            return { ...state, processingSteps: action.payload };

        case actionTypes.UPDATE_STEP_STATUS: {
            const { stepIndex, status, progress } = action.payload;
            const newSteps = [...state.processingSteps];
            newSteps[stepIndex] = { ...newSteps[stepIndex], status, progress: progress ?? newSteps[stepIndex].progress };
            return { ...state, processingSteps: newSteps };
        }

        case actionTypes.SET_METADATA:
            return { ...state, metadata: { ...state.metadata, ...action.payload } };
        
        case actionTypes.UPDATE_METADATA_FIELD: {
            const { field, value } = action.payload;
            return { ...state, metadata: { ...state.metadata, [field]: value } };
        }

        case actionTypes.SET_API_RESPONSE:
            return { ...state, apiResponse: action.payload };

        case actionTypes.SET_UPLOAD_RESULT:
            return { ...state, uploadResult: action.payload };

        case actionTypes.SET_INITIAL_DATA:
            return { ...state, ...action.payload };

        case actionTypes.RESET_STATE:
            return {
                ...initialState,
                // Giữ lại dữ liệu không cần fetch lại
                categories: state.categories,
                permissions: state.permissions,
            };

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

// --- Tạo Context ---
const UploadContext = createContext(null);

// --- Tạo Provider Component ---
export const UploadProvider = ({ children }) => {
    const [state, dispatch] = useReducer(uploadReducer, initialState);

    const value = { state, dispatch };

    return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};

// --- Tạo Custom Hook để sử dụng Context dễ dàng hơn ---
export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};
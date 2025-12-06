import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

// --- Authentication ---
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

// --- Layout & Home ---
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';

// --- Use Case Pages ---
import UC39_UploadPage from './pages/upload/UC39_UploadPage';
import UC73_SuggestMetadataPage from './pages/upload/UC73_SuggestMetadataPage';
import UC84_AutoRoutePage from './pages/upload/UC84_AutoRoutePage';
import UC87_OcrProcessingPage from './pages/upload/UC87_OcrProcessingPage';
import UC88_DuplicateCheckPage from './pages/upload/UC88_DuplicateCheckPage';
import DocumentAccessPage from './pages/DocumentAccessPage'; // Trang gộp UC-85 & UC-86

// --- BPMN Management Pages ---
import BpmnManagementPage from './pages/bpmn/BpmnManagementPage';
import BpmnViewerPage from './pages/bpmn/BpmnViewerPage';
import BpmnEditorPage from './pages/bpmn/BpmnEditorPage';
import BpmnCreatePage from './pages/bpmn/BpmnCreatePage';
import BpmnModelerPage from './pages/workflow/BpmnModelerPage';

// --- Workflow Pages ---
import WorkflowListPage from './pages/workflow/WorkflowListPage';

// --- Context Providers ---
import { UploadProvider } from './contexts/UploadContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Header />
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<HomePage />} />
            
            <Route 
              path="/bpmn-modeler" 
              element={<BpmnModelerPage />} 
            />
            <Route 
              path="/bpmn-modeler/:id" 
              element={<BpmnModelerPage />} 
            />
            <Route 
              path="/bpmn-viewer/:id" 
              element={<BpmnViewerPage />} 
            />
            
            {/* (CẬP NHẬT) Bọc UC39_UploadPage bằng UploadProvider */}
            <Route 
              path="/uc39-upload-workflow" 
              element={
                <UploadProvider>
                  <UC39_UploadPage />
                </UploadProvider>
              } 
            />

            {/* BPMN Management Routes */}
            <Route path="/bpmn" element={<BpmnManagementPage />} />
            <Route path="/bpmn/create" element={<BpmnCreatePage />} />
            <Route path="/bpmn/:id" element={<BpmnViewerPage />} />
            <Route path="/bpmn/:id/edit" element={<BpmnEditorPage />} />

            {/* Workflow Routes */}
            <Route path="/workflow" element={<WorkflowListPage />} />
            <Route path="/workflows" element={<Navigate to="/workflow" replace />} />

            {/* Các trang demo tính năng riêng lẻ */}
            <Route path="/uc73-suggest-metadata" element={<UC73_SuggestMetadataPage />} />
            <Route path="/uc84-auto-route" element={<UC84_AutoRoutePage />} />
            <Route path="/uc87-ocr-processing" element={<UC87_OcrProcessingPage />} />
            <Route path="/uc88-duplicate-check" element={<UC88_DuplicateCheckPage />} />
          </Route>

          {/* Protected Routes without MainLayout */}
          <Route path="/document/access/:docId" element={
            <ProtectedRoute>
              <DocumentAccessPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
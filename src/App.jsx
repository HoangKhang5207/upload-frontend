import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// --- Workflow Management Pages ---
import WorkflowDashboardPage from './pages/workflow/WorkflowDashboardPage';
import WorkflowManagementPage from './pages/workflow/WorkflowManagementPage';
import BpmnModelerPage from './pages/workflow/BpmnModelerPage';
import WorkflowListPage from './pages/workflow/WorkflowListPage';
import StartWorkflowPage from './pages/workflow/StartWorkflowPage';
import WorkflowDocumentationPage from './pages/workflow/WorkflowDocumentationPage';
import WorkflowDetailPage from './pages/workflow/WorkflowDetailPage';

// --- Components ---
import WorkflowErrorBoundary from './components/workflow/WorkflowErrorBoundary';

// --- Context Providers ---
import { UploadProvider } from './contexts/UploadContext';

function App() {
  return (
    <Router>
      <Routes>
        {/* Luồng chính của ứng dụng có Layout (header, footer...) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          
          {/* Workflow Management Pages */}
          <Route 
            path="/workflow-dashboard" 
            element={
              <WorkflowErrorBoundary>
                <WorkflowDashboardPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/workflow-management" 
            element={
              <WorkflowErrorBoundary>
                <WorkflowManagementPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/bpmn-modeler" 
            element={
              <WorkflowErrorBoundary>
                <BpmnModelerPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/bpmn-modeler/:id" 
            element={
              <WorkflowErrorBoundary>
                <BpmnModelerPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/bpmn-modeler/:id/edit" 
            element={
              <WorkflowErrorBoundary>
                <BpmnModelerPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/workflow-list" 
            element={
              <WorkflowErrorBoundary>
                <WorkflowListPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/workflow-detail/:id" 
            element={
              <WorkflowErrorBoundary>
                <WorkflowDetailPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/start-workflow/:type" 
            element={
              <WorkflowErrorBoundary>
                <StartWorkflowPage />
              </WorkflowErrorBoundary>
            } 
          />
          <Route 
            path="/workflow-documentation" 
            element={
              <WorkflowErrorBoundary>
                <WorkflowDocumentationPage />
              </WorkflowErrorBoundary>
            } 
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

          {/* Các trang demo tính năng riêng lẻ */}
          <Route path="/uc73-suggest-metadata" element={<UC73_SuggestMetadataPage />} />
          <Route path="/uc84-auto-route" element={<UC84_AutoRoutePage />} />
          <Route path="/uc87-ocr-processing" element={<UC87_OcrProcessingPage />} />
          <Route path="/uc88-duplicate-check" element={<UC88_DuplicateCheckPage />} />
        </Route>

        {/* Luồng truy cập tài liệu không cần Layout chung */}
        {/* Đây là trang mà người dùng bên ngoài sẽ truy cập qua link chia sẻ */}
        <Route path="/document/access/:docId" element={<DocumentAccessPage />} />

      </Routes>
    </Router>
  );
}

export default App;
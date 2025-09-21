import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Layout & Home ---
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';

// --- Use Case Pages ---
import UC39_UploadPage from './pages/UC39_UploadPage';
import UC73_SuggestMetadataPage from './pages/UC73_SuggestMetadataPage';
import UC84_AutoRoutePage from './pages/UC84_AutoRoutePage';
import UC87_OcrProcessingPage from './pages/UC87_OcrProcessingPage';
import UC88_DuplicateCheckPage from './pages/UC88_DuplicateCheckPage';
import DocumentAccessPage from './pages/DocumentAccessPage'; // Trang gộp UC-85 & UC-86

function App() {
  return (
    <Router>
      <Routes>
        {/* Luồng chính của ứng dụng có Layout (header, footer...) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          
          {/* Trang tổng hợp quy trình Upload */}
          <Route path="/uc39-upload-workflow" element={<UC39_UploadPage />} />

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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage'; // UC-39
import OcrProcessingPage from './pages/OcrProcessingPage'; // UC-87
import SuggestMetadataPage from './pages/SuggestMetadataPage'; // UC-73
import DuplicateCheckPage from './pages/DuplicateCheckPage'; // UC-88
import DocumentViewerPage from './pages/DocumentViewerPage'; // UC-85 & UC-86

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        {/* Có thể thêm Layout chung (Navbar, Sidebar) ở đây */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/ocr" element={<OcrProcessingPage />} />
          <Route path="/suggest-metadata" element={<SuggestMetadataPage />} />
          <Route path="/check-duplicates" element={<DuplicateCheckPage />} />
          <Route path="/viewer/:docId" element={<DocumentViewerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
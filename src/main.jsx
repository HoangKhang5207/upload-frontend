import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN'; // Import ngôn ngữ Tiếng Việt

import 'antd/dist/reset.css'; // Import CSS reset của Antd
import './index.css'; // Import file css trống của chúng ta (hoặc custom)

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={viVN} // Cấu hình ngôn ngữ global là Tiếng Việt
      theme={{
        // Đây là nơi em có thể tùy chỉnh theme sau này
        token: {
          colorPrimary: '#00b96b', // Ví dụ: đổi màu chính
        },
      }}
    >
      <AntApp> {/* Component này RẤT QUAN TRỌNG để notification, message hoạt động */}
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
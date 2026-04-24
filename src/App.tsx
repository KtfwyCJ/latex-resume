import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import TemplateGallery from './components/TemplateGallery';
import templates from './templates';

function AppRoutes() {
  const navigate = useNavigate();
  const [latexSource, setLatexSource] = useState('');

  const handleParsed = (latex: string) => {
    setLatexSource(latex);
    navigate('/editor');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage onParsed={handleParsed} onOpenGallery={() => navigate('/gallery')} />}
      />
      <Route
        path="/gallery"
        element={<TemplateGallery templates={templates} onSelect={handleParsed} onBack={() => navigate('/')} />}
      />
      <Route
        path="/editor"
        element={
          latexSource
            ? <EditorPage initialLatex={latexSource} onBack={() => { setLatexSource(''); navigate(-1); }} />
            : <Navigate to="/" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

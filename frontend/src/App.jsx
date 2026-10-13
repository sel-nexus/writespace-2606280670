import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BlogListPage from './pages/BlogListPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import WritePage from './pages/WritePage.jsx';

/** Define the single client-side router for WriteSpace.
 * @returns {JSX.Element} Application route tree.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<ProtectedRoute><BlogListPage /></ProtectedRoute>} path="/blogs" />
        <Route element={<ProtectedRoute><BlogDetailPage /></ProtectedRoute>} path="/blog/:id" />
        <Route element={<ProtectedRoute><WritePage /></ProtectedRoute>} path="/write" />
        <Route element={<ProtectedRoute><WritePage /></ProtectedRoute>} path="/edit/:id" />
        <Route element={<ProtectedRoute role="admin"><div className="p-8">Administrator workspace is loading.</div></ProtectedRoute>} path="/admin" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

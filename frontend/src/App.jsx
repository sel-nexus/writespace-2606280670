import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
        <Route element={<ProtectedRoute><div className="p-8">Blog workspace is loading.</div></ProtectedRoute>} path="/blogs" />
        <Route element={<ProtectedRoute role="admin"><div className="p-8">Administrator workspace is loading.</div></ProtectedRoute>} path="/admin" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

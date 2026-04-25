import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PlaceDetail from './pages/PlaceDetail';
import OptimizerPage from './pages/OptimizerPage';
import DashboardPage from './pages/DashboardPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/optimizer" element={<OptimizerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

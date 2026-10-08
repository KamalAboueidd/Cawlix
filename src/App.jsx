import { useState, useEffect } from 'react';
import { AuthProvider, ProtectedRoute, PublicOnlyRoute } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import TrueCostPage from './pages/engines/TrueCostPage';
import GhostAuditorPage from './pages/engines/GhostAuditorPage';
import LandedCostPage from './pages/engines/LandedCostPage';
import AnomalyRadarPage from './pages/engines/AnomalyRadarPage';
import CoveragePage from './pages/network/CoveragePage';
import BlogIndexPage from './pages/blog/BlogIndexPage';
import DocsPage from './pages/docs/DocsPage';
import WhiteFridayFakeDiscountsPage from './pages/blog/WhiteFridayFakeDiscountsPage';
import ConsumersPage from './pages/solutions/ConsumersPage';
import MerchantsPage from './pages/solutions/MerchantsPage';
import ChangelogPage from './pages/ChangelogPage';
import NotFoundPage from './pages/NotFoundPage';
import TrackerPage from './pages/TrackerPage';
import ConsolePage from './pages/console/ConsolePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function AppRoutes() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const cleanRoute = (route.length > 1 ? route.replace(/\/+$/, '') : route) || '/';

  if (cleanRoute === '/pricing') {
    return <PricingPage />;
  }

  if (cleanRoute === '/engines/true-cost') {
    return <TrueCostPage />;
  }

  if (cleanRoute === '/engines/ghost-auditor') {
    return <GhostAuditorPage />;
  }

  if (cleanRoute === '/engines/landed-cost') {
    return <LandedCostPage />;
  }

  if (cleanRoute === '/engines/anomaly-radar') {
    return <AnomalyRadarPage />;
  }

  if (cleanRoute === '/network/coverage') {
    return <CoveragePage />;
  }

  if (cleanRoute === '/blog') {
    return <BlogIndexPage />;
  }

  if (cleanRoute === '/blog/white-friday-fake-discounts') {
    return <WhiteFridayFakeDiscountsPage />;
  }

  if (cleanRoute === '/solutions/consumers' || cleanRoute === '/solutions/power-shoppers') {
    return <ConsumersPage />;
  }

  if (cleanRoute === '/solutions/merchants' || cleanRoute === '/solutions/retailers' || cleanRoute === '/solutions/arbitrage') {
    return <MerchantsPage />;
  }

  if (cleanRoute === '/changelog') {
    return <ChangelogPage />;
  }

  if (cleanRoute === '/docs') {
    return <DocsPage />;
  }

  if (cleanRoute === '/tracker') {
    return <TrackerPage />;
  }

  if (cleanRoute === '/console' || cleanRoute.startsWith('/console/') || cleanRoute === '/dashboard' || cleanRoute.startsWith('/dashboard/')) {
    return (
      <ProtectedRoute>
        <ConsolePage />
      </ProtectedRoute>
    );
  }

  if (cleanRoute === '/login') {
    return (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    );
  }

  if (cleanRoute === '/register') {
    return (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    );
  }

  if (cleanRoute === '/forgot-password') {
    return (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    );
  }

  if (cleanRoute === '/404') {
    return <NotFoundPage />;
  }

  if (cleanRoute === '/' || cleanRoute === '') {
    return <LandingPage />;
  }

  return <NotFoundPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}


import { useState, useEffect } from 'react';
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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route === '/pricing') {
    return <PricingPage />;
  }

  if (route === '/engines/true-cost') {
    return <TrueCostPage />;
  }

  if (route === '/engines/ghost-auditor') {
    return <GhostAuditorPage />;
  }

  if (route === '/engines/landed-cost') {
    return <LandedCostPage />;
  }

  if (route === '/engines/anomaly-radar') {
    return <AnomalyRadarPage />;
  }

  if (route === '/network/coverage') {
    return <CoveragePage />;
  }

  if (route === '/blog') {
    return <BlogIndexPage />;
  }

  if (route === '/blog/white-friday-fake-discounts') {
    return <WhiteFridayFakeDiscountsPage />;
  }

  if (route === '/solutions/consumers' || route === '/solutions/power-shoppers') {
    return <ConsumersPage />;
  }

  if (route === '/solutions/merchants' || route === '/solutions/retailers' || route === '/solutions/arbitrage') {
    return <MerchantsPage />;
  }

  if (route === '/changelog') {
    return <ChangelogPage />;
  }

  if (route === '/docs') {
    return <DocsPage />;
  }

  if (route === '/tracker') {
    return <TrackerPage />;
  }

  if (route === '/login') {
    return <LoginPage />;
  }

  if (route === '/register') {
    return <RegisterPage />;
  }

  if (route === '/404') {
    return <NotFoundPage />;
  }

  if (route === '/' || route === '') {
    return <LandingPage />;
  }

  return <NotFoundPage />;
}


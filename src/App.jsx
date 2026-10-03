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

  if (route === '/docs') {
    return <DocsPage />;
  }

  return <LandingPage />;
}


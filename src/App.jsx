import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import TrueCostPage from './pages/engines/TrueCostPage';
import GhostAuditorPage from './pages/engines/GhostAuditorPage';
import LandedCostPage from './pages/engines/LandedCostPage';

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

  return <LandingPage />;
}


import React, { useState, useEffect } from 'react';
import {
  Citizen,
  Application,
  ConsentPermission,
  AuditActivity,
  DigiLockerMockDocument,
  ServiceItem,
} from './types';
import { adapterStore } from './services/adapterStore';
import { MOCK_SERVICES } from './data/mockData';

// Common Components
import { Header } from './components/common/Header';
import { Navbar, NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HowItWorksModal } from './components/common/HowItWorksModal';

// Pages & Modals
import { DashboardPage } from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { DataConsentPage } from './pages/DataConsentPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingModal } from './pages/OnboardingModal';
import { ApplicationFlowModal } from './pages/ApplicationFlowModal';
import { AuthModal } from './components/common/AuthModal';

export const App: React.FC = () => {
  // Store States
  const [citizen, setCitizen] = useState<Citizen>(() => adapterStore.getCitizen());
  const [applications, setApplications] = useState<Application[]>(() => adapterStore.getApplications());
  const [permissions, setPermissions] = useState<ConsentPermission[]>(() => adapterStore.getPermissions());
  const [activities, setActivities] = useState<AuditActivity[]>(() => adapterStore.getActivities());
  const [digiLockerDocs, setDigiLockerDocs] = useState<DigiLockerMockDocument[]>(() => adapterStore.getDigiLockerDocs());

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal States
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedServiceForApply, setSelectedServiceForApply] = useState<ServiceItem | null>(null);
  const [selectedAppIdForTracking, setSelectedAppIdForTracking] = useState<string | null>(null);

  // Subscribe to adapter store changes and 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthModalOpen(true);
    };
    window.addEventListener('sevasetu-unauthorized', handleUnauthorized);

    const unsubscribe = adapterStore.subscribe(() => {
      setCitizen(adapterStore.getCitizen());
      setApplications(adapterStore.getApplications());
      setPermissions(adapterStore.getPermissions());
      setActivities(adapterStore.getActivities());
      setDigiLockerDocs(adapterStore.getDigiLockerDocs());
    });

    return () => {
      window.removeEventListener('sevasetu-unauthorized', handleUnauthorized);
      unsubscribe();
    };
  }, []);

  // Handlers
  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceForApply(service);
  };

  const handleApplicationSubmitted = (newApp: Application) => {
    // Already saved to adapterStore in modal
  };

  const handleTrackApplication = (appId: string) => {
    setSelectedAppIdForTracking(appId);
    setActiveTab('applications');
  };

  const handleResetDemo = () => {
    adapterStore.resetDemoData();
    setSelectedAppIdForTracking(null);
    setSelectedServiceForApply(null);
  };

  const activeConsentCount = permissions.filter((p) => p.status === 'Active').length;
  const activeAppsCount = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Verification' || a.status === 'Under Review'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header with Platform Notice */}
      <Header
        citizen={citizen}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main 6-tab Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeAppsCount={activeAppsCount}
        activeConsentCount={activeConsentCount}
      />

      {/* Main Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            citizen={citizen}
            applications={applications}
            permissions={permissions}
            activities={activities}
            services={MOCK_SERVICES}
            onSelectService={handleSelectService}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectApplication={(app) => {
              setSelectedAppIdForTracking(app.id);
              setActiveTab('applications');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          />
        )}

        {activeTab === 'services' && (
          <ServicesPage
            services={MOCK_SERVICES}
            onSelectService={handleSelectService}
          />
        )}

        {activeTab === 'applications' && (
          <MyApplicationsPage
            applications={applications}
            selectedAppId={selectedAppIdForTracking}
            onClearSelectedApp={() => setSelectedAppIdForTracking(null)}
            citizen={citizen}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityPage activities={activities} />
        )}

        {activeTab === 'consent' && (
          <DataConsentPage
            permissions={permissions}
            activities={activities}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            citizen={citizen}
            digiLockerDocs={digiLockerDocs}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onResetDemo={handleResetDemo}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={() => {
              adapterStore.logout();
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Global Interactive Modals */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        citizen={citizen}
        onConnectDigiLocker={() => adapterStore.connectDigiLocker()}
        onDisconnectDigiLocker={() => adapterStore.disconnectDigiLocker()}
      />

      <ApplicationFlowModal
        isOpen={selectedServiceForApply !== null}
        service={selectedServiceForApply}
        onClose={() => setSelectedServiceForApply(null)}
        citizen={citizen}
        digiLockerDocs={digiLockerDocs}
        onApplicationSubmitted={handleApplicationSubmitted}
        onTrackApplication={handleTrackApplication}
      />

      {/* Auth & Persona Switch Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={citizen}
        onAuthSuccess={(updatedCitizen) => {
          setCitizen(updatedCitizen);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;

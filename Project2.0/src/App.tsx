/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MainDashboardView } from './components/MainDashboardView';
import { ForestManagement } from './components/ForestManagement';
import { LiveMediaMonitoring } from './components/LiveMediaMonitoring';
import { CitizenPortal } from './components/CitizenPortal';
import { EmailArchitectureView } from './components/EmailArchitectureView';
import { Forest, Citizen, ActiveAlert } from './types/livingLens';
import type { ExtractedMediaFeatures } from './types/livingLens';
import { loadStoredForests, saveForests } from './utils/forestData';
import { loadStoredCitizens, saveCitizens } from './utils/geoUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem('living-lens-theme') === 'dark'
  );

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('living-lens-theme', theme);
  }, [isDarkMode]);

  // 1. Forests state (55+ forests across India, West Bengal featured)
  const [forests, setForests] = useState<Forest[]>(() => loadStoredForests());
  const [selectedForest, setSelectedForest] = useState<Forest>(() => {
    const list = loadStoredForests();
    return list[0]; // Sundarbans National Park
  });

  // 2. Citizens state
  const [citizens, setCitizens] = useState<Citizen[]>(() => loadStoredCitizens());
  const [activeCitizenId, setActiveCitizenId] = useState<string>('citizen-rahul-01');

  // 3. Disaster Probability & Alert Radius
  const [disasterProbability, setDisasterProbability] = useState<number>(0);
  const [alertRadiusKm, setAlertRadiusKm] = useState<number>(90); // Default 90 km
  const [lastObservation, setLastObservation] = useState<{ forestId: string; animalSpecies: string; observedBehavior: string; observationTime: string } | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);

  useEffect(() => {
    setActiveAlerts((current) => current.map((alert) => ({ ...alert, alertRadiusKm })));
  }, [alertRadiusKm]);

  // Add Forest handler
  const handleAddForest = (newForest: Forest) => {
    const updated = [newForest, ...forests];
    setForests(updated);
    saveForests(updated);
    setSelectedForest(newForest);
  };

  // Launch live media monitoring for specific forest
  const handleSelectForDemo = (forest: Forest) => {
    setSelectedForest(forest);
    setActiveTab('media_monitoring');
  };

  // Register citizen handler
  const handleRegisterCitizen = (newCitizenData: Omit<Citizen, 'id'>) => {
    const newCitizen: Citizen = {
      ...newCitizenData,
      id: `citizen-custom-${Date.now()}`,
    };
    const updated = [...citizens, newCitizen];
    setCitizens(updated);
    saveCitizens(updated);
    setActiveCitizenId(newCitizen.id);
  };

  // Active Alert object for citizen portal
  const activeAlert: ActiveAlert = useMemo(() => {
    const isAlert = disasterProbability > 50;
    return {
      zone_id: selectedForest.id,
      zone_name: selectedForest.name,
      latitude: selectedForest.latitude,
      longitude: selectedForest.longitude,
      timestamp: new Date().toTimeString().split(' ')[0],
      riskScore: Math.round(disasterProbability),
      disasterProbability: disasterProbability,
      alertRadiusKm: alertRadiusKm,
      hazardCategories: ['Earthquake', 'Cyclone', 'Flood', 'Wildfire'],
      detectedSignals: [
        ...(disasterProbability > 0 ? [`Risk estimate: ${disasterProbability.toFixed(1)}%`] : []),
      ],
      status: isAlert ? 'ACTIVE' : 'STANDBY',
    };
  }, [selectedForest, disasterProbability, alertRadiusKm]);

  return (
    <div className="min-h-screen bg-[#eef2e9] text-[#203a30] flex flex-col font-sans selection:bg-[#dce8b5] selection:text-[#203a30]">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((darkMode) => !darkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-5 sm:px-8 py-8">
        {/* Tab 1: Main Dashboard (FORESTS → LIVE SENSOR DATA → AI ANALYSIS → PROBABILITY → ALERTS) */}
        {activeTab === 'dashboard' && (
          <MainDashboardView
            forests={forests}
            citizens={citizens}
            selectedForest={selectedForest}
            onSelectForest={setSelectedForest}
            disasterProbability={disasterProbability}
            alertRadiusKm={alertRadiusKm}
            onRadiusChange={setAlertRadiusKm}
            onNavigateTab={setActiveTab}
            onSelectCitizen={setActiveCitizenId}
            lastObservation={lastObservation}
            activeAlerts={activeAlerts}
          />
        )}

        {/* Tab 2: Forest Management (55+ India Forests & Add Forest) */}
        {activeTab === 'forests' && (
          <ForestManagement
            forests={forests}
            onAddForest={handleAddForest}
            onSelectForDemo={handleSelectForDemo}
            selectedForestId={selectedForest.id}
            onSelectForest={setSelectedForest}
            disasterProbability={disasterProbability}
            alertRadiusKm={alertRadiusKm}
            lastObservation={lastObservation}
            activeAlerts={activeAlerts}
          />
        )}

        {/* Tab 3: Dedicated Live Media Monitoring & Upload AI Section */}
        {activeTab === 'media_monitoring' && (
          <LiveMediaMonitoring
            forests={forests}
            citizens={citizens}
            alertRadiusKm={alertRadiusKm}
            onRadiusChange={setAlertRadiusKm}
            onTriggerAlert={(forest, prob, features?: ExtractedMediaFeatures) => {
              const observationTime = new Date().toISOString();
              setSelectedForest(forest);
              setDisasterProbability(prob);
              setLastObservation({
                forestId: forest.id,
                animalSpecies: features?.species_detected || 'Not provided',
                observedBehavior: features?.observed_behavior || 'Unclear',
                observationTime,
              });
              setActiveAlerts((current) => {
                const unresolvedElsewhere = current.filter((alert) => alert.zone_id !== forest.id);
                if (prob <= 50) return unresolvedElsewhere;
                return [...unresolvedElsewhere, {
                  zone_id: forest.id,
                  zone_name: forest.name,
                  latitude: forest.latitude,
                  longitude: forest.longitude,
                  timestamp: observationTime,
                  observationTime,
                  animalSpecies: features?.species_detected || 'Not provided',
                  observedBehavior: features?.observed_behavior || 'Unclear',
                  riskScore: Math.round(prob),
                  disasterProbability: prob,
                  alertRadiusKm,
                  hazardCategories: [],
                  detectedSignals: [],
                  status: 'ACTIVE',
                }];
              });
            }}
          />
        )}

        {/* Tab 4: Citizen Alert Portal & Registration */}
        {activeTab === 'citizens' && (
          <CitizenPortal
            citizens={citizens}
            activeCitizenId={activeCitizenId}
            onSelectCitizen={setActiveCitizenId}
            onRegisterCitizen={handleRegisterCitizen}
            activeAlert={activeAlert}
          />
        )}

        {/* User-facing test notification screen */}
        {activeTab === 'email_arch' && <EmailArchitectureView />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

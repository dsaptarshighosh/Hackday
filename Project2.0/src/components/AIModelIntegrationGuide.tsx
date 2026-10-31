import React, { useState } from 'react';
import { Code, Terminal, CheckCircle2, Copy, Check, ExternalLink, Cpu, FileCode, Sliders, ArrowRight } from 'lucide-react';

interface AIModelIntegrationGuideProps {
  currentProbability: number;
  onSetTestProbability: (prob: number) => void;
  threshold: number;
  onSetThreshold: (th: number) => void;
}

export const AIModelIntegrationGuide: React.FC<AIModelIntegrationGuideProps> = ({
  currentProbability,
  onSetTestProbability,
  threshold,
  onSetThreshold,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'model1' | 'model2'>('model1');

  const model1Code = `// In src/ai/modelIntegration.ts -> extractMediaFeatures()
// AI MODEL 1: Receives uploaded or streamed Video / Audio file and extracts behavioral features:
export async function extractMediaFeatures(params: Model1ExtractParams) {
  // The current app posts media to its own Express endpoint, which calls Gemini.
  const data = params.file ? await fileToBase64(params.file) : params.data;
  const res = await fetch('/api/analyze-media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: params.type,
      mimeType: params.file?.type || params.mimeType,
      data,
      fileName: params.name,
      animalName: params.animalName,
      zoneAnimalCount: params.zoneAnimalCount,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Media analysis failed');
  return result.extracted_features;
  /* Example response shape (values are illustrative):
     {
       animals_observed: 5,
       animals_showing_behavior: 3,
       animals_reacting: 3,
       total_animals: 20,
       duration_minutes: 0.5,
       intensity_level: 7,
       observed_behavior: "Sudden fleeing",
       abnormality_percentage: 15,
       behavior_percentage: 60,
       species_detected: "Elephant",
       movement_change_percent: 30,
       confidence_score: 80
     }
  */
}`;

  const model2Code = `// In src/ai/modelIntegration.ts -> predictDisasterProbability()
// AI MODEL 2: Receives the extracted features and predicts Disaster Probability (%):
export async function predictDisasterProbability(inputs: AIModelInputs, threshold = 50) {
  // Calls the Zoo Sentinel Random Forest bundled with the app:
  const res = await fetch('/api/model-2/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threshold,
      features: {
        animal_name: 'Elephant',
        behaviour: 'Sudden fleeing',
        intensity: 8,
        abnormality_percentage: 72,
        duration_minutes: 12,
      },
    }),
  });
  const data = await res.json();
  const probability = data.disaster_probability; // Regression output clamped to 0–100

  const isAlert = probability > threshold; // Rule: > 50% -> ALERT
  return {
    inputs,
    disaster_probability: probability,
    is_alert_triggered: isAlert,
    status: isAlert ? 'ALERT TRIGGERED' : 'NORMAL / MONITORING',
  };
}`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-6  space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#d4ded2]/60 gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#5c753b]" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#203a30]">
              TWO-STAGE AI MODEL PIPELINE ARCHITECTURE
            </h3>
            <p className="text-xs text-[#6d7c70] mt-0.5">
              Model 2: 200-tree Random Forest trained on 2,800 generated demonstration rows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs ">
          <span className="px-2.5 py-1 rounded bg-[#f8faf5] border border-[#d4ded2] text-[#5c753b]">
            VIDEO/AUDIO → MODEL 1 → DATA → MODEL 2 → PROBABILITY
          </span>
        </div>
      </div>

      {/* Model Contract Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model 1 Contract */}
        <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs  font-bold text-[#5c753b] uppercase">
              1. AI Model 1: Media Feature Extraction
            </span>
            <span className="text-[10px]  text-teal-800">Video / Audio</span>
          </div>

          <div className="space-y-1.5 text-xs ">
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded">
              <span className="text-[#526c60]">Input</span>
              <span className="text-[#6d7c70]">Raw MP4 / WAV streams</span>
            </div>
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded">
              <span className="text-[#526c60]">Output 1</span>
              <span className="text-[#203a30]">animals_reacting / total_animals</span>
            </div>
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded">
              <span className="text-[#526c60]">Output 2</span>
              <span className="text-[#203a30]">duration_minutes / intensity_level (1-5)</span>
            </div>
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded">
              <span className="text-[#526c60]">Output 3</span>
              <span className="text-amber-800">movement_change / frequency_hz</span>
            </div>
          </div>
        </div>

        {/* Model 2 Contract */}
        <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs  font-bold text-[#5c753b] uppercase">
              2. AI Model 2: Disaster Probability
            </span>
            <span className="text-[10px]  text-[#6d7c70]">Rule: &gt; 50% ALERT</span>
          </div>

          <div className="space-y-1.5 text-xs ">
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded">
              <span className="text-[#526c60]">Input</span>
              <span className="text-[#6d7c70]">animal, behaviour + 3 numeric fields</span>
            </div>
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded">
              <span className="text-[#526c60]">Output</span>
              <span className="text-[#5c753b] font-bold">disaster_probability (%)</span>
            </div>
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded text-[11px]">
              <span className="text-emerald-800">Probability &le; 50%</span>
              <span className="text-[#526c60]">NO ALERT (Monitoring)</span>
            </div>
            <div className="flex items-center justify-between bg-[#eef2e9] p-2 rounded text-[11px]">
              <span className="text-rose-800 font-bold">Probability &gt; 50%</span>
              <span className="text-rose-800 font-bold">ALERT TRIGGERED (90km Perimeter)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Replacement Snippet */}
      <div className="bg-[#e6ece4] border border-[#d4ded2] rounded-lg p-4">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d4ded2]/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSnippetTab('model1')}
              className={`px-2.5 py-1 text-xs  rounded cursor-pointer ${
                activeSnippetTab === 'model1'
                  ? 'bg-[#f8faf5] text-[#5c753b] font-bold border border-[#d4ded2]'
                  : 'text-[#6d7c70] hover:text-[#203a30]'
              }`}
            >
              Model 1: Media Feature Extraction Hook
            </button>
            <button
              onClick={() => setActiveSnippetTab('model2')}
              className={`px-2.5 py-1 text-xs  rounded cursor-pointer ${
                activeSnippetTab === 'model2'
                  ? 'bg-[#f8faf5] text-[#5c753b] font-bold border border-[#d4ded2]'
                  : 'text-[#6d7c70] hover:text-[#203a30]'
              }`}
            >
              Model 2: Disaster Probability Hook
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeSnippetTab === 'model1' ? model1Code : model2Code)}
            className="flex items-center gap-1 text-[11px]  text-[#526c60] hover:text-[#203a30] px-2 py-1 bg-[#f8faf5] rounded border border-[#d4ded2] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-800" />
                <span className="text-emerald-800">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6d7c70]" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="text-xs  text-[#526c60] overflow-x-auto p-2 bg-[#eef2e9]/60 rounded leading-relaxed">
          {activeSnippetTab === 'model1' ? model1Code : model2Code}
        </pre>
      </div>
    </div>
  );
};


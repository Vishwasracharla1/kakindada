import React, { useState, useEffect, useRef } from "react";

// Kakinada CCC UI Prototype — Complete, syntax-fixed single-file React component
// TailwindCSS utility classes are used throughout. This file provides a small
// multi-page prototype (Dashboard, Feeds, Chains, Simulations, Training, Settings)
// with mock data and working components. Replace mock data / demoSrc with real
// URLs and wire up inference endpoints to make it live.

// -----------------------------
// Color palette and button styles
// -----------------------------
export const COLORS = {
  primary: "#4F46E5",
  primaryDark: "#3730A3",
  accent: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#0EA5E9",
  bg: "#F3F4F6",
  card: "#FFFFFF",
  text: "#1F2937",
};

const baseBtn = "px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-150";
const btnStyles = {
  btn: `${baseBtn} bg-indigo-600 text-white hover:bg-indigo-700 shadow`,
  "btn-outline": `${baseBtn} border border-indigo-600 text-indigo-600 hover:bg-indigo-50`,
  "btn-ghost": `${baseBtn} text-slate-600 hover:bg-slate-100`,
  "btn-sm": "px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50",
};
function cls(name) {
  return btnStyles[name] || name || "";
}

// -----------------------------
// Mock data
// -----------------------------
const mockFeeds = [
  { id: "bodycam-01", location: "Patrol Vehicle 12", type: "Bodycam", demoSrc: "/mnt/data/sample_bodycam_night.mp4" },
  { id: "cctv-01", location: "Market Rd Junction", type: "CCTV", demoSrc: "/mnt/data/sample_street_day.mp4" },
  { id: "cctv-02", location: "Harbour Entry", type: "CCTV", demoSrc: "/mnt/data/sample_harbour.mp4" },
  { id: "cctv-03", location: "Main Bridge", type: "CCTV", demoSrc: "/mnt/data/sample_bridge.mp4" },
];

const mockDatasets = [
  { id: "ds-anpr-night", name: "ANPR - Low Light (demo)", type: "Video", count: 12 },
  { id: "ds-highbeam", name: "High-Beam Violation Clips", type: "Video", count: 8 },
  { id: "ds-tracking", name: "Multi-Camera Tracking (sample)", type: "Video", count: 6 },
];

const mockFlashcards = [
  { q: "Officer bodycam feed shows a suspicious motorcycle at 02:12", hint: "Pause, capture plate, check chain visualization" },
  { q: "High-beam detected at night on highway", hint: "Flag violation, check timestamp and nearby cams" },
  { q: "Cross-camera tracking lost at camera 3", hint: "Trigger manual track continuation" },
];

const mockLogs = [
  "2025-10-21 21:12 — ANPR model updated (v1.0.3)",
  "2025-10-25 02:00 — Low-light dataset ingested (12 clips)",
  "2025-10-28 19:40 — Pilot: Bandwidth drop reported in Zone 4",
];

const mockChains = [
  {
    event: "Suspicious Vehicle 1",
    startTime: "2025-11-01 21:12",
    chain: [
      { cam: "CCTV-Market", time: "21:12" },
      { cam: "Bridge-Cam", time: "21:15" },
      { cam: "Harbour-Entry", time: "21:18" },
    ],
  },
];

// -----------------------------
// Helper simulation functions
// -----------------------------
function runDetectionMock(feedId, setActiveSimulation) {
  const detections = [
    { label: "vehicle", conf: 0.94 },
    { label: "license_plate", conf: 0.87 },
  ];
  setActiveSimulation({ feedId, detections, ts: Date.now() });
}
function runDatasetSimulation(ds, setActiveSimulation) {
  const steps = [
    { label: "vehicle", conf: 0.92 },
    { label: "person", conf: 0.78 },
    { label: "license_plate", conf: 0.86 },
  ];
  setActiveSimulation({ dataset: ds.id, detections: steps, ts: Date.now() });
  // In a real system you'd stream inference results here
}

// -----------------------------
// Main App (page switching)
// -----------------------------
export default function KakinadaCCC() {
  const [page, setPage] = useState("dashboard");
  const [selectedFeed, setSelectedFeed] = useState(mockFeeds[0]);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [flashIndex, setFlashIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.load();
        const p = videoRef.current.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {
        /* ignore in SSR or test env */
      }
    }
  }, [selectedFeed]);

  return (
    <div className="h-screen flex bg-gray-100 text-slate-900 overflow-hidden">
      <Sidebar setPage={setPage} page={page} />
      <main className="flex-1 p-4 overflow-auto">
        {page === "dashboard" && <DashboardPage />}
        {page === "feeds" && (
          <LiveFeedsPage
            selectedFeed={selectedFeed}
            setSelectedFeed={setSelectedFeed}
            activeSimulation={activeSimulation}
            setActiveSimulation={setActiveSimulation}
            videoRef={videoRef}
          />
        )}
        {page === "chains" && <TrackingChainsPage />}
        {page === "simulations" && <SimulationsPage setActiveSimulation={setActiveSimulation} />}
        {page === "training" && <TrainingPage flashIndex={flashIndex} setFlashIndex={setFlashIndex} />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

// -----------------------------
// Sidebar
// -----------------------------
function Sidebar({ setPage, page }) {
  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "feeds", label: "Live Feeds" },
    { key: "chains", label: "Tracking Chains" },
    { key: "simulations", label: "Simulations" },
    { key: "training", label: "Training" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <nav className="w-64 bg-white border-r p-4 flex flex-col">
      <div className="mb-6">
        <div className="text-lg font-semibold text-indigo-600">Mobius — CCC</div>
        <div className="text-sm text-slate-500">Kakinada Smart Policing</div>
      </div>

      <ul className="space-y-1 text-sm flex-1">
        {items.map((i) => (
          <li
            key={i.key}
            className={`p-2 rounded cursor-pointer transition ${
              page === i.key ? "bg-indigo-100 text-indigo-700 font-medium" : "hover:bg-slate-100"
            }`}
            onClick={() => setPage(i.key)}
          >
            {i.label}
          </li>
        ))}
      </ul>

      <div className="text-xs text-slate-400 mt-4">Prototype • Demo Mode</div>
    </nav>
  );
}

// -----------------------------
// Dashboard page
// -----------------------------
function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">City Command Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Stat value="312" label="Total Cameras" color="info" />
        <Stat value="28" label="Bodycams Active" color="primary" />
        <Stat value="92%" label="ANPR Accuracy" color="accent" />
        <Stat value="14" label="Alerts Today" color="warning" />
      </div>

      <div className="bg-white rounded-xl p-4 shadow mt-4">
        <h2 className="font-semibold mb-2">Recent Activity</h2>
        <ul className="text-sm space-y-1">
          {mockLogs.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ value, label, color }) {
  const colors = {
    primary: "bg-indigo-100 text-indigo-700",
    accent: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-sky-100 text-sky-700",
  };
  return (
    <div className={`p-4 rounded-xl shadow ${colors[color] || "bg-white"}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

// -----------------------------
// Live feeds page
// -----------------------------
function LiveFeedsPage({ selectedFeed, setSelectedFeed, activeSimulation, setActiveSimulation, videoRef }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Live & Demo Feeds</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded-xl shadow">
          <h2 className="font-medium mb-2">Live Video</h2>
          <video ref={videoRef} controls className="w-full h-96 bg-black rounded-lg">
            <source src={selectedFeed.demoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="mt-3 flex gap-2">
            <button className={cls("btn")} onClick={() => runDetectionMock(selectedFeed.id, setActiveSimulation)}>Run Detection</button>
            <button className={cls("btn-outline")} onClick={() => setActiveSimulation(null)}>Stop</button>
            <button className={cls("btn-ghost")} onClick={() => alert("Tag frame (placeholder)")}>Tag Frame</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-medium mb-2">Detections</h2>
          {!activeSimulation && <p className="text-sm text-slate-500">Run simulation to view detections.</p>}
          {activeSimulation && activeSimulation.detections && activeSimulation.detections.map((d, i) => (
            <p key={i} className="text-sm border p-1 rounded mb-1">{d.label} — {Math.round(d.conf * 100)}%</p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {mockFeeds.map((f) => (
          <div key={f.id} className={`cursor-pointer border rounded-md overflow-hidden ${selectedFeed.id === f.id ? "ring-2 ring-indigo-500" : ""}`} onClick={() => setSelectedFeed(f)}>
            <video className="w-full h-24 bg-black object-cover">
              <source src={f.demoSrc} type="video/mp4" />
            </video>
            <div className="p-2 text-xs font-medium">{f.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// Tracking Chains page
// -----------------------------
function TrackingChainsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Tracking Chains</h1>
      <MovementChainVisualization chains={mockChains} />
    </div>
  );
}

function MovementChainVisualization({ chains }) {
  return (
    <div className="bg-white rounded-2xl shadow p-3">
      <div className="font-medium mb-2">Movement Chain Visualization</div>
      <div className="text-sm text-slate-500 mb-3">Chain timeline across cameras during an event</div>
      <div className="space-y-3">
        {chains.map((c, idx) => (
          <div key={idx} className="p-2 border rounded">
            <div className="flex justify-between text-xs">
              <div><b>Event:</b> {c.event}</div>
              <div className="text-slate-400">Start: {c.startTime}</div>
            </div>
            <div className="mt-2 flex gap-2 items-center">
              {c.chain.map((step, sidx) => (
                <div key={sidx} className="flex-1 p-2 bg-slate-50 rounded text-xs text-center">{step.cam}<br /><span className="text-slate-400">{step.time}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// Simulations page
// -----------------------------
function SimulationsPage({ setActiveSimulation }) {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Simulation Center</h1>
      <SimulationPanel datasets={mockDatasets} onStart={(ds) => runDatasetSimulation(ds, setActiveSimulation)} />
    </div>
  );
}

function SimulationPanel({ datasets, onStart }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="text-xs text-slate-500 mb-2">Datasets & Videos available for simulation</div>
      <div className="space-y-2 max-h-60 overflow-auto">
        {datasets.map((ds) => (
          <div key={ds.id} className="p-2 border rounded flex justify-between items-center">
            <div className="text-sm">
              <div className="font-medium">{ds.name}</div>
              <div className="text-xs text-slate-500">{ds.type} • {ds.count} items</div>
            </div>
            <div className="flex gap-2">
              <button className={cls("btn-sm")} onClick={() => onStart(ds)}>Run</button>
              <button className={cls("btn-ghost")} onClick={() => alert("Open dataset details (placeholder)")}>Details</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <small className="text-slate-400">Suggested next steps:</small>
        <ul className="text-xs list-disc ml-5 mt-1 text-slate-600">
          <li>Attach real videos (bodycam / CCTV) to each dataset</li>
          <li>Annotate frames with bounding boxes & plate text</li>
          <li>Hook model inference endpoint to the "Run" button</li>
        </ul>
      </div>
    </div>
  );
}

// -----------------------------
// Training page
// -----------------------------
function TrainingPage({ flashIndex, setFlashIndex }) {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Operator Training</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-medium mb-2">Flashcards</h2>
          <Flashcards cards={mockFlashcards} index={flashIndex} setIndex={setFlashIndex} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-medium mb-2">Training Progress</h2>
          <p className="text-sm text-slate-500">Quizzes, scores and certification progress will appear here.</p>
        </div>
      </div>
    </div>
  );
}

function Flashcards({ cards, index, setIndex }) {
  const card = cards[index] || { q: "No cards available", hint: "" };
  return (
    <div className="space-y-2">
      <div className="bg-slate-50 p-3 rounded min-h-[120px] flex flex-col justify-between">
        <div>
          <div className="text-sm text-slate-500">Scenario</div>
          <div className="font-semibold mt-1">{card.q}</div>
        </div>
        <div className="text-xs text-slate-600 mt-2">{card.hint}</div>
      </div>

      <div className="flex gap-2">
        <button className={cls("btn")} onClick={() => setIndex((index - 1 + cards.length) % cards.length)}>Prev</button>
        <button className={cls("btn")} onClick={() => setIndex((index + 1) % cards.length)}>Next</button>
        <button className={cls("btn-ghost")} onClick={() => alert("Open training quiz (placeholder)")}>Start Quiz</button>
      </div>
    </div>
  );
}

// -----------------------------
// Settings page
// -----------------------------
function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Operator Mode</div>
            <div className="text-sm text-slate-500">Demo / Production toggles and auth</div>
          </div>
          <button className={cls("btn-outline")} onClick={() => alert("Toggle demo/prod (placeholder)")}>Toggle</button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dataset Storage</div>
            <div className="text-sm text-slate-500">S3 / Minio connection</div>
          </div>
          <button className={cls("btn-ghost")} onClick={() => alert("Open storage settings (placeholder)")}>Configure</button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// End of file
// -----------------------------

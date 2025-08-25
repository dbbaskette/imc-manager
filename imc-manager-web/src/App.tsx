import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { useSharedSSE, type EventDto } from './lib/sse'

function Header({ connected }: { connected: boolean }) {
  return (
    <header className="bg-gray-800/50 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <h1 className="text-xl font-semibold text-white">IMC Manager</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
          <span>platform_admin</span>
        </div>
      </div>
    </header>
  )
}

function Sidebar() {
  const location = useLocation()
  
  const navItems = [
    { 
      to: '/', 
      label: 'Systems Overview', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </svg>
    },
    { 
      to: '/rag-pipeline', 
      label: 'RAG Pipeline', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    },
    { 
      to: '/telemetry', 
      label: 'Telemetry Processing', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* WiFi symbol above car */}
        <path d="M12 2c-2.5 0-4.5 1.5-5.5 3.5"/>
        <path d="M12 2c2.5 0 4.5 1.5 5.5 3.5"/>
        <path d="M12 4c-1.5 0-2.5 1-3 2"/>
        <path d="M12 4c1.5 0 2.5 1 3 2"/>
        <path d="M12 6c-0.5 0-1 0.5-1 1"/>
        <path d="M12 6c0.5 0 1 0.5 1 1"/>
        
        {/* Car body - side profile */}
        <path d="M3 17h18"/>
        <path d="M17 17V7c0-.6-.4-1-1-1H8c-.6 0-1 .4-1 1v10"/>
        
        {/* Car top/cabin */}
        <path d="M8 7h8v4H8z"/>
        
        {/* Windows */}
        <rect x="9" y="8" width="6" height="2" rx="0.5" fill="currentColor" opacity="0.2"/>
        
        {/* Wheels */}
        <circle cx="7" cy="17" r="2" fill="currentColor" opacity="0.3"/>
        <circle cx="17" cy="17" r="2" fill="currentColor" opacity="0.3"/>
        
        {/* Headlights and taillights */}
        <circle cx="8" cy="8" r="0.5" fill="currentColor"/>
        <circle cx="16" cy="8" r="0.5" fill="currentColor"/>
      </svg>
    },
    { 
      to: '/deployment', 
      label: 'Deployment', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    }
  ]
  
  const settingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  return (
    <aside className="w-20 bg-gray-800/50 border-r border-gray-700 p-4 flex flex-col items-center justify-between">
      <div className="space-y-4">
        {navItems.map(({ to, label, icon }) => {
          const isActive = location.pathname === to || (to === '/' && location.pathname === '/')
          return (
            <Link
              key={to}
              to={to}
              className={`block p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
              title={label}
            >
              {icon}
            </Link>
          )
        })}
      </div>
      <div className="space-y-4">
        <Link
          to="/settings"
          className={`block p-3 rounded-lg transition-colors ${
            location.pathname === '/settings'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
          title="Settings"
        >
          {settingsIcon}
        </Link>
      </div>
    </aside>
  )
}

function Dashboard({ recent }: { recent: EventDto[] }) {
  // Real service data from service registry
  const [services, setServices] = useState<Array<{
    name: string;
    displayName: string;
    description: string;
    status: string;
  }>>([]);
  
  const [overview, setOverview] = useState<{
    totalServices: number;
    activeServices: number;
    overallStatus: string;
  } | null>(null);

  // Fetch services from the backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Get RAG pipeline overview
        const overviewResponse = await fetch('/api/services/rag-pipeline/overview');
        if (overviewResponse.ok) {
          const overviewData = await overviewResponse.json();
          setOverview(overviewData);
          setServices(overviewData.services || []);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    fetchServices();
    const interval = setInterval(fetchServices, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  const totalEvents = recent.length
  const errorEvents = recent.filter(e => e.status?.toLowerCase() === 'error').length
  const activeComponents = overview ? overview.activeServices : 0
  const totalComponents = overview ? overview.totalServices : 0

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">IMC Systems Overview</h2>
          <p className="text-gray-300 mt-1">Monitor your Insurance MegaCorp platform components and services</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium">System Settings</button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium text-white">Health Check</button>
        </div>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Active Components */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Components</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{activeComponents}</p>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">out of {totalComponents} total</p>
        </div>

        {/* Total Events */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Events</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{totalEvents}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">in this session</p>
        </div>

        {/* Error Count */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Errors</p>
              <p className={`text-3xl font-bold mt-2 ${errorEvents > 0 ? 'text-red-400' : 'text-green-400'}`}>{errorEvents}</p>
            </div>
            <div className="text-2xl">{errorEvents > 0 ? '⚠️' : '✅'}</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">error events</p>
        </div>

        {/* Pipeline Health */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Pipeline Health</p>
              <p className={`text-lg font-bold mt-2 ${
                overview && overview.overallStatus === 'HEALTHY' ? 'text-green-400' :
                overview && overview.overallStatus === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {overview ? overview.overallStatus : 'UNKNOWN'}
              </p>
            </div>
            <div className="text-2xl">
              {overview && overview.overallStatus === 'HEALTHY' ? '🟢' :
               overview && overview.overallStatus === 'DEGRADED' ? '🟡' : '🔴'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">overall status</p>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* RAG Pipeline Status */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
              <polyline points="10,5 9,5 8,5"/>
              <polyline points="10,21 9,21 8,21"/>
              <polyline points="10,17 9,17 8,17"/>
              <polyline points="10,13 9,13 8,13"/>
            </svg>
            <h3 className="text-lg font-semibold text-white">RAG Pipeline</h3>
          </div>
          <div className="space-y-3">
            {services.map((service) => {
              const isActive = service.status === 'STARTED'
              return (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{service.displayName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Link to="/rag-pipeline" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View Details →
            </Link>
          </div>
        </div>

        {/* Telemetry Processing Status */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-2"/>
              <path d="M5 17H3c-.6 0-1-.4-1-1v-3c0-.6.4-1 1-1h2"/>
              <path d="M17 17V5c0-.6-.4-1-1-1H8c-.6 0-1 .4-1 1v12"/>
              <path d="M7 14h10"/>
              <path d="M10 14v4"/>
              <path d="M14 14v4"/>
              <path d="M7 10h10"/>
              <path d="M7 7h10"/>
            </svg>
            <h3 className="text-lg font-semibold text-white">Telemetry Processing</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Vehicle Events</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Data Processing</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">HDFS Sink</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                ACTIVE
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Link to="/telemetry" className="text-green-400 hover:text-green-300 text-sm font-medium">
              View Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="text-sm text-gray-400 mt-1">Latest system events and updates</p>
        </div>
        <div className="p-4">
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    event.status?.toLowerCase() === 'error' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{event.message || 'System event'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {event.app || 'System'} • {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Recent'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

function RAGPipeline() {
  // Real service data from service registry
  const [services, setServices] = useState<Array<{
    name: string;
    displayName: string;
    description: string;
    status: string;
    lastCheck: string;
    url?: string;
  }>>([]);
  
  // HDFS files data
  const [hdfsFiles, setHdfsFiles] = useState<Array<{
    name: string;
    size: string;
    state: string;
  }>>([]);
  
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);
  const [restartingPipeline, setRestartingPipeline] = useState(false);
  
  // Pipeline progress data
  const [pipelineProgress, setPipelineProgress] = useState<{
    hdfsFiles: number;
    textProcFiles: number;  
    embedProcFiles: number;
    completeFiles: number;
  }>({ hdfsFiles: 0, textProcFiles: 0, embedProcFiles: 0, completeFiles: 0 });
  const [overview, setOverview] = useState<{
    totalServices: number;
    activeServices: number;
    overallStatus: string;
  } | null>(null);

  // Helper function to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return 'N/A';
    
    const kb = 1024;
    const mb = kb * 1024;
    
    if (bytes >= mb) {
      return `${(bytes / mb).toFixed(1)} MB`;
    } else if (bytes >= kb) {
      return `${(bytes / kb).toFixed(1)} KB`;
    } else {
      return `${bytes} B`;
    }
  };

  // Fetch HDFS files from hdfsWatcher via IMC Manager proxy
  const fetchHdfsFiles = async () => {
    try {
      console.log('Fetching files from hdfsWatcher via IMC Manager proxy: /api/services/hdfswatcher/files');

      // Use IMC Manager proxy to avoid CORS issues
      const response = await fetch(`/api/services/hdfswatcher/files`, { 
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('HDFS API Response:', data);
        
        if (data.error) {
          console.warn('API returned error:', data.error);
          setHdfsFiles([]);
        } else {
          const files = (data.files || []).map((file: any) => ({
            name: file.name || file.filename || file.path || 'unknown',
            size: formatFileSize(file.size),
            state: file.state || 'pending'
          }));
          
          console.log(`Found ${files.length} files:`, files);
          setHdfsFiles(files);
        }
      } else {
        console.warn('Failed to fetch HDFS files:', response.status, response.statusText);
        setHdfsFiles([]);
      }
    } catch (error) {
      console.error('Failed to fetch HDFS files:', error);
      setHdfsFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch services from the backend
  const fetchServices = async () => {
    try {
      if (loading) setLoading(true);
      
      // Get RAG pipeline overview
      const overviewResponse = await fetch('/api/services/rag-pipeline/overview');
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);
        setServices(overviewData.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchServices();
    fetchHdfsFiles();
  }, []);

  // Fetch pipeline progress after files are loaded
  useEffect(() => {
    if (!filesLoading) {
      fetchPipelineProgress();
    }
  }, [hdfsFiles, filesLoading]);

  // Periodic refresh - separate intervals to avoid flashing
  useEffect(() => {
    const servicesInterval = setInterval(fetchServices, 10000);
    return () => clearInterval(servicesInterval);
  }, [loading]);

  useEffect(() => {
    const filesInterval = setInterval(fetchHdfsFiles, 15000); // Refresh files every 15 seconds
    return () => clearInterval(filesInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(fetchPipelineProgress, 20000); // Refresh progress every 20 seconds
    return () => clearInterval(progressInterval);
  }, []);

  // Reprocess files function
  const reprocessFiles = async () => {
    try {
      setReprocessing(true);
      console.log('Reprocessing files via IMC Manager proxy: /api/services/hdfswatcher/reprocess');

      const response = await fetch(`/api/services/hdfswatcher/reprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reprocess response:', data);
        
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          const clearedCount = data.clearedCount || 0;
          alert(`Reprocessing completed! ${clearedCount} files cleared and will be reprocessed.`);
          // Refresh the files list after a short delay
          setTimeout(() => {
            fetchHdfsFiles();
          }, 2000);
        }
      } else {
        const errorText = await response.text();
        console.error('Reprocess failed:', response.status, errorText);
        alert(`Failed to reprocess files: ${response.status}`);
      }
    } catch (error) {
      console.error('Error reprocessing files:', error);
      alert('Error reprocessing files. Check console for details.');
    } finally {
      setReprocessing(false);
    }
  };

  // Fetch pipeline progress from all services
  const fetchPipelineProgress = async () => {
    try {
      const [textProcResponse, embedProcResponse] = await Promise.all([
        fetch('/api/services/textproc/files/processed', { credentials: 'include' }).catch(() => null),
        fetch('/api/services/embedproc/files/processed', { credentials: 'include' }).catch(() => null)
      ]);

      let textProcFiles = 0;
      let embedProcFiles = 0;

      // Get textProc processed files
      if (textProcResponse && textProcResponse.ok) {
        const textData = await textProcResponse.json();
        textProcFiles = textData.files ? textData.files.length : (textData.processedCount || 0);
      }

      // Get embedProc processed files  
      if (embedProcResponse && embedProcResponse.ok) {
        const embedData = await embedProcResponse.json();
        embedProcFiles = embedData.files ? embedData.files.length : (embedData.processedCount || 0);
      }

      setPipelineProgress({
        hdfsFiles: hdfsFiles.length,
        textProcFiles,
        embedProcFiles,
        completeFiles: embedProcFiles // Complete = embedProc finished
      });

    } catch (error) {
      console.error('Error fetching pipeline progress:', error);
    }
  };

  // Restart entire pipeline
  const restartPipeline = async () => {
    try {
      setRestartingPipeline(true);
      console.log('Restarting entire pipeline...');

      const response = await fetch('/api/services/restart-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Pipeline restart response:', data);
        
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          const results = data.results || [];
          const errors = data.errors || [];
          let message = `Pipeline restart completed!\n\n${results.join('\n')}`;
          if (errors.length > 0) {
            message += `\n\nWarnings:\n${errors.join('\n')}`;
          }
          alert(message);
          
          // Refresh everything after restart
          setTimeout(() => {
            fetchHdfsFiles();
            fetchServices();
            fetchPipelineProgress();
          }, 3000);
        }
      } else {
        const errorText = await response.text();
        console.error('Pipeline restart failed:', response.status, errorText);
        alert(`Failed to restart pipeline: ${response.status}`);
      }
    } catch (error) {
      console.error('Error restarting pipeline:', error);
      alert('Error restarting pipeline. Check console for details.');
    } finally {
      setRestartingPipeline(false);
    }
  };

  // Reset textProc processing
  const resetTextProc = async () => {
    try {
      console.log('Resetting textProc processing...');

      const response = await fetch('/api/services/textproc/processing/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('TextProc reset response:', data);
        
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          alert('TextProc processing reset successfully!');
          // Refresh data after reset
          setTimeout(() => {
            fetchPipelineProgress();
          }, 1000);
        }
      } else {
        const errorText = await response.text();
        console.error('TextProc reset failed:', response.status, errorText);
        alert(`Failed to reset textProc: ${response.status}`);
      }
    } catch (error) {
      console.error('Error resetting textProc:', error);
      alert('Error resetting textProc. Check console for details.');
    }
  };

  // Service control functions
  const startService = async (serviceName: string) => {
    try {
      const response = await fetch(`/api/services/${serviceName}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Refresh services after action
        setTimeout(() => {
          const event = new Event('refresh-services');
          window.dispatchEvent(event);
        }, 1000);
      }
    } catch (error) {
      console.error(`Failed to start ${serviceName}:`, error);
    }
  };

  const stopService = async (serviceName: string) => {
    try {
      const response = await fetch(`/api/services/${serviceName}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Refresh services after action
        setTimeout(() => {
          const event = new Event('refresh-services');
          window.dispatchEvent(event);
        }, 1000);
      }
    } catch (error) {
      console.error(`Failed to stop ${serviceName}:`, error);
    }
  };

  const toggleService = async (serviceName: string) => {
    try {
      const response = await fetch(`/api/services/${serviceName}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Refresh services after action
        setTimeout(() => {
          const event = new Event('refresh-services');
          window.dispatchEvent(event);
        }, 1000);
      }
    } catch (error) {
      console.error(`Failed to toggle ${serviceName}:`, error);
    }
  };

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      const fetchServices = async () => {
        try {
          const overviewResponse = await fetch('/api/services/rag-pipeline/overview');
          if (overviewResponse.ok) {
            const overviewData = await overviewResponse.json();
            setOverview(overviewData);
            setServices(overviewData.services || []);
          }
        } catch (error) {
          console.error('Failed to refresh services:', error);
        }
      };
      fetchServices();
    };

    window.addEventListener('refresh-services', handleRefresh);
    return () => window.removeEventListener('refresh-services', handleRefresh);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading RAG Pipeline services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">RAG Pipeline</h2>
        <p className="text-gray-300 mt-1">Retrieval-Augmented Generation processing pipeline status</p>
      </div>

      {/* Pipeline Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Services</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{overview.totalServices}</p>
              </div>
              <div className="text-2xl">🔗</div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Services</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{overview.activeServices}</p>
              </div>
              <div className="text-2xl">🟢</div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Overall Status</p>
                <p className={`text-lg font-bold mt-2 ${
                  overview.overallStatus === 'HEALTHY' ? 'text-green-400' :
                  overview.overallStatus === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {overview.overallStatus}
                </p>
              </div>
              <div className="text-2xl">
                {overview.overallStatus === 'HEALTHY' ? '🟢' :
                 overview.overallStatus === 'DEGRADED' ? '🟡' : '🔴'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Flow Visualization */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg mb-8">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Pipeline Architecture</h3>
          <p className="text-sm text-gray-400 mt-1">Real-time status of pipeline components</p>
        </div>
        
        <div className="p-8">
          {/* Architecture Diagram */}
          <div className="space-y-8">
            {/* Top Layer - Data Lake */}
            <div className="flex justify-center">
              <div className="bg-gray-700/30 border-2 border-gray-600 rounded-lg px-12 py-6 text-center">
                <h3 className="text-xl font-semibold text-white">Tanzu Data Lake</h3>
                <p className="text-sm text-gray-400 mt-1">Document Storage & Management</p>
              </div>
            </div>
            
            {/* Connecting lines from Data Lake */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-16">
                <div className="w-px h-12 bg-gray-600"></div>
                <div className="w-px h-12 bg-gray-600"></div>
                <div className="w-px h-12 bg-gray-600"></div>
              </div>
            </div>
            
            {/* Middle Layer - Processing Components */}
            <div className="flex justify-center items-start space-x-8">
              {services.map((service) => {
                const isActive = service.status === 'STARTED';
                const isStopped = service.status === 'STOPPED';
                const isError = service.status === 'ERROR' || service.status === 'UNKNOWN';
                
                return (
                  <div key={service.name} className="flex flex-col items-center">
                    <div className={`relative px-8 py-6 rounded-lg border-2 min-w-[160px] text-center transition-all duration-300 ${
                      isActive ? 'bg-green-900/20 border-green-500' :
                      isStopped ? 'bg-red-900/20 border-red-500' :
                      isError ? 'bg-red-900/20 border-red-500 opacity-60' :
                      'bg-gray-700/20 border-gray-500'
                    }`}>
                      {/* Status indicator */}
                      <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-green-500' :
                        isStopped ? 'bg-red-500' :
                        isError ? 'bg-red-500 animate-pulse' :
                        'bg-gray-500'
                      }`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Component info */}
                      <h4 className="font-semibold text-white text-lg">{service.displayName}</h4>
                      <p className="text-xs text-gray-400 mt-2">{service.description}</p>
                      
                      {/* Status */}
                      <div className="mt-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          isActive ? 'bg-green-500/20 text-green-300' :
                          isStopped ? 'bg-red-500/20 text-red-300' :
                          isError ? 'bg-red-500/20 text-red-300 animate-pulse' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Connecting line down */}
                    <div className="w-px h-12 bg-gray-600 mt-4"></div>
                  </div>
                )
              })}
              
              {/* Vector Store - separate from main flow */}
              <div className="flex flex-col items-center ml-8">
                <div className="bg-gray-700/30 border-2 border-gray-600 rounded-lg px-8 py-6 text-center min-w-[160px]">
                  <h4 className="font-semibold text-white text-lg">Vector Store</h4>
                  <p className="text-xs text-gray-400 mt-2">Embedding Storage</p>
                  <div className="mt-3">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <div className="w-px h-12 bg-gray-600 mt-4"></div>
              </div>
            </div>
            
            {/* Horizontal connecting line */}
            <div className="flex justify-center">
              <div className="w-3/4 h-px bg-gray-600"></div>
            </div>
            
            {/* Bottom Layer - RabbitMQ */}
            <div className="flex justify-center">
              <div className="bg-gray-700/30 border-2 border-gray-600 rounded-lg px-16 py-6 text-center">
                <h3 className="text-xl font-semibold text-white">RabbitMQ</h3>
                <p className="text-sm text-gray-400 mt-1">Message Queue & Event Streaming</p>
                <div className="mt-3">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                    CONNECTED
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pipeline Legend */}
          <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-300">Stopped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-300">Unknown/Stale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => {
          const isActive = service.status === 'STARTED';
          
          return (
            <div key={service.name} className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{service.displayName}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{service.description}</p>
              
              {/* Service Control Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => startService(service.name)}
                  disabled={isActive}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                >
                  Start
                </button>
                <button
                  onClick={() => stopService(service.name)}
                  disabled={!isActive}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    !isActive 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  Stop
                </button>
                <button
                  onClick={() => toggleService(service.name)}
                  className="px-3 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Toggle
                </button>
                {/* Add Reset Processing button for textproc */}
                {service.name === 'textproc' && (
                  <button
                    onClick={resetTextProc}
                    className="px-3 py-1 rounded text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white"
                  >
                    Reset Processing
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={isActive ? 'text-green-400' : 'text-red-400'}>{service.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Check:</span>
                  <span className="text-gray-300">{service.lastCheck}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pipeline Progress Flow Visualization - Option A Style */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Pipeline Progress</h3>
            <p className="text-sm text-gray-400 mt-1">Real-time document processing flow</p>
          </div>
          <button
            onClick={restartPipeline}
            disabled={restartingPipeline}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              restartingPipeline 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {restartingPipeline ? 'Restarting Pipeline...' : 'Restart Pipeline'}
          </button>
        </div>
        
        <div className="p-6">
          {/* Horizontal Pipeline Flow */}
          <div className="flex items-center justify-between">
            {/* HDFS Watcher Stage */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4 min-w-[120px] text-center">
                <h4 className="font-semibold text-white text-sm">HDFS Watcher</h4>
                <p className="text-xs text-gray-400 mt-1">File Discovery</p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-blue-300">
                    {pipelineProgress.hdfsFiles}
                  </span>
                  <p className="text-xs text-gray-400">files found</p>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-px bg-gray-500"></div>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Text Processor Stage */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-900/20 border-2 border-purple-500 rounded-lg p-4 min-w-[120px] text-center">
                <h4 className="font-semibold text-white text-sm">Text Processor</h4>
                <p className="text-xs text-gray-400 mt-1">Text Extraction</p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-purple-300">
                    {pipelineProgress.textProcFiles}
                  </span>
                  <p className="text-xs text-gray-400">files processed</p>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-px bg-gray-500"></div>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Embedding Processor Stage */}
            <div className="flex flex-col items-center">
              <div className="bg-green-900/20 border-2 border-green-500 rounded-lg p-4 min-w-[120px] text-center">
                <h4 className="font-semibold text-white text-sm">Embed Processor</h4>
                <p className="text-xs text-gray-400 mt-1">Vector Generation</p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-green-300">
                    {pipelineProgress.embedProcFiles}
                  </span>
                  <p className="text-xs text-gray-400">files embedded</p>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-px bg-gray-500"></div>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Complete Stage */}
            <div className="flex flex-col items-center">
              <div className="bg-teal-900/20 border-2 border-teal-500 rounded-lg p-4 min-w-[120px] text-center">
                <h4 className="font-semibold text-white text-sm">Complete</h4>
                <p className="text-xs text-gray-400 mt-1">Ready for Query</p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-teal-300">
                    {pipelineProgress.completeFiles}
                  </span>
                  <p className="text-xs text-gray-400">files ready</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Processing Progress</span>
              <span>{pipelineProgress.hdfsFiles > 0 ? Math.round((pipelineProgress.completeFiles / pipelineProgress.hdfsFiles) * 100) : 0}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${pipelineProgress.hdfsFiles > 0 ? (pipelineProgress.completeFiles / pipelineProgress.hdfsFiles) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* File Management Section */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Pipeline Files</h3>
            <p className="text-sm text-gray-400 mt-1">Document processing status and file management</p>
          </div>
          <button
            onClick={reprocessFiles}
            disabled={reprocessing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reprocessing 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {reprocessing ? 'Reprocessing...' : 'Reprocess Files'}
          </button>
        </div>
        <div className="p-6">
          <div className="bg-gray-700/30 rounded-lg border border-gray-600">
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-700/50">
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 font-medium text-gray-300">Name</th>
                    <th className="text-left p-3 font-medium text-gray-300">Size</th>
                    <th className="text-left p-3 font-medium text-gray-300">Status</th>
                    <th className="text-left p-3 font-medium text-gray-300">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {filesLoading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        Loading files from HDFS Watcher...
                      </td>
                    </tr>
                  ) : hdfsFiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        No files found in HDFS or connection failed
                      </td>
                    </tr>
                  ) : (
                    hdfsFiles.map((file, i) => {
                      // Map API states to display states
                      const displayStatus = 
                        file.state === 'processed' ? 'Processed' :
                        file.state === 'processing' || file.state === 'running' ? 'Processing' :
                        'Pending';
                      
                      // Determine overall pipeline stage for this file
                      const getOverallStage = () => {
                        if (displayStatus === 'Processed') {
                          // Check if file has been through all stages
                          if (pipelineProgress.completeFiles > 0) return 'Complete';
                          if (pipelineProgress.embedProcFiles > 0) return 'Embedding';
                          if (pipelineProgress.textProcFiles > 0) return 'Text Processing';
                        }
                        if (displayStatus === 'Processing') {
                          return 'In Progress';
                        }
                        return 'Pending';
                      };
                      
                      const overallStage = getOverallStage();
                      
                      return (
                        <tr key={i} className="border-b border-gray-600 hover:bg-gray-600/20">
                          <td className="p-3 text-gray-200">{file.name}</td>
                          <td className="p-3 text-gray-400">{file.size}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              displayStatus === 'Processed' ? 'bg-teal-500/20 text-teal-300' :
                              displayStatus === 'Processing' ? 'bg-blue-500/20 text-blue-300' :
                              displayStatus === 'Pending' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {displayStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              overallStage === 'Complete' ? 'bg-emerald-500/20 text-emerald-300' :
                              overallStage === 'Embedding' ? 'bg-green-500/20 text-green-300' :
                              overallStage === 'Text Processing' ? 'bg-purple-500/20 text-purple-300' :
                              overallStage === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {overallStage}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* File Status Legend */}
          <div className="mt-4 border-t border-gray-600 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">File Status</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-300">Processed</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Pipeline Stage</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-300">Text Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Embedding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-300">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TelemetryProcessing() {
  const telemetryComponents = [
    {
      name: 'vehicle-events',
      label: 'Vehicle Events',
      description: 'Processes incoming vehicle telemetry data',
      status: 'ACTIVE',
      throughput: '1.2K events/sec'
    },
    {
      name: 'data-processor',
      label: 'Data Processor',
      description: 'Transforms and enriches telemetry data',
      status: 'ACTIVE',
      throughput: '950 events/sec'
    },
    {
      name: 'hdfs-sink',
      label: 'HDFS Sink',
      description: 'Stores processed data to HDFS',
      status: 'ACTIVE',
      throughput: '800 events/sec'
    }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Telemetry Processing</h2>
          <p className="text-gray-300 mt-1">Real-time vehicle telemetry data processing pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium">Processing Settings</button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium text-white">View Metrics</button>
        </div>
      </div>

      {/* Telemetry Flow Visualization */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg mb-8">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Data Flow Architecture</h3>
          <p className="text-sm text-gray-400 mt-1">Real-time telemetry processing pipeline</p>
        </div>
        
        <div className="p-8">
          {/* Flow Diagram */}
          <div className="space-y-8">
            {/* Top Layer - Vehicle Sources */}
            <div className="flex justify-center">
              <div className="bg-gray-700/30 border-2 border-gray-600 rounded-lg px-12 py-6 text-center">
                <h3 className="text-xl font-semibold text-white">Vehicle Fleet</h3>
                <p className="text-sm text-gray-400 mt-1">Real-time GPS & Sensor Data</p>
              </div>
            </div>
            
            {/* Connecting lines */}
            <div className="flex justify-center">
              <div className="w-px h-12 bg-gray-600"></div>
            </div>
            
            {/* Middle Layer - Processing Components */}
            <div className="flex justify-center items-start space-x-8">
              {telemetryComponents.map((component) => (
                <div key={component.name} className="flex flex-col items-center">
                  <div className="bg-green-900/20 border-2 border-green-500 rounded-lg px-8 py-6 text-center min-w-[160px]">
                    <h4 className="font-semibold text-white text-lg">{component.label}</h4>
                    <p className="text-xs text-gray-400 mt-2">{component.description}</p>
                    <div className="mt-3">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                        {component.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-blue-300">{component.throughput}</span>
                    </div>
                  </div>
                  
                  {/* Connecting line down */}
                  <div className="w-px h-12 bg-gray-600 mt-4"></div>
                </div>
              ))}
            </div>
            
            {/* Horizontal connecting line */}
            <div className="flex justify-center">
              <div className="w-3/4 h-px bg-gray-600"></div>
            </div>
            
            {/* Bottom Layer - Data Storage */}
            <div className="flex justify-center">
              <div className="bg-gray-700/30 border-2 border-gray-600 rounded-lg px-16 py-6 text-center">
                <h3 className="text-xl font-semibold text-white">Data Lake Storage</h3>
                <p className="text-sm text-gray-400 mt-1">HDFS & Analytics Platform</p>
                <div className="mt-3">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                    STORING
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {telemetryComponents.map((component) => (
          <div key={component.name} className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">{component.label}</h4>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                {component.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{component.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Throughput:</span>
                <span className="text-green-400">{component.throughput}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">{component.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Update:</span>
                <span className="text-gray-300">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Metrics */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Real-time Metrics</h3>
          <p className="text-sm text-gray-400 mt-1">Live performance indicators</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">1.2K</div>
              <div className="text-sm text-gray-400">Events/sec</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">99.8%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">45ms</div>
              <div className="text-sm text-gray-400">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">2.1M</div>
              <div className="text-sm text-gray-400">Total Events</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



function Deployment() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Deployment</h2>
      <p className="text-gray-300">Deployment management coming soon...</p>
    </div>
  )
}

function Settings() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      <p className="text-gray-300">Configuration options coming soon...</p>
    </div>
  )
}

function Shell() {
  const { debug: recent, connected, error } = useSharedSSE('/stream', {
    onEvent: (e) => {
      console.log('SSE Event received:', e)
      if (e.url) {
        console.log(`SSE Event with URL - app: ${e.app}, url: ${e.url}`)
      }
    }
  })
  
  console.log('SSE Status - Connected:', connected, 'Error:', error, 'Recent count:', recent.length)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header connected={connected} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard recent={recent} />} />
              <Route path="/rag-pipeline" element={<RAGPipeline />} />
              <Route path="/telemetry" element={<TelemetryProcessing />} />
              <Route path="/deployment" element={<Deployment />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

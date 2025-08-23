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
      label: 'Dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </svg>
    },
    { 
      to: '/services', 
      label: 'Services', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6"/>
        <path d="m21 12-6 0m-6 0-6 0"/>
      </svg>
    },
    { 
      to: '/monitoring', 
      label: 'Monitoring', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
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
  // Component configurations matching Apps page with fallback URLs
  const pipelineComponents = [
    { 
      name: 'hdfsWatcher', 
      label: 'hdfsWatcher', 
      description: 'Monitors document storage',
      endpoints: { state: "/api/processing/state" },
      statusField: "enabled"
    },
    { 
      name: 'textProc', 
      label: 'textProc', 
      description: 'Extracts and processes text',
      endpoints: { state: "/api/processing/state" },
      statusField: "enabled"
    },
    { 
      name: 'embedProc', 
      label: 'embedProc', 
      description: 'Generates vector embeddings',
      endpoints: { state: "/api/processing/state" },
      statusField: "enabled"
    }
  ]

  // API-based component states
  const [componentStates, setComponentStates] = useState<Record<string, 'STARTED' | 'STOPPED' | 'IDLE'>>({})
  
  useEffect(() => {
    const checkAllComponentStates = async () => {
      const newStates: Record<string, 'STARTED' | 'STOPPED' | 'IDLE'> = {}
      
      await Promise.all(pipelineComponents.map(async (component) => {
        try {
          // Try proxy first
          const encodedApp = encodeURIComponent(component.name)
          let res = await fetch(`/api/proxy/${encodedApp}${component.endpoints.state}`, { credentials: 'include' })
          
          // Proxy is the only way - no hardcoded fallbacks
          
          if (res.ok) {
            const data = await res.json()
            console.log(`[${component.name}] Dashboard status response:`, data)
            const processingEnabled = data[component.statusField] || data.enabled || data.processing
            newStates[component.name] = processingEnabled ? 'STARTED' : 'STOPPED'
          } else {
            console.warn(`[${component.name}] Dashboard status check failed:`, res.status)
            newStates[component.name] = 'IDLE'
          }
        } catch (error) {
          console.error(`[${component.name}] Dashboard status error:`, error)
          newStates[component.name] = 'IDLE'
        }
      }))
      
      setComponentStates(newStates)
    }
    
    checkAllComponentStates()
    const interval = setInterval(checkAllComponentStates, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])
  
  const totalEvents = recent.length
  const errorEvents = recent.filter(e => e.status?.toLowerCase() === 'error').length
  const activeComponents = Object.values(componentStates).filter(state => state === 'STARTED').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">IMC System Overview</h2>
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
          <p className="text-xs text-gray-500 mt-2">out of {pipelineComponents.length} total</p>
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
                activeComponents === pipelineComponents.length && errorEvents === 0 ? 'text-green-400' :
                activeComponents > pipelineComponents.length / 2 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {activeComponents === pipelineComponents.length && errorEvents === 0 ? 'HEALTHY' :
                 activeComponents > pipelineComponents.length / 2 ? 'DEGRADED' : 'CRITICAL'}
              </p>
            </div>
            <div className="text-2xl">
              {activeComponents === pipelineComponents.length && errorEvents === 0 ? '🟢' :
               activeComponents > pipelineComponents.length / 2 ? '🟡' : '🔴'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">overall status</p>
        </div>
      </div>

      {/* Pipeline Flow Visualization */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">RAG Processing Pipeline</h3>
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
              {pipelineComponents.map((component) => {
                const componentState = componentStates[component.name] || 'IDLE'
                const isActive = componentState === 'STARTED'
                const isStopped = componentState === 'STOPPED'
                const isError = componentState === 'IDLE' // IDLE represents connectivity/API errors
                
                return (
                  <div key={component.name} className="flex flex-col items-center">
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
                      <h4 className="font-semibold text-white text-lg">{component.label}</h4>
                      <p className="text-xs text-gray-400 mt-2">{component.description}</p>
                      
                      {/* Status */}
                      <div className="mt-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          isActive ? 'bg-green-500/20 text-green-300' :
                          isStopped ? 'bg-red-500/20 text-red-300' :
                          isError ? 'bg-red-500/20 text-red-300 animate-pulse' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {isError ? 'ERROR' : componentState}
                        </span>
                      </div>
                      
                      {/* API Status */}
                      <p className="text-xs mt-2 text-gray-400">
                        API Status
                      </p>
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
    </div>
  )
}


function Services() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Services</h2>
      <p className="text-gray-300">Service management coming soon...</p>
    </div>
  )
}

function Monitoring() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Monitoring</h2>
      <p className="text-gray-300">System monitoring coming soon...</p>
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
              <Route path="/services" element={<Services />} />
              <Route path="/monitoring" element={<Monitoring />} />
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

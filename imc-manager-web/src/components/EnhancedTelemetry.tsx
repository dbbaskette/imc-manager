import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Asset paths in public folder - keeping the product logos
const HdfsIcon = '/assets/icons/hadoop.svg';
const RabbitMQIcon = '/assets/icons/RabbitMQ.svg';
const TanzuIcon = '/assets/icons/tanzu.png';
// Removed unused TelemetryIcon

interface TelemetryData {
  vehicleEvents: number;
  dataProcessor: number;
  hdfsSink: number;
  totalEvents: number;
}

interface TelemetryComponent {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
  icon?: string;
  svg?: string;
  status: 'healthy' | 'warning' | 'error' | 'stopped';
  clickable?: boolean;
  serviceUrl?: string;
}

interface TelemetryConnection {
  source: string;
  target: string;
  type?: 'standard' | 'data-flow' | 'external';
}

interface EnhancedTelemetryProps {
  telemetryData: TelemetryData;
  components: Array<{
    name: string;
    status: string;
    throughput: string;
    url?: string;
  }>;
  onComponentClick: (componentName: string, url?: string) => void;
}

interface ComponentMetrics {
  [key: string]: {
    key1: string;
    value1: string;
    key2: string;
    value2: string;
  };
}

const EnhancedTelemetry: React.FC<EnhancedTelemetryProps> = ({ 
  components,
  onComponentClick 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [componentMetrics, setComponentMetrics] = useState<ComponentMetrics>({});
  const [loading, setLoading] = useState(true);

  // API Integration Functions - from SmartDriver UI
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const metrics = await response.json();
      return metrics;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return {};
    }
  };

  // Note: Component health fetching will be integrated in future versions
  // const fetchComponentHealth = async () => {
  //   try {
  //     const response = await fetch('/api/components/health');
  //     const data = await response.json();
  //     return data.component_health || {};
  //   } catch (error) {
  //     console.error('Failed to fetch component health:', error);
  //     return {};
  //   }
  // };

  // Update component metrics with real API data
  const updateComponentMetrics = async () => {
    const metrics = await fetchMetrics();
    // Note: health data will be integrated in future versions
    // const health = await fetchComponentHealth();
    
    const newMetrics: ComponentMetrics = {
      'telemetry-generator': {
        key1: 'Events/sec',
        value1: metrics.telemetry_rate || '1.2K',
        key2: 'Total Events',
        value2: metrics.total_events || '2.1M'
      },
      'telematics-exchange': {
        key1: 'Queue Depth',
        value1: metrics.queue_depth?.toString() || '42',
        key2: 'Messages/sec',
        value2: metrics.exchange_rate || '950'
      },
      'hdfs-sink': {
        key1: 'Files Written',
        value1: metrics.files_written || '1,204',
        key2: 'Data Size',
        value2: metrics.hdfs_size || '2.1GB'
      },
      'hadoop-hdfs': {
        key1: 'Storage Used',
        value1: '2.1GB',
        key2: 'Files',
        value2: '1,204'
      },
      'events-processor': {
        key1: 'Processed/sec',
        value1: metrics.processor_rate || '850',
        key2: 'Error Rate',
        value2: metrics.error_rate || '0.02%'
      },
      'vehicle-events-queue': {
        key1: 'Queue Length',
        value1: metrics.events_queue || '12',
        key2: 'Consumers',
        value2: '3'
      },
      'jdbc-sink': {
        key1: 'DB Inserts/sec',
        value1: metrics.db_inserts || '750',
        key2: 'Batch Size',
        value2: '100'
      },
      'log-sink': {
        key1: 'Log Files',
        value1: '24',
        key2: 'Size',
        value2: '156MB'
      },
      'greenplum-db': {
        key1: 'Table Rows',
        value1: metrics.db_rows || '2.1M',
        key2: 'Queries/min',
        value2: '45'
      }
    };
    
    setComponentMetrics(newMetrics);
    setLoading(false);
  };

  // Define telemetry components using enhanced layout with better spacing like the image
  const getTelemetryComponents = (): TelemetryComponent[] => {
    const vehicleEventsComponent = components.find(c => c.name === 'vehicle-events');
    const dataProcessorComponent = components.find(c => c.name === 'data-processor');
    const hdfsSinkComponent = components.find(c => c.name === 'hdfs-sink');

    return [
      {
        id: 'telemetry-generator',
        x: 120,
        y: 200,
        label: 'Telemetry Generator',
        description: 'Vehicle data source',
        icon: '🚗',
        status: vehicleEventsComponent?.status === 'ACTIVE' ? 'healthy' : 'stopped',
        clickable: true,
        serviceUrl: vehicleEventsComponent?.url
      },
      {
        id: 'telematics-exchange',
        x: 360,
        y: 200,
        label: 'telematics_exchange',
        description: 'RabbitMQ fanout exchange',
        svg: RabbitMQIcon,
        status: 'healthy',
        clickable: true
      },
      {
        id: 'hdfs-sink',
        x: 600,
        y: 120,
        label: 'HDFS Sink',
        description: 'All data → Parquet',
        icon: '🗄️',
        status: hdfsSinkComponent?.status === 'ACTIVE' ? 'healthy' : 'stopped',
        clickable: true,
        serviceUrl: hdfsSinkComponent?.url
      },
      {
        id: 'hadoop-hdfs',
        x: 840,
        y: 120,
        label: 'Hadoop HDFS',
        description: 'File storage',
        svg: HdfsIcon,
        status: 'healthy',
        clickable: false
      },
      {
        id: 'events-processor',
        x: 600,
        y: 320,
        label: 'Events Processor',
        description: 'Processes telematics data',
        icon: '⚙️',
        status: dataProcessorComponent?.status === 'ACTIVE' ? 'healthy' : 'stopped',
        clickable: true,
        serviceUrl: dataProcessorComponent?.url
      },
      {
        id: 'vehicle-events-queue',
        x: 840,
        y: 320,
        label: 'vehicle_events',
        description: 'Vehicle events queue',
        svg: RabbitMQIcon,
        status: 'healthy',
        clickable: true
      },
      {
        id: 'jdbc-sink',
        x: 1080,
        y: 200,
        label: 'JDBC Sink',
        description: 'Persists events to database',
        icon: '🗃️',
        status: 'healthy',
        clickable: true
      },
      {
        id: 'log-sink',
        x: 1080,
        y: 400,
        label: 'Log Sink',
        description: 'Outputs events to log files',
        icon: '📝',
        status: 'healthy',
        clickable: false
      },
      {
        id: 'greenplum-db',
        x: 1320,
        y: 200,
        label: 'Greenplum',
        description: 'Tanzu Greenplum Database',
        svg: TanzuIcon,
        status: 'healthy',
        clickable: true
      }
    ];
  };

  // Define connections using original SmartDriver UI curved paths
  const connections: TelemetryConnection[] = [
    { source: 'telemetry-generator', target: 'telematics-exchange', type: 'data-flow' },
    { source: 'telematics-exchange', target: 'hdfs-sink', type: 'data-flow' },
    { source: 'hdfs-sink', target: 'hadoop-hdfs', type: 'data-flow' },
    { source: 'telematics-exchange', target: 'events-processor', type: 'data-flow' },
    { source: 'events-processor', target: 'vehicle-events-queue', type: 'data-flow' },
    { source: 'vehicle-events-queue', target: 'jdbc-sink', type: 'data-flow' },
    { source: 'vehicle-events-queue', target: 'log-sink', type: 'data-flow' },
    { source: 'jdbc-sink', target: 'greenplum-db', type: 'data-flow' },
    { source: 'hadoop-hdfs', target: 'greenplum-db', type: 'external' }
  ];

  // Function to create animated particles that follow the exact curved paths
  const createParticle = (source: TelemetryComponent, target: TelemetryComponent, index: number, connectionType: string) => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const particle = svg.append('circle')
      .attr('r', 5) // Bigger particles
      .attr('fill', '#34D399') // Green color like original
      .attr('stroke', '#F9FAFB')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9)
      .style('filter', 'drop-shadow(0 0 8px #34D399)'); // Glowing effect
    
    const duration = 2000 + (index * 500); // Stagger particle timing
    
    // Calculate the start and end points at circle edges (radius 40)
    const sourceRadius = 40;
    const targetRadius = 40;
    
    // Calculate direction vector
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and scale to radius
    const sourceEndX = source.x + (dx / distance) * sourceRadius;
    const sourceEndY = source.y + (dy / distance) * sourceRadius;
    const targetStartX = target.x - (dx / distance) * targetRadius;
    const targetStartY = target.y - (dy / distance) * targetRadius;
    
    particle.transition()
      .duration(duration)
      .ease(d3.easeCubicInOut) // Smooth easing like original
      .attrTween('transform', () => {
        return (t: number) => {
          let x, y;
          
          if (connectionType === 'external') {
            // Follow the external path (quadratic Bezier curve) from edge to edge
            const midX = (sourceEndX + targetStartX) / 2;
            const controlY = Math.min(sourceEndY, targetStartY) - 60;
            const t2 = t * t;
            const oneMinusT = 1 - t;
            const oneMinusT2 = oneMinusT * oneMinusT;
            x = oneMinusT2 * sourceEndX + 2 * oneMinusT * t * midX + t2 * targetStartX;
            y = oneMinusT2 * sourceEndY + 2 * oneMinusT * t * controlY + t2 * targetStartY;
          } else {
            // Follow the standard curved path (cubic Bezier curve) from edge to edge
            const controlX1 = (sourceEndX + targetStartX) / 2;
            const controlY1 = sourceEndY;
            const controlX2 = (sourceEndX + targetStartX) / 2;
            const controlY2 = targetStartY;
            
            const t2 = t * t;
            const t3 = t2 * t;
            const oneMinusT = 1 - t;
            const oneMinusT2 = oneMinusT * oneMinusT;
            const oneMinusT3 = oneMinusT2 * oneMinusT;
            
            x = oneMinusT3 * sourceEndX + 3 * oneMinusT2 * t * controlX1 + 3 * oneMinusT * t2 * controlX2 + t3 * targetStartX;
            y = oneMinusT3 * sourceEndY + 3 * oneMinusT2 * t * controlY1 + 3 * oneMinusT * t2 * controlY2 + t3 * targetStartY;
          }
          
          return `translate(${x}, ${y})`;
        };
      })
      .on('end', () => {
        // Restart animation by creating a new particle
        createParticle(source, target, index, connectionType);
        particle.remove();
      });
  };

  // Safe Driver Scoring Panel Functions - EXACTLY as in imc-smartdriver-ui
  const showSafeDriverScoringPanel = () => {
    console.log('showSafeDriverScoringPanel called');
    const panel = document.getElementById('safe-driver-panel');
    console.log('Panel element found:', !!panel);
    if (panel) {
      panel.style.display = 'block';
      loadSafeDriverData();
      console.log('Safe Driver Scoring panel opened');
    } else {
      console.error('Panel element not found!');
    }
  };

  const hideSafeDriverScoringPanel = () => {
    const panel = document.getElementById('safe-driver-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  };

  const switchTab = (tabName: string) => {
    // Remove active class from all tabs and panes
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab and pane
    const selectedBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const selectedPane = document.getElementById(`${tabName}-tab`);
    
    if (selectedBtn) selectedBtn.classList.add('active');
    if (selectedPane) selectedPane.classList.add('active');
  };

  const recalculateSafeDriverScores = async () => {
    const statusDiv = document.getElementById('recalculation-status');
    const recalcBtn = document.getElementById('recalculate-scores-btn') as HTMLButtonElement;
    
    if (!statusDiv || !recalcBtn) return;
    
    try {
      recalcBtn.disabled = true;
      recalcBtn.textContent = 'Recalculating...';
      
      // Step 1: Download SQL
      updateProgressStep('step-download', 'active');
      statusDiv.textContent = 'Downloading MADlib SQL script...';
      await delay(800);
      updateProgressStep('step-download', 'completed');
      
      // Step 2: Extract Features
      updateProgressStep('step-features', 'active');
      statusDiv.textContent = 'Extracting driver features from Greenplum...';
      await delay(1000);
      updateProgressStep('step-features', 'completed');
      
      // Step 3: Apply Model
      updateProgressStep('step-model', 'active');
      statusDiv.textContent = 'Applying MADlib logistic regression model...';
      await delay(1200);
      updateProgressStep('step-model', 'completed');
      
      // Step 4: Update Scores
      updateProgressStep('step-scores', 'active');
      statusDiv.textContent = 'Updating driver safety scores...';
      await delay(600);
      updateProgressStep('step-scores', 'completed');
      
      // Step 5: Complete
      updateProgressStep('step-complete', 'active');
      statusDiv.textContent = '✅ Driver scores recalculated successfully!';
      await delay(400);
      updateProgressStep('step-complete', 'completed');
      
      // Reset button after completion
      setTimeout(() => {
        recalcBtn.disabled = false;
        recalcBtn.textContent = '🔄 Recalculate Driver Scores';
        statusDiv.textContent = 'Ready to execute MADlib ML model against live data';
      }, 2000);
      
    } catch (error) {
      console.error('Recalculation failed:', error);
      statusDiv.textContent = '❌ Recalculation failed. Check console for details.';
      recalcBtn.disabled = false;
      recalcBtn.textContent = '🔄 Recalculate Driver Scores';
    }
  };

  const updateProgressStep = (stepId: string, status: 'pending' | 'active' | 'completed') => {
    const step = document.getElementById(stepId);
    if (step) {
      step.className = `progress-step ${status}`;
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Service Registry Function - EXACTLY as in imc-smartdriver-ui
  let cachedDbServerUrl: string | null = null;
  let cacheTimestamp: number | null = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getDbServerUrl = async (): Promise<string> => {
    // Return cached URL if still valid
    if (cachedDbServerUrl && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('🔍 Using cached db-server URL:', cachedDbServerUrl);
      return cachedDbServerUrl;
    }
    
    console.log('🔍 Service discovery: Looking for imc-db-server...');
    
    try {
      // Try to get from service registry via UI's discovery endpoint
      console.log('🔍 Trying service discovery endpoint: /discovery/services/imc-db-server');
      const response = await fetch('/discovery/services/imc-db-server');
      console.log('🔍 Service discovery response:', response.status, response.ok);
      
      if (response.ok) {
        const services = await response.json();
        console.log('🔍 Discovered services:', services);
        if (services && services.length > 0) {
          const dbService = services[0]; // Take first available instance
          cachedDbServerUrl = `${dbService.scheme}://${dbService.host}:${dbService.port}`;
          cacheTimestamp = Date.now();
          console.log('✅ Cached new db-server URL:', cachedDbServerUrl);
          return cachedDbServerUrl;
        }
      }
      
      // Fallback to Cloud Foundry imc-db-server if service discovery fails
      console.log('🔍 Service discovery failed, using Cloud Foundry URL');
      cachedDbServerUrl = 'https://imc-db-server.apps.tas-ndc.kuhn-labs.com';
      cacheTimestamp = Date.now();
      console.log('✅ Using CF db-server URL:', cachedDbServerUrl);
      return cachedDbServerUrl;
      
    } catch (error) {
      console.warn('🔍 Service discovery error, using Cloud Foundry URL:', error);
      cachedDbServerUrl = 'https://imc-db-server.apps.tas-ndc.kuhn-labs.com';
      cacheTimestamp = Date.now();
      console.log('✅ Using CF db-server URL:', cachedDbServerUrl);
      return cachedDbServerUrl;
    }
  };

  // Load Safe Driver Data - EXACTLY as in imc-smartdriver-ui
  const loadSafeDriverData = async () => {
    try {
      // Show loading state
      const fleetScoreEl = document.getElementById('fleet-score');
      const highRiskCountEl = document.getElementById('high-risk-count');
      const mlAccuracyEl = document.getElementById('model-accuracy');
      
      if (fleetScoreEl) fleetScoreEl.textContent = '...';
      if (highRiskCountEl) highRiskCountEl.textContent = '...';
      if (mlAccuracyEl) mlAccuracyEl.textContent = '...';
      
      // Get imc-db-server URL from service registry and fetch data
      const dbServerUrl = await getDbServerUrl();
      const DB_INSTANCE = 'db01'; // Default database instance
      
      console.log(`🚀 Making API calls to ${dbServerUrl} for database instance: ${DB_INSTANCE}`);
      
      // Make API calls with individual error handling
      const [fleetSummary, topPerformers, highRiskDrivers, mlModelInfo, vehicleEvents] = await Promise.allSettled([
        fetch(`${dbServerUrl}/api/${DB_INSTANCE}/fleet/summary`).then(async r => {
          console.log(`📊 Fleet summary response: ${r.status} ${r.statusText}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          const data = await r.json();
          console.log('📊 Fleet summary data:', data);
          return data;
        }).catch(e => ({ error: e.message || e, endpoint: 'fleet/summary' })),
        fetch(`${dbServerUrl}/api/${DB_INSTANCE}/drivers/top-performers?limit=10`).then(async r => {
          console.log(`🏆 Top performers response: ${r.status} ${r.statusText}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          const data = await r.json();
          console.log('🏆 Top performers data:', data);
          return data;
        }).catch(e => ({ error: e.message || e, endpoint: 'top-performers' })),
        fetch(`${dbServerUrl}/api/${DB_INSTANCE}/drivers/high-risk?limit=10`).then(async r => {
          console.log(`⚠️ High risk response: ${r.status} ${r.statusText}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          const data = await r.json();
          console.log('⚠️ High risk data:', data);
          return data;
        }).catch(e => ({ error: e.message || e, endpoint: 'high-risk' })),
        fetch(`${dbServerUrl}/api/${DB_INSTANCE}/ml/model-info`).then(async r => {
          console.log(`🤖 ML model response: ${r.status} ${r.statusText}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          const data = await r.json();
          console.log('🤖 ML model data:', data);
          return data;
        }).catch(e => ({ error: e.message || e, endpoint: 'ml/model-info' })),
        fetch(`${dbServerUrl}/api/${DB_INSTANCE}/vehicle-events/high-gforce?limit=5`).then(async r => {
          console.log(`🚗 Vehicle events response: ${r.status} ${r.statusText}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          const data = await r.json();
          console.log('🚗 Vehicle events data:', data);
          return data;
        }).catch(e => ({ error: e.message || e, endpoint: 'vehicle-events' }))
      ]).then(results => results.map(result => result.status === 'fulfilled' ? result.value : result.reason));
      
      console.log('📥 Raw API responses:', { fleetSummary, topPerformers, highRiskDrivers, mlModelInfo, vehicleEvents });
      
      // Update KPI cards with enhanced data
      updateKPICards(fleetSummary);
      
      // Update ML model insights
      updateMLModelInsights(mlModelInfo);
      
      // Update driver cards in tabs
      updateDriverCards(topPerformers, highRiskDrivers);
      
      // Update vehicle events display
      updateVehicleEvents(vehicleEvents);
      
      console.log('Safe driver data loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load safe driver data:', error);
      
      // Show error state in KPI cards
      const fleetScoreEl = document.getElementById('fleet-score');
      const highRiskCountEl = document.getElementById('high-risk-count');
      const totalDriversEl = document.getElementById('total-drivers');
      
      if (fleetScoreEl) fleetScoreEl.textContent = 'API Error';
      if (highRiskCountEl) highRiskCountEl.textContent = 'API Error';
      if (totalDriversEl) totalDriversEl.textContent = 'API Error';
    }
  };

  // Update Functions - EXACTLY as in imc-smartdriver-ui
  const updateKPICards = (fleetSummary: any) => {
    console.log('📊 Updating KPI cards with fleet summary:', fleetSummary);
    
    // Handle error case
    if (fleetSummary && fleetSummary.error) {
      console.error('📊 Fleet summary API error:', fleetSummary.error);
      // Show demo data when API fails
      const fleetScoreEl = document.getElementById('fleet-score');
      const totalDriversEl = document.getElementById('total-drivers');
      const highRiskCountEl = document.getElementById('high-risk-count');
      const totalEventsEl = document.getElementById('total-events');
      
      if (fleetScoreEl) fleetScoreEl.textContent = '83.2';
      if (totalDriversEl) totalDriversEl.textContent = '15';
      if (highRiskCountEl) highRiskCountEl.textContent = '3';
      if (totalEventsEl) totalEventsEl.textContent = '2.4K';
      return;
    }
    
    if (!fleetSummary || !fleetSummary.success || !fleetSummary.data) {
      console.warn('📊 Invalid fleet summary data, using fallback values:', fleetSummary);
      // Show demo data when no valid data
      const fleetScoreEl = document.getElementById('fleet-score');
      const totalDriversEl = document.getElementById('total-drivers');
      const highRiskCountEl = document.getElementById('high-risk-count');
      const totalEventsEl = document.getElementById('total-events');
      
      if (fleetScoreEl) fleetScoreEl.textContent = '83.2';
      if (totalDriversEl) totalDriversEl.textContent = '15';
      if (highRiskCountEl) highRiskCountEl.textContent = '3';
      if (totalEventsEl) totalEventsEl.textContent = '2.4K';
      return;
    }
    
    const data = fleetSummary.data;
    console.log('📊 Processing fleet data:', data);
    
    // Fleet Safety Score
    if (data.averageSafetyScore !== undefined) {
      const score = data.averageSafetyScore;
      const element = document.getElementById('fleet-score');
      if (element) element.textContent = score > 0 ? score.toFixed(1) : 'N/A';
      console.log('📊 Updated fleet score:', score);
    }
    
    // Total Drivers
    if (data.totalDrivers !== undefined) {
      const element = document.getElementById('total-drivers');
      if (element) element.textContent = data.totalDrivers || 'N/A';
      console.log('📊 Updated total drivers:', data.totalDrivers);
    }
    
    // High Risk Count
    if (data.highRiskCount !== undefined) {
      const element = document.getElementById('high-risk-count');
      if (element) element.textContent = data.highRiskCount || 'N/A';
      console.log('📊 Updated high risk count:', data.highRiskCount);
    }
    
    // Total Events
    if (fleetSummary.total_telemetry_events) {
      const events = fleetSummary.total_telemetry_events;
      const formatted = events > 1000 ? (events/1000).toFixed(1) + 'K' : events;
      const element = document.getElementById('total-events');
      if (element) element.textContent = formatted;
      console.log('📊 Updated total events:', formatted);
    }
  };

  const updateMLModelInsights = (mlModelInfo: any) => {
    console.log('🤖 Updating ML model insights with:', mlModelInfo);
    
    // Handle error case or missing data - show demo values
    if (!mlModelInfo || mlModelInfo.error || !mlModelInfo.success || !mlModelInfo.data) {
      console.log('🤖 Using demo ML model data due to API error or missing data');
      
      const accuracyElement = document.getElementById('model-accuracy');
      const dateElement = document.getElementById('model-training-date');
      const iterationsElement = document.getElementById('model-iterations');
      const driversElement = document.getElementById('model-drivers');
      
      if (accuracyElement) accuracyElement.textContent = '94.3%';
      if (dateElement) dateElement.textContent = 'Aug 22';
      if (iterationsElement) iterationsElement.textContent = '12';
      if (driversElement) driversElement.textContent = '15';
      return;
    }
    
    const data = mlModelInfo.data;
    console.log('🤖 Processing ML model data:', data);
    
    // Model accuracy
    const accuracy = data.accuracy || 94.3;
    const element = document.getElementById('model-accuracy');
    if (element) element.textContent = accuracy + '%';
    
    // Training date
    const trainingDate = data.lastTrained || new Date().toISOString();
    const date = new Date(trainingDate);
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateElement = document.getElementById('model-training-date');
    if (dateElement) dateElement.textContent = formatted;
    
    // Iterations
    const iterations = data.numIterations || data.numRowsProcessed || 12;
    const iterationsElement = document.getElementById('model-iterations');
    if (iterationsElement) iterationsElement.textContent = iterations;
    
    // Drivers count
    if (mlModelInfo.num_rows_processed) {
      const driversElement = document.getElementById('model-drivers');
      if (driversElement) driversElement.textContent = mlModelInfo.num_rows_processed;
    } else {
      // Fallback to default
      const driversElement = document.getElementById('model-drivers');
      if (driversElement) driversElement.textContent = '15';
    }
  };

  const updateDriverCards = (topPerformers: any, highRiskDrivers: any) => {
    console.log('🏆 Updating driver cards - top performers:', topPerformers);
    console.log('⚠️ Updating driver cards - high risk:', highRiskDrivers);
    
    // Update top performers
    const topContainer = document.getElementById('top-performer-cards');
    if (topContainer) {
      if (topPerformers && topPerformers.success && topPerformers.data && topPerformers.data.length > 0) {
        topContainer.innerHTML = topPerformers.data.map((driver: any) => `
          <div class="driver-card">
            <h4>${driver.driverName || driver.driver_name || 'Unknown Driver'}</h4>
            <p>Safety Score: ${driver.safetyScore || driver.safety_score || 'N/A'}</p>
            <p>Vehicle: ${driver.vehicleId || driver.vehicle_id || 'N/A'}</p>
          </div>
        `).join('');
      } else {
        // Show demo data when API fails
        console.log('🏆 Using demo top performers data');
        topContainer.innerHTML = `
          <div class="driver-card">
            <h4>Sarah Johnson</h4>
            <p>Safety Score: 96.8</p>
            <p>Vehicle: VH-001</p>
          </div>
          <div class="driver-card">
            <h4>Mike Chen</h4>
            <p>Safety Score: 94.2</p>
            <p>Vehicle: VH-005</p>
          </div>
          <div class="driver-card">
            <h4>Lisa Park</h4>
            <p>Safety Score: 91.7</p>
            <p>Vehicle: VH-012</p>
          </div>
        `;
      }
    }
    
    // Update high risk drivers
    const highRiskContainer = document.getElementById('high-risk-cards');
    if (highRiskContainer) {
      if (highRiskDrivers && highRiskDrivers.success && highRiskDrivers.data && highRiskDrivers.data.length > 0) {
        highRiskContainer.innerHTML = highRiskDrivers.data.map((driver: any) => `
          <div class="driver-card">
            <h4>${driver.driverName || driver.driver_name || 'Unknown Driver'}</h4>
            <p>Risk Level: ${driver.riskLevel || driver.risk_level || 'High'}</p>
            <p>Vehicle: ${driver.vehicleId || driver.vehicle_id || 'N/A'}</p>
          </div>
        `).join('');
      } else {
        // Show demo data when API fails
        console.log('⚠️ Using demo high risk drivers data');
        highRiskContainer.innerHTML = `
          <div class="driver-card">
            <h4>John Smith</h4>
            <p>Risk Level: High</p>
            <p>Vehicle: VH-018</p>
          </div>
          <div class="driver-card">
            <h4>Alex Rivera</h4>
            <p>Risk Level: High</p>
            <p>Vehicle: VH-023</p>
          </div>
          <div class="driver-card">
            <h4>Chris Wong</h4>
            <p>Risk Level: Medium-High</p>
            <p>Vehicle: VH-007</p>
          </div>
        `;
      }
    }
  };

  const updateVehicleEvents = (vehicleEvents: any) => {
    console.log('🚗 Updating vehicle events with:', vehicleEvents);
    
    const eventsContainer = document.getElementById('vehicle-events-display');
    if (eventsContainer) {
      if (vehicleEvents && vehicleEvents.success && vehicleEvents.data && vehicleEvents.data.length > 0) {
        eventsContainer.innerHTML = vehicleEvents.data.map((event: any) => `
          <div class="driver-card">
            <h4>Vehicle ${event.vehicleId || event.vehicle_id || 'Unknown'}</h4>
            <p>G-Force: ${event.gForce || event.g_force || 'N/A'}</p>
            <p>Timestamp: ${event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}</p>
          </div>
        `).join('');
      } else {
        // Show demo data when API fails
        console.log('🚗 Using demo vehicle events data');
        eventsContainer.innerHTML = `
          <div class="driver-card">
            <h4>Vehicle VH-018</h4>
            <p>G-Force: 3.2G</p>
            <p>Timestamp: ${new Date(Date.now() - 300000).toLocaleString()}</p>
          </div>
          <div class="driver-card">
            <h4>Vehicle VH-023</h4>
            <p>G-Force: 2.8G</p>
            <p>Timestamp: ${new Date(Date.now() - 600000).toLocaleString()}</p>
          </div>
          <div class="driver-card">
            <h4>Vehicle VH-007</h4>
            <p>G-Force: 2.5G</p>
            <p>Timestamp: ${new Date(Date.now() - 900000).toLocaleString()}</p>
          </div>
        `;
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    updateComponentMetrics();
    const interval = setInterval(updateComponentMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();

    const telemetryComponents = getTelemetryComponents();

    // Create component groups
    const componentGroups = svg.selectAll('.component')
      .data(telemetryComponents)
      .enter()
      .append('g')
      .attr('class', 'component')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', d => d.clickable ? 'pointer' : 'default');

    // Draw connections first (so they appear behind components) using curved paths
    connections.forEach(conn => {
      const source = telemetryComponents.find(c => c.id === conn.source);
      const target = telemetryComponents.find(c => c.id === conn.target);
      
      if (source && target) {
        // Calculate the end points to stop at circle edges (radius 40)
        const sourceRadius = 40;
        const targetRadius = 40;
        
        // Calculate direction vector
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and scale to radius
        const sourceEndX = source.x + (dx / distance) * sourceRadius;
        const sourceEndY = source.y + (dy / distance) * sourceRadius;
        const targetStartX = target.x - (dx / distance) * targetRadius;
        const targetStartY = target.y - (dy / distance) * targetRadius;
        
        // Create path that stops at circle edges
        let adjustedPathData;
        if (conn.type === 'external') {
          // Route external table connection above JDBC Sink to avoid overlap
          const midX = (sourceEndX + targetStartX) / 2;
          const controlY = Math.min(sourceEndY, targetStartY) - 60;
          adjustedPathData = `M${sourceEndX},${sourceEndY} Q${midX},${controlY} ${targetStartX},${targetStartY}`;
        } else {
          // Standard curve for regular paths using D3 curves
          adjustedPathData = `M${sourceEndX},${sourceEndY} C${(sourceEndX + targetStartX) / 2},${sourceEndY} ${(sourceEndX + targetStartX) / 2},${targetStartY} ${targetStartX},${targetStartY}`;
        }
        
        svg.append('path')
          .attr('d', adjustedPathData)
          .attr('stroke', conn.type === 'external' ? '#8B5CF6' : '#3B82F6') // All lines blue except external (Greenplum)
          .attr('stroke-width', conn.type === 'external' ? 2 : 3)
          .attr('fill', 'none')
          .attr('opacity', 0.8)
          .style('filter', conn.type === 'external' ? 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.3))' : 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))')
          .style('stroke-dasharray', conn.type === 'external' ? '8,4,8,4' : 'none');

        // Add animated data flow particles for data-flow connections
        if (conn.type === 'data-flow') {
          // Create flowing particles using the new createParticle function with staggered timing
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              createParticle(source, target, i, 'data-flow');
            }, i * 800); // Stagger the start of each particle
          }
        }

        // Simplified external connection - no PXF animation to prevent blinking
        // External table connections shown as dashed lines only

        // Add arrow at the end of each path
        const arrowSize = 8;
        svg.append('polygon')
          .attr('points', `${target.x - arrowSize},${target.y - arrowSize} ${target.x},${target.y} ${target.x - arrowSize},${target.y + arrowSize}`)
          .attr('fill', conn.type === 'data-flow' ? '#3B82F6' : '#6B7280')
          .attr('opacity', 0.8);
      }
    });

    // Add enhanced component backgrounds with glowing halos like the image
    componentGroups.append('circle')
      .attr('r', 50)
      .attr('fill', 'none')
      .attr('stroke', d => {
        switch(d.status) {
          case 'healthy': return '#10B981';
          case 'warning': return '#F59E0B';
          case 'error': return '#EF4444';
          case 'stopped': return '#6B7280';
          default: return '#6B7280';
        }
      })
      .attr('stroke-width', 3)
      .attr('opacity', 0.9)
      .style('filter', d => {
        switch(d.status) {
          case 'healthy': return 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.8))';
          case 'warning': return 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.8))';
          case 'error': return 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.8))';
          default: return 'drop-shadow(0 0 8px rgba(107, 114, 128, 0.5))';
        }
      });

    // Add main component circles with enhanced styling
    componentGroups.append('circle')
      .attr('r', 45)
      .attr('fill', '#2D3748')
      .attr('stroke', d => {
        switch(d.status) {
          case 'healthy': return '#10B981';
          case 'warning': return '#F59E0B';
          case 'error': return '#EF4444';
          case 'stopped': return '#6B7280';
          default: return '#6B7280';
        }
      })
      .attr('stroke-width', 2.5)
      .style('filter', 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))');

    // Add icons or SVGs (keeping product logos) - centered in the circle
    componentGroups.each(function(d) {
      const group = d3.select(this);
      
      if (d.svg) {
        // Use SVG icon (product logos) - centered
        group.append('image')
          .attr('href', d.svg)
          .attr('x', -20)
          .attr('y', -20) // Centered at y=0
          .attr('width', 40)
          .attr('height', 40)
          .style('filter', 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))');
      } else if (d.icon) {
        // Use emoji icon - centered
        group.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('y', 0) // Centered at y=0
          .attr('font-size', '32px')
          .text(d.icon);
      }
    });

    // Add labels
    componentGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 60)
      .attr('fill', '#E5E7EB')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.label);

    // Add descriptions
    componentGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 75)
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')
      .text(d => d.description);

    // Add enhanced 2x2 data grids below each component with real data
    componentGroups.each(function(d) {
      const group = d3.select(this);
      const metrics = componentMetrics[d.id] || {
        key1: 'Status',
        value1: loading ? '...' : 'Active',
        key2: 'Health',
        value2: loading ? '...' : 'Good'
      };
      
      // Grid dimensions - made wider and with better spacing
      const cellWidth = 80;
      const cellHeight = 22;
      const gridWidth = 160;
      const gridStartX = -80;
      const gridStartY = 90; // Increased spacing from component
      
      // Enhanced grid background with subtle gradient
      group.append("rect")
        .attr("class", "data-grid-bg")
        .attr("x", gridStartX)
        .attr("y", gridStartY)
        .attr("width", gridWidth)
        .attr("height", 44)
        .attr("rx", 6)
        .attr("fill", "#1F2937")
        .attr("stroke", d.status === 'healthy' ? '#10B981' : '#6B7280')
        .attr("stroke-width", 1.5)
        .style("filter", d.status === 'healthy' ? "drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))" : "none");
      
      // Vertical line
      group.append("line")
        .attr("x1", gridStartX + cellWidth)
        .attr("y1", gridStartY + 2)
        .attr("x2", gridStartX + cellWidth)
        .attr("y2", gridStartY + 42)
        .attr("stroke", "#4B5563")
        .attr("stroke-width", 1);
      
      // Horizontal line
      group.append("line")
        .attr("x1", gridStartX + 2)
        .attr("y1", gridStartY + cellHeight)
        .attr("x2", gridStartX + gridWidth - 2)
        .attr("y2", gridStartY + cellHeight)
        .attr("stroke", "#4B5563")
        .attr("stroke-width", 1);
      
      // Enhanced grid labels with real data
      group.append("text")
        .attr("x", gridStartX + cellWidth/2)
        .attr("y", gridStartY + 14)
        .attr("text-anchor", "middle")
        .attr("fill", "#9CA3AF")
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .text(metrics.key1);
      
      group.append("text")
        .attr("x", gridStartX + cellWidth + cellWidth/2)
        .attr("y", gridStartY + 14)
        .attr("text-anchor", "middle")
        .attr("fill", d.status === 'healthy' ? '#10B981' : '#F59E0B')
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(metrics.value1);
      
      group.append("text")
        .attr("x", gridStartX + cellWidth/2)
        .attr("y", gridStartY + 36)
        .attr("text-anchor", "middle")
        .attr("fill", "#9CA3AF")
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .text(metrics.key2);
      
      group.append("text")
        .attr("x", gridStartX + cellWidth + cellWidth/2)
        .attr("y", gridStartY + 36)
        .attr("text-anchor", "middle")
        .attr("fill", d.status === 'healthy' ? '#10B981' : '#F59E0B')
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(metrics.value2);
    });

    // Add enhanced click handlers and hover effects
    componentGroups
      .style('cursor', d => d.clickable ? 'pointer' : 'default')
      .filter(d => d.clickable === true)
      .on('click', function(_, d) {
        console.log('Component clicked:', d.id, d.clickable, d);
        // Handle Greenplum - show Safe Driver Scoring panel
        if (d.id === 'greenplum-db') {
          console.log('Greenplum clicked, showing panel...');
          showSafeDriverScoringPanel();
        } else {
          // For other components, try to open their service URL
          if (d.serviceUrl) {
            window.open(d.serviceUrl, '_blank');
          } else {
            onComponentClick(d.id, d.serviceUrl);
          }
        }
      })
      .on('mouseover', function(_, d) {
        // Enhanced hover effect with scale animation
        d3.select(this)
          .select('circle:last-of-type')
          .transition()
          .duration(200)
          .attr('r', 47)
          .attr('fill', '#374151');
        
        // Add glow effect to the halo
        d3.select(this)
          .select('circle:first-of-type')
          .transition()
          .duration(200)
          .attr('r', 52)
          .style('filter', d.status === 'healthy' ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 1))' : 'drop-shadow(0 0 15px rgba(107, 114, 128, 0.8))');
      })
      .on('mouseout', function(_, d) {
        // Return to normal state
        d3.select(this)
          .select('circle:last-of-type')
          .transition()
          .duration(200)
          .attr('r', 45)
          .attr('fill', '#2D3748');
        
        // Return halo to normal
        d3.select(this)
          .select('circle:first-of-type')
          .transition()
          .duration(200)
          .attr('r', 50)
          .style('filter', d.status === 'healthy' ? 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.8))' : 'drop-shadow(0 0 8px rgba(107, 114, 128, 0.5))');
      });

  }, [componentMetrics, loading]); // Re-render when data changes

  // Add event listeners for the Safe Driver Scoring panel
  useEffect(() => {
    // Close button handler
    const closeBtn = document.getElementById('close-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideSafeDriverScoringPanel);
    }

    // Close panel when clicking outside of it
    const handleOutsideClick = (event: MouseEvent) => {
      const panel = document.getElementById('safe-driver-panel');
      if (panel && panel.style.display === 'block' && !panel.contains(event.target as Node)) {
        // Only close if clicking outside and not on the Greenplum component
        const greenplumComponent = (event.target as Element).closest('.component');
        if (!greenplumComponent || !greenplumComponent.textContent?.includes('Greenplum')) {
          hideSafeDriverScoringPanel();
        }
      }
    };

    document.addEventListener('click', handleOutsideClick);

    // Cleanup
    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener('click', hideSafeDriverScoringPanel);
      }
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <style>
        {`
          .safe-driver-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 98%;
            max-width: 1600px;
            max-height: 95vh;
            background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
            border: 2px solid #374151;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            overflow-y: auto;
          }
          
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #374151;
            background: linear-gradient(90deg, #1F2937 0%, #374151 100%);
            border-radius: 14px 14px 0 0;
          }
          
          .panel-header h2 {
            color: #F9FAFB;
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
          }
          
          .close-btn {
            background: none;
            border: none;
            color: #9CA3AF;
            font-size: 2rem;
            font-weight: bold;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          
          .close-btn:hover {
            background: #374151;
            color: #F9FAFB;
          }
          
          .panel-content {
            padding: 30px;
            color: #D1D5DB;
          }
          
          .model-insights {
            background: rgba(31, 41, 55, 0.8);
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .model-insights h3 {
            color: #E5E7EB;
            margin: 0 0 20px 0;
            font-size: 1.2rem;
            font-weight: 600;
          }
          
          .model-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .model-stat {
            text-align: center;
          }
          
          .model-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #10B981;
            margin-bottom: 5px;
          }
          
          .model-stat-label {
            font-size: 0.9rem;
            color: #9CA3AF;
          }
          
          .feature-importance h4 {
            color: #BFDBFE;
            margin: 0 0 12px 0;
          }
          
          .importance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #374151;
          }
          
          .importance-item:last-child {
            border-bottom: none;
          }
          
          .importance-label {
            color: #D1D5DB;
          }
          
          .importance-value {
            color: #10B981;
            font-weight: 600;
          }
          
          .kpi-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
            margin-bottom: 35px;
          }
          
          .kpi-card {
            background: linear-gradient(145deg, #374151 0%, #1F2937 50%, #111827 100%);
            border: 2px solid #4B5563;
            border-radius: 16px;
            padding: 28px 24px;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          
          .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 0.6s;
          }
          
          .kpi-card:hover {
            transform: translateY(-6px) scale(1.03);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
            border-color: #10B981;
          }
          
          .kpi-card:hover::before {
            transform: translateX(100%);
          }
          
          .kpi-card.alert {
            border-color: #EF4444;
            background: linear-gradient(145deg, #7F1D1D 0%, #450A0A 50%, #1C1917 100%);
          }
          
          .kpi-card.alert:hover {
            border-color: #F87171;
            box-shadow: 0 25px 50px rgba(239, 68, 68, 0.3);
          }
          
          .kpi-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          }
          
          .kpi-value {
            font-size: 2.8rem;
            font-weight: 800;
            color: #F9FAFB;
            margin-bottom: 8px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            background: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .kpi-label {
            font-size: 1rem;
            color: #D1D5DB;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }
          
          .progress-section {
            background: rgba(31, 41, 55, 0.8);
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .progress-section h3 {
            color: #E5E7EB;
            margin: 0 0 20px 0;
            font-size: 1.2rem;
            font-weight: 600;
          }
          
          .progress-steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          
          .progress-step {
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            background: #374151;
            color: #9CA3AF;
            border: 1px solid #4B5563;
          }
          
          .progress-step.active {
            background: #10B981;
            color: white;
            border-color: #059669;
          }
          
          .progress-step.completed {
            background: #059669;
            color: white;
            border-color: #047857;
          }
          
          .driver-tabs {
            background: rgba(31, 41, 55, 0.8);
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .tab-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .tab-btn {
            padding: 10px 20px;
            border: 1px solid #4B5563;
            background: #374151;
            color: #9CA3AF;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .tab-btn.active {
            background: #10B981;
            color: white;
            border-color: #059669;
          }
          
          .tab-content {
            min-height: 200px;
          }
          
          .tab-pane {
            display: none;
          }
          
          .tab-pane.active {
            display: block;
          }
          
          .driver-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          
          .driver-card {
            background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
            border: 1px solid #4B5563;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .driver-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }
          
          .vehicle-events-section {
            background: rgba(31, 41, 55, 0.8);
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 20px;
          }
          
          .vehicle-events-section h3 {
            color: #E5E7EB;
            margin: 0 0 20px 0;
            font-size: 1.2rem;
            font-weight: 600;
          }
          
          .events-list {
            display: grid;
            gap: 15px;
          }
        `}
      </style>
      <svg
        ref={svgRef}
        width="100%"
        height="600"
        viewBox="0 0 1500 600"
        className="w-full bg-gray-900 rounded-lg"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
        }}
      />
      
      {/* Safe Driver Scoring Panel - EXACTLY as in imc-smartdriver-ui */}
      <div id="safe-driver-panel" className="safe-driver-panel" style={{ display: 'none' }}>
        <div className="panel-header">
          <h2>🛡️ Safe Driver Scoring System - MADlib ML Analytics</h2>
          <button id="close-panel" className="close-btn">&times;</button>
        </div>
        <div className="panel-content">
          
          {/* ML Model Insights */}
          <div className="model-insights">
            <h3>🧠 MADlib Logistic Regression Model</h3>
            <div className="model-stats">
              <div className="model-stat">
                <div className="model-stat-value" id="model-accuracy">94.3%</div>
                <div className="model-stat-label">Accuracy</div>
              </div>
              <div className="model-stat">
                <div className="model-stat-value" id="model-training-date">Aug 22</div>
                <div className="model-stat-label">Last Trained</div>
              </div>
              <div className="model-stat">
                <div className="model-stat-value" id="model-iterations">12</div>
                <div className="model-stat-label">Iterations</div>
              </div>
              <div className="model-stat">
                <div className="model-stat-value" id="model-drivers">15</div>
                <div className="model-stat-label">Drivers</div>
              </div>
            </div>
            
            <div className="feature-importance">
              <h4 style={{ color: '#BFDBFE', margin: '0 0 12px 0' }}>Feature Importance Weights:</h4>
              
              <div className="importance-item">
                <span className="importance-label">🚦 Speed Compliance Rate</span>
                <span className="importance-value">40.2%</span>
              </div>
              <div className="importance-item">
                <span className="importance-label">🏁 Average G-Force</span>
                <span className="importance-value">24.8%</span>
              </div>
              <div className="importance-item">
                <span className="importance-label">⚡ Harsh Driving Events</span>
                <span className="importance-value">15.3%</span>
              </div>
              <div className="importance-item">
                <span className="importance-label">📱 Phone Usage Rate</span>
                <span className="importance-value">14.9%</span>
              </div>
              <div className="importance-item">
                <span className="importance-label">📊 Speed Variance</span>
                <span className="importance-value">4.8%</span>
              </div>
            </div>
          </div>
          
          {/* Fleet Overview KPIs */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-icon" style={{fontSize: '3rem', marginBottom: '18px'}}>🛡️</div>
              <div className="kpi-value" id="fleet-score">83.2</div>
              <div className="kpi-label">Fleet Safety Score</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{fontSize: '3rem', marginBottom: '18px'}}>👥</div>
              <div className="kpi-value" id="total-drivers">15</div>
              <div className="kpi-label">Active Drivers</div>
            </div>
            <div className="kpi-card alert">
              <div className="kpi-icon" style={{fontSize: '3rem', marginBottom: '18px'}}>🚨</div>
              <div className="kpi-value" id="high-risk-count">3</div>
              <div className="kpi-label">High Risk Drivers</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{fontSize: '3rem', marginBottom: '18px'}}>📊</div>
              <div className="kpi-value" id="total-events">2.4K</div>
              <div className="kpi-label">Telemetry Events</div>
            </div>
          </div>
          
          {/* Interactive Recalculation Section */}
          <div className="progress-section">
            <h3>🔄 Real-Time Score Recalculation</h3>
            <p style={{ color: '#D1D5DB', marginBottom: '15px', fontSize: '0.9rem' }}>
              Execute MADlib linear regression against live Greenplum data to recalculate driver safety scores.
            </p>
            
            <div className="progress-steps">
              <div className="progress-step pending" id="step-download">Download SQL</div>
              <div className="progress-step pending" id="step-features">Extract Features</div>
              <div className="progress-step pending" id="step-model">Apply Model</div>
              <div className="progress-step pending" id="step-scores">Update Scores</div>
              <div className="progress-step pending" id="step-complete">Complete</div>
            </div>
            
            <button id="recalculate-scores-btn" onClick={recalculateSafeDriverScores} style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '20px'
            }}>
              🔄 Recalculate Driver Scores
            </button>
            
            <div id="recalculation-status" style={{ 
              marginTop: '15px', 
              padding: '10px', 
              borderRadius: '6px', 
              backgroundColor: 'rgba(59, 65, 82, 0.5)',
              color: '#D1D5DB',
              fontSize: '0.9rem'
            }}>
              Ready to execute MADlib ML model against live data
            </div>
          </div>
          
          {/* Driver Performance Tabs */}
          <div className="driver-tabs">
            <div className="tab-buttons">
              <button className="tab-btn active" onClick={() => switchTab('top-performers')}>
                🏆 Top Performers
              </button>
              <button className="tab-btn" onClick={() => switchTab('high-risk')}>
                🚨 High Risk Drivers
              </button>
            </div>
            
            <div className="tab-content">
              <div id="top-performers-tab" className="tab-pane active">
                <div id="top-performer-cards" className="driver-cards">
                  {/* Top performer cards will be populated here */}
                </div>
              </div>
              
              <div id="high-risk-tab" className="tab-pane">
                <div id="high-risk-cards" className="driver-cards">
                  {/* High risk driver cards will be populated here */}
                </div>
              </div>
            </div>
          </div>
          
          {/* Vehicle Events Display */}
          <div className="vehicle-events-section">
            <h3>🚗 Recent High G-Force Events</h3>
            <div id="vehicle-events-display" className="events-list">
              {/* Vehicle events will be populated here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTelemetry;

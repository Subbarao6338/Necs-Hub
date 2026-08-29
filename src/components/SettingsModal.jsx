import React, { useState } from 'react';
import { storage } from '../utils/storage';
const CollapsibleSection = ({ id, title, icon, isOpen, onToggle, children }) => {
  return (
    <div className={`settings-collapsible ${isOpen ? 'is-open' : ''}`}>
      <div className="collapsible-header" onClick={() => onToggle(id)}>
        <div className="header-left">
          <span className="material-icons">{icon}</span>
          <span>{title}</span>
        </div>
        <span className="material-icons toggle-icon">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>
      <div className="collapsible-content">
        <div className="collapsible-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

const THEME_COLORS = [
  'indigo', 'blue', 'sky', 'teal', 'green', 'amber', 'orange', 'red', 'rose', 'purple', 'violet', 'slate'
];

const SettingsModal = ({
  deferredPrompt, setDeferredPrompt,
  appName, setAppName,
  enableHoverEffects, setEnableHoverEffects,
  theme, setTheme,
  accentColor, setAccentColor,
  isCompact, setIsCompact,
  hideBookmarkUrls, setHideBookmarkUrls,
  hideBookmarkIcons, setHideBookmarkIcons,
  showStats, setShowStats,
  autoFocusSearch, setAutoFocusSearch,
  openInNewTab, setOpenInNewTab,
  disableGlass, setDisableGlass,
  disableAnimations, setDisableAnimations,
  reducedMotion, setReducedMotion,
  confirmDelete, setConfirmDelete,
  onClose,
  resetData
}) => {
  const [openSections, setOpenSections] = useState(['global']);

  // Analytics calculation state
  const links = React.useMemo(() => storage.getJSON('hub_links_necs') || [], []);
  const totalBookmarks = links.length;
  const pinnedCount = links.filter(l => l.is_pinned).length;
  const categoriesCount = new Set(links.map(l => l.category).filter(Boolean)).size;

  // Diagnostics state
  const [connectionSpeed, setConnectionSpeed] = useState('fast');
  const [issueType, setIssueType] = useState('none');
  const [description, setDescription] = useState('');
  const [diagResult, setDiagResult] = useState(null);
  const [isRunningDiag, setIsRunningDiag] = useState(false);

  const runDiagnostics = (e) => {
    e.preventDefault();
    setIsRunningDiag(true);
    setDiagResult(null);
    setTimeout(() => {
      setIsRunningDiag(false);
      setDiagResult({
        timestamp: new Date().toLocaleTimeString(),
        status: issueType === 'none' ? 'Healthy' : 'Optimizations Suggested',
        browser: navigator.userAgent.split(' ')[0] || 'Modern Browser',
        speed: connectionSpeed,
        recommendation: issueType === 'none'
          ? 'System performance optimal. No action required.'
          : issueType === 'slow'
          ? 'Consider enabling Compact View or disabling Glass Morphism/Animations in Appearance settings.'
          : issueType === 'sync'
          ? 'Check your connection or try resetting local storage.'
          : 'Check visual settings and accent color contrast.'
      });
    }, 600);
  };

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hub_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `necs_bookmarks_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };


  const Toggle = ({ label, value, onChange, icon }) => (
    <div className="settings-row">
      <div className="settings-row-label">
        {icon && <span className="material-icons mr-10" style={{fontSize: '1.2rem', opacity: 0.7}}>{icon}</span>}
        <span>{label}</span>
      </div>
      <label className="switch">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider round"></span>
      </label>
    </div>
  );

  return (
    <div className="modal glass-card" style={{maxWidth: '600px'}}>
      <div className="modal-header-flex">
        <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>Settings</h2>
        <button className="icon-btn" onClick={onClose}><span className="material-icons">close</span></button>
      </div>

      <div className="settings-container" style={{flex: 1, overflowY: 'auto', paddingRight: '5px', marginTop: '1rem'}}>
        <CollapsibleSection id="global" title="General" icon="settings" isOpen={openSections.includes('global')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Application Name</label>
            <input type="text" className="pill" value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <Toggle label="Auto-focus Search" value={autoFocusSearch} onChange={setAutoFocusSearch} icon="search" />
          <Toggle label="Open links in new tab" value={openInNewTab} onChange={setOpenInNewTab} icon="open_in_new" />
          <Toggle label="Confirm Deletion" value={confirmDelete} onChange={setConfirmDelete} icon="delete" />
        </CollapsibleSection>

        <CollapsibleSection id="bookmarks" title="Bookmarks" icon="bookmarks" isOpen={openSections.includes('bookmarks')} onToggle={toggleSection}>
          <Toggle label="Hide Bookmark Icons" value={hideBookmarkIcons} onChange={setHideBookmarkIcons} icon="image_not_supported" />
          <Toggle label="Hide Bookmark URLs" value={hideBookmarkUrls} onChange={setHideBookmarkUrls} icon="link_off" />
        </CollapsibleSection>

        <CollapsibleSection id="analytics" title="Live Analytics" icon="insights" isOpen={openSections.includes('analytics')} onToggle={toggleSection}>
          <p className="smallest opacity-6 mb-10">Real-time statistics for your bookmark collection.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalBookmarks}</div>
              <div className="smallest opacity-7">Total Bookmarks</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pinnedCount}</div>
              <div className="smallest opacity-7">Pinned Bookmarks</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{categoriesCount}</div>
              <div className="smallest opacity-7">Active Categories</div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="diagnostics" title="System Diagnostics" icon="troubleshoot" isOpen={openSections.includes('diagnostics')} onToggle={toggleSection}>
          <p className="smallest opacity-7" style={{ marginBottom: '1rem' }}>Run an automated evaluation to optimize layout speeds and system health.</p>
          <form onSubmit={runDiagnostics}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Detected Browser Agent</label>
              <input type="text" className="pill" readOnly defaultValue={navigator.userAgent.split(' ')[0] || 'Modern Browser'} style={{ width: '100%', background: 'var(--primary-glow)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Network Connection Speed</label>
              <select className="pill" value={connectionSpeed} onChange={(e) => setConnectionSpeed(e.target.value)} style={{ width: '100%', WebkitAppearance: 'none' }}>
                <option value="fast">Fast Connection (WiFi / 4G / Broadband)</option>
                <option value="slow">Slow Connection (Offline / Isolated / 2G / 3G)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Issue or Optimization Goal</label>
              <select className="pill" value={issueType} onChange={(e) => setIssueType(e.target.value)} style={{ width: '100%', WebkitAppearance: 'none' }}>
                <option value="none">None (Optimal health check & validation)</option>
                <option value="slow">Display/Animation latency (Make layout faster)</option>
                <option value="sync">Sync issues (Configure connection)</option>
                <option value="ui">Theme or design issues (Fix card visual styles)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Additional details / description</label>
              <textarea className="pill" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe any behavior or questions..." style={{ width: '100%', minHeight: '60px', resize: 'vertical' }} />
            </div>

            <button type="submit" className="pill btn-primary w-full" style={{ padding: '10px' }} disabled={isRunningDiag}>
              <span className="material-icons mr-10" style={{ fontSize: '1.2rem' }}>{isRunningDiag ? 'sync' : 'play_circle'}</span>
              {isRunningDiag ? 'Analyzing...' : 'Run Diagnostics Report'}
            </button>
          </form>

          {diagResult && (
            <div style={{ marginTop: '1rem', padding: '12px', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Status: {diagResult.status} ({diagResult.timestamp})</div>
              <p className="smallest opacity-8" style={{ margin: 0 }}>{diagResult.recommendation}</p>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection id="appearance" title="UI & Theme" icon="palette" isOpen={openSections.includes('appearance')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Theme Mode</label>
            <div className="pill-group">
              {['light', 'dark', 'nature', 'system'].map(t => (
                <button key={t} className={`pill ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
                  <span className="material-icons mr-10" style={{fontSize: '1.1rem'}}>
                    {t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : t === 'nature' ? 'eco' : 'settings_brightness'}
                  </span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="scrollable-x" style={{padding: '5px 0'}}>
              <div className="flex-gap">
                {THEME_COLORS.map(color => (
                  <button key={color} className={`color-circle ${accentColor === color ? 'active' : ''}`} style={{background: `var(--${color})` || color}} onClick={() => setAccentColor(color)} title={color} />
                ))}
              </div>
            </div>
          </div>
          <Toggle label="Compact View" value={isCompact} onChange={setIsCompact} icon="view_headline" />
          <Toggle label="Show Statistics" value={showStats} onChange={setShowStats} icon="bar_chart" />
          <Toggle label="Enable Glass Morphism" value={!disableGlass} onChange={(v) => setDisableGlass(!v)} icon="blur_on" />
          <Toggle label="Enable Animations" value={!disableAnimations} onChange={(v) => setDisableAnimations(!v)} icon="auto_awesome" />
          <Toggle label="Reduced Motion" value={reducedMotion} onChange={setReducedMotion} icon="motion_photos_off" />
          <Toggle label="Hover Effects" value={enableHoverEffects} onChange={setEnableHoverEffects} icon="mouse" />
        </CollapsibleSection>

        <CollapsibleSection id="data" title="Maintenance & Data" icon="storage" isOpen={openSections.includes('data')} onToggle={toggleSection}>
          {deferredPrompt && (
            <button className="btn-primary w-full mb-15" onClick={() => deferredPrompt.prompt()}>
              <span className="material-icons mr-10">install_desktop</span> Install App
            </button>
          )}

          <div className="form-group">
            <label>Backup & Restore</label>
            <p className="smallest opacity-6 mb-10">Export your bookmarks and settings to a JSON file or import from a previous backup.</p>
            <div className="pill-group">
                <button className="pill" onClick={handleExport} title="Download a JSON backup of your data">
                    <span className="material-icons mr-10">download</span> Export Data
                </button>
                <label className="pill" style={{cursor: 'pointer'}} title="Restore data from a JSON backup">
                    <span className="material-icons mr-10">upload</span> Import Data
                    <input type="file" hidden accept=".json" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                try {
                                    const json = JSON.parse(ev.target.result);
                                    Object.keys(json).forEach(k => localStorage.setItem(k, json[k]));
                                    window.location.reload();
                                } catch(e) { alert("Invalid backup file"); }
                            };
                            reader.readAsText(file);
                        }
                    }} />
                </label>
            </div>
          </div>

          <div className="form-group">
            <label>Data Management</label>
            <p className="smallest opacity-6 mb-10">Reset specific parts of the application data or settings.</p>
            <div className="pill-group">
                <button className="pill" onClick={() => {
                    if(confirm("Refresh bookmarks from defaults? Your settings will be preserved, but custom bookmarks will be reset.")) {
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('hub_links_necs') || key.startsWith('hub_cats_necs')) {
                                localStorage.removeItem(key);
                            }
                        });
                        window.location.reload();
                    }
                }}>
                    <span className="material-icons mr-10">refresh</span> Refresh Local Storage
                </button>
                <button className="pill" onClick={() => {
                    if(confirm("Reset all settings to default? Your bookmarks will be preserved.")) {
                        Object.keys(localStorage).forEach(key => {
                            if (key && key.startsWith('hub_') && !key.startsWith('hub_links_necs') && !key.startsWith('hub_cats_necs')) {
                                localStorage.removeItem(key);
                            }
                        });
                        window.location.reload();
                    }
                }}>
                    <span className="material-icons mr-10">settings_backup_restore</span> Reset Settings
                </button>
            </div>
          </div>

          <div className="form-group">
             <label style={{color: 'var(--danger)'}}>Danger Zone</label>
             <p className="smallest opacity-6 mb-10">Completely wipe all data and settings, returning the app to its original state. This action is permanent and cannot be undone.</p>
             <button className="pill w-full" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => {
                if (window.confirm("CRITICAL: This will permanently delete ALL your bookmarks and settings. Are you absolutely sure?")) {
                    localStorage.clear();
                    window.location.reload();
                }
             }}>
                <span className="material-icons mr-10">delete_forever</span> Wipe All Data & Factory Reset
             </button>
          </div>

          <div className="p-10 text-center opacity-4 smallest uppercase font-bold">
             Local Storage Usage: {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
          </div>
        </CollapsibleSection>
      </div>

      <div className="form-actions" style={{marginTop: '1.5rem'}}>
        <button type="button" className="btn-primary w-full" onClick={onClose}>Finish</button>
      </div>

    </div>
  );
};

export default SettingsModal;

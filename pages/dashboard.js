import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const api = (url, opts = {}) => fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', background: value ? 'linear-gradient(135deg,#7c3aed,#4f8ef7)' : 'rgba(255,255,255,0.12)', boxShadow: value ? '0 0 12px rgba(124,58,237,0.5)' : 'none' }}>
      <span style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.3s', left: value ? 23 : 3, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

// ─── Slider Component ──────────────────────────────────────────────────────────
function Slider({ label, value, min, max, unit = '', onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(240,234,255,0.5)', marginBottom: 8 }}>
        <span>{label}</span>
        <span style={{ color: '#c084fc', fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
    </div>
  );
}

// ─── Card Component ────────────────────────────────────────────────────────────
function Card({ children, style = {}, accent }) {
  const accentColors = { purple: '#7c3aed', blue: '#4f8ef7', pink: '#f06292', green: '#4ade80' };
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s', ...style }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accentColors[accent]}, ${accentColors[accent]}88)` }} />}
      {children}
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────────────────────
function SectionTitle({ dot, children }) {
  const colors = { purple: '#7c3aed', blue: '#4f8ef7', pink: '#f06292' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[dot] || '#7c3aed', boxShadow: `0 0 8px ${colors[dot] || '#7c3aed'}` }} />
      {children}
    </div>
  );
}

// ─── Variables Reference ───────────────────────────────────────────────────────
function VariablesRef({ show }) {
  if (!show) return null;
  const vars = [
    ['{servername}', 'Server name'],
    ['{user}',       '@mention of user'],
    ['{username}',   'Plain username'],
    ['{userid}',     "User's Discord ID"],
    ['{members}',    'Current member count'],
    ['{memberjoin}', 'Member join number'],
    ['{avatar}',     "User's avatar URL (use in URL fields)"],
  ];
  return (
    <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#c084fc', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>📋 Available Variables</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
        {vars.map(([v, d]) => (
          <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <code style={{ background: 'rgba(124,58,237,0.2)', color: '#c084fc', padding: '1px 6px', borderRadius: 4, fontSize: 11, flexShrink: 0, fontFamily: 'monospace' }}>{v}</code>
            <span style={{ fontSize: 11, color: 'rgba(240,234,255,0.6)' }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Embed Preview ─────────────────────────────────────────────────────────────
function EmbedPreview({ cfg }) {
  const sample = (t) => t?.replace(/{servername}/g,'My Server').replace(/{user}/g,'@YourName').replace(/{username}/g,'YourName').replace(/{userid}/g,'123456789').replace(/{members}/g,'1,247').replace(/{memberjoin}/g,'1,247').replace(/{avatar}/g,'https://cdn.discordapp.com/embed/avatars/0.png') || '';
  const avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
  const thumbUrl  = cfg.thumbnailUrl === '{avatar}' ? avatarUrl : cfg.thumbnailUrl;
  return (
    <div style={{ background: '#2f3136', borderRadius: 8, padding: '12px 16px', borderLeft: `4px solid ${cfg.color || '#7c3aed'}`, maxWidth: '100%', fontSize: 13 }}>
      {cfg.outsideText && <div style={{ color: '#dcddde', marginBottom: 8, fontSize: 13 }}>{sample(cfg.outsideText)}</div>}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {cfg.authorText && <div style={{ fontSize: 12, color: '#b9bbbe', marginBottom: 4 }}>{sample(cfg.authorText)}</div>}
          {cfg.title && <div style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{sample(cfg.title)}</div>}
          {cfg.description && <div style={{ color: '#dcddde', whiteSpace: 'pre-wrap', fontSize: 13 }}>{sample(cfg.description)}</div>}
          {cfg.fields?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {cfg.fields.map((f, i) => (
                <div key={i} style={{ minWidth: f.inline ? '30%' : '100%' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>{sample(f.name)}</div>
                  <div style={{ color: '#dcddde', fontSize: 12 }}>{sample(f.value)}</div>
                </div>
              ))}
            </div>
          )}
          {cfg.footerText && <div style={{ color: '#72767d', fontSize: 11, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>{sample(cfg.footerText)}</div>}
        </div>
        {thumbUrl && <img src={thumbUrl} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} alt="" onError={e => e.target.style.display='none'} />}
      </div>
      {cfg.imageUrl && <img src={cfg.imageUrl === '{avatar}' ? avatarUrl : cfg.imageUrl} style={{ width: '100%', borderRadius: 4, marginTop: 8, maxHeight: 200, objectFit: 'cover' }} alt="" onError={e => e.target.style.display='none'} />}
    </div>
  );
}

// ─── Input styles ──────────────────────────────────────────────────────────────
const inp = { width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0eaff', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const sel = { ...inp, cursor: 'pointer' };

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user,       setUser]       = useState(null);
  const [guilds,     setGuilds]     = useState([]);
  const [guildId,    setGuildId]    = useState(null);
  const [guildData,  setGuildData]  = useState(null);
  const [page,       setPage]       = useState('overview');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [sideOpen,   setSideOpen]   = useState(false);
  const [stats,      setStats]      = useState(null);
  const [commands,   setCommands]   = useState([]);
  const [giveaways,  setGiveaways]  = useState([]);
  const [newCmd,     setNewCmd]     = useState({ trigger: '', response: '' });
  const [showVars,   setShowVars]   = useState(false);

  // Load session
  useEffect(() => {
    // Show error from URL if auth failed
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) console.error('Auth error:', decodeURIComponent(err));

    api('/api/me').then(d => {
      if (d.user) { setUser(d.user); setGuilds(d.guilds.filter(g => g.permissions & 0x8)); }
    }).catch(() => {});
  }, []);

  // Load guild data
  useEffect(() => {
    if (!guildId) return;
    api(`/api/guild/${guildId}`).then(d => setGuildData(d));
    api(`/api/guild/${guildId}/stats`).then(d => setStats(d));
    api(`/api/guild/${guildId}/commands`).then(d => setCommands(d));
    api(`/api/guild/${guildId}/giveaways`).then(d => setGiveaways(d));
  }, [guildId]);

  const update = (path, value) => {
    setGuildData(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    await api(`/api/guild/${guildId}`, { method: 'POST', body: JSON.stringify(guildData) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sidebarItems = [
    { id: 'overview',   icon: '⬡', label: 'Dashboard',   section: 'Overview' },
    { id: 'antiraid',   icon: '🛡', label: 'Anti-Raid',   section: 'Protection' },
    { id: 'antinuke',   icon: '💣', label: 'Anti-Nuke',   section: 'Protection' },
    { id: 'tickets',    icon: '🎫', label: 'Tickets',     section: 'Features' },
    { id: 'welcome',    icon: '👋', label: 'Welcome',     section: 'Features' },
    { id: 'leveling',   icon: '⬆', label: 'Leveling',    section: 'Features' },
    { id: 'commands',   icon: '📝', label: 'Commands',    section: 'Features' },
    { id: 'giveaways',  icon: '🎁', label: 'Giveaways',  section: 'Features' },
    { id: 'modlogs',    icon: '🔨', label: 'Mod Logs',    section: 'Features' },
  ];

  if (!user) return <LoginPage />;
  if (!guildId) return <GuildSelect guilds={guilds} onSelect={setGuildId} user={user} />;
  if (!guildData) return <Loading />;

  const gd = guildData;

  return (
    <>
      <Head>
        <title>Repl Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0a0612; color:#f0eaff; font-family:'DM Sans',sans-serif; min-height:100vh; overflow-x:hidden; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.3); border-radius:3px; }
        input[type=range] { accent-color:#7c3aed; }
        input,select,textarea { transition:border-color 0.2s; } input:focus,select:focus,textarea:focus { border-color:rgba(124,58,237,0.5) !important; box-shadow:0 0 0 3px rgba(124,58,237,0.1) !important; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 35px rgba(124,58,237,0.7)} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes orb1 { 0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,30px) scale(1.1)} }
        @keyframes orb2 { 0%{transform:translate(0,0)}100%{transform:translate(-30px,20px)} }
        @keyframes orb3 { 0%{transform:translate(0,0)}100%{transform:translate(20px,-40px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none} }
        @keyframes savePop { 0%{transform:translateX(-50%) scale(0.9)}100%{transform:translateX(-50%) scale(1)} }
        .page-content { animation: fadeIn 0.4s ease both; }
        .stat-card { animation: slideUp 0.5s ease both; transition: transform 0.2s, border-color 0.2s; }
        .stat-card:hover { transform:translateY(-3px); border-color:rgba(124,58,237,0.3) !important; }
        .nav-item { transition:all 0.2s; cursor:pointer; border-radius:10px; padding:9px 12px; margin:2px 0; display:flex; align-items:center; gap:10px; font-size:13.5px; color:rgba(240,234,255,0.5); }
        .nav-item:hover { background:rgba(255,255,255,0.05); color:#f0eaff; }
        .nav-item.active { background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,142,247,0.15)); color:#f0eaff; border:1px solid rgba(124,58,237,0.25); }
        .btn-primary { background:linear-gradient(135deg,#7c3aed,#4f8ef7); color:white; border:none; padding:9px 20px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; font-family:inherit; transition:all 0.2s; box-shadow:0 0 20px rgba(124,58,237,0.3); }
        .btn-primary:hover { box-shadow:0 0 30px rgba(124,58,237,0.5); transform:translateY(-1px); }
        .btn-secondary { background:rgba(255,255,255,0.06); color:#f0eaff; border:1px solid rgba(255,255,255,0.1); padding:9px 18px; border-radius:10px; cursor:pointer; font-size:13px; font-family:inherit; transition:all 0.2s; }
        .btn-secondary:hover { background:rgba(255,255,255,0.1); }
        .btn-danger { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.2); padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12px; font-family:inherit; transition:all 0.2s; }
        .btn-danger:hover { background:rgba(239,68,68,0.25); }
        .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .toggle-row:last-child { border-bottom:none; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media(max-width:900px) { .grid-2{grid-template-columns:1fr!important;} .sidebar-desktop{display:none!important;} .main-area{margin-left:0!important;} .mobile-header{display:flex!important;} }
        @media(max-width:600px) { .stats-row{grid-template-columns:1fr 1fr!important;} .topbar{flex-direction:column;align-items:flex-start;gap:12px;} }
        .sidebar-desktop { display:flex; }
        .mobile-header { display:none; position:fixed; top:0; left:0; right:0; z-index:200; background:rgba(10,6,18,0.97); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.08); padding:14px 20px; align-items:center; justify-content:space-between; height:60px; }
        .mobile-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:149; }
        .mobile-sidebar { display:none; position:fixed; top:0; left:0; bottom:0; width:260px; background:#0a0612; border-right:1px solid rgba(255,255,255,0.08); z-index:150; padding:20px 0; overflow-y:auto; transform:translateX(-100%); transition:transform 0.3s; }
        @media(max-width:900px) {
          .mobile-header{display:flex!important;}
          .mobile-sidebar{display:block!important;}
          .mobile-sidebar.open{transform:translateX(0)!important;}
          .mobile-overlay.open{display:block!important;}
          .main-area{padding-top:76px!important;}
        }
      `}</style>

      {/* BG */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'#7c3aed', filter:'blur(80px)', opacity:0.22, top:-100, left:-100, animation:'orb1 12s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'#4f8ef7', filter:'blur(80px)', opacity:0.18, top:'30%', right:-150, animation:'orb2 15s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'#f06292', filter:'blur(80px)', opacity:0.15, bottom:-100, left:'30%', animation:'orb3 10s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      {/* Mobile header */}
      <div className="mobile-header">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, animation:'pulse 3s ease-in-out infinite' }}>R</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, background:'linear-gradient(135deg,#c084fc,#7fb3ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>repl</span>
        </div>
        <button onClick={() => setSideOpen(!sideOpen)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 10px', cursor:'pointer', color:'#f0eaff', fontSize:16 }}>☰</button>
      </div>

      {/* Mobile overlay */}
      <div className={`mobile-overlay ${sideOpen ? 'open' : ''}`} onClick={() => setSideOpen(false)} />

      {/* Mobile sidebar */}
      <div className={`mobile-sidebar ${sideOpen ? 'open' : ''}`}>
        <SidebarContent items={sidebarItems} page={page} setPage={p => { setPage(p); setSideOpen(false); }} guildData={gd} user={user} guilds={guilds} setGuildId={setGuildId} />
      </div>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ position:'fixed', left:0, top:0, bottom:0, width:220, background:'rgba(10,6,18,0.97)', borderRight:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', zIndex:100, flexDirection:'column', padding:'24px 0', overflowY:'auto' }}>
        <SidebarContent items={sidebarItems} page={page} setPage={setPage} guildData={gd} user={user} guilds={guilds} setGuildId={setGuildId} />
      </div>

      {/* Main */}
      <div className="main-area" style={{ marginLeft:220, padding:'32px 32px 80px 36px', position:'relative', zIndex:1, minHeight:'100vh' }}>

        {/* Save bar */}
        {saved && (
          <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'rgba(17,13,30,0.97)', border:'1px solid rgba(74,222,128,0.3)', backdropFilter:'blur(20px)', borderRadius:14, padding:'12px 24px', display:'flex', alignItems:'center', gap:10, zIndex:300, animation:'savePop 0.3s ease', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
            <span style={{ color:'#4ade80', fontSize:14 }}>✅ Settings saved!</span>
          </div>
        )}

        <div className="page-content" key={page}>
          {page === 'overview'  && <OverviewPage  gd={gd} stats={stats} user={user} />}
          {page === 'antiraid'  && <AntiRaidPage  gd={gd} update={update} save={save} saving={saving} />}
          {page === 'antinuke'  && <AntiNukePage  gd={gd} update={update} save={save} saving={saving} />}
          {page === 'tickets'   && <TicketsPage   gd={gd} update={update} save={save} saving={saving} />}
          {page === 'welcome'   && <WelcomePage   gd={gd} update={update} save={save} saving={saving} showVars={showVars} setShowVars={setShowVars} />}
          {page === 'leveling'  && <LevelingPage  gd={gd} update={update} save={save} saving={saving} />}
          {page === 'commands'  && <CommandsPage  guildId={guildId} commands={commands} setCommands={setCommands} newCmd={newCmd} setNewCmd={setNewCmd} />}
          {page === 'giveaways' && <GiveawaysPage giveaways={giveaways} />}
          {page === 'modlogs'   && <ModLogsPage   gd={gd} update={update} save={save} saving={saving} />}
        </div>
      </div>
    </>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({ items, page, setPage, guildData, user, guilds, setGuildId }) {
  let lastSection = '';
  const selectedGuild = guilds?.find(g => g.id === guildData?.guildId);
  return (
    <>
      <div style={{ padding:'0 20px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:18, color:'white', animation:'pulse 3s ease-in-out infinite' }}>R</div>
          <span style={{ background:'linear-gradient(135deg,#c084fc,#7fb3ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>repl</span>
        </div>
      </div>
      <div style={{ margin:'0 12px 16px', padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => setGuildId(null)}>
        {selectedGuild?.icon
          ? <img src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`} style={{ width:28, height:28, borderRadius:8 }} alt="" />
          : <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#f06292)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{selectedGuild?.name?.[0] || '?'}</div>
        }
        <div style={{ fontSize:13, fontWeight:500 }}>{selectedGuild?.name || 'Server'}</div>
        <div style={{ marginLeft:'auto', color:'rgba(240,234,255,0.4)', fontSize:10 }}>▼</div>
      </div>
      <div style={{ padding:'0 12px' }}>
        {items.map(item => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          return (
            <div key={item.id}>
              {showSection && <div style={{ fontSize:10, fontWeight:600, color:'rgba(240,234,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', padding:'8px 0 4px' }}>{item.section}</div>}
              <div className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:'auto', padding:'16px 20px 0', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80', animation:'blink 2s ease-in-out infinite' }} />
          <span style={{ fontSize:12, color:'rgba(240,234,255,0.5)' }}>repl is <span style={{ color:'#4ade80' }}>online</span></span>
        </div>
        <div style={{ marginTop:8, fontSize:12, color:'rgba(240,234,255,0.3)' }}>@{user?.username}</div>
      </div>
    </>
  );
}

// ─── Page: Overview ────────────────────────────────────────────────────────────
function OverviewPage({ gd, stats, user }) {
  const statCards = [
    { label:'Anti-Raid', value: gd.antiRaidEnabled ? '✅ Active' : '❌ Off', accent:'#7c3aed', delay:'0.1s' },
    { label:'Anti-Nuke', value: gd.antiNukeEnabled ? '✅ Active' : '❌ Off', accent:'#4f8ef7', delay:'0.2s' },
    { label:'Open Tickets', value: stats?.openTickets ?? '—', accent:'#f06292', delay:'0.3s' },
    { label:'Active Giveaways', value: stats?.activeGiveaways ?? '—', accent:'#4ade80', delay:'0.4s' },
  ];
  return (
    <div>
      <PageHeader title="Welcome back" gradient user={user} subtitle="Here's what's happening in your server" />
      <div className="stats-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, position:'relative', overflow:'hidden', animationDelay: s.delay }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${s.accent},${s.accent}66)` }} />
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(240,234,255,0.5)', marginBottom:8 }}>{s.label}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:24 }}>
        <SectionTitle dot="purple">Quick Status</SectionTitle>
        {[
          ['Welcome Messages', gd.welcomeEmbed?.enabled],
          ['Leveling System',  gd.levelingEnabled],
          ['Maintenance Mode', gd.maintenanceMode],
          ['Whitelist Mode (Giveaways)', gd.giveawayWhitelistMode],
        ].map(([label, on]) => (
          <div key={label} className="toggle-row">
            <span style={{ fontSize:13.5 }}>{label}</span>
            <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background: on ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: on ? '#4ade80' : 'rgba(240,234,255,0.4)' }}>{on ? 'Enabled' : 'Disabled'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: Anti-Raid ──────────────────────────────────────────────────────────
function AntiRaidPage({ gd, update, save, saving }) {
  return (
    <div>
      <PageHeader title="Anti-Raid Settings" subtitle="Configure automatic raid detection and response" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="purple">
          <SectionTitle dot="purple">Detection Settings</SectionTitle>
          <Slider label="Joins to trigger raid" value={gd.raidJoinCount} min={2} max={20} unit=" joins" onChange={v => update('raidJoinCount', v)} />
          <Slider label="Time window" value={gd.raidJoinWindow} min={5} max={60} unit=" seconds" onChange={v => update('raidJoinWindow', v)} />
          <Slider label="New account age filter" value={gd.raidNewAccDays} min={1} max={30} unit=" days" onChange={v => update('raidNewAccDays', v)} />
          <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:8, marginTop:4 }}>Raid action</div>
          <select style={sel} value={gd.raidAction} onChange={e => update('raidAction', e.target.value)}>
            <option value="kick">Kick raiders</option>
            <option value="ban">Ban raiders</option>
            <option value="verify">Lock verification only</option>
          </select>
        </Card>
        <Card accent="blue">
          <SectionTitle dot="blue">Toggles</SectionTitle>
          {[
            ['Anti-Raid Protection', 'Auto-detect and block mass joins', 'antiRaidEnabled'],
            ['New Account Filter', 'Auto-kick new Discord accounts', 'raidNewAccFilter'],
            ['Owner DM Alert', 'DM you when a raid is detected', 'raidOwnerDm'],
          ].map(([label, desc, key]) => (
            <div key={key} className="toggle-row">
              <div><div style={{ fontSize:13.5, fontWeight:500 }}>{label}</div><div style={{ fontSize:11.5, color:'rgba(240,234,255,0.5)' }}>{desc}</div></div>
              <Toggle value={!!gd[key]} onChange={v => update(key, v)} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Page: Anti-Nuke ──────────────────────────────────────────────────────────
function AntiNukePage({ gd, update, save, saving }) {
  const [newWl, setNewWl] = useState('');
  const thresholds = [
    ['Channel Delete', 'channelDelete', 2, 10],
    ['Mass Ban',       'ban',           2, 10],
    ['Mass Kick',      'kick',          2, 15],
    ['Role Delete',    'roleDelete',    1, 5],
  ];
  return (
    <div>
      <PageHeader title="Anti-Nuke Settings" subtitle="Protect your server from rogue admins and bots" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="pink">
          <SectionTitle dot="pink">Toggles & Punishment</SectionTitle>
          <div className="toggle-row">
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>Anti-Nuke Protection</div><div style={{ fontSize:11.5, color:'rgba(240,234,255,0.5)' }}>Monitor for nuke actions</div></div>
            <Toggle value={!!gd.antiNukeEnabled} onChange={v => update('antiNukeEnabled', v)} />
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:8 }}>Punishment</div>
            <select style={sel} value={gd.nukePunishment} onChange={e => update('nukePunishment', e.target.value)}>
              <option value="both">Strip roles + Ban</option>
              <option value="strip">Strip roles only</option>
              <option value="ban">Ban only</option>
            </select>
          </div>
          <div style={{ marginTop:20 }}>
            <SectionTitle dot="blue">Thresholds</SectionTitle>
            {thresholds.map(([label, key, min, max]) => (
              <Slider key={key} label={label} value={gd.nukeThresholds?.[key] ?? 3} min={min} max={max} unit=" actions" onChange={v => update('nukeThresholds', { ...gd.nukeThresholds, [key]: v })} />
            ))}
          </div>
        </Card>
        <Card accent="purple">
          <SectionTitle dot="purple">Whitelist</SectionTitle>
          <div style={{ padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>👑</div>
            <div><div style={{ fontSize:13, fontWeight:500 }}>You (Owner)</div><div style={{ fontSize:11, color:'rgba(240,234,255,0.5)' }}>926063716057894953 · Permanent</div></div>
          </div>
          {(gd.nukeWhitelist || []).map(id => (
            <div key={id} style={{ padding:'9px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(79,142,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#7fb3ff', fontSize:12, fontWeight:700, flexShrink:0 }}>U</div>
              <div style={{ flex:1, fontSize:13 }}>{id}</div>
              <button className="btn-danger" onClick={() => update('nukeWhitelist', (gd.nukeWhitelist || []).filter(x => x !== id))}>×</button>
            </div>
          ))}
          <input style={{ ...inp, marginTop:12 }} value={newWl} onChange={e => setNewWl(e.target.value)} placeholder="Add User ID to whitelist..." />
          <button className="btn-primary" style={{ marginTop:10, width:'100%' }} onClick={() => { if (newWl.trim()) { update('nukeWhitelist', [...(gd.nukeWhitelist || []), newWl.trim()]); setNewWl(''); } }}>+ Add to Whitelist</button>
        </Card>
      </div>
    </div>
  );
}

// ─── Page: Tickets ─────────────────────────────────────────────────────────────
function TicketsPage({ gd, update, save, saving }) {
  const types = [
    ['🛠️', 'support', 'Support',        'General help requests'],
    ['🚨', 'report',  'Report',          'Report a user or issue'],
    ['🎁', 'claim',   'Giveaway Claim',  'Claim a giveaway prize'],
    ['⚖️', 'appeal',  'Appeal',          'Ban or mute appeals'],
    ['📩', 'other',   'Other',           'Anything else'],
  ];
  return (
    <div>
      <PageHeader title="Ticket System" subtitle="Configure ticket panel, types and staff access" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="blue">
          <SectionTitle dot="blue">Ticket Types</SectionTitle>
          {types.map(([emoji, key, label, desc]) => (
            <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, marginBottom:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{emoji}</div>
                <div><div style={{ fontSize:13.5, fontWeight:500 }}>{label}</div><div style={{ fontSize:11, color:'rgba(240,234,255,0.5)' }}>{desc}</div></div>
              </div>
              <Toggle value={!!gd.ticketTypes?.[key]} onChange={v => update('ticketTypes', { ...gd.ticketTypes, [key]: v })} />
            </div>
          ))}
        </Card>
        <div>
          <Card accent="purple" style={{ marginBottom:20 }}>
            <SectionTitle dot="purple">Configuration</SectionTitle>
            {[
              ['Limit 1 ticket per user (per type)', 'ticketOnePerUser'],
              ['DM transcript on close', 'ticketDmTranscript'],
              ['Ping staff on open', 'ticketPingStaff'],
            ].map(([label, key]) => (
              <div key={key} className="toggle-row">
                <span style={{ fontSize:13.5 }}>{label}</span>
                <Toggle value={!!gd[key]} onChange={v => update(key, v)} />
              </div>
            ))}
          </Card>
          <Card accent="pink">
            <SectionTitle dot="pink">Panel Customization</SectionTitle>
            {[['Panel Title', 'ticketPanel.title'], ['Panel Description', 'ticketPanel.description'], ['Button Label', 'ticketPanel.buttonLabel'], ['Button Emoji', 'ticketPanel.buttonEmoji']].map(([label, path]) => (
              <div key={path} style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>{label}</div>
                <input style={inp} value={path.split('.').reduce((o,k) => o?.[k], gd) || ''} onChange={e => update(path, e.target.value)} />
              </div>
            ))}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Panel Color</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={gd.ticketPanel?.color || '#7c3aed'} onChange={e => update('ticketPanel.color', e.target.value)} style={{ width:40, height:36, borderRadius:8, border:'none', cursor:'pointer', background:'none' }} />
                <input style={{ ...inp, flex:1 }} value={gd.ticketPanel?.color || '#7c3aed'} onChange={e => update('ticketPanel.color', e.target.value)} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Welcome ─────────────────────────────────────────────────────────────
function WelcomePage({ gd, update, save, saving, showVars, setShowVars }) {
  const cfg = gd.welcomeEmbed || {};
  const upd = (k, v) => update(`welcomeEmbed.${k}`, v);
  return (
    <div>
      <PageHeader title="Welcome & Auto-Role" subtitle="Greet new members with a fully customizable embed" action={<SaveBtn save={save} saving={saving} />} />
      <div style={{ marginBottom:20 }}>
        <button className="btn-secondary" onClick={() => setShowVars(!showVars)} style={{ fontSize:12 }}>{showVars ? '▲' : '▼'} {showVars ? 'Hide' : 'Show'} Variables Reference</button>
      </div>
      <VariablesRef show={showVars} />
      <div className="grid-2" style={{ marginBottom:20 }}>
        <Card accent="purple">
          <SectionTitle dot="purple">Settings</SectionTitle>
          <div className="toggle-row">
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>Welcome Messages</div><div style={{ fontSize:11.5, color:'rgba(240,234,255,0.5)' }}>Send embed when member joins</div></div>
            <Toggle value={!!cfg.enabled} onChange={v => upd('enabled', v)} />
          </div>
          <div className="toggle-row">
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>Show Timestamp</div><div style={{ fontSize:11.5, color:'rgba(240,234,255,0.5)' }}>Show join time in embed</div></div>
            <Toggle value={!!cfg.showTimestamp} onChange={v => upd('showTimestamp', v)} />
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Embed Color</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="color" value={cfg.color || '#7c3aed'} onChange={e => upd('color', e.target.value)} style={{ width:40, height:36, borderRadius:8, border:'none', cursor:'pointer' }} />
              <input style={{ ...inp, flex:1 }} value={cfg.color || '#7c3aed'} onChange={e => upd('color', e.target.value)} />
            </div>
          </div>
        </Card>
        <Card accent="blue">
          <SectionTitle dot="blue">Outside Text & Author</SectionTitle>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Outside Text (above embed)</div>
            <textarea style={{ ...inp, resize:'none' }} rows={2} value={cfg.outsideText || ''} onChange={e => upd('outsideText', e.target.value)} placeholder="e.g. Hey {user}, welcome! 🎉" />
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Author Text</div>
            <input style={inp} value={cfg.authorText || ''} onChange={e => upd('authorText', e.target.value)} placeholder="e.g. {servername}" />
          </div>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Author Icon URL <code style={{ fontSize:10, color:'#c084fc' }}>{'{avatar}'}</code></div>
            <input style={inp} value={cfg.authorIconUrl || ''} onChange={e => upd('authorIconUrl', e.target.value)} placeholder="{avatar} or URL" />
          </div>
        </Card>
      </div>
      <Card accent="pink" style={{ marginBottom:20 }}>
        <SectionTitle dot="pink">Embed Content</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Title</div>
            <input style={inp} value={cfg.title || ''} onChange={e => upd('title', e.target.value)} placeholder="Welcome!" />
          </div>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Thumbnail URL <code style={{ fontSize:10, color:'#c084fc' }}>{'{avatar}'}</code></div>
            <input style={inp} value={cfg.thumbnailUrl || ''} onChange={e => upd('thumbnailUrl', e.target.value)} placeholder="{avatar} or URL" />
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Description</div>
          <textarea style={{ ...inp, resize:'none' }} rows={3} value={cfg.description || ''} onChange={e => upd('description', e.target.value)} placeholder="Welcome to {servername}, {user}! You are member #{memberjoin}." />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Image URL <code style={{ fontSize:10, color:'#c084fc' }}>{'{avatar}'}</code></div>
            <input style={inp} value={cfg.imageUrl || ''} onChange={e => upd('imageUrl', e.target.value)} placeholder="{avatar} or URL" />
          </div>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Footer Text</div>
            <input style={inp} value={cfg.footerText || ''} onChange={e => upd('footerText', e.target.value)} placeholder="Member #{memberjoin} · {members} total" />
          </div>
        </div>
        <div style={{ marginTop:12 }}>
          <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Footer Icon URL <code style={{ fontSize:10, color:'#c084fc' }}>{'{avatar}'}</code></div>
          <input style={inp} value={cfg.footerIconUrl || ''} onChange={e => upd('footerIconUrl', e.target.value)} placeholder="{avatar} or URL" />
        </div>
      </Card>
      <Card accent="purple" style={{ marginBottom:20 }}>
        <SectionTitle dot="purple">Embed Fields</SectionTitle>
        {(cfg.fields || []).map((f, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:8, marginBottom:8, alignItems:'center' }}>
            <input style={inp} value={f.name} onChange={e => { const fs = [...(cfg.fields||[])]; fs[i] = { ...fs[i], name: e.target.value }; upd('fields', fs); }} placeholder="Field name" />
            <input style={inp} value={f.value} onChange={e => { const fs = [...(cfg.fields||[])]; fs[i] = { ...fs[i], value: e.target.value }; upd('fields', fs); }} placeholder="Field value" />
            <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'rgba(240,234,255,0.6)', whiteSpace:'nowrap' }}><input type="checkbox" checked={!!f.inline} onChange={e => { const fs = [...(cfg.fields||[])]; fs[i] = { ...fs[i], inline: e.target.checked }; upd('fields', fs); }} /> Inline</label>
            <button className="btn-danger" onClick={() => { const fs = [...(cfg.fields||[])]; fs.splice(i,1); upd('fields', fs); }}>×</button>
          </div>
        ))}
        <button className="btn-secondary" style={{ marginTop:8, fontSize:12 }} onClick={() => upd('fields', [...(cfg.fields||[]), { name:'', value:'', inline:false }])}>+ Add Field</button>
      </Card>
      <Card accent="blue">
        <SectionTitle dot="blue">Live Embed Preview</SectionTitle>
        <EmbedPreview cfg={cfg} />
      </Card>
    </div>
  );
}

// ─── Page: Leveling ────────────────────────────────────────────────────────────
function LevelingPage({ gd, update, save, saving }) {
  const [newLevel, setNewLevel] = useState('');
  const [newRole,  setNewRole]  = useState('');
  return (
    <div>
      <PageHeader title="Leveling System" subtitle="Configure XP gain, level-up messages and role rewards" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="blue">
          <SectionTitle dot="blue">XP Settings</SectionTitle>
          <Slider label="Min XP per message" value={gd.xpMin} min={5} max={50} unit=" XP" onChange={v => update('xpMin', v)} />
          <Slider label="Max XP per message" value={gd.xpMax} min={10} max={100} unit=" XP" onChange={v => update('xpMax', v)} />
          <Slider label="XP Cooldown" value={gd.xpCooldown} min={5} max={300} unit=" seconds" onChange={v => update('xpCooldown', v)} />
          <div className="toggle-row" style={{ marginTop:8 }}>
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>Leveling Enabled</div></div>
            <Toggle value={!!gd.levelingEnabled} onChange={v => update('levelingEnabled', v)} />
          </div>
          <div className="toggle-row">
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>Level-Up Messages</div></div>
            <Toggle value={!!gd.levelUpMessages} onChange={v => update('levelUpMessages', v)} />
          </div>
        </Card>
        <Card accent="purple">
          <SectionTitle dot="purple">Level Role Rewards</SectionTitle>
          {(gd.levelRoles || []).map((r, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, color:'#c084fc', flexShrink:0 }}>LV {r.level}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:500 }}>Role ID: {r.roleId}</div></div>
              <button className="btn-danger" onClick={() => { const rs = [...(gd.levelRoles||[])]; rs.splice(i,1); update('levelRoles', rs); }}>×</button>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            <input style={inp} value={newLevel} onChange={e => setNewLevel(e.target.value)} placeholder="Level (e.g. 10)" type="number" />
            <input style={inp} value={newRole}  onChange={e => setNewRole(e.target.value)}  placeholder="Role ID" />
          </div>
          <button className="btn-primary" style={{ marginTop:10, width:'100%' }} onClick={() => { if (newLevel && newRole) { update('levelRoles', [...(gd.levelRoles||[]), { level: parseInt(newLevel), roleId: newRole }]); setNewLevel(''); setNewRole(''); } }}>+ Add Reward</button>
        </Card>
      </div>
    </div>
  );
}

// ─── Page: Commands ────────────────────────────────────────────────────────────
function CommandsPage({ guildId, commands, setCommands, newCmd, setNewCmd }) {
  const addCmd = async () => {
    if (!newCmd.trigger || !newCmd.response) return;
    const res = await api(`/api/guild/${guildId}/commands`, { method:'POST', body: JSON.stringify(newCmd) });
    setCommands(prev => [...prev.filter(c => c.trigger !== res.trigger), res]);
    setNewCmd({ trigger:'', response:'' });
  };
  const delCmd = async (trigger) => {
    await api(`/api/guild/${guildId}/commands`, { method:'DELETE', body: JSON.stringify({ trigger }) });
    setCommands(prev => prev.filter(c => c.trigger !== trigger));
  };
  return (
    <div>
      <PageHeader title="Custom Commands" subtitle="Manage your server's custom Q&A commands" />
      <Card accent="pink">
        <SectionTitle dot="pink">Active Commands <span style={{ color:'rgba(240,234,255,0.5)', fontWeight:400, fontSize:13 }}>({commands.length}/50)</span></SectionTitle>
        {commands.map(c => (
          <div key={c.trigger} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, marginBottom:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(240,98,146,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f48fb1', fontSize:11, fontWeight:700, flexShrink:0 }}>!</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>!{c.trigger}</div>
              <div style={{ fontSize:11, color:'rgba(240,234,255,0.5)' }}>{c.response.substring(0,80)}{c.response.length > 80 ? '...' : ''}</div>
            </div>
            <button className="btn-danger" onClick={() => delCmd(c.trigger)}>×</button>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:8, marginTop:16, alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Trigger (without !)</div>
            <input style={inp} value={newCmd.trigger} onChange={e => setNewCmd(p => ({ ...p, trigger: e.target.value.toLowerCase() }))} placeholder="rules" />
          </div>
          <div>
            <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Response</div>
            <input style={inp} value={newCmd.response} onChange={e => setNewCmd(p => ({ ...p, response: e.target.value }))} placeholder="Please read the rules in #rules!" />
          </div>
          <button className="btn-primary" onClick={addCmd}>Add</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Page: Giveaways ──────────────────────────────────────────────────────────
function GiveawaysPage({ giveaways }) {
  return (
    <div>
      <PageHeader title="Giveaways" subtitle="View all active and past giveaways" />
      <Card accent="blue">
        <SectionTitle dot="blue">Giveaway History</SectionTitle>
        {!giveaways.length && <div style={{ color:'rgba(240,234,255,0.5)', fontSize:13 }}>No giveaways found.</div>}
        {giveaways.map(g => (
          <div key={g.giveawayId} style={{ padding:'12px 14px', borderRadius:12, marginBottom:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>🎁 {g.prize}</div>
                <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginTop:3 }}>ID: <code style={{ color:'#c084fc' }}>{g.giveawayId}</code> · {g.entries.length} entries · {g.winnerCount} winner(s)</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background: g.ended ? 'rgba(255,255,255,0.06)' : 'rgba(74,222,128,0.1)', color: g.ended ? 'rgba(240,234,255,0.4)' : '#4ade80' }}>{g.ended ? 'Ended' : 'Active'}</span>
            </div>
            {g.ended && g.winners.length > 0 && <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginTop:6 }}>Winners: {g.winners.map(w => <code key={w} style={{ color:'#c084fc', marginRight:6 }}>{w}</code>)}</div>}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Page: Mod Logs ────────────────────────────────────────────────────────────
function ModLogsPage({ gd, update, save, saving }) {
  return (
    <div>
      <PageHeader title="Mod Logs" subtitle="Configure moderation log channel" action={<SaveBtn save={save} saving={saving} />} />
      <Card accent="pink">
        <SectionTitle dot="pink">Log Channel</SectionTitle>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', marginBottom:6 }}>Mod Log Channel ID</div>
          <input style={inp} value={gd.modLogChannelId || ''} onChange={e => update('modLogChannelId', e.target.value)} placeholder="Paste channel ID" />
        </div>
        <div style={{ fontSize:12, color:'rgba(240,234,255,0.5)', padding:12, background:'rgba(124,58,237,0.08)', borderRadius:8 }}>
          💡 Tip: Right-click a channel in Discord → Copy ID. You need Developer Mode on in Discord settings.
        </div>
      </Card>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, action, gradient, user }) {
  return (
    <div className="topbar" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
      <div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700 }}>
          {gradient && user ? <>Welcome back, <span style={{ background:'linear-gradient(135deg,#c084fc,#7fb3ff,#f48fb1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{user.username}</span></> : <span style={{ background:'linear-gradient(135deg,#c084fc,#7fb3ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{title}</span>}
        </div>
        {subtitle && <div style={{ fontSize:13, color:'rgba(240,234,255,0.5)', marginTop:4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function SaveBtn({ save, saving }) {
  return <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>;
}

function Loading() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0612', flexDirection:'column', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'white', animation:'pulse 1.5s ease-in-out infinite' }}>R</div>
      <div style={{ color:'rgba(240,234,255,0.5)', fontFamily:'DM Sans,sans-serif' }}>Loading...</div>
    </div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────
function LoginPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0612', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', overflow:'hidden', position:'relative' }}>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        @keyframes pulse{0%,100%{box-shadow:0 0 30px rgba(124,58,237,0.5)}50%{box-shadow:0 0 60px rgba(124,58,237,0.8)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes orb1{0%{transform:translate(0,0)}100%{transform:translate(40px,30px)}}
        @keyframes orb2{0%{transform:translate(0,0)}100%{transform:translate(-40px,20px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .login-card{animation:fadeIn 0.6s ease both}
        .login-btn{transition:all 0.2s} .login-btn:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(124,58,237,0.6)!important}
      `}</style>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'#7c3aed', filter:'blur(100px)', opacity:0.2, top:-200, left:-200, animation:'orb1 12s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'#f06292', filter:'blur(100px)', opacity:0.15, bottom:-150, right:-150, animation:'orb2 15s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>
      <div className="login-card" style={{ position:'relative', zIndex:1, textAlign:'center', padding:'48px 40px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, maxWidth:420, width:'90%', backdropFilter:'blur(20px)' }}>
        <div style={{ width:72, height:72, borderRadius:18, background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:32, color:'white', margin:'0 auto 20px', animation:'pulse 3s ease-in-out infinite, float 4s ease-in-out infinite' }}>R</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, background:'linear-gradient(135deg,#c084fc,#7fb3ff,#f48fb1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>repl</div>
        <div style={{ color:'rgba(240,234,255,0.6)', fontSize:14, marginBottom:32, lineHeight:1.6 }}>The all-in-one Discord bot dashboard. Manage moderation, tickets, leveling, and more.</div>
        <a href="/api/auth/login" className="login-btn" style={{ display:'block', padding:'14px 24px', background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', color:'white', borderRadius:14, textDecoration:'none', fontWeight:600, fontSize:15, boxShadow:'0 0 30px rgba(124,58,237,0.4)' }}>Login with Discord</a>
        <div style={{ marginTop:20, fontSize:12, color:'rgba(240,234,255,0.3)' }}>By logging in you agree to our terms of service</div>
      </div>
    </div>
  );
}

// ─── Guild Select Page ────────────────────────────────────────────────────────
function GuildSelect({ guilds, onSelect, user }) {
  const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=1473915873373720652&permissions=8&scope=bot+applications.commands`;
  const [botGuilds, setBotGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch which guilds the bot is actually in from our DB
    api('/api/botguilds').then(d => {
      setBotGuilds(d.guildIds || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const added    = guilds.filter(g => botGuilds.includes(g.id));
  const notAdded = guilds.filter(g => !botGuilds.includes(g.id));

  return (
    <div style={{ minHeight:'100vh', background:'#0a0612', fontFamily:'DM Sans,sans-serif', padding:'40px 20px' }}>
      <Head><link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" /></Head>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 35px rgba(124,58,237,0.7)}}
        @keyframes orb1{0%{transform:translate(0,0)}100%{transform:translate(40px,30px)}}
        @keyframes orb2{0%{transform:translate(0,0)}100%{transform:translate(-30px,20px)}}
        .guild-card{transition:all 0.2s;cursor:pointer;animation:fadeIn 0.4s ease both;}
        .guild-card:hover{transform:translateY(-3px);border-color:rgba(124,58,237,0.4)!important;background:rgba(124,58,237,0.08)!important;}
        .invite-card{transition:all 0.2s;animation:fadeIn 0.4s ease both;}
        .invite-card:hover{transform:translateY(-3px);border-color:rgba(79,142,247,0.4)!important;background:rgba(79,142,247,0.06)!important;}
        .section-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(240,234,255,0.35);margin-bottom:14px;padding-left:2px;}
      `}</style>

      {/* BG orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'#7c3aed', filter:'blur(90px)', opacity:0.18, top:-150, left:-150, animation:'orb1 12s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'#f06292', filter:'blur(90px)', opacity:0.12, bottom:-100, right:-100, animation:'orb2 15s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#4f8ef7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'white', animation:'pulse 3s ease-in-out infinite' }}>R</div>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#c084fc,#7fb3ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>repl</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {user?.avatar
              ? <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width:32, height:32, borderRadius:'50%' }} alt="" />
              : <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#f06292)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700 }}>{user?.username?.[0]}</div>
            }
            <span style={{ fontSize:13, color:'rgba(240,234,255,0.6)' }}>@{user?.username}</span>
            <a href="/api/auth/logout" style={{ fontSize:12, color:'rgba(240,234,255,0.3)', textDecoration:'none', marginLeft:8, padding:'4px 10px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8 }}>Logout</a>
          </div>
        </div>

        <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, marginBottom:6 }}>
          <span style={{ background:'linear-gradient(135deg,#c084fc,#7fb3ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Select a Server</span>
        </div>
        <div style={{ color:'rgba(240,234,255,0.45)', fontSize:14, marginBottom:40 }}>Choose a server to manage. You need Administrator permission.</div>

        {loading ? (
          <div style={{ textAlign:'center', color:'rgba(240,234,255,0.4)', padding:40 }}>Loading servers...</div>
        ) : (
          <>
            {/* Servers with bot */}
            {added.length > 0 && (
              <div style={{ marginBottom:40 }}>
                <div className="section-label">✅ Bot is in these servers</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
                  {added.map((g, i) => (
                    <div key={g.id} className="guild-card" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'18px 20px', animationDelay:`${i*0.05}s` }} onClick={() => onSelect(g.id)}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        {g.icon
                          ? <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} style={{ width:44, height:44, borderRadius:10, flexShrink:0 }} alt="" />
                          : <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#f06292)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'white', flexShrink:0 }}>{g.name[0]}</div>
                        }
                        <div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:'#f0eaff' }}>{g.name}</div>
                          <div style={{ fontSize:11, color:'rgba(74,222,128,0.8)', marginTop:2 }}>● Manage</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servers without bot */}
            {notAdded.length > 0 && (
              <div>
                <div className="section-label">➕ Invite bot to these servers</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
                  {notAdded.map((g, i) => (
                    <a key={g.id} className="invite-card" href={`${BOT_INVITE}&guild_id=${g.id}`} target="_blank" rel="noreferrer" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'18px 20px', textDecoration:'none', display:'block', animationDelay:`${i*0.05}s`, opacity:0.7 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        {g.icon
                          ? <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} style={{ width:44, height:44, borderRadius:10, flexShrink:0, filter:'grayscale(0.3)' }} alt="" />
                          : <div style={{ width:44, height:44, borderRadius:10, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'rgba(240,234,255,0.4)', flexShrink:0 }}>{g.name[0]}</div>
                        }
                        <div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:'rgba(240,234,255,0.6)' }}>{g.name}</div>
                          <div style={{ fontSize:11, color:'rgba(79,142,247,0.8)', marginTop:2 }}>+ Invite Bot</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {guilds.length === 0 && (
              <div style={{ textAlign:'center', padding:60, color:'rgba(240,234,255,0.4)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>😕</div>
                <div>You don't have Administrator in any servers.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

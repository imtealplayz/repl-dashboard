import { useState, useEffect } from 'react';
import Head from 'next/head';

const api = (url, opts = {}) => fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:       '#080510',
  surface:  'rgba(255,255,255,0.03)',
  border:   'rgba(255,255,255,0.06)',
  purple:   '#9333ea',
  indigo:   '#6366f1',
  pink:     '#ec4899',
  green:    '#22c55e',
  text:     '#f0ebff',
  muted:    'rgba(240,235,255,0.45)',
  faint:    'rgba(240,235,255,0.2)',
};

// ─── Components ───────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width:42, height:22, borderRadius:11, border:'none', cursor:'pointer', position:'relative', background: value ? `linear-gradient(135deg,${T.purple},${T.indigo})` : 'rgba(255,255,255,0.1)', transition:'all 0.25s', flexShrink:0, boxShadow: value ? `0 0 10px ${T.purple}55` : 'none' }}>
      <span style={{ position:'absolute', top:2, width:18, height:18, borderRadius:'50%', background:'white', left: value ? 22 : 2, transition:'left 0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

function Slider({ label, value, min, max, unit='', onChange }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, fontSize:12 }}>
        <span style={{ color:T.muted }}>{label}</span>
        <span style={{ color:T.purple, fontWeight:600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))} style={{ width:'100%', accentColor:T.purple, cursor:'pointer' }} />
    </div>
  );
}

function Card({ children, accent, style={} }) {
  const accentMap = { purple:T.purple, indigo:T.indigo, pink:T.pink, green:T.green };
  const color = accentMap[accent] || T.purple;
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:20, position:'relative', overflow:'hidden', ...style }}>
      {accent && <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${color}cc,${color}22)` }} />}
      {children}
    </div>
  );
}

function STitle({ accent='purple', children }) {
  const colors = { purple:T.purple, indigo:T.indigo, pink:T.pink, green:T.green };
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14, fontSize:13, fontWeight:700, color:T.text, fontFamily:'Syne,sans-serif' }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:colors[accent], boxShadow:`0 0 6px ${colors[accent]}` }} />
      {children}
    </div>
  );
}

function TRow({ label, desc, value, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize:13, color:T.text }}>{label}</div>
        {desc && <div style={{ fontSize:11, color:T.faint, marginTop:2 }}>{desc}</div>}
      </div>
      <Toggle value={!!value} onChange={onChange} />
    </div>
  );
}

const inp = { width:'100%', padding:'8px 11px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.text, fontSize:12.5, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };
const sel = { ...inp, cursor:'pointer' };

function SaveBtn({ save, saving }) {
  return <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>;
}

function PageTitle({ title, sub, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
      <div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0 }}>{title}</h1>
        {sub && <p style={{ fontSize:12.5, color:T.muted, marginTop:4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Embed Preview ─────────────────────────────────────────────────────────────
function EmbedPreview({ cfg }) {
  const s = t => (t||'').replace(/{servername}/g,'My Server').replace(/{user}/g,'@You').replace(/{username}/g,'YourName').replace(/{userid}/g,'123456').replace(/{members}/g,'1,247').replace(/{memberjoin}/g,'1,247').replace(/{avatar}/g,'https://cdn.discordapp.com/embed/avatars/0.png');
  const av = 'https://cdn.discordapp.com/embed/avatars/0.png';
  const th = cfg.thumbnailUrl === '{avatar}' ? av : cfg.thumbnailUrl;
  return (
    <div style={{ background:'#2b2d31', borderRadius:8, padding:'12px 14px', borderLeft:`4px solid ${cfg.color||T.purple}`, fontSize:12.5 }}>
      {cfg.outsideText && <div style={{ color:'#dbdee1', marginBottom:8 }}>{s(cfg.outsideText)}</div>}
      <div style={{ display:'flex', gap:10 }}>
        <div style={{ flex:1 }}>
          {cfg.authorText && <div style={{ fontSize:11.5, color:'#b5bac1', marginBottom:3 }}>{s(cfg.authorText)}</div>}
          {cfg.title && <div style={{ color:'#fff', fontWeight:600, marginBottom:5, fontSize:13 }}>{s(cfg.title)}</div>}
          {cfg.description && <div style={{ color:'#dbdee1', whiteSpace:'pre-wrap' }}>{s(cfg.description)}</div>}
          {cfg.fields?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
              {cfg.fields.map((f,i) => (
                <div key={i} style={{ minWidth: f.inline ? '30%' : '100%' }}>
                  <div style={{ color:'#fff', fontWeight:600, fontSize:11.5 }}>{s(f.name)}</div>
                  <div style={{ color:'#dbdee1', fontSize:11.5 }}>{s(f.value)}</div>
                </div>
              ))}
            </div>
          )}
          {cfg.footerText && <div style={{ color:'#87898c', fontSize:11, marginTop:8, borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:5 }}>{s(cfg.footerText)}</div>}
        </div>
        {th && <img src={th} style={{ width:56, height:56, borderRadius:6, objectFit:'cover', flexShrink:0 }} alt="" onError={e=>e.target.style.display='none'} />}
      </div>
      {cfg.imageUrl && <img src={cfg.imageUrl==='{avatar}'?av:cfg.imageUrl} style={{ width:'100%', borderRadius:4, marginTop:8, maxHeight:180, objectFit:'cover' }} alt="" onError={e=>e.target.style.display='none'} />}
    </div>
  );
}

// ─── Variables Reference ───────────────────────────────────────────────────────
function VarsRef({ show }) {
  if (!show) return null;
  const vars = [['{servername}','Server name'],['{user}','@mention'],['{username}','Plain username'],['{userid}','User ID'],['{members}','Member count'],['{memberjoin}','Join number'],['{avatar}','Avatar URL (use in URL fields)']];
  return (
    <div style={{ background:'rgba(147,51,234,0.06)', border:`1px solid rgba(147,51,234,0.15)`, borderRadius:10, padding:14, marginBottom:18 }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.purple, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>📋 Variables</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:6 }}>
        {vars.map(([v,d]) => (
          <div key={v} style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
            <code style={{ background:'rgba(147,51,234,0.15)', color:T.purple, padding:'1px 5px', borderRadius:4, fontSize:10.5, flexShrink:0 }}>{v}</code>
            <span style={{ fontSize:11, color:T.faint }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function OverviewPage({ gd, stats, user }) {
  const cards = [
    { label:'Anti-Raid',   value: gd.antiRaidEnabled ? '✅ Active' : '❌ Off',  accent:T.purple },
    { label:'Anti-Nuke',   value: gd.antiNukeEnabled ? '✅ Active' : '❌ Off',  accent:T.indigo },
    { label:'Open Tickets',value: stats?.openTickets ?? '—',                     accent:T.pink },
    { label:'Giveaways',   value: stats?.activeGiveaways ?? '—',                 accent:T.green },
  ];
  return (
    <div>
      <PageTitle title={`Welcome back, ${user?.username}`} sub="Here's your server overview" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }} className="stats-row">
        {cards.map((c,i) => (
          <div key={i} className="stat-card" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:18, position:'relative', overflow:'hidden', animationDelay:`${i*0.08}s` }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${c.accent},${c.accent}33)` }} />
            <div style={{ fontSize:10.5, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:T.faint, marginBottom:7 }}>{c.label}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:T.text }}>{c.value}</div>
          </div>
        ))}
      </div>
      <Card accent="purple">
        <STitle accent="purple">Quick Status</STitle>
        {[['Welcome Messages', gd.welcomeEmbed?.enabled],['Leveling', gd.levelingEnabled],['Level Up Messages', gd.levelUpMessages],['Maintenance Mode', gd.maintenanceMode],['Suggestion Channel', !!gd.suggestionChannelId],['Giveaway Whitelist Mode', gd.giveawayWhitelistMode]].map(([label, on]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:13, color:T.text }}>{label}</span>
            <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background: on ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', color: on ? T.green : T.faint }}>{on ? 'Enabled' : 'Disabled'}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AntiRaidPage({ gd, update, save, saving }) {
  return (
    <div>
      <PageTitle title="Anti-Raid" sub="Auto-detect and block mass join attacks" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="purple">
          <STitle accent="purple">Detection</STitle>
          <Slider label="Joins to trigger" value={gd.raidJoinCount||5} min={2} max={20} unit=" joins" onChange={v=>update('raidJoinCount',v)} />
          <Slider label="Time window" value={gd.raidJoinWindow||10} min={3} max={60} unit="s" onChange={v=>update('raidJoinWindow',v)} />
          <Slider label="New account age filter" value={gd.raidNewAccDays||7} min={1} max={30} unit=" days" onChange={v=>update('raidNewAccDays',v)} />
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, color:T.faint, marginBottom:6 }}>Raid action</div>
            <select style={sel} value={gd.raidAction||'kick'} onChange={e=>update('raidAction',e.target.value)}>
              <option value="kick">Kick raiders</option>
              <option value="ban">Ban raiders</option>
              <option value="verify">Lock verification only</option>
            </select>
          </div>
        </Card>
        <Card accent="indigo">
          <STitle accent="indigo">Toggles</STitle>
          <TRow label="Anti-Raid Protection" desc="Auto-detect mass joins" value={gd.antiRaidEnabled} onChange={v=>update('antiRaidEnabled',v)} />
          <TRow label="New Account Filter" desc="Flag accounts below age threshold" value={gd.raidNewAccFilter} onChange={v=>update('raidNewAccFilter',v)} />
          <TRow label="DM Owner on Raid" desc="Notify you when raid detected" value={gd.raidOwnerDm} onChange={v=>update('raidOwnerDm',v)} />
        </Card>
      </div>
    </div>
  );
}

function AntiNukePage({ gd, update, save, saving }) {
  const [newWl, setNewWl] = useState('');
  return (
    <div>
      <PageTitle title="Anti-Nuke" sub="Protect against rogue admins and unauthorized bots" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="pink">
          <STitle accent="pink">Settings</STitle>
          <TRow label="Anti-Nuke Protection" desc="Monitor audit log for nuke actions" value={gd.antiNukeEnabled} onChange={v=>update('antiNukeEnabled',v)} />
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:11, color:T.faint, marginBottom:6 }}>Punishment</div>
            <select style={sel} value={gd.nukePunishment||'both'} onChange={e=>update('nukePunishment',e.target.value)}>
              <option value="both">Strip roles + Ban</option>
              <option value="strip">Strip roles only</option>
              <option value="ban">Ban only</option>
            </select>
          </div>
          <div style={{ marginTop:16 }}>
            <STitle accent="indigo">Thresholds</STitle>
            {[['Channel Deletes','channelDelete',2,10],['Mass Bans','ban',2,10],['Mass Kicks','kick',2,15],['Role Deletes','roleDelete',1,5]].map(([l,k,mn,mx])=>(
              <Slider key={k} label={l} value={gd.nukeThresholds?.[k]??3} min={mn} max={mx} unit=" actions" onChange={v=>update('nukeThresholds',{...gd.nukeThresholds,[k]:v})} />
            ))}
          </div>
        </Card>
        <Card accent="purple">
          <STitle accent="purple">Whitelist</STitle>
          <div style={{ padding:'8px 10px', background:'rgba(147,51,234,0.08)', borderRadius:8, marginBottom:8, display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ width:26, height:26, borderRadius:6, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>👑</div>
            <div><div style={{ fontSize:12.5, fontWeight:500 }}>Owner — Permanent</div><div style={{ fontSize:10.5, color:T.faint }}>926063716057894953</div></div>
          </div>
          {(gd.nukeWhitelist||[]).map(id=>(
            <div key={id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, marginBottom:6 }}>
              <div style={{ flex:1, fontSize:12.5, color:T.muted }}>{id}</div>
              <button className="btn-danger" onClick={()=>update('nukeWhitelist',(gd.nukeWhitelist||[]).filter(x=>x!==id))}>×</button>
            </div>
          ))}
          <input style={{ ...inp, marginTop:10 }} value={newWl} onChange={e=>setNewWl(e.target.value)} placeholder="Add User ID…" />
          <button className="btn-primary" style={{ marginTop:8, width:'100%', fontSize:12 }} onClick={()=>{if(newWl.trim()){update('nukeWhitelist',[...(gd.nukeWhitelist||[]),newWl.trim()]);setNewWl('');}}}>+ Add to Whitelist</button>
        </Card>
      </div>
    </div>
  );
}

function TicketsPage({ gd, update, save, saving, guildId }) {
  const [panelChannel, setPanelChannel] = useState('');
  const [panelLink,    setPanelLink]    = useState('');
  const [panelStatus,  setPanelStatus]  = useState('');

  const sendPanel = async () => {
    if (!panelChannel.trim()) return setPanelStatus('❌ Enter a channel ID');
    setPanelStatus('Sending…');
    const res = await api(`/api/guild/${guildId}/sendpanel`, { method:'POST', body: JSON.stringify({ channelId: panelChannel.trim(), panel: gd.ticketPanel }) });
    setPanelStatus(res.ok ? '✅ Panel sent!' : `❌ ${res.error||'Failed'}`);
    if (res.ok) setPanelChannel('');
    setTimeout(()=>setPanelStatus(''), 4000);
  };

  const editPanel = async () => {
    if (!panelLink.trim()) return setPanelStatus('❌ Enter a message link');
    const m = panelLink.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
    if (!m) return setPanelStatus('❌ Invalid link — right click message → Copy Message Link');
    setPanelStatus('Updating…');
    const res = await api(`/api/guild/${guildId}/editpanel`, { method:'POST', body: JSON.stringify({ channelId: m[2], messageId: m[3], panel: gd.ticketPanel }) });
    setPanelStatus(res.ok ? '✅ Panel updated!' : `❌ ${res.error||'Failed'}`);
    if (res.ok) setPanelLink('');
    setTimeout(()=>setPanelStatus(''), 4000);
  };

  const types = [['🛠️','support','Support','Help requests'],['🚨','report','Report','Report users'],['🎁','claim','Giveaway Claim','Claim prizes'],['⚖️','appeal','Appeal','Ban/mute appeals'],['📩','other','Other','Anything else']];

  return (
    <div>
      <PageTitle title="Ticket System" sub="Configure ticket panel, types and staff settings" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <div>
          <Card accent="indigo" style={{ marginBottom:16 }}>
            <STitle accent="indigo">Ticket Types</STitle>
            {types.map(([emoji,key,label,desc])=>(
              <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 10px', borderRadius:8, marginBottom:6, background:'rgba(255,255,255,0.02)', border:`1px solid ${T.border}` }}>
                <div style={{ display:'flex', gap:9, alignItems:'center' }}>
                  <div style={{ width:28, height:28, borderRadius:6, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{emoji}</div>
                  <div><div style={{ fontSize:13, fontWeight:500 }}>{label}</div><div style={{ fontSize:11, color:T.faint }}>{desc}</div></div>
                </div>
                <Toggle value={!!gd.ticketTypes?.[key]} onChange={v=>update('ticketTypes',{...gd.ticketTypes,[key]:v})} />
              </div>
            ))}
          </Card>
          <Card accent="purple">
            <STitle accent="purple">Configuration</STitle>
            <TRow label="1 ticket per user (per type)" value={gd.ticketOnePerUser} onChange={v=>update('ticketOnePerUser',v)} />
            <TRow label="DM transcript on close" value={gd.ticketDmTranscript} onChange={v=>update('ticketDmTranscript',v)} />
            <TRow label="Ping staff when ticket opens" value={gd.ticketPingStaff} onChange={v=>update('ticketPingStaff',v)} />
          </Card>
        </div>
        <div>
          <Card accent="pink" style={{ marginBottom:16 }}>
            <STitle accent="pink">Panel Customization</STitle>
            {[['Title','ticketPanel.title'],['Description','ticketPanel.description'],['Button Label','ticketPanel.buttonLabel'],['Button Emoji','ticketPanel.buttonEmoji']].map(([label,path])=>(
              <div key={path} style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>{label}</div>
                <input style={inp} value={path.split('.').reduce((o,k)=>o?.[k],gd)||''} onChange={e=>update(path,e.target.value)} />
              </div>
            ))}
            <div>
              <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Panel Color</div>
              <div style={{ display:'flex', gap:8 }}>
                <input type="color" value={gd.ticketPanel?.color||T.purple} onChange={e=>update('ticketPanel.color',e.target.value)} style={{ width:36, height:32, borderRadius:6, border:'none', cursor:'pointer' }} />
                <input style={{ ...inp, flex:1 }} value={gd.ticketPanel?.color||T.purple} onChange={e=>update('ticketPanel.color',e.target.value)} />
              </div>
            </div>
          </Card>
          <Card accent="indigo">
            <STitle accent="indigo">Send / Edit Panel</STitle>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Send to channel (paste Channel ID)</div>
              <div style={{ display:'flex', gap:7 }}>
                <input style={{ ...inp, flex:1 }} value={panelChannel} onChange={e=>setPanelChannel(e.target.value)} placeholder="Channel ID" />
                <button className="btn-primary" onClick={sendPanel} style={{ fontSize:12, whiteSpace:'nowrap' }}>Send</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Edit existing panel (paste Message Link)</div>
              <div style={{ display:'flex', gap:7 }}>
                <input style={{ ...inp, flex:1 }} value={panelLink} onChange={e=>setPanelLink(e.target.value)} placeholder="Right click → Copy Message Link" />
                <button className="btn-secondary" onClick={editPanel} style={{ fontSize:12, whiteSpace:'nowrap' }}>Update</button>
              </div>
            </div>
            {panelStatus && <div style={{ marginTop:9, fontSize:12, color: panelStatus.startsWith('✅') ? T.green : panelStatus.startsWith('❌') ? '#f87171' : T.faint }}>{panelStatus}</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function WelcomePage({ gd, update, save, saving }) {
  const [showVars, setShowVars] = useState(false);
  const cfg = gd.welcomeEmbed || {};
  const upd = (k,v) => update(`welcomeEmbed.${k}`,v);
  return (
    <div>
      <PageTitle title="Welcome & Auto-Role" sub="Greet new members with a custom embed" action={<SaveBtn save={save} saving={saving} />} />
      <button className="btn-secondary" onClick={()=>setShowVars(!showVars)} style={{ fontSize:11.5, marginBottom:16 }}>{showVars?'▲ Hide':'▼ Show'} Variables</button>
      <VarsRef show={showVars} />
      <div className="grid-2" style={{ marginBottom:16 }}>
        <Card accent="purple">
          <STitle accent="purple">Settings</STitle>
          <TRow label="Welcome Messages" desc="Send embed when member joins" value={cfg.enabled} onChange={v=>upd('enabled',v)} />
          <TRow label="Show Timestamp" value={cfg.showTimestamp} onChange={v=>upd('showTimestamp',v)} />
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Embed Color</div>
            <div style={{ display:'flex', gap:8 }}><input type="color" value={cfg.color||T.purple} onChange={e=>upd('color',e.target.value)} style={{ width:36, height:32, borderRadius:6, border:'none', cursor:'pointer' }} /><input style={{ ...inp, flex:1 }} value={cfg.color||T.purple} onChange={e=>upd('color',e.target.value)} /></div>
          </div>
        </Card>
        <Card accent="indigo">
          <STitle accent="indigo">Text & Author</STitle>
          {[['Outside Text (above embed)','outsideText','Hey {user}!'],['Author Text','authorText','{servername}'],['Author Icon URL','authorIconUrl','{avatar}']].map(([l,k,p])=>(
            <div key={k} style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>{l}</div>
              <input style={inp} value={cfg[k]||''} onChange={e=>upd(k,e.target.value)} placeholder={p} />
            </div>
          ))}
        </Card>
      </div>
      <Card accent="pink" style={{ marginBottom:16 }}>
        <STitle accent="pink">Embed Content</STitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          {[['Title','title'],['Thumbnail URL','thumbnailUrl'],['Image URL','imageUrl'],['Footer Text','footerText'],['Footer Icon URL','footerIconUrl']].map(([l,k])=>(
            <div key={k}>
              <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>{l}</div>
              <input style={inp} value={cfg[k]||''} onChange={e=>upd(k,e.target.value)} />
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Description</div>
          <textarea style={{ ...inp, resize:'none' }} rows={3} value={cfg.description||''} onChange={e=>upd('description',e.target.value)} placeholder="Welcome to {servername}, {user}!" />
        </div>
      </Card>
      <Card accent="purple" style={{ marginBottom:16 }}>
        <STitle accent="purple">Embed Fields</STitle>
        {(cfg.fields||[]).map((f,i)=>(
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:7, marginBottom:7, alignItems:'center' }}>
            <input style={inp} value={f.name} onChange={e=>{const fs=[...(cfg.fields||[])];fs[i]={...fs[i],name:e.target.value};upd('fields',fs);}} placeholder="Field name" />
            <input style={inp} value={f.value} onChange={e=>{const fs=[...(cfg.fields||[])];fs[i]={...fs[i],value:e.target.value};upd('fields',fs);}} placeholder="Field value" />
            <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:11.5, color:T.faint, whiteSpace:'nowrap' }}><input type="checkbox" checked={!!f.inline} onChange={e=>{const fs=[...(cfg.fields||[])];fs[i]={...fs[i],inline:e.target.checked};upd('fields',fs);}} />Inline</label>
            <button className="btn-danger" onClick={()=>{const fs=[...(cfg.fields||[])];fs.splice(i,1);upd('fields',fs);}}>×</button>
          </div>
        ))}
        <button className="btn-secondary" style={{ fontSize:11.5 }} onClick={()=>upd('fields',[...(cfg.fields||[]),{name:'',value:'',inline:false}])}>+ Add Field</button>
      </Card>
      <Card accent="indigo">
        <STitle accent="indigo">Live Preview</STitle>
        <EmbedPreview cfg={cfg} />
      </Card>
    </div>
  );
}

function LevelingPage({ gd, update, save, saving }) {
  const [newLevel, setNewLevel] = useState('');
  const [newRole,  setNewRole]  = useState('');
  return (
    <div>
      <PageTitle title="Leveling" sub="Arcane-style XP system with role rewards" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="indigo">
          <STitle accent="indigo">XP Settings</STitle>
          <Slider label="Min XP per message" value={gd.xpMin||15} min={5} max={50} unit=" XP" onChange={v=>update('xpMin',v)} />
          <Slider label="Max XP per message" value={gd.xpMax||40} min={10} max={100} unit=" XP" onChange={v=>update('xpMax',v)} />
          <Slider label="Cooldown" value={gd.xpCooldown||60} min={5} max={300} unit="s" onChange={v=>update('xpCooldown',v)} />
          <TRow label="Leveling Enabled" value={gd.levelingEnabled} onChange={v=>update('levelingEnabled',v)} />
          <TRow label="Level Up Messages" value={gd.levelUpMessages} onChange={v=>update('levelUpMessages',v)} />
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Level Up Channel ID <span style={{ color:T.faint }}>(leave blank = same channel)</span></div>
            <input style={inp} value={gd.levelUpChannelId||''} onChange={e=>update('levelUpChannelId',e.target.value)} placeholder="Channel ID for level up messages" />
          </div>
          <div style={{ marginTop:10, fontSize:11, color:T.faint, padding:'8px 10px', background:'rgba(99,102,241,0.05)', borderRadius:7 }}>
            💡 Formula: <code style={{ color:T.indigo }}>5×N² + 50×N + 100</code> XP per level (Arcane)
          </div>
        </Card>
        <Card accent="purple">
          <STitle accent="purple">Level Role Rewards</STitle>
          {(gd.levelRoles||[]).map((r,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ width:38, height:38, borderRadius:8, background:'rgba(147,51,234,0.1)', border:`1px solid rgba(147,51,234,0.2)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontSize:10, fontWeight:700, color:T.purple, flexShrink:0 }}>LV{r.level}</div>
              <div style={{ flex:1, fontSize:12.5 }}>Role: <code style={{ color:T.purple, fontSize:11 }}>{r.roleId}</code></div>
              <button className="btn-danger" onClick={()=>{const rs=[...(gd.levelRoles||[])];rs.splice(i,1);update('levelRoles',rs);}}>×</button>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            <input style={inp} value={newLevel} onChange={e=>setNewLevel(e.target.value)} placeholder="Level (e.g. 10)" type="number" />
            <input style={inp} value={newRole} onChange={e=>setNewRole(e.target.value)} placeholder="Role ID" />
          </div>
          <button className="btn-primary" style={{ marginTop:8, width:'100%', fontSize:12 }} onClick={()=>{if(newLevel&&newRole){update('levelRoles',[...(gd.levelRoles||[]),{level:parseInt(newLevel),roleId:newRole}]);setNewLevel('');setNewRole('');}}}>+ Add Reward</button>
        </Card>
      </div>
    </div>
  );
}

function CommandsPage({ guildId, commands, setCommands }) {
  const [newCmd, setNewCmd] = useState({ trigger:'', response:'' });
  const add = async () => {
    if (!newCmd.trigger || !newCmd.response) return;
    const res = await api(`/api/guild/${guildId}/commands`, { method:'POST', body: JSON.stringify(newCmd) });
    setCommands(prev => [...prev.filter(c=>c.trigger!==res.trigger), res]);
    setNewCmd({ trigger:'', response:'' });
  };
  const del = async t => {
    await api(`/api/guild/${guildId}/commands`, { method:'DELETE', body: JSON.stringify({ trigger:t }) });
    setCommands(prev => prev.filter(c=>c.trigger!==t));
  };
  return (
    <div>
      <PageTitle title="Custom Commands" subtitle="Prefix: !" sub={`${commands.length}/50 commands used`} />
      <Card accent="pink">
        <STitle accent="pink">Commands</STitle>
        {commands.map(c=>(
          <div key={c.trigger} style={{ display:'flex', gap:9, padding:'8px 10px', borderRadius:8, marginBottom:6, background:'rgba(255,255,255,0.02)', border:`1px solid ${T.border}` }}>
            <div style={{ width:26, height:26, borderRadius:6, background:'rgba(236,72,153,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:T.pink, fontSize:10.5, fontWeight:700, flexShrink:0 }}>!</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>!{c.trigger}</div>
              <div style={{ fontSize:11, color:T.faint }}>{c.response.substring(0,80)}{c.response.length>80?'…':''}</div>
            </div>
            <button className="btn-danger" onClick={()=>del(c.trigger)}>×</button>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:8, marginTop:14, alignItems:'flex-end' }}>
          <div><div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Trigger</div><input style={inp} value={newCmd.trigger} onChange={e=>setNewCmd(p=>({...p,trigger:e.target.value.toLowerCase()}))} placeholder="rules" /></div>
          <div><div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Response</div><input style={inp} value={newCmd.response} onChange={e=>setNewCmd(p=>({...p,response:e.target.value}))} placeholder="Please read #rules!" /></div>
          <button className="btn-primary" onClick={add}>Add</button>
        </div>
      </Card>
    </div>
  );
}

function GiveawaysPage({ giveaways, gd, update, save, saving }) {
  const [newRoleId, setNewRoleId] = useState('');
  const [newEntries, setNewEntries] = useState('');
  const addBonus = () => {
    if (!newRoleId.trim() || !newEntries) return;
    const existing = (gd.giveawayBonusEntries||[]).filter(e=>e.roleId!==newRoleId.trim());
    update('giveawayBonusEntries',[...existing,{roleId:newRoleId.trim(),entries:parseInt(newEntries)}]);
    setNewRoleId(''); setNewEntries('');
  };
  return (
    <div>
      <PageTitle title="Giveaways" sub="Bonus entries and giveaway history" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2" style={{ marginBottom:16 }}>
        <Card accent="purple">
          <STitle accent="purple">Bonus Entries per Role</STitle>
          <div style={{ fontSize:11, color:T.faint, marginBottom:12 }}>Members with these roles get extra entries. Roles stack.</div>
          {!(gd.giveawayBonusEntries||[]).length && <div style={{ fontSize:12, color:T.faint, marginBottom:10 }}>No bonus entries set.</div>}
          {(gd.giveawayBonusEntries||[]).map((e,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:8, marginBottom:6, background:'rgba(147,51,234,0.06)', border:`1px solid rgba(147,51,234,0.12)` }}>
              <div style={{ width:26, height:26, borderRadius:6, background:'rgba(147,51,234,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:T.purple, fontWeight:700, flexShrink:0 }}>+{e.entries}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12 }}>Role: <code style={{ color:T.purple, fontSize:11 }}>{e.roleId}</code></div>
                <div style={{ fontSize:11, color:T.faint }}>{e.entries} bonus {e.entries===1?'entry':'entries'}</div>
              </div>
              <button className="btn-danger" onClick={()=>update('giveawayBonusEntries',(gd.giveawayBonusEntries||[]).filter((_,j)=>j!==i))}>×</button>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 70px auto', gap:7, marginTop:12, alignItems:'flex-end' }}>
            <div><div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Role ID</div><input style={inp} value={newRoleId} onChange={e=>setNewRoleId(e.target.value)} placeholder="Right click role → Copy ID" /></div>
            <div><div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Entries</div><input style={{ ...inp, width:'100%' }} type="number" min="1" max="50" value={newEntries} onChange={e=>setNewEntries(e.target.value)} placeholder="2" /></div>
            <button className="btn-primary" onClick={addBonus} style={{ fontSize:12 }}>Add</button>
          </div>
        </Card>
        <Card accent="indigo">
          <STitle accent="indigo">How it works</STitle>
          <div style={{ fontSize:12.5, color:T.muted, lineHeight:2 }}>
            <div>🎟️ Bonus entries increase <b>chance</b> of winning</div>
            <div>🏆 A user can only win <b>once</b> per giveaway</div>
            <div>📚 Multiple roles <b>stack</b></div>
            <div>⏱️ Winners picked within <b>10 seconds</b></div>
            <div>👥 Users can view participants via button</div>
            <div>🚪 Users can <b>leave</b> by clicking Enter again</div>
          </div>
        </Card>
      </div>
      <Card accent="indigo">
        <STitle accent="indigo">Giveaway History</STitle>
        {!giveaways.length && <div style={{ color:T.faint, fontSize:12.5 }}>No giveaways yet.</div>}
        {giveaways.map(g=>(
          <div key={g.giveawayId} style={{ padding:'10px 12px', borderRadius:9, marginBottom:6, background:'rgba(255,255,255,0.02)', border:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>🎁 {g.prize}</div>
                <div style={{ fontSize:11, color:T.faint, marginTop:2 }}>ID: <code style={{ color:T.purple }}>{g.giveawayId}</code> · {[...new Set(g.entries||[])].length} entrants · {g.winnerCount} winner(s)</div>
              </div>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, flexShrink:0, background: g.ended?'rgba(255,255,255,0.04)':'rgba(34,197,94,0.08)', color: g.ended?T.faint:T.green }}>{g.ended?'Ended':'● Active'}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SuggestionsPage({ gd, update, save, saving }) {
  return (
    <div>
      <PageTitle title="Suggestions" sub="Let your community vote on ideas" action={<SaveBtn save={save} saving={saving} />} />
      <div className="grid-2">
        <Card accent="purple">
          <STitle accent="purple">Settings</STitle>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Suggestion Channel ID</div>
            <input style={inp} value={gd.suggestionChannelId||''} onChange={e=>update('suggestionChannelId',e.target.value)} placeholder="Paste Channel ID or use /suggestion channel" />
          </div>
          <div style={{ padding:'10px 12px', background:'rgba(147,51,234,0.06)', borderRadius:8, fontSize:12, color:T.muted, lineHeight:1.8 }}>
            <div>🟡 <b>Pending</b> — yellow embed, voting open</div>
            <div>🟢 <b>Approved</b> — green embed, voting closed</div>
            <div>🔴 <b>Disapproved</b> — red embed, voting closed</div>
          </div>
        </Card>
        <Card accent="indigo">
          <STitle accent="indigo">How it works</STitle>
          <div style={{ fontSize:12.5, color:T.muted, lineHeight:2 }}>
            <div>📝 <code style={{ color:T.indigo }}>/suggest &lt;idea&gt;</code> — submit</div>
            <div>⏰ 6 hour cooldown per user</div>
            <div>📊 Vote button → 👍 Upvote / 👎 Downvote</div>
            <div>🔤 Each suggestion gets a <b>3-letter code</b></div>
            <div>✅ <code style={{ color:T.indigo }}>/suggestion XYZ approve</code></div>
            <div>❌ <code style={{ color:T.indigo }}>/suggestion XYZ disapprove</code></div>
            <div>🚫 Approval blocked in maintenance mode</div>
            <div>💡 Bot randomly nudges users to suggest</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ModLogsPage({ gd, update, save, saving }) {
  return (
    <div>
      <PageTitle title="Mod Logs" sub="Set where moderation actions are logged" action={<SaveBtn save={save} saving={saving} />} />
      <Card accent="pink">
        <STitle accent="pink">Log Channel</STitle>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Mod Log Channel ID</div>
          <input style={inp} value={gd.modLogChannelId||''} onChange={e=>update('modLogChannelId',e.target.value)} placeholder="Paste Channel ID" />
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:T.faint, marginBottom:5 }}>Ticket Log Channel ID</div>
          <input style={inp} value={gd.ticketLogChannelId||''} onChange={e=>update('ticketLogChannelId',e.target.value)} placeholder="Paste Channel ID" />
        </div>
        <div style={{ fontSize:12, color:T.faint, padding:'10px 12px', background:'rgba(236,72,153,0.05)', borderRadius:8 }}>
          💡 Right-click a channel in Discord → Copy ID. You need Developer Mode on in Discord Settings → Advanced.
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user,      setUser]      = useState(null);
  const [guilds,    setGuilds]    = useState([]);
  const [guildId,   setGuildId]   = useState(null);
  const [guildData, setGuildData] = useState(null);
  const [page,      setPage]      = useState('overview');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [sideOpen,  setSideOpen]  = useState(false);
  const [stats,     setStats]     = useState(null);
  const [commands,  setCommands]  = useState([]);
  const [giveaways, setGiveaways] = useState([]);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) console.error('Auth error:', decodeURIComponent(err));
    api('/api/me').then(d=>{ if(d.user){ setUser(d.user); setGuilds(d.guilds||[]); } }).catch(()=>{});
  },[]);

  useEffect(()=>{
    if (!guildId) return;
    api(`/api/guild/${guildId}`).then(setGuildData);
    api(`/api/guild/${guildId}/stats`).then(setStats);
    api(`/api/guild/${guildId}/commands`).then(setCommands);
    api(`/api/guild/${guildId}/giveaways`).then(setGiveaways);
  },[guildId]);

  const update = (path, value) => {
    setGuildData(prev=>{
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i=0; i<keys.length-1; i++){ if(!cur[keys[i]]) cur[keys[i]]={}; cur=cur[keys[i]]; }
      cur[keys[keys.length-1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    await api(`/api/guild/${guildId}`, { method:'POST', body: JSON.stringify(guildData) });
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const navItems = [
    { id:'overview',    icon:'⬡', label:'Overview',    section:'General' },
    { id:'antiraid',    icon:'🛡', label:'Anti-Raid',   section:'Protection' },
    { id:'antinuke',    icon:'💣', label:'Anti-Nuke',   section:'Protection' },
    { id:'tickets',     icon:'🎫', label:'Tickets',     section:'Features' },
    { id:'welcome',     icon:'👋', label:'Welcome',     section:'Features' },
    { id:'leveling',    icon:'⬆', label:'Leveling',    section:'Features' },
    { id:'commands',    icon:'📝', label:'Commands',    section:'Features' },
    { id:'giveaways',   icon:'🎁', label:'Giveaways',  section:'Features' },
    { id:'suggestions', icon:'💡', label:'Suggestions', section:'Features' },
    { id:'modlogs',     icon:'🔨', label:'Mod Logs',   section:'Config' },
  ];

  if (!user) return <LoginPage />;
  if (!guildId) return <GuildSelect guilds={guilds} onSelect={setGuildId} user={user} />;
  if (!guildData) return <Loading />;

  const gd = guildData;
  const selectedGuild = guilds.find(g=>g.id===guildId);

  return (
    <>
      <Head>
        <title>repl dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:rgba(147,51,234,0.2);border-radius:2px;}
        input,select,textarea{font-family:inherit;color:${T.text};transition:border-color 0.2s,box-shadow 0.2s;}
        input:focus,select:focus,textarea:focus{border-color:rgba(147,51,234,0.4)!important;box-shadow:0 0 0 3px rgba(147,51,234,0.08)!important;outline:none;}
        select option{background:#1a1030;color:${T.text};}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{box-shadow:0 0 14px rgba(147,51,234,0.5)}50%{box-shadow:0 0 26px rgba(147,51,234,0.8)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes orb1{0%{transform:translate(0,0)}100%{transform:translate(25px,18px)}}
        @keyframes orb2{0%{transform:translate(0,0)}100%{transform:translate(-20px,12px)}}
        @keyframes savePop{from{opacity:0;transform:translateX(-50%) scale(0.9)}to{opacity:1;transform:translateX(-50%) scale(1)}}
        .page-content{animation:fadeIn 0.3s ease both;}
        .stat-card{animation:fadeIn 0.4s ease both;transition:transform 0.2s;}
        .stat-card:hover{transform:translateY(-2px);}
        .nav-item{transition:all 0.15s;cursor:pointer;border-radius:8px;padding:8px 11px;margin:1px 0;display:flex;align-items:center;gap:9px;font-size:13px;color:${T.faint};border:1px solid transparent;}
        .nav-item:hover{background:rgba(147,51,234,0.06);color:rgba(240,235,255,0.8);}
        .nav-item.active{background:linear-gradient(135deg,rgba(147,51,234,0.14),rgba(99,102,241,0.1));color:${T.text};border-color:rgba(147,51,234,0.16);}
        .btn-primary{background:linear-gradient(135deg,${T.purple},${T.indigo});color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:500;font-family:inherit;transition:all 0.16s;box-shadow:0 2px 14px rgba(147,51,234,0.2);}
        .btn-primary:hover{box-shadow:0 4px 20px rgba(147,51,234,0.35);transform:translateY(-1px);}
        .btn-primary:disabled{opacity:0.55;cursor:not-allowed;transform:none;}
        .btn-secondary{background:rgba(255,255,255,0.05);color:${T.text};border:1px solid ${T.border};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12.5px;font-family:inherit;transition:all 0.16s;}
        .btn-secondary:hover{background:rgba(255,255,255,0.08);}
        .btn-danger{background:rgba(239,68,68,0.08);color:#fca5a5;border:1px solid rgba(239,68,68,0.12);padding:5px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-family:inherit;transition:all 0.16s;}
        .btn-danger:hover{background:rgba(239,68,68,0.15);}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:900px){.grid-2{grid-template-columns:1fr!important;}.sidebar-desktop{display:none!important;}.main-area{margin-left:0!important;}.mobile-header{display:flex!important;}}
        @media(max-width:600px){.stats-row{grid-template-columns:1fr 1fr!important;}.topbar{flex-direction:column;gap:10px;}}
        .sidebar-desktop{display:flex;}
        .mobile-header{display:none;position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(8,5,16,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(147,51,234,0.08);padding:13px 18px;align-items:center;justify-content:space-between;height:58px;}
        .mobile-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:149;}
        .mobile-sidebar{display:none;position:fixed;top:0;left:0;bottom:0;width:240px;background:${T.bg};border-right:1px solid rgba(147,51,234,0.08);z-index:150;padding:18px 0;overflow-y:auto;transform:translateX(-100%);transition:transform 0.25s;}
        @media(max-width:900px){.mobile-header{display:flex!important;}.mobile-sidebar{display:block!important;}.mobile-sidebar.open{transform:translateX(0)!important;}.mobile-overlay.open{display:block!important;}.main-area{padding-top:74px!important;}}
      `}</style>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:T.purple, filter:'blur(100px)', opacity:0.1, top:-100, left:-100, animation:'orb1 14s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:T.indigo, filter:'blur(90px)', opacity:0.08, top:'40%', right:-100, animation:'orb2 17s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(147,51,234,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(147,51,234,0.025) 1px,transparent 1px)`, backgroundSize:'48px 48px' }} />
      </div>

      {/* Mobile header */}
      <div className="mobile-header">
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'white', animation:'pulse 3s ease-in-out infinite' }}>R</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, background:`linear-gradient(135deg,#c084fc,#818cf8)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>repl</span>
        </div>
        <button onClick={()=>setSideOpen(!sideOpen)} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, borderRadius:7, padding:'6px 9px', cursor:'pointer', color:T.text }}>☰</button>
      </div>

      <div className={`mobile-overlay ${sideOpen?'open':''}`} onClick={()=>setSideOpen(false)} />
      <div className={`mobile-sidebar ${sideOpen?'open':''}`}>
        <Sidebar items={navItems} page={page} setPage={p=>{setPage(p);setSideOpen(false);}} guild={selectedGuild} user={user} setGuildId={setGuildId} gd={gd} />
      </div>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ position:'fixed', left:0, top:0, bottom:0, width:212, background:'rgba(8,5,16,0.98)', borderRight:`1px solid rgba(147,51,234,0.08)`, backdropFilter:'blur(20px)', zIndex:100, flexDirection:'column', padding:'20px 0', overflowY:'auto' }}>
        <Sidebar items={navItems} page={page} setPage={setPage} guild={selectedGuild} user={user} setGuildId={setGuildId} gd={gd} />
      </div>

      {/* Main */}
      <div className="main-area" style={{ marginLeft:212, padding:'28px 28px 80px 32px', position:'relative', zIndex:1, minHeight:'100vh' }}>
        {saved && (
          <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', background:'rgba(15,10,25,0.97)', border:`1px solid rgba(34,197,94,0.25)`, backdropFilter:'blur(20px)', borderRadius:12, padding:'10px 22px', zIndex:300, animation:'savePop 0.25s ease', boxShadow:'0 8px 30px rgba(0,0,0,0.5)', fontSize:13.5, color:T.green }}>
            ✅ Settings saved!
          </div>
        )}
        <div className="page-content" key={page}>
          {page==='overview'    && <OverviewPage    gd={gd} stats={stats} user={user} />}
          {page==='antiraid'    && <AntiRaidPage    gd={gd} update={update} save={save} saving={saving} />}
          {page==='antinuke'    && <AntiNukePage    gd={gd} update={update} save={save} saving={saving} />}
          {page==='tickets'     && <TicketsPage     gd={gd} update={update} save={save} saving={saving} guildId={guildId} />}
          {page==='welcome'     && <WelcomePage     gd={gd} update={update} save={save} saving={saving} />}
          {page==='leveling'    && <LevelingPage    gd={gd} update={update} save={save} saving={saving} />}
          {page==='commands'    && <CommandsPage    guildId={guildId} commands={commands} setCommands={setCommands} />}
          {page==='giveaways'   && <GiveawaysPage   giveaways={giveaways} gd={gd} update={update} save={save} saving={saving} />}
          {page==='suggestions' && <SuggestionsPage gd={gd} update={update} save={save} saving={saving} />}
          {page==='modlogs'     && <ModLogsPage     gd={gd} update={update} save={save} saving={saving} />}
        </div>
      </div>
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ items, page, setPage, guild, user, setGuildId, gd }) {
  let lastSection = '';
  return (
    <>
      <div style={{ padding:'0 16px 20px', borderBottom:`1px solid ${T.border}`, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17, color:'white', animation:'pulse 3s ease-in-out infinite' }}>R</div>
          <span style={{ background:`linear-gradient(135deg,#c084fc,#818cf8)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>repl</span>
        </div>
      </div>
      <div style={{ margin:'0 10px 14px', padding:'9px 12px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, display:'flex', alignItems:'center', gap:9, cursor:'pointer' }} onClick={()=>setGuildId(null)}>
        {guild?.icon ? <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} style={{ width:26, height:26, borderRadius:6 }} alt="" /> : <div style={{ width:26, height:26, borderRadius:6, background:`linear-gradient(135deg,${T.purple},${T.pink})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{guild?.name?.[0]||'?'}</div>}
        <div style={{ fontSize:12.5, fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{guild?.name||'Server'}</div>
        <div style={{ color:T.faint, fontSize:9 }}>▼</div>
      </div>
      <div style={{ padding:'0 10px' }}>
        {items.map(item=>{
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          return (
            <div key={item.id}>
              {showSection && <div style={{ fontSize:9.5, fontWeight:700, color:T.faint, letterSpacing:'0.1em', textTransform:'uppercase', padding:'7px 2px 3px' }}>{item.section}</div>}
              <div className={`nav-item ${page===item.id?'active':''}`} onClick={()=>setPage(item.id)}>
                <span style={{ fontSize:13 }}>{item.icon}</span>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:'auto', padding:'14px 16px 0', borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:T.green, boxShadow:`0 0 6px ${T.green}`, animation:'blink 2.5s ease-in-out infinite' }} />
          <span style={{ fontSize:11.5, color:T.faint }}>repl is <span style={{ color:T.green }}>online</span></span>
        </div>
        <div style={{ marginTop:6, fontSize:11.5, color:T.faint }}>@{user?.username}</div>
        <a href="/api/auth/logout" style={{ display:'block', marginTop:8, fontSize:11.5, color:T.faint, textDecoration:'none', padding:'5px 0', borderTop:`1px solid ${T.border}` }}>Logout</a>
      </div>
    </>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage() {
  return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', position:'relative', overflow:'hidden' }}>
      <Head><link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" /></Head>
      <style>{`
        @keyframes pulse{0%,100%{box-shadow:0 0 24px rgba(147,51,234,0.5)}50%{box-shadow:0 0 48px rgba(147,51,234,0.8)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes orb1{0%{transform:translate(0,0)}100%{transform:translate(30px,20px)}}
        @keyframes orb2{0%{transform:translate(0,0)}100%{transform:translate(-25px,15px)}}
        .login-card{animation:fadeIn 0.5s ease both;}
        .login-btn{transition:all 0.2s;} .login-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(147,51,234,0.5)!important;}
      `}</style>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:T.purple, filter:'blur(100px)', opacity:0.12, top:-150, left:-150, animation:'orb1 14s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:T.pink, filter:'blur(100px)', opacity:0.08, bottom:-100, right:-100, animation:'orb2 17s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(147,51,234,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(147,51,234,0.025) 1px,transparent 1px)`, backgroundSize:'48px 48px' }} />
      </div>
      <div className="login-card" style={{ position:'relative', zIndex:1, textAlign:'center', padding:'44px 38px', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.07)`, borderRadius:20, maxWidth:400, width:'90%', backdropFilter:'blur(20px)' }}>
        <div style={{ width:68, height:68, borderRadius:16, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:30, color:'white', margin:'0 auto 18px', animation:'pulse 3s ease-in-out infinite,float 4s ease-in-out infinite' }}>R</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:30, fontWeight:800, background:`linear-gradient(135deg,#c084fc,#818cf8,#f9a8d4)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>repl</div>
        <div style={{ color:T.muted, fontSize:13.5, marginBottom:28, lineHeight:1.6 }}>The all-in-one Discord bot dashboard.</div>
        <a href="/api/auth/login" className="login-btn" style={{ display:'block', padding:'13px 22px', background:`linear-gradient(135deg,${T.purple},${T.indigo})`, color:'white', borderRadius:12, textDecoration:'none', fontWeight:600, fontSize:14.5, boxShadow:`0 4px 24px rgba(147,51,234,0.35)` }}>Login with Discord</a>
        <div style={{ marginTop:16, fontSize:11.5, color:T.faint }}>By logging in you agree to our terms of service</div>
      </div>
    </div>
  );
}

// ─── Guild Select ─────────────────────────────────────────────────────────────
function GuildSelect({ guilds, onSelect, user }) {
  const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=1473915873373720652&permissions=8&scope=bot+applications.commands`;
  const [botGuilds, setBotGuilds] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(()=>{
    api('/api/botguilds').then(d=>{ setBotGuilds(d.guildIds||[]); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  const added    = guilds.filter(g=>botGuilds.includes(g.id));
  const notAdded = guilds.filter(g=>!botGuilds.includes(g.id));

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:'DM Sans,sans-serif', padding:'36px 20px' }}>
      <Head><link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" /></Head>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{box-shadow:0 0 14px rgba(147,51,234,0.5)}50%{box-shadow:0 0 26px rgba(147,51,234,0.8)}}
        @keyframes orb1{0%{transform:translate(0,0)}100%{transform:translate(25px,18px)}}
        @keyframes orb2{0%{transform:translate(0,0)}100%{transform:translate(-20px,12px)}}
        .g-card{transition:all 0.18s;cursor:pointer;animation:fadeIn 0.35s ease both;}
        .g-card:hover{transform:translateY(-2px);border-color:rgba(147,51,234,0.3)!important;background:rgba(147,51,234,0.06)!important;}
        .i-card{transition:all 0.18s;animation:fadeIn 0.35s ease both;}
        .i-card:hover{transform:translateY(-2px);border-color:rgba(99,102,241,0.3)!important;}
        .sec-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(240,235,255,0.3);margin-bottom:12px;}
      `}</style>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:T.purple, filter:'blur(100px)', opacity:0.1, top:-100, left:-100, animation:'orb1 14s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:T.pink, filter:'blur(90px)', opacity:0.07, bottom:-80, right:-80, animation:'orb2 17s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(147,51,234,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(147,51,234,0.025) 1px,transparent 1px)`, backgroundSize:'48px 48px' }} />
      </div>
      <div style={{ maxWidth:800, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:44, flexWrap:'wrap', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:19, color:'white', animation:'pulse 3s ease-in-out infinite' }}>R</div>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, background:`linear-gradient(135deg,#c084fc,#818cf8)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>repl</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            {user?.avatar ? <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width:30, height:30, borderRadius:'50%' }} alt="" /> : <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${T.purple},${T.pink})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>{user?.username?.[0]}</div>}
            <span style={{ fontSize:13, color:T.muted }}>@{user?.username}</span>
            <a href="/api/auth/logout" style={{ fontSize:12, color:T.faint, textDecoration:'none', padding:'4px 10px', border:`1px solid ${T.border}`, borderRadius:7 }}>Logout</a>
          </div>
        </div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, marginBottom:5, background:`linear-gradient(135deg,#c084fc,#818cf8)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Select a Server</div>
        <div style={{ color:T.muted, fontSize:13, marginBottom:36 }}>Choose a server to manage. You need Administrator permission.</div>
        {loading ? <div style={{ textAlign:'center', color:T.faint, padding:40 }}>Loading servers…</div> : (
          <>
            {added.length > 0 && (
              <div style={{ marginBottom:36 }}>
                <div className="sec-label">✅ Bot is in these servers</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:12 }}>
                  {added.map((g,i)=>(
                    <div key={g.id} className="g-card" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:13, padding:'16px 18px', animationDelay:`${i*0.04}s` }} onClick={()=>onSelect(g.id)}>
                      <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                        {g.icon ? <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} style={{ width:42, height:42, borderRadius:9, flexShrink:0 }} alt="" /> : <div style={{ width:42, height:42, borderRadius:9, background:`linear-gradient(135deg,${T.purple},${T.pink})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'white', flexShrink:0 }}>{g.name[0]}</div>}
                        <div><div style={{ fontSize:13, fontWeight:600 }}>{g.name}</div><div style={{ fontSize:11, color:T.green, marginTop:2 }}>● Manage</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {notAdded.length > 0 && (
              <div>
                <div className="sec-label">➕ Invite bot to these servers</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:12 }}>
                  {notAdded.map((g,i)=>(
                    <a key={g.id} className="i-card" href={`${BOT_INVITE}&guild_id=${g.id}`} target="_blank" rel="noreferrer" style={{ background:'rgba(255,255,255,0.015)', border:`1px solid ${T.border}`, borderRadius:13, padding:'16px 18px', textDecoration:'none', display:'block', opacity:0.65, animationDelay:`${i*0.04}s` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                        {g.icon ? <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} style={{ width:42, height:42, borderRadius:9, flexShrink:0, filter:'grayscale(0.3)' }} alt="" /> : <div style={{ width:42, height:42, borderRadius:9, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:T.faint, flexShrink:0 }}>{g.name[0]}</div>}
                        <div><div style={{ fontSize:13, fontWeight:600, color:T.muted }}>{g.name}</div><div style={{ fontSize:11, color:T.indigo, marginTop:2 }}>+ Invite Bot</div></div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {guilds.length === 0 && <div style={{ textAlign:'center', color:T.faint, padding:48 }}>You don't have Administrator in any servers.</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.bg, flexDirection:'column', gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:11, background:`linear-gradient(135deg,${T.purple},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'white', animation:'pulse 1.5s ease-in-out infinite' }}>R</div>
      <div style={{ color:T.faint, fontSize:13 }}>Loading…</div>
    </div>
  );
}

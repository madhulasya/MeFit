/* ==========================
   SIMPLE SPA STATE + STORAGE
   ========================== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const Storage = {
  get(key, def){ try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

// Seed sample data if empty
(function seed(){
  if(!Storage.get('users')){
    const admin = { id: 'u1', name:'Admin One', email:'admin@mefit.app', pass:'admin', role:'admin',
      picture:'', twoFA:'off', height:175, weight:72, level:'Advanced', requests:[] };
    const user = { id: 'u2', name:'Jordan User', email:'user@mefit.app', pass:'user', role:'user',
      picture:'', twoFA:'off', height:168, weight:70, level:'Beginner', requests:[] };
    Storage.set('users', [admin, user]);
  }
  if(!Storage.get('exercises')){
    Storage.set('exercises', [
      {id:'e1', name:'Barbell Bench Press', muscle:'Chest', eq:'Barbell', notes:'Elbows ~45°, control tempo', by:'system'},
      {id:'e2', name:'Deadlift', muscle:'Back', eq:'Barbell', notes:'Neutral spine, hinge hips', by:'system'},
      {id:'e3', name:'Back Squat', muscle:'Legs', eq:'Barbell', notes:'Depth parallel or below', by:'system'},
      {id:'e4', name:'Plank', muscle:'Core', eq:'Bodyweight', notes:'Brace; breathe', by:'system'},
      {id:'e5', name:'Push-up', muscle:'Chest', eq:'Bodyweight', notes:'Full ROM', by:'system'},
      {id:'e6', name:'Pull-up', muscle:'Back', eq:'Bar', notes:'Scap retraction', by:'system'},
      {id:'e7', name:'Shoulder Press', muscle:'Shoulders', eq:'Dumbbells', notes:'Avoid flaring', by:'system'},
    ]);
  }
  if(!Storage.get('workouts')){
    Storage.set('workouts', [
      {id:'w1', name:'Upper Body Push', type:'Strength', exercises:['e1','e5','e7'], by:'system'},
      {id:'w2', name:'Lower Body Strength', type:'Strength', exercises:['e3','e2'], by:'system'},
      {id:'w3', name:'Core & Stability', type:'Mobility', exercises:['e4'], by:'system'},
      {id:'w4', name:'Full Body HIIT', type:'HIIT', exercises:['e5','e6','e4'], by:'system'},
    ]);
  }
  if(!Storage.get('programs')){
    Storage.set('programs', [
      {id:'p1', name:'4-Week Strength Base', cat:'Strength', desc:'Foundational compound lifts, 3x/week.', workouts:['w1','w2'], by:'system'},
      {id:'p2', name:'Core & Control', cat:'Mobility', desc:'Stability and control for injury resilience.', workouts:['w3'], by:'system'},
      {id:'p3', name:'Sweat & Burn', cat:'Cardio', desc:'HIIT sessions to elevate conditioning.', workouts:['w4'], by:'system'},
    ]);
  }
  if(!Storage.get('goals')) Storage.set('goals', []); // per-user goals history
})();

let state = {
  user: Storage.get('currentUser', null), // stores user id
  panel: 'dashboard'
};

function getUser(){
  const users = Storage.get('users',[]);
  return users.find(u => u.id === state.user);
}
function setUser(u){
  state.user = u?.id ?? null;
  Storage.set('currentUser', state.user);
}
function upsertUser(updated){
  const users = Storage.get('users',[]);
  const i = users.findIndex(u=>u.id===updated.id);
  if(i>-1) users[i]=updated; else users.push(updated);
  Storage.set('users', users);
}

/* ========= AUTH ========= */
const auth = {
  showLogin(){ $('#login-pane').classList.remove('hidden'); $('#register-pane').classList.add('hidden');
               $('#tab-login').classList.remove('ghost'); $('#tab-register').classList.add('ghost'); },
  showRegister(){ $('#register-pane').classList.remove('hidden'); $('#login-pane').classList.add('hidden');
                  $('#tab-register').classList.remove('ghost'); $('#tab-login').classList.add('ghost'); },
  mount(){
    $('#tab-login').onclick = ()=>auth.showLogin();
    $('#tab-register').onclick = ()=>auth.showRegister();

    $('#demo-user').onclick = ()=>{
      $('#login-email').value='user@mefit.app';
      $('#login-pass').value='user';
      $('#do-login').click();
    };
    $('#do-login').onclick = ()=>{
      const email = $('#login-email').value.trim().toLowerCase();
      const pass = $('#login-pass').value;
      const users = Storage.get('users',[]);
      const u = users.find(x=>x.email.toLowerCase()===email && x.pass===pass);
      if(!u) return alert('Invalid credentials');
      setUser(u); boot();
    };
    $('#prefill-register').onclick = ()=>{
      $('#reg-name').value='Taylor Lift';
      $('#reg-email').value='taylor@mefit.app';
      $('#reg-pass').value='taylor';
      $('#reg-role').value='user';
    };
    $('#do-register').onclick = ()=>{
      const name=$('#reg-name').value.trim();
      const email=$('#reg-email').value.trim().toLowerCase();
      const pass=$('#reg-pass').value;
      const role=$('#reg-role').value;
      if(!name || !email || !pass) return alert('Fill all fields');
      const users=Storage.get('users',[]);
      if(users.some(u=>u.email.toLowerCase()===email)) return alert('Email already registered');
      const id='u'+(Date.now());
      const user={ id, name, email, pass, role, picture:'', twoFA:'off', height:170, weight:70, level:'Beginner', requests:[] };
      users.push(user); Storage.set('users', users);
      alert('Account created. Please log in.');
      auth.showLogin();
      $('#login-email').value=email; $('#login-pass').value=pass;
    };
  }
};

/* ======= APP FRAME / NAV ======= */
function boot(){
  // guard
  if(!state.user){ $('#auth').classList.remove('hidden'); $('#app').classList.add('hidden'); return; }
  $('#auth').classList.add('hidden'); $('#app').classList.remove('hidden');

  const user=getUser();
  // user chip
  $('#current-name').textContent=user.name;
  $('#current-role').textContent= user.role==='admin' ? 'Administrator' : user.role==='contributor' ? 'Contributor' : 'Regular User';
  $('#avatar-img').src = user.picture || 'https://api.dicebear.com/9.x/thumbs/svg?seed=' + encodeURIComponent(user.name);
  $('#logout').onclick = ()=>{ setUser(null); location.reload(); };

  // role explain
  $('#role-explain').innerHTML = `
    <div class="row" style="flex-wrap:nowrap">
      <span class="tag">User</span>
      <span class="tag">Contributor</span>
      <span class="tag">Admin</span>
    </div>
    <p class="fine" style="margin-top:8px">
      Regular users manage weekly goals. Contributors add/edit exercises, workouts, and programs.
      Admins can do everything contributors can, and grant contributor status.
    </p>`;

  // show/hide contributor nav
  const isContrib = (user.role==='contributor' || user.role==='admin');
  $('#nav-contrib').classList.toggle('hidden', !isContrib);

  // nav events
  $$('#nav button').forEach(b=>{
    b.onclick = ()=>{
      $$('#nav button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      showPanel(b.dataset.panel);
    }
  });

  // side quick actions go to panel
  $$('.side [data-panel]').forEach(b=> b.onclick = ()=> {
    $(`#nav [data-panel="${b.dataset.panel}"]`).click();
  });

  hydrateLeft();
  renderProgramsFilters();
  renderWorkouts();
  renderExercises();
  renderPrograms();
  renderGoalUI();
  renderDashboard();
  renderContribSelectors();
  renderProfile();

  // quick-log bridging to goals
  $('#quick-log').onclick = ()=>{ showPanel('goals'); $('#log-workout').focus(); };
}

function hydrateLeft(){
  const now = new Date();
  $('#today').textContent = now.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' });
  const daysLeft = 7 - ((now.getDay()+6)%7+1); // days left in ISO week
  $('#week-left').textContent = `${daysLeft} day${daysLeft!==1?'s':''} left • Week`;

  const { goal } = getCurrentGoal();
  $('#goal-state').textContent = goal ? `Goal: ${goal.completed}/${goal.target} done` : 'No goal set';
}

function showPanel(key){
  state.panel = key;
  $$('.panel').forEach(p=>p.classList.remove('active'));
  $(`#panel-${key}`).classList.add('active');
  if(key==='programs') renderPrograms();
  if(key==='workouts') renderWorkouts();
  if(key==='exercises') renderExercises();
  if(key==='goals') renderGoalUI();
  if(key==='dashboard') renderDashboard();
  if(key==='contributors') renderMine();
  if(key==='profile') renderProfile();
}

/* ======= DATA HELPERS ======= */
const db = {
  all(){ return {
    users: Storage.get('users',[]),
    programs: Storage.get('programs',[]),
    workouts: Storage.get('workouts',[]),
    exercises: Storage.get('exercises',[]),
    goals: Storage.get('goals',[])
  }},
  save(key, list){ Storage.set(key, list); }
};

function getCurrentGoal(){
  const user=getUser(); if(!user) return {};
  const all = Storage.get('goals',[]);
  // goal keyed by year-week for user
  const now = new Date();
  const year = now.getUTCFullYear();
  const week = getISOWeek(now);
  let g = all.find(x=>x.userId===user.id && x.year===year && x.week===week) || null;
  return { goal: g, all };
}

function getISOWeek(d){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4));
  const diff = date - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
}

/* ======= DASHBOARD (FE-03) ======= */
function renderDashboard(){
  const {goal} = getCurrentGoal();
  const target = goal?.target ?? 0;
  const completed = goal?.completed ?? 0;
  const pct = target>0 ? Math.min(100, Math.round((completed/target)*100)) : 0;
  const ring = $('#progress-ring');
  ring.style.setProperty('--p', pct);
  ring.querySelector('span').textContent = pct + '%';
  $('#progress-blurb').textContent = target ? `${completed} of ${target} workouts done.` : 'No goal set for this week.';

  // calendar today marker
  const today = new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  $('#calendar').textContent = today;

  // suggestions (simple based on fitness level)
  const user=getUser();
  const level = (user.level||'Beginner').toLowerCase();
  const suggestions=$('#suggestions');
  const tip = level==='beginner'
    ? 'Start with 3 × 40-minute sessions. Try “4-Week Strength Base”.'
    : level==='intermediate'
    ? 'Aim for 4–5 sessions. Mix Strength + HIIT.'
    : 'Dial in volume and recovery. Consider periodization.';
  suggestions.innerHTML = `
    <div class="tag">Level: ${user.level}</div>
    <p style="margin-top:8px">${tip}</p>
  `;

  hydrateLeft();
}

/* ======= GOALS (FE-04) ======= */
function renderGoalUI(){
  const d = db.all();
  // populate selects
  const progSel = $('#goal-program'); progSel.innerHTML='';
  d.programs.forEach(p=> {
    const o=document.createElement('option'); o.value=p.id; o.textContent=p.name; progSel.appendChild(o);
  });
  const wSel = $('#goal-workouts'); wSel.innerHTML='';
  d.workouts.forEach(w=> { const o=document.createElement('option'); o.value=w.id; o.textContent=w.name; wSel.appendChild(o); });

  // current/past
  const {goal, all} = getCurrentGoal();
  const curr = $('#current-goal');
  if(goal){
    curr.innerHTML = `
      <div class="row">
        <span class="tag">Status: ${goal.completed}/${goal.target}</span>
        <span class="tag">Period: ISO Week ${goal.week}, ${goal.year}</span>
      </div>
      <div style="margin-top:8px">
        <strong>Program:</strong> ${idName('programs',goal.programId) ?? '—'}<br/>
        <strong>Workouts:</strong> ${goal.workouts.map(w=>idName('workouts',w)).join(', ') || '—'}
      </div>`;
  } else {
    curr.innerHTML = `<p class="fine">No goal set for this week.</p>`;
  }

  // past goals for this user
  const user=getUser();
  const mine = all.filter(g=>g.userId===user.id).sort((a,b)=> b.year - a.year || b.week - a.week);
  $('#past-goals').innerHTML = mine.length
    ? `<table><thead><tr><th>Year</th><th>Week</th><th>Target</th><th>Done</th></tr></thead><tbody>` +
      mine.map(g=>`<tr><td>${g.year}</td><td>${g.week}</td><td>${g.target}</td><td>${g.completed}</td></tr>`).join('') +
      `</tbody></table>` : 'No history yet.';

  // start date default = today
  const today = new Date().toISOString().slice(0,10);
  $('#goal-start').value = today;

  // handlers
  $('#set-goal').onclick = ()=>{
    const start = $('#goal-start').value ? new Date($('#goal-start').value) : new Date();
    const year = start.getUTCFullYear();
    const week = getISOWeek(start);
    const target = Math.max(1, parseInt($('#goal-target').value||'0',10));
    const programId = $('#goal-program').value || null;
    const workouts = Array.from($('#goal-workouts').selectedOptions).map(o=>o.value);

    // simple realism check vs profile
    const user=getUser();
    const level=user.level||'Beginner';
    const maxByLevel = level==='Beginner'?5 : level==='Intermediate'?7 : 10;
    const warn = target > maxByLevel;
    $('#goal-warning').style.display = warn ? 'inline-flex' : 'none';

    const all = Storage.get('goals',[]);
    // replace any existing same week goal
    const idx = all.findIndex(g=>g.userId===user.id && g.year===year && g.week===week);
    const g = { userId:user.id, year, week, target, completed:0, start: start.toISOString(), programId, workouts };
    if(idx>-1) all[idx]=g; else all.push(g);
    Storage.set('goals', all);
    alert('Weekly goal set!');
    renderDashboard(); renderGoalUI(); hydrateLeft();
  };

  $('#log-workout').onclick = ()=>{
    const d = getCurrentGoal();
    if(!d.goal) return alert('No current goal set.');
    d.goal.completed = Math.min(d.goal.target, d.goal.completed + 1);
    const all = d.all.map(x=> x.userId===d.goal.userId && x.year===d.goal.year && x.week===d.goal.week ? d.goal : x);
    Storage.set('goals', all);
    addActivity('Logged a workout');
    renderDashboard(); renderGoalUI(); hydrateLeft();
  };

  $('#reset-goal').onclick = ()=>{
    const d=getCurrentGoal(); if(!d.goal) return;
    if(confirm('Reset progress for this week?')) {
      d.goal.completed=0;
      const all = d.all.map(x=> x.userId===d.goal.userId && x.year===d.goal.year && x.week===d.goal.week ? d.goal : x);
      Storage.set('goals', all);
      renderDashboard(); renderGoalUI(); hydrateLeft();
    }
  };
}

function idName(type,id){
  const list = Storage.get(type,[]);
  return list.find(x=>x.id===id)?.name;
}
function addActivity(msg){
  const key = 'activity:'+state.user;
  const arr = Storage.get(key,[]);
  arr.unshift({ t: Date.now(), msg });
  Storage.set(key, arr.slice(0,20));
  $('#recent-activity').innerHTML = arr.map(a=> `<div>• ${a.msg} <span class="fine" style="opacity:.7">(${new Date(a.t).toLocaleTimeString()})</span></div>`).join('');
}

/* ======= PROGRAMS (FE-05) ======= */
function renderProgramsFilters(){
  const cats = [...new Set(Storage.get('programs',[]).map(p=>p.cat))];
  const sel = $('#filter-program-cat');
  cats.forEach(c=> { const o=document.createElement('option'); o.textContent=c; o.value=c; sel.appendChild(o); });
}
function renderPrograms(){
  const cat = $('#filter-program-cat').value;
  const d = db.all();
  let list = d.programs;
  if(cat) list = list.filter(p=>p.cat===cat);
  const el = $('#programs-list');
  el.innerHTML = list.map(p=> `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h3 style="margin:0">${p.name}</h3>
        <span class="tag">${p.cat}</span>
      </div>
      <p class="fine" style="margin:6px 0 10px">${p.desc}</p>
      <div class="fine"><strong>Workouts:</strong> ${p.workouts.map(w=>idName('workouts',w)).join(', ')}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn" onclick="useProgram('${p.id}')">Use this program</button>
      </div>
    </div>
  `).join('');
  $('#refresh-programs').onclick = ()=>renderPrograms();
}
function useProgram(pid){
  showPanel('goals');
  $('#goal-program').value = pid;
  [...$('#goal-workouts').options].forEach(o=>o.selected = Storage.get('programs',[]).find(p=>p.id===pid).workouts.includes(o.value));
}

/* ======= WORKOUTS (FE-06) ======= */
function renderWorkouts(){
  const type = $('#filter-workout-type').value;
  const d = db.all();
  let list = d.workouts;
  if(type) list = list.filter(w=>w.type===type);
  const el = $('#workouts-list');
  el.innerHTML = list.map(w=> `
    <div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">${w.name}</h3><span class="tag">${w.type}</span></div>
      <div class="fine" style="margin-top:6px"><strong>Exercises:</strong> ${w.exercises.map(e=>idName('exercises',e)).join(', ')}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn ghost" onclick="addWorkoutToGoal('${w.id}')">Add to goal</button>
      </div>
    </div>
  `).join('');
  $('#refresh-workouts').onclick = ()=>renderWorkouts();
}

/* ======= EXERCISES (FE-07) ======= */
function renderExercises(){
  const muscle = $('#filter-ex-muscle').value;
  const d = db.all();
  let list = d.exercises;
  if(muscle) list = list.filter(e=>e.muscle===muscle);
  const el = $('#exercises-list');
  el.innerHTML = list.map(e=> `
    <div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">${e.name}</h3><span class="tag">${e.muscle}</span></div>
      <div class="fine" style="margin-top:6px"><strong>Equipment:</strong> ${e.eq || '—'}</div>
      <div class="fine"><strong>Notes:</strong> ${e.notes || '—'}</div>
    </div>
  `).join('');
  $('#refresh-exercises').onclick = ()=>renderExercises();
}

/* ======= GOAL helpers ======= */
function addWorkoutToGoal(wid){
  const d = getCurrentGoal();
  if(!d.goal) { alert('Set a weekly goal first.'); showPanel('goals'); return; }
  if(!d.goal.workouts.includes(wid)) d.goal.workouts.push(wid);
  const all = d.all.map(x=> x.userId===d.goal.userId && x.year===d.goal.year && x.week===d.goal.week ? d.goal : x);
  Storage.set('goals', all);
  addActivity(`Added workout "${idName('workouts',wid)}" to goal`);
  renderGoalUI();
}

/* ======= CONTRIBUTORS (FE-08/09/10) ======= */
function renderContribSelectors(){
  const wSel = $('#prog-workouts'); wSel.innerHTML='';
  Storage.get('workouts',[]).forEach(w=>{ const o=document.createElement('option'); o.value=w.id; o.textContent=w.name; wSel.appendChild(o); });

  const exSel = $('#wo-exs'); exSel.innerHTML='';
  Storage.get('exercises',[]).forEach(e=>{ const o=document.createElement('option'); o.value=e.id; o.textContent=`${e.name} — ${e.muscle}`; exSel.appendChild(o); });

  // guards
  const user=getUser();
  const isContrib = user.role==='admin' || user.role==='contributor';
  if(!isContrib){
    $('#panel-contributors').innerHTML = `<div class="card"><h3>Contributors Area</h3><p class="fine">You need contributor access. Go to Profile and request it.</p></div>`;
    return;
  }

  $('#add-program').onclick = ()=>{
    const name=$('#prog-name').value.trim();
    const cat=$('#prog-cat').value.trim();
    const desc=$('#prog-desc').value.trim();
    const w = Array.from($('#prog-workouts').selectedOptions).map(o=>o.value);
    if(!name || !cat) return alert('Name and category are required.');
    const list = Storage.get('programs',[]);
    list.push({ id:'p'+Date.now(), name, cat, desc, workouts:w, by:state.user });
    Storage.set('programs', list);
    addActivity(`Contributed program "${name}"`);
    $('#prog-name').value=''; $('#prog-cat').value=''; $('#prog-desc').value='';
    renderProgramsFilters(); renderPrograms(); renderContribSelectors(); renderMine();
  };

  $('#add-workout').onclick = ()=>{
    const name=$('#wo-name').value.trim();
    const type=$('#wo-type').value;
    const exs=Array.from($('#wo-exs').selectedOptions).map(o=>o.value);
    if(!name || !type || exs.length===0) return alert('Fill name, type and at least one exercise.');
    const list = Storage.get('workouts',[]);
    list.push({ id:'w'+Date.now(), name, type, exercises:exs, by:state.user });
    Storage.set('workouts', list);
    addActivity(`Contributed workout "${name}"`);
    $('#wo-name').value=''; renderContribSelectors(); renderWorkouts(); renderMine();
  };

  $('#add-exercise').onclick = ()=>{
    const name=$('#ex-name').value.trim();
    const muscle=$('#ex-muscle').value;
    const eq=$('#ex-eq').value.trim();
    const notes=$('#ex-notes').value.trim();
    if(!name) return alert('Exercise name required.');
    const list = Storage.get('exercises',[]);
    list.push({ id:'e'+Date.now(), name, muscle, eq, notes, by:state.user });
    Storage.set('exercises', list);
    addActivity(`Contributed exercise "${name}"`);
    $('#ex-name').value=''; $('#ex-eq').value=''; $('#ex-notes').value='';
    renderExercises(); renderContribSelectors(); renderMine();
  };
}

function renderMine(){
  const uid = state.user;
  const progs = Storage.get('programs',[]).filter(x=>x.by===uid);
  const wos = Storage.get('workouts',[]).filter(x=>x.by===uid);
  const exs = Storage.get('exercises',[]).filter(x=>x.by===uid);
  $('#mine-programs').innerHTML = progs.length ? progs.map(p=>`<li>${p.name}</li>`).join('') : '—';
  $('#mine-workouts').innerHTML = wos.length ? wos.map(w=>`<li>${w.name}</li>`).join('') : '—';
  $('#mine-exercises').innerHTML = exs.length ? exs.map(e=>`<li>${e.name}</li>`).join('') : '—';
}

/* ======= PROFILE (FE-11) ======= */
function renderProfile(){
  const u=getUser();
  $('#prof-name').value = u.name||'';
  $('#prof-email').value = u.email||'';
  $('#prof-height').value = u.height||'';
  $('#prof-weight').value = u.weight||'';
  $('#prof-level').value = u.level||'Beginner';
  $('#prof-2fa').value = u.twoFA||'off';
  $('#prof-avatar').src = u.picture || 'https://api.dicebear.com/9.x/thumbs/svg?seed=' + encodeURIComponent(u.name);

  $('#prof-avatar-file').onchange = async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const data = await fileToDataURL(file);
    const user = getUser(); user.picture = data; upsertUser(user); renderProfile(); hydrateLeft();
  };

  $('#save-profile').onclick = ()=>{
    const user = getUser();
    const pass = $('#prof-pass').value;
    user.name = $('#prof-name').value.trim();
    user.email = $('#prof-email').value.trim().toLowerCase();
    if(pass) user.pass = pass;
    user.twoFA = $('#prof-2fa').value;
    user.height = parseFloat($('#prof-height').value) || user.height;
    user.weight = parseFloat($('#prof-weight').value) || user.weight;
    user.level = $('#prof-level').value;
    upsertUser(user);
    addActivity('Updated profile');
    alert('Profile saved.');
    renderDashboard(); hydrateLeft();
  };

  $('#req-contrib').onclick = ()=>{
    const user = getUser();
    user.requests = user.requests || [];
    user.requests.push({ t: Date.now(), kind: 'contributor' });
    upsertUser(user);
    $('#access-log').innerHTML = `Contributor request submitted at ${new Date().toLocaleString()}. Waiting for admin.`;
    addActivity('Requested contributor status');
    alert('Request submitted. An admin can approve it.');
  };

  // If current user is admin, show pending requests
  const me = getUser();
  if(me.role==='admin'){
    const users = Storage.get('users',[]);
    const pending = users.filter(u=> (u.requests||[]).length);
    $('#access-log').innerHTML = pending.length ? pending.map(u=>`
      <div class="row" style="justify-content:space-between">
        <div>${u.name} — requested contributor</div>
        <div class="row">
          <button class="btn good" onclick="approveContrib('${u.id}')">Approve</button>
          <button class="btn bad" onclick="rejectContrib('${u.id}')">Reject</button>
        </div>
      </div>
    `).join('') : 'No requests.';
  }
}

function approveContrib(uid){
  const users = Storage.get('users',[]);
  const u = users.find(x=>x.id===uid);
  if(u){ u.role = (u.role==='admin') ? 'admin' : 'contributor'; u.requests=[]; Storage.set('users',users); }
  alert('Approved contributor request.');
  renderProfile();
}
function rejectContrib(uid){
  const users = Storage.get('users',[]);
  const u = users.find(x=>x.id===uid);
  if(u){ u.requests=[]; Storage.set('users',users); }
  alert('Rejected contributor request.');
  renderProfile();
}

/* ======= UTILS ======= */
function fileToDataURL(file){
  return new Promise(res=>{
    const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file);
  });
}

/* ======= INIT ======= */ 
auth.mount();
if(state.user){ boot(); } else { $('#auth').classList.remove('hidden'); }
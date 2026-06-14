
/* =====================================================
   TRAJECTORY · AI Career Planner — Logic
   ===================================================== */

const STORAGE_KEY = 'trajectory:v1';
const THEME_KEY = 'trajectory:theme';

const API_KEY = "AQ.Ab8RN6Kj9tddx2zV_8vjxHcSVSWpTjfFb7oqCk3eNM0kt8J8_w";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;


/* ---------------- MOCK DATA ---------------- */
const DEFAULT_STATE = {
  goals: [
    { id: 'g1', text: 'Complete 3 LeetCode mediums on graphs', meta: '2.5h', done: true },
    { id: 'g2', text: 'Watch "Attention Is All You Need" walkthrough', meta: '1h', done: true },
    { id: 'g3', text: 'Build a mini RAG demo with LangChain', meta: '3h', done: false },
    { id: 'g4', text: 'Write technical blog: "Why Transformers Won"', meta: '2h', done: false },
    { id: 'g5', text: 'Mock interview with AI peer · system design', meta: '1.5h', done: false }
  ],
  roadmap: [
    {
      id: 'p1',
      tag: 'Foundations',
      title: 'Month 1 · Strengthen Core',
      tasks: [
        { id: 't1', text: 'Refresh linear algebra & probability', done: true },
        { id: 't2', text: 'Re-implement gradient descent from scratch', done: true },
        { id: 't3', text: 'Solve 30 NumPy/Pandas drills', done: true },
        { id: 't4', text: 'Ship a Kaggle notebook with EDA', done: false }
      ]
    },
    {
      id: 'p2',
      tag: 'Deep Dive',
      title: 'Month 2 · Modern Architectures',
      tasks: [
        { id: 't5', text: 'Read & annotate Attention paper', done: true },
        { id: 't6', text: 'Fine-tune a HuggingFace transformer', done: false },
        { id: 't7', text: 'Build a recsys end-to-end on MovieLens', done: false },
        { id: 't8', text: 'Containerise & deploy a model on AWS', done: false }
      ]
    },
    {
      id: 'p3',
      tag: 'Showcase',
      title: 'Month 3 · Portfolio & Interviews',
      tasks: [
        { id: 't9', text: 'Polish 3 portfolio case studies', done: false },
        { id: 't10', text: 'Practice 5 ML system design interviews', done: false },
        { id: 't11', text: 'Apply to 15 target companies', done: false },
        { id: 't12', text: 'Negotiate offer with data-backed pitch', done: false }
      ]
    }
  ],
  userSkills: ['Python', 'SQL', 'PyTorch', 'Pandas', 'Statistics', 'Git'],
  selectedRole: 'ml-engineer',
  resumeGenerated: false
};

const ROLES = {
  'ml-engineer': {
    name: 'ML Engineer',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Docker', 'AWS', 'Transformers', 'SQL', 'Statistics', 'Git', 'Kubernetes', 'A/B Testing']
  },
  'data-scientist': {
    name: 'Data Scientist',
    skills: ['Python', 'SQL', 'Pandas', 'Statistics', 'Tableau', 'Experimentation', 'Causal Inference', 'R', 'Git', 'Communication']
  },
  'frontend-eng': {
    name: 'Frontend Engineer',
    skills: ['JavaScript', 'TypeScript', 'React', 'CSS', 'Accessibility', 'Testing', 'Webpack', 'Git', 'Design Systems', 'Performance']
  },
  'product-designer': {
    name: 'Product Designer',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Interaction Design', 'Typography', 'Motion', 'Writing']
  }
};

const SKILL_RECS = {
  'TensorFlow': 'Stanford CS230 (8h) · Build a CNN classifier',
  'MLOps': 'Made With ML · Free 12-module track',
  'Docker': 'Docker Mastery course · 1 weekend',
  'AWS': 'AWS ML Specialty mock exam',
  'Transformers': 'Sebastian Raschka, "Build an LLM from Scratch"',
  'Kubernetes': 'Kubernetes the Hard Way (lab)',
  'A/B Testing': 'Udacity A/B Testing course',
  'Tableau': 'Tableau Public · 3 dashboard challenge',
  'Experimentation': 'Trustworthy Online Experiments (book)',
  'Causal Inference': 'Causal Inference for The Brave and True (free book)',
  'R': 'R for Data Science (free book)',
  'Communication': 'Storytelling with Data · cohort course',
  'TypeScript': 'TypeScript Deep Dive (free)',
  'React': 'Epic React by Kent C. Dodds',
  'CSS': 'CSS for JS Devs · Josh Comeau',
  'Accessibility': 'web.dev Accessibility track',
  'Testing': 'Testing Library + Playwright crash course',
  'Webpack': 'Webpack 5 official guides',
  'Design Systems': 'Design Systems for Devs · refactoring.ui',
  'Performance': 'web.dev Performance · Core Web Vitals',
  'Figma': 'Figma Academy · advanced auto-layout',
  'User Research': '"Interviewing Users" by Steve Portigal',
  'Prototyping': 'Framer & Figma advanced prototyping',
  'Interaction Design': 'IxDF Interaction Design course',
  'Typography': '"Practical Typography" by Matthew Butterick',
  'Motion': 'Motion Design School fundamentals',
  'Writing': '"On Writing Well" + UX writing course'
};

const CAREERS = {
  'ml-engineer':     { name: 'ML Engineer',        emoji: '🧠', tag: 'Applied AI', c1: '#7C5CFF', c2: '#00D4FF', salary: '$165k', demand: 92, difficulty: 80, growth: 88, balance: 65 },
  'data-scientist':  { name: 'Data Scientist',     emoji: '📊', tag: 'Analytics',  c1: '#2DD4BF', c2: '#0EA5E9', salary: '$135k', demand: 78, difficulty: 68, growth: 70, balance: 78 },
  'frontend-eng':    { name: 'Frontend Engineer',  emoji: '🎨', tag: 'Web',        c1: '#FF9466', c2: '#FF5C8A', salary: '$128k', demand: 85, difficulty: 60, growth: 72, balance: 80 },
  'product-designer':{ name: 'Product Designer',   emoji: '🪄', tag: 'Design',     c1: '#F5A524', c2: '#FF5C8A', salary: '$118k', demand: 70, difficulty: 55, growth: 65, balance: 84 },
  'devops-eng':      { name: 'DevOps Engineer',    emoji: '⚙️', tag: 'Infra',      c1: '#0EA5E9', c2: '#7C5CFF', salary: '$148k', demand: 80, difficulty: 75, growth: 76, balance: 60 },
  'product-manager': { name: 'Product Manager',    emoji: '🎯', tag: 'Strategy',   c1: '#FF5C8A', c2: '#7C5CFF', salary: '$155k', demand: 82, difficulty: 70, growth: 78, balance: 72 }
};

const TIMELINE = [
  { month: 'Week 1–2', title: 'Set the foundation', desc: 'Math refresh + Python sharpness checks.', done: true },
  { month: 'Week 3–4', title: 'Ship your first notebook', desc: 'A polished EDA on a public dataset.', done: true },
  { month: 'Week 5–6', title: 'Transformers, deeply', desc: 'Implement, fine-tune, and dissect attention.', done: true },
  { month: 'Week 7–8', title: 'Production reality', desc: 'Containerise, deploy, monitor.', done: false },
  { month: 'Week 9–10', title: 'Build a flagship project', desc: 'Pick one problem and own it end-to-end.', done: false },
  { month: 'Week 11–12', title: 'Interview ready', desc: 'Mock loops + offer negotiation playbook.', done: false }
];

/* ---------------- STATE ---------------- */
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch { return structuredClone(DEFAULT_STATE); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ---------------- THEME ---------------- */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  toast(`Switched to ${next} mode`);
}

/* ---------------- NAVIGATION ---------------- */
function initNav() {
  document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => switchSection(b.dataset.goto)));

  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) mobileBtn.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
}
function switchSection(name) {
  document.querySelectorAll('.nav-item[data-section]').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
  const titles = { dashboard: 'Dashboard', roadmap: 'Roadmap', skillgap: 'Skill Gap Analyzer', compare: 'Career Comparison', resume: 'Resume Generator' };
  document.getElementById('crumbCurrent').textContent = titles[name] || 'Dashboard';
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------- DASHBOARD ---------------- */
function renderGoals() {
  const list = document.getElementById('goalsList');
  list.innerHTML = '';
  state.goals.forEach(g => {
    const li = document.createElement('li');
    li.className = 'goal' + (g.done ? ' done' : '');
    li.dataset.testid = 'goal-' + g.id;
    li.innerHTML = `
      <div class="goal-check"><i class="fa-solid fa-check"></i></div>
      <div class="goal-text">${g.text}</div>
      <div class="goal-meta"><i class="fa-regular fa-clock"></i> ${g.meta}</div>
    `;
    li.addEventListener('click', () => {
      g.done = !g.done;
      li.classList.toggle('done', g.done);
      saveState();
      updateGoalSummary();
      toast(g.done ? 'Nice — goal completed.' : 'Goal reopened.');
    });
    list.appendChild(li);
  });
  updateGoalSummary();
}
function updateGoalSummary() {
  const done = state.goals.filter(g => g.done).length;
  document.getElementById('goalCount').textContent = `${done}/${state.goals.length}`;
}

function animateCounters() {
  document.querySelectorAll('.count').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur;
      if (cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function animateRing() {
  const fg = document.getElementById('ringFg');
  const num = document.getElementById('ringNum');
  if (!fg) return;
  const pct = 68;
  const c = 2 * Math.PI * 86;
  fg.setAttribute('stroke-dasharray', c);
  fg.setAttribute('stroke-dashoffset', c);
  requestAnimationFrame(() => {
    fg.setAttribute('stroke-dashoffset', c * (1 - pct / 100));
  });
  let cur = 0;
  const tick = () => {
    cur = Math.min(pct, cur + 1);
    num.textContent = cur + '%';
    if (cur < pct) setTimeout(tick, 20);
  };
  setTimeout(tick, 200);
}

function drawSparks() {
  document.querySelectorAll('.spark').forEach(el => {
    const data = el.dataset.spark.split(',').map(Number);
    const w = 220, h = 38;
    const max = Math.max(...data), min = Math.min(...data);
    const step = w / (data.length - 1);
    const points = data.map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * (h - 6) - 3}`).join(' ');
    el.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%;">
        <defs><linearGradient id="sp${Math.random().toString(36).slice(2,8)}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7C5CFF" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#7C5CFF" stop-opacity="0"/>
        </linearGradient></defs>
        <polyline points="${points}" fill="none" stroke="#7C5CFF" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
  });
}

/* ---------------- ROADMAP ---------------- */
function renderRoadmap() {
  const grid = document.getElementById('roadmapGrid');
  grid.innerHTML = '';
  state.roadmap.forEach((phase, idx) => {
    const total = phase.tasks.length;
    const done = phase.tasks.filter(t => t.done).length;
    const pct = Math.round((done / total) * 100);
    const card = document.createElement('div');
    card.className = 'phase';
    card.dataset.testid = 'phase-' + phase.id;
    card.innerHTML = `
      <span class="phase-num">${idx + 1}</span>
      <span class="phase-tag">${phase.tag}</span>
      <h3 class="phase-title">${phase.title}</h3>
      <ul class="tasks">
        ${phase.tasks.map(t => `
          <li class="task ${t.done ? 'done' : ''}" data-task-id="${t.id}" data-testid="task-${t.id}">
            <div class="goal-check"><i class="fa-solid fa-check"></i></div>
            <div class="task-text">${t.text}</div>
          </li>`).join('')}
      </ul>
      <div class="phase-progress">
        <div class="phase-progress-label"><span>${done}/${total} done</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="--p:${pct}%"></div></div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.task').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.taskId;
      state.roadmap.forEach(p => p.tasks.forEach(t => { if (t.id === id) t.done = !t.done; }));
      saveState();
      renderRoadmap();
      updateRoadmapMeta();
      toast('Roadmap updated.');
    });
  });
  updateRoadmapMeta();
}
function updateRoadmapMeta() {
  let total = 0, done = 0;
  state.roadmap.forEach(p => p.tasks.forEach(t => { total++; if (t.done) done++; }));
  const pct = Math.round((done / total) * 100);
  document.getElementById('roadmapPercent').textContent = pct + '%';
  document.getElementById('roadmapDone').textContent = done;
  const bar = document.getElementById('roadmapProgress');
  if (bar) bar.style.setProperty('--p', pct + '%');
}

function renderTimeline() {
  const list = document.getElementById('timelineList');
  list.innerHTML = '';
  TIMELINE.forEach((step, i) => {
    const li = document.createElement('li');
    li.className = step.done ? 'done' : '';
    li.dataset.testid = 'timeline-' + i;
    li.innerHTML = `
      <div class="t-head">
        <span class="t-month">${step.month}</span>
        <span class="t-status">${step.done ? 'Completed' : 'Upcoming'}</span>
      </div>
      <h3 class="t-title">${step.title}</h3>
      <p class="t-desc">${step.desc}</p>`;
    list.appendChild(li);
  });
}

/* ---------------- SKILL GAP ---------------- */
function renderRolePicker() {
  const picker = document.getElementById('rolePicker');
  picker.innerHTML = '';
  Object.entries(ROLES).forEach(([key, r]) => {
    const b = document.createElement('button');
    b.className = 'role-pick' + (state.selectedRole === key ? ' active' : '');
    b.textContent = r.name;
    b.dataset.testid = 'role-pick-' + key;
    b.addEventListener('click', () => {
      state.selectedRole = key;
      saveState();
      renderRolePicker();
      renderSkillGap();
    });
    picker.appendChild(b);
  });
}

function renderSkillGap() {
  const userWrap = document.getElementById('userSkills');
  const roleWrap = document.getElementById('roleSkills');
  const out = document.getElementById('gapOutput');
  const role = ROLES[state.selectedRole];

  userWrap.innerHTML = '';
  state.userSkills.forEach(s => {
    const chip = document.createElement('span');
    const isMatch = role.skills.some(rs => rs.toLowerCase() === s.toLowerCase());
    chip.className = 'chip' + (isMatch ? ' match' : '');
    chip.dataset.testid = 'user-chip-' + s;
    chip.innerHTML = `${s}<i class="fa-solid fa-xmark x"></i>`;
    chip.addEventListener('click', () => {
      state.userSkills = state.userSkills.filter(x => x !== s);
      saveState();
      renderSkillGap();
    });
    userWrap.appendChild(chip);
  });

  roleWrap.innerHTML = '';
  role.skills.forEach(s => {
    const chip = document.createElement('span');
    chip.className = 'chip role';
    chip.textContent = s;
    chip.dataset.testid = 'role-chip-' + s;
    roleWrap.appendChild(chip);
  });

  const userLow = state.userSkills.map(s => s.toLowerCase());
  const missing = role.skills.filter(s => !userLow.includes(s.toLowerCase()));
  const matched = role.skills.filter(s => userLow.includes(s.toLowerCase()));

  document.getElementById('gapMatchCount').textContent = matched.length;
  document.getElementById('gapMissCount').textContent = missing.length;

  out.innerHTML = '';
  if (missing.length === 0) {
    out.innerHTML = `<div class="gap-empty"><i class="fa-solid fa-trophy" style="color:var(--teal);font-size:24px;"></i><p style="margin-top:12px;">You've covered every skill on this role. Time to apply.</p></div>`;
  } else {
    missing.forEach((m, i) => {
      const sev = i < 3 ? 'high' : 'med';
      const card = document.createElement('div');
      card.className = 'gap-card ' + sev;
      card.dataset.testid = 'gap-card-' + m;
      card.innerHTML = `
        <span class="gap-pri">${sev === 'high' ? 'High Priority' : 'Recommended'}</span>
        <span class="gap-name">${m}</span>
        <span class="gap-rec">${SKILL_RECS[m] || 'Add to your next sprint.'}</span>`;
      out.appendChild(card);
    });
  }
  matched.slice(0, 3).forEach(m => {
    const card = document.createElement('div');
    card.className = 'gap-card matched';
    card.innerHTML = `<span class="gap-pri">Matched</span><span class="gap-name">${m}</span><span class="gap-rec">You're already strong here.</span>`;
    out.appendChild(card);
  });
}

function initSkillGapInputs() {
  const input = document.getElementById('userSkillInput');
  const add = document.getElementById('addUserSkill');
  const submit = () => {
    const v = input.value.trim();
    if (!v) return;
    if (!state.userSkills.find(s => s.toLowerCase() === v.toLowerCase())) {
      state.userSkills.push(v);
      saveState();
      renderSkillGap();
      toast(`Added "${v}"`);
    }
    input.value = '';
  };
  add.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

/* ---------------- COMPARE ---------------- */
function initCompare() {
  const a = document.getElementById('careerA');
  const b = document.getElementById('careerB');
  Object.entries(CAREERS).forEach(([k, v]) => {
    a.insertAdjacentHTML('beforeend', `<option value="${k}">${v.name}</option>`);
    b.insertAdjacentHTML('beforeend', `<option value="${k}">${v.name}</option>`);
  });
  a.value = 'ml-engineer';
  b.value = 'product-designer';
  a.addEventListener('change', renderCompare);
  b.addEventListener('change', renderCompare);
  renderCompare();
}
function renderCompare() {
  const grid = document.getElementById('compareGrid');
  const keys = [document.getElementById('careerA').value, document.getElementById('careerB').value];
  grid.innerHTML = '';
  keys.forEach(k => {
    const c = CAREERS[k];
    const card = document.createElement('article');
    card.className = 'compare-card';
    card.style.setProperty('--card-grad', `linear-gradient(135deg, ${c.c1}, ${c.c2})`);
    card.style.setProperty('--card-c1', c.c1);
    card.dataset.testid = 'compare-card-' + k;
    card.innerHTML = `
      <div class="cc-head">
        <div class="cc-emoji">${c.emoji}</div>
        <div>
          <div class="cc-tag">${c.tag}</div>
          <div class="cc-name">${c.name}</div>
        </div>
      </div>
      <div class="cc-metrics">
        ${metricRow('Market demand', c.demand)}
        ${metricRow('Learning difficulty', c.difficulty)}
        ${metricRow('5-yr growth outlook', c.growth)}
        ${metricRow('Work-life balance', c.balance)}
      </div>
      <div class="cc-foot">
        <div>
          <div class="cc-salary-label">Avg comp · US</div>
          <div class="cc-salary">${c.salary}</div>
        </div>
        <button class="btn btn-ghost btn-sm" data-testid="compare-explore-${k}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Explore</button>
      </div>`;
    grid.appendChild(card);
  });
  requestAnimationFrame(() => {
    grid.querySelectorAll('.cc-bar > div').forEach(b => b.style.width = b.dataset.w + '%');
  });
}
function metricRow(label, val) {
  return `
    <div class="cc-metric">
      <div class="cc-metric-top"><span>${label}</span><span class="cc-metric-val">${val}/100</span></div>
      <div class="cc-bar"><div data-w="${val}" style="width:0%"></div></div>
    </div>`;
}

/* ---------------- RESUME ---------------- */
function initResume() {
  document.getElementById('generateResume').addEventListener('click', generateResume);
}
function generateResume() {
  const name = val('rName');
  const role = val('rRole');
  const email = val('rEmail');
  const loc = val('rLocation');
  const summary = val('rSummary');
  const skills = val('rSkills').split(',').map(s => s.trim()).filter(Boolean);
  const exp = val('rExp');

  const expBlocks = exp.split(/\n\s*\n/).map(block => {
    const lines = block.split('\n').filter(Boolean);
    return `<div class="r-exp-block">${lines.map((l, i) => `<p>${i === 0 ? l : '· ' + l}</p>`).join('')}</div>`;
  }).join('');

  const doc = document.getElementById('resumeDoc');
  doc.innerHTML = `
    <h1>${name}</h1>
    <div class="r-role">${role}</div>
    <div class="r-meta">
      <span><i class="fa-regular fa-envelope"></i> ${email}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${loc}</span>
      <span><i class="fa-solid fa-link"></i> trajectory.app/${name.toLowerCase().split(' ')[0]}</span>
    </div>
    <h2>Summary</h2>
    <p>${summary}</p>
    <h2>Core Skills</h2>
    <div class="r-skills">${skills.map(s => `<span class="r-skill">${s}</span>`).join('')}</div>
    <h2>Experience</h2>
    <div class="r-exp">${expBlocks}</div>
    <h2>Education</h2>
    <p><strong>BSc Computer Science</strong> · University of Lisbon · 2016–2020</p>
  `;
  document.getElementById('resumeEmpty').style.display = 'none';
  doc.style.display = 'block';
  toast('Resume generated — looking sharp.');
}
function val(id) { return document.getElementById(id).value; }

/* ---------------- TOAST ---------------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------------- BOOT ---------------- */
function boot() {
  initTheme();
  initNav();
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  renderGoals();
  animateCounters();
  animateRing();
  drawSparks();

  renderRoadmap();
  renderTimeline();

  renderRolePicker();
  renderSkillGap();
  initSkillGapInputs();

  initCompare();
  initResume();
}

function getSelectedCareer() {
  const raw = localStorage.getItem("selectedCareer");
  if (!raw) return null;
  return JSON.parse(raw);
}

async function generateFullAIData(careerData) {

  const cacheKey = "ai_full_" + careerData.career;

  // ✅ CACHE (no repeat calls)
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const prompt = `
You are an expert AI career mentor.

Career: ${careerData.career}
Description: ${careerData.description}
Skills: ${careerData.skills.join(",")}

Return ONLY JSON:

{
 "skills": [],
 "goals": [],
 "roadmap": [
   {
     "title": "",
     "tasks": [""]
   }
 ],
 "timeline": [
   {
     "month": "",
     "title": "",
     "desc": ""
   }
 ]
}
`;

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  const json = extractJSON(text);

  localStorage.setItem(cacheKey, JSON.stringify(json));

  return json;
}

function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match[0]);
  } catch {
    console.error("Invalid AI JSON");
    return null;
  }
}
document.addEventListener('DOMContentLoaded', boot);

"use strict";
const toggleBtn = document.getElementById("themeToggle");
const root = document.documentElement;
const STORAGE_KEY = "theme";

const select = document.getElementById("stdSelect");
const display = document.getElementById("stdDisplay");
const hiddenInput = document.getElementById("f-std");
const options = select.querySelectorAll(".select-dropdown div");

display.addEventListener("click", () => {
  select.classList.toggle("active");
});

options.forEach(opt => {
  opt.addEventListener("click", () => {
    display.textContent = opt.textContent;
    hiddenInput.value = opt.dataset.value;

    options.forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");

    select.classList.remove("active");
    select.classList.add("filled");
  });
});



document.addEventListener("click", (e) => {
  if (!select.contains(e.target)) {
    select.classList.remove("active");
  }
});

const service = document.getElementById("serviceSelect");
const serviceDisplay = document.getElementById("serviceDisplay");
const serviceInput = document.getElementById("aiProvider");
const serviceOptions = service.querySelectorAll(".select-dropdown div");

serviceDisplay.addEventListener("click", () => {
  service.classList.toggle("active");
});

serviceOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    serviceDisplay.textContent = opt.textContent;
    serviceInput.value = opt.dataset.value;

    serviceOptions.forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");

    service.classList.remove("active");
    service.classList.add("filled");
  });
});

document.addEventListener("click", (e) => {
  if (!service.contains(e.target)) {
    service.classList.remove("active");
  }
});

/* Load saved theme */
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  root.setAttribute("data-theme", saved);
}

/* Toggle theme */
toggleBtn.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";

  root.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEY, next);
});

/* ================= CONFIG ================= */
const API_KEY = "AQ.Ab8RN6Kj9tddx2zV_8vjxHcSVSWpTjfFb7oqCk3eNM0kt8J8_w";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

/* ================= ELEMENTS ================= */
const form = document.getElementById("plannerForm");
const skeleton = document.getElementById("skeletonSection");
const pathsGrid = document.getElementById("pathsGrid");
const timeline = document.querySelector(".timeline");

let selectedPaths = [];

/* ================= UTIL ================= */
function cleanJSON(text) {
  try {
    // remove markdown
    text = text.replace(/```json|```/g, "").trim();

    // 🔥 TRY DIRECT PARSE FIRST (MOST IMPORTANT FIX)
    try {
      return JSON.parse(text);
    } catch (e) {
      // fallback below
    }

    // 🔥 fallback: extract full JSON object OR array safely
    const objMatch = text.match(/\{[\s\S]*\}/);
    const arrMatch = text.match(/\[[\s\S]*\]/);

    if (objMatch) return JSON.parse(objMatch[0]);
    if (arrMatch) return JSON.parse(arrMatch[0]);

    throw new Error("No valid JSON found");

  } catch (err) {
    console.error("RAW AI RESPONSE:", text);
    throw new Error("Invalid JSON from AI");
  }
}
async function callAI(prompt) {
  const provider = document.getElementById("aiProvider")?.value || "gemini";

  // 🔹 GEMINI FLOW (unchanged)
  if (provider === "gemini") {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    if (!data.candidates) throw new Error("API failed");

    return data.candidates[0].content.parts[0].text;
  }

 if (provider === "foundry") {
  try {
    const res = await fetch("api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const text = await res.text(); // 🔥 safer than json()

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from Foundry: " + text);
    }

    // 🔥 Detect backend errors
    if (!data.response || data.response.includes("Error")) {
      throw new Error(data.response || "Foundry failed");
    }

    return data.response;

  } catch (err) {
    console.warn("⚠️ Foundry failed, switching to Gemini:", err.message);

    // 🔥 FALLBACK TO GEMINI
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    if (!data.candidates) throw new Error("Gemini also failed");

    return data.candidates[0].content.parts[0].text;
  }
}
}


function renderCareers(careers) {
  pathsGrid.innerHTML = "";

  selectedPaths = []; // reset

  careers.forEach((c, i) => {
    const card = document.createElement("article");
    card.className = "card path-card";

    const match = c.match || (95 - i * 3); // fallback

    card.innerHTML = `
      ${i === 0 ? `<span class="badge-featured">Recommended</span>` : ""}

      <header class="path-head">
        <span class="match-pill">
          <span class="match-dot"></span>${match}% match
        </span>
      </header>

      <h3 class="path-title">${c.career}</h3>
      <p class="path-desc">${c.description}</p>

      <ul class="path-tags">
        ${c.skills.map(s => `<li>${s}</li>`).join("")}
      </ul>

      <div class="path-stats">
        <div><span class="ps-num">${c.salary}</span><span class="ps-lbl">salary</span></div>
        <div><span class="ps-num">${c.growth}</span><span class="ps-lbl">growth</span></div>
        <div><span class="ps-num">${c.demand || "High"}</span><span class="ps-lbl">demand</span></div>
      </div>

      <footer class="path-foot">
        <button class="btn btn-ghost btn-sm save-btn">Save</button>
        <button class="btn btn-primary btn-sm explore-btn">Explore</button>
      </footer>
    `;

    // Manual actions still work
    card.querySelector(".explore-btn").onclick = () => {
  generateRoadmap(c.career);

  // 👇 Scroll ONLY when user clicks
  document.getElementById("roadmap").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  localStorage.setItem("selectedCareer", JSON.stringify({
    career: c.career,
    description: c.description,
    skills: c.skills,
    salary: c.salary,
    growth: c.growth,
    demand: c.demand
  }));

  // OPTIONAL: small cookie flag (not required)
  document.cookie = "careerSelected=true; path=/";

  // 🚀 REDIRECT TO DASHBOARD
  
};
    card.querySelector(".save-btn").onclick = () => toggleSelect(c.career, card);

    pathsGrid.appendChild(card);
  });

  // 🚀 AUTO LOGIC

  // 1️⃣ Auto roadmap for highest match
  // ✅ SAFE AUTO ROADMAP
if (careers && careers.length > 0 && careers[0].career) {
  setTimeout(() => {
    generateRoadmap(careers[0].career);
  }, 300); // small delay ensures DOM is ready
}
  // 2️⃣ Auto compare first two
  selectedPaths = [careers[0].career, careers[1].career];
  updateCompareTitles();
  generateCompare();
}
/* ================= SELECT ================= */
function toggleSelect(career, card) {
  if (selectedPaths.includes(career)) {
    selectedPaths = selectedPaths.filter(x => x !== career);
    card.style.borderColor = "";
  } else {
    if (selectedPaths.length >= 2) {
      alert("Select only 2 paths");
      return;
    }
    selectedPaths.push(career);
    card.style.borderColor = "var(--primary)";
  }

  if (selectedPaths.length === 2) {
    generateCompare();
   

  // 👇 Scroll ONLY when user clicks
    document.getElementById("compare").scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
  }
}

function updateCompareTitles() {
  document.getElementById("compare-title-1").innerText = selectedPaths[0];
  document.getElementById("compare-title-2").innerText = selectedPaths[1];
}

/* ================= COMPARE ================= */
async function generateCompare() {
  const prompt = `
Return JSON:
{
 "career1":{"name":"","pros":[""],"cons":[""]},
 "career2":{"name":"","pros":[""],"cons":[""]}
}

Compare:
${selectedPaths[0]} vs ${selectedPaths[1]}
`;

  try {
    const text = await callAI(prompt);
    const data = cleanJSON(text);

    renderCompare(data);


  } catch (e) {
    console.error(e);
  }
}

/* ================= RENDER COMPARE ================= */
function renderCompare(data) {
  const cards = document.querySelectorAll(".compare-card");

  const bad = cards[0].querySelector(".compare-list");
  const good = cards[1].querySelector(".compare-list");

  bad.innerHTML = data.career1.cons.map(c => `<li>❌ ${c}</li>`).join("");
  good.innerHTML = data.career2.pros.map(p => `<li>✅ ${p}</li>`).join("");
}

/* ================= ROADMAP ================= */
async function generateRoadmap(career) {
  const prompt = `
Return JSON:
{
 "phase1":{"time":"","title":"","tasks":[""]},
 "phase2":{"time":"","title":"","tasks":[""]},
 "phase3":{"time":"","title":"","tasks":[""]},
 "phase4":{"time":"","title":"","tasks":[""]},
 "phase5":{"time":"","title":"","tasks":[""]}
}

Career: ${career}
`;

  try {
    const text = await callAI(prompt);
    const data = cleanJSON(text);

    renderRoadmap(data);


  } catch (e) {
    console.error(e);
  }
}

/* ================= RENDER ROADMAP ================= */
function renderRoadmap(data) {
  const timeline = document.querySelector(".timeline");

  // 🔥 Always clear old/static content first
  timeline.innerHTML = "";

  // ❌ Safety: invalid or empty data
  if (!data || typeof data !== "object") {
    timeline.innerHTML = `
      <div class="card t-card">
        <h3>⚠️ Invalid roadmap data</h3>
        <p>Try again or select another career.</p>
      </div>
    `;
    return;
  }

  const phases = Object.values(data);

  // ❌ Safety: empty phases
  if (!phases.length) {
    timeline.innerHTML = `
      <div class="card t-card">
        <h3>⚠️ No roadmap generated</h3>
        <p>Please try again.</p>
      </div>
    `;
    return;
  }

  // ✅ Render each phase
  phases.forEach((p, index) => {
    const li = document.createElement("li");
    li.className = "t-step";

    li.innerHTML = `
      <span class="t-marker"></span>

      <div class="card t-card">
        <span class="t-when">${p.time || "Phase " + (index + 1)}</span>
        <h3>${p.title || "Untitled Phase"}</h3>

        <ul class="t-list">
          ${
            Array.isArray(p.tasks)
              ? p.tasks.map(t => `<li>${t}</li>`).join("")
              : `<li>No tasks available</li>`
          }
        </ul>
      </div>
    `;

    timeline.appendChild(li);
  });
}

document.querySelector('[data-testid="roadmap-share"]').addEventListener("click", async () => {
  const shareData = {
    title: "My AI Career Roadmap",
    text: "Check out my personalized career roadmap 🚀",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  } catch (err) {
    console.error("Share failed:", err);
  }
});



document.querySelector('[data-testid="roadmap-export"]').addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const steps = document.querySelectorAll(".t-step");
  const careerTitle = document.querySelector(".path-title")?.innerText || "Career Path";

  let y = 20;

  // ================= COVER PAGE =================
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");

  // Top gradient style bar
  doc.setFillColor(124, 92, 255);
  doc.rect(0, 0, 210, 10, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(20, 20, 40);
  doc.text("Career Roadmap", 20, 90);

  // Career Name
  doc.setFontSize(22);
  doc.setTextColor(124, 92, 255);
  doc.text(careerTitle, 20, 110);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(120);
  doc.text("A structured plan to achieve your goals", 20, 130);

  // Divider
  doc.setDrawColor(200);
  doc.line(20, 140, 190, 140);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(160);
  doc.text(new Date().toLocaleDateString(), 20, 155);

  // Next page
  doc.addPage();

  // ================= MAIN TITLE =================
  y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 60);
  doc.text("Your Career Growth Plan", 20, y);

  y += 10;

  doc.setDrawColor(124, 92, 255);
  doc.setLineWidth(1.2);
  doc.line(20, y, 190, y);

  y += 15;

  // ================= TIMELINE =================
  steps.forEach((step, index) => {
    const title = step.querySelector("h3")?.innerText || "";
    const time = step.querySelector(".t-when")?.innerText || "";
    const tasks = step.querySelectorAll("li");

    // Page break
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Card background
    doc.setFillColor(248, 248, 255);
    doc.roundedRect(15, y - 6, 180, 12, 4, 4, "F");

    // Phase title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(60, 50, 140);
    doc.text(`Phase ${index + 1}: ${title}`, 20, y);

    y += 7;

    // Time
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 100, 255);
    doc.text(time, 20, y);

    y += 6;

    // Tasks
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    tasks.forEach(task => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const lines = doc.splitTextToSize("• " + task.innerText, 165);
      doc.text(lines, 22, y);
      y += lines.length * 6;
    });

    y += 10;
  });

  // ================= FOOTER =================
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(10);
    doc.setTextColor(150);

    doc.text(`Page ${i}`, 105, 290, { align: "center" });
  }

  // ================= SAVE =================
  doc.save("Pathwise-Roadmap.pdf");
});
/* ================= FORM ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  skeleton.hidden = false;
  pathsGrid.innerHTML = "";

  const userData = {
  std: document.getElementById("f-std").value,
  skills: document.getElementById("f-skills").value,
  interests: document.getElementById("f-interests").value,
  strengths: document.getElementById("f-strengths").value,
  weaknesses: document.getElementById("f-weaknesses").value,
};

const prompt = `
You are an AI career advisor for students.

Return ONLY JSON array (3 items).

Consider:
- student class (std)
- strengths
- weaknesses
- skills
- interests

[
 {
  "career": "",
  "description": "",
  "skills": [""],
  "salary": "",
  "growth": "",
  "demand": "",
  "match": 0
 }
]

User:
${JSON.stringify(userData)}
`;

  try {
    // Show loader
    skeleton.hidden = false;
    pathsGrid.innerHTML = "";

    const text = await callAI(prompt);
    console.log("RAW AI:", text);
    const careers = cleanJSON(text);

    skeleton.hidden = true;

    renderCareers(careers);
    document.getElementById("emptyState").style.display = "none";

    document.getElementById("paths").hidden = false;
    document.getElementById("roadmap").hidden = false;
    document.getElementById("compare").hidden = false;
    document.getElementById("paths").scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    skeleton.hidden = true;
    console.error(err);
    alert("Failed to generate careers");
  }
});

/* ================= RENDER PATHS ================= */


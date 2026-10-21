const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Fields for each repeatable section
const SECTIONS = {
  edu:  {list:"eduList",  fields:[["degree","Degree / Course"],["school","College / University"],["year","Year"],["score","Percentage / CGPA"]]},
  exp:  {list:"expList",  fields:[["role","Role"],["company","Company"],["period","Duration"],["details","What you did","area"]]},
  proj: {list:"projList", fields:[["name","Project name"],["tech","Technologies"],["details","Description","area"]]}
};

const emptyState = () => ({name:"",title:"",email:"",phone:"",address:"",link:"",summary:"",skills:"",
  edu:[],exp:[],proj:[],template:"t-classic",accent:"#0f766e"});

const sampleState = () => ({
  name:"Riya Sharma", title:"Web Developer (Fresher)", email:"riya.sharma@example.com", phone:"+91 98765 43210",
  address:"Pune, Maharashtra", link:"github.com/riyasharma",
  summary:"BCA graduate with hands-on experience in HTML, CSS and JavaScript. Enjoys building clean, responsive web applications and learning new tools.",
  skills:"HTML, CSS, JavaScript, Git, Responsive Design, MySQL",
  edu:[{degree:"BCA (Bachelor of Computer Applications)",school:"ABC College, Pune",year:"2023 - 2026",score:"8.2 CGPA"},
       {degree:"Higher Secondary (12th)",school:"XYZ Junior College",year:"2023",score:"82%"}],
  exp:[{role:"Web Development Intern",company:"TechNova Solutions",period:"Jun 2025 - Aug 2025",details:"Built responsive landing pages and fixed UI bugs in a company website."}],
  proj:[{name:"Movie Search App",tech:"HTML, CSS, JavaScript, OMDb API",details:"Search movies, view details and save favourites using localStorage."}],
  template:"t-classic", accent:"#0f766e"
});

let state = (() => { try { return JSON.parse(localStorage.getItem("resume")) || sampleState(); } catch { return sampleState(); } })();
const save = () => { try { localStorage.setItem("resume", JSON.stringify(state)); } catch {} };

// ---------- Form ----------
function buildLists(){
  for (const [sec, cfg] of Object.entries(SECTIONS)){
    $(cfg.list).innerHTML = state[sec].map((item, i) => `
      <div class="item">
        ${cfg.fields.map(([k, label, type]) => `
          <label>${label}</label>
          ${type === "area"
            ? `<textarea data-sec="${sec}" data-i="${i}" data-f="${k}">${esc(item[k])}</textarea>`
            : `<input type="text" data-sec="${sec}" data-i="${i}" data-f="${k}" value="${esc(item[k])}">`}`).join("")}
        <button class="rm" data-rm="${sec}" data-i="${i}">Remove</button>
      </div>`).join("");
  }
}

function fillForm(){
  document.querySelectorAll("[data-key]").forEach(el => el.value = state[el.dataset.key] || "");
  $("template").value = state.template;
  $("accent").value = state.accent;
  buildLists();
}

document.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.key) state[el.dataset.key] = el.value;
  else if (el.dataset.sec) state[el.dataset.sec][+el.dataset.i][el.dataset.f] = el.value;
  else return;
  save(); renderPreview();
});

document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.add){
    const blank = {}; SECTIONS[t.dataset.add].fields.forEach(f => blank[f[0]] = "");
    state[t.dataset.add].push(blank); buildLists(); save(); renderPreview();
  }
  if (t.dataset.rm){
    state[t.dataset.rm].splice(+t.dataset.i, 1); buildLists(); save(); renderPreview();
  }
});

$("template").onchange = e => { state.template = e.target.value; save(); renderPreview(); };
$("accent").oninput = e => { state.accent = e.target.value; save(); renderPreview(); };

// ---------- Preview ----------
function renderPreview(){
  const s = state, r = $("resume");
  r.className = s.template;
  r.style.setProperty("--accent", s.accent);
  const contact = [s.email, s.phone, s.address, s.link].filter(Boolean).map(c => `<span>${esc(c)}</span>`).join("");
  const skills = s.skills.split(",").map(x => x.trim()).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join("");

  const entries = (list, fn) => list.map(fn).join("");
  r.innerHTML = `
    <header>
      <h1>${s.name ? esc(s.name) : '<span class="empty">Your name</span>'}</h1>
      ${s.title ? `<div class="role">${esc(s.title)}</div>` : ""}
      <div class="contact">${contact}</div>
    </header>
    ${s.summary ? `<h3>Summary</h3><p>${esc(s.summary)}</p>` : ""}
    ${s.edu.length ? `<h3>Education</h3>` + entries(s.edu, x => `
      <div class="entry"><div class="entry-head"><span>${esc(x.degree)}</span><span>${esc(x.year)}</span></div>
      <div class="sub">${esc(x.school)}${x.score ? " | " + esc(x.score) : ""}</div></div>`) : ""}
    ${s.exp.length ? `<h3>Experience</h3>` + entries(s.exp, x => `
      <div class="entry"><div class="entry-head"><span>${esc(x.role)}</span><span>${esc(x.period)}</span></div>
      <div class="sub">${esc(x.company)}</div><div>${esc(x.details).replace(/\n/g,"<br>")}</div></div>`) : ""}
    ${s.proj.length ? `<h3>Projects</h3>` + entries(s.proj, x => `
      <div class="entry"><div class="entry-head"><span>${esc(x.name)}</span></div>
      ${x.tech ? `<div class="sub">${esc(x.tech)}</div>` : ""}<div>${esc(x.details).replace(/\n/g,"<br>")}</div></div>`) : ""}
    ${skills ? `<h3>Skills</h3><div class="skills">${skills}</div>` : ""}`;
}

// ---------- Buttons ----------
$("sample").onclick = () => { state = sampleState(); save(); fillForm(); renderPreview(); };

$("clear").onclick = () => {
  if (confirm("Clear all fields? This cannot be undone.")){
    state = emptyState(); save(); fillForm(); renderPreview();
  }
};

$("download").onclick = () => {
  const err = $("err");
  if (!state.name.trim()){ err.textContent = "Enter your full name before downloading."; $("name").focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)){ err.textContent = "Enter a valid email address before downloading."; $("email").focus(); return; }
  err.textContent = "";
  window.print(); // In the print window, choose "Save as PDF"
};

// Start
fillForm();
renderPreview();
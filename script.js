const ROADMAPS = [
  {
    id: "frontend",
    title: "Front-end (Web)",
    desc: "Base sólida para construir interfaces modernas e responsivas.",
    items: [
      { id:"fe1", title:"HTML semântico", meta:"tags, acessibilidade, estrutura" },
      { id:"fe2", title:"CSS (layout)", meta:"flexbox, grid, responsividade" },
      { id:"fe3", title:"JavaScript (base)", meta:"DOM, eventos, funções, arrays" },
      { id:"fe4", title:"Git & GitHub", meta:"commits, branches, Pages" },
      { id:"fe5", title:"Consumo de APIs", meta:"fetch, JSON, async/await" },
      { id:"fe6", title:"Projeto prático", meta:"clonar UI + lógica + deploy" }
    ]
  },
  {
    id: "backend",
    title: "Back-end (Node.js)",
    desc: "Aprenda a criar APIs e conectar com banco de dados.",
    items: [
      { id:"be1", title:"Node.js (fundamentos)", meta:"npm, módulos, scripts" },
      { id:"be2", title:"Express", meta:"rotas, middlewares, controllers" },
      { id:"be3", title:"API REST", meta:"CRUD, status codes, padrões" },
      { id:"be4", title:"Banco de dados", meta:"MongoDB ou SQL (conceitos)" },
      { id:"be5", title:"Autenticação", meta:"JWT, login, permissões" },
      { id:"be6", title:"Deploy", meta:"render, railway, vercel (API)" }
    ]
  },
  {
    id: "programacao",
    title: "Programação (Base Geral)",
    desc: "Fundamentos que servem para qualquer linguagem/área.",
    items: [
      { id:"pg1", title:"Lógica de programação", meta:"condições, loops, funções" },
      { id:"pg2", title:"Estruturas de dados", meta:"arrays, objetos, mapas" },
      { id:"pg3", title:"Algoritmos", meta:"busca, ordenação (ideia)" },
      { id:"pg4", title:"Boas práticas", meta:"nomes, organização, limpeza" },
      { id:"pg5", title:"Debug", meta:"console, breakpoints, leitura de erros" },
      { id:"pg6", title:"Projeto", meta:"resolver um problema real" }
    ]
  },
  {
    id: "ia",
    title: "IA (Introdução)",
    desc: "Uma trilha inicial para entender conceitos e montar projetos simples.",
    items: [
      { id:"ai1", title:"Conceitos", meta:"dados, modelos, treino, inferência" },
      { id:"ai2", title:"Python (base)", meta:"variáveis, funções, listas" },
      { id:"ai3", title:"Pandas/NumPy", meta:"manipular dados" },
      { id:"ai4", title:"Modelos clássicos", meta:"regressão, classificação (ideia)" },
      { id:"ai5", title:"Projeto", meta:"prever algo simples com dados" },
      { id:"ai6", title:"Ética e limites", meta:"uso responsável de IA" }
    ]
  }
];

// ====== STORAGE ======
const KEY = "roadmap_estudos:v1";
function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return { done:{} }; // done[itemId]=true
    const parsed = JSON.parse(raw);
    return { done: parsed.done || {} };
  }catch{
    return { done:{} };
  }
}
function saveState(){
  localStorage.setItem(KEY, JSON.stringify(state));
}
let state = loadState();

// ====== DOM ======
const area = document.getElementById("area");
const search = document.getElementById("search");
const filter = document.getElementById("filter");

const roadmapTitle = document.getElementById("roadmapTitle");
const roadmapDesc = document.getElementById("roadmapDesc");
const list = document.getElementById("list");

const progTitle = document.getElementById("progTitle");
const progMeta = document.getElementById("progMeta");
const progPct = document.getElementById("progPct");
const barFill = document.getElementById("barFill");

const btnMarkAll = document.getElementById("btnMarkAll");
const btnUnmarkAll = document.getElementById("btnUnmarkAll");
const btnReset = document.getElementById("btnReset");

const toastEl = document.getElementById("toast");

// init select
for(const rm of ROADMAPS){
  const opt = document.createElement("option");
  opt.value = rm.id;
  opt.textContent = rm.title;
  area.appendChild(opt);
}

let currentId = area.value || ROADMAPS[0].id;

function toast(msg){
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toastEl.hidden = true, 1600);
}

function getRoadmap(){
  return ROADMAPS.find(r => r.id === currentId) || ROADMAPS[0];
}

function isDone(itemId){
  return !!state.done[itemId];
}

function setDone(itemId, value){
  if(value) state.done[itemId] = true;
  else delete state.done[itemId];
  saveState();
}

function getVisibleItems(rm){
  const term = (search.value || "").trim().toLowerCase();
  const f = filter.value || "todos";

  let items = rm.items.slice();

  if(term){
    items = items.filter(i =>
      i.title.toLowerCase().includes(term) ||
      (i.meta || "").toLowerCase().includes(term)
    );
  }

  if(f === "pendentes"){
    items = items.filter(i => !isDone(i.id));
  } else if(f === "concluidos"){
    items = items.filter(i => isDone(i.id));
  }

  return items;
}

function render(){
  const rm = getRoadmap();
  currentId = rm.id;

  roadmapTitle.textContent = rm.title;
  roadmapDesc.textContent = rm.desc;

  // progresso total (sempre baseado na trilha inteira)
  const total = rm.items.length;
  const doneCount = rm.items.filter(i => isDone(i.id)).length;
  const pct = total ? Math.round((doneCount/total) * 100) : 0;

  progTitle.textContent = "Progresso";
  progMeta.textContent = `${doneCount}/${total} concluídos`;
  progPct.textContent = `${pct}%`;
  barFill.style.width = `${pct}%`;

  // lista visível
  const visible = getVisibleItems(rm);
  list.innerHTML = visible.map(i => {
    const done = isDone(i.id);
    return `
      <article class="item ${done ? "is-done" : ""}" data-id="${i.id}">
        <div class="item__left">
          <div class="check">${done ? "✓" : ""}</div>
          <div>
            <p class="item__title">${i.title}</p>
            <div class="item__meta">${i.meta || ""}</div>
          </div>
        </div>
        <span class="muted">${done ? "Concluído" : "Pendente"}</span>
      </article>
    `;
  }).join("");

  list.querySelectorAll("[data-id]").forEach(el=>{
    el.addEventListener("click", ()=>{
      const id = el.getAttribute("data-id");
      const next = !isDone(id);
      setDone(id, next);
      render();
      toast(next ? "Marcado como concluído ✔" : "Desmarcado ↩");
    });
  });
}

// events
area.addEventListener("change", ()=>{
  currentId = area.value;
  render();
});

[search, filter].forEach(el=>{
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

btnMarkAll.addEventListener("click", ()=>{
  const rm = getRoadmap();
  rm.items.forEach(i => setDone(i.id, true));
  render();
  toast("Tudo marcado ✔");
});

btnUnmarkAll.addEventListener("click", ()=>{
  const rm = getRoadmap();
  rm.items.forEach(i => setDone(i.id, false));
  render();
  toast("Tudo desmarcado ↩");
});

btnReset.addEventListener("click", ()=>{
  if(confirm("Resetar o progresso de todas as trilhas?")){
    state = { done:{} };
    saveState();
    render();
    toast("Progresso resetado");
  }
});

// init
if(!area.value) area.value = ROADMAPS[0].id;
currentId = area.value;
render();

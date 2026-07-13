const KEY='gerenciador_despesas_v2_ios';
const LEGACY_KEYS=['gerenciador_despesas_v2_categorias','gerenciador_despesas_v1'];
let categories=[],tags=[],expenses=[];

function byId(id){return document.getElementById(id)}
function esc(t){return String(t??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function brDate(d){if(!d)return'';const [y,m,day]=d.split('-');return `${day}/${m}/${y}`}
function today(){return new Date().toISOString().slice(0,10)}
function nextId(list){return list.length?Math.max(...list.map(i=>Number(i.id)))+1:1}
function monthName(m){return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][m-1]}
function convertIcon(icon){const map={'bi-car-front':'🚗','bi-fuel-pump':'⛽','bi-calendar-check':'📅','bi-briefcase':'💼','bi-cup-straw':'🍔','bi-three-dots':'•••','bi-phone':'📱','bi-basket':'🛒','bi-bus-front':'🚌','bi-airplane':'✈️','bi-heart-pulse':'❤️','bi-gift':'🎁','bi-dice-5':'🎲','bi-book':'📚','bi-droplet':'💧'};return map[icon]||icon||'•••'}

function defaults(){categories=[{id:1,description:'Carro',icon:'🚗'},{id:2,description:'Combustível',icon:'⛽'},{id:3,description:'Gastos Fixos',icon:'📅'},{id:4,description:'Trabalho',icon:'💼'},{id:5,description:'Lazer e Lanches',icon:'🍔'},{id:6,description:'Variados',icon:'•••'},{id:7,description:'Recarga Celular',icon:'📱'},{id:8,description:'Alimentação',icon:'🛒'},{id:9,description:'Transporte',icon:'🚌'},{id:10,description:'Viagens',icon:'✈️'},{id:11,description:'Saúde',icon:'❤️'},{id:12,description:'Doação',icon:'🎁'},{id:13,description:'Loterias e Jogos',icon:'🎲'},{id:14,description:'Educação',icon:'📚'},{id:15,description:'Água',icon:'💧'}];tags=[{id:1,description:'Fixo'},{id:2,description:'Variável'},{id:3,description:'Urgente'}];expenses=[]}
function save(){localStorage.setItem(KEY,JSON.stringify({categories,tags,expenses}))}
function load(){const saved=localStorage.getItem(KEY);if(saved){try{const d=JSON.parse(saved);categories=d.categories||[];tags=d.tags||[];expenses=d.expenses||[];return}catch{}}if(!restoreLegacyData(false)){defaults();save()}}
function restoreLegacyData(show=true){for(const k of LEGACY_KEYS){const saved=localStorage.getItem(k);if(saved){try{const d=JSON.parse(saved);categories=(d.categories||[]).map(c=>({id:Number(c.id),description:c.description,icon:convertIcon(c.icon)}));tags=d.tags||[];expenses=d.expenses||[];if(!categories.length)defaults();save();renderAll();if(show)alert('Dados antigos restaurados.');return true}catch{}}}if(show)alert('Não encontrei dados antigos neste navegador.');return false}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');byId(b.dataset.tab).classList.add('active')});

function fillDates(){const y=new Date().getFullYear(),m=new Date().getMonth()+1;['filterYear','dashboardYear'].forEach(id=>{byId(id).innerHTML='';for(let i=y-5;i<=y+1;i++)byId(id).innerHTML+=`<option value="${i}">${i}</option>`;byId(id).value=y});['filterMonth','dashboardMonth'].forEach(id=>{byId(id).innerHTML='';for(let i=1;i<=12;i++)byId(id).innerHTML+=`<option value="${i}">${monthName(i)}</option>`;byId(id).value=m});byId('expenseDate').value=today()}
function getCategory(id){return categories.find(c=>Number(c.id)===Number(id))}
function getTag(id){return tags.find(t=>Number(t.id)===Number(id))}
function renderOptions(){const ec=byId('expenseCategory'),fc=byId('filterCategory'),et=byId('expenseTag'),ft=byId('filterTag');const vals=[ec.value,fc.value,et.value,ft.value];ec.innerHTML='<option value="">Selecione...</option>';fc.innerHTML='<option value="">Todas</option>';categories.sort((a,b)=>a.description.localeCompare(b.description)).forEach(c=>{ec.innerHTML+=`<option value="${c.id}">${esc(c.icon)} ${esc(c.description)}</option>`;fc.innerHTML+=`<option value="${c.id}">${esc(c.icon)} ${esc(c.description)}</option>`});et.innerHTML='<option value="">Sem tag</option>';ft.innerHTML='<option value="">Todas</option>';tags.sort((a,b)=>a.description.localeCompare(b.description)).forEach(t=>{et.innerHTML+=`<option value="${t.id}">${esc(t.description)}</option>`;ft.innerHTML+=`<option value="${t.id}">${esc(t.description)}</option>`});ec.value=vals[0];fc.value=vals[1];et.value=vals[2];ft.value=vals[3]}

byId('categoryForm').onsubmit=e=>{e.preventDefault();const id=byId('categoryId').value;const c={id:id?Number(id):nextId(categories),description:byId('categoryDescription').value.trim(),icon:byId('categoryIcon').value};if(!c.description)return;if(id)categories[categories.findIndex(x=>x.id==id)]=c;else categories.push(c);save();clearCategoryForm();renderAll()}
function renderCategoriesList(){byId('categoriesList').innerHTML=categories.length?categories.map(c=>`<div class="item"><div style="display:flex;gap:12px;align-items:center"><div class="icon">${esc(c.icon)}</div><strong>${esc(c.description)}</strong></div><div class="actions"><button onclick="editCategory(${c.id})">Editar</button><button class="secondary" onclick="deleteCategory(${c.id})">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhuma categoria.</div>'}
function editCategory(id){const c=getCategory(id);byId('categoryId').value=c.id;byId('categoryDescription').value=c.description;byId('categoryIcon').value=c.icon}
function deleteCategory(id){if(expenses.some(e=>e.categoryId==id)){alert('Categoria em uso.');return}if(confirm('Excluir categoria?')){categories=categories.filter(c=>c.id!=id);save();renderAll()}}
function clearCategoryForm(){byId('categoryForm').reset();byId('categoryId').value=''}

byId('tagForm').onsubmit=e=>{e.preventDefault();const id=byId('tagId').value;const t={id:id?Number(id):nextId(tags),description:byId('tagDescription').value.trim()};if(!t.description)return;if(id)tags[tags.findIndex(x=>x.id==id)]=t;else tags.push(t);save();clearTagForm();renderAll()}
function renderTagsList(){byId('tagsList').innerHTML=tags.length?tags.map(t=>`<div class="item"><strong>🏷 ${esc(t.description)}</strong><div class="actions"><button onclick="editTag(${t.id})">Editar</button><button class="secondary" onclick="deleteTag(${t.id})">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhuma tag.</div>'}
function editTag(id){const t=getTag(id);byId('tagId').value=t.id;byId('tagDescription').value=t.description}
function deleteTag(id){if(expenses.some(e=>e.tagId==id)){alert('Tag em uso.');return}if(confirm('Excluir tag?')){tags=tags.filter(t=>t.id!=id);save();renderAll()}}
function clearTagForm(){byId('tagForm').reset();byId('tagId').value=''}

byId('expenseForm').onsubmit=e=>{e.preventDefault();const id=byId('expenseId').value;const exp={id:id?Number(id):nextId(expenses),description:byId('expenseDescription').value.trim(),value:Number(byId('expenseValue').value),date:byId('expenseDate').value,categoryId:Number(byId('expenseCategory').value),tagId:byId('expenseTag').value?Number(byId('expenseTag').value):''};if(!exp.description||!exp.value||!exp.date||!exp.categoryId){alert('Preencha os campos obrigatórios.');return}if(id)expenses[expenses.findIndex(x=>x.id==id)]=exp;else expenses.push(exp);save();clearExpenseForm();renderAll()}
function clearExpenseForm(){byId('expenseForm').reset();byId('expenseId').value='';byId('expenseDate').value=today()}
function filteredExpenses(){
 const y=Number(byId('filterYear').value),
       m=Number(byId('filterMonth').value),
       c=byId('filterCategory').value,
       t=byId('filterTag').value,
       description=byId('filterDescription').value.trim().toLocaleLowerCase('pt-BR');

 return expenses.filter(e=>{
  const d=new Date(e.date+'T00:00:00');
  const matchesDescription=!description||String(e.description||'').toLocaleLowerCase('pt-BR').includes(description);
  return d.getFullYear()==y &&
         d.getMonth()+1==m &&
         (!c||e.categoryId==c) &&
         (!t||e.tagId==t) &&
         matchesDescription;
 });
}
function renderExpenses(){const data=filteredExpenses().sort((a,b)=>String(b.date).localeCompare(String(a.date)));byId('expensesList').innerHTML=data.length?data.map(e=>{const c=getCategory(e.categoryId),t=getTag(e.tagId);return `<div class="item"><div><span class="badge">${c?esc(c.icon):''} ${c?esc(c.description):'Sem categoria'}</span><h3>${esc(e.description)}</h3><p class="muted">${brDate(e.date)}${t?' • '+esc(t.description):''}</p></div><div><div class="money">${money(e.value)}</div><div class="actions"><button onclick="editExpense(${e.id})">Editar</button><button class="secondary" onclick="deleteExpense(${e.id})">Excluir</button></div></div></div>`}).join(''):'<div class="empty">Nenhuma despesa.</div>';byId('expensesTotal').innerText=money(data.reduce((s,e)=>s+e.value,0))}
function editExpense(id){const e=expenses.find(x=>x.id==id);byId('expenseId').value=e.id;byId('expenseDescription').value=e.description;byId('expenseValue').value=e.value;byId('expenseDate').value=e.date;byId('expenseCategory').value=e.categoryId;byId('expenseTag').value=e.tagId||'';document.querySelector('[data-tab="despesas"]').click();window.scrollTo({top:0,behavior:'smooth'})}
function deleteExpense(id){if(confirm('Excluir despesa?')){expenses=expenses.filter(e=>e.id!=id);save();renderAll()}}

function dashExpenses(){const y=Number(byId('dashboardYear').value),m=Number(byId('dashboardMonth').value);return expenses.filter(e=>{const d=new Date(e.date+'T00:00:00');return d.getFullYear()==y&&d.getMonth()+1==m})}
function renderDashboard(){const data=dashExpenses(),total=data.reduce((s,e)=>s+e.value,0);const groups=categories.map(c=>{const items=data.filter(e=>e.categoryId==c.id);const value=items.reduce((s,e)=>s+e.value,0);return{category:c,value,percent:total?value/total*100:0}}).filter(g=>g.value>0).sort((a,b)=>b.value-a.value);byId('dashboardList').innerHTML=groups.length?groups.map(g=>`<div class="item" onclick="openCategory(${g.category.id})"><div style="display:flex;gap:12px;align-items:center"><div class="icon">${esc(g.category.icon)}</div><div><h3>${esc(g.category.description)}</h3><div class="progress"><div class="bar" style="width:${g.percent}%"></div></div><p class="muted">${g.percent.toFixed(2).replace('.',',')}% do gasto mensal</p></div></div><div class="money">${money(g.value)}</div></div>`).join(''):'<div class="empty">Nenhuma despesa no mês.</div>';byId('dashboardTotal').innerText=money(total)}
function openCategory(id){const c=getCategory(id);const data=dashExpenses().filter(e=>e.categoryId==id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));byId('categoryExpensesTitle').innerText=`${c.icon} ${c.description}`;byId('categoryExpensesList').innerHTML=data.map(e=>`<div class="item"><div><strong>${esc(e.description)}</strong><p class="muted">${brDate(e.date)}</p></div><div class="money">${money(e.value)}</div></div>`).join('');byId('categoryExpensesTotal').innerText=money(data.reduce((s,e)=>s+e.value,0));byId('categoryModal').classList.add('show')}
function closeCategoryModal(){byId('categoryModal').classList.remove('show')}

function exportBackup(){const blob=new Blob([JSON.stringify({categories,tags,expenses},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup-despesas.json';a.click()}
byId('backupInput').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);categories=(d.categories||[]).map(c=>({...c,icon:convertIcon(c.icon)}));tags=d.tags||[];expenses=d.expenses||[];if(!categories.length)defaults();save();renderAll();alert('Backup importado.')}catch{alert('Backup inválido.')}};r.readAsText(file)}

['filterYear','filterMonth','filterCategory','filterTag'].forEach(id=>byId(id).onchange=renderExpenses);
byId('filterDescription').oninput=renderExpenses;
['dashboardYear','dashboardMonth'].forEach(id=>byId(id).onchange=renderDashboard);
function renderAll(){renderOptions();renderCategoriesList();renderTagsList();renderExpenses();renderDashboard()}
load();fillDates();renderAll();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

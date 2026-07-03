const STORAGE_KEY='gerenciador_despesas_v2_categorias';
let categories=[], tags=[], expenses=[];

function byId(id){return document.getElementById(id);}
function todayISO(){return new Date().toISOString().slice(0,10);}
function currentYear(){return new Date().getFullYear();}
function currentMonth(){return new Date().getMonth()+1;}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function formatDate(date){if(!date)return'';const [y,m,d]=date.split('-');return `${d}/${m}/${y}`;}
function escapeHtml(t){return String(t??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");}
function monthName(m){return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][Number(m)-1];}
function nextId(list){return list.length?Math.max(...list.map(i=>Number(i.id)))+1:1;}

function seedData(){
 categories=[
  {id:1,description:'Carro',icon:'bi-car-front'},
  {id:2,description:'Combustível',icon:'bi-fuel-pump'},
  {id:3,description:'Gastos Fixos',icon:'bi-calendar-check'},
  {id:4,description:'Trabalho',icon:'bi-briefcase'},
  {id:5,description:'Lazer e Lanches',icon:'bi-cup-straw'},
  {id:6,description:'Variados',icon:'bi-three-dots'},
  {id:7,description:'Recarga Celular',icon:'bi-phone'},
  {id:8,description:'Alimentação',icon:'bi-basket'},
  {id:9,description:'Transporte',icon:'bi-bus-front'},
  {id:10,description:'Viagens',icon:'bi-airplane'},
  {id:11,description:'Saúde',icon:'bi-heart-pulse'},
  {id:12,description:'Doação',icon:'bi-gift'},
  {id:13,description:'Loterias e Jogos',icon:'bi-dice-5'},
  {id:14,description:'Educação',icon:'bi-book'},
  {id:15,description:'Água',icon:'bi-droplet'}
 ];
 tags=[
  {id:1,description:'Fixo'},
  {id:2,description:'Variável'},
  {id:3,description:'Urgente'}
 ];
 expenses=[];
}

function loadData(){
 const saved=localStorage.getItem(STORAGE_KEY);
 if(!saved){seedData();saveData();return;}
 try{
  const data=JSON.parse(saved);
  categories=Array.isArray(data.categories)?data.categories:[];
  tags=Array.isArray(data.tags)?data.tags:[];
  expenses=Array.isArray(data.expenses)?data.expenses:[];
 }catch{seedData();saveData();}
}

function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify({categories,tags,expenses}));}

function fillYearSelect(id){
 const s=byId(id), y=currentYear();
 s.innerHTML='';
 for(let i=y-5;i<=y+1;i++)s.innerHTML+=`<option value="${i}">${i}</option>`;
 s.value=y;
}
function fillMonthSelect(id){
 const s=byId(id);s.innerHTML='';
 for(let m=1;m<=12;m++)s.innerHTML+=`<option value="${m}">${monthName(m)}</option>`;
 s.value=currentMonth();
}

function getCategory(id){return categories.find(c=>Number(c.id)===Number(id));}
function getTag(id){return tags.find(t=>Number(t.id)===Number(id));}

function renderCategoryOptions(){
 const expenseCategory=byId('expenseCategory'), filterCategory=byId('filterCategory');
 const expenseSelected=expenseCategory.value, filterSelected=filterCategory.value;
 expenseCategory.innerHTML='<option value="">Selecione...</option>';
 filterCategory.innerHTML='<option value="">Todas</option>';
 [...categories].sort((a,b)=>a.description.localeCompare(b.description)).forEach(c=>{
  expenseCategory.innerHTML+=`<option value="${c.id}">${escapeHtml(c.description)}</option>`;
  filterCategory.innerHTML+=`<option value="${c.id}">${escapeHtml(c.description)}</option>`;
 });
 expenseCategory.value=expenseSelected;
 filterCategory.value=filterSelected;
}

function renderTagOptions(){
 const expenseTag=byId('expenseTag'), filterTag=byId('filterTag');
 const expenseSelected=expenseTag.value, filterSelected=filterTag.value;
 expenseTag.innerHTML='<option value="">Sem tag</option>';
 filterTag.innerHTML='<option value="">Todas</option>';
 [...tags].sort((a,b)=>a.description.localeCompare(b.description)).forEach(t=>{
  expenseTag.innerHTML+=`<option value="${t.id}">${escapeHtml(t.description)}</option>`;
  filterTag.innerHTML+=`<option value="${t.id}">${escapeHtml(t.description)}</option>`;
 });
 expenseTag.value=expenseSelected;
 filterTag.value=filterSelected;
}

function renderAll(){
 renderCategoryOptions();renderTagOptions();renderCategoriesList();renderTagsList();renderExpenses();renderDashboard();
}

function setDefaultDates(){
 byId('expenseDate').value=todayISO();
 fillYearSelect('filterYear');fillMonthSelect('filterMonth');
 fillYearSelect('dashboardYear');fillMonthSelect('dashboardMonth');
}

/* Categorias */
byId('categoryForm').addEventListener('submit',e=>{
 e.preventDefault();
 const id=byId('categoryId').value;
 const description=byId('categoryDescription').value.trim();
 const icon=byId('categoryIcon').value;
 if(!description)return;
 const duplicated=categories.some(c=>c.description.toLowerCase()===description.toLowerCase()&&String(c.id)!==String(id));
 if(duplicated){alert('Já existe uma categoria com essa descrição.');return;}
 if(id){
  const idx=categories.findIndex(c=>String(c.id)===String(id));
  categories[idx]={id:Number(id),description,icon};
 }else categories.push({id:nextId(categories),description,icon});
 saveData();clearCategoryForm();renderAll();
});

function renderCategoriesList(){
 const list=byId('categoriesList');
 if(!categories.length){list.innerHTML='<div class="empty-state">Nenhuma categoria cadastrada.</div>';return;}
 list.innerHTML=[...categories].sort((a,b)=>a.description.localeCompare(b.description)).map(c=>`
 <div class="card card-body shadow-sm mb-2">
  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
   <div class="d-flex align-items-center gap-3">
    <div class="icon-circle"><i class="bi ${escapeHtml(c.icon)}"></i></div>
    <strong>${escapeHtml(c.description)}</strong>
   </div>
   <div class="actions">
    <button class="btn btn-sm btn-warning" onclick="editCategory(${c.id})"><i class="bi bi-pencil"></i> Editar</button>
    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})"><i class="bi bi-trash"></i> Excluir</button>
   </div>
  </div>
 </div>`).join('');
}
function editCategory(id){const c=getCategory(id);if(!c)return;byId('categoryId').value=c.id;byId('categoryDescription').value=c.description;byId('categoryIcon').value=c.icon;}
function deleteCategory(id){
 if(expenses.some(e=>Number(e.categoryId)===Number(id))){alert('Não é possível excluir uma categoria que possui despesas.');return;}
 if(!confirm('Excluir esta categoria?'))return;
 categories=categories.filter(c=>Number(c.id)!==Number(id));saveData();renderAll();
}
function clearCategoryForm(){byId('categoryForm').reset();byId('categoryId').value='';}

/* Tags */
byId('tagForm').addEventListener('submit',e=>{
 e.preventDefault();
 const id=byId('tagId').value, description=byId('tagDescription').value.trim();
 if(!description)return;
 const duplicated=tags.some(t=>t.description.toLowerCase()===description.toLowerCase()&&String(t.id)!==String(id));
 if(duplicated){alert('Já existe uma tag com essa descrição.');return;}
 if(id){const idx=tags.findIndex(t=>String(t.id)===String(id));tags[idx]={id:Number(id),description};}
 else tags.push({id:nextId(tags),description});
 saveData();clearTagForm();renderAll();
});
function renderTagsList(){
 const list=byId('tagsList');
 if(!tags.length){list.innerHTML='<div class="empty-state">Nenhuma tag cadastrada.</div>';return;}
 list.innerHTML=[...tags].sort((a,b)=>a.description.localeCompare(b.description)).map(t=>`
 <div class="card card-body shadow-sm mb-2">
  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
   <div><i class="bi bi-tag text-danger"></i> <strong>${escapeHtml(t.description)}</strong></div>
   <div class="actions">
    <button class="btn btn-sm btn-warning" onclick="editTag(${t.id})"><i class="bi bi-pencil"></i> Editar</button>
    <button class="btn btn-sm btn-danger" onclick="deleteTag(${t.id})"><i class="bi bi-trash"></i> Excluir</button>
   </div>
  </div>
 </div>`).join('');
}
function editTag(id){const t=getTag(id);if(!t)return;byId('tagId').value=t.id;byId('tagDescription').value=t.description;}
function deleteTag(id){
 if(expenses.some(e=>Number(e.tagId)===Number(id))){alert('Não é possível excluir uma tag que possui despesas.');return;}
 if(!confirm('Excluir esta tag?'))return;
 tags=tags.filter(t=>Number(t.id)!==Number(id));saveData();renderAll();
}
function clearTagForm(){byId('tagForm').reset();byId('tagId').value='';}

/* Despesas */
byId('expenseForm').addEventListener('submit',e=>{
 e.preventDefault();
 const id=byId('expenseId').value;
 const expense={id:id?Number(id):nextId(expenses),description:byId('expenseDescription').value.trim(),value:Number(byId('expenseValue').value),date:byId('expenseDate').value,categoryId:Number(byId('expenseCategory').value),tagId:byId('expenseTag').value?Number(byId('expenseTag').value):''};
 if(!expense.description||!expense.value||!expense.date||!expense.categoryId){alert('Preencha todos os campos obrigatórios.');return;}
 if(id){const idx=expenses.findIndex(x=>String(x.id)===String(id));expenses[idx]=expense;}
 else expenses.push(expense);
 saveData();clearExpenseForm();renderAll();
});
function clearExpenseForm(){byId('expenseForm').reset();byId('expenseId').value='';byId('expenseDate').value=todayISO();}
function getFilteredExpenses(){
 const y=Number(byId('filterYear').value), m=Number(byId('filterMonth').value), c=byId('filterCategory').value, t=byId('filterTag').value;
 return expenses.filter(e=>{
  const d=new Date(e.date+'T00:00:00');
  return d.getFullYear()===y && d.getMonth()+1===m && (!c||String(e.categoryId)===String(c)) && (!t||String(e.tagId)===String(t));
 });
}
function renderExpenses(){
 const data=getFilteredExpenses().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const list=byId('expensesList');
 if(!data.length)list.innerHTML='<div class="empty-state">Nenhuma despesa encontrada para os filtros selecionados.</div>';
 else list.innerHTML=data.map(e=>{
  const c=getCategory(e.categoryId), t=getTag(e.tagId);
  return `<div class="card card-body shadow-sm mb-2 expense-card">
   <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
    <div>
     <strong>${escapeHtml(e.description)}</strong>
     <div class="text-muted">${formatDate(e.date)}</div>
     <span class="badge text-bg-danger"><i class="bi ${c?escapeHtml(c.icon):'bi-question-circle'}"></i> ${c?escapeHtml(c.description):'Sem categoria'}</span>
     ${t?`<span class="badge text-bg-secondary">${escapeHtml(t.description)}</span>`:''}
    </div>
    <div class="text-end">
     <h5 class="text-danger">${money(e.value)}</h5>
     <div class="actions justify-content-end">
      <button class="btn btn-sm btn-warning" onclick="editExpense(${e.id})"><i class="bi bi-pencil"></i> Editar</button>
      <button class="btn btn-sm btn-danger" onclick="deleteExpense(${e.id})"><i class="bi bi-trash"></i> Excluir</button>
     </div>
    </div>
   </div>
  </div>`;
 }).join('');
 byId('expensesTotal').innerText=money(data.reduce((s,e)=>s+Number(e.value),0));
}
function editExpense(id){
 const e=expenses.find(x=>Number(x.id)===Number(id));if(!e)return;
 byId('expenseId').value=e.id;byId('expenseDescription').value=e.description;byId('expenseValue').value=e.value;byId('expenseDate').value=e.date;byId('expenseCategory').value=e.categoryId;byId('expenseTag').value=e.tagId||'';
 new bootstrap.Tab(document.querySelector('[data-bs-target="#despesas"]')).show();
 window.scrollTo({top:0,behavior:'smooth'});
}
function deleteExpense(id){if(!confirm('Excluir esta despesa?'))return;expenses=expenses.filter(e=>Number(e.id)!==Number(id));saveData();renderAll();}

/* Dashboard */
function getDashboardExpenses(){
 const y=Number(byId('dashboardYear').value), m=Number(byId('dashboardMonth').value);
 return expenses.filter(e=>{const d=new Date(e.date+'T00:00:00');return d.getFullYear()===y&&d.getMonth()+1===m;});
}
function renderDashboard(){
 const data=getDashboardExpenses(), total=data.reduce((s,e)=>s+Number(e.value),0);
 const groups=categories.map(c=>{
  const items=data.filter(e=>Number(e.categoryId)===Number(c.id));
  const value=items.reduce((s,e)=>s+Number(e.value),0);
  return {category:c,value,percent:total?(value/total)*100:0};
 }).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
 const list=byId('dashboardList');
 if(!groups.length)list.innerHTML='<div class="empty-state">Nenhuma despesa encontrada para este mês.</div>';
 else list.innerHTML=groups.map(g=>`
 <div class="card card-body shadow-sm mb-2 category-dashboard-card" onclick="openCategoryExpenses(${g.category.id})">
  <div class="d-flex align-items-center gap-3">
   <div class="icon-circle"><i class="bi ${escapeHtml(g.category.icon)}"></i></div>
   <div class="flex-grow-1">
    <div class="d-flex justify-content-between gap-2"><strong>${escapeHtml(g.category.description)}</strong><strong class="text-danger">${money(g.value)}</strong></div>
    <div class="progress mt-2" style="height:8px"><div class="progress-bar bg-danger" style="width:${g.percent.toFixed(2)}%"></div></div>
    <div class="percent-text mt-1">${g.percent.toFixed(2).replace('.',',')}% do gasto total do mês</div>
   </div>
  </div>
 </div>`).join('');
 byId('dashboardTotal').innerText=money(total);
}
function openCategoryExpenses(categoryId){
 const c=getCategory(categoryId);
 const data=getDashboardExpenses().filter(e=>Number(e.categoryId)===Number(categoryId)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const total=data.reduce((s,e)=>s+Number(e.value),0);
 byId('categoryExpensesTitle').innerHTML=`<i class="bi ${c?escapeHtml(c.icon):'bi-question-circle'}"></i> ${c?escapeHtml(c.description):'Categoria'}`;
 byId('categoryExpensesList').innerHTML=data.map(e=>{
  const t=getTag(e.tagId);
  return `<div class="card card-body shadow-sm mb-2"><div class="d-flex justify-content-between flex-wrap gap-2"><div><strong>${escapeHtml(e.description)}</strong><div class="text-muted">${formatDate(e.date)}</div>${t?`<span class="badge text-bg-secondary">${escapeHtml(t.description)}</span>`:''}</div><strong class="text-danger">${money(e.value)}</strong></div></div>`;
 }).join('');
 byId('categoryExpensesTotal').innerText=money(total);
 new bootstrap.Modal(byId('categoryExpensesModal')).show();
}

/* Backup */
function exportBackup(){
 const blob=new Blob([JSON.stringify({categories,tags,expenses,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
 const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='backup-gerenciador-despesas.json';link.click();
}
byId('backupInput').addEventListener('change',e=>{
 const file=e.target.files[0];if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const data=JSON.parse(reader.result);
   categories=Array.isArray(data.categories)?data.categories:[];
   tags=Array.isArray(data.tags)?data.tags:[];
   expenses=Array.isArray(data.expenses)?data.expenses:[];
   saveData();renderAll();alert('Backup importado com sucesso.');
  }catch{alert('Arquivo de backup inválido.');}
 };
 reader.readAsText(file);
});

['filterYear','filterMonth','filterCategory','filterTag'].forEach(id=>byId(id).addEventListener('change',renderExpenses));
['dashboardYear','dashboardMonth'].forEach(id=>byId(id).addEventListener('change',renderDashboard));

loadData();setDefaultDates();renderAll();

if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js');}

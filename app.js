const KEY='gerenciador_despesas_v3';
const LEGACY_KEYS=['gerenciador_despesas_v2_ios','gerenciador_despesas_v2_categorias','gerenciador_despesas_v1'];
let categories=[],tags=[],expenses=[],recurring=[];

function byId(id){return document.getElementById(id)}
function esc(t){return String(t??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function brDate(d){if(!d)return'';const [y,m,day]=d.split('-');return `${day}/${m}/${y}`}
function today(){return new Date().toISOString().slice(0,10)}
function nextId(list){return list.length?Math.max(...list.map(i=>Number(i.id)))+1:1}
function monthName(m){return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][m-1]}
function convertIcon(icon){const map={'bi-car-front':'🚗','bi-fuel-pump':'⛽','bi-calendar-check':'📅','bi-briefcase':'💼','bi-cup-straw':'🍔','bi-three-dots':'•••','bi-phone':'📱','bi-basket':'🛒','bi-bus-front':'🚌','bi-airplane':'✈️','bi-heart-pulse':'❤️','bi-gift':'🎁','bi-dice-5':'🎲','bi-book':'📚','bi-droplet':'💧'};return map[icon]||icon||'•••'}

function defaults(){
 categories=[{id:1,description:'Carro',icon:'🚗',budget:0},{id:2,description:'Combustível',icon:'⛽',budget:0},{id:3,description:'Gastos Fixos',icon:'📅',budget:0},{id:4,description:'Trabalho',icon:'💼',budget:0},{id:5,description:'Lazer e Lanches',icon:'🍔',budget:0},{id:6,description:'Variados',icon:'•••',budget:0},{id:7,description:'Recarga Celular',icon:'📱',budget:0},{id:8,description:'Alimentação',icon:'🛒',budget:0},{id:9,description:'Transporte',icon:'🚌',budget:0},{id:10,description:'Viagens',icon:'✈️',budget:0},{id:11,description:'Saúde',icon:'❤️',budget:0},{id:12,description:'Doação',icon:'🎁',budget:0},{id:13,description:'Loterias e Jogos',icon:'🎲',budget:0},{id:14,description:'Educação',icon:'📚',budget:0},{id:15,description:'Água',icon:'💧',budget:0}];
 tags=[{id:1,description:'Fixo'},{id:2,description:'Variável'},{id:3,description:'Urgente'}];expenses=[];recurring=[];
}
function normalize(){
 categories=(categories||[]).map(c=>({...c,id:Number(c.id),icon:convertIcon(c.icon),budget:Number(c.budget||0)}));
 tags=(tags||[]).map(t=>({...t,id:Number(t.id)}));
 expenses=(expenses||[]).map(e=>({...e,id:Number(e.id),value:Number(e.value),categoryId:Number(e.categoryId),tagId:e.tagId?Number(e.tagId):'',recurringId:e.recurringId?Number(e.recurringId):''}));
 recurring=(recurring||[]).map(r=>({...r,id:Number(r.id),value:Number(r.value),day:Number(r.day),categoryId:Number(r.categoryId),tagId:r.tagId?Number(r.tagId):'',active:r.active!==false}));
}
function save(){localStorage.setItem(KEY,JSON.stringify({categories,tags,expenses,recurring}))}
function load(){
 const saved=localStorage.getItem(KEY);
 if(saved){try{const d=JSON.parse(saved);categories=d.categories||[];tags=d.tags||[];expenses=d.expenses||[];recurring=d.recurring||[];normalize();return}catch{}}
 if(!restoreLegacyData(false)){defaults();save()}
}
function restoreLegacyData(show=true){
 for(const k of LEGACY_KEYS){
  const saved=localStorage.getItem(k);
  if(saved){try{
   const d=JSON.parse(saved);
   categories=(d.categories||[]).map(c=>({id:Number(c.id),description:c.description,icon:convertIcon(c.icon),budget:Number(c.budget||0)}));
   tags=d.tags||[];expenses=d.expenses||[];recurring=d.recurring||[];
   if(!categories.length)defaults();normalize();save();renderAll();
   if(show)alert('Dados antigos restaurados com sucesso.');return true;
  }catch{}}
 }
 if(show)alert('Não encontrei dados antigos neste navegador.');return false;
}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');byId(b.dataset.tab).classList.add('active')});

function fillYearMonth(yearId,monthId){
 const y=new Date().getFullYear(),m=new Date().getMonth()+1;
 byId(yearId).innerHTML='';for(let i=y-5;i<=y+2;i++)byId(yearId).innerHTML+=`<option value="${i}">${i}</option>`;byId(yearId).value=y;
 byId(monthId).innerHTML='';for(let i=1;i<=12;i++)byId(monthId).innerHTML+=`<option value="${i}">${monthName(i)}</option>`;byId(monthId).value=m;
}
function fillDates(){
 [['filterYear','filterMonth'],['dashboardYear','dashboardMonth'],['calendarYear','calendarMonth'],['recurringYear','recurringMonth']].forEach(x=>fillYearMonth(x[0],x[1]));
 byId('expenseDate').value=today();
}
function getCategory(id){return categories.find(c=>Number(c.id)===Number(id))}
function getTag(id){return tags.find(t=>Number(t.id)===Number(id))}
function fillSelect(select,items,emptyText,formatter){
 const val=select.value;select.innerHTML=`<option value="">${emptyText}</option>`;items.forEach(i=>select.innerHTML+=`<option value="${i.id}">${formatter(i)}</option>`);select.value=val;
}
function renderOptions(){
 const sortedCats=[...categories].sort((a,b)=>a.description.localeCompare(b.description));
 const sortedTags=[...tags].sort((a,b)=>a.description.localeCompare(b.description));
 ['expenseCategory','filterCategory','recurringCategory','quickCategory'].forEach(id=>fillSelect(byId(id),sortedCats,id==='filterCategory'?'Todas':'Selecione...',c=>`${esc(c.icon)} ${esc(c.description)}`));
 ['expenseTag','filterTag','recurringTag','quickTag'].forEach(id=>fillSelect(byId(id),sortedTags,id==='filterTag'?'Todas':'Sem tag',t=>esc(t.description)));
}

byId('categoryForm').onsubmit=e=>{
 e.preventDefault();
 const id=byId('categoryId').value;
 const c={id:id?Number(id):nextId(categories),description:byId('categoryDescription').value.trim(),icon:byId('categoryIcon').value,budget:Number(byId('categoryBudget').value||0)};
 if(!c.description)return;
 if(id)categories[categories.findIndex(x=>x.id==id)]=c;else categories.push(c);
 save();clearCategoryForm();renderAll();
}
function renderCategoriesList(){
 byId('categoriesList').innerHTML=categories.length?categories.map(c=>`<div class="item"><div style="display:flex;gap:12px;align-items:center"><div class="icon">${esc(c.icon)}</div><div><strong>${esc(c.description)}</strong><div class="muted">${c.budget?`Orçamento: ${money(c.budget)}`:'Sem orçamento definido'}</div></div></div><div class="actions"><button onclick="editCategory(${c.id})">Editar</button><button class="secondary" onclick="deleteCategory(${c.id})">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhuma categoria.</div>'
}
function editCategory(id){const c=getCategory(id);byId('categoryId').value=c.id;byId('categoryDescription').value=c.description;byId('categoryIcon').value=c.icon;byId('categoryBudget').value=c.budget||''}
function deleteCategory(id){if(expenses.some(e=>e.categoryId==id)||recurring.some(r=>r.categoryId==id)){alert('Categoria em uso.');return}if(confirm('Excluir categoria?')){categories=categories.filter(c=>c.id!=id);save();renderAll()}}
function clearCategoryForm(){byId('categoryForm').reset();byId('categoryId').value=''}

byId('tagForm').onsubmit=e=>{e.preventDefault();const id=byId('tagId').value;const t={id:id?Number(id):nextId(tags),description:byId('tagDescription').value.trim()};if(!t.description)return;if(id)tags[tags.findIndex(x=>x.id==id)]=t;else tags.push(t);save();clearTagForm();renderAll()}
function renderTagsList(){byId('tagsList').innerHTML=tags.length?tags.map(t=>`<div class="item"><strong>🏷 ${esc(t.description)}</strong><div class="actions"><button onclick="editTag(${t.id})">Editar</button><button class="secondary" onclick="deleteTag(${t.id})">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhuma tag.</div>'}
function editTag(id){const t=getTag(id);byId('tagId').value=t.id;byId('tagDescription').value=t.description}
function deleteTag(id){if(expenses.some(e=>e.tagId==id)||recurring.some(r=>r.tagId==id)){alert('Tag em uso.');return}if(confirm('Excluir tag?')){tags=tags.filter(t=>t.id!=id);save();renderAll()}}
function clearTagForm(){byId('tagForm').reset();byId('tagId').value=''}

byId('expenseForm').onsubmit=e=>{
 e.preventDefault();const id=byId('expenseId').value;
 const exp={id:id?Number(id):nextId(expenses),description:byId('expenseDescription').value.trim(),value:Number(byId('expenseValue').value),date:byId('expenseDate').value,categoryId:Number(byId('expenseCategory').value),tagId:byId('expenseTag').value?Number(byId('expenseTag').value):''};
 if(!exp.description||!exp.value||!exp.date||!exp.categoryId){alert('Preencha os campos obrigatórios.');return}
 if(id){const old=expenses.find(x=>x.id==id);if(old?.recurringId)exp.recurringId=old.recurringId;expenses[expenses.findIndex(x=>x.id==id)]=exp}else expenses.push(exp);
 save();clearExpenseForm();renderAll();
}
function clearExpenseForm(){byId('expenseForm').reset();byId('expenseId').value='';byId('expenseDate').value=today()}
function filteredExpenses(){
 const y=Number(byId('filterYear').value),m=Number(byId('filterMonth').value),c=byId('filterCategory').value,t=byId('filterTag').value,description=byId('filterDescription').value.trim().toLocaleLowerCase('pt-BR');
 return expenses.filter(e=>{const d=new Date(e.date+'T00:00:00');return d.getFullYear()==y&&d.getMonth()+1==m&&(!c||e.categoryId==c)&&(!t||e.tagId==t)&&(!description||String(e.description||'').toLocaleLowerCase('pt-BR').includes(description))})
}
function renderExpenses(){
 const data=filteredExpenses().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 byId('expensesList').innerHTML=data.length?data.map(e=>{const c=getCategory(e.categoryId),t=getTag(e.tagId);return `<div class="item"><div><span class="badge">${c?esc(c.icon):''} ${c?esc(c.description):'Sem categoria'}</span><h3>${esc(e.description)}</h3><p class="muted">${brDate(e.date)}${t?' • '+esc(t.description):''}${e.recurringId?' • Recorrente':''}</p></div><div><div class="money">${money(e.value)}</div><div class="actions"><button onclick="editExpense(${e.id})">Editar</button><button onclick="duplicateExpense(${e.id})">Duplicar</button><button class="secondary" onclick="deleteExpense(${e.id})">Excluir</button></div></div></div>`}).join(''):'<div class="empty">Nenhuma despesa.</div>';
 byId('expensesTotal').innerText=money(data.reduce((s,e)=>s+e.value,0));
}
function editExpense(id){const e=expenses.find(x=>x.id==id);byId('expenseId').value=e.id;byId('expenseDescription').value=e.description;byId('expenseValue').value=e.value;byId('expenseDate').value=e.date;byId('expenseCategory').value=e.categoryId;byId('expenseTag').value=e.tagId||'';document.querySelector('[data-tab="despesas"]').click();window.scrollTo({top:0,behavior:'smooth'})}
function duplicateExpense(id){const e=expenses.find(x=>x.id==id);byId('expenseId').value='';byId('expenseDescription').value=e.description;byId('expenseValue').value=e.value;byId('expenseDate').value=today();byId('expenseCategory').value=e.categoryId;byId('expenseTag').value=e.tagId||'';document.querySelector('[data-tab="despesas"]').click();window.scrollTo({top:0,behavior:'smooth'})}
function deleteExpense(id){if(confirm('Excluir despesa?')){expenses=expenses.filter(e=>e.id!=id);save();renderAll()}}

byId('quickAddButton').onclick=()=>byId('quickAddModal').classList.add('show');
function closeQuickAdd(){byId('quickAddModal').classList.remove('show');byId('quickAddForm').reset()}
byId('quickAddForm').onsubmit=e=>{e.preventDefault();const exp={id:nextId(expenses),description:byId('quickDescription').value.trim(),value:Number(byId('quickValue').value),date:today(),categoryId:Number(byId('quickCategory').value),tagId:byId('quickTag').value?Number(byId('quickTag').value):''};if(!exp.description||!exp.value||!exp.categoryId)return;expenses.push(exp);save();closeQuickAdd();renderAll();alert('Despesa adicionada.');}

byId('recurringForm').onsubmit=e=>{
 e.preventDefault();const id=byId('recurringId').value;
 const r={id:id?Number(id):nextId(recurring),description:byId('recurringDescription').value.trim(),value:Number(byId('recurringValue').value),day:Number(byId('recurringDay').value),categoryId:Number(byId('recurringCategory').value),tagId:byId('recurringTag').value?Number(byId('recurringTag').value):'',active:byId('recurringActive').value==='true'};
 if(!r.description||!r.value||!r.day||!r.categoryId)return;
 if(id)recurring[recurring.findIndex(x=>x.id==id)]=r;else recurring.push(r);save();clearRecurringForm();renderRecurring();
}
function clearRecurringForm(){byId('recurringForm').reset();byId('recurringId').value='';byId('recurringActive').value='true'}
function renderRecurring(){
 byId('recurringList').innerHTML=recurring.length?recurring.map(r=>{const c=getCategory(r.categoryId),t=getTag(r.tagId);return `<div class="item"><div><span class="badge">${c?esc(c.icon):''} ${c?esc(c.description):''}</span><h3>${esc(r.description)}</h3><p class="muted">Dia ${r.day} • ${money(r.value)}${t?' • '+esc(t.description):''}</p><div class="recurring-status ${r.active?'active-status':'inactive-status'}">${r.active?'Ativa':'Inativa'}</div></div><div class="actions"><button onclick="editRecurring(${r.id})">Editar</button><button class="secondary" onclick="deleteRecurring(${r.id})">Excluir</button></div></div>`}).join(''):'<div class="empty">Nenhuma despesa recorrente.</div>'
}
function editRecurring(id){const r=recurring.find(x=>x.id==id);byId('recurringId').value=r.id;byId('recurringDescription').value=r.description;byId('recurringValue').value=r.value;byId('recurringDay').value=r.day;byId('recurringCategory').value=r.categoryId;byId('recurringTag').value=r.tagId||'';byId('recurringActive').value=String(r.active)}
function deleteRecurring(id){if(confirm('Excluir recorrente?')){recurring=recurring.filter(r=>r.id!=id);save();renderRecurring()}}
function generateRecurringExpenses(){
 const y=Number(byId('recurringYear').value),m=Number(byId('recurringMonth').value);
 let count=0;
 recurring.filter(r=>r.active).forEach(r=>{
  const lastDay=new Date(y,m,0).getDate();const day=Math.min(r.day,lastDay);const date=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const exists=expenses.some(e=>e.recurringId==r.id&&e.date===date);
  if(!exists){expenses.push({id:nextId(expenses),description:r.description,value:r.value,date,categoryId:r.categoryId,tagId:r.tagId||'',recurringId:r.id});count++}
 });
 save();renderAll();alert(`${count} despesa(s) recorrente(s) gerada(s).`);
}

function dashExpenses(year=Number(byId('dashboardYear').value),month=Number(byId('dashboardMonth').value)){return expenses.filter(e=>{const d=new Date(e.date+'T00:00:00');return d.getFullYear()==year&&d.getMonth()+1==month})}
function renderDashboard(){
 const y=Number(byId('dashboardYear').value),m=Number(byId('dashboardMonth').value),data=dashExpenses(y,m),total=data.reduce((s,e)=>s+e.value,0);
 const groups=categories.map(c=>{const items=data.filter(e=>e.categoryId==c.id);const value=items.reduce((s,e)=>s+e.value,0);return{category:c,value,percent:total?value/total*100:0,budgetPercent:c.budget?value/c.budget*100:0}}).filter(g=>g.value>0).sort((a,b)=>b.value-a.value);
 byId('dashboardList').innerHTML=groups.length?groups.map(g=>`<div class="item" onclick="openCategory(${g.category.id})"><div style="display:flex;gap:12px;align-items:center"><div class="icon">${esc(g.category.icon)}</div><div><h3>${esc(g.category.description)}</h3><div class="progress"><div class="bar ${g.category.budget&&g.value>g.category.budget?'over':''}" style="width:${Math.min(g.category.budget?g.budgetPercent:g.percent,100)}%"></div></div><p class="muted">${g.percent.toFixed(2).replace('.',',')}% do gasto mensal</p>${g.category.budget?`<div class="budget-text">${money(g.value)} de ${money(g.category.budget)} (${g.budgetPercent.toFixed(1).replace('.',',')}%)</div>`:''}</div></div><div class="money">${money(g.value)}</div></div>`).join(''):'<div class="empty">Nenhuma despesa no mês.</div>';
 byId('dashboardTotal').innerText=money(total);
 renderComparison(y,m,total);renderSummary();renderMonthlyChart(y,m);
}
function renderComparison(y,m,total){
 const prev=new Date(y,m-2,1),py=prev.getFullYear(),pm=prev.getMonth()+1,prevTotal=dashExpenses(py,pm).reduce((s,e)=>s+e.value,0),el=byId('monthComparison');
 if(!prevTotal){el.innerText='Sem dados no mês anterior';el.className='';return}
 const pct=(total-prevTotal)/prevTotal*100;
 el.innerText=`${pct>=0?'↑':'↓'} ${Math.abs(pct).toFixed(2).replace('.',',')}% em relação a ${monthName(pm).toLowerCase()}`;
 el.className=pct>=0?'positive':'negative';
}
function renderSummary(){
 const now=new Date(),todayStr=today(),start=new Date(now);start.setDate(now.getDate()-now.getDay());start.setHours(0,0,0,0);
 const todayTotal=expenses.filter(e=>e.date===todayStr).reduce((s,e)=>s+e.value,0);
 const weekTotal=expenses.filter(e=>new Date(e.date+'T00:00:00')>=start&&new Date(e.date+'T00:00:00')<=now).reduce((s,e)=>s+e.value,0);
 const monthTotal=expenses.filter(e=>{const d=new Date(e.date+'T00:00:00');return d.getFullYear()==now.getFullYear()&&d.getMonth()==now.getMonth()}).reduce((s,e)=>s+e.value,0);
 byId('summaryToday').innerText=money(todayTotal);byId('summaryWeek').innerText=money(weekTotal);byId('summaryMonth').innerText=money(monthTotal);
}
function renderMonthlyChart(y,m){
 const months=[];for(let i=5;i>=0;i--){const d=new Date(y,m-1-i,1);const yy=d.getFullYear(),mm=d.getMonth()+1,val=dashExpenses(yy,mm).reduce((s,e)=>s+e.value,0);months.push({yy,mm,val})}
 const max=Math.max(...months.map(x=>x.val),1);
 byId('monthlyChart').innerHTML=months.map(x=>`<div class="chart-col"><div class="chart-value">${money(x.val)}</div><div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.max(x.val/max*150,4)}px"></div></div><div class="chart-label">${monthName(x.mm).slice(0,3)}/${String(x.yy).slice(-2)}</div></div>`).join('');
}
function openCategory(id){const c=getCategory(id),data=dashExpenses().filter(e=>e.categoryId==id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));byId('categoryExpensesTitle').innerText=`${c.icon} ${c.description}`;byId('categoryExpensesList').innerHTML=data.map(e=>`<div class="item"><div><strong>${esc(e.description)}</strong><p class="muted">${brDate(e.date)}</p></div><div class="money">${money(e.value)}</div></div>`).join('');byId('categoryExpensesTotal').innerText=money(data.reduce((s,e)=>s+e.value,0));byId('categoryModal').classList.add('show')}
function closeCategoryModal(){byId('categoryModal').classList.remove('show')}

function renderCalendar(){
 const y=Number(byId('calendarYear').value),m=Number(byId('calendarMonth').value),first=new Date(y,m-1,1).getDay(),days=new Date(y,m,0).getDate(),grid=byId('calendarGrid');let html='';
 for(let i=0;i<first;i++)html+='<div class="calendar-day empty-day"></div>';
 for(let day=1;day<=days;day++){const date=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`,items=expenses.filter(e=>e.date===date),total=items.reduce((s,e)=>s+e.value,0);html+=`<div class="calendar-day" onclick="openDay('${date}')"><div class="calendar-number">${day}</div>${total?`<div class="calendar-total">${money(total)}</div>`:''}</div>`}
 grid.innerHTML=html;
}
function openDay(date){const data=expenses.filter(e=>e.date===date).sort((a,b)=>a.description.localeCompare(b.description));byId('dayExpensesTitle').innerText=`Despesas de ${brDate(date)}`;byId('dayExpensesList').innerHTML=data.length?data.map(e=>{const c=getCategory(e.categoryId);return `<div class="item"><div><strong>${esc(e.description)}</strong><p class="muted">${c?esc(c.icon)+' '+esc(c.description):''}</p></div><div class="money">${money(e.value)}</div></div>`}).join(''):'<div class="empty">Nenhuma despesa neste dia.</div>';byId('dayExpensesTotal').innerText=money(data.reduce((s,e)=>s+e.value,0));byId('dayModal').classList.add('show')}
function closeDayModal(){byId('dayModal').classList.remove('show')}

function exportCSV(){
 const rows=[['Data','Descrição','Valor','Categoria','Tag']];
 filteredExpenses().sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(e=>rows.push([brDate(e.date),e.description,Number(e.value).toFixed(2).replace('.',','),getCategory(e.categoryId)?.description||'',getTag(e.tagId)?.description||'']));
 const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`despesas-${byId('filterYear').value}-${String(byId('filterMonth').value).padStart(2,'0')}.csv`;a.click();
}
function exportBackup(){const blob=new Blob([JSON.stringify({categories,tags,expenses,recurring},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup-despesas-v3.json';a.click()}
byId('backupInput').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);categories=(d.categories||[]).map(c=>({...c,icon:convertIcon(c.icon),budget:Number(c.budget||0)}));tags=d.tags||[];expenses=d.expenses||[];recurring=d.recurring||[];if(!categories.length)defaults();normalize();save();renderAll();alert('Backup importado.')}catch{alert('Backup inválido.')}};r.readAsText(file)}

['filterYear','filterMonth','filterCategory','filterTag'].forEach(id=>byId(id).onchange=renderExpenses);byId('filterDescription').oninput=renderExpenses;
['dashboardYear','dashboardMonth'].forEach(id=>byId(id).onchange=renderDashboard);
['calendarYear','calendarMonth'].forEach(id=>byId(id).onchange=renderCalendar);

function renderAll(){renderOptions();renderCategoriesList();renderTagsList();renderExpenses();renderRecurring();renderDashboard();renderCalendar()}
load();fillDates();renderAll();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

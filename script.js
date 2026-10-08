const state={
 page:"dashboard",
 customers:[
  {id:"C001",name:"Rajesh Kumar",email:"rajesh@example.com",phone:"9876543210",company:"RK Enterprises",status:"Active"},
  {id:"C002",name:"Ananya Rao",email:"ananya@example.com",phone:"9123456780",company:"Rao Technologies",status:"Active"},
  {id:"C003",name:"Vikram Singh",email:"vikram@example.com",phone:"9988776655",company:"Singh Industries",status:"Inactive"}],
 leads:[
  {id:"L001",name:"Priya Sharma",company:"PS Solutions",status:"Qualified",source:"Website",value:80000},
  {id:"L002",name:"Arjun Reddy",company:"AR Retail",status:"Contacted",source:"Referral",value:45000},
  {id:"L003",name:"Sneha Patel",company:"SP Labs",status:"New",source:"Campaign",value:120000}],
 opportunities:[
  {id:"O001",name:"Enterprise CRM",customer:"RK Enterprises",stage:"Proposal",amount:250000,probability:70},
  {id:"O002",name:"Retail Automation",customer:"AR Retail",stage:"Negotiation",amount:180000,probability:60},
  {id:"O003",name:"Support Platform",customer:"SP Labs",stage:"Won",amount:150000,probability:100}],
 followups:[
  {id:"F001",subject:"Demo call",customer:"RK Enterprises",date:"2026-10-10",status:"Planned"},
  {id:"F002",subject:"Proposal discussion",customer:"AR Retail",date:"2026-10-12",status:"Planned"}],
 activities:[
  {id:"A001",type:"Call",subject:"Customer introduction",date:"2026-10-08",status:"Completed"},
  {id:"A002",type:"Meeting",subject:"Product demo",date:"2026-10-09",status:"Planned"}],
 users:[
  {name:"Admin User",email:"admin@acxiomcrm.com",role:"Admin",status:"Active"},
  {name:"Manager User",email:"manager@acxiomcrm.com",role:"Manager",status:"Active"},
  {name:"Sales User",email:"sales@acxiomcrm.com",role:"Sales Executive",status:"Active"}],
 audit:[
  {time:"2026-10-08 21:40",user:"Admin User",action:"Login",module:"Authentication",result:"Success"},
  {time:"2026-10-08 21:45",user:"Admin User",action:"Create",module:"Customer",result:"Success"},
  {time:"2026-10-08 21:50",user:"Admin User",action:"Update",module:"Opportunity",result:"Success"}]
};

let chart1,chart2;

document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("loginForm").addEventListener("submit",login);
 document.getElementById("logoutBtn").onclick=logout;
 document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("show");
 document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById("sidebar").classList.remove("show");render();});
 document.getElementById("addForm").addEventListener("submit",saveRecord);
});

function login(e){e.preventDefault();const email=loginEmail.value.trim(),pass=loginPassword.value;if(email==="admin@acxiomcrm.com"&&pass==="Admin@123"){loginScreen.classList.add("d-none");app.classList.remove("d-none");render()}else loginError.textContent="Invalid demo credentials. Use admin@acxiomcrm.com / Admin@123";}

function logout(){app.classList.add("d-none");loginScreen.classList.remove("d-none");}

function render(){
 const p=state.page;
 const titles={dashboard:["Dashboard","Overview of CRM performance and sales activity."],customers:["Customer Management","Create, search and manage customer records."],leads:["Lead Management","Track prospects from capture to conversion."],opportunities:["Opportunity Management","Manage pipeline stages, values and probability."],followups:["Follow-Up Management","Schedule and track upcoming customer follow-ups."],activities:["Activity Management","Track calls, meetings, emails and tasks."],users:["User & Role Management","Manage users and application roles."],audit:["Audit Log","Security and business activity history."],reports:["Reports","CRM reporting and pipeline insights."]};
 let [title,sub]=titles[p];pageContent.innerHTML=`<div class="d-flex justify-content-between align-items-end mb-4"><div><h2 class="page-title mb-1">${title}</h2><div class="subtitle">${sub}</div></div>${p!=="dashboard"&&p!=="audit"&&p!=="reports"?`<button class="btn btn-primary" onclick="openAdd('${p}')"><i class="bi bi-plus-lg"></i> Add New</button>`:""}</div>`;
 if(p==="dashboard") dashboard(); else if(p==="customers") tablePage("customers",["ID","Name","Email","Phone","Company","Status"],state.customers,r=>[r.id,r.name,r.email,r.phone,r.company,r.status]);
 else if(p==="leads") tablePage("leads",["ID","Name","Company","Source","Status","Expected Value"],state.leads,r=>[r.id,r.name,r.company,r.source,r.status,"₹"+r.value.toLocaleString()]);
 else if(p==="opportunities") tablePage("opportunities",["ID","Opportunity","Customer","Stage","Amount","Probability","Weighted"],state.opportunities,r=>[r.id,r.name,r.customer,r.stage,"₹"+r.amount.toLocaleString(),r.probability+"%","₹"+Math.round(r.amount*r.probability/100).toLocaleString()]);
 else if(p==="followups") tablePage("followups",["ID","Subject","Customer","Date","Status"],state.followups,r=>[r.id,r.subject,r.customer,r.date,r.status]);
 else if(p==="activities") tablePage("activities",["ID","Type","Subject","Date","Status"],state.activities,r=>[r.id,r.type,r.subject,r.date,r.status]);
 else if(p==="users") tablePage("users",["Name","Email","Role","Status"],state.users,r=>[r.name,r.email,r.role,r.status]);
 else if(p==="audit") tablePage("audit",["Time","User","Action","Module","Result"],state.audit,r=>[r.time,r.user,r.action,r.module,r.result]);
 else if(p==="reports") reports();
}

function dashboard(){
 const pipeline=state.opportunities.filter(x=>x.stage!=="Lost").reduce((s,x)=>s+x.amount,0);
 pageContent.innerHTML+=`<div class="row g-3 mb-4">
 ${kpi("Total Customers",state.customers.length,"bi-people")}
 ${kpi("Total Leads",state.leads.length,"bi-person-lines-fill")}
 ${kpi("Open Opportunities",state.opportunities.filter(x=>!["Won","Lost"].includes(x.stage)).length,"bi-graph-up-arrow")}
 ${kpi("Pipeline Value","₹"+pipeline.toLocaleString(),"bi-currency-rupee")}
 </div>
 <div class="row g-3"><div class="col-lg-7"><div class="card p-3"><h5>Lead Status</h5><canvas id="leadChart" height="120"></canvas></div></div>
 <div class="col-lg-5"><div class="card p-3"><h5>Opportunity Pipeline</h5><canvas id="oppChart" height="150"></canvas></div></div></div>
 <div class="card p-3 mt-3"><h5>Upcoming Follow-Ups</h5>${state.followups.map(f=>`<div class="d-flex justify-content-between border-bottom py-2"><span><b>${f.subject}</b><br><small class="text-muted">${f.customer}</small></span><span class="badge badge-soft align-self-center">${f.date}</span></div>`).join("")}</div>`;
 setTimeout(drawCharts,50);
}
function kpi(t,v,i){return `<div class="col-md-6 col-xl-3"><div class="card kpi p-3"><div class="d-flex justify-content-between align-items-center"><div><div class="text-muted small">${t}</div><div class="fs-4 fw-bold mt-1">${v}</div></div><div class="kpi-icon"><i class="bi ${i}"></i></div></div></div></div>`}
function drawCharts(){chart1?.destroy();chart2?.destroy();chart1=new Chart(document.getElementById("leadChart"),{type:"bar",data:{labels:["New","Contacted","Qualified","Lost","Converted"],datasets:[{label:"Leads",data:["New","Contacted","Qualified","Lost","Converted"].map(s=>state.leads.filter(x=>x.status===s).length)}]},options:{responsive:true,plugins:{legend:{display:false}}}});chart2=new Chart(document.getElementById("oppChart"),{type:"doughnut",data:{labels:["Qualification","Proposal","Negotiation","Won","Lost"],datasets:[{data:["Qualification","Proposal","Negotiation","Won","Lost"].map(s=>state.opportunities.filter(x=>x.stage===s).length)}]},options:{responsive:true}})}

function tablePage(type,headers,rows,rowFn){
 pageContent.innerHTML+=`<div class="card p-3"><div class="d-flex justify-content-between mb-3"><input class="form-control search-box" placeholder="Search..." oninput="filterTable(this,'${type}Table')"><span class="text-muted small align-self-center">${rows.length} records</span></div><div class="table-responsive"><table id="${type}Table" class="table table-hover align-middle"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${rowFn(r).map((c,i)=>`<td>${i===headers.length-1&&["Active","Inactive","Planned","Completed","Qualified","New","Contacted","Won"].includes(c)?`<span class="badge badge-soft">${c}</span>`:c}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
}
function filterTable(input,id){const q=input.value.toLowerCase();document.querySelectorAll("#"+id+" tbody tr").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q)?"":"none");}

function reports(){pageContent.innerHTML+=`<div class="row g-3"><div class="col-lg-7"><div class="report-box"><h4>Sales Pipeline Report</h4><p class="text-white-50">Stage-wise opportunity value</p><h2>₹${state.opportunities.reduce((s,x)=>s+x.amount,0).toLocaleString()}</h2><hr>${state.opportunities.map(x=>`<div class="d-flex justify-content-between py-2"><span>${x.stage}</span><b>₹${x.amount.toLocaleString()}</b></div>`).join("")}</div></div><div class="col-lg-5"><div class="card p-4"><h5>Report Summary</h5><p>Customers: <b>${state.customers.length}</b></p><p>Leads: <b>${state.leads.length}</b></p><p>Opportunities: <b>${state.opportunities.length}</b></p><p>Follow-Ups: <b>${state.followups.length}</b></p><button class="btn btn-outline-primary" onclick="alert('Demo export: report data prepared successfully.')">Export Report</button></div></div></div>`}

function openAdd(type){
 const labels={customers:["Customer Name","Email","Phone","Company"],leads:["Lead Name","Company","Source","Expected Value"],opportunities:["Opportunity Name","Customer","Amount","Probability"],followups:["Subject","Customer","Follow-Up Date"],activities:["Activity Type","Subject","Activity Date"]};
 modalTitle.textContent="Add "+type.slice(0,-1);modalBody.innerHTML=labels[type].map((l,i)=>`<div class="mb-3"><label class="form-label">${l}</label><input class="form-control" name="f${i}" type="${l.includes("Date")||l.includes("date")?"date":l.includes("Value")||l==="Amount"||l==="Probability"?"number":"text"}" ${l==="Probability"?'min="0" max="100"':""} required></div>`).join("")+`<input type="hidden" name="recordType" value="${type}">`;new bootstrap.Modal(addModal).show();
}
function saveRecord(e){e.preventDefault();const fd=new FormData(e.target),type=fd.get("recordType"),vals=[...fd.entries()].filter(x=>x[0].startsWith("f")).map(x=>x[1]);try{
 if(type==="customers"){if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(vals[1]))throw new Error("Enter a valid email address.");if(!/^\\d{10}$/.test(vals[2]))throw new Error("Enter a valid 10-digit phone number.");state.customers.push({id:"C"+String(state.customers.length+1).padStart(3,"0"),name:vals[0],email:vals[1],phone:vals[2],company:vals[3],status:"Active"});}
 if(type==="leads")state.leads.push({id:"L"+String(state.leads.length+1).padStart(3,"0"),name:vals[0],company:vals[1],source:vals[2],status:"New",value:Number(vals[3])});
 if(type==="opportunities"){if(Number(vals[2])<=0)throw new Error("Opportunity Amount must be greater than 0.");if(Number(vals[3])<0||Number(vals[3])>100)throw new Error("Probability must be between 0 and 100.");state.opportunities.push({id:"O"+String(state.opportunities.length+1).padStart(3,"0"),name:vals[0],customer:vals[1],stage:"Qualification",amount:Number(vals[2]),probability:Number(vals[3])});}
 if(type==="followups"){const today=new Date().toISOString().slice(0,10);if(vals[2]<today)throw new Error("Follow-up date cannot be earlier than today.");state.followups.push({id:"F"+String(state.followups.length+1).padStart(3,"0"),subject:vals[0],customer:vals[1],date:vals[2],status:"Planned"});}
 if(type==="activities")state.activities.push({id:"A"+String(state.activities.length+1).padStart(3,"0"),type:vals[0],subject:vals[1],date:vals[2],status:"Planned"});
 bootstrap.Modal.getInstance(addModal).hide();render();
}catch(err){alert(err.message)}}

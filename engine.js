(function(root){
const limits={2024:{cpp:3867.50,cpp2:188,ei:1049.12,ympe:68500,yampe:73200,mie:63200,rate:.0166},2025:{cpp:4034.10,cpp2:396,ei:1077.48,ympe:71300,yampe:81200,mie:65700,rate:.0164}};
const schemas={T4:{14:'Employment income',22:'Income tax deducted',16:'CPP contributions','16A':'CPP2 contributions',18:'EI premiums',24:'EI insurable earnings',26:'CPP pensionable earnings',20:'Employee RPP contributions',52:'Pension adjustment',50:'Pension registration number',40:'Taxable benefits',45:'Dental coverage code'},T1:{15000:'Total income',23300:'Deductions before adjustments',23400:'Net income before adjustments',23500:'Social benefits repayment',23600:'Net income',25700:'Taxable-income deductions',26000:'Taxable income',43500:'Total payable',48200:'Total credits',48400:'Refund',48500:'Balance owing'},T2:{300:'Net income for income tax purposes',deductions:'Total deductions from lines 311–352 (confirm from return)',360:'Taxable income'},Paystub:{gross:'Current gross earnings',deductions:'Current total deductions',net:'Current net pay',hours:'Regular hours',rate:'Regular hourly rate',regular:'Regular earnings',ytdGross:'Year-to-date gross',ytdDeductions:'Year-to-date deductions',ytdNet:'Year-to-date net'}};
function amount(v){if(v===undefined||v===null||String(v).trim()==='')return null;let s=String(v).trim();if(!/^\(?-?\$?\s*\d[\d, ]*(?:\.\d{1,2})?\)?$/.test(s))return NaN;let n=Number(s.replace(/[$, ()]/g,''));return s.startsWith('(')?-n:n;}
function money(v){return Number(v).toLocaleString('en-CA',{style:'currency',currency:'CAD'});}
function check(doc){const out=[];const f=doc.fields;const a=k=>amount(f[k]);const add=(status,title,detail)=>out.push({status,title,detail});
function eq(title,keys,calc,target){if([...keys,target].some(k=>a(k)===null)){add('review',title,'Missing input. Blank values are not treated as zero.');return;}if([...keys,target].some(k=>!Number.isFinite(a(k))))return;const expected=Math.round(calc(...keys.map(a))*100)/100;const actual=a(target);add(Math.abs(expected-actual)<=.02?'pass':'mismatch',title,`Expected ${money(expected)}; reported ${money(actual)}; difference ${money(actual-expected)}.`);}
Object.entries(f).forEach(([k,v])=>{if(v!==''&& !Number.isFinite(a(k)))add('mismatch',schemas[doc.type][k]||k,'Invalid number format.');});
if(!doc.confirmed)add('review','Confirm extracted values','Compare every value with the PDF before relying on the results.');
if(doc.type==='T4'){
 const l=limits[doc.year];if(!l)add('review','Year-specific contribution rules','Automatic CPP/EI rules cover 2024 and 2025 only.');
 else if(!doc.province)add('review','Province required','Confirm the province of employment before applying CPP and EI rules.');
 else if(doc.province==='QC')add('review','Quebec contribution rules','QPP and Quebec EI rules require a separate calculation; federal CPP rules were not applied.');
 else {
 for(const [k,max,label] of [['16',l.cpp,'CPP'],['16A',l.cpp2,'CPP2'],['18',l.ei,'EI']]){if(a(k)!==null&&Number.isFinite(a(k)))add(a(k)>max+.02?'mismatch':'pass',label+' annual ceiling',`${money(a(k))} compared with maximum ${money(max)}. Below the ceiling does not by itself verify the deduction.`);}
 eq('EI premium arithmetic',['24'],v=>v*l.rate,'18');
 eq('CPP2 arithmetic',['26'],v=>Math.max(0,Math.min(v,l.yampe)-l.ympe)*.04,'16A');
 if(a('26')!==null&&a('26')>=l.ympe&&a('16')!==null)add(Math.abs(a('16')-l.cpp)<=.02?'pass':'review','CPP at maximum earnings',`Full-year, non-exempt expected maximum ${money(l.cpp)}; reported ${money(a('16'))}. Age, election or part-year eligibility can change this.`);
 if(a('24')!==null&&a('24')>l.mie+.02)add('mismatch','EI earnings ceiling',`Box 24 exceeds ${money(l.mie)}.`);
 if(a('26')!==null&&a('26')>l.yampe+.02)add('mismatch','CPP earnings ceiling',`Box 26 exceeds ${money(l.yampe)}.`);
 }
 if(f['50'])add(/^\d{7}$/.test(f['50'])?'pass':'mismatch','Pension registration number format','Expected seven digits, including any leading zero. Format does not verify registration.');
 if(f['45'])add(/^[1-5]$/.test(f['45'])?'pass':'mismatch','Dental coverage code','Valid codes are 1–5. Actual coverage needs employer confirmation.');
 add('review','Income tax and pension amounts','Box 22 must equal actual payroll withholding. Boxes 20 and 52 require pension records; they do not have to match.');
 add('review','Code 40 included in box 14','Taxable benefits should already be included in employment income. Inclusion cannot be proven without the earnings breakdown.');
}else if(doc.type==='T1'){
 eq('Income less deductions',['15000','23300'],(x,y)=>Math.max(0,x-y),'23400');
 eq('Net income',['23400','23500'],(x,y)=>Math.max(0,x-y),'23600');
 eq('Taxable income',['23600','25700'],(x,y)=>Math.max(0,x-y),'26000');
 if(a('43500')!==null&&a('48200')!==null){if(a('43500')>a('48200'))eq('Balance owing',['43500','48200'],(x,y)=>x-y,'48500');else eq('Refund',['48200','43500'],(x,y)=>x-y,'48400');}
 add('review','Return completeness','These checks cover summary arithmetic only. Income components, schedules, credits, residency and final tax liability need a full tax review.');
}else if(doc.type==='T2'){
 eq('Taxable income',['300','deductions'],(x,y)=>Math.max(0,x-y),'360');
 add('review','Corporate tax and schedules','Confirm the deductions total from lines 311–352. Schedule 1 adjustments, corporate tax, small business deduction, losses and provincial schedules are not recalculated.');
}else{
 eq('Current gross-to-net',['gross','deductions'],(x,y)=>x-y,'net');
 eq('Regular earnings',['hours','rate'],(x,y)=>x*y,'regular');
 eq('Year-to-date gross-to-net',['ytdGross','ytdDeductions'],(x,y)=>x-y,'ytdNet');
 add('review','Withholding and deduction basis','Exact tax/CPP/EI deductions require province, pay frequency, pay date, TD1 claims, taxable benefits, exemptions and prior year-to-date deductions.');
}
if(doc.postal)add(/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(doc.postal)?'pass':'mismatch','Canadian postal code format','Format check only; it does not establish that the address exists.');
if(doc.expectedName&&doc.name)add(normal(doc.expectedName)===normal(doc.name)?'pass':'mismatch','Name against reference',`Document: ${doc.name}; reference: ${doc.expectedName}.`);
if(doc.expectedAddress&&doc.address)add(normal(doc.expectedAddress)===normal(doc.address)?'pass':'mismatch','Address against reference',`Document: ${doc.address}; reference: ${doc.expectedAddress}.`);
if(!doc.expectedName||!doc.expectedAddress)add('review','Spelling and address reference','Provide the correct name and address to check spelling. Proper names and street names cannot be verified by a general spellchecker.');
return out.map(r=>!doc.confirmed&&r.status==='pass'?{...r,status:'review',detail:'Tentative: '+r.detail}:r);
}
function normal(s){return String(s).normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function rows(items){const sorted=items.filter(i=>i.str.trim()).map(i=>({...i,x:i.transform[4],y:i.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);const rs=[];for(const i of sorted){let row=rs.find(r=>Math.abs(r.y-i.y)<3);if(!row){row={y:i.y,items:[]};rs.push(row);}row.items.push(i);}for(const r of rs){r.items.sort((a,b)=>a.x-b.x);r.text=r.items.map(i=>i.str).join(' ');}return rs;}
function candidates(rs,type){const result={};if(type==='T4'){
 const tokens=rs.flatMap(r=>r.items.map(i=>({...i,y:i.y??r.y,evidence:r.text})));
 for(const label of tokens){const key=label.str.trim();if(!Object.hasOwn(schemas.T4,key))continue;const integer=key==='50'||key==='45';const values=tokens.filter(t=>t.x-label.x>8&&t.x-label.x<145&&label.y-t.y>=-3&&label.y-t.y<18&&(integer?/^\d+$/:/^\d[\d,]*\.\d{2}$/).test(t.str.trim())).sort((a,b)=>Math.abs(label.y-a.y)-Math.abs(label.y-b.y)||a.x-b.x);const value=values[0];if(value&&(key!=='50'||value.str.trim().length>=6)&&(key!=='45'||/^[1-5]$/.test(value.str.trim())))(result[key]??=[]).push({value:value.str.trim(),evidence:value.evidence});}
}else if(type==='T1'||type==='T2'){
 for(const row of rs)for(const key of Object.keys(schemas[type])){const re=new RegExp('(?:^|\\s)'+key+'\\s+([($-]?[\\d,]+(?:\\.\\d{2})?)(?:\\s|$)');const m=row.text.match(re);if(m)(result[key]??=[]).push({value:m[1],evidence:row.text});}
}else{
 const labels={gross:/\b(?:gross pay|gross earnings|total earnings)\b/i,deductions:/\btotal deductions\b/i,net:/\b(?:net pay|net deposit)\b/i};
 for(const row of rs)for(const [key,re]of Object.entries(labels))if(re.test(row.text)){const m=row.text.slice(row.text.search(re)).match(/\$?\s*([\d,]+\.\d{2})/);if(m)(result[key]??=[]).push({value:m[1],evidence:row.text});}
}return result;}
const api={limits,schemas,amount,money,check,normal,rows,candidates};if(typeof module!=='undefined')module.exports=api;else root.Checker=api;
})(globalThis);

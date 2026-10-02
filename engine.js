(function(root){
const limits={2024:{cpp:3867.50,cpp2:188,ei:1049.12,ympe:68500,yampe:73200,mie:63200,rate:.0166},2025:{cpp:4034.10,cpp2:396,ei:1077.48,ympe:71300,yampe:81200,mie:65700,rate:.0164}};
const schemas={T4:{14:'Employment income',22:'Income tax deducted',16:'CPP contributions','16A':'CPP2 contributions',18:'EI premiums',24:'EI insurable earnings',26:'CPP pensionable earnings',20:'Employee RPP contributions',52:'Pension adjustment',50:'Pension registration number',40:'Taxable benefits',45:'Dental coverage code'},T1:{15000:'Total income',23300:'Deductions before adjustments',23400:'Net income before adjustments',23500:'Social benefits repayment',23600:'Net income',25700:'Taxable-income deductions',26000:'Taxable income',43500:'Total payable',48200:'Total credits',48400:'Refund',48500:'Balance owing'},T2:{300:'Net income for income tax purposes',deductions:'Total deductions from lines 311-352 (confirm from return)',360:'Taxable income'},Paystub:{gross:'Current gross earnings',deductions:'Current total deductions',net:'Current net pay',hours:'Regular hours',rate:'Regular hourly rate',regular:'Regular earnings',ytdGross:'Year-to-date gross',ytdDeductions:'Year-to-date deductions',ytdNet:'Year-to-date net'}};
schemas.Unknown={};
function cents(v){
 if(v===undefined||v===null||String(v).trim()==='')return null;
 let s=String(v).trim(),negative=false;
 if(s.startsWith('(')&&s.endsWith(')')){negative=true;s=s.slice(1,-1);}
 else if(s.startsWith('-')){negative=true;s=s.slice(1);}
 if(s.startsWith('$'))s=s.slice(1).trimStart();
 if(!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,3}(?: \d{3})+)(?:\.\d{1,2})?$/.test(s))return NaN;
 const [whole,decimal='']=s.replace(/[, ]/g,'').split('.');
 if(whole.length>14)return NaN;
 const n=BigInt(whole)*100n+BigInt(decimal.padEnd(2,'0'));
 return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(negative?-n:n):NaN;
}
function amount(v){const n=cents(v);return n===null?null:n/100;}
function detect(text){
 const matches=[['T4',/Statement of Remuneration|\bT4\b/i],['T2',/Corporation Income Tax|\bT2\b/i],['T1',/Income Tax and Benefit Return|\bT1\b/i],['Paystub',/\b(?:pay\s*stub|pay statement|earnings statement|net pay|net deposit)\b/i]].filter(([,re])=>re.test(text));
 return matches.length===1?matches[0][0]:'Unknown';
}
function detectYear(text){const years=[...new Set(text.match(/\b20\d{2}\b/g)||[])];return years.length===1?years[0]:'';}
function money(v){return Number(v).toLocaleString('en-CA',{style:'currency',currency:'CAD'});}
function check(doc){const out=[];const f=doc.fields||{};const a=k=>amount(f[k]);const add=(status,title,detail,fieldKeys)=>out.push({status,title,detail,...(fieldKeys?{fieldKeys}:{})});
function eq(title,keys,calc,target,conditional=false){const fieldKeys=[...keys,target];if(fieldKeys.some(k=>a(k)===null)){add('review',title,'Missing input. Blank values are not treated as zero.',fieldKeys);return;}if(fieldKeys.some(k=>!Number.isFinite(a(k)))){add('review',title,'Not calculated: invalid input format.',fieldKeys);return;}const expected=calc(...keys.map(k=>cents(f[k])));const actual=cents(f[target]);if(!Number.isSafeInteger(expected)){add('review',title,'Not calculated: result exceeds supported precision.',fieldKeys);return;}add(conditional?'review':expected===actual?'pass':'mismatch',title,`Expected ${money(expected/100)}; reported ${money(actual/100)}; difference ${money((actual-expected)/100)}.${conditional?' Annual comparison only: payroll rounding, eligibility, exemptions, adjustments and actual withheld amounts require payroll records. This does not establish a slip error.':''}`,fieldKeys);}
Object.entries(f).forEach(([k,v])=>{if(a(k)!==null&&!Number.isFinite(a(k)))add('mismatch',schemas[doc.type]?.[k]||k,'Invalid number format or unsupported precision.',[k]);});
if(!doc.confirmed)add('review','Confirm extracted values','Compare every value with the PDF before relying on the results.');
if(doc.type==='T4'){
 const l=Object.hasOwn(limits,doc.year)?limits[doc.year]:null;if(!l)add('review','Year-specific contribution rules','Automatic CPP/EI rules cover 2024 and 2025 only.');
 else if(!/^(ON|BC|AB|SK|MB|NB|NS|PE|NL|QC|YT|NT|NU)$/.test(doc.province||''))add('review','Province required','Confirm the province of employment from box 10, not the mailing address, before applying contribution rules.');
 else if(doc.province==='QC')add('review','Quebec contribution rules','QPP and Quebec EI rules require a separate calculation; federal CPP rules were not applied.');
 else {
 for(const [k,max,label] of [['16',l.cpp,'CPP'],['16A',l.cpp2,'CPP2'],['18',l.ei,'EI']]){if(a(k)===null)add('review',label+' annual ceiling','Missing contribution amount.',[k]);else if(Number.isFinite(a(k)))add(a(k)<0?'mismatch':a(k)>max?'review':'pass',label+' annual ceiling',`${money(a(k))} compared with maximum ${money(max)}. Negative contributions are invalid. An excess requires payroll review: a slip may correctly report unreimbursed overdeductions. Below the ceiling does not verify the deduction.`,[k]);}
 eq('EI premium arithmetic',['24'],v=>Math.round(v*Math.round(l.rate*10000)/10000),'18',true);
 eq('CPP2 arithmetic',['26'],v=>Math.round(Math.max(0,Math.min(v,Math.round(l.yampe*100))-Math.round(l.ympe*100))*4/100),'16A',true);
 if(a('26')!==null&&a('26')>=l.ympe&&a('16')!==null)add('review','CPP at maximum earnings',`Full-year, non-exempt expected maximum ${money(l.cpp)}; reported ${money(a('16'))}. Age, election or part-year eligibility can change this.`);
 if(a('24')!==null&&(a('24')<0||a('24')>l.mie))add('mismatch','EI earnings ceiling',`Box 24 must be between zero and ${money(l.mie)}.`,['24']);
 if(a('26')!==null&&(a('26')<0||a('26')>l.yampe))add('mismatch','CPP earnings ceiling',`Box 26 must be between zero and ${money(l.yampe)}.`,['26']);
 }
 if(f['50'])add(/^\d{7}$/.test(f['50'])?'pass':'mismatch','Pension registration number format','Expected seven digits, including any leading zero. Format does not verify registration.');
 if(f['45'])add(/^[1-5]$/.test(f['45'])?'pass':'mismatch','Dental coverage code','Valid codes are 1-5. Actual coverage needs employer confirmation.');
 add('review','Income tax and pension amounts','Box 22 must equal actual payroll withholding. Boxes 20 and 52 require pension records; they do not have to match.');
 add('review','Code 40 included in box 14','Taxable benefits should already be included in employment income. Inclusion cannot be proven without the earnings breakdown.');
}else if(doc.type==='T1'){
 eq('Income less deductions',['15000','23300'],(x,y)=>Math.max(0,x-y),'23400');
 eq('Net income',['23400','23500'],(x,y)=>Math.max(0,x-y),'23600');
 eq('Taxable income',['23600','25700'],(x,y)=>Math.max(0,x-y),'26000');
 if(Number.isFinite(a('43500'))&&Number.isFinite(a('48200'))){const owing=a('43500')>a('48200');eq(owing?'Balance owing':'Refund',owing?['43500','48200']:['48200','43500'],(x,y)=>x-y,owing?'48500':'48400');const opposite=owing?'48400':'48500';if(Number.isFinite(a(opposite))&&a(opposite)!==0)add('mismatch','Refund/balance contradiction','The opposite refund/balance field is nonzero.',[opposite]);}else add('review','Refund or balance','Missing or invalid total payable/credits; final balance was not calculated.',['43500','48200']);
 add('review','Return completeness','These checks cover summary arithmetic only. Income components, schedules, credits, residency and final tax liability need a full tax review.');
}else if(doc.type==='T2'){
 eq('Taxable income',['300','deductions'],(x,y)=>Math.max(0,x-y),'360');
 add('review','Corporate tax and schedules','Confirm the deductions total from lines 311-352. Schedule 1 adjustments, corporate tax, small business deduction, losses and provincial schedules are not recalculated.');
}else if(doc.type==='Paystub'){
 eq('Current gross-to-net',['gross','deductions'],(x,y)=>x-y,'net');
 eq('Regular earnings',['hours','rate'],(x,y)=>{const product=BigInt(x)*BigInt(y);return Number((product<0n?-1n:1n)*((product<0n?-product:product)+50n)/100n);},'regular');
 eq('Year-to-date gross-to-net',['ytdGross','ytdDeductions'],(x,y)=>x-y,'ytdNet');
 add('review','Withholding and deduction basis','Exact tax/CPP/EI deductions require province, pay frequency, pay date, TD1 claims, taxable benefits, exemptions and prior year-to-date deductions.');
}else add('review','Document type required','Unrecognized or mixed document. Select a supported type only after checking its contents; no financial rules applied.');
if(doc.postal)add(/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(doc.postal)?'pass':'mismatch','Canadian postal code format','Format check only; it does not establish that the address exists.');
if(doc.expectedName)add(!doc.name?'review':normal(doc.expectedName)===normal(doc.name)?'pass':'review','Name against reference',doc.name?`Document: ${doc.name}; reference: ${doc.expectedName}. Differences require confirmation; spelling, ordering and legal identity are not inferred.`:'Document name is missing.');
if(doc.expectedAddress)add(!doc.address?'review':normal(doc.expectedAddress)===normal(doc.address)?'pass':'review','Address against reference',doc.address?`Document: ${doc.address}; reference: ${doc.expectedAddress}. Confirm differences, abbreviations or a move.`:'Document address is missing.');
if(!doc.expectedName||!doc.expectedAddress)add('review','Spelling and address reference','Provide the correct name and address to check spelling. Proper names and street names cannot be verified by a general spellchecker.');
return out.map(r=>!doc.confirmed&&r.status!=='review'?{...r,status:'review',detail:'Tentative: '+r.detail}:r);
}
function normal(s){return String(s).normalize('NFKC').toUpperCase().trim().replace(/\s+/g,' ');}
function rows(items){const sorted=items.filter(i=>i.str.trim()).map(i=>({...i,x:i.transform[4],y:i.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);const rs=[];for(const i of sorted){let row=rs.find(r=>Math.abs(r.y-i.y)<3);if(!row){row={y:i.y,items:[]};rs.push(row);}row.items.push(i);}for(const r of rs){r.items.sort((a,b)=>a.x-b.x);r.text=r.items.map(i=>i.str).join(' ');}return rs;}
function candidates(rs,type){const result={};if(type==='T4'){
 const tokens=rs.flatMap(r=>r.items.map(i=>({...i,y:i.y??r.y,evidence:r.text})));
 for(const label of tokens){const key=label.str.trim();if(!Object.hasOwn(schemas.T4,key))continue;const integer=key==='50'||key==='45';const values=tokens.filter(t=>t.x-label.x>8&&t.x-label.x<145&&label.y-t.y>=-3&&label.y-t.y<18&&(integer?/^\d+$/:/^\d[\d,]*\.\d{2}$/).test(t.str.trim())).sort((a,b)=>Math.abs(label.y-a.y)-Math.abs(label.y-b.y)||a.x-b.x);const value=values[0];if(value)(result[key]??=[]).push({value:value.str.trim(),evidence:value.evidence});}
}else if(type==='T1'||type==='T2'){
 for(const row of rs)for(const key of Object.keys(schemas[type])){const re=new RegExp('(?:^|\\s)'+key+'\\s+([($-]?[\\d,]+(?:\\.\\d{2})?)(?:\\s|$)');const m=row.text.match(re);if(m)(result[key]??=[]).push({value:m[1],evidence:row.text});}
}else if(type==='Paystub'){
 const labels={gross:/\b(?:gross pay|gross earnings|total earnings)\b/i,deductions:/\btotal deductions\b/i,net:/\b(?:net pay|net deposit)\b/i};
 for(const row of rs)for(const [key,re]of Object.entries(labels))if(re.test(row.text)){const m=row.text.slice(row.text.search(re)).match(/\$?\s*([\d,]+\.\d{2})/);if(m)(result[key]??=[]).push({value:m[1],evidence:row.text});}
}return result;}
const api={limits,schemas,amount,cents,money,check,normal,rows,candidates,detect,detectYear};if(typeof module!=='undefined')module.exports=api;else root.Checker=api;
})(globalThis);

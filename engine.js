(function(root){
const limits={2024:{cpp:3867.50,cpp2:188,ei:1049.12,ympe:68500,yampe:73200,mie:63200,rate:.0166},2025:{cpp:4034.10,cpp2:396,ei:1077.48,ympe:71300,yampe:81200,mie:65700,rate:.0164},2026:{cpp:4230.45,cpp2:416,ei:1123.07,ympe:74600,yampe:85000,mie:68900,rate:.0163}};
const schemas={T4:{14:'Employment income',22:'Income tax deducted',16:'CPP contributions','16A':'CPP2 contributions',18:'EI premiums',24:'EI insurable earnings',26:'CPP pensionable earnings',20:'Employee RPP contributions',52:'Pension adjustment',50:'Pension registration number',40:'Taxable benefits',45:'Dental coverage code'},T1:{15000:'Total income',23300:'Deductions before adjustments',23400:'Net income before adjustments',23500:'Social benefits repayment',23600:'Net income',25700:'Taxable-income deductions',26000:'Taxable income',43500:'Total payable',48200:'Total credits',48400:'Refund',48500:'Balance owing'},T2:{300:'Net income for income tax purposes',deductions:'Total deductions from lines 311–352 (confirm from return)',360:'Taxable income'},Paystub:{gross:'Current gross earnings',deductions:'Current total deductions',net:'Current net pay',hours:'Regular hours',rate:'Regular hourly rate',regular:'Regular earnings',ytdGross:'Year-to-date gross',ytdDeductions:'Year-to-date deductions',ytdNet:'Year-to-date net'}};
function amount(v){if(v===undefined||v===null||String(v).trim()==='')return null;let s=String(v).trim(),negative=false;if(s.startsWith('(')&&s.endsWith(')')){negative=true;s=s.slice(1,-1).trim();}else if(s.startsWith('-')){negative=true;s=s.slice(1).trim();}s=s.replace(/^\$\s*/, '');if(!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,3}(?: \d{3})+)(?:\.\d{1,2})?$/.test(s))return NaN;const n=Number(s.replace(/[, ]/g,''));return Number.isFinite(n)?(negative?-n:n):NaN;}
function normal(s){return String(s).normalize('NFKC').toUpperCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function detect(text,file=''){for(const [type,re] of [['T4',/Statement of Remuneration|(?:^|\n)\s*T4\b/i],['T2',/Corporation Income Tax|(?:^|\n)\s*T2\b/i],['T1',/Income Tax and Benefit Return|(?:^|\n)\s*T1\b/i]])if(re.test(text))return type;if(/\b(?:gross pay|gross earnings|total earnings|net pay|net deposit)\b/i.test(text))return 'Paystub';const m=file.replace(/_/g,' ').match(/\b(T4|T2|T1)\b/i);return m?m[1].toUpperCase():'Paystub';}
function detectYear(text,file=''){const explicit=[...text.matchAll(/\b(?:tax(?:ation)? year|pay year|year|ann[eé]e)\s*[:\-]?\s*(20\d{2})\b/gi)].map(m=>m[1]);const source=explicit.length?explicit:[...text.matchAll(/\b20\d{2}\b(?![.,]\d)/g)].map(m=>m[0]);const values=[...new Set(source.length?source:(file.replace(/_/g,' ').match(/\b20\d{2}\b/g)||[]))];return values.length===1?values[0]:'';}
function candidateKey(key,value){return key==='50'?String(value).trim():amount(value);}
function money(v){return Number(v).toLocaleString('en-CA',{style:'currency',currency:'CAD'});}
function check(doc){const out=[];const f=doc.fields;const a=k=>amount(f[k]);const add=(status,title,detail,fieldKeys)=>out.push({status,title,detail,...(fieldKeys?{fieldKeys}:{})});
const signed=doc.type==='T1'?['15000']:doc.type==='T2'?['300']:[];
const valid=k=>Number.isFinite(a(k))&&(a(k)>=0||signed.includes(k));
function eq(title,keys,calc,target,differenceStatus='mismatch'){const all=[...keys,target];if(all.some(k=>a(k)===null)){add('review',title,'Missing input. Blank values are not treated as zero.',all);return;}if(all.some(k=>!valid(k)))return;const expected=Math.round(calc(...keys.map(a))*100)/100;const actual=a(target);add(Math.abs(expected-actual)<.005?'pass':differenceStatus,title,`Expected ${money(expected)}; reported ${money(actual)}; difference ${money(actual-expected)}.${differenceStatus==='review'?' Annual-rate comparison; payroll rounding and contribution eligibility require supporting records.':''}`,all);}
Object.entries(f).forEach(([k,v])=>{if(a(k)===null)return;if(!Number.isFinite(a(k)))add('mismatch',schemas[doc.type][k]||k,'Invalid number format.',[k]);else if(!valid(k))add(doc.type==='Paystub'?'review':'mismatch',schemas[doc.type][k]||k,'Negative amount: check the source and any correction records. This value is not accepted by the ordinary arithmetic checks.',[k]);});
if(!doc.confirmed)add('review','Confirm extracted values','Compare every value with the PDF before relying on the results.');
if(doc.type==='T4'){
 const l=limits[doc.year];if(!l)add('review','Year-specific contribution rules','Automatic CPP/EI rules cover 2024–2026 only.');
 else if(!doc.province)add('review','Province required','Confirm the province of employment before applying CPP and EI rules.');
 else if(doc.province==='QC')add('review','Quebec contribution rules','QPP and Quebec EI rules require a separate calculation; federal CPP rules were not applied.');
 else {
 const months=amount(doc.cppMonths),eligible=Number.isInteger(months)&&months>=0&&months<=12;
 if(months!==null&&!eligible)add('mismatch','CPP pensionable months','Enter a whole number from 0 to 12, or leave unknown.', ['cppMonths']);
 for(const [k,fullMax,label] of [['16',l.cpp,'CPP'],['16A',l.cpp2,'CPP2'],['18',l.ei,'EI']]){const max=k==='18'||!eligible?fullMax:Math.round(fullMax*months/12*100)/100;if(valid(k))add(a(k)-max>.005?'mismatch':'pass',label+' annual ceiling',`${money(a(k))} compared with maximum ${money(max)}${k!=='18'&&eligible?' for '+months+' pensionable months':''}. Below the ceiling does not by itself verify the deduction.`,[k]);}
 eq('EI premium arithmetic',['24'],v=>v*l.rate,'18','review');
 if(!eligible)add('review','CPP2 arithmetic','Confirm CPP pensionable months (0–12). Age, CPT30 elections and disability can change the annual earnings thresholds; 12 months is not assumed.',['16A','26']);
 else eq('CPP2 arithmetic',['26'],v=>Math.max(0,Math.min(v,l.yampe*months/12)-l.ympe*months/12)*.04,'16A','review');
 if(eligible&&valid('26')&&a('26')>=l.ympe*months/12&&valid('16')){const expected=Math.round(l.cpp*months/12*100)/100;add(Math.abs(a('16')-expected)<.005?'pass':'review','CPP at maximum earnings',`Expected ceiling ${money(expected)} for ${months} pensionable months; reported ${money(a('16'))}. Verify per-pay contributions and eligibility.`,['16','26']);}
 if(valid('24')&&a('24')-l.mie>.005)add('mismatch','EI earnings ceiling',`Box 24 exceeds ${money(l.mie)}.`,['24']);
 if(valid('26')&&a('26')-l.yampe>.005)add('mismatch','CPP earnings ceiling',`Box 26 exceeds ${money(l.yampe)}.`,['26']);
 }
 if(f['50'])add(/^\d{7}$/.test(f['50'])?'pass':'mismatch','Pension registration number format','Expected seven digits, including any leading zero. Format does not verify registration.');
 if(f['45'])add(/^[1-5]$/.test(f['45'])?'pass':'mismatch','Dental coverage code','Valid codes are 1–5. Actual coverage needs employer confirmation.');
 add('review','Income tax and pension amounts','Box 22 must equal actual payroll withholding. Boxes 20 and 52 require pension records; they do not have to match.');
 add('review','Code 40 included in box 14','Taxable benefits should already be included in employment income. Inclusion cannot be proven without the earnings breakdown.');
}else if(doc.type==='T1'){
 eq('Income less deductions',['15000','23300'],(x,y)=>Math.max(0,x-y),'23400');
 eq('Net income',['23400','23500'],(x,y)=>Math.max(0,x-y),'23600');
 eq('Taxable income',['23600','25700'],(x,y)=>Math.max(0,x-y),'26000');
 if(valid('43500')&&valid('48200')){if(a('43500')>a('48200')||a('48500')!==null)eq('Balance owing',['43500','48200'],(x,y)=>Math.max(0,x-y),'48500');if(a('48200')>a('43500')||a('48400')!==null)eq('Refund',['48200','43500'],(x,y)=>Math.max(0,x-y),'48400');if(a('43500')===a('48200')&&a('48400')===null&&a('48500')===null)add('review','Refund / balance owing','Expected zero; neither refund nor balance owing was supplied.',['48400','48500']);}
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
if(doc.expectedName)add(!normal(doc.name||'')?'review':normal(doc.expectedName)===normal(doc.name)?'pass':'mismatch','Name against reference',doc.name?`Document: ${doc.name}; reference: ${doc.expectedName}.`:'The document name is missing. Read and confirm it from the source.');
if(doc.expectedAddress)add(!normal(doc.address||'')?'review':normal(doc.expectedAddress)===normal(doc.address)?'pass':'mismatch','Address against reference',doc.address?`Document: ${doc.address}; reference: ${doc.expectedAddress}.`:'The document address is missing. Read and confirm it from the source.');
if(!doc.expectedName||!doc.expectedAddress)add('review','Spelling and address reference','Provide the correct name and address to check spelling. Proper names and street names cannot be verified by a general spellchecker.');
return out.map(r=>!doc.confirmed&&r.status==='pass'?{...r,status:'review',detail:'Tentative: '+r.detail}:r);
}
function rows(items){const sorted=items.filter(i=>i.str.trim()).map(i=>({...i,x:i.transform[4],y:i.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);const rs=[];for(const i of sorted){let row=rs.find(r=>Math.abs(r.y-i.y)<3);if(!row){row={y:i.y,items:[]};rs.push(row);}row.items.push(i);}for(const r of rs){r.items.sort((a,b)=>a.x-b.x);r.text=r.items.map(i=>i.str).join(' ');}return rs;}
function candidates(rs,type){const result={};if(type==='T4'){
 const tokens=rs.flatMap(r=>r.items.map(i=>({...i,y:i.y??r.y,evidence:r.text})));
 for(const label of tokens){const key=label.str.trim();if(!Object.hasOwn(schemas.T4,key))continue;const integer=key==='50'||key==='45';const values=tokens.filter(t=>t.x-label.x>8&&t.x-label.x<145&&label.y-t.y>=-3&&label.y-t.y<18&&(integer?/^\d+$/:/^\(?-?\$?[\d,]+\.\d{2}\)?$/).test(t.str.trim())).sort((a,b)=>Math.abs(label.y-a.y)-Math.abs(label.y-b.y)||a.x-b.x);const value=values[0];if(value&&(key!=='50'||value.str.trim().length>=6))(result[key]??=[]).push({value:value.str.trim(),evidence:value.evidence,rect:rect(value),labelRect:rect(label)});}
}else if(type==='T1'||type==='T2'){
 for(const row of rs)for(const key of Object.keys(schemas[type])){if(key==='deductions')continue;const re=new RegExp('(?:^|\\s)'+key+'\\s+(\\(?-?\\$?\\s*\\d[\\d,]*(?:\\.\\d{1,2})?\\)?)(?=\\s|$)');const m=row.text.match(re);if(m){const label=row.items.find(i=>i.str.trim()===key),value=row.items.find(i=>(!label||i.x>label.x)&&i.str.trim()===m[1].trim());(result[key]??=[]).push({value:m[1].trim(),evidence:row.text,...(value?{rect:rect({...value,y:value.y??row.y})}:{}),...(label?{labelRect:rect({...label,y:label.y??row.y})}:{})});}}
}else{
 const labels={gross:/\b(?:gross pay|gross earnings|total earnings)\b/i,deductions:/\btotal deductions\b/i,net:/\b(?:net pay|net deposit)\b/i};
 for(const row of rs)for(const [key,re]of Object.entries(labels))if(re.test(row.text)){const labelAt=row.text.search(re),values=[...row.text.slice(labelAt).matchAll(/\(?-?\$?\s*\d[\d,]*\.\d{2}\)?/g)],isYtd=values.length===1&&/\b(?:ytd|year[ -]to[ -]date)\b/i.test(row.text)&&!/\bcurrent\b/i.test(row.text),target=isYtd?'ytd'+key[0].toUpperCase()+key.slice(1):key;for(const m of values){const value=m[0].trim(),item=row.items.find(i=>i.str.trim()===value);(result[target]??=[]).push({value,evidence:row.text,...(item?{rect:rect({...item,y:item.y??row.y})}:{})});}}
}return result;}
function rect(item){return{x:item.x,y:item.y,width:item.width||Math.max(5,item.str.length*5),height:item.height||10};}
const api={limits,schemas,amount,money,check,normal,rows,candidates,detect,detectYear,candidateKey};if(typeof module!=='undefined')module.exports=api;else root.Checker=api;
})(globalThis);


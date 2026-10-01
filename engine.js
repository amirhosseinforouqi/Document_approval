(function(root){
const limits={2024:{cpp:3867.50,cpp2:188,ei:1049.12,ympe:68500,yampe:73200,mie:63200,rate:.0166},2025:{cpp:4034.10,cpp2:396,ei:1077.48,ympe:71300,yampe:81200,mie:65700,rate:.0164},2026:{cpp:4230.45,cpp2:416,ei:1123.07,ympe:74600,yampe:85000,mie:68900,rate:.0163}};
const schemas={T4:{14:'Employment income',22:'Income tax deducted',16:'CPP contributions','16A':'CPP2 contributions',18:'EI premiums',24:'EI insurable earnings',26:'CPP pensionable earnings',20:'Employee RPP contributions',52:'Pension adjustment',50:'Pension registration number',40:'Taxable benefits',45:'Dental coverage code'},T1:{15000:'Total income',23300:'Deductions before adjustments',23400:'Net income before adjustments',23500:'Social benefits repayment',23600:'Net income',25700:'Taxable-income deductions',26000:'Taxable income',43500:'Total payable',48200:'Total credits',48400:'Refund',48500:'Balance owing'},T2:{300:'Net income for income tax purposes',deductions:'Total deductions from lines 311–352 (confirm from return)',360:'Taxable income'},Paystub:{gross:'Current gross earnings',deductions:'Current total deductions',net:'Current net pay',hours:'Regular hours',rate:'Regular hourly rate',regular:'Regular earnings',ytdGross:'Year-to-date gross',ytdDeductions:'Year-to-date deductions',ytdNet:'Year-to-date net'}};
function amount(v){if(v===undefined||v===null||String(v).trim()==='')return null;let s=String(v).trim(),negative=false;if(s.startsWith('(')&&s.endsWith(')')){negative=true;s=s.slice(1,-1).trim();}else if(s.startsWith('-')){negative=true;s=s.slice(1).trim();}s=s.replace(/^\$\s*/, '');if(!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,3}(?: \d{3})+)(?:\.\d{1,2})?$/.test(s))return NaN;const n=Number(s.replace(/[, ]/g,''));return Number.isFinite(n)?(negative?-n:n):NaN;}
function normal(s){return String(s??'').normalize('NFKC').toUpperCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
Object.assign(schemas.T1,{10100:'Employment income',35000:'Federal non-refundable tax credits',61500:'Provincial non-refundable tax credits',42000:'Net federal tax',42800:'Net provincial tax',43700:'Income tax deducted'});
Object.assign(schemas.T2,{700:'Part I tax payable',760:'Net provincial/territorial tax payable',770:'Total tax payable',890:'Total credits'});
schemas.NOA=Object.fromEntries(['15000','23600','26000','35000','61500','42000','42800','43500','43700','48200'].map(k=>[k,schemas.T1[k]]));
schemas.CNOA=Object.fromEntries(['300','360','700','760','770','890'].map(k=>[k,schemas.T2[k]]));
schemas.NOA.assessmentBalance=schemas.CNOA.assessmentBalance='Balance from this assessment (credit is negative)';
schemas.ID={};
Object.assign(schemas.Paystub,{taxableGross:'Current taxable gross',incomeTax:'Current total income tax',cpp:'Current CPP',cpp2:'Current CPP2',ei:'Current EI',rpp:'Current RPP',unionDues:'Current union dues'});
for(const k of ['taxableGross','incomeTax','cpp','cpp2','ei','rpp','unionDues'])schemas.Paystub['ytd'+k[0].toUpperCase()+k.slice(1)]=schemas.Paystub[k].replace('Current','Year-to-date');
function detect(text,file=''){if(/\bnotice of (?:re)?assessment\b|avis de (?:nouvelle )?cotisation/i.test(text))return /\b(?:corporation|corporate|T2)\b|\b(?:\d{9}\s*)?RC\s*\d{4}\b/i.test(text)?'CNOA':'NOA';for(const [type,re] of [['T4',/Statement of Remuneration|(?:^|\n)\s*T4\b/i],['T2',/Corporation Income Tax|(?:^|\n)\s*T2\b/i],['T1',/Income Tax and Benefit Return|(?:^|\n)\s*T1\b/i]])if(re.test(text))return type;if(/\b(?:gross pay|gross earnings|total earnings|net pay|net deposit)\b/i.test(text))return 'Paystub';const m=file.replace(/_/g,' ').match(/\b(CNOA|NOA|T4|T2|T1)\b/i);return m?m[1].toUpperCase():'Paystub';}
function detectYear(text,file=''){const explicit=[...text.matchAll(/\b(?:tax(?:ation)? year|pay year|year|ann[eé]e)\s*[:\-]?\s*(20\d{2})\b/gi)].map(m=>m[1]);const source=explicit.length?explicit:[...text.matchAll(/\b20\d{2}\b(?![.,]\d)/g)].map(m=>m[0]);const values=[...new Set(source.length?source:(file.replace(/_/g,' ').match(/\b20\d{2}\b/g)||[]))];return values.length===1?values[0]:'';}
function candidateKey(key,value){return key==='50'?String(value).trim():amount(value);}
function money(v){return Number(v).toLocaleString('en-CA',{style:'currency',currency:'CAD'});}
function check(doc){const out=[];const f=doc.fields;const a=k=>amount(f[k]);const add=(status,title,detail,fieldKeys)=>out.push({status,title,detail,...(fieldKeys?{fieldKeys}:{})});
const signed=['T1','NOA'].includes(doc.type)?['15000','assessmentBalance']:['T2','CNOA'].includes(doc.type)?['300','assessmentBalance']:[];
const valid=k=>Number.isFinite(a(k))&&(a(k)>=0||signed.includes(k));
function eq(title,keys,calc,target,differenceStatus='mismatch',reviewNote='Annual-rate comparison; payroll rounding and contribution eligibility require supporting records.'){const all=[...keys,target];if(all.some(k=>a(k)===null)){add('review',title,'Missing input. Blank values are not treated as zero.',all);return;}if(all.some(k=>!valid(k)))return;const expected=Math.round(calc(...keys.map(a))*100)/100;const actual=a(target);add(Math.abs(expected-actual)<.005?'pass':differenceStatus,title,`Expected ${money(expected)}; reported ${money(actual)}; difference ${money(actual-expected)}.${differenceStatus==='review'?' '+reviewNote:''}`,all);}
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
}else if(doc.type==='Paystub'){
 eq('Current gross-to-net',['gross','deductions'],(x,y)=>x-y,'net');
 eq('Regular earnings',['hours','rate'],(x,y)=>x*y,'regular');
 eq('Year-to-date gross-to-net',['ytdGross','ytdDeductions'],(x,y)=>x-y,'ytdNet');
 add('review','Withholding and deduction basis','Exact tax/CPP/EI deductions require province, pay frequency, pay date, TD1 claims, taxable benefits, exemptions and prior year-to-date deductions.');
}else if(doc.type==='NOA'||doc.type==='CNOA'){
 const keys=doc.type==='NOA'?['43500','48200']:['770','890'];
 if(keys.some(k=>a(k)!==null)||a('assessmentBalance')!==null)eq('Balance from this assessment',keys,(x,y)=>x-y,'assessmentBalance','review','Assessment adjustments, interest, penalties and offsets require supporting records.');
 add('review','Assessment explanations','Compare with the corresponding return. CRA adjustments, interest, payments and prior balances can explain differences; the account balance or deposit is not the return refund.');
}else if(doc.type==='ID'){
 add('review','Applicant ID reference','Confirm the extracted name and full address against the ID preview before using them as the batch reference. ID numbers are not extracted.');
}
if(doc.postal)add(/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(doc.postal)?'pass':'mismatch','Canadian postal code format','Format check only; it does not establish that the address exists.');
if(doc.expectedName)add(!normal(doc.name||'')?'review':normal(doc.expectedName)===normal(doc.name)?'pass':'mismatch','Name against reference',doc.name?`Document: ${doc.name}; reference: ${doc.expectedName}.`:'The document name is missing. Read and confirm it from the source.');
if(doc.expectedAddress)add(!normal(doc.address||'')?'review':addressKey(doc.expectedAddress)===addressKey(doc.address)?'pass':'mismatch','Address against reference',doc.address?`Document: ${doc.address}; reference: ${doc.expectedAddress}.`:'The document address is missing. Read and confirm it from the source.');
if(!doc.expectedName||!doc.expectedAddress)add('review','Spelling and address reference','Provide the correct name and address to check spelling. Proper names and street names cannot be verified by a general spellchecker.');
return out.map(r=>!doc.confirmed&&r.status==='pass'?{...r,status:'review',detail:'Tentative: '+r.detail}:r);
}
function rows(items){const sorted=items.filter(i=>i.str.trim()).map(i=>({...i,x:i.transform[4],y:i.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);const rs=[];for(const i of sorted){let row=rs.find(r=>Math.abs(r.y-i.y)<3);if(!row){row={y:i.y,items:[]};rs.push(row);}row.items.push(i);}for(const r of rs){r.items.sort((a,b)=>a.x-b.x);r.text=r.items.map(i=>i.str).join(' ');}return rs;}
function t4Candidates(rs){const result={};
 const tokens=rs.flatMap(r=>r.items.map(i=>({...i,y:i.y??r.y,evidence:r.text})));
 for(const label of tokens){const key=label.str.trim();if(!Object.hasOwn(schemas.T4,key))continue;const integer=key==='50'||key==='45';const values=tokens.filter(t=>t.x-label.x>8&&t.x-label.x<145&&label.y-t.y>=-3&&label.y-t.y<18&&(integer?/^\d+$/:/^\(?-?\$?[\d,]+\.\d{2}\)?$/).test(t.str.trim())).sort((a,b)=>Math.abs(label.y-a.y)-Math.abs(label.y-b.y)||a.x-b.x);const value=values[0];if(value&&(key!=='50'||value.str.trim().length>=6))(result[key]??=[]).push({value:value.str.trim(),evidence:value.evidence,rect:rect(value),labelRect:rect(label)});}
return result;}
function rect(item){return{x:item.x,y:item.y,width:item.width||Math.max(5,item.str.length*5),height:item.height||10};}
function addressKey(value){const aliases={ST:'STREET',RD:'ROAD',AVE:'AVENUE',DR:'DRIVE',BLVD:'BOULEVARD',CRES:'CRESCENT',CRT:'COURT',APT:'UNIT',APARTMENT:'UNIT',ONTARIO:'ON',QUEBEC:'QC',ALBERTA:'AB',MANITOBA:'MB',SASKATCHEWAN:'SK'};return normal(value).replace(/\b([A-Z]\d[A-Z]) (\d[A-Z]\d)\b/g,'$1$2').split(' ').map(w=>aliases[w]||w).join(' ');}
function labels(doc){return{...schemas[doc.type],...doc.labels};}
function candidates(rs,type){
 if(type==='T4')return t4Candidates(rs);if(type==='ID')return{};
 const result={},put=(key,value,row,item,label)=>{(result[key]??=[]).push({value,evidence:row.text,...(item?{rect:rect({...item,y:item.y??row.y})}:{}),...(label?{labelRect:rect({...label,y:label.y??row.y})}:{})});};
 const amounts=row=>row.items.filter(i=>amount(i.str)!==null&&Number.isFinite(amount(i.str)));
 const payroll={taxableGross:/\btaxable (?:gross|earnings)\b/i,gross:/\b(?:gross pay|gross earnings|total earnings)\b/i,deductions:/\btotal deductions\b/i,net:/\b(?:net pay|net deposit)\b/i,cpp2:/\b(?:CPP2|second additional CPP)\b/i,cpp:/\bCPP(?: contributions)?\b/i,ei:/\b(?:EI|employment insurance)(?: premiums)?\b/i,incomeTax:/\b(?:total income tax|income tax|tax withheld)\b/i,rpp:/\b(?:RPP|pension contribution)\b/i,unionDues:/\bunion dues\b/i,hours:/\bregular hours\b/i,rate:/\b(?:regular hourly rate|hourly rate)\b/i,regular:/\bregular earnings\b/i};
 for(const row of rs){
  if(type==='Paystub'){
   const found=Object.entries(payroll).find(([,re])=>re.test(row.text));if(!found)continue;const[key,re]=found;
   let values=amounts(row);if(!values.length)values=[...row.text.slice(row.text.search(re)+row.text.match(re)[0].length).matchAll(/\(?-?\$?\s*\d[\d,]*\.\d{2}\)?/g)].map(m=>({str:m[0].trim()}));
   const ytdOnly=/\b(?:YTD|year[ -]to[ -]date)\b/i.test(row.text)&&!/\bcurrent\b/i.test(row.text);
   const header=[...rs].filter(r=>r.y>row.y&&r.items.some(i=>/^(?:current|this period)$/i.test(i.str.trim()))&&r.items.some(i=>/^(?:YTD|year[ -]to[ -]date)$/i.test(i.str.trim()))).sort((a,b)=>a.y-b.y)[0];
   for(const i of values){let target=key;if(header&&values.length===2&&Number.isFinite(i.x)){const cols=header.items.filter(t=>/^(?:current|this period|YTD|year[ -]to[ -]date)$/i.test(t.str.trim())).sort((a,b)=>a.x-b.x);const ordered=[...values].sort((a,b)=>a.x-b.x);if(cols.length===2&&/\b(?:YTD|year[ -]to[ -]date)\b/i.test(cols[ordered.indexOf(i)].str))target='ytd'+key[0].toUpperCase()+key.slice(1);}else if(ytdOnly&&values.length===1)target='ytd'+key[0].toUpperCase()+key.slice(1);put(target,i.str.trim(),row,Number.isFinite(i.x)?i:row.items.find(t=>t.str.includes(i.str.trim())),row.items.find(t=>re.test(t.str)));}
  }else{
   // ponytail: explicit CRA line tokens and known notice labels only; ambiguous layouts stay blank for manual confirmation.
   for(const key of Object.keys(schemas[type]).filter(k=>/^\d+$/.test(k))){const label=row.items.find(i=>i.str.trim()===key);if(label){for(const i of amounts(row).filter(i=>i!==label&&i.x>label.x))put(key,i.str.trim(),row,i,label);continue;}
    const at=row.text.search(new RegExp('(?:^|\\s)'+key+'(?=\\s|$)'));let tail=at>=0?row.text.slice(at).replace(new RegExp('^\\s*'+key+'\\s*'),''):'';if(!tail&&['NOA','CNOA'].includes(type)){const phrase=schemas[type][key];if(row.text.toLowerCase().startsWith(phrase.toLowerCase()))tail=row.text.slice(phrase.length);}
    const match=tail.match(/(\(?-?\$?\s*\d[\d,]*(?:\.\d{1,2})?\)?)\s*(?:CR|DR)?\s*$/i);if(match&&Number.isFinite(amount(match[1].trim())))put(key,match[1].trim(),row,row.items.find(i=>i.str.includes(match[1].trim())),null);
   }
   if(/balance from this assessment/i.test(row.text)){const m=row.text.match(/(\(?-?\$?\s*\d[\d,]*(?:\.\d{1,2})?\)?)\s*(CR|DR)?\s*$/i);if(m&&Number.isFinite(amount(m[1].trim()))){const value=m[2]?.toUpperCase()==='CR'?String(-Math.abs(amount(m[1].trim()))):m[1].trim();put('assessmentBalance',value,row,row.items.find(i=>i.str.trim()===m[1].trim()),null);}}
  }
 }
 return result;
}
function identity(pages,type){
 const allRows=pages.flatMap((p,i)=>p.rows.map(r=>({...r,page:i+1})));let rs=allRows;if(type==='T4'){const maxX=Math.max(0,...(pages[0]?.rows||[]).flatMap(r=>r.items.map(i=>i.x)));rs=rs.map(r=>({...r,items:r.items.filter(i=>i.x>35&&i.x<maxX*.55)})).map(r=>({...r,text:r.items.map(i=>i.str).join(' ').trim()}));}
 const valueFor=(re,source=rs)=>{for(const row of source){const text=type==='ID'?row.text.replace(/^\d+\.\s*/,''):row.text;if(!re.test(text))continue;let value=text.replace(re,'').trim(),valueRow=row;if(!value){const next=source.find(r=>r.page===row.page&&r.y<row.y&&row.y-r.y<25);if(next){value=next.text;valueRow=next;}}if(value)return{value,row:valueRow};}return null;};
 const result={name:'',address:'',postal:'',employer:'',regions:{}};
 const remember=(key,rows)=>result.regions[key]=rows.flatMap(r=>r.items.map(i=>({page:r.page,rect:rect({...i,y:i.y??r.y})})));
 const named=valueFor(/^(?:applicant(?: full)? name|full name|employee(?:'s)? name|taxpayer(?:'s)? name|corporation name|company name|name(?: of (?:corporation|taxpayer))?)(?:\s*:\s*|\s+|$)/i);
 const given=valueFor(/^(?:given names?|first names?)(?:\s*:\s*|\s+|$)/i),surname=valueFor(/^(?:surname|last name|family name)(?:\s*:\s*|\s+|$)/i);
 if(named){result.name=named.value;remember('name',[named.row]);}else if(given&&surname){result.name=given.value+' '+surname.value;remember('name',[given.row,surname.row]);}
 const labelled=valueFor(/^(?:residential address|mailing address|address)\s*:\s*/i);
 const streets=rs.filter(r=>/^\s*(?:\d+[ -])+\p{L}.*\b(?:DR|DRIVE|ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|LANE|CRES|COURT|WAY)\b/iu.test(r.text));
 const street=labelled?.row||(named?streets.find(r=>r.page===named.row.page&&r.y<named.row.y&&named.row.y-r.y<80):streets.length===1?streets[0]:null);
 if(street){const following=rs.filter(r=>r.page===street.page&&r.y<=street.y&&street.y-r.y<50);const postal=following.find(r=>/[A-Z]\d[A-Z]\s*\d[A-Z]\d/i.test(r.text));const addressRows=postal?following.filter(r=>r.y>=postal.y):[street];result.address=addressRows.map(r=>r===labelled?.row?labelled.value:r.text).join(', ');result.postal=result.address.match(/[A-Z]\d[A-Z]\s*\d[A-Z]\d/i)?.[0]||'';remember('address',addressRows);
  if(!result.name){const name=rs.filter(r=>r.page===street.page&&r.y>street.y&&r.y-street.y<45&&/^[\p{L}][\p{L}' .-]+$/u.test(r.text)&&!/\b(?:CANADA|REVENUE|ASSESSMENT|LICENCE|LICENSE|GOVERNMENT|EMPLOYER)\b/i.test(r.text)).sort((a,b)=>a.y-b.y)[0];if(name){result.name=name.text;remember('name',[name]);}}
 }
 const employer=valueFor(/^employer(?: name)?\s*:\s*/i,allRows);if(employer){result.employer=employer.value;remember('employer',[employer.row]);}
 for(const[key,re]of Object.entries({fiscalStart:/^(?:fiscal|tax year)\s*(?:start|beginning)\s*:\s*/i,fiscalEnd:/^(?:fiscal|tax year)\s*(?:end|ending|-end)\s*:\s*/i,payStart:/^pay period start\s*:\s*/i,payEnd:/^pay period end\s*:\s*/i,payDate:/^(?:pay|payment) date\s*:\s*/i})){const found=valueFor(re),date=found?.value.match(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/)?.[0].replaceAll('/','-');if(date&&validDate(date)){result[key]=date;remember(key,[found.row]);}}
 const version=valueFor(/^(?:version|record status)\s*:\s*/i);result.version=/notice of reassessment/i.test(pages.map(p=>p.text).join('\n'))?'reassessment':['NOA','CNOA'].includes(type)?'assessment':/^(?:original|amended|superseded)$/i.test(version?.value||'')?version.value.toLowerCase():'';
 return result;
}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function batch(docs,reference={}){
 const out=[],corporate=d=>['T2','CNOA'].includes(d.type),target=(i,key)=>({docIndex:i,...(['name','address','employer','fiscalStart','fiscalEnd','payStart','payEnd','payDate'].includes(key)?{identityKey:key}:{fieldKeys:[key]})}),add=(status,title,detail,targets=[])=>out.push({status,title,detail,targets});
 const present=(d,k)=>amount(d.fields?.[k])!==null&&Number.isFinite(amount(d.fields?.[k]));
 const shown=(d,k)=>present(d,k)?money(amount(d.fields[k])):'Not supplied / invalid';
 const consistent=(status,confirmed)=>confirmed?status:'review';
 const blocked=new Set(),usable=docs.map((d,i)=>({d,i})).filter(({d})=>d.version!=='superseded'&&d.type!=='ID');
 function identityCheck(a,b,key,ai,bi,confirmed){const x=a[key]||'',y=b[key]||'',norm=key==='address'?addressKey:normal;const same=!!norm(x)&&norm(x)===norm(y);const order=key==='name'&&normal(x).split(' ').sort().join(' ')===normal(y).split(' ').sort().join(' ');add(consistent(!x||!y||(!same&&order)?'review':same?'pass':'mismatch',confirmed),(key==='name'?'Name / spelling':'Address')+' — '+a.file+' ↔ '+b.file,'Document: '+(x||'Not supplied')+'; reference: '+(y||'Not supplied')+'. '+(!x||!y?'Missing identity input.':same?'Internally consistent.':order?'Same name words in a different order; confirm against the source.':'Confirm spelling, ownership or a documented address change.'),[target(ai,key),...(bi>=0?[target(bi,key)]:[])]);}
 for(const {d,i} of usable){const ref=corporate(d)?{name:reference.companyName,address:reference.companyAddress,file:'Company reference'}:{name:reference.name,address:reference.address,file:reference.file||'Applicant ID/reference'};const confirmed=corporate(d)?reference.companyConfirmed:reference.confirmed;
  if(ref.name||ref.address){for(const key of ['name','address'])identityCheck(d,ref,key,i,corporate(d)?-1:reference.sourceIndex??-1,!!confirmed&&d.confirmed);if(!confirmed)add('review','Confirm reference — '+d.file,'Check the reference name and address before accepting matches.',[target(i,'name')]);}
  else add('review','Identity reference — '+d.file,corporate(d)?'Confirm company identity against its corporate records. The personal applicant ID is not a company name.':'Upload an applicant ID and confirm its name and full address.',[target(i,'name')]);
  if(!d.version)add('review','Record version — '+d.file,'Confirm original, amended, assessment/reassessment or superseded status.',[{docIndex:i}]);
 }
 for(let a=0;a<usable.length;a++)for(let b=a+1;b<usable.length;b++){const {d:x,i:xi}=usable[a],{d:y,i:yi}=usable[b];if(corporate(x)!==corporate(y))continue;for(const key of ['name','address'])identityCheck(x,y,key,xi,yi,x.confirmed&&y.confirmed);
  const period=d=>d.type==='Paystub'?[d.payStart,d.payEnd,d.payDate].join('|'):corporate(d)?[d.fiscalStart,d.fiscalEnd].join('|'):d.year;
  if(x.type===y.type&&period(x)===period(y)&&normal(x.name)&&normal(x.name)===normal(y.name)&&(x.type!=='T4'||normal(x.employer)===normal(y.employer))){blocked.add(xi);blocked.add(yi);add('review','Duplicate or competing records',x.file+' and '+y.file+' cover the same or unconfirmed period. Mark superseded records before reconciling; values are not summed.',[{docIndex:xi},{docIndex:yi}]);}
 }
 function ready(a,b,ai,bi,corp=false){return a.confirmed&&b.confirmed&&normal(a.name)&&normal(a.name)===normal(b.name)&&a.version&&b.version&&!blocked.has(ai)&&!blocked.has(bi)&&(corp?validDate(a.fiscalStart)&&validDate(a.fiscalEnd)&&a.fiscalStart<=a.fiscalEnd&&(!a.year||a.year===a.fiscalEnd.slice(0,4))&&(!b.year||b.year===b.fiscalEnd.slice(0,4))&&a.fiscalStart===b.fiscalStart&&a.fiscalEnd===b.fiscalEnd:/^20\d{2}$/.test(a.year||'')&&a.year===b.year);}
 function validAmount(d,k){return present(d,k)&&(amount(d.fields[k])>=0||(['T1','NOA'].includes(d.type)&&k==='15000')||(['T2','CNOA'].includes(d.type)&&k==='300')||k==='assessmentBalance');}
 function compare(a,b,ai,bi,ak,bk,title,canCompare,differenceStatus='mismatch',note=''){canCompare=canCompare&&validAmount(a,ak)&&validAmount(b,bk);const same=present(a,ak)&&present(b,bk)&&Math.round(amount(a.fields[ak])*100)===Math.round(amount(b.fields[bk])*100);add(canCompare&&same?'pass':canCompare&&present(a,ak)&&present(b,bk)?differenceStatus:'review',title,a.file+': '+shown(a,ak)+'; '+b.file+': '+shown(b,bk)+(present(a,ak)&&present(b,bk)?'; difference '+money((Math.round(amount(b.fields[bk])*100)-Math.round(amount(a.fields[ak])*100))/100):'')+'. '+(canCompare?note+(same?' Internally consistent; underlying records are not independently verified.':''): 'Confirm both inputs, identity, version and matching period before reconciliation. '+note),[target(ai,ak),target(bi,bk)]);}
 for(const {d:a,i:ai} of usable)for(const {d:b,i:bi} of usable){
  if((a.type==='NOA'&&b.type==='T1')||(a.type==='CNOA'&&b.type==='T2')){
   const corp=corporate(a),canCompare=ready(a,b,ai,bi,corp);
   if(corp?(!validDate(a.fiscalStart)||!validDate(a.fiscalEnd)||a.fiscalStart!==b.fiscalStart||a.fiscalEnd!==b.fiscalEnd):(!a.year||a.year!==b.year)){add('review','Period — '+a.file+' ↔ '+b.file,corp?'Confirm matching fiscal start and end dates. A shared calendar year is insufficient.':'Tax years differ or are missing; amounts are not treated as the same return.',[target(ai,corp?'fiscalEnd':'year'),target(bi,corp?'fiscalEnd':'year')]);}
   const keys=new Set([...Object.keys(a.fields||{}),...Object.keys(b.fields||{})]);let count=0;
   for(const k of keys)if(k!=='assessmentBalance'&&((Object.hasOwn(labels(a),k)&&Object.hasOwn(labels(b),k))||k.startsWith('custom:'))&&(amount(a.fields?.[k])!==null||amount(b.fields?.[k])!==null)){count++;compare(a,b,ai,bi,k,k,(k.startsWith('custom:')?labels(a)[k]||labels(b)[k]:'Line '+k)+' — '+a.type+' ↔ '+b.type,canCompare,'review','An assessed difference may reflect a CRA adjustment or displayed rounding; read the explanations.');}
   if(!count)add('review','No comparable amounts — '+a.file+' ↔ '+b.file,'Confirm the common lines, or add the same labelled comparison field to both documents.',[{docIndex:ai},{docIndex:bi}]);
  }
  if(a.type==='T4'&&b.type==='Paystub'){
   const employer=normal(a.employer)&&normal(a.employer)===normal(b.employer),canCompare=ready(a,b,ai,bi)&&employer&&b.finalPaystub&&validDate(b.payDate)&&b.payDate.startsWith(b.year+'-');
   const latest=usable.some(({d:c})=>c!==b&&c.type==='Paystub'&&c.year===b.year&&normal(c.name)===normal(b.name)&&normal(c.employer)===normal(b.employer)&&validDate(c.payDate)&&c.payDate>b.payDate);
   if(!employer)add('review','Employer — '+a.file+' ↔ '+b.file,'Confirm the same employer on the T4 and paystub before reconciliation.',[target(ai,'employer'),target(bi,'employer')]);
   if(!b.finalPaystub||latest)add('review','Annual T4 versus interim paystub',a.file+' is annual; '+b.file+' is interim or not the latest uploaded paystub. Do not equate its YTD to annual totals or multiply a pay period to invent year-end income.',[target(ai,'14'),target(bi,'ytdGross')]);
   const taxable=present(b,'ytdTaxableGross')?'ytdTaxableGross':'ytdGross';
   for(const [ak,bk,label]of [['14',taxable,'Employment income'],['22','ytdIncomeTax','Income tax deducted'],['16','ytdCpp','CPP'],['16A','ytdCpp2','CPP2'],['18','ytdEi','EI'],['20','ytdRpp','RPP contributions']])if(ak==='14'||present(a,ak)||present(b,bk))compare(a,b,ai,bi,ak,bk,label+' — T4 ↔ paystub',canCompare&&!latest&&(ak!=='14'||bk==='ytdTaxableGross'||b.taxableBasisConfirmed),'review','Confirm final payroll adjustments.'+(ak==='14'?' Gross must include the same taxable earnings and benefits as T4 box 14.':''));
   for(const key of new Set([...Object.keys(a.fields||{}),...Object.keys(b.fields||{})]))if(key.startsWith('custom:'))compare(a,b,ai,bi,key,key,(labels(a)[key]||labels(b)[key])+' — T4 ↔ paystub',canCompare&&!latest,'review','User-labelled comparison: confirm the same annual period and earnings/deduction basis.');
  }
 }
 const stubs=usable.filter(({d})=>d.type==='Paystub'&&validDate(d.payDate)).sort((a,b)=>a.d.payDate.localeCompare(b.d.payDate));
 for(let n=1;n<stubs.length;n++){const {d:b,i:bi}=stubs[n];const prev=stubs.slice(0,n).reverse().find(({d:a})=>a.year===b.year&&normal(a.name)&&normal(a.name)===normal(b.name)&&normal(a.employer)&&normal(a.employer)===normal(b.employer));if(!prev)continue;const {d:a,i:ai}=prev,adjacent=validDate(a.payEnd)&&validDate(b.payStart)&&Date.parse(b.payStart+'T00:00:00Z')-Date.parse(a.payEnd+'T00:00:00Z')===86400000,confirmed=ready(a,b,ai,bi)&&adjacent;
  if(!adjacent)add('review','Paystub period coverage',a.file+' → '+b.file+': periods overlap, have a gap or are unconfirmed. YTD increases are not automatically equated to a single current payment.',[target(ai,'payEnd'),target(bi,'payStart')]);
  for(const [current,ytd]of [['gross','ytdGross'],['deductions','ytdDeductions'],['net','ytdNet'],['incomeTax','ytdIncomeTax'],['cpp','ytdCpp'],['cpp2','ytdCpp2'],['ei','ytdEi']])if(present(a,ytd)||present(b,ytd)){const available=present(a,ytd)&&present(b,ytd)&&present(b,current),delta=available?(Math.round(amount(b.fields[ytd])*100)-Math.round(amount(a.fields[ytd])*100))/100:null;add(confirmed&&available?(Math.round(delta*100)===Math.round(amount(b.fields[current])*100)?'pass':'review'):'review','YTD continuity — '+schemas.Paystub[current],a.file+' → '+b.file+': previous '+shown(a,ytd)+', new '+shown(b,ytd)+', increase '+(delta===null?'not determinable':money(delta))+', current '+shown(b,current)+'. '+(confirmed?'Any difference requires payroll adjustment records.':'Confirm dates, identity, version and all inputs.'),[target(ai,ytd),{docIndex:bi,fieldKeys:[current,ytd]}]);}
 }
 return out;
}
const api={limits,schemas,amount,money,check,normal,addressKey,labels,rows,candidates,identity,batch,validDate,detect,detectYear,candidateKey};if(typeof module!=='undefined')module.exports=api;else root.Checker=api;
})(globalThis);


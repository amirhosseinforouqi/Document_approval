(function(root){
const median=xs=>{const s=[...xs].sort((a,b)=>a-b);return s[Math.floor(s.length/2)];};
function tokens(page){return page.rows.flatMap(r=>r.items.map(i=>({...i,y:i.y??r.y,height:Math.max(5,i.height||Math.hypot(i.transform?.[2]||0,i.transform?.[3]||10)),width:Math.max(2,i.width||2)}))).filter(i=>i.str.trim()&&Number.isFinite(i.x)&&Number.isFinite(i.y));}
function kind(t){const s=t.str.trim();if(/^\(?-?\$?[\d,]+(?:\.\d{1,2})?\)?$/.test(s))return'number';if(/[A-Z]{2}/.test(s)&&s===s.toUpperCase()&&/[A-Z]/.test(s))return'name';return null;}
function groups(ts,coordinate,window){const result=[];for(const t of [...ts].sort((a,b)=>coordinate(a)-coordinate(b))){let g=result.find(g=>Math.abs(coordinate(t)-median(g.map(coordinate)))<=window);if(!g)result.push(g=[]);g.push(t);}return result;}
function inspect(page,tolerance=2,reference=null,name=''){
 const ts=tokens(page),issues=[];const flag=(t,detail,status='review',expected=null)=>issues.push({status,title:'Text alignment',detail,text:t.str,rect:{x:t.x,y:t.y,width:t.width,height:t.height},expected});
 if(page.method?.startsWith('OCR'))return{issues:[],checked:0,note:'OCR coordinates are approximate. Alignment needs visual review; automatic position checks are skipped for scans.'};
 if(reference){
  if(reference.method?.startsWith('OCR'))return{issues:[],checked:0,note:'Use a text-based reference PDF for precise alignment checks.'};
  if(page.width!==reference.width||page.height!==reference.height||page.rotation!==reference.rotation)return{issues:[],checked:0,note:'Page dimensions or rotation differ from the reference. Use the same template and page order.'};
  const refs=tokens(reference).filter(kind),actual=ts.filter(kind),used=new Set();let checked=0;
  const pairs=[];
  // ponytail: nearby text-run matching assumes the same template; use field-region matching for redesigned forms.
  for(const t of actual){const same=refs.map((r,i)=>({r,i})).filter(({r,i})=>!used.has(i)&&kind(r)===kind(t)&&r.str.trim()===t.str.trim());const near=(same.length?same:refs.map((r,i)=>({r,i})).filter(({r,i})=>!used.has(i)&&kind(r)===kind(t))).map(o=>({...o,d:Math.hypot(o.r.y-t.y,kind(t)==='number'?(o.r.x+o.r.width)-(t.x+t.width):o.r.x-t.x)})).sort((a,b)=>a.d-b.d);const best=near[0];if(best&&best.d<80){used.add(best.i);pairs.push([t,best.r]);}else flag(t,'No corresponding name/number found nearby in the reference. Check the template or text location.');}
  for(const[t,r]of pairs){checked++;const dx=kind(t)==='number'?(t.x+t.width)-(r.x+r.width):t.x-r.x,dy=t.y-r.y;if(Math.abs(dx)>tolerance||Math.abs(dy)>tolerance)flag(t,`“${t.str.trim()}” is ${Math.abs(dx).toFixed(1)} pt ${dx<0?'left':'right'} and ${Math.abs(dy).toFixed(1)} pt ${dy<0?'down':'up'} relative to the reference.`, 'mismatch',{x:r.x,y:r.y,width:r.width,height:r.height});}
  for(let i=0;i<refs.length;i++)if(!used.has(i))flag(refs[i],`Reference text region “${refs[i].str.trim()}” has no nearby counterpart in this PDF.`, 'review');
  return{issues,checked,note:'Reference comparison uses numeric right edges and text left edges. Different templates or text-run grouping require manual review.'};
 }
 const amounts=ts.filter(t=>/^\(?-?\$?[\d,]+\.\d{2}\)?$/.test(t.str.trim()));
 for(const g of groups(amounts,t=>t.y,12)){if(g.length<2)continue;const ys=g.map(t=>t.y);if(Math.max(...ys)-Math.min(...ys)>tolerance)for(const t of g)flag(t,`Possible row baseline mismatch: nearby amounts vary by ${(Math.max(...ys)-Math.min(...ys)).toFixed(1)} pt. A reference is needed to identify the intended position.`);}
 for(const g of groups(amounts,t=>t.x+t.width,12)){if(g.length<3)continue;const target=median(g.map(t=>t.x+t.width));const aligned=g.filter(t=>Math.abs(t.x+t.width-target)<=tolerance);if(aligned.length<2||aligned.length<=g.length/2)continue;for(const t of g)if(Math.abs(t.x+t.width-target)>tolerance)flag(t,`Possible column shift: numeric right edge is ${Math.abs(t.x+t.width-target).toFixed(1)} pt ${t.x+t.width<target?'left':'right'} of the nearby column.`);}
 const words=name.toUpperCase().split(/\s+/).filter(Boolean);const names=ts.filter(t=>words.some(w=>t.str.trim().toUpperCase()===w));for(const g of groups(names,t=>t.y,12)){if(g.length>1&&new Set(g.map(t=>t.str.trim())).size>1){const ys=g.map(t=>t.y);if(Math.max(...ys)-Math.min(...ys)>tolerance)for(const t of g)flag(t,'Name fragments appear on different baselines. Check the name row in the preview.');}}
 const unique=issues.filter((r,i,a)=>a.findIndex(x=>x.rect.x===r.rect.x&&x.rect.y===r.rect.y&&x.detail===r.detail)===i);
 return{issues:unique,checked:amounts.length+names.length,note:'Automatic checks flag likely row/column outliers. Upload a correctly aligned PDF with the same template to check absolute left/right/up/down positions.'};
}
const api={inspect,tokens};if(typeof module!=='undefined')module.exports=api;else root.LayoutChecker=api;
})(globalThis);

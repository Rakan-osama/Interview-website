// Formatting only: no summarization, evaluation or changes to source content.
export type ReadingPoint={text:string};
const arabic=/[\u0621-\u064A]/;
export function textDirection(text:string):'rtl'|'ltr'{return arabic.test(text)?'rtl':'ltr'}
export function spaceMixedText(text:string){return text.replace(/([\u0621-\u064A])([A-Za-z0-9_$])/g,'$1 $2').replace(/([A-Za-z0-9_$])([\u0621-\u064A])/g,'$1 $2').replace(/\b(Hold|Held|Transfer|Capture|Captured|Posted|Available|Pending|Paid|Payable|Receivable|Allocation|Refunds?|Fee|Usage|Count|Limit|Grace|Version|Order|Request|Chunk|Page|Session|Progress|Movement|Withdrawal|Seller|Platform|Member|Cash|CashAsset|Wallet[A-B]?|MerchantPayable|PayoutPayable|PlatformRevenue|ProviderReceivable|SellerPayable|WalletLiability)(?=\d)/gi,'$1 ').replace(/(\d)(min|days)\b/g,'$1 $2').replace(/(\d)(EGP|USD|EUR|GBP)\b/g,'$1 $2')}
export function explanationPoints(text:string):ReadingPoint[]{
 const points:ReadingPoint[]=[];let start=0,quote='',depth=0;
 // URLs and inline code have punctuation that is not a sentence boundary.
 const protectedRanges=[...text.matchAll(/https?:\/\/[^\s]+|`[^`]*`/g)].map(m=>[m.index!,m.index!+m[0].length]);
 const protectedAt=(i:number)=>protectedRanges.some(([a,b])=>i>=a&&i<b);
 const add=(end:number)=>{const value=text.slice(start,end).trim();if(value)points.push({text:value});start=end};
 for(let i=0;i<text.length;i++){
  const c=text[i];if(protectedAt(i))continue;
  if(quote){if(c===quote&&text[i-1]!=='\\')quote='';continue}
  if((c==='"'||c==="'")&&!(c==="'"&&/[A-Za-z]/.test(text[i-1]||'')&&/[A-Za-z]/.test(text[i+1]||''))){quote=c;continue}
  if(c==='('||c==='['||c==='{')depth++;
  if(c===')'||c===']'||c==='}')depth=Math.max(0,depth-1);
  if(c==='\n'&&depth===0){add(i+1);continue}
  if(depth||!/[.؛;!?؟]/.test(c)||i+1<text.length&&!/\s/.test(text[i+1]))continue;
  if(c==='.'&&/(?:\b(?:e\.g|i\.e|etc|vs|Mr|Dr|Ms)|U\.S)\.$/i.test(text.slice(0,i+1)))continue;
  add(i+1);
 }
 add(text.length);return points;
}
export type TextRun={text:string;technical:boolean};
export function technicalRuns(value:string):TextRun[]{
 const text=spaceMixedText(value);if(!arabic.test(text))return [{text,technical:/[A-Za-z0-9]/.test(text)}];
 const pattern=/[.$\\_(\[{'"]*[A-Za-z0-9][A-Za-z0-9_$\\ \t.,:;?!'"()[\]{}\/@#%&|+=<>*~^`→←×÷–-]*/g;
 const runs:TextRun[]=[];let offset=0;
 for(const match of text.matchAll(pattern)){
  let index=match.index!;let token=match[0].replace(/[\s.,:;!?]+$/g,'');
  // Do not pull an Arabic-side closing parenthesis into an English isolate.
  for(const [open,close] of [['(',')'],['[',']'],['{','}']])while(token.endsWith(close)&&token.split(close).length>token.split(open).length)token=token.slice(0,-1);
  token=token.trimEnd();
  for(const [open,close] of [['(',')'],['[',']'],['{','}']])while(token.startsWith(open)&&token.split(open).length>token.split(close).length){token=token.slice(1);index++}
  for(const q of ['\"',"'"])if(token.startsWith(q)&&token.split(q).length%2===0){token=token.slice(1);index++}
  if(!token)continue;
  if(index>offset)runs.push({text:text.slice(offset,index),technical:false});
  runs.push({text:token,technical:true});offset=index+token.length;
 }
 if(offset<text.length)runs.push({text:text.slice(offset),technical:false});return runs;
}

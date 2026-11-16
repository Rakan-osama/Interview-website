// Deterministic client-side teaching models. These do not execute PHP, provider calls or DB concurrency.
export type BookingState={now:number;owner:'A'|'B'|null;expires:number;confirmed:boolean;seenA:boolean;seenB:boolean;paidA:boolean;resultA:string;log:string[]};
export const initialBooking=():BookingState=>({now:0,owner:null,expires:0,confirmed:false,seenA:false,seenB:false,paidA:false,resultA:'not_paid',log:['سعة=1، وقت السيرفر التعليمي=0.']});
export function bookingStep(s:BookingState,a:string):BookingState{
 let x={...s,log:[...s.log]};const log=(m:string)=>{x.log.push(m);return x};
 if(a==='expire'){x.now=11;if(!x.confirmed&&x.expires<=x.now)x.owner=null;return log('الوقت=11. الـhold غير المؤكدة انتهت؛ الـconfirmed لا تتحرر.');}
 if(a==='reserveA'||a==='reserveB'){
  const who=a==='reserveA'?'A':'B';
  if(who==='A'&&x.seenA||who==='B'&&x.seenB)return log('Replay نفس booking key: العملية الحالية لا تنشئ hold جديدة حتى لو انتهت.');
  if(who==='A'&&x.paidA)return log('A لها نتيجة دفع بالفعل؛ البديل يحتاج عملية جديدة وسياسة واضحة.');
  if(x.owner)return log(`${who}: conflict؛ المكان مملوك لـ${x.owner}، لا تغيير.`);
  if(who==='A')x.seenA=true;else x.seenB=true;x.owner=who;x.expires=x.now+10;return log(`${who} تمتلك hold حتى ${x.expires} تحت guard مشتركة.`);
 }
 if(a==='payA'){
  if(!x.seenA)return log('ابدأ بحجز A لإنشاء operation مرتبطة قبل استقبال نتيجة الدفع.');
  if(x.paidA)return log('Duplicate success A: نفس business effect، لا confirmation ولا refund ثانية.');
  x.paidA=true;
  if(x.owner==='A'&&x.expires>x.now&&!x.confirmed){x.confirmed=true;x.resultA='confirmed';return log('نجاح موثوق قبل expiry: A confirmed تحت نفس guard.');}
  x.resultA='paid_unallocated / refund_required';return log('A دفعت بعد فقد الحق في المكان: refund_required. ملكية B لا تتغير.');
 }
 return x;
}
export type PaymentState={created:boolean;charges:number;providerDone:boolean;outcome:string;fulfilled:number;events:string[];log:string[]};
export const initialPayment=():PaymentState=>({created:false,charges:0,providerDone:false,outcome:'not_created',fulfilled:0,events:[],log:['لا عملية حتى الآن. key ثابتة للعملية التعليمية pay-001.']});
export function paymentStep(s:PaymentState,a:string):PaymentState{
 const x={...s,events:[...s.events],log:[...s.log]};const log=(m:string)=>{x.log.push(m);return x};
 if(a==='redirect')return log('Success URL ليست evidence. لا تغيير في payment أو fulfillment.');
 if(a==='invalid')return log('Invalid signature: رفض قبل domain processing؛ لا inbox موثوقة ولا effect.');
 if(a==='submit'){
  if(x.created)return log('Replay pay-001: ارجع العملية الحالية؛ لا charge جديدة.');
  x.created=true;x.charges=1;x.providerDone=true;x.outcome='unknown';return log('حُفظ intent؛ provider نفذ charge واحدة، ثم الرد ضاع: local outcome unknown.');
 }
 if(a==='retry'){
  if(!x.created)return log('ابدأ العملية أولًا.');
  return log('Retry بنفس pay-001 ضمن عقد المزود التعليمي: لا charge إضافية. نستعلم عن نفس reference.');
 }
 if(a==='webhook'||a==='another'||a==='reconcile'){
  if(!x.providerDone)return log('لا توجد عملية provider لتأكيدها.');
  if(a!=='reconcile'){
   const id=a==='webhook'?'evt-001':'evt-002';
   if(x.events.includes(id))return log(`${id} مكررة: inbox dedup، لا أثر جديد.`);
   x.events.push(id);
  }
  x.outcome='succeeded';
  if(!x.fulfilled){x.fulfilled=1;return log('Evidence موثوقة + amount/currency مطابقة: commit succeeded وfulfillment effect واحدة.');}
  return log('Evidence جديدة لنفس payment: business uniqueness تمنع fulfillment ثانية.');
 }
 return x;
}
export type Entry={account:string;side:'dr'|'cr';amount:number;currency:'EGP'};
export type Journal={ref:string;entries:Entry[];reverses?:string};
export type WalletState={journals:Journal[];hold:boolean;holdUsed:boolean;log:string[]};
const e=(account:string,side:'dr'|'cr',amount:number):Entry=>({account,side,amount,currency:'EGP'});
export const initialWallet=():WalletState=>({journals:[{ref:'fund-001',entries:[e('CashAsset','dr',10000),e('WalletA','cr',10000)]}],hold:false,holdUsed:false,log:['Funding: Dr CashAsset100 / Cr WalletA100. أرصدة wallet هنا credit-normal.']});
export function journalBalanced(j:Journal){const sums:Record<string,number>={};for(const en of j.entries){if(!Number.isInteger(en.amount)||en.amount<=0)return false;sums[en.currency]=(sums[en.currency]||0)+(en.side==='dr'?en.amount:-en.amount);}return j.entries.length>=2&&Object.values(sums).every(n=>n===0);}
export function walletBalance(s:WalletState,account:string){return s.journals.flatMap(j=>j.entries).filter(en=>en.account===account).reduce((n,en)=>n+(en.side==='cr'?en.amount:-en.amount),0);}
export const walletAvailable=(s:WalletState)=>walletBalance(s,'WalletA')-(s.hold?6000:0);
export function walletStep(s:WalletState,a:string):WalletState{
 const x={...s,journals:[...s.journals],log:[...s.log]};const log=(m:string)=>{x.log.push(m);return x};
 const post=(j:Journal)=>{if(!journalBalanced(j))throw Error('Unbalanced journal');x.journals.push(j)};
 if(a==='hold'){
  if(x.holdUsed)return log('نفس hold operation موجودة/انتهت؛ لا حجز ثانٍ.');
  if(walletAvailable(x)<6000)return log('رفض hold60: available غير كافية.');
  x.hold=true;x.holdUsed=true;return log('Hold60 كـencumbrance منفصلة؛ posted لا تتغير.');
 }
 if(a==='release'){
  if(!x.hold)return log('لا active hold يمكن release لها.');x.hold=false;return log('Release تحت guard: available تزيد، لا journal لأنها لم تكن posted.');
 }
 if(a==='transfer1'||a==='transfer2'){
  const ref=a==='transfer1'?'transfer-001':'transfer-002';
  if(x.journals.some(j=>j.ref===ref))return log('Replay transfer: journal الأصلية، لا debit جديدة.');
  if(walletAvailable(x)<3000)return log('رفض transfer30: available أقل من30؛ لا partial posting.');
  post({ref,entries:[e('WalletA','dr',3000),e('WalletB','cr',3000)]});return log(`${ref}: Dr WalletA30 / Cr WalletB30. Guard+posting atomic في النموذج.`);
 }
 if(a==='capture'){
  if(x.journals.some(j=>j.ref==='capture-001'))return log('Replay capture: لا قيد جديد.');
  if(!x.hold)return log('لا hold نشطة لـcapture.');
  post({ref:'capture-001',entries:[e('WalletA','dr',6000),e('MerchantPayable','cr',6000)]});x.hold=false;return log('Capture: Dr WalletA60 / Cr MerchantPayable60 وإزالة hold في commit واحدة.');
 }
 if(a==='spendB'){
  if(x.journals.some(j=>j.ref==='b-spend'))return log('Replay B spend: نفس العملية.');
  if(walletBalance(x,'WalletB')<3000)return log('B لا تملك30.');
  post({ref:'b-spend',entries:[e('WalletB','dr',3000),e('MerchantPayable','cr',3000)]});return log('B صرفت30 للتاجر.');
 }
 if(a==='reverse'){
  if(!x.journals.some(j=>j.ref==='transfer-001'))return log('لا transfer-001 لعكسها.');
  if(x.journals.some(j=>j.ref==='reverse-001'))return log('Reversal موجودة؛ لا قيد إضافي.');
  if(walletBalance(x,'WalletB')<3000)return log('Reversal رفضت حسب سياسة المثال: B صرفت الرصيد. افتح recovery case؛ لا تمسح الأصل.');
  post({ref:'reverse-001',reverses:'transfer-001',entries:[e('WalletB','dr',3000),e('WalletA','cr',3000)]});return log('Reversal جديدة مرتبطة؛ قيد transfer الأصلي ما زال موجودًا.');
 }
 return x;
}

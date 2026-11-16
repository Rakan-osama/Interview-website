import {ConceptIllustration} from './concept-illustration';
import {plainExplanations} from './plain-explanations';
import type {Concept} from './concepts';
import {StructuredText,TechnicalText} from './reading-text';
import {BookOpen,CheckCircle2,Lightbulb,AlertCircle} from 'lucide-react';
export function ConceptReader({concept}:{concept:Concept}){const plain=plainExplanations[concept.id];return <article className="concept-reader organized-concept" aria-label={concept.title}>
 <section className="plain-explanation"><span className="eyebrow">01 · المعنى ببساطة</span><h3><TechnicalText text={concept.title}/></h3><StructuredText text={concept.simple||plain?.simple||concept.intro}/><div className="real-example"><b>موقف عملي نربط بيه الفكرة</b><StructuredText text={concept.scenario||plain?.example||concept.when}/></div><small>افهم الموقف الأول، وبعده راجع التعريف والتفاصيل والكود بالترتيب.</small></section>
 <ConceptIllustration id={concept.id} title={concept.title}/>
 <section><span className="reading-section-label">02 · التعريف الدقيق</span><h3><BookOpen size={19}/> يعني إيه المفهوم ده؟</h3><StructuredText text={concept.intro}/></section>
 <section><span className="reading-section-label">03 · التفاصيل المهمة</span><h3>بيشتغل إزاي، وليه؟</h3><StructuredText text={concept.how}/></section>
 <section><span className="reading-section-label">04 · الاستخدام والقرار</span><h3>إمتى تستخدمه؟</h3><StructuredText text={concept.when}/></section>
 <section className="concept-code"><span className="reading-section-label">05 · المثال البرمجي</span><h3>اقرأ الكود من الشمال لليمين</h3><pre dir="ltr" lang="en"><code>{concept.code}</code></pre><span className="code-caption"><TechnicalText text={"مثال تعليمي: بعض الأنواع والـimports أو أجزاء التطبيق مختصرة للتركيز على المفهوم."}/></span></section>
 <section className="walkthrough"><span className="reading-section-label">06 · تفسير المثال</span><h3>نفهم الكود خطوة بخطوة</h3><ol>{concept.walkthrough.map((step,i)=><li key={i}><TechnicalText text={step}/></li>)}</ol></section>
 <aside className="concept-warning"><span className="reading-section-label">07 · الأخطاء والحدود</span><h3><AlertCircle size={18}/> الخطأ الشائع وحدود الاستخدام</h3><StructuredText text={concept.trap}/></aside>
 <aside className="understanding-check"><span className="reading-section-label">08 · تأكد من الفهم</span><h3><Lightbulb size={19}/> اختبر فهمك قبل ما تحفظ</h3><p><TechnicalText text={concept.check}/></p><small><TechnicalText text={"جاوب بصوتك أو اكتب ملاحظاتك في مساحة إجابة التمرين. ركّز على السبب والـtrade-off."}/></small></aside>
 </article>}
export function ReadingTools({size,onChange}:{size:number;onChange:(n:number)=>void}){return <div className="reading-tools" aria-label="إعدادات القراءة"><span>حجم خط الشرح</span><div role="group" aria-label="حجم النص">{[16,18,20].map(n=><button key={n} aria-label={`حجم الخط ${n}`} aria-pressed={size===n} className={size===n?'active':''} onClick={()=>onChange(n)}>{n}<small>px</small></button>)}</div><span className="reading-hint"><CheckCircle2 size={14}/> نص واضح وتباين عالٍ</span></div>}

import { AlertTriangle, CheckCircle2, ExternalLink, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

type ConceptContent = { intro: string; how: string; when: string; code: string; walkthrough: string[]; trap: string; check: string };
type Reference = { title: string; url: string; note: string };
export type ConceptDetail = { title: string; group: string; content: ConceptContent; references?: Reference[] };

function summary(value: string) {
  const firstSentence = value.split(/(?<=[.!؟])\s/u)[0] ?? value;
  return firstSentence.length > 150 ? `${firstSentence.slice(0, 147)}…` : firstSentence;
}

export function ConceptReader({ detail }: { detail: ConceptDetail }) {
  const { content } = detail;
  const flow = [
    ["01", "الفكرة", summary(content.intro)], ["02", "كيف تعمل", summary(content.how)],
    ["03", "متى تستخدمها", summary(content.when)], ["04", "اختبر فهمك", summary(content.check)],
  ];
  return <article className="page concept-reader">
    <Link className="back-link" to="/concepts">العودة إلى كل المفاهيم</Link>
    <header className="concept-hero"><span className="eyebrow">{detail.group}</span><h1 dir="auto">{detail.title}</h1><p className="concept-lead" dir="auto">{content.intro}</p></header>
    <section className="learning-map" aria-labelledby="concept-map-title"><div><span className="eyebrow">Mental model</span><h2 id="concept-map-title">خريطة فهم المفهوم</h2></div><ol className="concept-flow">
      {flow.map(([number, title, text]) => <li className="flow-node" key={number}><span>{number}</span><strong>{title}</strong><p dir="auto">{text}</p></li>)}
    </ol></section>
    <section className="learning-section"><span className="section-number">01</span><h2>الفكرة ببساطة</h2><p dir="auto">{content.intro}</p></section>
    <section className="learning-section"><span className="section-number">02</span><h2>كيف تعمل؟</h2><p dir="auto">{content.how}</p></section>
    <section className="learning-section"><span className="section-number">03</span><h2>متى تستخدمها؟</h2><p dir="auto">{content.when}</p></section>
    <section className="learning-section"><span className="section-number">04</span><h2>مثال عملي</h2><pre className="concept-code" dir="ltr"><code>{content.code}</code></pre></section>
    <section className="learning-section"><span className="section-number">05</span><h2>شرح المثال خطوة بخطوة</h2><ol className="walkthrough-list">{content.walkthrough.map((step, index) => <li key={`${index}-${step}`} dir="auto">{step}</li>)}</ol></section>
    <aside className="trap-callout"><AlertTriangle aria-hidden="true" /><div><h2>خطأ شائع في المقابلات</h2><p dir="auto">{content.trap}</p></div></aside>
    <aside className="self-check"><Lightbulb aria-hidden="true" /><div><h2>تحقق من فهمك</h2><p dir="auto">{content.check}</p><span><CheckCircle2 size={17} /> حاول الإجابة بصوت مرتفع قبل متابعة التدريب.</span></div></aside>
    {!!detail.references?.length && <section className="learning-section references"><span className="section-number">مصادر موثوقة</span><h2>للتعمق والتحقق</h2><p>مراجع رسمية مرتبطة بهذا المجال، وليست بديلاً عن الشرح العملي أعلاه.</p><ul className="reference-list">
      {detail.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer"><strong>{reference.title}</strong><ExternalLink size={16} /></a><p>{reference.note}</p></li>)}
    </ul></section>}
  </article>;
}

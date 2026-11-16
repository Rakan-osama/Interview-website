import {Fragment} from 'react';
import {explanationPoints,technicalRuns,textDirection} from './reading-format';
export function TechnicalText({text}:{text:string}){return <>{technicalRuns(text).map((run,i)=>run.technical?<bdi className="technical-term" dir="ltr" lang={/[A-Za-z]/.test(run.text)?'en':undefined} key={i}>{run.text}</bdi>:<Fragment key={i}>{run.text}</Fragment>)}</>}
export function StructuredText({text,className='',compact=false,ordered=false}:{text:string;className?:string;compact?:boolean;ordered?:boolean}){
 const points=explanationPoints(text),List=ordered?'ol':'ul';if(!points.length)return null;
 return <div className={`explanation-outline ${compact?'compact':''} ${className}`} dir={textDirection(text)}><List className="explanation-points">{points.map((point,i)=><li key={i}><TechnicalText text={point.text}/></li>)}</List></div>
}

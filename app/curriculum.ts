import {validDesignProgress} from './design-progress';
import {validEngineeringProgress} from './engineering-plan';
import { tracks } from './content';
import { trackGroup } from './expanded';
export {trackGroup};
export function validQuestionId(id:unknown):id is string {if(typeof id!=='string'||!/^\d+-\d+$/.test(id))return false;const [i,j]=id.split('-').map(Number);return !!tracks[i]?.questions[j]}
export function nextQuestionId(id:string){if(!validQuestionId(id))return '0-0';const [i,j]=id.split('-').map(Number);return j+1<tracks[i].questions.length?`${i}-${j+1}`:`${(i+1)%tracks.length}-0`}
export function firstUnanswered(i:number,attempts:Record<string,unknown>){const j=tracks[i].questions.findIndex((_,j)=>!attempts[`${i}-${j}`]);return `${i}-${j===-1?0:j}`}
export function matchesTrack(i:number,search:string,group:string){const t=tracks[i];const text=[t.title,t.ar,t.desc,...t.questions.flatMap(q=>[q.title,q.question,q.lesson])].join(' ').toLowerCase();return (group==='all'||trackGroup(i)===group)&&text.includes(search.trim().toLowerCase())}
export function validProgress(p:any){return !!p&&typeof p==='object'&&(p.design===undefined||validDesignProgress(p.design))&&(p.engineering===undefined||validEngineeringProgress(p.engineering))&&p.attempts&&typeof p.attempts==='object'&&!Array.isArray(p.attempts)&&p.drafts&&typeof p.drafts==='object'&&!Array.isArray(p.drafts)&&Array.isArray(p.bookmarks)&&p.bookmarks.every(validQuestionId)&&validQuestionId(p.last)&&Object.entries(p.drafts).every(([id,v])=>validQuestionId(id)&&typeof v==='string')&&Object.entries(p.attempts).every(([id,a]:any)=>validQuestionId(id)&&a&&typeof a.answer==='string'&&typeof a.date==='string'&&Array.isArray(a.hits)&&a.hits.length===4&&a.hits.every((v:any)=>typeof v==='boolean')&&Array.isArray(a.flags)&&a.flags.every((v:any)=>typeof v==='string'))}

export function entryQuestion(i:number,search:string,attempts:Record<string,unknown>){const text=search.trim().toLowerCase();if(text){const j=tracks[i].questions.findIndex(q=>[q.title,q.question,q.lesson].join(' ').toLowerCase().includes(text));if(j>=0)return `${i}-${j}`}return firstUnanswered(i,attempts)}

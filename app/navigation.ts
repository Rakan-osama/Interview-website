import {validQuestionId} from './curriculum';
import {concepts} from './concepts';
export const rootViews=['dashboard','paths','concepts','review','progress','projects','resources'] as const;
export type NavigationTarget={view:string;conceptId:string|null;questionId:string|null};
export function viewHref(view:string){return view==='design'?'/features':view==='dashboard'?'/':`/?view=${encodeURIComponent(rootViews.includes(view as typeof rootViews[number])?view:'dashboard')}`}
export function conceptHref(id:string|null){return '/?view=concepts'+(id?'&concept='+encodeURIComponent(id):'')}
export function questionHref(id:string){return validQuestionId(id)?'/?question='+encodeURIComponent(id):'/'}
export function resolveNavigation(pathname:string,search:string):NavigationTarget{
 if(pathname==='/features'||pathname.startsWith('/features/'))return {view:'design',conceptId:null,questionId:null};
 const params=new URLSearchParams(search),question=params.get('question'),concept=params.get('concept'),requested=params.get('view');
 if(validQuestionId(question))return {view:'training',conceptId:null,questionId:question};
 if(concept&&concepts.some(c=>c.id===concept))return {view:'concepts',conceptId:concept,questionId:null};
 return {view:rootViews.includes(requested as typeof rootViews[number])?requested!:'dashboard',conceptId:null,questionId:null};
}

import BackendApp from './backend-app';
import {resolveNavigation} from './navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const values=await searchParams,params=new URLSearchParams();
 for(const [key,value] of Object.entries(values))if(typeof value==='string')params.set(key,value);else if(value?.[0])params.set(key,value[0]);
 const target=resolveNavigation('/',params.toString());
 return <BackendApp initialView={target.view} initialQuestion={target.questionId||undefined} initialConcept={target.conceptId||undefined}/>;
}

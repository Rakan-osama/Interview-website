import {featureGuides} from './feature-guides';
export const designSections=['read','flow','data','failures','practice','sim'] as const;
export type DesignSection=typeof designSections[number];
export type DesignProgress={lastGuide:string;section:DesignSection;checks:Record<string,boolean>;notes:Record<string,string>;anchor?:string};
export const emptyDesignProgress:DesignProgress={lastGuide:'blueprint',section:'read',checks:{},notes:{}};
export function validDesignProgress(p:unknown):p is DesignProgress{
 if(!p||typeof p!=='object')return false;
 const x=p as DesignProgress;
 return (x.anchor===undefined||['overview','example','global-flow','explanation','data-model','implementation','failures','tests','practice','sim','notes','resources'].includes(x.anchor))&&featureGuides.some(g=>g.id===x.lastGuide&&(x.section!=='sim'||!!g.sim))&&designSections.includes(x.section)&&!!x.checks&&typeof x.checks==='object'&&!Array.isArray(x.checks)&&Object.values(x.checks).every(v=>typeof v==='boolean')&&!!x.notes&&typeof x.notes==='object'&&!Array.isArray(x.notes)&&Object.values(x.notes).every(v=>typeof v==='string');
}

import BackendApp from '../../backend-app';
import {featureGuides} from '../../feature-guides';
import {notFound} from 'next/navigation';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const g=featureGuides.find(g=>g.id===slug);return {title:g?g.title+' — Backend Lab':'Feature غير موجودة — Backend Lab',description:g?.summary}}
export default async function FeaturePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!featureGuides.some(g=>g.id===slug))notFound();return <BackendApp featureRoute guideId={slug}/>}

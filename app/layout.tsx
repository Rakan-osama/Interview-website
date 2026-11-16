import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Backend Lab — Software Engineering Foundations',description:'مفاهيم وتمارين ومراجع ومشاريع لبناء أساس Software Engineering مع تطبيقات Backend وPHP وLaravel'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}

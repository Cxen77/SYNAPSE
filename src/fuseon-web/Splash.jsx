import { useEffect, useState } from 'react';
import Logo from './assets/logo';

/** App launch splash, shown once per app session (like a native splash screen). */
export default function Splash() {
    const [show, setShow] = useState(() => !sessionStorage.getItem('fuseon-splash-seen'));

    useEffect(() => {
        if (!show) return;
        sessionStorage.setItem('fuseon-splash-seen', '1');
        const t = setTimeout(() => setShow(false), 2300);
        return () => clearTimeout(t);
    }, [show]);

    if (!show) return null;
    return <SplashView animateOut />;
}

/** Static splash visuals; also used as the first paint before the app boots. */
export function SplashView({ animateOut = false }) {
    return (
        <div className={`${animateOut ? 'fuseon-splash ' : ''}fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-white dark:bg-black`} role="status" aria-label="Loading Fuseon">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[20%] w-[380px] h-[380px] bg-blue-300/40 rounded-full blur-[80px] animate-blob"></div>
                <div className="absolute -bottom-[10%] -right-[20%] w-[320px] h-[320px] bg-violet-300/40 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
            </div>
            <div className="relative flex flex-col items-center">
                <img src={Logo} alt="Fuseon" className={`${animateOut ? 'fuseon-splash-logo ' : ''}h-20 w-auto object-contain`} />
                <h1 className="mt-4 text-2xl font-bold text-gray-900 tracking-tight">Fuseon</h1>
                <p className="mt-1 text-sm text-gray-500">Events • Teams • Community</p>
                <div className="mt-8 h-1 w-32 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`${animateOut ? 'fuseon-splash-bar ' : 'scale-x-0 origin-left '}h-full w-full bg-blue-600 rounded-full`}></div>
                </div>
            </div>
        </div>
    );
}

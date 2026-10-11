import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FeatureProvider } from './context/FeatureContext';
import { SocketProvider } from './context/SocketContext';
import Splash from './Splash';

/** Same provider stack as the original web app's main.jsx. */
export default function AppProviders({ children }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <FeatureProvider>
                    <SocketProvider>
                        <Toaster position="top-center" toastOptions={{ duration: 3000 }} containerStyle={{ zIndex: 99999 }} />
                        {children}
                    </SocketProvider>
                </FeatureProvider>
            </AuthProvider>
            <Splash />
        </ThemeProvider>
    );
}

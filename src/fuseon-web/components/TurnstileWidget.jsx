import { useEffect } from 'react';

// Demo build: the captcha is auto-verified. Plug the real Turnstile widget
// (or a native equivalent in Expo) back in when the backend is connected.
const TurnstileWidget = ({ onVerify }) => {
    useEffect(() => {
        const t = setTimeout(() => onVerify?.('demo-captcha-token'), 150);
        return () => clearTimeout(t);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
};

export default TurnstileWidget;

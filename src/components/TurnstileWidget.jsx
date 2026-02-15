import React from 'react';
import Turnstile from 'react-turnstile';

const TurnstileWidget = ({ onVerify, onError }) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    if (!siteKey) {
        console.error("VITE_TURNSTILE_SITE_KEY is missing!");
        return <div className="text-red-500 text-xs">Captcha Config Missing</div>;
    }

    return (
        <div className="w-full flex justify-center my-2">
            <Turnstile
                sitekey={siteKey}
                onVerify={onVerify}
                onError={onError}
                theme="light"
            />
        </div>
    );
};

export default TurnstileWidget;

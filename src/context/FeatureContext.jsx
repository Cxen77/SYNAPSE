import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const FeatureContext = createContext({
    features: {},
    loading: true,
    isEnabled: () => true,
    isAllowed: () => true,
    refresh: () => { },
});

export function FeatureProvider({ children }) {
    const [features, setFeatures] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchFeatures = useCallback(async () => {
        try {
            const { data } = await api.get('/system/features');
            setFeatures(data.features || {});
        } catch (err) {
            console.error('[FeatureProvider] Failed to load features:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFeatures(); }, [fetchFeatures]);

    /**
     * Check if a feature is globally enabled
     */
    const isEnabled = useCallback((featureName) => {
        const feature = features[featureName];
        if (!feature) return true; // unknown features default to enabled
        return feature.enabled === true;
    }, [features]);

    /**
     * Check if a feature is enabled AND the given role is allowed
     */
    const isAllowed = useCallback((featureName, role) => {
        const feature = features[featureName];
        if (!feature) return true;
        if (!feature.enabled) return false;
        if (!feature.rolesAllowed || feature.rolesAllowed.length === 0) return true;
        return feature.rolesAllowed.includes(role);
    }, [features]);

    return (
        <FeatureContext.Provider value={{ features, loading, isEnabled, isAllowed, refresh: fetchFeatures }}>
            {children}
        </FeatureContext.Provider>
    );
}

export const useFeatures = () => useContext(FeatureContext);
export default FeatureContext;

import SystemSettings from '../models/SystemSettings.js';

/**
 * Feature gate middleware factory.
 * Usage: requireFeature('textPost')
 *
 * Checks:
 * 1. Feature exists and is enabled (403 if not)
 * 2. User's role is in rolesAllowed (403 if not)
 */
const requireFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const settings = await SystemSettings.getSettings();
            const feature = settings.features?.get(featureName);

            if (!feature || !feature.enabled) {
                return res.status(403).json({
                    message: `This feature is currently disabled`,
                    feature: featureName
                });
            }

            if (feature.rolesAllowed && feature.rolesAllowed.length > 0) {
                if (!feature.rolesAllowed.includes(req.user.role)) {
                    return res.status(403).json({
                        message: `Your role does not have access to this feature`,
                        feature: featureName
                    });
                }
            }

            next();
        } catch (err) {
            console.error(`[requireFeature] Error checking feature "${featureName}":`, err.message);
            // SECURITY: Fail closed — don't allow access if settings can't be read
            return res.status(503).json({
                message: 'Service temporarily unavailable — unable to verify feature access'
            });
        }
    };
};

export default requireFeature;

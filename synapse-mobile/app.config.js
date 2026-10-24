module.exports = ({ config }) => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  return {
    ...config,
    extra: { ...config.extra, ...(projectId ? { eas: { projectId } } : {}) },
    android: { ...config.android, ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {}) },
  };
};

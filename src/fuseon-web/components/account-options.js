export const INTERESTS = ['Hackathons', 'Workshops', 'Tech Talks', 'Coding Contests', 'Cultural', 'Sports', 'Networking', 'Design', 'Startups', 'Gaming', 'Robotics', 'Career Fairs'];
export const ROLES = ['Frontend', 'Backend', 'Full Stack', 'UI/UX Design', 'Mobile', 'AI / ML', 'Data Science', 'DevOps', 'Product', 'Marketing'];
export const SKILLS = ['React', 'Node.js', 'Python', 'Java', 'C++', 'Figma', 'Flutter', 'Kotlin', 'MongoDB', 'AWS', 'TensorFlow', 'Docker', 'Solidity', 'Public Speaking'];
export const emptyProfile = () => ({ name: '', username: '', interests: [], skills: [], preferredRole: '' });
export const profileReady = (profile) => Boolean(profile.name.trim() && /^[a-zA-Z0-9_]{3,24}$/.test(profile.username));
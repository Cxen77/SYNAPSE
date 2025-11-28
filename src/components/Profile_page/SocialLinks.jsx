import React from 'react';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaGlobe } from 'react-icons/fa';

const SocialLinks = ({ user }) => {
    if (!user || !user.socials) return null;

    const socialPlatforms = [
        {
            name: 'GitHub',
            icon: <FaGithub className="w-6 h-6" />,
            url: user.socials.github,
            username: user.socials.github?.replace('https://github.com/', '').replace('https://', ''),
            color: 'hover:bg-gray-900 hover:text-white',
            bgColor: 'bg-gray-100'
        },
        {
            name: 'LinkedIn',
            icon: <FaLinkedin className="w-6 h-6" />,
            url: user.socials.linkedin,
            username: user.socials.linkedin?.replace('https://linkedin.com/in/', '').replace('https://', ''),
            color: 'hover:bg-blue-600 hover:text-white',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Instagram',
            icon: <FaInstagram className="w-6 h-6" />,
            url: user.socials.instagram,
            username: user.socials.instagram?.replace('https://instagram.com/', '').replace('https://', ''),
            color: 'hover:bg-pink-600 hover:text-white',
            bgColor: 'bg-pink-100'
        },
        {
            name: 'Twitter',
            icon: <FaTwitter className="w-6 h-6" />,
            url: user.socials.twitter,
            username: user.socials.twitter?.replace('https://twitter.com/', '').replace('https://', ''),
            color: 'hover:bg-blue-400 hover:text-white',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Portfolio',
            icon: <FaGlobe className="w-6 h-6" />,
            url: user.socials.portfolio,
            username: user.socials.portfolio?.replace('https://', '').replace('http://', ''),
            color: 'hover:bg-purple-600 hover:text-white',
            bgColor: 'bg-purple-100'
        }
    ];

    // Filter out platforms without URLs
    const activePlatforms = socialPlatforms.filter(platform => platform.url && platform.url.trim() !== '');

    if (activePlatforms.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-pink-50 to-white border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Social Links</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-500 text-sm text-center">No social links added yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-pink-50 to-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Social Links</h3>
                <p className="text-sm text-gray-600 mt-1">Connect with me</p>
            </div>

            <div className="p-6 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activePlatforms.map((platform, index) => (
                        <a
                            key={index}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-4 p-4 ${platform.bgColor} rounded-lg ${platform.color} transition-all duration-300 group`}
                        >
                            <div className="text-gray-700 group-hover:text-inherit transition">
                                {platform.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 group-hover:text-inherit transition">{platform.name}</h4>
                                <p className="text-sm text-gray-600 group-hover:text-inherit transition truncate">
                                    {platform.username}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SocialLinks;

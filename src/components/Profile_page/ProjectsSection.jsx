import React from 'react';
import { Github, ExternalLink, FolderGit } from 'lucide-react';

const ProjectsSection = ({ user }) => {
    const projects = user?.projects || [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
                        Projects
                    </h3>
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold border border-gray-200">
                        {projects.length}
                    </span>
                </div>
            </div>

            <div className="p-6">
                {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No projects added yet.
                    </div>
                ) : (
                    <div className="flex overflow-x-auto pb-6 gap-6 snap-x custom-scrollbar">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="min-w-[320px] w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group snap-center flex flex-col"
                            >
                                {/* Project Thumbnail */}
                                <div className="h-48 overflow-hidden bg-gray-100 relative shrink-0">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>

                                {/* Project Info */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={project.title}>{project.title}</h4>
                                        <span
                                            className={`px-2.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${project.status === 'Completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {project.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{project.desc}</p>

                                    {/* Role Badge */}
                                    <div className="mb-4">
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                                            {project.role}
                                        </span>
                                    </div>

                                    {/* Tech Stack Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4 h-16 overflow-hidden content-start">
                                        {project.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs font-medium border border-gray-100"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer: Team & Links */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                        {/* Team Members */}
                                        {project.teamMembers && project.teamMembers.length > 0 ? (
                                            <div className="flex -space-x-2">
                                                {project.teamMembers.slice(0, 3).map((member, index) => (
                                                    <img
                                                        key={index}
                                                        src={member.avatar}
                                                        alt={member.name}
                                                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                                        title={member.name}
                                                    />
                                                ))}
                                                {project.teamMembers.length > 3 && (
                                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                        +{project.teamMembers.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : <div></div>}

                                        {/* Links */}
                                        <div className="flex gap-3">
                                            {project.github && (
                                                <a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-gray-900 transition"
                                                    title="GitHub"
                                                >
                                                    <Github className="w-5 h-5" />
                                                </a>
                                            )}
                                            {project.liveDemo && (
                                                <a
                                                    href={project.liveDemo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-blue-600 transition"
                                                    title="Live Demo"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsSection;

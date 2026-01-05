"use client";

import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { STATE_COLORS, PROJECT_TYPE_ICONS, DEFAULT_PROJECT_ICON } from "@/app/lib/constants";

interface Tag {
    id: string;
    name: string;
}

interface StateHistory {
    id: string;
    state: string;
    changedAt: string | null;
}

export interface Project {
    id: string;
    name: string | null;
    type: string | null;
    startAt: string | null;
    endAt: string | null;
    state: string;
    description: string | null;
    notes: string | null;
    isConsider: boolean;
    order: number;
    tags: Tag[];
    stateHistory: StateHistory[];
}

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
    isDragging?: boolean;
}

const formatDate = (date: string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", { timeZone: "UTC" });
};

export const ProjectCardContent = forwardRef<HTMLDivElement, ProjectCardProps & { dragHandleProps?: React.HTMLAttributes<HTMLDivElement> }>(
    ({ project, onEdit, onDelete, isDragging, dragHandleProps }, ref) => {
        const stateColor = STATE_COLORS[project.state] || "bg-state-sin-iniciar";
        const TypeIcon = project.type ? (PROJECT_TYPE_ICONS[project.type] || DEFAULT_PROJECT_ICON) : DEFAULT_PROJECT_ICON;

        return (
            <div
                ref={ref}
                className={`bg-bg-card rounded-lg p-3 sm:p-4 border border-border hover:border-border-light transition ${isDragging ? "opacity-50 shadow-lg" : ""}`}
            >
                {/* Mobile layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                    {/* Header row: drag + icon + name + state */}
                    <div className="flex items-center gap-2">
                        <div
                            {...dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary p-1 shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="6" r="1.5" />
                                <circle cx="15" cy="6" r="1.5" />
                                <circle cx="9" cy="12" r="1.5" />
                                <circle cx="15" cy="12" r="1.5" />
                                <circle cx="9" cy="18" r="1.5" />
                                <circle cx="15" cy="18" r="1.5" />
                            </svg>
                        </div>
                        <div className="text-text-muted shrink-0" title={project.type || "Sin tipo"}>
                            <TypeIcon size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-text-primary truncate flex-1 min-w-0">
                            {project.name || "-"}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs text-white shrink-0 ${stateColor}`}>
                            {project.state}
                        </span>
                    </div>

                    {/* Description */}
                    {project.description && (
                        <p className="text-sm text-text-secondary line-clamp-2">
                            {project.description}
                        </p>
                    )}

                    {/* Dates row */}
                    <div className="flex gap-4 text-xs text-text-muted">
                        <span>Inicio: {formatDate(project.startAt)}</span>
                        <span>Fin: {formatDate(project.endAt)}</span>
                    </div>

                    {/* Tags */}
                    {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag.id}
                                    className="px-2 py-0.5 bg-bg-tertiary rounded text-xs text-text-muted"
                                >
                                    {tag.name}
                                </span>
                            ))}
                            {project.tags.length > 3 && (
                                <span className="text-xs text-text-muted">+{project.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(project)}
                            className="flex-1 px-3 py-2 bg-accent hover:bg-accent-hover text-bg-primary rounded transition text-sm"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => onDelete(project.id)}
                            className="flex-1 px-3 py-2 bg-error/20 hover:bg-error/30 text-error rounded transition text-sm"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:flex items-center gap-4">
                    {/* Drag handle */}
                    <div
                        {...dragHandleProps}
                        className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="6" r="1.5" />
                            <circle cx="15" cy="6" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="18" r="1.5" />
                            <circle cx="15" cy="18" r="1.5" />
                        </svg>
                    </div>

                    {/* Type icon */}
                    <div className="text-text-muted shrink-0" title={project.type || "Sin tipo"}>
                        <TypeIcon size={24} />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-text-primary truncate">
                                {project.name || "-"}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs text-white shrink-0 ${stateColor}`}>
                                {project.state}
                            </span>
                        </div>
                        {project.description && (
                            <p className="text-sm text-text-secondary truncate">
                                {project.description}
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="hidden md:flex gap-4 text-xs text-text-muted shrink-0">
                        <span>Inicio: {formatDate(project.startAt)}</span>
                        <span>Fin: {formatDate(project.endAt)}</span>
                    </div>

                    {/* Tags */}
                    {project.tags.length > 0 && (
                        <div className="hidden lg:flex gap-1 shrink-0">
                            {project.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag.id}
                                    className="px-2 py-0.5 bg-bg-tertiary rounded text-xs text-text-muted"
                                >
                                    {tag.name}
                                </span>
                            ))}
                            {project.tags.length > 3 && (
                                <span className="text-xs text-text-muted">+{project.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => onEdit(project)}
                            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg-primary rounded transition text-sm"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => onDelete(project.id)}
                            className="px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error rounded transition text-sm"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);

ProjectCardContent.displayName = "ProjectCardContent";

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ProjectCardContent
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                isDragging={isDragging}
                dragHandleProps={listeners}
            />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { PROJECT_STATES, PROJECT_TYPES, STATE_COLORS } from "@/app/lib/constants";

interface Tag {
    id: string;
    name: string;
}

interface StateHistory {
    id: string;
    state: string;
    changedAt: string | null;
}

interface Project {
    id: string;
    name: string | null;
    type: string | null;
    startAt: string | null;
    endAt: string | null;
    state: string;
    description: string | null;
    notes: string | null;
    isConsider: boolean;
    tags: Tag[];
    stateHistory: StateHistory[];
}

interface ProjectFormData {
    name: string | null;
    type: string | null;
    startAt: string | null;
    endAt: string | null;
    state: string;
    description: string | null;
    notes: string | null;
    isConsider: boolean;
    tags: string[];
}

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProjectFormData) => Promise<boolean>;
    defaultIsConsider: boolean;
}

export default function ProjectModal({
    project,
    isOpen,
    onClose,
    onSave,
    defaultIsConsider,
}: ProjectModalProps) {
    const [form, setForm] = useState({
        name: "",
        type: "",
        startAt: "",
        endAt: "",
        state: "Sin iniciar",
        description: "",
        notes: "",
        isConsider: defaultIsConsider,
        tags: "",
    });
    const [history, setHistory] = useState<StateHistory[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (project) {
            setForm({
                name: project.name || "",
                type: project.type || "",
                startAt: project.startAt ? project.startAt.split("T")[0] : "",
                endAt: project.endAt ? project.endAt.split("T")[0] : "",
                state: project.state,
                description: project.description || "",
                notes: project.notes || "",
                isConsider: project.isConsider,
                tags: project.tags.map((t) => t.name).join(", "),
            });
            setHistory(project.stateHistory);
        } else {
            setForm({
                name: "",
                type: "",
                startAt: "",
                endAt: "",
                state: "Sin iniciar",
                description: "",
                notes: "",
                isConsider: defaultIsConsider,
                tags: "",
            });
            setHistory([]);
        }
    }, [project, defaultIsConsider]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const tags = form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        await onSave({
            ...form,
            startAt: form.startAt || null,
            endAt: form.endAt || null,
            tags,
        });
        setIsSaving(false);
    };

    const updateHistoryDate = async (historyId: string, date: string) => {
        if (!project) return;
        await fetch(`/api/projects/${project.id}/history`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historyId, changedAt: date || null }),
        });
        setHistory((prev) =>
            prev.map((h) => (h.id === historyId ? { ...h, changedAt: date || null } : h))
        );
    };

    const deleteHistory = async (historyId: string) => {
        if (!project) return;
        await fetch(`/api/projects/${project.id}/history`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historyId }),
        });
        setHistory((prev) => prev.filter((h) => h.id !== historyId));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-secondary rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                        {project ? "Editar Proyecto" : "Nuevo Proyecto"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Tipo</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg"
                                >
                                    <option value="">Seleccionar...</option>
                                    {PROJECT_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Fecha inicio</label>
                                <input
                                    type="date"
                                    value={form.startAt}
                                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Fecha fin</label>
                                <input
                                    type="date"
                                    value={form.endAt}
                                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Estado</label>
                            <select
                                value={form.state}
                                onChange={(e) => setForm({ ...form, state: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg"
                            >
                                {PROJECT_STATES.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Descripción</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Notas</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">
                                Tags (separados por coma)
                            </label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                placeholder="web, personal, urgente"
                                className="w-full px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isConsider"
                                checked={form.isConsider}
                                onChange={(e) => setForm({ ...form, isConsider: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="isConsider" className="text-sm text-text-secondary">
                                Considerar (mostrar en pestaña principal)
                            </label>
                        </div>

                        {project && history.length > 0 && (
                            <div className="border-t border-border pt-4">
                                <h3 className="text-sm font-semibold mb-2">Historial de estados</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {history.map((h) => (
                                        <div key={h.id} className="flex items-center gap-2 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs text-white ${STATE_COLORS[h.state] || "bg-state-sin-iniciar"}`}>
                                                {h.state}
                                            </span>
                                            <input
                                                type="datetime-local"
                                                value={h.changedAt ? h.changedAt.slice(0, 16) : ""}
                                                onChange={(e) => updateHistoryDate(h.id, e.target.value)}
                                                className="px-2 py-1 rounded text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => deleteHistory(h.id)}
                                                className="text-error hover:text-error/80"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving && (
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isSaving ? "Guardando..." : (project ? "Guardar" : "Crear")}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

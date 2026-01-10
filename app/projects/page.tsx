"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ProjectSearch from "@/app/components/ProjectSearch";
import ProjectCard, { Project } from "@/app/components/ProjectCard";
import ProjectModal from "@/app/components/ProjectModal";
import Toast from "@/app/components/Toast";

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// Cache de proyectos por parámetros de búsqueda
type ProjectCache = Map<string, Project[]>;

export default function ProjectsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"consider" | "other" | "finished">("consider");
    const [projects, setProjects] = useState<Project[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    // Filtros compartidos
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("order");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filterState, setFilterState] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterTag, setFilterTag] = useState("");

    // Debounce para búsqueda y tag (300ms)
    const debouncedSearch = useDebounce(search, 300);
    const debouncedFilterTag = useDebounce(filterTag, 300);

    // Indicador de que hay una búsqueda pendiente
    const isSearchPending = search !== debouncedSearch || filterTag !== debouncedFilterTag;

    // Cache de proyectos y ref para evitar fetch duplicados
    const projectCache = useRef<ProjectCache>(new Map());
    const lastFetchParams = useRef<string>("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Parámetros de fetch memorizados para evitar recálculos innecesarios
    const fetchParams = useMemo(() => {
        const params = new URLSearchParams({
            search: debouncedSearch,
            sortBy,
            sortOrder,
            state: activeTab === "finished" ? "Terminado" : filterState,
            type: filterType,
            tag: debouncedFilterTag,
        });

        if (activeTab !== "finished") {
            params.set("isConsider", (activeTab === "consider").toString());
        }

        return params.toString();
    }, [activeTab, debouncedSearch, sortBy, sortOrder, filterState, filterType, debouncedFilterTag]);

    const fetchProjects = useCallback(async (forceRefresh = false) => {
        // Evitar fetch duplicados si los parámetros no cambiaron
        if (!forceRefresh && lastFetchParams.current === fetchParams) {
            return;
        }

        lastFetchParams.current = fetchParams;

        // Si hay cache y no es refresh forzado, usar cache inmediatamente
        const cached = projectCache.current.get(fetchParams);
        if (cached && !forceRefresh) {
            setProjects(cached);
            setInitialLoading(false);
            return;
        }

        // Si no hay cache, limpiar proyectos y mostrar loading
        if (!cached) {
            setProjects([]);
            setInitialLoading(true);
        }

        setIsFetching(true);

        try {
            const res = await fetch(`/api/projects?${fetchParams}`);
            if (res.ok) {
                const data = await res.json();
                // Guardar en cache
                projectCache.current.set(fetchParams, data);
                setProjects(data);
            }
        } finally {
            setInitialLoading(false);
            setIsFetching(false);
        }
    }, [fetchParams]);

    // Invalidar cache cuando se modifica un proyecto
    const invalidateCache = useCallback(() => {
        projectCache.current.clear();
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchProjects();
        }
    }, [status, fetchProjects]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = projects.findIndex((p) => p.id === active.id);
            const newIndex = projects.findIndex((p) => p.id === over.id);

            const newProjects = [...projects];
            const [movedProject] = newProjects.splice(oldIndex, 1);
            newProjects.splice(newIndex, 0, movedProject);

            // Actualizar orden local inmediatamente
            setProjects(newProjects);

            // Actualizar cache con el nuevo orden
            projectCache.current.set(fetchParams, newProjects);

            // Guardar nuevo orden en el servidor
            const projectIds = newProjects.map((p) => p.id);
            await fetch("/api/projects/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectIds }),
            });
        }
    };

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

    const handleSave = async (data: ProjectFormData): Promise<boolean> => {
        const url = editingProject
            ? `/api/projects/${editingProject.id}`
            : "/api/projects";
        const method = editingProject ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setModalOpen(false);
                setEditingProject(null);
                setToast({
                    message: editingProject ? "Proyecto actualizado correctamente" : "Proyecto creado correctamente",
                    type: "success",
                    isVisible: true,
                });
                invalidateCache();
                fetchProjects(true);
                return true;
            } else {
                setToast({
                    message: "Error al guardar el proyecto",
                    type: "error",
                    isVisible: true,
                });
                return false;
            }
        } catch {
            setToast({
                message: "Error de conexión",
                type: "error",
                isVisible: true,
            });
            return false;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este proyecto?")) return;

        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (res.ok) {
            invalidateCache();
            fetchProjects(true);
        }
    };

    const openNewProject = () => {
        setEditingProject(null);
        setModalOpen(true);
    };

    const openEditProject = (project: Project) => {
        setEditingProject(project);
        setModalOpen(true);
    };

    // Drag habilitado cuando: ordenado por "order", sin búsqueda, sin filtro de tag
    // Permitimos drag con filtro de tipo porque el orden se mantiene dentro del subset filtrado
    // Para el tab "other", el filtro de estado por defecto es "Sin iniciar", así que lo permitimos
    const isDefaultStateFilter = activeTab === "other" ? filterState === "Sin iniciar" : !filterState;
    const isDragEnabled = useMemo(() =>
        sortBy === "order" && !debouncedSearch && isDefaultStateFilter && !debouncedFilterTag && activeTab !== "finished",
        [sortBy, debouncedSearch, isDefaultStateFilter, debouncedFilterTag, activeTab]
    );

    // Memorizar la lista de proyectos para evitar re-renders innecesarios
    const projectList = useMemo(() => projects, [projects]);

    // Solo mostrar pantalla de carga en la carga inicial
    if (status === "loading" || initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-text-muted">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">Proyectos</h1>
                <button
                    onClick={openNewProject}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition text-sm sm:text-base w-full sm:w-auto"
                >
                    + Nuevo Proyecto
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => {
                        setActiveTab("consider");
                        setSortBy("order");
                        setSortOrder("asc");
                        setFilterState("");
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${activeTab === "consider"
                        ? "bg-accent text-bg-primary"
                        : "bg-bg-card hover:bg-bg-hover"
                        }`}
                >
                    Considerados
                </button>
                <button
                    onClick={() => {
                        setActiveTab("other");
                        setSortBy("order");
                        setSortOrder("asc");
                        setFilterState("Sin iniciar");
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${activeTab === "other"
                        ? "bg-accent text-bg-primary"
                        : "bg-bg-card hover:bg-bg-hover"
                        }`}
                >
                    Otros
                </button>
                <button
                    onClick={() => {
                        setActiveTab("finished");
                        setSortBy("lastUpdateAt");
                        setSortOrder("desc");
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${activeTab === "finished"
                        ? "bg-state-terminado text-white"
                        : "bg-bg-card hover:bg-bg-hover"
                        }`}
                >
                    Terminados
                </button>
            </div>

            {/* Búsqueda compartida */}
            <ProjectSearch
                search={search}
                setSearch={setSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                filterState={filterState}
                setFilterState={setFilterState}
                filterType={filterType}
                setFilterType={setFilterType}
                filterTag={filterTag}
                setFilterTag={setFilterTag}
                hideStateFilter={activeTab === "finished"}
                isSearchPending={isSearchPending || isFetching}
            />

            {/* Lista de proyectos */}
            {projectList.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                    <p>No hay proyectos en esta categoría</p>
                </div>
            ) : isDragEnabled ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={projectList.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col gap-3">
                            {projectList.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onEdit={openEditProject}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="flex flex-col gap-3">
                    {projectList.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={openEditProject}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <ProjectModal
                project={editingProject}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingProject(null);
                }}
                onSave={handleSave}
                defaultIsConsider={activeTab === "consider" || activeTab === "finished"}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

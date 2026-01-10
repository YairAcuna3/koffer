"use client";

import { PROJECT_STATES, PROJECT_TYPES } from "@/app/lib/constants";

interface ProjectSearchProps {
    search: string;
    setSearch: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
    filterState: string;
    setFilterState: (value: string) => void;
    filterType: string;
    setFilterType: (value: string) => void;
    filterTag: string;
    setFilterTag: (value: string) => void;
    hideStateFilter?: boolean;
    isSearchPending?: boolean;
}

export default function ProjectSearch({
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterState,
    setFilterState,
    filterType,
    setFilterType,
    filterTag,
    setFilterTag,
    hideStateFilter = false,
    isSearchPending = false,
}: ProjectSearchProps) {
    return (
        <div className="bg-bg-card rounded-lg p-3 sm:p-4 mb-6 space-y-3 sm:space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar proyectos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base pr-10"
                />
                {isSearchPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 ${hideStateFilter ? 'lg:grid-cols-5' : 'lg:grid-cols-6'}`}>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm sm:text-base"
                >
                    <option value="order">Orden de usuario</option>
                    <option value="createdAt">Fecha creación</option>
                    <option value="startAt">Fecha inicio</option>
                    <option value="endAt">Fecha fin</option>
                    <option value="lastUpdateAt">Fecha actualización</option>
                    <option value="name">Alfabético</option>
                    <option value="state">Estado</option>
                    <option value="type">Tipo</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm sm:text-base"
                >
                    <option value="asc">Ascendente</option>
                    <option value="desc">Descendente</option>
                </select>
                {!hideStateFilter && (
                    <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm sm:text-base"
                    >
                        <option value="">Todos los estados</option>
                        {PROJECT_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                )}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm sm:text-base"
                >
                    <option value="">Todos los tipos</option>
                    {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Filtrar por tag..."
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm sm:text-base"
                />
                <button
                    onClick={() => {
                        setSearch("");
                        setSortBy("order");
                        setSortOrder("asc");
                        setFilterState("");
                        setFilterType("");
                        setFilterTag("");
                    }}
                    className="px-3 py-2 bg-bg-tertiary hover:bg-bg-hover rounded-lg transition text-sm sm:text-base"
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

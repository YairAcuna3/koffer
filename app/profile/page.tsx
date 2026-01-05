"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bio, setBio] = useState("");
    const [photo, setPhoto] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/user");
            if (res.ok) {
                const data = await res.json();
                setBio(data.bio || "");
                setPhoto(data.photo || "");
            }
            setLoading(false);
        };

        if (session) fetchUser();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const res = await fetch("/api/user", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bio, photo }),
        });

        setSaving(false);

        if (res.ok) {
            setMessage("Perfil actualizado");
        } else {
            setMessage("Error al actualizar");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-text-muted">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>

            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-bg-tertiary overflow-hidden flex items-center justify-center">
                        {photo ? (
                            <img
                                src={photo}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl text-text-muted">
                                {session?.user?.name?.[0]?.toUpperCase() || "?"}
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
                        <p className="text-text-muted text-sm">Usuario</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-1">
                            URL de foto de perfil
                        </label>
                        <input
                            type="url"
                            value={photo}
                            onChange={(e) => setPhoto(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full px-4 py-2 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            placeholder="Cuéntanos sobre ti..."
                            className="w-full px-4 py-2 rounded-lg resize-none"
                        />
                    </div>

                    {message && (
                        <p className={message.includes("Error") ? "text-error" : "text-success"}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition disabled:opacity-50"
                    >
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
}

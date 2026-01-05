"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            name,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Credenciales inválidas");
        } else {
            router.push("/projects");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-bg-secondary rounded-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-accent mb-2">Koffer</h1>
                <p className="text-center text-text-muted mb-6">Inicia sesión</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg"
                        />
                    </div>

                    {error && <p className="text-error text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="text-center text-text-muted mt-4">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-accent hover:underline">
                        Regístrate
                    </Link>
                </p>
            </div>
        </div>
    );
}

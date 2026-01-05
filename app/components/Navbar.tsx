"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

function LogoutIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (!session) return null;

    const userImage = session.user?.image;
    const userName = session.user?.name || "Usuario";

    return (
        <nav className="bg-bg-secondary border-b border-border px-4 sm:px-6 py-3 sm:py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/projects" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-accent">
                    <Image
                        src="/logo.png"
                        alt="Koffer Logo"
                        width={28}
                        height={28}
                        className="object-contain sm:w-8 sm:h-8"
                        unoptimized
                    />
                    Koffer
                </Link>
                <div className="flex items-center gap-3 sm:gap-5">
                    <Link
                        href="/projects"
                        className={`text-sm sm:text-base hover:text-accent transition ${pathname === "/projects" ? "text-accent" : "text-text-secondary"
                            }`}
                    >
                        Proyectos
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="text-text-muted hover:text-error transition p-1.5 rounded-md hover:bg-error/10"
                        title="Cerrar sesión"
                    >
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                    <Link href="/profile" className="shrink-0" title="Ver perfil">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName}
                                width={36}
                                height={36}
                                className="rounded-full object-cover border-2 border-border hover:border-accent transition w-8 h-8 sm:w-9 sm:h-9"
                            />
                        ) : (
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm sm:text-base border-2 border-border hover:border-accent transition">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}

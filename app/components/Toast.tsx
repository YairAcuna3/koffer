"use client";

import { useEffect } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    isVisible: boolean;
    onClose: () => void;
}

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div
                className={`px-4 py-3 rounded-lg shadow-lg border-2 ${type === "success"
                        ? "bg-bg-secondary border-green-500 text-green-400"
                        : "bg-bg-secondary border-red-500 text-red-400"
                    }`}
            >
                <div className="flex items-center gap-2">
                    {type === "success" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span>{message}</span>
                </div>
            </div>
        </div>
    );
}

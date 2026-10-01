"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogIn, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Props {
    title?: string;
    error: string;
    showLoginButton?: boolean;
}

export function ErrorView({
    title = "Erro ao carregar dados",
    error,
    showLoginButton,
}: Props) {
    const isAuthError =
        showLoginButton ??
        (error.toLowerCase().includes("permissão") ||
            error.toLowerCase().includes("autenticado") ||
            error.toLowerCase().includes("sessão") ||
            error.toLowerCase().includes("token"));

    useEffect(() => {
        console.error(`[Frontend Error] ${title}:`, error);
        toast.add({
            type: "error",
            title,
            description: error,
            priority: "high",
        });
    }, [title, error]);

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center p-6 min-h-[50vh]">
            <Empty className="rounded-xl border bg-card/60 p-8 shadow-sm">
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive size-10">
                        <AlertCircle className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-base font-semibold text-foreground">{title}</EmptyTitle>
                    <EmptyDescription className="text-muted-foreground text-sm max-w-sm">
                        {error}
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-3 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="gap-1.5"
                    >
                        <RefreshCw className="size-3.5" />
                        Tentar novamente
                    </Button>
                    {isAuthError && (
                        <Button
                            render={<Link href="/login" />}
                            size="sm"
                            className="gap-1.5"
                        >
                            <LogIn className="size-3.5" />
                            Fazer login novamente
                        </Button>
                    )}
                </EmptyContent>
            </Empty>
        </div>
    );
}

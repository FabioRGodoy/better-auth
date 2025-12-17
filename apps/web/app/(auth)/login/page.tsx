"use client";

import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import Link from "next/link";
import { SignupState } from "@/lib/definitions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    login,
    {}
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground">
            Entre com sua conta para continuar
          </p>
        </div>

        <div className="border bg-card p-8 rounded-lg shadow-xl">
          <form action={action} className="flex flex-col space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="h-11"
              />
              {state?.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-11"
              />
              {state?.errors?.password && (
                <div className="mt-1">
                  <p className="text-sm text-destructive mb-1">
                    A senha deve conter:
                  </p>
                  <ul className="space-y-0.5">
                    {state.errors.password.map((error) => (
                      <li key={error} className="text-xs text-destructive/80">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button type="submit" disabled={pending} className="h-11 mt-2">
              {pending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

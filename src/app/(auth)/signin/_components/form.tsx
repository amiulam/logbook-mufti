"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas";
import type z from "zod";
import { signInWithEmail } from "@/services/auth";

export default function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const res = await signInWithEmail(values);

    if (res && !res.success) {
      setError(res.message);
      return;
    }
  };

  return (
    <Form {...form}>
      <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Selamat datang kembali</h1>
            <p className="text-muted-foreground text-balance">
              Masuk ke akun anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/15 border-destructive/20 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="*******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Loading..." : "Sign in"}
          </Button>
          <div className="text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}

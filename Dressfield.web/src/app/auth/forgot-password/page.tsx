"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setSent(true); // Don't reveal if email exists
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">პაროლის აღდგენა</CardTitle>
          <CardDescription>
            {sent
              ? "ბმული გამოგზავნილია თქვენს ელ-ფოსტაზე"
              : "შეიყვანეთ თქვენი ელ-ფოსტა"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ელ-ფოსტა</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
                disabled={loading}
              >
                {loading ? "იგზავნება..." : "გაგზავნა"}
              </Button>
            </form>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              თუ ეს ელ-ფოსტა რეგისტრირებულია, მიიღებთ პაროლის აღდგენის ბმულს.
            </p>
          )}
          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-accent hover:underline"
            >
              შესვლაზე დაბრუნება
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

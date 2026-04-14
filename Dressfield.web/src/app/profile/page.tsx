"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Package, Shield, Pencil, Trash2, X, Check, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl bg-black/[0.03] px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading, isAdmin, updateProfile, deleteAccount } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    city: "",
  });

  function openEdit() {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phoneNumber ?? user?.phone ?? "",
      addressLine1: user?.addressLine1 ?? "",
      city: user?.city ?? "",
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("სახელი და გვარი აუცილებელია");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined,
      });
      toast.success("პროფილი განახლდა");
      setEditing(false);
    } catch {
      toast.error("განახლება ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("ანგარიში წაიშალა");
      router.push("/");
    } catch {
      toast.error("წაშლა ვერ მოხერხდა");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        იტვირთება...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">პროფილის სანახავად გაიარეთ ავტორიზაცია.</p>
        <Link
          href="/auth/login"
          className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          შესვლა
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-ui text-2xl font-semibold">პროფილი</h1>

      {/* ── Personal info ── */}
      <section className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{`${user.firstName} ${user.lastName}`.trim() || "მომხმარებელი"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Pencil className="h-4 w-4" />
              რედაქტირება
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">სახელი</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">გვარი</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">ტელეფონი</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+995 5XX XXX XXX"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addressLine1">მისამართი</Label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                placeholder="ქუჩა, N"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">ქალაქი</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="თბილისი"
                className="h-10"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent hover:bg-accent-hover text-white h-9 px-4"
              >
                <Check className="h-4 w-4 mr-1.5" />
                {saving ? "ინახება..." : "შენახვა"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="h-9 px-4"
              >
                <X className="h-4 w-4 mr-1.5" />
                გაუქმება
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Field label="ტელეფონი" value={user.phoneNumber ?? user.phone} />
            <Field label="ქალაქი" value={user.city} />
            <Field label="მისამართი" value={user.addressLine1} />
          </div>
        )}
      </section>

      {/* ── Payment methods ── */}
      <section className="rounded-2xl border border-black/8 bg-white p-6 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">გადახდის მეთოდები</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          ბარათის შენახვა ხელმისაწვდომი იქნება მომავალ განახლებაში. გადახდა ხდება Bank of Georgia iPay-ის გვერდზე.
        </p>
      </section>

      {/* ── Actions ── */}
      <section className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 transition-colors"
          >
            <Package className="h-4 w-4" />
            ჩემი შეკვეთები
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-black/90 transition-colors"
            >
              <Shield className="h-4 w-4" />
              ადმინ პანელი
            </Link>
          )}
        </div>

        <div className="border-t border-black/8 pt-4">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              ანგარიშის წაშლა
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600">დარწმუნებული ხარ? ეს მოქმედება შეუქცევადია.</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? "იშლება..." : "დიახ, წაშლა"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="h-9 px-4"
                >
                  გაუქმება
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

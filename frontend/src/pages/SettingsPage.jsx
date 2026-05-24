import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { SettingsFormSkeleton } from "../components/dashboard/DashboardSkeleton";
import ThemeToggle from "../components/dashboard/ThemeToggle";
import { getInitials, saveUser } from "../lib/auth";
import { formatDateTime } from "../lib/format";
import { fetchProfile, updateProfile } from "../lib/api";

const emptyForm = {
  first_name: "",
  last_name: "",
  phone_number: "",
};

export default function SettingsPage() {
  const { user: contextUser, refreshUser } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await fetchProfile();
      setProfile(data);
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number ?? "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updated = await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim() || null,
      });
      setProfile(updated);
      saveUser({
        first_name: updated.first_name,
        last_name: updated.last_name,
        email: updated.email,
        phone_number: updated.phone_number,
        role: updated.role ?? contextUser?.role,
      });
      refreshUser?.();
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const displayUser = profile ?? contextUser;
  const initials = displayUser
    ? getInitials(displayUser.first_name, displayUser.last_name)
    : "?";

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Manage your caregiver profile and account details.
        </p>
      </div>

      {loading && <SettingsFormSkeleton />}

      {error && !profile && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={loadProfile} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && displayUser && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
          <aside className="dashboard-card-hover rounded-2xl bg-card/75 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {initials}
              </div>
              <h2 className="mt-4 text-lg font-bold text-foreground">
                {displayUser.first_name} {displayUser.last_name}
              </h2>
              <p className="mt-1 text-sm text-muted">{displayUser.email}</p>
              {profile?.created_at && (
                <p className="mt-3 text-xs text-muted">
                  Member since {formatDateTime(profile.created_at)}
                </p>
              )}
            </div>
          </aside>

          <section className="rounded-2xl bg-card/75 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <h2 className="text-lg font-bold text-foreground">Profile</h2>
            <p className="mt-1 text-sm text-muted">
              Update your name and contact number. Email cannot be changed here.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {error && profile && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">
                  {success}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="settings-first-name"
                  label="First name"
                  required
                  value={form.first_name}
                  onChange={updateField("first_name")}
                  disabled={saving}
                />
                <Input
                  id="settings-last-name"
                  label="Last name"
                  required
                  value={form.last_name}
                  onChange={updateField("last_name")}
                  disabled={saving}
                />
              </div>

              <Input
                id="settings-email"
                label="Email"
                type="email"
                value={profile?.email ?? displayUser.email}
                disabled
              />

              <Input
                id="settings-phone"
                label="Phone number"
                type="tel"
                placeholder="0712345678"
                value={form.phone_number}
                onChange={updateField("phone_number")}
                disabled={saving}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>

            <div className="mt-8 border-t border-border/40 pt-6">
              <h3 className="text-base font-bold text-foreground">Appearance</h3>
              <p className="mt-1 text-sm text-muted">
                Pick light or dark mode for the app. This setting is stored on
                this device.
              </p>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

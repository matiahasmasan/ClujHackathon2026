import { useMemo, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import AddUserModal from "../components/admin/AddUserModal";
import EditUserModal from "../components/admin/EditUserModal";
import DeleteUserModal from "../components/admin/DeleteUserModal";
import {
  ListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { getInitials } from "../lib/auth";
import { fetchUsers } from "../lib/api";

function RoleBadge({ role }) {
  const styles =
    role === "admin"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {role ?? "—"}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    fetchUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      caregivers: users.filter((u) => u.role === "caregiver").length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Users
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              All registered accounts on the platform. Create, edit, or remove
              users as needed.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={() => setAddOpen(true)}
          >
            + Add user
          </Button>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">Search users</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, email, or role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/75 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {/* Stat cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total users"
            value={String(stats.total)}
            sub="Registered accounts"
            icon="users"
          />
          <StatCard
            label="Admins"
            value={String(stats.admins)}
            sub="Platform administrators"
            icon="alert"
          />
          <StatCard
            label="Caregivers"
            value={String(stats.caregivers)}
            sub="Active caregivers"
            icon="phone"
          />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={3} />
          <ListSkeleton rows={4} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No users yet. Use &quot;+ Add user&quot; above to create one.
          </p>
        </div>
      )}

      {!loading && !error && users.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No users match &quot;{query}&quot;.
          </p>
        </div>
      )}

      {/* Users list */}
      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {filtered.map((user) => {
            const name = `${user.first_name} ${user.last_name}`;
            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{name}</p>
                    <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">
                          Email
                        </dt>
                        <dd>{user.email}</dd>
                      </div>
                      {user.phone_number && (
                        <div className="flex gap-1">
                          <dt className="font-medium text-foreground/70">
                            Phone
                          </dt>
                          <dd>{user.phone_number}</dd>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">
                          Joined
                        </dt>
                        <dd>
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-1.5">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setEditTarget(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                    onClick={() => setDeleteTarget(user)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(newUser) => setUsers((prev) => [...prev, newUser])}
      />

      <EditUserModal
        open={editTarget !== null}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={(updated) =>
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        }
      />

      <DeleteUserModal
        open={deleteTarget !== null}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() =>
          setUsers((prev) => prev.filter((u) => u.id !== deleteTarget?.id))
        }
      />
    </main>
  );
}

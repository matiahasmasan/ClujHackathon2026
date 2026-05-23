import { useEffect, useState } from "react";
import { fetchUsers } from "../lib/api";
import AddUserModal from "../components/admin/AddUserModal";
import EditUserModal from "../components/admin/EditUserModal";
import DeleteUserModal from "../components/admin/DeleteUserModal";

function RoleBadge({ role }) {
  const styles =
    role === "admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {role ?? "—"}
    </span>
  );
}

function IconEdit() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-0.5 text-sm text-muted">
            All registered accounts on the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {users.length} total
          </span>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add user
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/40 bg-white/70 backdrop-blur-sm">
        {loading && (
          <p className="p-8 text-center text-sm text-muted">Loading users…</p>
        )}
        {error && (
          <p className="p-8 text-center text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-black/2">
                  <th className="px-4 py-3 text-left font-semibold text-muted">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-black/2"
                  >
                    <td className="px-4 py-3 text-muted">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3 text-muted">
                      {user.phone_number ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditTarget(user)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-foreground"
                          aria-label={`Edit ${user.first_name}`}
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${user.first_name}`}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
          setUsers((prev) =>
            prev.map((u) => (u.id === updated.id ? updated : u)),
          )
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

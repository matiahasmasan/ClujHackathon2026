import { useEffect, useState } from "react";
import { fetchUsers } from "../lib/api";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {users.length} total
        </span>
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
                <tr className="border-b border-border/40 bg-black/[0.02]">
                  <th className="px-4 py-3 text-left font-semibold text-muted">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-black/[0.02]"
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
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

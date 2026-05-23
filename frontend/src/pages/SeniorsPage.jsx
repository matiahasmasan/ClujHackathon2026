import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import { getInitials } from "../lib/auth";
import { fetchSeniors } from "../lib/api";

export default function SeniorsPage() {
  const { seniorsVersion } = useOutletContext();
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSeniors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSeniors();
      setSeniors(data.seniors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeniors();
  }, [loadSeniors, seniorsVersion]);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-white/75 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">Seniors</h1>
        <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
          Everyone in your care circle.
        </p>
      </div>

      {loading && (
        <p className="text-center text-sm text-muted">Loading seniors…</p>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={loadSeniors} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && seniors.length === 0 && (
        <p className="rounded-2xl bg-white/75 p-6 text-center text-sm text-muted shadow-sm">
          No seniors yet. Use &quot;+ Add senior&quot; to add someone to your
          circle.
        </p>
      )}

      {!loading && !error && seniors.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-white/75 shadow-sm backdrop-blur-sm">
          {seniors.map((senior) => {
            const name = `${senior.first_name} ${senior.last_name}`;
            return (
              <li
                key={senior.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(senior.first_name, senior.last_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{name}</p>
                    <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">Age</dt>
                        <dd>{senior.age}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">
                          Gender
                        </dt>
                        <dd>{senior.gender}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">
                          Phone
                        </dt>
                        <dd>{senior.phone_number}</dd>
                      </div>
                      {senior.diagnoses && (
                        <div className="flex w-full gap-1">
                          <dt className="shrink-0 font-medium text-foreground/70">
                            Diagnoses
                          </dt>
                          <dd>{senior.diagnoses}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
                <span className="text-xs text-muted">ID {senior.id}</span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

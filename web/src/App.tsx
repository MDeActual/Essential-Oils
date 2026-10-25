import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiRequestError,
  getAnalyticsProtocol,
  getAnalyticsProtocols,
  getHealth,
  getProtocol,
  getProtocols,
} from "./api";
import { frontendConfig } from "./config";
import type {
  AnalyticsProtocolDetailPayload,
  AnalyticsProtocolsPayload,
  HealthPayload,
  ProtocolDetail,
  ProtocolSummary,
} from "./types";

type LoadState = "idle" | "loading" | "ready" | "error";

function formatError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return `${error.message} (HTTP ${error.status}${error.code ? `: ${error.code}` : ""})`;
  }
  if (error instanceof Error) return error.message;
  return "Unexpected request failure.";
}

function App() {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsProtocolsPayload | null>(null);

  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [protocolDetail, setProtocolDetail] = useState<ProtocolDetail | null>(null);
  const [analyticsDetail, setAnalyticsDetail] = useState<AnalyticsProtocolDetailPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const selectedProtocolIdRef = useRef<string | null>(null);

  const selectedProtocol = useMemo(
    () => protocols.find((p) => p.protocolId === selectedProtocolId) ?? null,
    [protocols, selectedProtocolId]
  );

  const selectProtocol = useCallback((protocolId: string | null): void => {
    if (protocolId === selectedProtocolIdRef.current) return;
    selectedProtocolIdRef.current = protocolId;
    setProtocolDetail(null);
    setAnalyticsDetail(null);
    setError(null);
    setDetailLoading(protocolId !== null);
    setSelectedProtocolId(protocolId);
  }, []);

  const loadOverview = useCallback(async (): Promise<void> => {
    try {
      const [nextHealth, nextProtocols, nextAnalytics] = await Promise.all([
        getHealth(),
        getProtocols(),
        getAnalyticsProtocols(),
      ]);
      setHealth(nextHealth);
      setProtocols(nextProtocols);
      setAnalytics(nextAnalytics);

      const currentProtocolId = selectedProtocolIdRef.current;
      const nextSelectedProtocolId = currentProtocolId
        && nextProtocols.some((p) => p.protocolId === currentProtocolId)
        ? currentProtocolId
        : nextProtocols[0]?.protocolId ?? null;
      selectProtocol(nextSelectedProtocolId);
      setState("ready");
    } catch (cause) {
      setState("error");
      setError(formatError(cause));
    }
  }, [selectProtocol]);

  useEffect(() => {
    void Promise.resolve().then(loadOverview);
  }, [loadOverview]);

  function refreshOverview(): void {
    setState("loading");
    setError(null);
    void loadOverview();
  }

  useEffect(() => {
    if (!selectedProtocolId) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [nextProtocolDetail, nextAnalyticsDetail] = await Promise.all([
          getProtocol(selectedProtocolId),
          getAnalyticsProtocol(selectedProtocolId),
        ]);
        if (cancelled) return;
        setProtocolDetail(nextProtocolDetail);
        setAnalyticsDetail(nextAnalyticsDetail);
        setDetailLoading(false);
      } catch (cause) {
        if (cancelled) return;
        setError(formatError(cause));
        setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedProtocolId]);

  return (
    <main className="dashboard">
      <header className="banner">
        <p className="kicker">Phyto.ai</p>
        <h1>Protocol Operations Console</h1>
        <p className="subtitle">
          Read-only operational view for protocol and cohort metrics.
        </p>
        <div className="meta-grid">
          <div>
            <span>API Base URL</span>
            <strong>{frontendConfig.apiBaseUrl}</strong>
          </div>
          <div>
            <span>Tenant Header</span>
            <strong>{frontendConfig.tenantId ?? "not set"}</strong>
          </div>
        </div>
      </header>

      <section className="controls">
        <button type="button" onClick={refreshOverview} disabled={state === "loading"}>
          {state === "loading" ? "Refreshing..." : "Refresh Snapshot"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="cards">
        <article className="card">
          <h2>Runtime</h2>
          {health ? (
            <ul>
              <li>Status: {health.status}</li>
              <li>Version: {health.version}</li>
              <li>Runtime: {health.runtimeMode}</li>
              <li>Storage: {health.storageMode}</li>
            </ul>
          ) : (
            <p>Waiting for data...</p>
          )}
        </article>

        <article className="card">
          <h2>Analytics Overview</h2>
          {analytics ? (
            <ul>
              <li>Protocols: {analytics.protocolCount}</li>
              <li>Eligible records: {analytics.totalEligibleRecords}</li>
              <li>Excluded records: {analytics.totalExcludedRecords}</li>
              <li>Computed at: {new Date(analytics.generatedAt).toLocaleString()}</li>
            </ul>
          ) : (
            <p>Waiting for data...</p>
          )}
        </article>
      </section>

      <section className="split">
        <article className="panel">
          <h2>Protocols</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>Goal</th>
                  <th>Status</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {protocols.map((protocol) => (
                  <tr
                    key={protocol.protocolId}
                    className={protocol.protocolId === selectedProtocolId ? "active" : ""}
                  >
                    <td>
                      <button
                        type="button"
                        className="protocol-select"
                        aria-pressed={protocol.protocolId === selectedProtocolId}
                        onClick={() => selectProtocol(protocol.protocolId)}
                      >
                        {protocol.protocolId}
                      </button>
                    </td>
                    <td>{protocol.goal}</td>
                    <td>{protocol.status}</td>
                    <td>{protocol.durationDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Selected Protocol Detail</h2>
          {!selectedProtocol && <p>Select a protocol.</p>}
          {selectedProtocol && detailLoading && <p>Loading protocol details...</p>}
          {selectedProtocol && protocolDetail && analyticsDetail && (
            <>
              <p>
                <strong>{protocolDetail.protocolId}</strong> · {protocolDetail.goal}
              </p>
              <p>
                Version {protocolDetail.version} · {protocolDetail.status} · {protocolDetail.challengeCount} challenges
              </p>
              <h3>Phases</h3>
              <ol>
                {protocolDetail.phases.map((phase) => (
                  <li key={`${protocolDetail.protocolId}-${phase.phaseIndex}`}>
                    {phase.label} ({phase.durationDays} days): {phase.instructions}
                  </li>
                ))}
              </ol>

              <h3>Segment Metrics</h3>
              <ul>
                <li>Eligible records: {analyticsDetail.eligibleRecordCount}</li>
                <li>Excluded records: {analyticsDetail.excludedRecordCount}</li>
                <li>Avg adherence: {analyticsDetail.averageAdherenceScore.toFixed(1)}</li>
                <li>Avg challenge completion: {analyticsDetail.averageChallengeCompletionRate.toFixed(1)}</li>
                <li>Adherence range: {analyticsDetail.minAdherenceScore} - {analyticsDetail.maxAdherenceScore}</li>
              </ul>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

export default App;

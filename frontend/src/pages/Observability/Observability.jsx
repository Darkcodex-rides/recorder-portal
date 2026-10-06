import {
  Activity,
  Database,
  Gauge,
  Radio,
  Server,
  ShieldCheck,
} from "lucide-react";

function Observability() {
  return (
    <div className="observability-page">
      {/* Page Header */}
      <div className="observability-header">
        <div>
          <div className="observability-eyebrow">
            <Activity size={13} />
            SYSTEM MONITORING
          </div>

          <h1>Observability</h1>

          <p>
            Monitor application logs, recording activity,
            errors, and real-time WebSocket events.
          </p>
        </div>

        <div className="monitoring-status">
          <span className="monitoring-status-dot" />

          <div>
            <strong>ALL SYSTEMS</strong>
            <span>OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Monitoring Summary */}
      <div className="monitoring-summary">
        <div className="monitoring-card">
          <div className="monitoring-card-icon">
            <Server size={18} />
          </div>

          <div>
            <span>BACKEND</span>
            <strong>ONLINE</strong>
          </div>

          <span className="monitoring-dot online" />
        </div>

        <div className="monitoring-card">
          <div className="monitoring-card-icon">
            <Database size={18} />
          </div>

          <div>
            <span>DATABASE</span>
            <strong>CONNECTED</strong>
          </div>

          <span className="monitoring-dot online" />
        </div>

        <div className="monitoring-card">
          <div className="monitoring-card-icon">
            <Radio size={18} />
          </div>

          <div>
            <span>WEBSOCKET</span>
            <strong>ACTIVE</strong>
          </div>

          <span className="monitoring-dot online" />
        </div>

        <div className="monitoring-card">
          <div className="monitoring-card-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>AUTHENTICATION</span>
            <strong>SECURE</strong>
          </div>

          <span className="monitoring-dot online" />
        </div>
      </div>

      {/* Grafana */}
      <section className="grafana-section">
        <div className="grafana-section-header">
          <div className="grafana-title">
            <div className="grafana-icon">
              <Gauge size={18} />
            </div>

            <div>
              <h2>System Dashboard</h2>

              <p>
                Live application telemetry and recording
                activity
              </p>
            </div>
          </div>

          <div className="grafana-live">
            <span />

            LIVE MONITORING
          </div>
        </div>

        <div className="grafana-frame">
          <iframe
            src="http://localhost:3000/d/02265018-e251-433b-97f2-0e426eea9a8d/design-recorder-monitoring?orgId=1&from=now-2d&to=now&timezone=browser"
            title="Design Recorder Monitoring"
            width="100%"
            height="100%"
            style={{
              border: "none",
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default Observability;
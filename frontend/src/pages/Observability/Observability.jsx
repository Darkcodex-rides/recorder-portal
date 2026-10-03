function Observability() {
  return (
    <div className="observability-page">
      <h1>Observability</h1>

      <p className="page-description">
        Monitor backend logs, recording activity, errors, and
        WebSocket events.
      </p>

      <div
        style={{
          width: "100%",
          height: "calc(100vh - 180px)",
          minHeight: "700px",
          marginTop: "20px",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #ddd",
        }}
      >
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
    </div>
  );
}

export default Observability;
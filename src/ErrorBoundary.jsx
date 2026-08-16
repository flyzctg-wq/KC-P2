// src/ErrorBoundary.jsx
import React from "react";

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          fontFamily: "Inter, sans-serif", padding: 24, textAlign: "center",
        }}>
          <p style={{ fontWeight: 800, fontSize: 18 }}>Something went wrong.</p>
          <p style={{ color: "#666", fontSize: 14, maxWidth: 360 }}>
            {this.state.error?.message || "The app hit an unexpected error. Reloading usually fixes it."}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = "";
                window.location.reload();
              }}
              style={{ background: "#154212", color: "#fff", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

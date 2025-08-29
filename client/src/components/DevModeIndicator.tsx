import React, { useEffect, useState } from "react";

const DevModeIndicator: React.FC = () => {
  const [mode] = useState<string>(import.meta.env.VITE_RUNTIME_MODE || "mock");
  const [sdkAvailable, setSdkAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (mode === "engine") {
      const ok =
        typeof (window as any).stake_engine_sdk !== "undefined" ||
        typeof (window as any).engine !== "undefined";
      setSdkAvailable(ok);
    }
  }, [mode]);

  if (import.meta.env.PROD) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      Mode: <strong>{mode}</strong>
      {mode === "engine" && !sdkAvailable && (
        <span style={{ color: "red", marginLeft: "6px" }}>SDK Missing</span>
      )}
    </div>
  );
};

export default DevModeIndicator;

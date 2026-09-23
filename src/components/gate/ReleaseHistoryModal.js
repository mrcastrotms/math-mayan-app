"use client";

import React, { useState, useEffect } from "react";

export default function ReleaseHistoryModal({
  isOpen,
  onClose,
  currentTheme,
  currentSha,
  currentVersion,
}) {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPin("");
      setIsUnlocked(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isUnlocked) return;
    let isCancelled = false;

    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(
          "https://api.github.com/repos/mrcastrotms/math-mayan-app/commits?per_page=10"
        );
        if (!res.ok) throw new Error("Failed to fetch commit log");
        const data = await res.json();
        if (!isCancelled) {
          setCommits(data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setErrorMsg("Could not load release history from GitHub.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isCancelled = true;
    };
  }, [isUnlocked]);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    if (pin.trim() === "00000") {
      setIsUnlocked(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Invalid authorization code.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 110,
        fontFamily: "monospace",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: currentTheme.card,
          border: `2px solid ${currentTheme.border}`,
          borderRadius: "14px",
          padding: "28px 24px",
          boxShadow: "0 20px 48px rgba(0,0,0,0.6)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: currentTheme.text, margin: 0 }}>
              Deployment Audit Log
            </h3>
            <span style={{ fontSize: "0.75rem", color: currentTheme.textDim }}>
              Active: {currentVersion} ({currentSha})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${currentTheme.border}`,
              color: currentTheme.textDim,
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
            <p style={{ fontSize: "0.85rem", color: currentTheme.textDim, margin: 0 }}>
              Enter master access code to inspect recent releases and commit SHAs:
            </p>
            <input
              type="password"
              maxLength={6}
              autoFocus
              value={pin}
              placeholder="•••••"
              onChange={(e) => setPin(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "1.2rem",
                textAlign: "center",
                letterSpacing: "4px",
                borderRadius: "6px",
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
                color: currentTheme.text,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errorMsg && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: 0, textAlign: "center" }}>{errorMsg}</p>}
            <button
              type="submit"
              style={{
                padding: "12px",
                backgroundColor: currentTheme.accent,
                color: "#ffffff",
                fontWeight: 800,
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              UNLOCK HISTORY
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {loading ? (
              <p style={{ fontSize: "0.85rem", color: currentTheme.textDim, textAlign: "center", padding: "24px 0" }}>
                Querying deployment registry...
              </p>
            ) : errorMsg ? (
              <p style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center" }}>{errorMsg}</p>
            ) : (
              <div
                style={{
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingRight: "4px",
                }}
              >
                {commits.map((c) => {
                  const sha = c.sha.substring(0, 7);
                  const isCurrent = sha === currentSha;
                  const dateStr = new Date(c.commit.author.date).toLocaleString([], {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const title = c.commit.message.split("\n")[0];

                  return (
                    <div
                      key={sha}
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: `1px solid ${isCurrent ? currentTheme.accent : currentTheme.border}`,
                        background: isCurrent ? "rgba(37, 99, 235, 0.08)" : currentTheme.bg,
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: isCurrent ? currentTheme.accent : currentTheme.text }}>
                          SHA: {sha} {isCurrent && "★ (Current Active)"}
                        </span>
                        <span style={{ color: currentTheme.textDim }}>{dateStr}</span>
                      </div>
                      <div
                        style={{
                          color: currentTheme.textDim,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {title}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

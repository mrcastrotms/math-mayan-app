// src/utils/bypassClient.js
export async function requestBypassTokenWithSecret(
  secret,
  requestedSection,
  requestedName,
) {
  const res = await fetch("/api/bypass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, requestedSection, requestedName }),
  });
  if (!res.ok)
    throw new Error(
      (await res.json()).error || "Failed to request bypass token",
    );
  return res.json(); // { token, expiresAt }
}

export async function requestBypassTokenForTeacher(
  idToken,
  requestedSection,
  requestedName,
) {
  const res = await fetch("/api/issueBypassForTeacher", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ requestedSection, requestedName }),
  });
  if (!res.ok)
    throw new Error(
      (await res.json()).error || "Failed to request teacher bypass token",
    );
  return res.json();
}

export async function consumeBypassToken(token, name, section) {
  const res = await fetch("/api/consumeBypass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, name, section }),
  });
  if (!res.ok)
    throw new Error(
      (await res.json()).error || "Failed to consume bypass token",
    );
  return res.json(); // { ok: true, name, section }
}

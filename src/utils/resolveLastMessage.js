// utils/resolveLastMessage.js
export function resolveLastMessage(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { text: "", time: null };
  }

  // Walk backwards → find last visible message
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) continue;

    // ✅ DELETE FOR EVERYONE (SOURCE OF TRUTH)
    if (m.deletedFor === "EVERYONE") {
      return {
        text: "This message was deleted",
        time: m.deletedAt || m.timestamp || null,
      };
    }

    // ✅ NORMAL MESSAGE
    if (typeof m.content === "string" && m.content.trim() !== "") {
      return {
        text: m.content,
        time: m.timestamp || null,
      };
    }
  }

  return { text: "", time: null };
}

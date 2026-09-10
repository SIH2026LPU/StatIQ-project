export interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: any[];
  engineLabel?: string;
  provider?: string;
  failoverOccurred?: boolean;
  failoverReason?: string;
  createdAt: string;
}

export interface StoredConversation {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
}

// In-memory persistent server-side store
const globalForTutor = globalThis as unknown as {
  __statiq_tutor_store?: Map<string, StoredConversation>;
};

export const tutorStore = globalForTutor.__statiq_tutor_store || new Map<string, StoredConversation>();
globalForTutor.__statiq_tutor_store = tutorStore;

export function getConversationsForUser(userId: string = "default"): StoredConversation[] {
  const convs: StoredConversation[] = [];
  for (const conv of tutorStore.values()) {
    if (!conv.userId || conv.userId === userId || userId === "default") {
      convs.push(conv);
    }
  }
  return convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConversationById(id: string): StoredConversation | null {
  return tutorStore.get(id) || null;
}

export function createConversation(id: string, title: string = "New Conversation", userId: string = "default"): StoredConversation {
  const existing = tutorStore.get(id);
  if (existing) return existing;

  const newConv: StoredConversation = {
    id,
    userId,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  tutorStore.set(id, newConv);
  return newConv;
}

export function addMessageToConversation(
  conversationId: string,
  message: Omit<StoredMessage, "createdAt"> & { createdAt?: string },
  userId: string = "default"
): StoredConversation {
  let conv = tutorStore.get(conversationId);
  if (!conv) {
    const title = message.role === "user" ? (message.content.length > 40 ? message.content.slice(0, 37) + "..." : message.content) : "New Conversation";
    conv = createConversation(conversationId, title, userId);
  }

  // Update title if it's the first user message
  if (message.role === "user" && (conv.title === "New Conversation" || conv.messages.length === 0)) {
    conv.title = message.content.length > 40 ? message.content.slice(0, 37) + "..." : message.content;
  }

  const fullMsg: StoredMessage = {
    ...message,
    createdAt: message.createdAt || new Date().toISOString(),
  };

  conv.messages.push(fullMsg);
  conv.updatedAt = new Date().toISOString();
  tutorStore.set(conversationId, conv);
  return conv;
}

export function deleteConversationById(id: string): boolean {
  return tutorStore.delete(id);
}

export function clearAllConversations(userId: string = "default"): void {
  for (const [id, conv] of tutorStore.entries()) {
    if (!conv.userId || conv.userId === userId || userId === "default") {
      tutorStore.delete(id);
    }
  }
}


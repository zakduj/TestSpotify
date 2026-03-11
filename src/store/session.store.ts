import crypto from 'crypto';

interface Session {
  accessToken: string;
  expiresAt: number;
}

declare global {
  var __sessionStore: Map<string, Session> | undefined;
}

const sessions: Map<string, Session> = globalThis.__sessionStore ??= new Map();

export function createSession(accessToken: string, expiresIn: number): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  });
  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

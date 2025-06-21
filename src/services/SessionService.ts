import type { GameSession } from '../types';

class SessionService {
  private static readonly STORAGE_KEY = 'chouette_session';

  generateId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCurrentSession(): GameSession | null {
    try {
      const stored = localStorage.getItem(SessionService.STORAGE_KEY);
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      return {
        ...session,
        createdAt: new Date(session.createdAt)
      };
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  createNewSession(): GameSession {
    const session: GameSession = {
      id: this.generateId(),
      createdAt: new Date(),
      gameMode: 'setup',
      isComplete: false,
      boxPlayerId: null,
      captainPlayerId: null,
      queuePlayerIds: [],
      currentChouetteScores: {},
      playersSittingOut: {}
    };

    this.saveSession(session);
    return session;
  }

  updateSession(session: GameSession): void {
    this.saveSession(session);
  }

  startGame(session: GameSession, boxPlayerId: string, captainPlayerId: string, queuePlayerIds: string[] = []): GameSession {
    const updatedSession: GameSession = {
      ...session,
      gameMode: 'game',
      boxPlayerId,
      captainPlayerId,
      queuePlayerIds,
      currentChouetteScores: {
        [boxPlayerId]: 0,
        [captainPlayerId]: 0,
        ...queuePlayerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      },
      playersSittingOut: {
        [boxPlayerId]: false,
        [captainPlayerId]: false,
        ...queuePlayerIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
      }
    };

    this.saveSession(updatedSession);
    return updatedSession;
  }

  updateScores(session: GameSession, scores: { [playerId: string]: number }): GameSession {
    const updatedSession: GameSession = {
      ...session,
      currentChouetteScores: {
        ...session.currentChouetteScores,
        ...Object.fromEntries(
          Object.entries(scores).map(([playerId, score]) => [
            playerId,
            (session.currentChouetteScores[playerId] || 0) + score
          ])
        )
      }
    };

    this.saveSession(updatedSession);
    return updatedSession;
  }

  updatePlayerPositions(session: GameSession, newBoxPlayerId: string, newCaptainPlayerId: string, newQueuePlayerIds: string[]): GameSession {
    const updatedSession: GameSession = {
      ...session,
      boxPlayerId: newBoxPlayerId,
      captainPlayerId: newCaptainPlayerId,
      queuePlayerIds: newQueuePlayerIds
    };

    this.saveSession(updatedSession);
    return updatedSession;
  }

  toggleSittingOut(session: GameSession, playerId: string): GameSession {
    const updatedSession: GameSession = {
      ...session,
      playersSittingOut: {
        ...session.playersSittingOut,
        [playerId]: !session.playersSittingOut[playerId]
      }
    };

    this.saveSession(updatedSession);
    return updatedSession;
  }

  endChouette(session: GameSession): { finalScores: { [playerId: string]: number }, newSession: GameSession } {
    const finalScores = { ...session.currentChouetteScores };
    
    const newSession = this.createNewSession();
    
    return { finalScores, newSession };
  }

  clearSession(): void {
    try {
      localStorage.removeItem(SessionService.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  private saveSession(session: GameSession): void {
    try {
      localStorage.setItem(SessionService.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session data');
    }
  }
}

export const sessionService = new SessionService();
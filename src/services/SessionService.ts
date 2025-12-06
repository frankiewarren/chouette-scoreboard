import type { GameSession } from '../types';

class SessionService {
  private static readonly STORAGE_KEY = 'chouette_session';

  generateId(): string {
    return crypto.randomUUID();
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
      teamCaptainPlayerId: null,
      teamPlayerIds: [],
      currentChouetteScores: {},
      playersSittingOut: {}
    };

    this.saveSession(session);
    return session;
  }

  updateSession(session: GameSession): void {
    this.saveSession(session);
  }

  startGame(session: GameSession, boxPlayerId: string, teamCaptainPlayerId: string, teamPlayerIds: string[] = []): GameSession {
    const updatedSession: GameSession = {
      ...session,
      gameMode: 'game',
      boxPlayerId,
      teamCaptainPlayerId,
      teamPlayerIds,
      currentChouetteScores: {
        [boxPlayerId]: 0,
        [teamCaptainPlayerId]: 0,
        ...teamPlayerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      },
      playersSittingOut: {
        [boxPlayerId]: false,
        [teamCaptainPlayerId]: false,
        ...teamPlayerIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
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

  updatePlayerPositions(session: GameSession, newBoxPlayerId: string, newTeamCaptainPlayerId: string, newTeamPlayerIds: string[]): GameSession {
    const updatedSession: GameSession = {
      ...session,
      boxPlayerId: newBoxPlayerId,
      teamCaptainPlayerId: newTeamCaptainPlayerId,
      teamPlayerIds: newTeamPlayerIds
    };

    this.saveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Rotates players according to chouette rules after a round:
   * - Box wins: Box stays, Captain moves to back of team, next active team player becomes Captain
   * - Captain wins: Captain becomes Box, old Box moves to back of team, next active team player becomes Captain
   * - No winner: No rotation occurs
   *
   * Sitting out players are skipped for promotion but remain in the team queue.
   *
   * @param session - Current game session (should already have updated scores)
   * @param roundScores - Scores from this round keyed by playerId
   * @returns Updated session with new positions
   */
  rotateAfterRound(session: GameSession, roundScores: { [playerId: string]: number }): GameSession {
    // Guard clause - need box and captain to rotate
    if (!session.boxPlayerId || !session.teamCaptainPlayerId) {
      return session;
    }

    const boxScore = roundScores[session.boxPlayerId] ?? 0;
    const captainScore = roundScores[session.teamCaptainPlayerId] ?? 0;

    const winner = this.determineWinner(boxScore, captainScore);

    // No winner means no rotation
    if (winner === 'none') {
      return session;
    }

    // Separate active and sitting-out team players
    const activeTeamPlayerIds = session.teamPlayerIds.filter(
      playerId => !session.playersSittingOut[playerId]
    );
    const inactiveTeamPlayerIds = session.teamPlayerIds.filter(
      playerId => session.playersSittingOut[playerId]
    );

    // Can't rotate if no active team players to promote
    if (activeTeamPlayerIds.length === 0) {
      return session;
    }

    let newBoxPlayerId: string;
    let newCaptainPlayerId: string;
    let newTeamPlayerIds: string[];

    if (winner === 'box') {
      // Box stays, captain goes to back, first active team player becomes captain
      newBoxPlayerId = session.boxPlayerId;
      newCaptainPlayerId = activeTeamPlayerIds[0];
      newTeamPlayerIds = [
        ...activeTeamPlayerIds.slice(1),
        session.teamCaptainPlayerId,
        ...inactiveTeamPlayerIds
      ];
    } else {
      // Captain becomes box, old box goes to back, first active team player becomes captain
      newBoxPlayerId = session.teamCaptainPlayerId;
      newCaptainPlayerId = activeTeamPlayerIds[0];
      newTeamPlayerIds = [
        ...activeTeamPlayerIds.slice(1),
        session.boxPlayerId,
        ...inactiveTeamPlayerIds
      ];
    }

    // Use existing method to update positions and save
    return this.updatePlayerPositions(session, newBoxPlayerId, newCaptainPlayerId, newTeamPlayerIds);
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

  /**
   * Determines the winner of a round based on chouette rules.
   * - Box wins if box has a positive score (takes precedence)
   * - Captain/Team wins if captain has a positive score and box doesn't
   * - No winner if neither has a positive score
   */
  private determineWinner(boxScore: number, captainScore: number): 'box' | 'captain' | 'none' {
    if (boxScore > 0) return 'box';
    if (captainScore > 0) return 'captain';
    return 'none';
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
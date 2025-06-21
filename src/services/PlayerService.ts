import type { Player } from '../types';

class PlayerService {
  private static readonly STORAGE_KEY = 'chouette_players';

  generateId(): string {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getAllPlayers(): Player[] {
    try {
      const stored = localStorage.getItem(PlayerService.STORAGE_KEY);
      if (!stored) return [];
      
      const players = JSON.parse(stored);
      return players.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    } catch (error) {
      console.error('Error loading players:', error);
      return [];
    }
  }

  getPlayerById(id: string): Player | null {
    const players = this.getAllPlayers();
    return players.find(p => p.id === id) || null;
  }

  getPlayersByIds(ids: string[]): Player[] {
    const players = this.getAllPlayers();
    return ids.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  }

  createPlayer(name: string): Player | null {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Player name cannot be empty');
    }

    if (this.isNameTaken(trimmedName)) {
      throw new Error('Player name already exists');
    }

    const newPlayer: Player = {
      id: this.generateId(),
      name: trimmedName,
      totalScore: 0,
      gamesPlayed: 0,
      createdAt: new Date()
    };

    const players = this.getAllPlayers();
    players.push(newPlayer);
    this.savePlayers(players);

    return newPlayer;
  }

  updatePlayer(player: Player): void {
    const players = this.getAllPlayers();
    const index = players.findIndex(p => p.id === player.id);
    
    if (index === -1) {
      throw new Error('Player not found');
    }

    if (players[index].name !== player.name && this.isNameTaken(player.name)) {
      throw new Error('Player name already exists');
    }

    players[index] = player;
    this.savePlayers(players);
  }

  updatePlayerScores(playerScores: { [playerId: string]: number }): void {
    const players = this.getAllPlayers();
    let hasChanges = false;

    for (const [playerId, scoreChange] of Object.entries(playerScores)) {
      const player = players.find(p => p.id === playerId);
      if (player && scoreChange !== 0) {
        player.totalScore += scoreChange;
        player.gamesPlayed += 1;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.savePlayers(players);
    }
  }

  deletePlayer(id: string): void {
    const players = this.getAllPlayers();
    const filtered = players.filter(p => p.id !== id);
    this.savePlayers(filtered);
  }

  isNameTaken(name: string): boolean {
    const players = this.getAllPlayers();
    return players.some(p => p.name.toLowerCase() === name.toLowerCase());
  }

  private savePlayers(players: Player[]): void {
    try {
      localStorage.setItem(PlayerService.STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players:', error);
      throw new Error('Failed to save player data');
    }
  }
}

export const playerService = new PlayerService();
import { PROTOCOL_DATA } from './protocolData.js';
import { cloudSync } from './cloudSync.js';

const STORAGE_KEY = 'recomp_mesocycle_app_v1';

/**
 * Gestore globale dello stato applicativo con supporto multi-utente, Cloud Sync ed esercizi personalizzati.
 */
class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadInitialState();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.users)) {
          return {
            users: parsed.users,
            currentUserId: parsed.currentUserId || (parsed.users[0] ? parsed.users[0].id : null),
            activeTab: 'workout',
            selectedWeek: 1,
            selectedDay: 1
          };
        }
      }
    } catch (e) {
      console.error('Errore nel caricamento del database locale:', e);
    }

    return {
      users: [],
      currentUserId: null,
      activeTab: 'workout',
      selectedWeek: 1,
      selectedDay: 1
    };
  }

  save() {
    try {
      const dataToSave = {
        users: this.state.users,
        currentUserId: this.state.currentUserId,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      cloudSync.pushStateToCloud();
    } catch (e) {
      console.error('Errore nel salvataggio:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Errore listener stato:', err);
      }
    }
  }

  getCurrentUser() {
    if (!this.state.currentUserId) return null;
    return this.state.users.find(u => u.id === this.state.currentUserId) || null;
  }

  /**
   * Crea un nuovo atleta/utente.
   */
  createUser(firstName, lastName, baseWeights = {}) {
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    
    const initialWeeks = {};
    for (let w = 1; w <= 10; w++) {
      initialWeeks[w] = {
        day1: { date: '' },
        day2: { date: '' },
        day3: { date: '' },
        notes: '',
        completed: false
      };
    }

    const newUser = {
      id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      createdAt: new Date().toISOString(),
      currentWeek: 1,
      baseWeights: baseWeights || {},
      customExercises: [],
      weeks: initialWeeks
    };

    this.state.users.push(newUser);
    this.state.currentUserId = newUser.id;
    this.state.selectedWeek = 1;
    this.state.selectedDay = 1;
    this.save();
    return newUser;
  }

  /**
   * Aggiunge un esercizio personalizzato per l'atleta attivo.
   */
  addCustomExercise(dayNumber, { name, sets, reps, minReps, maxReps, rir, restSeconds, restDisplay, isCompound, allowsRestPause, baseWeight, notes }) {
    const user = this.getCurrentUser();
    if (!user) return null;

    if (!Array.isArray(user.customExercises)) {
      user.customExercises = [];
    }

    const exId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEx = {
      id: exId,
      name: name.trim(),
      dayNumber: parseInt(dayNumber, 10),
      sets: parseInt(sets, 10) || 3,
      reps: reps || '8-10',
      minReps: parseInt(minReps, 10) || 8,
      maxReps: parseInt(maxReps, 10) || 10,
      rir: rir || '1',
      restSeconds: parseInt(restSeconds, 10) || 90,
      restDisplay: restDisplay || `${Math.floor((restSeconds || 90) / 60)}'${(restSeconds || 90) % 60 ? (restSeconds % 60).toString().padStart(2, '0') + '"' : '00"'}`,
      isCompound: !!isCompound,
      allowsRestPause: !!allowsRestPause,
      notes: notes || '',
      isCustom: true
    };

    user.customExercises.push(newEx);

    if (baseWeight !== undefined && baseWeight !== null && !isNaN(parseFloat(baseWeight))) {
      if (!user.baseWeights) user.baseWeights = {};
      user.baseWeights[exId] = parseFloat(baseWeight);
    }

    this.save();
    return newEx;
  }

  /**
   * Elimina un esercizio personalizzato per l'atleta attivo.
   */
  deleteCustomExercise(exerciseId) {
    const user = this.getCurrentUser();
    if (!user || !Array.isArray(user.customExercises)) return;

    user.customExercises = user.customExercises.filter(e => e.id !== exerciseId);
    if (user.baseWeights && user.baseWeights[exerciseId] !== undefined) {
      delete user.baseWeights[exerciseId];
    }

    // Rimuovi anche i log registrati per questo esercizio nelle settimane
    if (user.weeks) {
      Object.keys(user.weeks).forEach(w => {
        ['day1', 'day2', 'day3'].forEach(d => {
          if (user.weeks[w][d] && user.weeks[w][d][exerciseId]) {
            delete user.weeks[w][d][exerciseId];
          }
        });
      });
    }

    this.save();
  }

  /**
   * Azzera / Riavvia il mesociclo per l'atleta.
   */
  resetMesocycle(userId, newBaseWeights = null) {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return;

    const resetWeeks = {};
    for (let w = 1; w <= 10; w++) {
      resetWeeks[w] = {
        day1: { date: '' },
        day2: { date: '' },
        day3: { date: '' },
        notes: '',
        completed: false
      };
    }

    user.weeks = resetWeeks;
    user.currentWeek = 1;
    user.lastResetAt = new Date().toISOString();

    if (newBaseWeights) {
      user.baseWeights = { ...user.baseWeights, ...newBaseWeights };
    }

    this.state.selectedWeek = 1;
    this.state.selectedDay = 1;
    this.save();
  }

  selectUser(userId) {
    if (this.state.users.some(u => u.id === userId)) {
      this.state.currentUserId = userId;
      const user = this.getCurrentUser();
      if (user && user.currentWeek) {
        this.state.selectedWeek = user.currentWeek;
      }
      this.save();
    }
  }

  deleteUser(userId) {
    this.state.users = this.state.users.filter(u => u.id !== userId);
    if (this.state.currentUserId === userId) {
      this.state.currentUserId = this.state.users.length > 0 ? this.state.users[0].id : null;
    }
    this.save();
  }

  setBaseWeight(exerciseId, weight) {
    const user = this.getCurrentUser();
    if (!user) return;
    if (!user.baseWeights) user.baseWeights = {};
    user.baseWeights[exerciseId] = parseFloat(weight) || 0;
    this.save();
  }

  setAllBaseWeights(weightsMap) {
    const user = this.getCurrentUser();
    if (!user) return;
    user.baseWeights = { ...(user.baseWeights || {}), ...weightsMap };
    this.save();
  }

  setWorkoutDate(week, dayId, dateString) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.weeks[week]) user.weeks[week] = {};
    if (!user.weeks[week][dayId]) user.weeks[week][dayId] = {};
    user.weeks[week][dayId].date = dateString;
    this.save();
  }

  logSet(week, dayId, exerciseId, setIndex, { weight, reps, rir, restPause }) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.weeks[week]) user.weeks[week] = {};
    if (!user.weeks[week][dayId]) user.weeks[week][dayId] = {};
    if (!user.weeks[week][dayId][exerciseId]) {
      user.weeks[week][dayId][exerciseId] = {
        sets: [],
        completed: false,
        restPauseUsed: false,
        notes: ''
      };
    }

    const exData = user.weeks[week][dayId][exerciseId];
    while (exData.sets.length <= setIndex) {
      exData.sets.push({ weight: '', reps: '', rir: '', restPause: false });
    }

    exData.sets[setIndex] = {
      weight: weight !== undefined ? weight : exData.sets[setIndex].weight,
      reps: reps !== undefined ? reps : exData.sets[setIndex].reps,
      rir: rir !== undefined ? rir : exData.sets[setIndex].rir,
      restPause: restPause !== undefined ? restPause : exData.sets[setIndex].restPause
    };

    if (restPause) {
      exData.restPauseUsed = true;
    }

    if (!user.weeks[week][dayId].date) {
      user.weeks[week][dayId].date = new Date().toISOString().split('T')[0];
    }

    this.save();
  }

  updateExerciseMeta(week, dayId, exerciseId, { completed, restPauseUsed, notes }) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.weeks[week]) user.weeks[week] = {};
    if (!user.weeks[week][dayId]) user.weeks[week][dayId] = {};
    if (!user.weeks[week][dayId][exerciseId]) {
      user.weeks[week][dayId][exerciseId] = { sets: [], completed: false, restPauseUsed: false, notes: '' };
    }

    const ex = user.weeks[week][dayId][exerciseId];
    if (completed !== undefined) ex.completed = completed;
    if (restPauseUsed !== undefined) ex.restPauseUsed = restPauseUsed;
    if (notes !== undefined) ex.notes = notes;

    if (!user.weeks[week][dayId].date) {
      user.weeks[week][dayId].date = new Date().toISOString().split('T')[0];
    }

    this.save();
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
    this.notify();
  }

  setSelectedWeek(week) {
    this.state.selectedWeek = Math.max(1, Math.min(10, parseInt(week, 10)));
    const user = this.getCurrentUser();
    if (user) {
      user.currentWeek = this.state.selectedWeek;
      this.save();
    } else {
      this.notify();
    }
  }

  setSelectedDay(day) {
    this.state.selectedDay = Math.max(1, Math.min(3, parseInt(day, 10)));
    this.notify();
  }

  exportDatabaseJSON() {
    return JSON.stringify({
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      users: this.state.users,
      currentUserId: this.state.currentUserId
    }, null, 2);
  }

  importDatabaseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.users)) {
        this.state.users = data.users;
        this.state.currentUserId = data.currentUserId || (data.users[0] ? data.users[0].id : null);
        this.save();
        return { success: true, count: data.users.length };
      }
      return { success: false, error: 'Formato file JSON non valido' };
    } catch (e) {
      return { success: false, error: 'Errore di parsing JSON: ' + e.message };
    }
  }
}

export const state = new StateManager();

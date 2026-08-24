import { PROTOCOL_DATA } from './protocolData.js';

/**
 * Motore di calcolo della progressione del carico per il mesociclo di 10 settimane.
 * Supporta sia gli esercizi standard del protocollo che gli esercizi personalizzati aggiunti dall'atleta.
 */
export class ProgressionEngine {
  /**
   * Arrotonda il carico al passo comune delle piastre da palestra (default 0.5 kg).
   */
  static roundWeight(weight, step = 0.5) {
    if (!weight || isNaN(weight)) return 0;
    return Math.round(weight / step) * step;
  }

  /**
   * Restituisce la fase del mesociclo per la settimana specificata.
   */
  static getPhaseForWeek(weekNumber) {
    return PROTOCOL_DATA.phases.find(p => p.weeks.includes(weekNumber)) || PROTOCOL_DATA.phases[0];
  }

  /**
   * Restituisce tutti gli esercizi per un dato giorno (default del protocollo + personalizzati dell'utente).
   */
  static getExercisesForDay(user, dayNumber) {
    const day = PROTOCOL_DATA.days.find(d => d.dayNumber === dayNumber) || PROTOCOL_DATA.days[0];
    const defaultList = day.exercises.map(e => ({ ...e, isCustom: false }));
    const customList = (user && Array.isArray(user.customExercises))
      ? user.customExercises.filter(e => e.dayNumber === dayNumber).map(e => ({ ...e, isCustom: true }))
      : [];
    return [...defaultList, ...customList];
  }

  /**
   * Restituisce tutti i 18+ esercizi dell'utente (standard + personalizzati).
   */
  static getAllExercisesForUser(user) {
    const list = [];
    PROTOCOL_DATA.days.forEach(day => {
      day.exercises.forEach(ex => {
        list.push({ ...ex, dayNumber: day.dayNumber, dayTitle: day.title, daySubtitle: day.subtitle, isCustom: false });
      });
    });
    if (user && Array.isArray(user.customExercises)) {
      user.customExercises.forEach(ex => {
        const day = PROTOCOL_DATA.days.find(d => d.dayNumber === ex.dayNumber) || PROTOCOL_DATA.days[0];
        list.push({ ...ex, dayTitle: day.title, daySubtitle: day.subtitle, isCustom: true });
      });
    }
    return list;
  }

  /**
   * Trova la definizione dell'esercizio per ID (cercando tra default e personalizzati dell'utente).
   */
  static getExerciseDef(exerciseId, user = null) {
    // 1. Cerca nei default
    for (const day of PROTOCOL_DATA.days) {
      const found = day.exercises.find(e => e.id === exerciseId);
      if (found) return { exercise: found, day, isCustom: false };
    }
    // 2. Cerca nei personalizzati dell'utente
    if (user && Array.isArray(user.customExercises)) {
      const found = user.customExercises.find(e => e.id === exerciseId);
      if (found) {
        const day = PROTOCOL_DATA.days.find(d => d.dayNumber === found.dayNumber) || PROTOCOL_DATA.days[0];
        return { exercise: found, day, isCustom: true };
      }
    }
    return null;
  }

  /**
   * Calcola il numero di serie target per una data settimana.
   * Settimana 5 (Deload): 2 serie fisse per esercizio (-40%).
   */
  static getTargetSets(exerciseDef, weekNumber) {
    if (weekNumber === 5) {
      return 2;
    }
    return exerciseDef.sets || 3;
  }

  /**
   * Calcola il peso suggerito per un esercizio in una data settimana
   * basandosi sul peso di base e sulle prestazioni registrate nelle settimane precedenti.
   */
  static calculateTargetWeight(user, exerciseId, targetWeek) {
    const exInfo = this.getExerciseDef(exerciseId, user);
    if (!exInfo) return { weight: 0, reason: "Esercizio non trovato" };
    const { exercise } = exInfo;

    const baseWeight = (user.baseWeights && user.baseWeights[exerciseId]) 
      ? parseFloat(user.baseWeights[exerciseId]) 
      : 0;

    // Settimana 1: usa sempre il peso di base
    if (targetWeek === 1) {
      return {
        weight: baseWeight,
        previousWeight: baseWeight,
        percentChange: 0,
        type: 'baseline',
        reason: 'Peso di partenza impostato',
        targetSets: this.getTargetSets(exercise, 1),
        targetReps: exercise.reps,
        targetRir: exercise.rir || '1–2',
        restPause: false
      };
    }

    // Settimana 5: Deload / Scarico (-10% rispetto a Settimana 4 o stimato)
    if (targetWeek === 5) {
      const w4Data = this.getLoggedExerciseData(user, exerciseId, 4);
      const referenceWeight = w4Data.hasData ? w4Data.avgWeight : this.estimateWeightForWeek(baseWeight, exercise, 4);
      const deloadWeight = this.roundWeight(referenceWeight * 0.90);
      return {
        weight: deloadWeight,
        previousWeight: referenceWeight,
        percentChange: -10,
        type: 'deload',
        reason: 'Scarico attivo: -10% carico, volume serie ridotto a 2',
        targetSets: 2,
        targetReps: exercise.reps,
        targetRir: '3–4',
        restPause: false
      };
    }

    // Settimana 6: Rientro da Deload e avvio Densificazione / Rest-Pause
    if (targetWeek === 6) {
      const w4Data = this.getLoggedExerciseData(user, exerciseId, 4);
      const refWeight = w4Data.hasData ? w4Data.avgWeight : this.estimateWeightForWeek(baseWeight, exercise, 4);
      const w6Weight = this.roundWeight(refWeight * 1.025);
      return {
        weight: w6Weight,
        previousWeight: refWeight,
        percentChange: 2.5,
        type: 'intensification',
        reason: 'Avvio Densificazione: +2.5% rispetto a W4 + Rest-Pause su isolamento',
        targetSets: exercise.sets,
        targetReps: exercise.reps,
        targetRir: exercise.rir,
        restPause: exercise.allowsRestPause
      };
    }

    // Settimana 10: Test & Valutazione Massimale
    if (targetWeek === 10) {
      const prevData = this.getLoggedExerciseData(user, exerciseId, 9);
      const prevWeight = prevData.hasData ? prevData.avgWeight : this.estimateWeightForWeek(baseWeight, exercise, 9);
      return {
        weight: prevWeight,
        previousWeight: prevWeight,
        percentChange: 0,
        type: 'testing',
        reason: 'Settimana di Test finale e verifica massimali',
        targetSets: exercise.sets,
        targetReps: exercise.reps,
        targetRir: '0–1 (Max RIR 0)',
        restPause: false
      };
    }

    // Settimane 2, 3, 4 (Accumulo) e Settimane 7, 8, 9 (Densificazione)
    const prevWeek = targetWeek - 1;
    const prevLogged = this.getLoggedExerciseData(user, exerciseId, prevWeek);

    if (prevLogged.hasData && prevLogged.avgWeight > 0) {
      const { avgWeight, hitTargetReps } = prevLogged;

      if (hitTargetReps) {
        const increaseRatio = exercise.isCompound ? 1.035 : 1.025;
        let newWeight = this.roundWeight(avgWeight * increaseRatio);
        if (newWeight <= avgWeight) {
          newWeight = avgWeight + (exercise.isCompound ? 2.5 : 1.25);
        }
        return {
          weight: newWeight,
          previousWeight: avgWeight,
          percentChange: Math.round(((newWeight - avgWeight) / avgWeight) * 1000) / 10,
          type: 'increase',
          reason: `Target completato in W${prevWeek}! Sovraccarico progressivo applicato.`,
          targetSets: exercise.sets,
          targetReps: exercise.reps,
          targetRir: exercise.rir,
          restPause: (targetWeek >= 6 && targetWeek <= 9) ? exercise.allowsRestPause : false
        };
      } else {
        return {
          weight: avgWeight,
          previousWeight: avgWeight,
          percentChange: 0,
          type: 'maintain',
          reason: `Consolidamento carico: mantieni ${avgWeight} kg per completare il range ${exercise.reps} rip.`,
          targetSets: exercise.sets,
          targetReps: exercise.reps,
          targetRir: exercise.rir,
          restPause: (targetWeek >= 6 && targetWeek <= 9) ? exercise.allowsRestPause : false
        };
      }
    }

    const estimatedWeight = this.estimateWeightForWeek(baseWeight, exercise, targetWeek);
    return {
      weight: estimatedWeight,
      previousWeight: this.estimateWeightForWeek(baseWeight, exercise, prevWeek),
      percentChange: 2.5,
      type: 'projected',
      reason: 'Progressione teorica stimata dal protocollo',
      targetSets: this.getTargetSets(exercise, targetWeek),
      targetReps: exercise.reps,
      targetRir: exercise.rir,
      restPause: (targetWeek >= 6 && targetWeek <= 9) ? exercise.allowsRestPause : false
    };
  }

  /**
   * Estrae i dati registrati di un esercizio per una specifica settimana, calcolando anche il volume totale.
   */
  static getLoggedExerciseData(user, exerciseId, weekNumber) {
    if (!user || !user.weeks || !user.weeks[weekNumber]) {
      return { hasData: false, avgWeight: 0, maxWeight: 0, totalVolume: 0, avgReps: 0, hitTargetReps: false, sets: [], date: '' };
    }

    const weekData = user.weeks[weekNumber];
    for (const dayKey of ['day1', 'day2', 'day3']) {
      if (weekData[dayKey] && weekData[dayKey][exerciseId]) {
        const exLog = weekData[dayKey][exerciseId];
        const sessionDate = weekData[dayKey].date || '';
        const sets = (exLog.sets || []).filter(s => s && !isNaN(parseFloat(s.weight)) && parseFloat(s.weight) > 0);
        
        if (sets.length > 0) {
          let totalWeight = 0;
          let maxWeight = 0;
          let totalReps = 0;
          let totalVolume = 0;

          sets.forEach(s => {
            const w = parseFloat(s.weight) || 0;
            const r = parseInt(s.reps, 10) || 0;
            totalWeight += w;
            if (w > maxWeight) maxWeight = w;
            totalReps += r;
            totalVolume += (w * r);
          });

          const avgWeight = totalWeight / sets.length;
          const avgReps = totalReps / sets.length;
          const exInfo = this.getExerciseDef(exerciseId, user);
          const minReps = exInfo ? (exInfo.exercise.minReps || 8) : 8;
          const hitTargetReps = avgReps >= minReps;

          return {
            hasData: true,
            avgWeight: this.roundWeight(avgWeight),
            maxWeight: this.roundWeight(maxWeight),
            totalVolume: Math.round(totalVolume),
            avgReps: Math.round(avgReps * 10) / 10,
            hitTargetReps,
            sets: exLog.sets,
            completed: !!exLog.completed,
            restPauseUsed: !!exLog.restPauseUsed,
            date: sessionDate
          };
        }
      }
    }

    return { hasData: false, avgWeight: 0, maxWeight: 0, totalVolume: 0, avgReps: 0, hitTargetReps: false, sets: [], date: '' };
  }

  /**
   * Calcola il Volume Totale Predetto in kg per una settimana:
   * Target Weight * Target Sets * Target Reps
   */
  static getPredictedVolume(user, exerciseId, weekNumber) {
    const exInfo = this.getExerciseDef(exerciseId, user);
    if (!exInfo) return 0;
    const target = this.calculateTargetWeight(user, exerciseId, weekNumber);
    const targetSets = this.getTargetSets(exInfo.exercise, weekNumber);
    const targetReps = exInfo.exercise.minReps || 8;
    return Math.round(target.weight * targetSets * targetReps);
  }

  /**
   * Calcola la stima teorica di carico per una data settimana a partire dal peso base.
   */
  static estimateWeightForWeek(baseWeight, exercise, weekNumber) {
    if (!baseWeight || baseWeight <= 0) return 0;
    const rate = exercise.isCompound ? 0.025 : 0.02;

    if (weekNumber === 1) return baseWeight;
    if (weekNumber <= 4) {
      return this.roundWeight(baseWeight * (1 + rate * (weekNumber - 1)));
    }
    if (weekNumber === 5) {
      const w4 = baseWeight * (1 + rate * 3);
      return this.roundWeight(w4 * 0.90);
    }
    if (weekNumber <= 9) {
      const w4 = baseWeight * (1 + rate * 3);
      return this.roundWeight(w4 * (1 + rate * (weekNumber - 5)));
    }
    const w9 = baseWeight * (1 + rate * 7);
    return this.roundWeight(w9);
  }
}

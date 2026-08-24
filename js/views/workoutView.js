import { state } from '../state.js';
import { PROTOCOL_DATA } from '../protocolData.js';
import { ProgressionEngine } from '../progressionEngine.js';
import { timer } from '../timer.js';

/**
 * Vista Allenamento: Scheda interattiva dei 3 giorni con supporto per esercizi personalizzati per singolo utente.
 */
export class WorkoutView {
  static render() {
    const container = document.getElementById('workout-view');
    if (!container) return;

    const user = state.getCurrentUser();
    if (!user) {
      container.innerHTML = `
        <div class="text-center py-16 px-4">
          <div class="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-zinc-100">Nessun atleta selezionato</h3>
          <p class="text-sm text-zinc-400 mt-1 mb-6">Seleziona o crea un profilo atleta per iniziare a registrare l'allenamento.</p>
          <button id="no-user-create-btn" class="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
            Seleziona / Crea Atleta
          </button>
        </div>
      `;
      const btn = container.querySelector('#no-user-create-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          import('./userModal.js').then(m => m.UserModal.openSwitchModal());
        });
      }
      return;
    }

    const currentWeek = state.state.selectedWeek || 1;
    const currentDayNum = state.state.selectedDay || 1;
    const phase = ProgressionEngine.getPhaseForWeek(currentWeek);
    const dayData = PROTOCOL_DATA.days.find(d => d.dayNumber === currentDayNum) || PROTOCOL_DATA.days[0];

    // Recupera tutti gli esercizi di questo giorno (Default + Personalizzati dell'utente)
    const dayExercises = ProgressionEngine.getExercisesForDay(user, currentDayNum);

    // Data registrata per questa sessione
    const userWeekData = (user.weeks && user.weeks[currentWeek]) || {};
    const userDayData = userWeekData[dayData.id] || {};
    const sessionDate = userDayData.date || new Date().toISOString().split('T')[0];

    // Calcolo completamento
    const completedCount = dayExercises.filter(ex => userDayData[ex.id]?.completed).length;
    const totalExercises = dayExercises.length;
    const completionPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner Fase Mesociclo & Settimana -->
        <div class="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold border ${phase.badgeColor}">
                  ${phase.badge}
                </span>
                ${currentWeek === 5 ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Volume -40% (2 serie) • Carichi -10%
                  </span>
                ` : ''}
                ${currentWeek >= 6 && currentWeek <= 9 ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Rest-Pause Attivo
                  </span>
                ` : ''}
              </div>
              <p class="text-xs text-zinc-400 pt-1">${phase.description}</p>
            </div>

            <!-- Selettore rapido settimana 1-10 -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              ${Array.from({ length: 10 }, (_, i) => i + 1).map(w => `
                <button class="week-pill-btn flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all ${w === currentWeek ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-105' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}" data-week="${w}">
                  W${w}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Selettore Giorni di Allenamento (Giorno 1, 2, 3) -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          ${PROTOCOL_DATA.days.map(d => {
            const allDayEx = ProgressionEngine.getExercisesForDay(user, d.dayNumber);
            const allCompleted = allDayEx.length > 0 && allDayEx.every(e => userWeekData[d.id]?.[e.id]?.completed);
            return `
              <button class="day-tab-btn p-3 sm:p-4 rounded-xl border text-left transition-all ${d.dayNumber === currentDayNum ? 'bg-zinc-800/90 border-emerald-500/60 shadow-lg shadow-emerald-950/40 text-emerald-400' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'}" data-day="${d.dayNumber}">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold tracking-wider uppercase">Giorno ${d.dayNumber}</span>
                  ${allCompleted ? `
                    <span class="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">✓</span>
                  ` : ''}
                </div>
                <div class="text-sm sm:text-base font-bold text-zinc-100 truncate">${d.subtitle}</div>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Barra di controllo sessione -->
        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
              ${completedCount}/${totalExercises}
            </div>
            <div>
              <div class="text-sm font-bold text-zinc-100">${dayData.title} - ${dayData.subtitle}</div>
              <div class="text-xs text-zinc-400">${completionPercent}% esercizi completati</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Data Sessione -->
            <div class="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3 py-1.5">
              <label for="session-date-input" class="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>Data:</span>
              </label>
              <input type="date" id="session-date-input" value="${sessionDate}" class="bg-transparent text-xs font-bold text-zinc-100 focus:outline-none cursor-pointer">
            </div>

            <!-- Pulsante Azzera Mesociclo -->
            <button id="quick-reset-meso-btn" class="text-xs font-semibold text-zinc-400 hover:text-amber-400 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5" title="Azzera il mesociclo a seguito di una lunga pausa">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Azzera Mesociclo</span>
            </button>
          </div>
        </div>

        <!-- Lista Esercizi della Sessione -->
        <div class="space-y-5">
          ${dayExercises.map((exercise, index) => this.renderExerciseCard(exercise, index + 1, currentWeek, dayData.id, user)).join('')}
        </div>

        <!-- Pulsante Aggiungi Nuovo Esercizio a questo Giorno -->
        <div class="pt-2">
          <button id="open-add-custom-exercise-btn" class="w-full py-4 px-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Aggiungi Nuovo Esercizio a ${dayData.title}</span>
          </button>
        </div>
      </div>

      <!-- Modale Creazione Esercizio Personalizzato -->
      <div id="custom-exercise-modal" class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-zinc-100">Aggiungi Esercizio Personalizzato</h3>
                <p class="text-xs text-zinc-400">Sarà visibile e calcolato solo per il profilo di <strong>${user.fullName}</strong></p>
              </div>
            </div>
            <button id="close-custom-ex-modal-btn" class="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form id="add-custom-exercise-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-zinc-300 mb-1">Nome Esercizio *</label>
              <input type="text" id="custom-ex-name" required placeholder="Es. Dip alle Parallele, Leg Press 45°..." class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Giorno di Allenamento</label>
                <select id="custom-ex-day" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500">
                  <option value="1" ${currentDayNum === 1 ? 'selected' : ''}>Giorno 1 (Petto & Bicipiti)</option>
                  <option value="2" ${currentDayNum === 2 ? 'selected' : ''}>Giorno 2 (Gambe & Glutei)</option>
                  <option value="3" ${currentDayNum === 3 ? 'selected' : ''}>Giorno 3 (Dorso & Deltoidi)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Tipologia</label>
                <select id="custom-ex-type" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500">
                  <option value="compound">Multiarticolare (+3.5% progressione)</option>
                  <option value="isolation" selected>Isolamento (+2.5% progressione)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Serie</label>
                <input type="number" id="custom-ex-sets" value="3" min="1" max="10" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-100 text-center font-bold">
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Ripetizioni</label>
                <input type="text" id="custom-ex-reps" value="8-10" placeholder="8-10" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-100 text-center font-bold">
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">RIR Target</label>
                <input type="text" id="custom-ex-rir" value="1" placeholder="1" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-100 text-center font-bold">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Recupero (secondi)</label>
                <select id="custom-ex-rest" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500">
                  <option value="60">1'00" (60s)</option>
                  <option value="75">1'15" (75s)</option>
                  <option value="90" selected>1'30" (90s)</option>
                  <option value="105">1'45" (105s)</option>
                  <option value="120">2'00" (120s)</option>
                  <option value="150">2'30" (150s)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Peso Base Iniziale (kg)</label>
                <input type="number" step="0.5" id="custom-ex-base" placeholder="0" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-100 text-center font-bold">
              </div>
            </div>

            <div>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="custom-ex-allow-rp" checked class="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500">
                <span class="text-xs text-zinc-300">Abilita tecnica <strong>Rest-Pause</strong> nelle settimane 6–9</span>
              </label>
            </div>

            <div>
              <label class="block text-xs font-semibold text-zinc-300 mb-1">Note di Esecuzione (Opzionali)</label>
              <input type="text" id="custom-ex-notes" placeholder="Es. Gomiti stretti, fermo contrazione 1s..." class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-100">
            </div>

            <div class="pt-2 flex gap-3">
              <button type="button" id="cancel-custom-ex-btn" class="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700 transition-all">
                Annulla
              </button>
              <button type="submit" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20">
                Salva ed Inizia a Tracciare
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEventListeners(container, currentWeek, dayData.id);
  }

  static renderExerciseCard(exercise, exerciseNum, currentWeek, dayId, user) {
    const baseWeight = (user.baseWeights && user.baseWeights[exercise.id]) ? parseFloat(user.baseWeights[exercise.id]) : 0;
    const currentTarget = ProgressionEngine.calculateTargetWeight(user, exercise.id, currentWeek);
    const nextWeek = Math.min(10, currentWeek + 1);
    const nextTarget = ProgressionEngine.calculateTargetWeight(user, exercise.id, nextWeek);

    const userWeekData = (user.weeks && user.weeks[currentWeek]) || {};
    const userDayData = userWeekData[dayId] || {};
    const exLog = userDayData[exercise.id] || { sets: [], completed: false, restPauseUsed: false, notes: '' };
    
    const targetSetsCount = ProgressionEngine.getTargetSets(exercise, currentWeek);
    const isRestPauseRecommended = (currentWeek >= 6 && currentWeek <= 9 && exercise.allowsRestPause);

    const setRows = Array.from({ length: targetSetsCount }, (_, setIdx) => {
      const savedSet = exLog.sets[setIdx] || { weight: '', reps: '', rir: '', restPause: false };
      const isLastSet = setIdx === targetSetsCount - 1;
      const isRpRow = isLastSet && isRestPauseRecommended;

      return `
        <tr class="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
          <td class="py-2.5 px-3 font-semibold text-zinc-300 text-xs sm:text-sm text-center">
            <span class="w-6 h-6 rounded-full bg-zinc-800 inline-flex items-center justify-center">${setIdx + 1}</span>
          </td>

          <!-- Input Carico (kg) -->
          <td class="py-2.5 px-2">
            <div class="flex items-center gap-1">
              <input type="number" step="0.5" min="0" placeholder="${currentTarget.weight || baseWeight || 0}" value="${savedSet.weight !== undefined ? savedSet.weight : ''}" class="set-weight-input w-20 sm:w-24 bg-zinc-800 border border-zinc-700/80 focus:border-emerald-500 rounded-lg py-1.5 px-2 text-center text-sm font-bold text-zinc-100" data-set="${setIdx}" data-ex="${exercise.id}">
              <span class="text-xs text-zinc-500 hidden sm:inline">kg</span>
            </div>
          </td>

          <!-- Input Ripetizioni -->
          <td class="py-2.5 px-2">
            <div class="flex items-center gap-1">
              <input type="number" min="0" max="99" placeholder="${exercise.reps}" value="${savedSet.reps !== undefined ? savedSet.reps : ''}" class="set-reps-input w-16 sm:w-20 bg-zinc-800 border border-zinc-700/80 focus:border-emerald-500 rounded-lg py-1.5 px-2 text-center text-sm font-bold text-zinc-100" data-set="${setIdx}" data-ex="${exercise.id}">
            </div>
          </td>

          <!-- RIR -->
          <td class="py-2.5 px-2">
            <select class="set-rir-select bg-zinc-800 border border-zinc-700/80 focus:border-emerald-500 rounded-lg py-1.5 px-2 text-xs sm:text-sm font-semibold text-zinc-200" data-set="${setIdx}" data-ex="${exercise.id}">
              <option value="" ${savedSet.rir === '' ? 'selected' : ''}>-</option>
              <option value="0" ${savedSet.rir == 0 ? 'selected' : ''}>0 (Cedimento)</option>
              <option value="1" ${savedSet.rir == 1 ? 'selected' : ''}>1</option>
              <option value="2" ${savedSet.rir == 2 ? 'selected' : ''}>2</option>
              <option value="3" ${savedSet.rir == 3 ? 'selected' : ''}>3</option>
              <option value="4" ${savedSet.rir == 4 ? 'selected' : ''}>4+</option>
            </select>
          </td>

          <!-- Tecnica di Intensità (Rest-Pause) -->
          <td class="py-2.5 px-2 text-center">
            <label class="inline-flex items-center cursor-pointer">
              <input type="checkbox" ${savedSet.restPause ? 'checked' : ''} class="set-rp-checkbox sr-only peer" data-set="${setIdx}" data-ex="${exercise.id}">
              <div class="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${savedSet.restPause ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : (isRpRow ? 'bg-indigo-950/40 text-indigo-400/80 border-indigo-500/20 hover:border-indigo-500/40' : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/40 hover:text-zinc-300')}">
                ${savedSet.restPause ? '⚡ Rest-Pause' : (isRpRow ? '+ Rest-Pause' : 'Standard')}
              </div>
            </label>
          </td>

          <!-- Timer rapido -->
          <td class="py-2.5 px-2 text-center">
            <button class="start-set-timer-btn p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400 transition-colors" data-time="${isRpRow && savedSet.restPause ? 15 : exercise.restSeconds}" data-name="${exercise.name}" title="Avvia timer (${exercise.restDisplay})">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="exercise-card bg-zinc-900 border ${exLog.completed ? 'border-emerald-500/40 bg-zinc-900/90 shadow-md shadow-emerald-950/20' : 'border-zinc-800/90'} rounded-2xl p-4 sm:p-5 transition-all space-y-4" data-ex="${exercise.id}">
        <!-- Intestazione Esercizio: SOLO nome esercizio -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 text-xs font-bold flex items-center justify-center">${exerciseNum}</span>
              <h4 class="text-base sm:text-lg font-bold text-zinc-100">${exercise.name}</h4>
              ${exercise.isCustom ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">Personalizzato</span>
              ` : ''}
              ${exercise.isCompound ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 uppercase tracking-wider">Multiarticolare</span>
              ` : `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 uppercase tracking-wider">Isolamento</span>
              `}
            </div>
            
            <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-0.5">
              <span class="bg-zinc-800/80 px-2.5 py-1 rounded-md font-medium text-zinc-300">
                ${targetSetsCount} serie × ${exercise.reps} rip
              </span>
              <span class="bg-zinc-800/80 px-2.5 py-1 rounded-md font-medium text-zinc-300">
                RIR ${exercise.rir || '1'}
              </span>
              <button class="start-set-timer-btn bg-zinc-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 px-2.5 py-1 rounded-md font-medium text-emerald-400/90 flex items-center gap-1 transition-colors" data-time="${exercise.restSeconds}" data-name="${exercise.name}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Rec. ${exercise.restDisplay}</span>
              </button>
            </div>
          </div>

          <!-- Pulsanti: Base, Elimina custom, e Completato -->
          <div class="flex items-center gap-2 self-end sm:self-center flex-wrap">
            <button class="edit-base-btn text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1" data-ex="${exercise.id}" data-current="${baseWeight}" title="Modifica peso base">
              <span>Base: <strong class="text-zinc-100">${baseWeight} kg</strong></span>
              <svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>

            ${exercise.isCustom ? `
              <button class="delete-custom-ex-btn p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors" data-ex="${exercise.id}" data-name="${exercise.name}" title="Elimina esercizio personalizzato">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            ` : ''}

            <button class="toggle-complete-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${exLog.completed ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}" data-ex="${exercise.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>${exLog.completed ? 'Completato' : 'Segna fatto'}</span>
            </button>
          </div>
        </div>

        <!-- Banner Carichi: Settimana Attuale e Prossima Settimana -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div class="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">🎯 Target W${currentWeek}</div>
              <div class="text-lg font-black text-emerald-400">${currentTarget.weight} <span class="text-xs font-normal text-zinc-400">kg</span></div>
            </div>
            <div class="text-right">
              <span class="text-[11px] font-medium text-zinc-400 block">${currentTarget.reason}</span>
            </div>
          </div>

          <div class="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">⏩ Target Prossima (W${nextWeek})</div>
              <div class="text-lg font-black text-teal-300">${nextTarget.weight} <span class="text-xs font-normal text-zinc-400">kg</span></div>
            </div>
            <div class="text-right">
              <span class="text-[11px] font-medium text-teal-400/90 block">${nextTarget.reason}</span>
            </div>
          </div>
        </div>

        <!-- Tabella Inserimento Serie -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="text-zinc-500 border-b border-zinc-800 text-[11px] uppercase tracking-wider">
                <th class="py-2 px-3 text-center w-12">Set</th>
                <th class="py-2 px-2">Carico</th>
                <th class="py-2 px-2">Ripetizioni</th>
                <th class="py-2 px-2">RIR</th>
                <th class="py-2 px-2 text-center">Tecnica</th>
                <th class="py-2 px-2 text-center w-12">Timer</th>
              </tr>
            </thead>
            <tbody>
              ${setRows}
            </tbody>
          </table>
        </div>

        <!-- Note Tecniche -->
        ${exercise.notes ? `
          <div class="pt-1">
            <details class="group bg-zinc-800/30 rounded-xl border border-zinc-800/60 p-3">
              <summary class="text-xs font-semibold text-zinc-400 cursor-pointer flex items-center justify-between">
                <span class="flex items-center gap-1.5 text-zinc-300">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Note di esecuzione & Cues
                </span>
                <svg class="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div class="pt-2 text-xs text-zinc-400 pl-5 leading-relaxed">
                ${exercise.notes}
              </div>
            </details>
          </div>
        ` : ''}
      </div>
    `;
  }

  static attachEventListeners(container, currentWeek, dayId) {
    const modal = container.querySelector('#custom-exercise-modal');
    const openModalBtn = container.querySelector('#open-add-custom-exercise-btn');
    const closeModalBtn = container.querySelector('#close-custom-ex-modal-btn');
    const cancelModalBtn = container.querySelector('#cancel-custom-ex-btn');
    const form = container.querySelector('#add-custom-exercise-form');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }

    const hideModal = () => {
      if (modal) modal.classList.add('hidden');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#custom-ex-name').value;
        const dayNumber = parseInt(container.querySelector('#custom-ex-day').value, 10);
        const type = container.querySelector('#custom-ex-type').value;
        const sets = parseInt(container.querySelector('#custom-ex-sets').value, 10) || 3;
        const reps = container.querySelector('#custom-ex-reps').value || '8-10';
        const rir = container.querySelector('#custom-ex-rir').value || '1';
        const restSeconds = parseInt(container.querySelector('#custom-ex-rest').value, 10) || 90;
        const baseWeight = container.querySelector('#custom-ex-base').value;
        const allowsRestPause = container.querySelector('#custom-ex-allow-rp').checked;
        const notes = container.querySelector('#custom-ex-notes').value;

        if (!name) return;

        // Estrai min/max reps da stringa
        const repsParts = reps.split('-').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
        const minReps = repsParts[0] || 8;
        const maxReps = repsParts[1] || repsParts[0] || 10;

        state.addCustomExercise(dayNumber, {
          name,
          sets,
          reps,
          minReps,
          maxReps,
          rir,
          restSeconds,
          isCompound: type === 'compound',
          allowsRestPause,
          baseWeight: baseWeight ? parseFloat(baseWeight) : 0,
          notes
        });

        hideModal();
        alert(`Esercizio "${name}" aggiunto con successo al Giorno ${dayNumber}!`);
      });
    }

    // Eliminazione esercizio personalizzato
    container.querySelectorAll('.delete-custom-ex-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.getAttribute('data-ex');
        const exName = btn.getAttribute('data-name');
        if (confirm(`Vuoi rimuovere l'esercizio personalizzato "${exName}"? I relativi dati registrati verranno cancellati.`)) {
          state.deleteCustomExercise(exId);
        }
      });
    });

    // Aggiornamento Data Sessione
    const dateInput = container.querySelector('#session-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', () => {
        state.setWorkoutDate(currentWeek, dayId, dateInput.value);
      });
    }

    // Reset Rapido Mesociclo
    const quickResetBtn = container.querySelector('#quick-reset-meso-btn');
    if (quickResetBtn) {
      quickResetBtn.addEventListener('click', () => {
        const user = state.getCurrentUser();
        if (!user) return;
        const confirmMsg = `Sei stato fermo per una lunga pausa dall'allenamento?\n\nAzzerando il mesociclo per ${user.fullName}, ripartirai dalla Settimana 1 mantenendo i tuoi pesi di base. Confermi?`;
        if (confirm(confirmMsg)) {
          state.resetMesocycle(user.id);
          alert('Mesociclo riavviato con successo dalla Settimana 1!');
        }
      });
    }

    // Cambio settimana
    container.querySelectorAll('.week-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const week = parseInt(btn.getAttribute('data-week'), 10);
        state.setSelectedWeek(week);
      });
    });

    // Cambio giorno
    container.querySelectorAll('.day-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.getAttribute('data-day'), 10);
        state.setSelectedDay(day);
      });
    });

    // Input Peso serie
    container.querySelectorAll('.set-weight-input').forEach(input => {
      input.addEventListener('change', () => {
        const exId = input.getAttribute('data-ex');
        const setIdx = parseInt(input.getAttribute('data-set'), 10);
        const weight = parseFloat(input.value) || 0;
        state.logSet(currentWeek, dayId, exId, setIdx, { weight });
      });
    });

    // Input Reps serie
    container.querySelectorAll('.set-reps-input').forEach(input => {
      input.addEventListener('change', () => {
        const exId = input.getAttribute('data-ex');
        const setIdx = parseInt(input.getAttribute('data-set'), 10);
        const reps = parseInt(input.value, 10) || 0;
        state.logSet(currentWeek, dayId, exId, setIdx, { reps });
      });
    });

    // Select RIR serie
    container.querySelectorAll('.set-rir-select').forEach(select => {
      select.addEventListener('change', () => {
        const exId = select.getAttribute('data-ex');
        const setIdx = parseInt(select.getAttribute('data-set'), 10);
        const rir = select.value;
        state.logSet(currentWeek, dayId, exId, setIdx, { rir });
      });
    });

    // Checkbox Rest-Pause serie
    container.querySelectorAll('.set-rp-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        const exId = chk.getAttribute('data-ex');
        const setIdx = parseInt(chk.getAttribute('data-set'), 10);
        const restPause = chk.checked;
        state.logSet(currentWeek, dayId, exId, setIdx, { restPause });
      });
    });

    // Avvio Timer di recupero
    container.querySelectorAll('.start-set-timer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const seconds = parseInt(btn.getAttribute('data-time'), 10) || 90;
        const name = btn.getAttribute('data-name') || '';
        timer.start(seconds, name);
      });
    });

    // Toggle Completato per esercizio
    container.querySelectorAll('.toggle-complete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.getAttribute('data-ex');
        const user = state.getCurrentUser();
        const userWeekData = (user.weeks && user.weeks[currentWeek]) || {};
        const userDayData = userWeekData[dayId] || {};
        const currentCompleted = !!userDayData[exId]?.completed;
        state.updateExerciseMeta(currentWeek, dayId, exId, { completed: !currentCompleted });
      });
    });

    // Modifica Peso Base
    container.querySelectorAll('.edit-base-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.getAttribute('data-ex');
        const currentVal = btn.getAttribute('data-current') || 0;
        const newVal = prompt(`Inserisci il peso di base per questo esercizio (kg):`, currentVal);
        if (newVal !== null && !isNaN(parseFloat(newVal))) {
          state.setBaseWeight(exId, parseFloat(newVal));
        }
      });
    });
  }
}

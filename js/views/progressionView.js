import { state } from '../state.js';
import { PROTOCOL_DATA } from '../protocolData.js';
import { ProgressionEngine } from '../progressionEngine.js';

/**
 * Vista Grafici & Progressione: Rappresentazione visiva dei carichi nel tempo e carichi predetti.
 * Supporta tutti i 18 esercizi standard + gli esercizi personalizzati dell'atleta.
 */
export class ProgressionView {
  static currentChart = null;
  static selectedExerciseId = 'ex_1_1'; // Default: Panca Piana
  static chartMetricMode = 'weight'; // 'weight' (kg per rip) | 'volume' (volume totale kg)

  static render() {
    const container = document.getElementById('progression-view');
    if (!container) return;

    const user = state.getCurrentUser();
    if (!user) {
      container.innerHTML = `<div class="text-center py-12 text-zinc-400">Seleziona un atleta per visualizzare i grafici e la progressione.</div>`;
      return;
    }

    // Tutti gli esercizi dell'utente (Default + Personalizzati)
    const allUserExercises = ProgressionEngine.getAllExercisesForUser(user);

    // Se l'esercizio selezionato non esiste più, reimposta al primo disponibile
    if (!allUserExercises.some(e => e.id === this.selectedExerciseId)) {
      this.selectedExerciseId = allUserExercises[0]?.id || 'ex_1_1';
    }

    // Costruzione opzioni select raggruppate per Giorno
    const dayGroups = [1, 2, 3].map(dNum => {
      const dayDef = PROTOCOL_DATA.days.find(d => d.dayNumber === dNum);
      const exList = allUserExercises.filter(e => e.dayNumber === dNum);
      if (exList.length === 0) return '';
      return `
        <optgroup label="${dayDef.title} - ${dayDef.subtitle}">
          ${exList.map(ex => `
            <option value="${ex.id}" ${ex.id === this.selectedExerciseId ? 'selected' : ''}>
              ${ex.name} ${ex.isCustom ? '(Personalizzato)' : `(${ex.isCompound ? 'Multiarticolare' : 'Isolamento'})`}
            </option>
          `).join('')}
        </optgroup>
      `;
    }).join('');

    // Costruisci le righe per la matrice delle 10 settimane
    const rowsHTML = allUserExercises.map((ex, index) => {
      const baseWeight = (user.baseWeights && user.baseWeights[ex.id]) ? parseFloat(user.baseWeights[ex.id]) : 0;
      
      const weekCells = Array.from({ length: 10 }, (_, i) => {
        const w = i + 1;
        const logged = ProgressionEngine.getLoggedExerciseData(user, ex.id, w);
        const target = ProgressionEngine.calculateTargetWeight(user, ex.id, w);

        let cellContent = '';
        let cellClass = 'bg-zinc-900 text-zinc-400';

        if (logged.hasData && logged.avgWeight > 0) {
          cellContent = `<span class="font-bold text-zinc-100">${logged.avgWeight}</span><span class="text-[10px] text-zinc-400">kg</span>`;
          cellClass = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold';
        } else {
          cellContent = `<span class="text-zinc-500">${target.weight}</span><span class="text-[10px] text-zinc-600">kg</span>`;
          if (w === 5) cellClass = 'bg-amber-950/20 text-amber-500/70';
          else if (w >= 6 && w <= 9) cellClass = 'bg-indigo-950/20 text-indigo-400/70';
        }

        return `
          <td class="py-2.5 px-2 text-center text-xs border border-zinc-800/80 ${cellClass}">
            ${cellContent}
          </td>
        `;
      }).join('');

      const w1Target = ProgressionEngine.calculateTargetWeight(user, ex.id, 1).weight;
      const w10Target = ProgressionEngine.calculateTargetWeight(user, ex.id, 10).weight;
      const totalDeltaKg = Math.round((w10Target - w1Target) * 10) / 10;
      const totalDeltaPct = w1Target > 0 ? Math.round(((w10Target - w1Target) / w1Target) * 100) : 0;

      return `
        <tr class="hover:bg-zinc-800/40 transition-colors">
          <td class="py-3 px-3 border border-zinc-800/80 font-bold text-zinc-200 text-xs sm:text-sm sticky left-0 bg-zinc-900 z-10">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="w-5 h-5 rounded-md bg-zinc-800 text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">${index + 1}</span>
              <span class="truncate">${ex.name}</span>
              ${ex.isCustom ? `
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Custom</span>
              ` : ''}
            </div>
            <div class="text-[10px] text-zinc-500 font-normal pl-7">${ex.daySubtitle}</div>
          </td>
          <td class="py-2.5 px-2 text-center text-xs font-bold text-zinc-300 border border-zinc-800/80 bg-zinc-800/50">
            ${baseWeight} kg
          </td>
          ${weekCells}
          <td class="py-2.5 px-2 text-center text-xs font-bold text-emerald-400 border border-zinc-800/80 bg-emerald-950/30">
            +${totalDeltaKg} kg <span class="text-[10px] text-emerald-500 font-normal">(+${totalDeltaPct}%)</span>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- SEZIONE GRAFICI VISIVI TEMPORALI & PREDIZIONI -->
        <div class="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                </span>
                <h3 class="text-lg sm:text-xl font-bold text-zinc-100">Grafico Trend nel Tempo & Carichi Predetti</h3>
              </div>
              <p class="text-xs text-zinc-400 mt-1">Confronto visivo tra i carichi reali registrati (con relative date) e la progressione predetta dal protocollo.</p>
            </div>

            <!-- Selettore Esercizio -->
            <div class="min-w-[240px]">
              <label class="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Seleziona Esercizio:</label>
              <select id="chart-exercise-select" class="w-full bg-zinc-800 border border-zinc-700/90 text-zinc-100 text-xs font-bold rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500">
                ${dayGroups}
              </select>
            </div>
          </div>

          <!-- Switcher Metrica: Carico per rip (kg) VS Volume Totale (kg) -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
            <div class="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button id="metric-mode-weight-btn" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.chartMetricMode === 'weight' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-200'}">
                🏋️‍♂️ Carico per Singola Rip (kg)
              </button>
              <button id="metric-mode-volume-btn" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.chartMetricMode === 'volume' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-200'}">
                📦 Volume Totale Macchina (kg)
              </button>
            </div>

            <!-- Indicatori Legenda -->
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></span>
                <span class="text-zinc-200 font-semibold">Carico Reale Registrato</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 border-t-2 border-dashed border-teal-400"></span>
                <span class="text-zinc-400 font-semibold">Traiettoria Predetta</span>
              </div>
            </div>
          </div>

          <!-- Canvas Grafico Chart.js -->
          <div class="relative h-72 sm:h-80 w-full bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60">
            <canvas id="progression-canvas"></canvas>
          </div>
        </div>

        <!-- SEZIONE MATRICE COMPLETA 10 SETTIMANE -->
        <div class="space-y-4">
          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-zinc-100">Matrice di Dettaglio del Mesociclo (10 Settimane)</h3>
                <p class="text-xs text-zinc-400">Riepilogo tabellare di tutti gli esercizi (inclusi quelli personalizzati) con le 4 fasi.</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80 text-xs">
              <span class="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> W1-W4: Accumulo Lineare (+2.5%/settimana)
              </span>
              <span class="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> W5: Deload (-10% carico, 2 serie)
              </span>
              <span class="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-medium flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> W6-W9: Rest-Pause
              </span>
              <span class="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-medium flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> W10: Test & Valutazione
              </span>
            </div>
          </div>

          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr class="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                    <th class="py-3 px-3 border border-zinc-800/80 sticky left-0 bg-zinc-950 z-20 w-56">Esercizio</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-20 bg-zinc-900">Base</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14">W1</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14">W2</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14">W3</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14">W4</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14 bg-amber-950/20 text-amber-400">W5</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14 bg-indigo-950/20 text-indigo-400">W6</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14 bg-indigo-950/20 text-indigo-400">W7</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14 bg-indigo-950/20 text-indigo-400">W8</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14 bg-indigo-950/20 text-indigo-400">W9</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-14 bg-purple-950/20 text-purple-400">W10</th>
                    <th class="py-3 px-2 border border-zinc-800/80 text-center w-24 bg-emerald-950/40 text-emerald-300">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHTML}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(container, user);
    this.renderChart(user);
  }

  static attachEventListeners(container, user) {
    const select = container.querySelector('#chart-exercise-select');
    if (select) {
      select.addEventListener('change', () => {
        this.selectedExerciseId = select.value;
        this.renderChart(user);
      });
    }

    const weightBtn = container.querySelector('#metric-mode-weight-btn');
    const volumeBtn = container.querySelector('#metric-mode-volume-btn');

    if (weightBtn && volumeBtn) {
      weightBtn.addEventListener('click', () => {
        this.chartMetricMode = 'weight';
        this.render();
      });
      volumeBtn.addEventListener('click', () => {
        this.chartMetricMode = 'volume';
        this.render();
      });
    }
  }

  static renderChart(user) {
    const canvas = document.getElementById('progression-canvas');
    if (!canvas || !window.Chart) return;

    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }

    const exId = this.selectedExerciseId;
    const isVolumeMode = this.chartMetricMode === 'volume';

    const labels = [];
    const actualData = [];
    const predictedData = [];

    for (let w = 1; w <= 10; w++) {
      const logged = ProgressionEngine.getLoggedExerciseData(user, exId, w);
      const targetWeightObj = ProgressionEngine.calculateTargetWeight(user, exId, w);
      const predictedVol = ProgressionEngine.getPredictedVolume(user, exId, w);

      let label = `W${w}`;
      if (logged.hasData && logged.date) {
        try {
          const d = new Date(logged.date);
          label = `${d.getDate()}/${d.getMonth() + 1} (W${w})`;
        } catch (e) {
          label = `W${w}`;
        }
      }
      labels.push(label);

      if (isVolumeMode) {
        actualData.push(logged.hasData && logged.totalVolume > 0 ? logged.totalVolume : null);
        predictedData.push(predictedVol);
      } else {
        actualData.push(logged.hasData && logged.avgWeight > 0 ? logged.avgWeight : null);
        predictedData.push(targetWeightObj.weight);
      }
    }

    const ctx = canvas.getContext('2d');
    this.currentChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: isVolumeMode ? 'Volume Reale (kg)' : 'Carico Reale (kg)',
            data: actualData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.25,
            fill: true,
            spanGaps: true
          },
          {
            label: isVolumeMode ? 'Volume Predetto (kg)' : 'Carico Predetto (kg)',
            data: predictedData,
            borderColor: '#14b8a6',
            borderWidth: 2,
            borderDash: [6, 6],
            pointBackgroundColor: '#14b8a6',
            pointRadius: 3,
            tension: 0.25,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#18181b',
            titleColor: '#f4f4f5',
            bodyColor: '#e4e4e7',
            borderColor: '#3f3f46',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                if (val === null || isNaN(val)) return '';
                const unit = isVolumeMode ? ' kg totali' : ' kg';
                return ` ${context.dataset.label}: ${val}${unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(39, 39, 42, 0.6)'
            },
            ticks: {
              color: '#a1a1aa',
              font: { size: 11 }
            }
          },
          y: {
            grid: {
              color: 'rgba(39, 39, 42, 0.6)'
            },
            ticks: {
              color: '#a1a1aa',
              font: { size: 11 },
              callback: (val) => `${val} kg`
            }
          }
        }
      }
    });
  }
}

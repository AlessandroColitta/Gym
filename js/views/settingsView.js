import { state } from '../state.js';
import { PROTOCOL_DATA } from '../protocolData.js';
import { ProgressionEngine } from '../progressionEngine.js';
import { SyncManager } from '../sync.js';
import { cloudSync } from '../cloudSync.js';
import { UserModal } from './userModal.js';

/**
 * Vista Impostazioni: Gestione profili, reset mesociclo per pause, pesi base (standard + personalizzati), Cloud Sync e Backup.
 */
export class SettingsView {
  static render() {
    const container = document.getElementById('settings-view');
    if (!container) return;

    const user = state.getCurrentUser();
    const allUsers = state.state.users || [];
    const cloudConfig = cloudSync.getSavedConfig();

    // Genera lista pesi base suddivisi per giorno (inclusi gli esercizi personalizzati dell'utente)
    const baseWeightSections = PROTOCOL_DATA.days.map(day => {
      const dayExercises = ProgressionEngine.getExercisesForDay(user, day.dayNumber);
      const inputs = dayExercises.map(ex => {
        const currentVal = (user && user.baseWeights && user.baseWeights[ex.id]) ? user.baseWeights[ex.id] : '';
        return `
          <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-xs text-zinc-300 font-medium truncate">${ex.name}</span>
              ${ex.isCustom ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Custom</span>` : ''}
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <input type="number" step="0.5" min="0" placeholder="0" value="${currentVal}" class="base-weight-input w-20 bg-zinc-800 border border-zinc-700 focus:border-emerald-500 rounded-lg py-1 px-2 text-xs font-bold text-zinc-100 text-center" data-ex="${ex.id}">
              <span class="text-xs text-zinc-500">kg</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="space-y-2">
          <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">${day.title} - ${day.subtitle}</h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${inputs}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Scheda Sincronizzazione Cloud Automatica Multi-Dispositivo -->
        <div class="bg-gradient-to-br from-zinc-900 to-zinc-950 border ${cloudConfig ? 'border-emerald-500/40 shadow-emerald-950/20' : 'border-zinc-800'} rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl ${cloudConfig ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'} flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>Sincronizzazione Cloud Real-Time</span>
                  ${cloudConfig ? `
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ATTIVA</span>
                  ` : `
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">DISATTIVA</span>
                  `}
                </h3>
                <p class="text-xs text-zinc-400">Tutti i dati, atleti ed esercizi personalizzati vengono sincronizzati su qualsiasi smartphone o PC online.</p>
              </div>
            </div>

            ${cloudConfig ? `
              <button id="disconnect-cloud-btn" class="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs font-semibold border border-zinc-700 transition-all self-start sm:self-auto">
                Disconnetti Cloud
              </button>
            ` : ''}
          </div>

          ${cloudConfig ? `
            <div class="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Connessione Cloud attiva: ${cloudConfig.type === 'firebase' ? 'Google Firebase Firestore' : 'Google Drive / Apps Script'}</span>
              </div>
              <p class="text-zinc-400 text-[11px]">Ogni serie, carico o atleta inserito viene salvato istantaneamente nel cloud e aggiornato su tutti i dispositivi collegati in tempo reale.</p>
            </div>
          ` : `
            <div class="space-y-3 pt-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/80 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Google Firebase</span>
                    <span class="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">100% Gratis</span>
                  </div>
                  <p class="text-xs text-zinc-300 leading-relaxed">
                    Database istantaneo in tempo reale fornito da Google. Crea un progetto gratuito su <a href="https://console.firebase.google.com" target="_blank" class="text-emerald-400 underline font-semibold">Firebase Console</a> e incolla la configurazione.
                  </p>
                  <button id="open-firebase-setup-btn" class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>Configura Google Firebase (30s)</span>
                  </button>
                </div>

                <div class="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/80 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-teal-400 uppercase tracking-wider">Google Drive / Apps Script</span>
                    <span class="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">Incluso Google AI</span>
                  </div>
                  <p class="text-xs text-zinc-300 leading-relaxed">
                    Salva automaticamente su Google Drive o Google Fogli usando un semplice script gratuito associato al tuo account Google.
                  </p>
                  <button id="open-gas-setup-btn" class="w-full py-2.5 px-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-zinc-600">
                    <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                    <span>Configura Google Drive Script</span>
                  </button>
                </div>
              </div>
            </div>
          `}
        </div>

        <!-- Scheda Profilo Atleta Attivo & Opzione Azzeramento Mesociclo -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-zinc-950 text-xl shadow-lg">
                ${user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '?'}
              </div>
              <div>
                <h3 class="text-lg font-bold text-zinc-100">${user ? user.fullName : 'Nessun atleta'}</h3>
                <p class="text-xs text-zinc-400">Settimana ${user ? (user.currentWeek || 1) : 1} • ${allUsers.length} atleta/i registrati • ${user?.customExercises?.length || 0} esercizi personalizzati</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button id="switch-user-btn" class="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-700">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                <span>Cambia Atleta</span>
              </button>
              <button id="new-user-btn" class="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Nuovo Atleta</span>
              </button>
            </div>
          </div>

          <!-- Card Azzeramento Mesociclo per Pause Lunghe -->
          ${user ? `
            <div class="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  <span>Lunga Pausa dall'Allenamento?</span>
                </div>
                <p class="text-[11px] text-zinc-400">Se hai interrotto gli allenamenti per ferie, infortuni o pause prolungate, puoi azzerare il mesociclo per ripartire dalla Settimana 1 mantenendo i tuoi pesi di base.</p>
              </div>
              <button id="reset-mesocycle-btn" class="py-2 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto">
                Azzera e Riavvia Mesociclo
              </button>
            </div>

            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
              <span>Creato il ${new Date(user.createdAt).toLocaleDateString('it-IT')}</span>
              <button id="delete-user-btn" class="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1" data-userid="${user.id}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>Elimina Profilo</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Modifica Pesi di Base (Standard + Personalizzati) -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-base font-bold text-zinc-100">Pesi di Base del Mesociclo</h4>
              <p class="text-xs text-zinc-400">Carichi di partenza per ciascun esercizio (inclusi quelli personalizzati).</p>
            </div>
            <button id="save-all-base-weights-btn" class="py-2 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5">
              <span>Salva Pesi Base</span>
            </button>
          </div>

          <div class="space-y-4 pt-2">
            ${baseWeightSections}
          </div>
        </div>

        <!-- Backup Manuale & Esportazione Fogli Google / CSV -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h4 class="text-base font-bold text-zinc-100">Backup Manuale & Esportazione</h4>
            <p class="text-xs text-zinc-400 mt-0.5">Puoi sempre esportare la scheda per visualizzarla su Excel o Google Fogli.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button id="export-json-btn" class="p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-left transition-all space-y-1 group">
              <div class="text-xs font-bold text-zinc-200">💾 Scarica Backup JSON</div>
              <div class="text-[11px] text-zinc-500">Salva file sul tuo computer</div>
            </button>

            <button id="export-csv-btn" class="p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-left transition-all space-y-1 group">
              <div class="text-xs font-bold text-zinc-200">📊 Esporta Tabella CSV</div>
              <div class="text-[11px] text-zinc-500">Apri su Google Fogli / Excel</div>
            </button>

            <label class="p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-left transition-all space-y-1 group cursor-pointer block">
              <input type="file" id="import-json-input" accept=".json" class="hidden">
              <div class="text-xs font-bold text-zinc-200">📂 Ripristina da Backup</div>
              <div class="text-[11px] text-zinc-500">Carica file JSON</div>
            </label>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(container);
  }

  static attachEventListeners(container) {
    const resetBtn = container.querySelector('#reset-mesocycle-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const user = state.getCurrentUser();
        if (!user) return;
        const msg = `Vuoi azzerare il mesociclo per ${user.fullName}?\n\nTutte le serie delle 10 settimane verranno azzerate e ripartirai dalla Settimana 1. I tuoi carichi di base rimarranno salvati.`;
        if (confirm(msg)) {
          state.resetMesocycle(user.id);
          alert('Mesociclo azzerato con successo. Buon nuovo inizio!');
          this.render();
        }
      });
    }

    const disconnectBtn = container.querySelector('#disconnect-cloud-btn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        if (confirm('Vuoi disconnettere la sincronizzazione cloud? I dati rimarranno comunque salvati sul tuo dispositivo locale.')) {
          cloudSync.clearConfig();
          this.render();
        }
      });
    }

    const openFirebaseBtn = container.querySelector('#open-firebase-setup-btn');
    if (openFirebaseBtn) {
      openFirebaseBtn.addEventListener('click', () => {
        const configStr = prompt(
          'Incolla il testo del tuo oggetto "firebaseConfig" (da console.firebase.google.com):\n\nEsempio:\n{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "..."\n}'
        );
        if (configStr) {
          try {
            let clean = configStr.trim();
            if (clean.startsWith('const firebaseConfig =')) {
              clean = clean.replace('const firebaseConfig =', '').replace(/;$/, '').trim();
            }
            const parsed = new Function('return ' + clean)();
            if (parsed && parsed.projectId) {
              cloudSync.connectFirebase(parsed).then(res => {
                if (res.success) {
                  alert('🎉 Connessione Cloud Firebase stabilita con successo! Tutti i dispositivi ora sono sincronizzati online.');
                  this.render();
                } else {
                  alert('Errore connessione: ' + res.error);
                }
              });
            } else {
              alert('Configurazione non valida: projectId mancante.');
            }
          } catch (e) {
            alert('Errore nel formato della configurazione: ' + e.message);
          }
        }
      });
    }

    const openGasBtn = container.querySelector('#open-gas-setup-btn');
    if (openGasBtn) {
      openGasBtn.addEventListener('click', () => {
        const url = prompt('Inserisci l\'URL della tua Web App Google Apps Script:');
        if (url && url.startsWith('http')) {
          cloudSync.connectGoogleAppsScript(url).then(res => {
            if (res.success) {
              alert('Connessione Google Drive Apps Script stabilita con successo!');
              this.render();
            } else {
              alert('Errore connessione: ' + res.error);
            }
          });
        }
      });
    }

    const switchBtn = container.querySelector('#switch-user-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        UserModal.openSwitchModal();
      });
    }

    const newBtn = container.querySelector('#new-user-btn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        UserModal.openNewUserModal();
      });
    }

    const delBtn = container.querySelector('#delete-user-btn');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        const userId = delBtn.getAttribute('data-userid');
        if (confirm('Sei sicuro di voler eliminare questo profilo atleta e tutti i suoi dati di allenamento?')) {
          state.deleteUser(userId);
        }
      });
    }

    const saveBaseBtn = container.querySelector('#save-all-base-weights-btn');
    if (saveBaseBtn) {
      saveBaseBtn.addEventListener('click', () => {
        const weightsMap = {};
        container.querySelectorAll('.base-weight-input').forEach(input => {
          const exId = input.getAttribute('data-ex');
          if (input.value !== '') {
            weightsMap[exId] = parseFloat(input.value) || 0;
          }
        });
        state.setAllBaseWeights(weightsMap);
        alert('Pesi di base aggiornati con successo!');
      });
    }

    const exportJsonBtn = container.querySelector('#export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        SyncManager.exportJSON();
      });
    }

    const exportCsvBtn = container.querySelector('#export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        SyncManager.exportCSV();
      });
    }

    const importInput = container.querySelector('#import-json-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          SyncManager.importJSONFile(file, (res) => {
            if (res.success) {
              alert(`Database ripristinato con successo! (${res.count} atleti caricati)`);
            } else {
              alert('Errore: ' + res.error);
            }
          });
        }
      });
    }
  }
}

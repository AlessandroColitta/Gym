import { state } from '../state.js';
import { PROTOCOL_DATA } from '../protocolData.js';

/**
 * Gestione modale di selezione e registrazione atleti / multi-utente.
 */
export class UserModal {
  static render() {
    const modalContainer = document.getElementById('user-modal');
    if (!modalContainer) return;

    const currentUser = state.getCurrentUser();
    const allUsers = state.state.users || [];

    if (!currentUser && allUsers.length === 0) {
      // Primo avvio assoluto: mostra form di creazione
      modalContainer.innerHTML = this.getCreateUserHTML(true);
      modalContainer.classList.remove('hidden');
      this.attachEventListeners(modalContainer, true);
    } else if (!currentUser && allUsers.length > 0) {
      // Ci sono utenti salvati ma nessuno selezionato: mostra lista
      modalContainer.innerHTML = this.getSelectUserHTML(allUsers);
      modalContainer.classList.remove('hidden');
      this.attachEventListeners(modalContainer, false);
    } else {
      modalContainer.classList.add('hidden');
    }
  }

  static openSwitchModal() {
    const modalContainer = document.getElementById('user-modal');
    if (!modalContainer) return;
    const allUsers = state.state.users || [];
    modalContainer.innerHTML = this.getSelectUserHTML(allUsers, true);
    modalContainer.classList.remove('hidden');
    this.attachEventListeners(modalContainer, false, true);
  }

  static openNewUserModal() {
    const modalContainer = document.getElementById('user-modal');
    if (!modalContainer) return;
    modalContainer.innerHTML = this.getCreateUserHTML(false);
    modalContainer.classList.remove('hidden');
    this.attachEventListeners(modalContainer, false);
  }

  static getSelectUserHTML(users, canClose = false) {
    const userCards = users.map(u => `
      <div class="user-select-card bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer flex items-center justify-between" data-userid="${u.id}">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-zinc-950 text-lg shadow-md">
            ${u.firstName.charAt(0).toUpperCase()}${u.lastName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-bold text-zinc-100 text-base">${u.fullName}</div>
            <div class="text-xs text-zinc-400">Settimana ${u.currentWeek || 1} • Creato il ${new Date(u.createdAt).toLocaleDateString('it-IT')}</div>
          </div>
        </div>
        <div class="text-emerald-400 flex items-center gap-1 text-sm font-semibold">
          <span>Accedi</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </div>
    `).join('');

    return `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-zinc-100">Chi si allena?</h2>
                <p class="text-xs text-zinc-400">Seleziona il tuo profilo atleta salvato</p>
              </div>
            </div>
            ${canClose ? `
              <button id="close-user-modal-btn" class="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            ` : ''}
          </div>

          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            ${userCards}
          </div>

          <div class="pt-2 border-t border-zinc-800 flex gap-3">
            <button id="open-new-user-btn" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Registra Nuovo Atleta</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static getCreateUserHTML(isFirstLaunch = false) {
    const keyExercises = [
      { id: 'ex_1_1', name: 'Panca Piana Bilanciere', def: 60 },
      { id: 'ex_2_1', name: 'Squat Bilanciere (Back)', def: 80 },
      { id: 'ex_2_3', name: 'Stacco Rumeno (RDL)', def: 70 },
      { id: 'ex_2_4', name: 'Hip Thrust Bilanciere', def: 80 },
      { id: 'ex_3_1', name: 'Trazioni (Sovraccarico/Peso)', def: 0 },
      { id: 'ex_3_2', name: 'Rematore Manubrio/Pulley', def: 24 }
    ];

    const baseWeightInputs = keyExercises.map(ex => `
      <div>
        <label class="block text-xs text-zinc-400 mb-1 truncate">${ex.name}</label>
        <div class="relative">
          <input type="number" step="0.5" min="0" placeholder="${ex.def}" id="base_${ex.id}" class="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg py-1.5 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500">
          <span class="absolute right-3 top-1.5 text-xs text-zinc-500">kg</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-zinc-100">Registrazione Atleta</h2>
                <p class="text-xs text-zinc-400">Inserisci i tuoi dati per iniziare il mesociclo di 10 settimane</p>
              </div>
            </div>
            ${!isFirstLaunch ? `
              <button id="cancel-create-user-btn" class="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            ` : ''}
          </div>

          <form id="create-user-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Nome *</label>
                <input type="text" id="user-firstname" required placeholder="Nome" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-300 mb-1">Cognome *</label>
                <input type="text" id="user-lastname" required placeholder="Cognome" class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500">
              </div>
            </div>

            <div class="bg-zinc-800/40 border border-zinc-800 rounded-xl p-3.5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Pesi di partenza indicativi (opzionali)</span>
                <span class="text-[11px] text-zinc-500">Modificabili in qualsiasi momento</span>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                ${baseWeightInputs}
              </div>
            </div>

            <div class="pt-2 flex gap-3">
              ${!isFirstLaunch && state.state.users.length > 0 ? `
                <button type="button" id="back-to-select-user-btn" class="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-700 transition-all">
                  Annulla
                </button>
              ` : ''}
              <button type="submit" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                <span>Inizia Mesociclo</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  static attachEventListeners(container, isFirstLaunch = false, canClose = false) {
    // Selezione atleta da lista
    container.querySelectorAll('.user-select-card').forEach(card => {
      card.addEventListener('click', () => {
        const userId = card.getAttribute('data-userid');
        if (userId) {
          state.selectUser(userId);
          container.classList.add('hidden');
        }
      });
    });

    // Pulsante nuovo utente da lista
    const newBtn = container.querySelector('#open-new-user-btn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        this.openNewUserModal();
      });
    }

    // Chiusura modale
    const closeBtn = container.querySelector('#close-user-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.classList.add('hidden');
      });
    }

    const cancelCreateBtn = container.querySelector('#cancel-create-user-btn');
    if (cancelCreateBtn) {
      cancelCreateBtn.addEventListener('click', () => {
        if (state.state.users.length > 0) {
          this.render();
        } else {
          container.classList.add('hidden');
        }
      });
    }

    const backBtn = container.querySelector('#back-to-select-user-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.render();
      });
    }

    // Submit form creazione atleta
    const form = container.querySelector('#create-user-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = container.querySelector('#user-firstname').value;
        const lastName = container.querySelector('#user-lastname').value;

        if (!firstName || !lastName) return;

        // Raccogli pesi base
        const baseWeights = {};
        for (const day of PROTOCOL_DATA.days) {
          for (const ex of day.exercises) {
            const input = container.querySelector(`#base_${ex.id}`);
            if (input && input.value) {
              baseWeights[ex.id] = parseFloat(input.value);
            }
          }
        }

        state.createUser(firstName, lastName, baseWeights);
        container.classList.add('hidden');
      });
    }
  }
}

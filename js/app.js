import { state } from './state.js';
import { timer } from './timer.js';
import { cloudSync } from './cloudSync.js';
import { UserModal } from './views/userModal.js';
import { WorkoutView } from './views/workoutView.js';
import { ProgressionView } from './views/progressionView.js';
import { SettingsView } from './views/settingsView.js';

/**
 * Applicazione Principale: Coordinamento Viste, Navigazione e Timer.
 */
class App {
  static async init() {
    this.setupNavigation();
    this.setupHeaderActions();
    this.setupTimerControls();
    this.setupPWA();

    // Sottoscrivi aggiornamenti di stato per re-render automatico
    state.subscribe(() => {
      this.render();
    });

    // Inizializza Sincronizzazione Cloud Automatica
    await cloudSync.init();

    // Render iniziale
    this.render();

    // Controlla se mostrare modale utente al primo avvio
    const currentUser = state.getCurrentUser();
    if (!currentUser) {
      UserModal.render();
    }
  }

  static render() {
    this.updateHeaderProfile();
    cloudSync.updateHeaderBadge();
    this.renderActiveTab();
  }

  static updateHeaderProfile() {
    const user = state.getCurrentUser();
    const avatar = document.getElementById('header-avatar');
    const userName = document.getElementById('header-user-name');
    const weekBadge = document.getElementById('header-week-badge');

    if (user) {
      if (avatar) avatar.textContent = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
      if (userName) userName.textContent = user.fullName;
      if (weekBadge) weekBadge.textContent = `W${state.state.selectedWeek || 1}`;
    } else {
      if (avatar) avatar.textContent = '?';
      if (userName) userName.textContent = 'Seleziona Atleta';
      if (weekBadge) weekBadge.textContent = 'W1';
    }
  }

  static renderActiveTab() {
    const tab = state.state.activeTab || 'workout';

    // Aggiorna classi bottoni navigazione
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const btnTab = btn.getAttribute('data-tab');
      if (btnTab === tab) {
        btn.classList.add('text-emerald-400', 'border-emerald-500', 'bg-emerald-500/10');
        btn.classList.remove('text-zinc-400', 'border-transparent');
      } else {
        btn.classList.remove('text-emerald-400', 'border-emerald-500', 'bg-emerald-500/10');
        btn.classList.add('text-zinc-400', 'border-transparent');
      }
    });

    // Nascondi tutti i container vista
    const views = ['workout-view', 'progression-view', 'settings-view'];
    views.forEach(vId => {
      const el = document.getElementById(vId);
      if (el) el.classList.add('hidden');
    });

    // Mostra e renderizza la vista attiva
    const activeViewEl = document.getElementById(`${tab}-view`);
    if (activeViewEl) {
      activeViewEl.classList.remove('hidden');
      switch (tab) {
        case 'workout':
          WorkoutView.render();
          break;
        case 'progression':
          ProgressionView.render();
          break;
        case 'settings':
          SettingsView.render();
          break;
      }
    }
  }

  static setupNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          state.setActiveTab(tab);
        }
      });
    });
  }

  static setupHeaderActions() {
    const userBtn = document.getElementById('header-user-btn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        UserModal.openSwitchModal();
      });
    }

    const cloudBadge = document.getElementById('cloud-status-badge');
    if (cloudBadge) {
      cloudBadge.addEventListener('click', () => {
        state.setActiveTab('settings');
      });
    }
  }

  static setupTimerControls() {
    const playPauseBtn = document.getElementById('timer-play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (timer.isRunning) {
          timer.pause();
        } else {
          timer.resume();
        }
      });
    }

    const add15Btn = document.getElementById('timer-add-15-btn');
    if (add15Btn) {
      add15Btn.addEventListener('click', () => {
        timer.addTime(15);
      });
    }

    const add30Btn = document.getElementById('timer-add-30-btn');
    if (add30Btn) {
      add30Btn.addEventListener('click', () => {
        timer.addTime(30);
      });
    }

    const sub15Btn = document.getElementById('timer-sub-15-btn');
    if (sub15Btn) {
      sub15Btn.addEventListener('click', () => {
        timer.addTime(-15);
      });
    }

    const closeBtn = document.getElementById('timer-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        timer.stop();
      });
    }
  }

  static setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration:', err);
        });
      });
    }
  }
}

// Avvio all'evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

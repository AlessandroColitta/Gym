import { state } from './state.js';
import { PROTOCOL_DATA } from './protocolData.js';

/**
 * Gestore di esportazione, importazione e sincronizzazione cloud / Google Drive.
 */
export class SyncManager {
  /**
   * Scarica il backup completo in formato JSON.
   */
  static exportJSON() {
    const jsonStr = state.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `mesocycle_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Importa un file JSON selezionato dall'utente.
   */
  static importJSONFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const res = state.importDatabaseJSON(content);
      if (callback) callback(res);
    };
    reader.readAsText(file);
  }

  /**
   * Esporta i dati dell'atleta corrente in formato CSV (compatibile con Google Fogli / Excel / Drive).
   */
  static exportCSV() {
    const user = state.getCurrentUser();
    if (!user) {
      alert('Nessun atleta selezionato');
      return;
    }

    const rows = [
      ['Atleta', user.fullName],
      ['Data Esportazione', new Date().toLocaleDateString('it-IT')],
      ['Settimana Attuale', user.currentWeek || 1],
      [''],
      ['Settimana', 'Giorno', 'Esercizio', 'Serie #', 'Carico (kg)', 'Ripetizioni', 'RIR', 'Rest-Pause Usato', 'Completato']
    ];

    for (let w = 1; w <= 10; w++) {
      const weekData = (user.weeks && user.weeks[w]) || {};
      for (const day of PROTOCOL_DATA.days) {
        const dayData = weekData[day.id] || {};
        for (const ex of day.exercises) {
          const exLog = dayData[ex.id] || { sets: [] };
          const sets = exLog.sets || [];
          if (sets.length === 0) {
            rows.push([`Settimana ${w}`, day.title, ex.name, 'N/D', '', '', '', '', 'No']);
          } else {
            sets.forEach((s, idx) => {
              rows.push([
                `Settimana ${w}`,
                day.title,
                ex.name,
                idx + 1,
                s.weight || '',
                s.reps || '',
                s.rir || '',
                s.restPause ? 'Sì' : 'No',
                exLog.completed ? 'Sì' : 'No'
              ]);
            });
          }
        }
      }
    }

    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `allenamento_${user.firstName}_${user.lastName}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Sincronizzazione cloud tramite Firebase Firestore o REST backend (opzionale).
   */
  static async syncToCloud(endpointUrl, apiKey) {
    if (!endpointUrl) return { success: false, message: 'URL endpoint mancante' };
    try {
      const payload = {
        users: state.state.users,
        updatedAt: new Date().toISOString()
      };
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : undefined
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return { success: true, message: 'Sincronizzazione cloud completata con successo!' };
      } else {
        return { success: false, message: `Errore server: ${res.statusText}` };
      }
    } catch (e) {
      return { success: false, message: 'Errore di connessione: ' + e.message };
    }
  }
}

# ⚡ Mesocycle Tracker • Protocollo Ricomposizione Corporea

Applicazione web moderna, mobile-first e installabile (PWA) per il tracciamento del mesociclo di 10 settimane a blocchi puri con sovraccarico progressivo calcolato, grafici temporali interattivi e sincronizzazione Cloud in tempo reale.

---

## 📱 Funzionalità Principali

- 👥 **Multi-Utente Integrato**: Registrazione atleti con Nome e Cognome, profili multipli isolati e passaggio rapido da un utente all'altro.
- 📅 **Data per Ogni Allenamento**: Inserimento della data reale per ciascuna sessione per tracciare i progressi accuratamente sull'asse temporale.
- 📈 **Grafici Interattivi & Predizioni nel Tempo (Chart.js)**:
  - **Selettore Esercizio**: Seleziona qualsiasi dei 18 esercizi della scheda.
  - **Modalità Carico (kg per rip)**: Confronto visivo tra il carico reale sollevato e la traiettoria predetta dal protocollo.
  - **Modalità Volume Totale Macchina (kg)**: Confronto tra il volume totale sollevato nella sessione ($\sum \text{serie} \times \text{kg} \times \text{rip}$) e il volume stimato.
- 🔄 **Azzeramento Mesociclo per Pause Lunghe**: Opzione per riavviare il mesociclo dalla Settimana 1 in caso di infortuni, ferie o pause prolungate, mantenendo i propri pesi base.
- 📊 **Matrice a 10 Settimane**:
  - **W1–W4 (Accumulo)**: Sovraccarico lineare calcolato (+2.5% o +1.25/2.5kg al completamento del target rep con RIR ≥ 1).
  - **W5 (Deload / Scarico Attivo)**: Riduzione automatica serie (-40%, 2 serie) e carichi (-10%).
  - **W6–W9 (Densificazione)**: Intensificazione con tecnica **Rest-Pause** (1 serie target + 2 mini-set da 3-4 rip con 15" recupero) sull'ultima serie degli esercizi di isolamento.
  - **W10 (Testing)**: Verifica massimali e check-up finale.
- 🎯 **Visualizzazione Carico Prossima Settimana**: Ricalcolo in tempo reale del carico target per la settimana successiva (`⏩ Target Prossima (W[N+1])`).
- ⚡ **Tecniche di Intensità**: Registrazione dell'uso del **Rest-Pause** per ciascun esercizio.
- ⏱️ **Timer di Recupero Sonoro & Vibrazione**: Con preset specifici per ogni esercizio (da 15" a 2'30"), basato su Web Audio API e compatibile offline.
- ☁️ **Sincronizzazione Cloud Automatica (100% Gratuita)**: Dati sincronizzati istantaneamente tra tutti i tuoi dispositivi via Google Firebase Firestore o Google Apps Script (Google Drive).

---

## 🛠️ Come Pubblicare su GitHub & Attivare GitHub Pages

### 1. Inizializza il repository Git e fai il Push su GitHub
Apri il terminale nella cartella del progetto:
```bash
git init
git add .
git commit -m "Inizializzazione Mesocycle Tracker App"
git branch -M main
git remote add origin https://github.com/alessandrocolitta/workout-mesocycle-tracker.git
git push -u origin main
```

### 2. Attiva GitHub Pages
1. Vai sul tuo repository su **GitHub** nel browser.
2. Clicca sulla scheda **Settings** in alto a destra.
3. Nel menu laterale sinistro, clicca su **Pages** (sotto la voce *Code and automation*).
4. Sotto la sezione **Build and deployment** -> **Branch**:
   - Seleziona il branch **`main`**.
   - Seleziona la cartella **`/(root)`**.
   - Clicca su **Save**.
5. Dopo circa 1-2 minuti, GitHub genererà il link della tua applicazione:
   `https://alessandrocolitta.github.io/workout-mesocycle-tracker/`

---

## 📲 Come Installare l'App sullo Smartphone (PWA)

- **Su iPhone (Safari)**: Tocca il pulsante **Condividi** (quadrato con freccia verso l'alto) -> tocca **"Aggiungi alla schermata Home"**.
- **Su Android (Chrome)**: Tocca i tre puntini in alto a destra -> tocca **"Aggiungi a schermata Home"** o **"Installa app"**.

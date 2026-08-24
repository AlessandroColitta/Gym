// Definizione del protocollo di allenamento e mesociclo
export const PROTOCOL_DATA = {
  title: "Protocollo Ricomposizione Corporea",
  durationWeeks: 10,
  days: [
    {
      id: "day1",
      dayNumber: 1,
      title: "Giorno 1 (Lunedì)",
      subtitle: "Petto & Bicipiti",
      focus: "Focus Panca Piana & Braccia a Piena Freschezza",
      exercises: [
        {
          id: "ex_1_1",
          name: "Panca Piana Bilanciere",
          sets: 4,
          reps: "6-8",
          minReps: 6,
          maxReps: 8,
          rir: "1–2",
          restSeconds: 150, // 2'30"
          restDisplay: "2'30\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Scapole addotte e depresse, fermo al petto 1\""
        },
        {
          id: "ex_1_2",
          name: "Spinte Manubri Panca 30°",
          sets: 4,
          reps: "8-10",
          minReps: 8,
          maxReps: 10,
          rir: "1",
          restSeconds: 120, // 2'00"
          restDisplay: "2'00\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Massima convergenza in alto e stretch in basso"
        },
        {
          id: "ex_1_3",
          name: "Croci ai Cavi / Pectoral",
          sets: 3,
          reps: "12-15",
          minReps: 12,
          maxReps: 15,
          rir: "0–1",
          restSeconds: 90, // 1'30"
          restDisplay: "1'30\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Eccentrica 3\", fermo 1\" in allungamento"
        },
        {
          id: "ex_1_4",
          name: "Curl Manubri Panca Inc.45°",
          sets: 4,
          reps: "8-10",
          minReps: 8,
          maxReps: 10,
          rir: "1",
          restSeconds: 105, // 1'45"
          restDisplay: "1'45\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Gomiti dietro il busto per prestiramento"
        },
        {
          id: "ex_1_5",
          name: "Panca Scott Bilanciere EZ",
          sets: 3,
          reps: "10-12",
          minReps: 10,
          maxReps: 12,
          rir: "0–1",
          restSeconds: 90, // 1'30"
          restDisplay: "1'30\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Tensione di picco, esecuzione controllata"
        },
        {
          id: "ex_1_6",
          name: "Hammer Curl con Manubri",
          sets: 3,
          reps: "10-12",
          minReps: 10,
          maxReps: 12,
          rir: "0–1",
          restSeconds: 75, // 1'15"
          restDisplay: "1'15\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Presa neutra, incrementa spessore del braccio"
        }
      ]
    },
    {
      id: "day2",
      dayNumber: 2,
      title: "Giorno 2 (Mercoledì)",
      subtitle: "Quadricipiti/Spinta & Glutei/Posteriore",
      focus: "Focus Squat & Glutei",
      exercises: [
        {
          id: "ex_2_1",
          name: "Squat Bilanciere (Back)",
          sets: 4,
          reps: "6-8",
          minReps: 6,
          maxReps: 8,
          rir: "1–2",
          restSeconds: 150, // 2'30"
          restDisplay: "2'30\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "ROM profondo sotto il parallelo, schiena neutra"
        },
        {
          id: "ex_2_2",
          name: "Affondi Bulgari / Camminati",
          sets: 3,
          reps: "10 /lato",
          minReps: 10,
          maxReps: 10,
          rir: "1",
          restSeconds: 90, // 1'30"
          restDisplay: "1'30\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Passo medio-lungo, busto leggermente flesso"
        },
        {
          id: "ex_2_3",
          name: "Stacco Rumeno (RDL)",
          sets: 4,
          reps: "8-10",
          minReps: 8,
          maxReps: 10,
          rir: "1–2",
          restSeconds: 120, // 2'00"
          restDisplay: "2'00\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Hinge d'anca puro, bilanciere aderente alle cosce"
        },
        {
          id: "ex_2_4",
          name: "Hip Thrust con Bilanciere",
          sets: 4,
          reps: "8-10",
          minReps: 8,
          maxReps: 10,
          rir: "1",
          restSeconds: 120, // 2'00"
          restDisplay: "2'00\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Tensione di picco, fermo contrazione 2\" in alto"
        },
        {
          id: "ex_2_5",
          name: "Leg Curl Seduto o Sdraiato",
          sets: 3,
          reps: "10-12",
          minReps: 10,
          maxReps: 12,
          rir: "0–1",
          restSeconds: 90, // 1'30"
          restDisplay: "1'30\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Eccentrica controllata 3\", isolamento puro"
        },
        {
          id: "ex_2_6",
          name: "Calf Raise in Piedi",
          sets: 4,
          reps: "12-15",
          minReps: 12,
          maxReps: 15,
          rir: "0–1",
          restSeconds: 60, // 1'00"
          restDisplay: "1'00\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Fermo 2\" in massimo allungamento"
        }
      ]
    },
    {
      id: "day3",
      dayNumber: 3,
      title: "Giorno 3 (Venerdì)",
      subtitle: "Dorso & Deltoidi",
      focus: "Focus Trazioni & Spalle 3D",
      exercises: [
        {
          id: "ex_3_1",
          name: "Trazioni alla Sbarra",
          sets: 4,
          reps: "6-8 /Max",
          minReps: 6,
          maxReps: 8,
          rir: "1–2",
          restSeconds: 150, // 2'30"
          restDisplay: "2'30\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Presa prona o neutra, depressione scapolare completa (sovraccarico o corpo libero)"
        },
        {
          id: "ex_3_2",
          name: "Rematore Manubrio / Pulley",
          sets: 4,
          reps: "8-10",
          minReps: 8,
          maxReps: 10,
          rir: "1",
          restSeconds: 120, // 2'00"
          restDisplay: "2'00\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Gomito aderente al tronco, adduzione scapolare"
        },
        {
          id: "ex_3_3",
          name: "Lat Machine Presa Neutra",
          sets: 3,
          reps: "10-12",
          minReps: 10,
          maxReps: 12,
          rir: "1",
          restSeconds: 105, // 1'45"
          restDisplay: "1'45\"",
          isCompound: true,
          allowsRestPause: false,
          notes: "Gomiti tirati verso le creste iliache"
        },
        {
          id: "ex_3_4",
          name: "Alzate Laterali con Manubri",
          sets: 4,
          reps: "10-12",
          minReps: 10,
          maxReps: 12,
          rir: "0–1",
          restSeconds: 90, // 1'30"
          restDisplay: "1'30\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Piano scapolare (30° avanti), focus muscolare"
        },
        {
          id: "ex_3_5",
          name: "Face Pull Cavo Alto (Corda)",
          sets: 4,
          reps: "12-15",
          minReps: 12,
          maxReps: 15,
          rir: "0–1",
          restSeconds: 90, // 1'30"
          restDisplay: "1'30\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Tirata agli occhi con extrarotazione (postura)"
        },
        {
          id: "ex_3_6",
          name: "Alzate Laterali Cavo Basso",
          sets: 3,
          reps: "12-15",
          minReps: 12,
          maxReps: 15,
          rir: "0",
          restSeconds: 75, // 1'15"
          restDisplay: "1'15\"",
          isCompound: false,
          allowsRestPause: true,
          notes: "Cavo dietro la schiena, massimo stress metabolico"
        }
      ]
    }
  ],

  phases: [
    {
      weeks: [1, 2, 3, 4],
      name: "Accumulo & Sovraccarico Lineare",
      badge: "Accumulo (Settimane 1-4)",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      description: "Mantieni serie fisse. Incrementa il carico del 2.5–5% (+1.25/2.5kg) su multiarticolari e isolamento quando completi il massimo delle rip con RIR ≥ 1.",
      setModifier: 1.0,
      intensityTechnique: "Standard Overload"
    },
    {
      weeks: [5],
      name: "Deload / Scarico Attivo",
      badge: "Scarico Attivo (Settimana 5)",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      description: "Riduci le serie del 40% (2 serie per esercizio), carichi -10%, RIR 3–4. Indispensabile per rigenerazione articolare e prevenzione overtraining.",
      setModifier: 0.6,
      intensityTechnique: "Deload (-10% carico, 2 serie)"
    },
    {
      weeks: [6, 7, 8, 9],
      name: "Densificazione & Intensificazione (Rest-Pause)",
      badge: "Densificazione (Settimane 6-9)",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      description: "Inserimento di Rest-Pause (1 serie target + 2 mini-set da 3-4 rip con 15\" di pausa) sull'ultima serie degli esercizi di isolamento (Bicipiti, Deltoidi, Croci, Leg Curl, Calf). Sovraccarico progressivo continuo.",
      setModifier: 1.0,
      intensityTechnique: "Rest-Pause sull'ultima serie"
    },
    {
      weeks: [10],
      name: "Testing & Valutazione Finale",
      badge: "Testing & Check-up (Settimana 10)",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      description: "Verifica progressi tecnici e massimali.",
      setModifier: 1.0,
      intensityTechnique: "Massimali & Test"
    }
  ]
};

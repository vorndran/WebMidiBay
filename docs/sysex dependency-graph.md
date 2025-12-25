WebMidiBay SysEx Module Dependency Graph
=========================================
Aktualisiert: 21. Dezember 2025

Ebene 1 (Foundation - KEINE internen Dependencies):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────┐         ┌────────────────┐
│ sysexData.js  │         │ sysexFormat.js │
│               │         │                │
│ - Collection  │         │ - Hex Format   │
│ - Parsing     │         │ - File URLs    │
└───────────────┘         └────────────────┘
         KEINE Dependencies zwischen Layer 1 Modulen!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          │
                          ▼
Ebene 2 (Display Layer - nutzt nur Foundation):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ┌─────────────────┐       ┌──────────────────┐
        │  sysexTable.js  │       │sysexFileUpload.js│
        │                 │       │                  │
        │ imports:        │       │ KEINE SYSEX      │
        │ - sysexFormat   │       │ DEPENDENCIES!    │
        │                 │       │                  │
        │ - Table UI      │       │ - File Loading   │
        │ - Hex Display   │       │ - Map Storage    │
        └────────┬────────┘       └──────────────────┘
                 │
                 │
━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 │
                 ▼
Ebene 3 (Pure UI Layer - KEINE SysEx Dependencies):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────┐  ┌──────────────────────┐
│sysexFileListUI.js   │  │sysexSendAndToggles.js│
│                     │  │                      │
│ KEINE SYSEX         │  │ KEINE SYSEX          │
│ DEPENDENCIES!       │  │ DEPENDENCIES!        │
│                     │  │                      │
│ - Pure UI Render    │  │ - Pure MIDI Send     │
│ - Callback Pattern  │  │ - Port Logic Only    │
└─────────────────────┘  └──────────────────────┘
           │                        │
           │                        │
━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━
           │                        │
           └────────┬───────────────┘
                    ▼
Ebene 4 (Orchestrator - Koordiniert alle Ebenen):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│        sysexFileActions.js                 │
│                                            │
│ imports:                                   │
│ - sysexTable (Table Display)               │
│ - sysexFileListUI (UI Rendering)           │
│ - sysexSendAndToggles (MIDI Send)          │
│                                            │
│ Action Functions:                          │
│ - listSysexFilesToSendListAction()         │
│ - sendSysexFileDataAction()                │
│ - showSysexFileContentAction()             │
│ - toggleAutoCollectSysexAction()           │
│ - toggleAutoDownloadSysexAction()          │
│ - sendCollectedSysexToSysexFormAction()    │
│ - clearSysexFileList()                     │
│                                            │
│ ⚡ Einziges Modul das alle Ebenen verbindet │
│ ⚡ Facade Pattern für externe Module        │
└────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verwendung von außerhalb (external imports):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
midiMessage.js              → sysexData (collectSysexData)
htmlMessageFormat.js        → sysexData (collectSysexData)
htmlMessageFormat.js        → sysexFormat (toHex)
htmlForm.js                 → sysexFileActions (all actions)
htmlForm.js                 → sysexFileUpload (loadSysexFile)

Design Pattern:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Layered Architecture (4 Ebenen)
✓ NO circular dependencies
✓ sysexFileActions als Orchestrator/Facade
✓ Pure data layer (sysexData, sysexFormat)
✓ Separated concerns (UI, Logic, Data)
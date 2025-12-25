js/sysex/
│
├── sysexData.js (93 Zeilen) - Pure Data Processing Layer
│   ├─ collectSysexData()          - Collects SysEx from MIDI stream
│   ├─ parseSysexData()            - Filters valid SysEx bytes
│   └─ concatSysexArray()          - Appends to global buffer
│   └─ Dependencies: KEINE (nur midiBay, logger, constants)
│
├── sysexFormat.js (61 Zeilen) - Formatting & Conversion Layer
│   ├─ hexStringFromIntArray()     - Int array → Formatted hex string
│   ├─ toHex()                     - Int array → Hex string array
│   └─ sysexToSyxFileUrl()         - Blob URL für Download
│   └─ Dependencies: KEINE (nur logger)
│
├── sysexTable.js (149 Zeilen) - Table Display Layer
│   ├─ clearSysexTable()           - Clears all SysEx UI content
│   ├─ showSysexTable()            - Main table orchestrator
│   ├─ getOrCreateTableContainer() - Container management
│   ├─ appendHeaderRow()           - Header with port/file name
│   ├─ appendColumnHeaders()       - Column labels
│   ├─ appendDataRows()            - Data rows (10 bytes/row)
│   ├─ createHexRow()              - Single data row element
│   └─ createInnerHtmlHexRow()     - Row HTML generation
│   └─ Dependencies:
│       └─── sysexFormat.js (hexStringFromIntArray)
│
├── sysexFileUpload.js (54 Zeilen) - File Upload & Storage
│   ├─ loadSysexFile()             - File orchestrator
│   └─ extractSysexFileToMap()     - Extracts & stores in Map
│   └─ Dependencies: KEINE (extractSysex wurde entfernt)
│
├── sysexFileListUI.js (96 Zeilen) - File List UI Rendering
│   ├─ addClearFileListButton()    - Clear button with callback
│   ├─ resetViewContentButtons()   - Reset all view buttons
│   ├─ addUploadedFilesHeadTag()   - List header
│   ├─ addSysexFileTag()           - File item with callbacks
│   └─ fileTagInnerHTML()          - HTML template for file tag
│   └─ Dependencies: KEINE (nur DOM utilities)
│
├── sysexSendAndToggles.js (48 Zeilen) - MIDI Output Layer
│   └─ sendSysexFileDataToSelectedOutput() - Sends to MIDI port
│   └─ Dependencies: KEINE (reine MIDI-Logik)
│
└── sysexFileActions.js (180 Zeilen) - ⚡ Orchestrator/Facade
    ├─ listSysexFilesToSendListAction()    - Renders file list
    ├─ sendSysexFileDataAction()           - Combines UI + MIDI send
    ├─ showSysexFileContentAction()        - Shows table + button state
    ├─ toggleAutoCollectSysexAction()      - Auto-collection toggle
    ├─ toggleAutoDownloadSysexAction()     - Auto-download toggle
    ├─ sendCollectedSysexToSysexFormAction() - Live MIDI → Display
    └─ clearSysexFileList()                - Clears list & map
    └─ Dependencies:
        ├─── sysexTable.js (showSysexTable, clearSysexTable)
        ├─── sysexFileListUI.js (ALL render functions)
        └─── sysexSendAndToggles.js (sendSysexFileDataToSelectedOutput)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Design Pattern: Layered Architecture + Facade/Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Layer 1: Foundation (Data, Format)              - NO dependencies
✓ Layer 2: Display & Upload (Display, Upload)    - Depends on Layer 1
✓ Layer 3: UI & MIDI (FileListUI, SendAndToggles) - Depends on Layer 2
✓ Layer 4: Orchestrator (FileActions)            - Coordinates Layer 3

✓ NO circular dependencies
✓ FileActions als zentrale Facade für externe Module
✓ Event handlers via callbacks (Dependency Injection)
✓ Pure functions ohne UI-Seiteneffekte wo möglich
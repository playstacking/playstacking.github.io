# Playstack Emulator Hub

Entry: \`games/emulators/index.html?system=nds\` (also n64, gba, psx, psp, snes, nes).

The site includes no commercial ROMs, game discs, or console BIOS files. Players select their own files on their device, and the browser uses blob URLs. EmulatorJS is loaded from its **official stable CDN**; this requires internet access.

Supported entry points are file-selection frontends, **not bundled versions** of commercial games. EmulatorJS advertises support for Nintendo 64, Nintendo DS, GBA, PS1, PSP, SNES, and NES, but individual titles may need BIOS files, controller setup, or hardware acceleration, and performance may vary.

A local, partial EmulatorJS installation remains under \`games/emulatorjs/data/\`; the hub currently uses the official CDN because the local assets only contain N64 cores.

Testing: inspect the game cards and routes, upload a permitted homebrew ROM, verify audio, video, controls, and refresh. The app has not been verified with proprietary games.

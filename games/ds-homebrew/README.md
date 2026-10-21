# Included Nintendo DS homebrew games

This folder holds redistributable DS homebrew binaries only. It intentionally contains **no proprietary Nintendo, Activision or Simpsons game ROMs**.

| Title | Source and complete corresponding source | License | Pinned binary |
| --- | --- | --- | --- |
| Kart Mania | https://github.com/Bahey-shalash/Kart_Mania/tree/dbd9b747dd0701d89a97a3c3f08625170b1b95e6 | MIT | Built from pinned source with devkitARM |
| Spelunky DS (unofficial adaptation) | https://github.com/dbeef/spelunky-ds/tree/1.0 | GPL-3.0 code and Spelunky User License v1.1b assets | Official upstream archive v1.0 |
| Pong-NDS | https://github.com/Chi-Iroh/Pong-NDS/tree/dfabbdde030b9fb2c72af968c98485dcde81855f | MIT | Pong-NDS.nds at that commit |
| Wordle DS | https://github.com/Epicpkmn11/WordleDS/tree/v3.2.3 | GPL-3.0 | WordleDS.nds release v3.2.3 |

The binary files and their license texts are fetched and verified in `.github/workflows/install-ds-homebrew.yml`. The full source corresponding to the binary releases is available at the linked upstream repositories. License files are retained in `games/ds-homebrew/licenses/`.

Only titles with identified redistribution terms and known build locations are listed as installable. Other GitHub source code cannot be assumed to include redistributable game assets. Real-browser gameplay remains unverified.

## Spelunky DS distribution notice

Spelunky® game and art: Copyright (c) 2008–2009 Derek Yu and Mossmouth, LLC.
Spelunky DS is an **unofficial community remake**, not the official or unmodified game. It is provided without charge.
The full upstream Spelunky User License v1.1b and the GPL-3.0 source license are distributed together in `licenses/SpelunkyDS-Full-License.txt`. All rights and conditions of the respective authors apply. Unmodified upstream code and the corresponding source for the redistributed binary are at https://github.com/dbeef/spelunky-ds/tree/1.0.

## Kart Mania

MIT-licensed software by Bahey Shalash and Hugo Svolgaard (2026); the exact source revision is linked above. Full MIT license text accompanies the built ROM at `licenses/KartMania-MIT.txt`.

Both game binaries are installed by `.github/workflows/install-advanced-ds-games.yml` after a successful build, then deployed with GitHub Pages. Actual browser gameplay is not automatically verified. Nintendo DS WiFi multiplayer does not necessarily work in web-based emulators.

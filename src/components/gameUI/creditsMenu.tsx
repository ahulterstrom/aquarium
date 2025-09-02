import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const CreditsMenu = () => {
  return (
    <GameMenuCard title="Credits">
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {/* 3D Models */}
          <section className="glass py-4">
            <h3 className="mb-3 text-lg font-semibold">3D Models</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">"Direction Arrow"</span> by Alihan
                <br />
                <a
                  href="https://skfb.ly/ozHGW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  skfb.ly/ozHGW
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons Attribution 4.0
                </span>
              </div>

              <div>
                <span className="font-medium">
                  Ultimate Animated Character Pack
                </span>{" "}
                by Quaternius
                <br />
                <a
                  href="https://quaternius.com/packs/ultimatedanimatedcharacter.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  quaternius.com
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons 0
                </span>
              </div>

              <div>
                <span className="font-medium">Ultimate RPG Pack</span> by
                Quaternius
                <br />
                <a
                  href="https://quaternius.com/packs/ultimaterpg.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  quaternius.com
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons 0
                </span>
              </div>
            </div>
          </section>

          {/* Music */}
          <section className="glass py-4">
            <h3 className="mb-3 text-lg font-semibold">Music</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Background Music</span> by
                Aventure
                <br />
                <a
                  href="http://bensound.com/royalty-free-music"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  Bensound.com
                </a>
                <br />
                <span className="text-gray-600">
                  License codes: IBKIYRI13DTAGEID, OXXCF8XHHURFMWQM,
                  OF4JBPHLPBAYOF5S, S1NQTWJ1YQPKT9ZJ
                </span>
              </div>
            </div>
          </section>

          {/* Sound Effects */}
          <section className="glass py-4">
            <h3 className="mb-3 text-lg font-semibold">Sound Effects</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">"coin flip"</span> by MrGungus
                <br />
                <a
                  href="https://freesound.org/s/766544/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/766544
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons 0
                </span>
              </div>

              <div>
                <span className="font-medium">"coincollect"</span> by
                janbuilderr
                <br />
                <a
                  href="https://freesound.org/s/773582/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/773582
                </a>
                <br />
                <span className="text-gray-600">License: Attribution 4.0</span>
              </div>

              <div>
                <span className="font-medium">
                  "Treasure Collected Coin Tinkle Game Sound Effect"
                </span>{" "}
                by el_boss
                <br />
                <a
                  href="https://freesound.org/s/817813/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/817813
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons 0
                </span>
              </div>

              <div>
                <span className="font-medium">"coin_sound.mp3"</span> by
                deleted_user_4407439
                <br />
                <a
                  href="https://freesound.org/s/241971/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/241971
                </a>
                <br />
                <span className="text-gray-600">License: Attribution 3.0</span>
              </div>

              <div>
                <span className="font-medium">"Coinfall.wav"</span> by RynoStols
                <br />
                <a
                  href="https://freesound.org/s/326723/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/326723
                </a>
                <br />
                <span className="text-gray-600">
                  License: Attribution NonCommercial 4.0
                </span>
              </div>

              <div>
                <span className="font-medium">"Metallic_Ching_Keys_2.mp3"</span>{" "}
                by michael_grinnell
                <br />
                <a
                  href="https://freesound.org/s/464426/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/464426
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons 0
                </span>
              </div>

              <div>
                <span className="font-medium">"Crowded Venue"</span> by unfa
                <br />
                <a
                  href="https://freesound.org/s/211145/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freesound.org/s/211145
                </a>
                <br />
                <span className="text-gray-600">
                  License: Creative Commons 0
                </span>
              </div>
            </div>
          </section>

          {/* Shaders */}
          <section className="glass py-4">
            <h3 className="mb-3 text-lg font-semibold">Shaders</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Foamy Water Shader</span> by
                k_mouse
                <br />
                <a
                  href="https://www.shadertoy.com/view/llcXW7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  shadertoy.com/view/llcXW7
                </a>
              </div>
            </div>
          </section>

          {/* Fonts */}
          <section className="glass py-4">
            <h3 className="mb-3 text-lg font-semibold">Fonts</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Sealight Whisper</span> by
                BlackFridayFont FMF
                <br />
                <a
                  href="https://www.dafont.com/sealight-whisper.font"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  dafont.com/sealight-whisper.font
                </a>
              </div>
            </div>
          </section>

          {/* Textures */}
          <section className="glass py-4">
            <h3 className="mb-3 text-lg font-semibold">Textures</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Various Textures</span> from
                <br />
                <a
                  href="https://freestylized.com/all-textures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  freestylized.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </GameMenuCard>
  );
};

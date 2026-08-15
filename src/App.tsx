import { useEffect, useState } from "react";
import { ArchiveScreen } from "./archive/ArchiveScreen";
import { BootSequence } from "./boot/BootSequence";
import { markBootShown, shouldShowBoot } from "./boot/bootGate";
import { LevelUpRetune } from "./game/LevelUpRetune";
import { applyEquippedTheme } from "./loot/applyEquippedTheme";
import { PerkPicker } from "./perks/PerkPicker";
import { QuestsScreen } from "./quests/QuestsScreen";
import { applyReadingTheme } from "./reader/applyReadingTheme";
import { BookNav } from "./reader/BookNav";
import { ReaderPane } from "./reader/ReaderPane";
import { getStoredReadingThemeId } from "./reader/readingThemeStorage";
import { StashScreen } from "./stash/StashScreen";
import { StatsScreen } from "./stats/StatsScreen";
import { useReaderStore } from "./store/reader";
import { TerminalHome, type Screen } from "./terminal/TerminalHome";
import { SavedVersesScreen } from "./verses/SavedVersesScreen";

function App() {
  const loaded = useReaderStore((s) => s.loaded);
  const hydrate = useReaderStore((s) => s.hydrate);
  const goTo = useReaderStore((s) => s.goTo);
  const [booting, setBooting] = useState(() => shouldShowBoot());
  const [screen, setScreen] = useState<Screen>("terminal");

  useEffect(() => {
    void hydrate();
    void applyEquippedTheme();
    applyReadingTheme(getStoredReadingThemeId());
  }, [hydrate]);

  function completeBoot() {
    markBootShown();
    setBooting(false);
  }

  function openReading(bookId: string, chapter: number) {
    void goTo(bookId, chapter);
    setScreen("reader");
  }

  if (booting) {
    return <BootSequence onComplete={completeBoot} />;
  }

  if (!loaded) {
    return (
      <div className="chrome chrome-label min-h-screen px-6 py-10 text-center text-sm">
        LOADING…
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--vault)" }}>
      <header className="chrome flex items-center gap-4 border-b border-current px-4 py-2 text-sm">
        <button type="button" className="chrome-label" onClick={() => setScreen("terminal")}>
          Terminal
        </button>
        <span className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          / {screen}
        </span>
      </header>

      {screen === "terminal" && <TerminalHome onNavigate={setScreen} />}
      {screen === "reader" && (
        <>
          <BookNav />
          <ReaderPane />
        </>
      )}
      {screen === "archive" && <ArchiveScreen />}
      {screen === "quests" && <QuestsScreen onOpenReading={openReading} />}
      {screen === "stats" && <StatsScreen />}
      {screen === "stash" && <StashScreen />}
      {screen === "verses" && <SavedVersesScreen onOpenReading={openReading} />}

      <LevelUpRetune />
      <PerkPicker />
    </div>
  );
}

export default App;

import { useEffect } from "react";
import { BookNav } from "./reader/BookNav";
import { ReaderPane } from "./reader/ReaderPane";
import { useReaderStore } from "./store/reader";

function App() {
  const loaded = useReaderStore((s) => s.loaded);
  const hydrate = useReaderStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!loaded) {
    return <div className="px-6 py-10 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <BookNav />
      <ReaderPane />
    </div>
  );
}

export default App;

import clsx from "clsx";
import { SearchIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getFuzzySearchResults, WaypointFuzzyResult } from "../data";
import { menu } from "../dom-tunnel";

export function MenuButton({
  icon,
  // label,
  onActivate,
}: {
  icon: ReactNode;
  label: string;
  onActivate: () => void;
}) {
  return (
    <button
      onClick={onActivate}
      className="bg-blue-200/10 w-12 h-12 flex items-center justify-center rounded-xl text-white hover:bg-gradient-to-tr from-blue-700 to-blue-400 hover:scale-105 hover:text-white transition-all"
    >
      {icon}
    </button>
  );
}

export function MenuToggleButton({
  icon,
  // label,
  isEnabled,
  onActivate,
}: {
  icon: ReactNode;
  label: string;
  isEnabled: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      onClick={onActivate}
      className={clsx(
        " w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gradient-to-tr hover:scale-105 hover:text-white transition-all",
        isEnabled && "bg-blue-700/50 from-blue-700 to-blue-400 text-white ",
        !isEnabled &&
          "text-blue-200/90 hover:border-transparent from-blue-700/30 to-blue-400/30",
      )}
    >
      {icon}
    </button>
  );
}

export function SearchComponent() {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [matches, setMatches] = useState<WaypointFuzzyResult[]>([]);

  useEffect(() => {
    getFuzzySearchResults(query).then((res) => setMatches(res));
  }, [query]);

  useEffect(() => setSelected(0), [query]);

  function onSelect(item: WaypointFuzzyResult) {
    navigate(item.slug);
    setShowSearch(false);
    setQuery("");
  }

  function selectActive() {
    onSelect(matches[selected]);
  }
  function closeSearch() {
    setShowSearch(false);
    setQuery("");
  }
  console.log(showSearch);

  return (
    <>
      <MenuButton
        icon={<SearchIcon />}
        label="Search"
        onActivate={() => setShowSearch((s) => !s)}
      />
      {showSearch && (
        <div
          className="fixed top-0 left-0 bg-black/70 z-[100] w-screen h-screen flex justify-center items-start overflow-auto"
          onClick={() => setShowSearch(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-white p-16 w-full max-w-3xl"
          >
            <input
              className="font-sans px-6 py-4 block w-full bg-neutral-900/90 text-white font-bold text-lg outline-none focus:bg-neutral-800/90 rounded-2xl mb-16"
              autoFocus
              type="search"
              placeholder="Search for Exoplanets..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  closeSearch();
                  e.preventDefault();
                }
                if (e.key === "ArrowDown") {
                  setSelected((selected + 1) % matches.length);
                  e.preventDefault();
                }
                if (e.key === "ArrowUp") {
                  setSelected((selected === 0 ? matches.length : selected) - 1);
                  e.preventDefault();
                }
                if (e.key === "Enter" && matches.length) {
                  selectActive();
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            />
            <ul>
              {matches.map((match, i) => (
                <li
                  key={i}
                  onPointerEnter={() => setSelected(i)}
                  onClick={selectActive}
                  className={clsx(
                    "block bg-neutral-800/80 p-6 rounded-3xl mt-2 mb-6 from-blue-700 to-blue-400 transition-all cursor-pointer group",
                    i === selected && "bg-gradient-to-tr scale-105",
                  )}
                >
                  <h3 className="text-4xl font-semibold">{match.name}</h3>
                  <div className="text-sm uppercase tracking-[0.2rem] text-white/50">
                    {match.type}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export function Menu() {
  return (
    <div className="top-2 left-2 fixed flex flex-col gap-2 z-10">
      <SearchComponent />
      <menu.Out />
    </div>
  );
}

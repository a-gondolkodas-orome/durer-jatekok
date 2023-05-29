import { gameList } from './games/gameList';
import { Listbox } from '@headlessui/react';
import { useState } from 'react';
import { uniq } from 'lodash-es';

export const Overview = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  const shouldShow = game => {
    if (game.isHiddenFromOverview) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(game.category)) return false;
    if (selectedYears.length > 0 && !selectedYears.includes(game.year)) return false;
    return true;
  };

  return <main className="p-2">
    <OverviewHeader></OverviewHeader>
    <div className="flex flex-wrap align-baseline">
      <CategoryFilter
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      ></CategoryFilter>
      <YearFilter
        selectedYears={selectedYears}
        setSelectedYears={setSelectedYears}
      ></YearFilter>
    </div>
    <div className="flex flex-wrap">
      {Object.keys(gameList).filter(id => shouldShow(gameList[id])).map(id => Game(id, gameList[id]))}
    </div>
  </main>;
};

const CategoryFilter = ({ selectedCategories, setSelectedCategories }) => {
  const allCategories = ['A', 'B', 'C', 'C+', 'D', 'D+', 'E', 'E+'];

  return <Listbox
    value={selectedCategories} onChange={setSelectedCategories}
    as="div" multiple horizontal
    className="mb-2 w-96 inline-block px-1"
  >
    <label htmlFor="category-selector" className="block">Kategória szűrő:</label>
    <Listbox.Button
      id="category-selector"
      className="border-2 border-slate-600 rounded w-full"
    >
      {selectedCategories.sort().join(', ') || 'Válassz kategóriákat'}
    </Listbox.Button>
    <Listbox.Options className="text-center mt-1">
      {allCategories.map(category => <Listbox.Option
        key={category}
        value={category}
        className="inline-block"
      >{({ active, selected }) =>
        <span className={`border-2 rounded px-1 mx-1 inline-block ${selected ? 'bg-blue-200' : ''} ${active ? 'outline' : ''}`}>
          <span className={selected ? '' : 'text-transparent'}>✓</span>{category}
        </span>
      }</Listbox.Option>)}
    </Listbox.Options>
  </Listbox>;
};

const YearFilter = ({ selectedYears, setSelectedYears }) => {
  const allGames = Object.values(gameList).filter(game => !game.isHiddenFromOverview);
  const allYears = uniq(allGames.map(game => game.year)).sort((a, b) => Number(a) - Number(b));

  return <Listbox
    value={selectedYears} onChange={setSelectedYears}
    as="div" multiple horizontal
    className="mb-2 w-96 inline-block px-1"
  >
    <label htmlFor="year-selector" className="block">Kategória szűrő:</label>
    <Listbox.Button id="year-selector" className="border-2 border-slate-600 rounded w-full">
      {selectedYears.sort((a, b) => Number(a) - Number(b)).join(', ') || 'Válassz éveket'}
    </Listbox.Button>
    <Listbox.Options className="text-center mt-1">
      {allYears.map(year => <Listbox.Option
        key={year}
        value={year}
        className="inline-block"
      >{({ active, selected }) =>
        <span className={`border-2 rounded px-1 mx-1 inline-block ${selected ? 'bg-blue-200' : ''} ${active ? 'outline' : ''}`}>
          <span className={selected ? '' : 'text-transparent'}>✓</span>{year}
        </span>
      }</Listbox.Option>)}
    </Listbox.Options>
  </Listbox>;
};

const OverviewHeader = () => {
  return <div className="flex flex-wrap items-baseline">
    <h1 className="text-blue-600 font-bold pb-4 grow">Dürer játékok</h1>
    <span className="text-right">
      <a
        href="https://forms.gle/7DwugmXNrvKgkiiu8"
        target="_blank"
        className="px-4"
      >
        Hibabejelentő
      </a>
    </span>
  </div>;
};

const Game = (gameId, gameProps) => {
  return <span
    key={gameId}
    className="rounded-lg shadow-lg border p-2 m-1 max-w-[32ch] w-full flex flex-col js-game-card"
  >
    <h2 className="font-bold mb-4 text-center">{gameProps.name}</h2>
    <div className="grow"></div>
    <div className="flex items-baseline">
      <span className="rounded-lg bg-orange-200 px-1 m-0.5">{gameProps.year}.</span>
      <span className="rounded-lg bg-blue-200 px-1 m-0.5">{gameProps.category}</span>
      <span className="rounded-lg bg-amber-200 px-1 m-0.5">{gameProps.round}</span>
      <span className="grow"></span>
      <button
        className="cta-button rounded-lg py-0 px-1 underline m-0.5 text-base w-auto"
      >Kipróbálom!</button>
    </div>
  </span>;
};

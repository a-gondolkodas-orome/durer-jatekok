import { gameList } from './games/gameList'

export const Overview = () => {
  return <main className="p-2">
    <OverviewHeader></OverviewHeader>
    <div className="flex flex-wrap">
      {Object.keys(gameList).map(gameId => Game(gameId, gameList[gameId]))}
    </div>
  </main>
}

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
  </div>
}

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
  </span>
}

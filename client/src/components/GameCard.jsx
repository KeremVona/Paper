export const GameCard = ({ game, copyHostId, handleJoin }) => {
  const isFull = game.status === "Full";
  const statusClass = isFull ? "bg-red-600" : "bg-green-600";
  const buttonText = isFull ? "Game Full" : "Contact Host";
  const buttonClass = isFull
    ? "bg-red-500 hover:bg-red-600 cursor-not-allowed"
    : "bg-[#e34537] hover:bg-[#c93c30]";

  const hostInfo = `Host ID: ${game.hostDiscordId}`;

  return (
    <div
      className="bg-[#333333] p-5 rounded-xl shadow-xl border-t-4 border-red-700 flex flex-col justify-between 
                        transition duration-200 hover:bg-[#444444] hover:translate-y-[-2px] hover:shadow-2xl"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white">{game.title}</h3>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass} text-white`}
          >
            {game.status.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-300 mb-4">{game.discordServer}</p>

        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4 border-t border-gray-600 pt-3">
          <div className="text-gray-400 font-medium flex items-center gap-1">
            <span aria-label="Date/Time">🗓️</span> Date/Time:
          </div>
          <div className="text-white font-semibold">{game.date}</div>

          <div className="text-gray-400 font-medium flex items-center gap-1">
            <span aria-label="Region">🗺️</span> Region:
          </div>
          <div className="text-white font-semibold">{game.region}</div>

          <div className="text-gray-400 font-medium flex items-center gap-1">
            <span aria-label="Modpack">📦</span> Modpack:
          </div>
          <div className="text-white font-semibold">{game.modPack}</div>

          <div className="text-gray-400 font-medium flex items-center gap-1">
            <span aria-label="Slots">👥</span> Slots:
          </div>
          <div className="text-white font-semibold">{game.slotsAvailable}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => copyHostId(game.hostDiscordId)}
          className="w-full text-center text-xs text-gray-300 p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition duration-150"
        >
          {hostInfo} (Click to Copy ID)
        </button>
        <button
          onClick={() =>
            handleJoin(game.hostDiscordId, game.discordServer, isFull)
          }
          className={`w-full py-3 px-4 rounded-lg font-bold text-white ${buttonClass} transition duration-150 shadow-md`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

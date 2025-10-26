import { useState, useEffect } from "react";
import "./App.css";
import app, { db } from "./config/firebase";
import { getDocs, collection, getDoc, addDoc } from "firebase/firestore";
import React, { useMemo, useCallback } from "react";
import { initializeApp } from "firebase/app";
import GameCard from "./components/GameCard";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, onSnapshot, doc, updateDoc } from "firebase/firestore";

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hubStatus, setHubStatus] = useState(
    "🌐 Connecting to Real-Time Data..."
  );
  const [db, setDb] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    region: "ALL",
    status: "ALL",
  });

  const appId =
    typeof window.__app_id !== "undefined"
      ? window.__app_id
      : "default-hoi4-app-id";
  // const app = initializeApp(firebaseConfig);
  const initialAuthToken =
    typeof window.__initial_auth_token !== "undefined"
      ? window.__initial_auth_token
      : null;

  const copyHostId = useCallback((id) => {
    const tempInput = document.createElement("textarea");
    tempInput.value = id;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      const successful = document.execCommand("copy");
      const message = successful
        ? "Copied Host ID to clipboard!"
        : "Failed to copy ID.";
      setHubStatus(`✅ ${message} (${id})`);
      setTimeout(() => setHubStatus("Live data stream active."), 3000);
    } catch (err) {
      console.error("Copy error:", err);
    }
    document.body.removeChild(tempInput);
  }, []);

  const handleJoin = useCallback(
    (hostId, serverName, isFull) => {
      if (isFull) {
        setHubStatus("⚠️ This game is full. Try another one!");
        setTimeout(() => setHubStatus("Live data stream active."), 3000);
        return;
      }

      const joinMessage = `To join this game (hosted on ${serverName}), please contact the host on Discord. Their ID is: ${hostId}. ID copied to your clipboard.`;
      setHubStatus(`💬 ${joinMessage}`);
      copyHostId(hostId);
    },
    [copyHostId]
  );

  const filteredGames = useMemo(() => {
    if (!games) return [];

    return games
      .filter((game) => {
        const searchMatch =
          game.title.toLowerCase().includes(filters.search) ||
          game.modPack.toLowerCase().includes(filters.search);
        const regionMatch =
          filters.region === "ALL" || game.region === filters.region;
        const statusMatch =
          filters.status === "ALL" || game.status === filters.status;

        return searchMatch && regionMatch && statusMatch;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [games, filters]);

  useEffect(() => {
    try {
      const auth = getAuth(app);
      const firestore = db;

      const signIn = async () => {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      };

      onAuthStateChanged(auth, (user) => {
        if (user) {
          setDb(firestore);
          setIsAuthReady(true);
          console.log("Firebase Auth Ready. User ID:", user.uid);
        } else {
          console.log("No user signed in. Using anonymous access.");
        }
      });

      signIn();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      setHubStatus("❌ Failed to connect to database.");
      setLoading(false);
    }
  }, [initialAuthToken]);

  useEffect(() => {
    if (db && isAuthReady) {
      const gamesCollectionPath = `/artifacts/${appId}/public/data/games`;
      const gamesRef = collection(db, gamesCollectionPath);

      const unsubscribe = onSnapshot(
        gamesRef,
        (snapshot) => {
          const gamesList = [];
          snapshot.forEach((doc) => {
            gamesList.push({ id: doc.id, ...doc.data() });
          });

          setGames(gamesList);
          setLoading(false);
          setHubStatus("✅ Live data stream active.");
          console.log(`Received ${gamesList.length} game listings.`);
        },
        (error) => {
          console.error("Error fetching real-time data:", error);
          setHubStatus("❌ Real-time data sync failed!");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [db, isAuthReady, appId]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#212121] text-white">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 p-6 rounded-xl bg-[#4a4a4a] shadow-lg">
          <h1 className="text-4xl font-extrabold text-[#f0f0f0] mb-2 font-serif">
            HOI4 Multiplayer Game Hub
          </h1>
          <p className="text-xl text-[#b0b0b0]">
            Find and join games announced live on Discord servers.
          </p>
          <p
            id="hub-status"
            className="text-sm mt-3 font-medium text-yellow-400"
          >
            {hubStatus}
          </p>
        </header>

        <div className="bg-gray-700 p-4 rounded-xl shadow-inner mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or modpack..."
            className="flex-1 p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value.toLowerCase(),
              }))
            }
          />

          <select
            className="p-3 rounded-lg bg-gray-600 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
            value={filters.region}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, region: e.target.value }))
            }
          >
            <option value="ALL">Region: All</option>
            <option value="EU">Europe (EU)</option>
            <option value="NA">North America (NA)</option>
            <option value="ASIA">Asia/Pacific (ASIA)</option>
            <option value="GLOBAL">Global</option>
          </select>

          <select
            className="p-3 rounded-lg bg-gray-600 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="ALL">Status: All</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Full">Full</option>
          </select>
        </div>

        <main className="min-h-[400px]">
          {loading && (
            <div className="text-center mt-10">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-t-4 border-red-500 border-gray-500 rounded-full"></div>
              <p className="text-gray-400 mt-2">
                Loading games in real-time...
              </p>
            </div>
          )}

          {!loading && filteredGames.length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              No games match your current filter criteria. Try announcing one on
              Discord!
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-2">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                copyHostId={copyHostId}
                handleJoin={handleJoin}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

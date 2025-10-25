import { useState, useEffect } from "react";
import "./App.css";
import { db } from "./config/firebase";
import { getDocs, collection, getDoc, addDoc } from "firebase/firestore";

function App() {
  const [gameList, setGameList] = useState([]);

  const gamesCollectionRef = collection(db, "games");

  useEffect(() => {
    const getMessageList = async () => {
      try {
        const data = await getDocs(gamesCollectionRef);

        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setGameList(filteredData);
      } catch (err) {
        console.error(err.message);
      }
    };
    getMessageList();
  }, []);

  return (
    <>
      {gameList.map((game) => (
        <div key={game.id}>
          <p>{game.title}</p>
          <p>{game.discordInvite}</p>
          <p>{game.discordServer}</p>
          <p>{game.modPack}</p>
          <p>{game.status}</p>
        </div>
      ))}
    </>
  );
}

export default App;

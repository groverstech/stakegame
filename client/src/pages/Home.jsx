import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Welcome to StakeGame 🎮</h1>
      <button onClick={() => navigate("/game")}>Start Game</button>
    </div>
  );
};

export default Home;

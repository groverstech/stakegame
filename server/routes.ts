import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { spawn } from "child_process";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stake Engine API endpoints
  app.post("/api/stake/play", async (req, res) => {
    try {
      const { bet = 1 } = req.body;
      
      // Call Python math engine
      const pythonScript = path.join(process.cwd(), "math_engine", "slot_engine.py");
      const python = spawn("python3", [pythonScript, "play", bet.toString()]);
      
      let result = "";
      let error = "";
      
      python.stdout.on("data", (data) => {
        result += data.toString();
      });
      
      python.stderr.on("data", (data) => {
        error += data.toString();
      });
      
      python.on("close", (code) => {
        if (code === 0) {
          try {
            const gameResult = JSON.parse(result);
            res.json(gameResult);
          } catch (parseError) {
            console.error("Failed to parse Python output:", parseError);
            res.status(500).json({ error: "Failed to parse game result" });
          }
        } else {
          console.error("Python script error:", error);
          res.status(500).json({ error: "Game engine error" });
        }
      });
    } catch (error) {
      console.error("Stake play error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/stake/balance", async (req, res) => {
    try {
      // Mock balance for development
      res.json({ balance: 1000 });
    } catch (error) {
      console.error("Balance error:", error);
      res.status(500).json({ error: "Failed to get balance" });
    }
  });
  
  app.post("/api/stake/generate-outcomes", async (req, res) => {
    try {
      const { simulations = 1000 } = req.body;
      
      // Call Python outcome generator
      const pythonScript = path.join(process.cwd(), "math_engine", "outcome_generator.py");
      const python = spawn("python3", [pythonScript, simulations.toString()]);
      
      let result = "";
      let error = "";
      
      python.stdout.on("data", (data) => {
        result += data.toString();
      });
      
      python.stderr.on("data", (data) => {
        error += data.toString();
      });
      
      python.on("close", (code) => {
        if (code === 0) {
          res.json({ message: "Outcomes generated successfully", simulations });
        } else {
          console.error("Python script error:", error);
          res.status(500).json({ error: "Failed to generate outcomes" });
        }
      });
    } catch (error) {
      console.error("Generate outcomes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

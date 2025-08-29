from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from math_engine import slot_engine

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

balance = 1000  # simple in-memory balance

@app.post("/api/stake/play")
def play_game(bet: int = 10):
    global balance
    if bet > balance:
        return {"error": "Insufficient balance"}
    
    result = slot_engine.play_spin(bet)  # your math engine function
    win_amount = result.get("win", 0)
    balance += win_amount - bet

    return {
        "balance": balance,
        "result": result
    }

@app.get("/api/stake/balance")
def get_balance():
    return {"balance": balance}

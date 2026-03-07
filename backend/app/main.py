"""
🚀 CryptoNova API - Backend FastAPI
Busca dados em tempo real da CoinGecko API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cryptos, market

app = FastAPI(
    title="CryptoNova API",
    description="Dashboard de criptomoedas em tempo real",
    version="1.0.0"
)

# Permite o frontend React se conectar ao backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
app.include_router(cryptos.router, prefix="/api", tags=["Cryptos"])
app.include_router(market.router, prefix="/api", tags=["Market"])

@app.get("/")
def root():
    return {"message": "CryptoNova API está rodando! 🚀", "docs": "/docs"}

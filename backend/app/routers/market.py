"""
Rotas de dados globais do mercado de criptomoedas
"""

from fastapi import APIRouter, HTTPException
from app.services.coingecko import fetch_global_market

router = APIRouter()


@router.get("/market")
async def get_market():
    """
    Retorna dados globais do mercado cripto.
    Inclui market cap total, volume 24h, dominância do BTC, etc.
    
    Exemplo de uso:
    - GET /api/market
    """
    try:
        data = await fetch_global_market()
        market_data = data.get("data", {})

        # Simplifica a resposta para o que realmente precisamos no dashboard
        return {
            "status": "success",
            "data": {
                "total_market_cap_usd": market_data.get("total_market_cap", {}).get("usd", 0),
                "total_volume_usd": market_data.get("total_volume", {}).get("usd", 0),
                "market_cap_change_24h": market_data.get("market_cap_change_percentage_24h_usd", 0),
                "bitcoin_dominance": market_data.get("market_cap_percentage", {}).get("btc", 0),
                "ethereum_dominance": market_data.get("market_cap_percentage", {}).get("eth", 0),
                "active_cryptocurrencies": market_data.get("active_cryptocurrencies", 0),
                "markets": market_data.get("markets", 0),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados do mercado: {str(e)}")

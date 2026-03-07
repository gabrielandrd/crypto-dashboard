"""
Serviço que se comunica com a CoinGecko API
Documentação: https://www.coingecko.com/en/api/documentation
"""

import httpx
from typing import Optional

# URL base da API pública da CoinGecko (sem autenticação)
COINGECKO_BASE = "https://api.coingecko.com/api/v3"

# Moedas que queremos monitorar
DEFAULT_COINS = [
    "bitcoin", "ethereum", "solana", "cardano",
    "binancecoin", "ripple", "dogecoin", "polkadot",
    "avalanche-2", "chainlink"
]


async def fetch_coins_list(ids: Optional[list] = None) -> list:
    """
    Busca lista de criptomoedas com preços, market cap e variações.
    Retorna dados em USD por padrão.
    """
    coin_ids = ",".join(ids or DEFAULT_COINS)

    url = f"{COINGECKO_BASE}/coins/markets"
    params = {
        "vs_currency": "usd",
        "ids": coin_ids,
        "order": "market_cap_desc",
        "per_page": 20,
        "page": 1,
        "sparkline": True,           # minigrafico 7 dias
        "price_change_percentage": "1h,24h,7d"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def fetch_coin_detail(coin_id: str) -> dict:
    """
    Busca dados detalhados de uma moeda específica.
    Inclui descrição, links, preço em múltiplas moedas.
    """
    url = f"{COINGECKO_BASE}/coins/{coin_id}"
    params = {
        "localization": False,
        "tickers": False,
        "market_data": True,
        "community_data": False,
        "developer_data": False,
        "sparkline": False
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def fetch_coin_chart(coin_id: str, days: int = 7) -> dict:
    """
    Busca histórico de preços para gerar gráficos.
    days: 1, 7, 14, 30, 90, 180, 365
    """
    url = f"{COINGECKO_BASE}/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": "usd",
        "days": days,
        "interval": "daily" if days > 1 else "hourly"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def fetch_global_market() -> dict:
    """
    Busca dados globais do mercado de criptomoedas.
    Market cap total, volume, dominância do Bitcoin, etc.
    """
    url = f"{COINGECKO_BASE}/global"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def search_coins(query: str) -> list:
    """
    Busca moedas pelo nome ou símbolo.
    Exemplo: "bit" retorna Bitcoin, Bitcoin Cash, etc.
    """
    url = f"{COINGECKO_BASE}/search"
    params = {"query": query}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        # Retorna apenas os 10 primeiros resultados de moedas
        return data.get("coins", [])[:10]

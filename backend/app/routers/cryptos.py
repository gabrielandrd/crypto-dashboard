"""
Rotas relacionadas a criptomoedas individuais
"""

from fastapi import APIRouter, HTTPException, Query
from app.services.coingecko import (
    fetch_coins_list,
    fetch_coin_detail,
    fetch_coin_chart,
    search_coins
)

router = APIRouter()


@router.get("/cryptos")
async def get_cryptos(
    ids: str = Query(None, description="IDs separados por vírgula. Ex: bitcoin,ethereum")
):
    """
    Retorna lista das principais criptomoedas com preços e variações.
    
    Exemplo de uso:
    - GET /api/cryptos → top 10 padrão
    - GET /api/cryptos?ids=bitcoin,ethereum,solana → específicas
    """
    try:
        coin_ids = ids.split(",") if ids else None
        data = await fetch_coins_list(coin_ids)
        return {
            "status": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar criptomoedas: {str(e)}")


@router.get("/crypto/{coin_id}")
async def get_crypto_detail(coin_id: str):
    """
    Retorna dados detalhados de uma moeda específica.
    
    Exemplo de uso:
    - GET /api/crypto/bitcoin
    - GET /api/crypto/ethereum
    - GET /api/crypto/solana
    """
    try:
        data = await fetch_coin_detail(coin_id)
        return {
            "status": "success",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Moeda '{coin_id}' não encontrada: {str(e)}")


@router.get("/crypto/{coin_id}/chart")
async def get_crypto_chart(
    coin_id: str,
    days: int = Query(7, ge=1, le=365, description="Número de dias para o histórico")
):
    """
    Retorna histórico de preços para gerar gráficos.
    
    Exemplo de uso:
    - GET /api/crypto/bitcoin/chart?days=7
    - GET /api/crypto/ethereum/chart?days=30
    """
    try:
        data = await fetch_coin_chart(coin_id, days)
        
        # Formata os dados para uso mais fácil no frontend
        formatted_prices = [
            {"timestamp": item[0], "price": item[1]}
            for item in data.get("prices", [])
        ]
        
        return {
            "status": "success",
            "coin_id": coin_id,
            "days": days,
            "prices": formatted_prices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar gráfico: {str(e)}")


@router.get("/search")
async def search(q: str = Query(..., min_length=2, description="Termo de busca")):
    """
    Busca criptomoedas pelo nome ou símbolo.
    
    Exemplo de uso:
    - GET /api/search?q=bitcoin
    - GET /api/search?q=eth
    """
    try:
        results = await search_coins(q)
        return {
            "status": "success",
            "query": q,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")

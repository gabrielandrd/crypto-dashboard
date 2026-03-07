# ⚡ CryptoNova — Dashboard de Criptomoedas em Tempo Real

<div align="center">

![CryptoNova Banner](https://via.placeholder.com/900x200/0A0A16/FFD700?text=CRYPTONOVA+DASHBOARD)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-FF6B00?style=flat-square)](LICENSE)

**Dashboard profissional de criptomoedas com dados em tempo real, gráficos interativos e design futurista.**

[Demo ao Vivo](#) · [Reportar Bug](issues) · [Sugerir Feature](issues)

</div>

---

## 📸 Preview

> *Dark mode com palette inspirada no álbum Discovery do Daft Punk — laranja néon, dourado e azul elétrico.*

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ CRYPTO NOVA     [buscar...]                    ↺     │
├─────────────────────────────────────────────────────────┤
│  Market Cap $2.1T +1.2%  │  Vol 24h $89B  │  BTC 52%   │
├─────────────────────────────────────────────────────────┤
│  Todas | ★ Favoritos    Ordenar: Rank Preço 24h Cap      │
├─────────────────────────────────────────────────────────┤
│  # │ Moeda     │  Preço      │  24h   │  7d   │  Cap    │
│  1 │ ₿ Bitcoin │ $67,234.00  │ +2.3%  │ +8.1% │ $1.3T   │
│  2 │ Ξ Ethereum│  $3,421.00  │ +1.8%  │ +5.4% │ $411B   │
│  3 │ ◎ Solana  │    $178.40  │ -0.5%  │ +12%  │ $80B    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Função |
|---|---|
| **Python 3.11+** | Linguagem principal do backend |
| **FastAPI** | Framework web moderno e performático |
| **httpx** | Cliente HTTP assíncrono para a CoinGecko API |
| **Uvicorn** | Servidor ASGI para rodar a aplicação |

### Frontend
| Tecnologia | Função |
|---|---|
| **React 18** | Biblioteca UI com Hooks |
| **Vite** | Build tool ultra-rápido |
| **Recharts** | Gráficos responsivos e customizáveis |
| **Lucide React** | Ícones modernos |

### APIs Externas
- **[CoinGecko API](https://www.coingecko.com/en/api)** — dados de preços em tempo real (versão gratuita)

---

## 📁 Estrutura do Projeto

```
crypto-dashboard/
│
├── 📂 backend/
│   ├── app/
│   │   ├── main.py              # Configuração FastAPI + CORS
│   │   ├── routers/
│   │   │   ├── cryptos.py       # Endpoints /cryptos, /crypto/{id}
│   │   │   └── market.py        # Endpoint /market
│   │   └── services/
│   │       └── coingecko.py     # Lógica de comunicação com CoinGecko
│   └── requirements.txt
│
├── 📂 frontend/
│   ├── src/
│   │   ├── App.jsx              # Componente principal (Dashboard)
│   │   └── main.jsx             # Entry point React
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos
- [Python 3.11+](https://python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- VS Code (recomendado)

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/crypto-dashboard.git
cd crypto-dashboard
```

---

### 2. Configurar o Backend (Python + FastAPI)

```bash
# Entrar na pasta do backend
cd backend

# Criar ambiente virtual (boa prática em Python!)
python -m venv venv

# Ativar o ambiente virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Rodar o servidor
uvicorn app.main:app --reload --port 8000
```

✅ API rodando em: `http://localhost:8000`  
📚 Documentação interativa: `http://localhost:8000/docs`

---

### 3. Configurar o Frontend (React + Vite)

```bash
# Em outro terminal, entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Rodar o servidor de desenvolvimento
npm run dev
```

✅ Dashboard em: `http://localhost:5173`

---

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/cryptos` | Lista as top 10 criptomoedas |
| `GET` | `/api/cryptos?ids=bitcoin,ethereum` | Criptomoedas específicas |
| `GET` | `/api/crypto/{id}` | Detalhes de uma moeda |
| `GET` | `/api/crypto/{id}/chart?days=7` | Histórico de preços |
| `GET` | `/api/market` | Dados globais do mercado |
| `GET` | `/api/search?q=bitcoin` | Buscar moedas |

### Exemplos com curl

```bash
# Listar criptomoedas
curl http://localhost:8000/api/cryptos

# Detalhes do Bitcoin
curl http://localhost:8000/api/crypto/bitcoin

# Gráfico do Ethereum (30 dias)
curl "http://localhost:8000/api/crypto/ethereum/chart?days=30"

# Dados do mercado
curl http://localhost:8000/api/market

# Buscar por "sol"
curl "http://localhost:8000/api/search?q=sol"
```

### Exemplo de resposta — `/api/cryptos`

```json
{
  "status": "success",
  "count": 10,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "current_price": 67234.0,
      "market_cap": 1324000000000,
      "market_cap_rank": 1,
      "price_change_percentage_24h": 2.34,
      "total_volume": 28500000000,
      "image": "https://...",
      "sparkline_in_7d": { "price": [...] }
    }
  ]
}
```

---

## ✨ Funcionalidades

- [x] 📊 Preços em tempo real (atualização automática a cada 60s)
- [x] 📈 Gráficos de histórico de preços (1D, 7D, 30D, 90D)
- [x] 🔍 Busca de criptomoedas com debounce
- [x] ⭐ Sistema de favoritos (persistido no localStorage)
- [x] 🔃 Ordenação por rank, preço, variação 24h ou market cap
- [x] 💀 Skeleton loading (UI elegante durante carregamento)
- [x] 📱 Responsivo (mobile, tablet, desktop)
- [x] 🌊 Sparklines (mini-gráficos de 7 dias na tabela)
- [x] 📉 Dados globais do mercado (market cap total, dominância BTC)
- [x] 🎨 Dark mode com tema Discovery / Daft Punk

---

## 🎯 Melhorias Futuras

- [ ] 🔐 Autenticação de usuário (JWT)
- [ ] 💼 Portfólio pessoal (adicionar quantidade de cada moeda)
- [ ] 🔔 Alertas de preço (WebSocket + notificações)
- [ ] 🌍 Suporte a múltiplas moedas (BRL, EUR, etc.)
- [ ] 📦 Deploy na Vercel (frontend) + Railway/Render (backend)
- [ ] 🧪 Testes unitários com pytest e Vitest
- [ ] 📊 Dashboard com mais gráficos (market dominance, treemap)
- [ ] 🐳 Docker Compose para facilitar setup

---

## 🤝 Como Contribuir

```bash
# 1. Fork o projeto
# 2. Crie sua branch
git checkout -b feature/minha-feature

# 3. Commit suas mudanças
git commit -m "feat: adiciona suporte a múltiplas moedas"

# 4. Push para a branch
git push origin feature/minha-feature

# 5. Abra um Pull Request
```

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Feito com 🧡 e ☕ por [Seu Nome](https://github.com/seu-usuario)**

*"Harder, Better, Faster, Stronger" — Daft Punk*

⭐ Se esse projeto te ajudou, deixa uma estrela!

</div>

import os
import json
from typing import Optional

import jwt
import httpx
from fastapi import FastAPI, Request, Response, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

GATEWAY_PORT = int(os.getenv("GATEWAY_PORT", "8080"))
AUTH_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
ACCOUNT_URL = os.getenv("ACCOUNT_SERVICE_URL", "http://localhost:8002")
TRAN_URL = os.getenv("TRANSACTION_SERVICE_URL", "http://localhost:8003")
CORS = os.getenv("CORS_ORIGINS", "*")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-change-me")

app = FastAPI(title="API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS.split(",")] if CORS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper: proxy a request to a downstream service
async def proxy(request: Request, base_url: str, subpath: str) -> Response:
    url = f"{base_url}{subpath}"
    method = request.method
    headers = dict(request.headers)
    # Remove hop-by-hop headers
    headers.pop("host", None)

    # Body
    body = await request.body()

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.request(method, url, headers=headers, content=body, params=request.query_params)
        return Response(content=r.content, status_code=r.status_code, headers=dict(r.headers))

def verify_bearer(auth_header: Optional[str]) -> dict:
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/health")
async def health():
    return {"ok": True, "service": "api-gateway"}

# -------- Auth routes --------
@app.api_route("/api/auth/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def auth_proxy(path: str, request: Request):
    # /api/auth/* -> auth service
    return await proxy(request, AUTH_URL, f"/{path}")

# -------- Accounts routes --------
@app.api_route("/api/accounts/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def accounts_proxy(path: str, request: Request, authorization: Optional[str] = Header(None)):
    # Protect mutating ops by default
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        verify_bearer(authorization)
    return await proxy(request, ACCOUNT_URL, f"/{path}")

# -------- Transactions routes --------
@app.api_route("/api/transactions/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def transactions_proxy(path: str, request: Request, authorization: Optional[str] = Header(None)):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        verify_bearer(authorization)
    return await proxy(request, TRAN_URL, f"/{path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=GATEWAY_PORT, reload=False)

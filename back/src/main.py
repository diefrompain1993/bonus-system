import uvicorn
from routers import auth, tickets, business_centers, users, warehouse, uploads, bonus_system
from database import engine, Base
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import requests
import io

from routers.warehouse import router as router_warehouse

Base.metadata.create_all(bind=engine)
app = FastAPI(root_path="/api")

app.include_router(warehouse.router, prefix="/warehouse", tags=["warehouse"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
app.include_router(business_centers.router, prefix="/business_centers", tags=["Business Centers"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(bonus_system.router_public, prefix="/bonus", tags=["bonus"])


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

# Обработка запроса к "/favicon.ico", чтобы убрать 404
@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={}, status_code=204)

@app.get("/proxy-image/{file_id}")
async def proxy_image(file_id: str):
    drive_url = f"https://drive.google.com/uc?id={file_id}&export=view"
    response = requests.get(drive_url)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Image not found on Google Drive")
    
    # Динамически устанавливаем media_type на основе ответа Google Drive
    content_type = response.headers.get('Content-Type', 'image/jpeg')
    return StreamingResponse(io.BytesIO(response.content), media_type=content_type)


origins = [
    "*",
    "https://localhost:5173",
    "https://sibeeria.ru",
    "https://sibeeria.ru/api/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",  # Поменяйте на "localhost", если хотите, чтобы приложение работало только локально
        port=8000,
        reload=True
    )

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database

# FastAPI 앱 초기화
app = FastAPI()

# CORS 설정 (프론트엔드에서 요청 받기)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 모델
class SignupRequest(BaseModel):
    username: str
    password: str
    nickname: str
    age: int
    gender: str

class LoginRequest(BaseModel):
    username: str
    password: str

class CheckDuplicateRequest(BaseModel):
    username: str

# 초기화 (앱 시작 시 DB 테이블 생성)
@app.on_event("startup")
async def startup():
    database.init_db()
    print("✓ 데이터베이스 초기화 완료")

@app.post("/check-duplicate")
async def check_duplicate(request: dict):
    """
    아이디 중복 확인
    """
    username = request.get('username', '').strip()
    
    if not username:
        return {"available": False, "message": "아이디를 입력하세요"}
    
    # 데이터베이스에서 아이디 확인
    if database.check_username_available(username):
        return {"available": True, "message": "사용 가능한 아이디입니다"}
    else:
        return {"available": False, "message": "이미 사용 중인 아이디입니다"}
    
    
# 회원가입 엔드포인트
@app.post("/signup")
async def signup(request: SignupRequest):
    # 빈 값 확인
    if not request.username or not request.password or not request.nickname or not request.gender:
        return {"success": False, "message": "모든 필드를 입력하세요."}
    
    # DB에 사용자 저장
    result = database.add_user(
        username=request.username,
        password=request.password,
        nickname=request.nickname,
        age=request.age,
        gender=request.gender
    )

    if result:
        return {"success": True, "message": "가입 성공"}
    else:
        return {"success": False, "message": "이 아이디는 이미 사용 중입니다."}

# 로그인 엔드포인트
@app.post("/login")
async def login(request: LoginRequest):
    # 빈 값 확인
    if not request.username or not request.password:
        return {"success": False, "message": "아이디와 비밀번호를 입력하세요."}
    
    # DB에서 사용자 확인
    result = database.verify_user(username=request.username, password=request.password)

    if result:
        user_info = database.get_user(request.username)
        return {
            "success": True,
            "message": "로그인 성공",
            "username": user_info['username'],
            "nickname": user_info['nickname']
        }
    else:
        return {"success": False, "message": "아이디 또는 비밀번호가 틀렸습니다."}

# 헬스 체크
@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
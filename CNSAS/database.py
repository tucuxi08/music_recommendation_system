import sqlite3
import bcrypt
import os

# 데이터베이스 파일 경로
DB_FILE = 'users.db'

# 데이터베이스 초기화
def init_db():
    """
    users 테이블 생성
    """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            nickname TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"✓ 데이터베이스 테이블 생성/확인 완료: {DB_FILE}")

# 아이디 사용 가능 여부 확인
def check_username_available(username):
    """
    아이디가 사용 가능한지 확인
    - username: 확인할 아이디
    
    return: True (사용 가능), False (이미 사용 중)
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            print(f"✗ 이미 사용 중인 아이디: {username}")
            return False
        else:
            print(f"✓ 사용 가능한 아이디: {username}")
            return True
            
    except Exception as e:
        print(f"✗ 오류 발생: {e}")
        return False

# 사용자 추가
def add_user(username, password, nickname, age, gender):
    """
    새로운 사용자 회원가입
    - username: 아이디 (중복 불가)
    - password: 비밀번호 (bcrypt로 해싱)
    - nickname: 닉네임
    - age: 나이
    - gender: 성별
    
    return: True (성공), False (중복 등 실패)
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 비밀번호 해싱 (bcrypt)
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # 데이터베이스에 저장
        cursor.execute('''
            INSERT INTO users (username, password_hash, nickname, age, gender)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, password_hash, nickname, age, gender))
        
        conn.commit()
        conn.close()
        
        print(f"✓ 사용자 추가됨: {username}")
        return True
        
    except sqlite3.IntegrityError:
        # 중복된 username
        print(f"✗ 중복된 아이디: {username}")
        return False
    except Exception as e:
        print(f"✗ 오류 발생: {e}")
        return False

# 사용자 로그인 확인
def verify_user(username, password):
    """
    사용자 로그인 검증
    - username: 아이디
    - password: 비밀번호
    
    return: True (로그인 성공), False (실패)
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 데이터베이스에서 사용자 찾기
        cursor.execute('SELECT password_hash FROM users WHERE username = ?', (username,))
        result = cursor.fetchone()
        conn.close()
        
        if result is None:
            # 사용자 없음
            print(f"✗ 사용자 없음: {username}")
            return False
        
        # 비밀번호 확인 (bcrypt)
        stored_hash = result[0]
        if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
            print(f"✓ 로그인 성공: {username}")
            return True
        else:
            print(f"✗ 비밀번호 틀림: {username}")
            return False
            
    except Exception as e:
        print(f"✗ 오류 발생: {e}")
        return False

# 사용자 정보 조회
def get_user(username):
    """
    사용자 정보 조회
    - username: 아이디
    
    return: 사용자 정보 딕셔너리 또는 None
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, nickname, age, gender, created_at 
            FROM users WHERE username = ?
        ''', (username,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'id': result[0],
                'username': result[1],
                'nickname': result[2],
                'age': result[3],
                'gender': result[4],
                'created_at': result[5]
            }
        else:
            return None
            
    except Exception as e:
        print(f"✗ 오류 발생: {e}")
        return None

# 모든 사용자 조회 (테스트용)
def get_all_users():
    """
    모든 사용자 정보 조회 (테스트용)
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, nickname, age, gender FROM users')
        results = cursor.fetchall()
        conn.close()
        
        return results
        
    except Exception as e:
        print(f"✗ 오류 발생: {e}")
        return []
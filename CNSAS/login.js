// 로그인 처리
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // 검증
    if (!username) {
        showError('usernameError', '아이디를 입력하세요.');
        return;
    }

    if (!password) {
        showError('passwordError', '비밀번호를 입력하세요.');
        return;
    }

    try {
        // 백엔드로 로그인 요청
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // 로그인 성공 - 사용자 정보 저장
            localStorage.setItem('username', username);
            localStorage.setItem('nickname', data.nickname);
            localStorage.setItem('user_id', data.user_id);
            
            // 메인 페이지로 이동
            alert('로그인 성공!');
            window.location.href = 'main.html';
        } else {
            // 로그인 실패
            if (data.message === 'User not found') {
                showError('usernameError', '존재하지 않는 아이디입니다.');
            } else if (data.message === 'Invalid password') {
                showError('passwordError', '비밀번호가 틀렸습니다.');
            } else {
                alert(data.message || '로그인 실패했습니다.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('서버와 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
    }
}

// 에러 메시지 표시
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

// 입력창 클릭 시 에러 메시지 숨기기
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput) {
        usernameInput.addEventListener('focus', () => {
            document.getElementById('usernameError').classList.remove('show');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('focus', () => {
            document.getElementById('passwordError').classList.remove('show');
        });
    }
});
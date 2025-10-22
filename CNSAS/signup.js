let currentStage = 1;
let nicknameValue = '';
let usernameChecked = false;

// 초기 애니메이션 시작
window.addEventListener('load', () => {
    setTimeout(() => {
        triggerFormAnimation();
    }, 2000);
});

// 폼 애니메이션 시작 (음표 중앙으로, 동그라미로 변환)
function triggerFormAnimation() {
    const notes = document.querySelectorAll('.note');
    const randomNote = notes[Math.floor(Math.random() * notes.length)];

    // 선택된 음표를 중앙으로 이동
    randomNote.classList.add('move-to-center');

    // 동그라미로 변환
    setTimeout(() => {
        randomNote.classList.add('transform-to-circle');
        document.getElementById('floatingCircle').classList.add('active');
        document.getElementById('formBox').classList.add('active');
        showStage(1);
    }, 800);
}

// 스테이지 표시
function showStage(stage) {
    currentStage = stage;

    // 모든 스테이지 숨기기
    document.querySelectorAll('.stage').forEach(el => {
        el.classList.remove('active');
    });

    // 현재 스테이지 보이기
    document.getElementById(`stage${stage}`).classList.add('active');

    // 진행 표시 업데이트
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index + 1 <= stage) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// 중복확인
async function checkDuplicate() {
    const username = document.getElementById('username').value.trim();
    const errorEl = document.getElementById('usernameError');
    const successEl = document.getElementById('usernameSuccess');

    if (!username) {
        showError('usernameError', '아이디를 입력하세요.');
        return;
    }

    if (username.length < 3) {
        showError('usernameError', '아이디는 3자 이상이어야 합니다.');
        usernameChecked = false;
        return;
    }

    // 백엔드로 중복 확인 요청
    try {
        const response = await fetch('http://localhost:8000/check-duplicate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();

        if (data.available) {
            hideError('usernameError');
            showSuccess('usernameSuccess', '✓ 사용 가능한 아이디입니다');
            usernameChecked = true;
        } else {
            showError('usernameError', '이미 사용 중인 아이디입니다.');
            usernameChecked = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showError('usernameError', '중복 확인에 실패했습니다.');
    }
}

// 비밀번호 일치 확인
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const indicator = document.getElementById('passwordIndicator');
    const errorEl = document.getElementById('passwordError');

    if (passwordConfirm.length === 0) {
        indicator.classList.add('empty');
        errorEl.classList.remove('show');
        return;
    }

    indicator.classList.remove('empty');

    if (password === passwordConfirm && password.length >= 4) {
        indicator.classList.remove('mismatch');
        indicator.classList.add('match');
        errorEl.classList.remove('show');
    } else {
        indicator.classList.remove('match');
        indicator.classList.add('mismatch');
        if (password !== passwordConfirm) {
            showError('passwordError', '비밀번호가 일치하지 않습니다.');
        }
    }
}

// 다음 스테이지
function nextStage(stage) {
    if (stage === 1) {
        const nickname = document.getElementById('nickname').value.trim();
        if (!nickname) {
            alert('닉네임을 입력하세요.');
            return;
        }
        nicknameValue = nickname;
        showStage(2);
    } else if (stage === 2) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        if (!username) {
            showError('usernameError', '아이디를 입력하세요.');
            return;
        }
        if (!usernameChecked) {
            showError('usernameError', '중복확인을 해주세요.');
            return;
        }
        if (!password || password.length < 4) {
            showError('passwordError', '비밀번호는 4자 이상이어야 합니다.');
            return;
        }
        if (password !== passwordConfirm) {
            showError('passwordError', '비밀번호가 일치하지 않습니다.');
            return;
        }

        showStage(3);
    }
}

// 회원가입 완료 (백엔드 연동)
async function completeSignup() {
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!gender) {
        alert('성별을 선택하세요.');
        return;
    }
    if (!age || age < 1 || age > 120) {
        alert('올바른 나이를 입력하세요.');
        return;
    }

    try {
        // 백엔드로 회원가입 데이터 전송
        const response = await fetch('http://localhost:8000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                nickname: nicknameValue,
                age: parseInt(age),
                gender: gender
            })
        });

        const data = await response.json();

        if (data.success) {
            // 폼박스 숨기기
            document.getElementById('formBox').style.opacity = '0';
            document.getElementById('formBox').style.transform = 'scale(0.8)';

            // 동그라미 사라지기
            const circle = document.getElementById('floatingCircle');
            circle.style.animation = 'none';
            circle.style.width = '0';
            circle.style.height = '0';
            circle.style.opacity = '0';

            // Welcome 메시지 표시
            setTimeout(() => {
                const welcomeMsg = document.getElementById('welcomeMessage');
                document.getElementById('welcomeName').textContent = `${nicknameValue}님!`;
                welcomeMsg.classList.add('show');
                
                // 3초 후 로그인 페이지로 이동
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }, 600);
        } else {
            alert(data.message || '회원가입 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('서버와 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
    }
}

// 에러 표시
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

// 에러 숨기기
function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = '';
    errorEl.classList.remove('show');
}

// 성공 표시
function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    successEl.textContent = message;
    successEl.classList.add('show');
}
// 처음 시작할 때 화면에 보여줄 임시 질문 데이터들입니다. (배열 형태)
let questions = [
    {
        id: 1, // 각 질문을 구분하는 고유 번호
        title: "수학 근의 공식이 헷갈려요",
        body: "이차방정식 근의 공식을 외웠는데, 막상 문제에 적용하려니 부호가 너무 헷갈립니다. 쉽게 외우거나 적용하는 꿀팁 있을까요?",
        author: "익명학생",
        date: "2026-05-03",
        answers: [
            { text: "노래로 외우면 편해요! 유튜브에 '근의 공식 노래' 검색해보세요.", date: "2026-05-03" }
        ]
    },
    {
        id: 2,
        title: "과학 광합성 과정 질문입니다.",
        body: "명반응과 암반응의 차이가 정확히 무엇인가요? 책을 봐도 잘 이해가 안 갑니다 ㅠㅠ 도와주세요 선생님 혹은 친구들!",
        author: "과학왕",
        date: "2026-05-02",
        answers: [] // 아직 답변이 없는 상태
    }
];

// 현재 보고 있는 질문의 ID를 기억하기 위한 변수
let currentQuestionId = null;

// HTML 화면 요소(DOM: Document Object Model)들을 찾아옵니다.
const questionListContainer = document.getElementById('questionList');

const newQuestionBtn = document.getElementById('newQuestionBtn');
const newQuestionModal = document.getElementById('newQuestionModal');
const cancelQuestionBtn = document.getElementById('cancelQuestionBtn');
const submitQuestionBtn = document.getElementById('submitQuestionBtn');
const questionTitleInput = document.getElementById('questionTitleInput');
const questionBodyInput = document.getElementById('questionBodyInput');

const questionDetailModal = document.getElementById('questionDetailModal');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const answerListContainer = document.getElementById('answerList');
const answerInput = document.getElementById('answerInput');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');

// 1. 질문 목록을 화면에 그리는 함수
function renderQuestions() {
    // 기존에 있던 내용을 싹 지우고 다시 그립니다.
    questionListContainer.innerHTML = '';

    // questions 배열에 있는 데이터를 하나씩 꺼내서 카드를 만듭니다.
    questions.forEach(q => {
        // 새로운 div 태그(박스)를 만듭니다.
        const card = document.createElement('div');
        card.className = 'question-card'; // 디자인을 위해 클래스 이름 추가
        
        // 카드 안에 들어갈 HTML 내용을 채워 넣습니다.
        card.innerHTML = `
            <h3>${q.title}</h3>
            <p>${q.body}</p>
            <div class="card-footer">
                <span>작성자: ${q.author}</span>
                <span>답변 ${q.answers.length}개</span>
            </div>
        `;

        // 카드를 클릭했을 때 상세 보기 창이 열리도록 설정합니다.
        card.addEventListener('click', () => openQuestionDetail(q.id));

        // 만들어진 카드를 화면(목록)에 추가합니다.
        questionListContainer.appendChild(card);
    });
}

// 2. 새 질문 모달 열기/닫기 기능
newQuestionBtn.addEventListener('click', () => {
    // hidden 클래스를 제거하면 화면에 나타납니다.
    newQuestionModal.classList.remove('hidden');
});

cancelQuestionBtn.addEventListener('click', () => {
    // hidden 클래스를 추가하면 다시 숨겨집니다.
    newQuestionModal.classList.add('hidden');
    // 쓰던 내용을 지워줍니다.
    questionTitleInput.value = '';
    questionBodyInput.value = '';
});

// 3. 새 질문 등록하기 기능
submitQuestionBtn.addEventListener('click', () => {
    const title = questionTitleInput.value.trim();
    const body = questionBodyInput.value.trim();

    // 입력 안 한 항목이 있는지 검사합니다.
    if (title === '' || body === '') {
        alert("제목과 내용을 모두 입력해주세요!");
        return; // 함수를 여기서 종료합니다.
    }

    // 새로운 질문 데이터를 만듭니다.
    const newQuestion = {
        id: Date.now(), // 현재 시간을 고유 번호로 사용
        title: title,
        body: body,
        author: "새로운친구",
        date: new Date().toISOString().split('T')[0], // 오늘 날짜
        answers: [] // 처음엔 답변이 0개
    };

    // 데이터를 목록(배열)의 맨 앞에 추가합니다. (최신 글이 위로 오게)
    questions.unshift(newQuestion);
    
    // 모달을 닫고, 입력칸을 비우고, 화면을 다시 그립니다.
    newQuestionModal.classList.add('hidden');
    questionTitleInput.value = '';
    questionBodyInput.value = '';
    renderQuestions();
});

// 4. 질문 상세 보기 창 열기 기능
function openQuestionDetail(id) {
    // 클릭한 질문 데이터를 찾습니다.
    const question = questions.find(q => q.id === id);
    if (!question) return;

    currentQuestionId = id; // 현재 보고 있는 질문 번호 저장

    // 상세 창에 내용을 채워 넣습니다.
    detailTitle.textContent = question.title;
    detailBody.textContent = question.body;
    
    // 답변 목록 그리기
    renderAnswers(question.answers);

    // 상세 창 띄우기
    questionDetailModal.classList.remove('hidden');
}

// 5. 답변(댓글) 목록 그리는 함수
function renderAnswers(answers) {
    answerListContainer.innerHTML = ''; // 초기화
    
    if (answers.length === 0) {
        answerListContainer.innerHTML = '<p style="color: #6b7280; font-size: 0.9rem;">아직 답변이 없습니다. 첫 답변을 남겨주세요!</p>';
        return;
    }

    answers.forEach(ans => {
        const answerCard = document.createElement('div');
        answerCard.className = 'answer-card';
        answerCard.innerHTML = `
            <p>${ans.text}</p>
            <span style="font-size: 0.8rem; color: #9ca3af;">${ans.date}</span>
        `;
        answerListContainer.appendChild(answerCard);
    });
}

// 6. 질문 상세 창 닫기 기능
closeDetailBtn.addEventListener('click', () => {
    questionDetailModal.classList.add('hidden');
    currentQuestionId = null;
    answerInput.value = '';
});

// 7. 새 답변 등록하기 기능
submitAnswerBtn.addEventListener('click', () => {
    const text = answerInput.value.trim();
    if (text === '') {
        alert("답변 내용을 입력해주세요!");
        return;
    }

    // 현재 보고 있는 질문을 찾아서 답변을 추가합니다.
    const question = questions.find(q => q.id === currentQuestionId);
    if (question) {
        question.answers.push({
            text: text,
            date: new Date().toISOString().split('T')[0]
        });
        
        // 입력칸 비우고 화면을 다시 그립니다.
        answerInput.value = '';
        renderAnswers(question.answers);
        renderQuestions(); // 메인 화면의 '답변 n개' 숫자도 업데이트해야 하므로 메인 화면도 다시 그립니다.
    }
});

// 앱이 처음 시작될 때 실행할 코드 (초기화)
renderQuestions();

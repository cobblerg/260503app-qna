// --- 데이터 관리 ---

// 처음 시작할 때 화면에 보여줄 임시 키워드 데이터입니다. (기본 '전체보기'만 남겨두고 비웁니다.)
let keywords = ["전체보기"];
let activeKeyword = "전체보기"; // 현재 선택된 키워드

// 처음 시작할 때 화면에 보여줄 임시 질문 데이터들입니다. (비어있는 상태로 시작합니다.)
let questions = [];

let currentQuestionId = null;
let editingKeywordIndex = null; // 수정 중인 키워드의 순서 번호

// --- HTML 요소 찾아오기 ---

const keywordListContainer = document.getElementById('keywordList');
const addKeywordBtn = document.getElementById('addKeywordBtn');

const keywordModal = document.getElementById('keywordModal');
const keywordModalTitle = document.getElementById('keywordModalTitle');
const keywordInput = document.getElementById('keywordInput');
const cancelKeywordBtn = document.getElementById('cancelKeywordBtn');
const submitKeywordBtn = document.getElementById('submitKeywordBtn');

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

// --- 기능 구현: 키워드 관련 ---

// 1. 키워드 목록을 화면에 그리는 함수
function renderKeywords() {
    keywordListContainer.innerHTML = '';

    keywords.forEach((kw, index) => {
        const li = document.createElement('li');
        li.className = `keyword-item ${kw === activeKeyword ? 'active' : ''}`;
        li.draggable = true; // 드래그 가능하게 설정
        li.dataset.index = index;

        // 키워드 텍스트 부분
        const textSpan = document.createElement('span');
        textSpan.textContent = kw;
        textSpan.style.flex = "1";
        textSpan.addEventListener('click', () => {
            activeKeyword = kw;
            renderKeywords();
            renderQuestions(); // 해당 키워드로 질문 필터링
        });

        li.appendChild(textSpan);

        // 수정/삭제 버튼 (전체보기는 삭제 불가)
        if (kw !== "전체보기") {
            const actions = document.createElement('div');
            actions.className = 'keyword-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.className = 'action-btn';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openKeywordModal(index);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.className = 'action-btn';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteKeyword(index);
            };

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            li.appendChild(actions);
        }

        // 드래그 앤 드롭 이벤트 등록 (순서 변경용)
        setupDragAndDrop(li);

        keywordListContainer.appendChild(li);
    });
}

// 2. 키워드 추가/수정 모달 관련
addKeywordBtn.addEventListener('click', () => openKeywordModal());

function openKeywordModal(index = null) {
    editingKeywordIndex = index;
    if (index !== null) {
        keywordModalTitle.textContent = "키워드 수정";
        keywordInput.value = keywords[index];
    } else {
        keywordModalTitle.textContent = "키워드 추가";
        keywordInput.value = "";
    }
    keywordModal.classList.remove('hidden');
}

cancelKeywordBtn.addEventListener('click', () => {
    keywordModal.classList.add('hidden');
});

submitKeywordBtn.addEventListener('click', () => {
    const value = keywordInput.value.trim();
    if (value === "") return;

    if (editingKeywordIndex !== null) {
        // 수정 모드
        keywords[editingKeywordIndex] = value;
    } else {
        // 추가 모드
        keywords.push(value);
    }

    keywordModal.classList.add('hidden');
    renderKeywords();
});

// 3. 키워드 삭제
function deleteKeyword(index) {
    if (confirm(`'${keywords[index]}' 키워드를 삭제하시겠습니까?`)) {
        if (activeKeyword === keywords[index]) activeKeyword = "전체보기";
        keywords.splice(index, 1);
        renderKeywords();
        renderQuestions();
    }
}

// 4. 드래그 앤 드롭 정렬 기능 (쉬운 설명을 위해 기본 API 사용)
function setupDragAndDrop(el) {
    el.addEventListener('dragstart', (e) => {
        el.classList.add('dragging');
    });

    el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        // 순서가 바뀌었으므로 바뀐 순서대로 배열 재정렬 필요 (단순화를 위해 여기서는 시각적 위치만 변경하거나 저장 로직 추가)
        const items = [...keywordListContainer.querySelectorAll('.keyword-item')];
        keywords = items.map(item => item.querySelector('span').textContent);
        renderKeywords();
    });

    keywordListContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const siblings = [...keywordListContainer.querySelectorAll('.keyword-item:not(.dragging)')];
        
        let nextSibling = siblings.find(sibling => {
            return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
        });
        
        keywordListContainer.insertBefore(draggingItem, nextSibling);
    });
}

// --- 기능 구현: 질문 관련 ---

// 1. 질문 목록을 화면에 그리는 함수 (필터링 포함)
function renderQuestions() {
    questionListContainer.innerHTML = '';

    // 현재 선택된 키워드에 따라 필터링합니다.
    const filteredQuestions = activeKeyword === "전체보기" 
        ? questions 
        : questions.filter(q => q.keyword === activeKeyword);

    if (filteredQuestions.length === 0) {
        questionListContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">해당 주제의 질문이 아직 없습니다.</p>';
        return;
    }

    filteredQuestions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <span style="background: rgba(99, 102, 241, 0.1); color: var(--primary-color); font-size: 0.75rem; padding: 2px 8px; border-radius: 20px; font-weight: bold;"># ${q.keyword}</span>
            </div>
            <h3>${q.title}</h3>
            <p>${q.body}</p>
            <div class="card-footer">
                <span>작성자: ${q.author}</span>
                <span>답변 ${q.answers.length}개</span>
            </div>
        `;

        card.addEventListener('click', () => openQuestionDetail(q.id));
        questionListContainer.appendChild(card);
    });
}

// 2. 새 질문 모달 관련
newQuestionBtn.addEventListener('click', () => {
    newQuestionModal.classList.remove('hidden');
});

cancelQuestionBtn.addEventListener('click', () => {
    newQuestionModal.classList.add('hidden');
    questionTitleInput.value = '';
    questionBodyInput.value = '';
});

submitQuestionBtn.addEventListener('click', () => {
    const title = questionTitleInput.value.trim();
    const body = questionBodyInput.value.trim();

    if (title === '' || body === '') {
        alert("제목과 내용을 모두 입력해주세요!");
        return;
    }

    const newQuestion = {
        id: Date.now(),
        title: title,
        body: body,
        author: "새로운친구",
        date: new Date().toISOString().split('T')[0],
        keyword: activeKeyword === "전체보기" ? "기타" : activeKeyword, // 현재 보고 있는 카테고리로 자동 지정
        answers: []
    };

    questions.unshift(newQuestion);
    newQuestionModal.classList.add('hidden');
    questionTitleInput.value = '';
    questionBodyInput.value = '';
    renderQuestions();
});

// 3. 질문 상세 보기 및 답변 기능
function openQuestionDetail(id) {
    const question = questions.find(q => q.id === id);
    if (!question) return;

    currentQuestionId = id;
    detailTitle.textContent = `[${question.keyword}] ${question.title}`;
    detailBody.textContent = question.body;
    renderAnswers(question.answers);
    questionDetailModal.classList.remove('hidden');
}

function renderAnswers(answers) {
    answerListContainer.innerHTML = '';
    if (answers.length === 0) {
        answerListContainer.innerHTML = '<p style="color: #6b7280; font-size: 0.9rem;">아직 답변이 없습니다. 첫 답변을 남겨주세요!</p>';
        return;
    }
    answers.forEach(ans => {
        const answerCard = document.createElement('div');
        answerCard.className = 'answer-card';
        answerCard.innerHTML = `<p>${ans.text}</p><span style="font-size: 0.8rem; color: #9ca3af;">${ans.date}</span>`;
        answerListContainer.appendChild(answerCard);
    });
}

closeDetailBtn.addEventListener('click', () => {
    questionDetailModal.classList.add('hidden');
    currentQuestionId = null;
    answerInput.value = '';
});

submitAnswerBtn.addEventListener('click', () => {
    const text = answerInput.value.trim();
    if (text === '') return;

    const question = questions.find(q => q.id === currentQuestionId);
    if (question) {
        question.answers.push({ text: text, date: new Date().toISOString().split('T')[0] });
        answerInput.value = '';
        renderAnswers(question.answers);
        renderQuestions();
    }
});

// 초기화
renderKeywords();
renderQuestions();

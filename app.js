const classSelect = document.getElementById('classSelect');
  if (!currentSubjectData) return;
  const chapter = currentSubjectData.chapters.find(item => item.id === chapterId);
  currentChapter = chapter || null;

  if (!chapter) {
    clearChapter();
    return;
  }

  searchInput.disabled = false;
  chapterTitle.textContent = chapter.name;
  chapterMeta.textContent = `${currentSubjectData.className} • ${currentSubjectData.subjectName}`;
  breadcrumbsEl.textContent = `${currentSubjectData.className} / ${currentSubjectData.subjectName} / ${chapter.name}`;
  questionCount.textContent = `${chapter.questions.length} Questions`;
  chapterContent.hidden = false;
  statusEl.textContent = '';
  renderQuestions(chapter.questions, searchInput.value.trim());
  syncUrl();
}

function renderQuestions(questions, keyword = '') {
  const query = keyword.toLowerCase();
  const filtered = questions.filter(item => {
    if (!query) return true;
    return item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query);
  });

  qaList.innerHTML = '';

  if (!filtered.length) {
    qaList.innerHTML = '<p class="status">No questions matched your search.</p>';
    return;
  }

  filtered.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'qa-card';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${index + 1}. ${item.question}`;
    button.addEventListener('click', () => {
      card.classList.toggle('open');
    });

    const answer = document.createElement('div');
    answer.className = 'qa-answer';
    answer.innerHTML = `<p>${escapeHtml(item.answer).replace(/\n/g, '<br>')}</p>`;

    card.appendChild(button);
    card.appendChild(answer);
    qaList.appendChild(card);
  });
}

function clearChapter() {
  currentChapter = null;
  chapterContent.hidden = true;
  qaList.innerHTML = '';
  breadcrumbsEl.textContent = 'No chapter selected';
  statusEl.textContent = 'Choose a class, subject, and chapter to load content.';
  syncUrl();
}

function setStatus(message) {
  chapterContent.hidden = true;
  statusEl.textContent = message;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

classSelect.addEventListener('change', () => {
  const 

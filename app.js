(() => {
  // 상수 및 유틸리티
  const STORAGE_KEY = 'yura_finance_v1';
  const uid = () => Math.random().toString(36).slice(2, 10);
  const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
  const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const defaultState = () => ({
    incomes: [], expenses: [], deposits: [], goals: []
  });

  let state = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? {...defaultState(), ...JSON.parse(stored)} : defaultState();
    } catch { return defaultState(); }
  })();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
  }

  // DOM 요소 참조
  const goalTab = document.getElementById('goalTab'),
        savingsTab = document.getElementById('savingsTab'),
        incomeTab = document.getElementById('incomeTab'),
        expenseTab = document.getElementById('expenseTab');
        
  const goalSection = document.getElementById('goalSection'),
        savingsSection = document.getElementById('savingsSection'),
        incomeSection = document.getElementById('incomeSection'),
        expenseSection = document.getElementById('expenseSection');

  const allTabs = [goalTab, savingsTab, incomeTab, expenseTab];
  const allSections = [goalSection, savingsSection, incomeSection, expenseSection];

  // 탭 전환
  function setActiveTab(tab) {
    allTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    allSections.forEach(s => s.classList.add('hidden'));
    
    if (tab === goalTab) goalSection.classList.remove('hidden');
    if (tab === savingsTab) savingsSection.classList.remove('hidden');
    if (tab === incomeTab) incomeSection.classList.remove('hidden');
    if (tab === expenseTab) expenseSection.classList.remove('hidden');
  }

  // 이벤트 리스너
  goalTab.addEventListener('click', () => setActiveTab(goalTab));
  savingsTab.addEventListener('click', () => setActiveTab(savingsTab));
  incomeTab.addEventListener('click', () => setActiveTab(incomeTab));
  expenseTab.addEventListener('click', () => setActiveTab(expenseTab));

  // 항목 삭제/수정 함수
  function handleDelete(type, id) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    state[type] = state[type].filter(item => item.id !== id);
    saveState();
  }

  function handleEdit(type, id) {
    const item = state[type].find(i => i.id === id);
    if (!item) return;
    const newText = prompt(`새로운 내용을 입력하세요 (현재: ${item.source || item.item})`, item.source || item.item);
    const newAmount = parseFloat(prompt(`새로운 금액을 입력하세요 (현재: ${item.amount})`, item.amount));
    if (newText) {
        if (item.source !== undefined) item.source = newText;
        if (item.item !== undefined) item.item = newText;
    }
    if (!isNaN(newAmount) && newAmount > 0) item.amount = newAmount;
    saveState();
  }

  // 폼 제출 핸들러
  document.getElementById('incomeForm').addEventListener('submit', e => {
    e.preventDefault();
    const source = document.getElementById('incomeSource').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    if (!source || isNaN(amount) || amount <= 0) return;
    state.incomes.push({ id: uid(), source, amount, date: new Date().toISOString() });
    saveState();
    e.target.reset();
  });

  document.getElementById('expenseForm').addEventListener('submit', e => {
    e.preventDefault();
    const source = document.getElementById('expenseSource').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const evaluation = Number(document.querySelector('input[name="evaluation"]:checked').value);
    if (!source || isNaN(amount) || amount <= 0) return;
    state.expenses.push({ id: uid(), source, amount, date: new Date().toISOString(), evaluation, isDonation: false });
    saveState();
    e.target.reset();
  });

  document.getElementById('addDonationButton').addEventListener('click', () => {
    const sourceInput = document.getElementById('donationSource');
    const amountInput = document.getElementById('donationAmount');
    const source = sourceInput.value.trim();
    const amount = parseFloat(amountInput.value);
    if (!source || isNaN(amount) || amount <= 0) return;
    state.expenses.push({ id: uid(), source, amount, date: new Date().toISOString(), evaluation: 0, isDonation: true });
    saveState();
    sourceInput.value = '';
    amountInput.value = '';
  });

  document.getElementById('goalForm').addEventListener('submit', e => {
    e.preventDefault();
    const item = document.getElementById('goalItem').value.trim();
    const amount = parseFloat(document.getElementById('goalAmount').value);
    const date = document.getElementById('goalDate').value;
    if (!item || isNaN(amount) || amount <= 0 || !date) return;
    state.goals.push({ id: uid(), item, amount, date, achieved: false, createdAt: new Date().toISOString() });
    saveState();
    e.target.reset();
  });

  // 예금
  const depositAmountInput = document.getElementById('depositAmount'), depositPeriodInput = document.getElementById('depositPeriod'), interestPreview = document.getElementById('interestPreview');
  function updateInterestPreview() {
    const amount = Number(depositAmountInput.value), period = Number(depositPeriodInput.value);
    if (amount <= 0 || period <= 0) { interestPreview.textContent = ''; return; }
    const interest = amount * 0.01 * period, total = amount + interest;
    interestPreview.textContent = `예상 이자: ${money(interest)} → 만기: ${money(total)}`;
  }
  depositAmountInput.addEventListener('input', updateInterestPreview);
  depositPeriodInput.addEventListener('input', updateInterestPreview);
  document.getElementById('depositButton').addEventListener('click', () => {
    const amount = Number(depositAmountInput.value), period = Number(depositPeriodInput.value);
    if (amount <= 0 || period <= 0) return;
    state.deposits.push({ id: uid(), amount, period, date: new Date().toISOString() });
    saveState();
    depositAmountInput.value = ''; depositPeriodInput.value = ''; interestPreview.textContent = '';
  });

  // 렌더링 함수
  function createActions(type, id) {
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️';
    editBtn.className = 'p-1 hover:bg-gray-200 rounded';
    editBtn.onclick = () => handleEdit(type, id);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.className = 'p-1 hover:bg-gray-200 rounded';
    deleteBtn.onclick = () => handleDelete(type, id);
    
    const container = document.createElement('span');
    container.className = 'item-actions ml-2';
    container.append(editBtn, deleteBtn);
    return container;
  }

  function renderList(elementId, items, type, formatFn) {
    const listEl = document.getElementById(elementId);
    if (!listEl) return;
    listEl.innerHTML = '';
    items.forEach(item => {
      const el = formatFn(item);
      el.append(createActions(type, item.id));
      listEl.appendChild(el);
    });
  }

  function renderAll() {
    // 요약 렌더링
    const totalIncome = state.incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = state.expenses.reduce((s, e) => s + e.amount, 0);
    const bankBalance = state.deposits.reduce((s, d) => s + d.amount, 0);
    const evaluationScore = state.expenses.reduce((s, e) => s + (e.evaluation || 0), 0);
    const totalDonation = state.expenses.filter(e => e.isDonation).reduce((s, e) => s + e.amount, 0);
    
    document.getElementById('balanceSummary').textContent = money(totalIncome - totalExpense);
    document.getElementById('evaluationScore').textContent = evaluationScore;
    document.getElementById('totalDonation').textContent = money(totalDonation);
    document.getElementById('totalIncome').textContent = money(totalIncome);
    document.getElementById('totalExpense').textContent = money(totalExpense);
    document.getElementById('bankBalance').textContent = money(bankBalance);

    // 목록 렌더링
    renderList('incomeList', state.incomes, 'incomes', item => {
      const li = document.createElement('li');
      li.className = 'p-2 bg-blue-50 rounded-lg flex justify-between items-center';
      li.innerHTML = `<div>${item.source} • ${money(item.amount)}<br><span class="text-xs text-gray-500">${formatDateTime(item.date)}</span></div>`;
      return li;
    });
    renderList('expenseList', state.expenses, 'expenses', item => {
      const li = document.createElement('li');
      li.className = 'p-2 bg-red-50 rounded-lg flex justify-between items-center';
      const score = item.evaluation;
      const scoreText = item.isDonation ? '' : `(${score > 0 ? '+' : ''}${score}점)`;
      li.innerHTML = `<div>${item.isDonation ? '💖 ' : ''}${item.source} • ${money(item.amount)} <span class="text-xs text-gray-500">${scoreText}</span><br><span class="text-xs text-gray-500">${formatDateTime(item.date)}</span></div>`;
      return li;
    });
    renderList('goalList', state.goals, 'goals', item => {
      const div = document.createElement('div');
      div.className = `p-2 rounded-lg flex justify-between items-center ${item.achieved ? 'bg-gray-100' : 'bg-green-50'}`;
      div.innerHTML = `<div>🎯 ${item.item} • ${money(item.amount)} (목표일: ${item.date})<br><span class="text-xs text-gray-500">추가일: ${formatDateTime(item.createdAt)}</span></div>`;
      return div;
    });
    renderList('depositList', state.deposits, 'deposits', item => {
      const div = document.createElement('div');
      div.className = 'p-2 bg-indigo-50 rounded-lg flex justify-between items-center text-sm';
      const interest = item.amount * 0.01 * item.period;
      const startDate = new Date(item.date);
      const maturityDate = new Date(startDate);
      maturityDate.setDate(startDate.getDate() + item.period);
      div.innerHTML = `<div>💼 ${money(item.amount)} (이자: ${money(interest)})<br><span class="text-xs text-gray-500">예금일: ${formatDateTime(item.date)}<br>만기일: ${toISODate(maturityDate)}</span></div>`;
      return div;
    });
  }

  // 초기화
  renderAll();
  setActiveTab(goalTab);
})();
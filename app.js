(() => {
  // 상수 및 유틸리티
  const STORAGE_KEY = 'yura_finance_v1';
  const uid = () => Math.random().toString(36).slice(2, 10);
  const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
  const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

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
    if (newText) item.source = item.item = newText;
    if (!isNaN(newAmount) && newAmount > 0) item.amount = newAmount;
    saveState();
  }

  // 폼 제출 핸들러
  document.getElementById('incomeForm').addEventListener('submit', e => {
    e.preventDefault();
    const source = e.target.incomeSource.value.trim(), amount = parseFloat(e.target.incomeAmount.value);
    if (!source || amount <= 0) return;
    state.incomes.push({ id: uid(), source, amount, date: toISODate() });
    saveState();
    e.target.reset();
  });

  document.getElementById('expenseForm').addEventListener('submit', e => {
    e.preventDefault();
    const source = e.target.expenseSource.value.trim(), amount = parseFloat(e.target.expenseAmount.value);
    const evaluation = Number(e.target.evaluation.value);
    if (!source || amount <= 0) return;
    state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation, isDonation: false });
    saveState();
    e.target.reset();
  });

  document.getElementById('addDonationButton').addEventListener('click', () => {
    const source = document.getElementById('donationSource').value.trim(), amount = parseFloat(document.getElementById('donationAmount').value);
    if (!source || amount <= 0) return;
    state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: 0, isDonation: true });
    saveState();
    document.getElementById('donationSource').value = '';
    document.getElementById('donationAmount').value = '';
  });

  document.getElementById('goalForm').addEventListener('submit', e => {
    e.preventDefault();
    const item = e.target.goalItem.value.trim(), amount = parseFloat(e.target.goalAmount.value), date = e.target.goalDate.value;
    if (!item || amount <= 0 || !date) return;
    state.goals.push({ id: uid(), item, amount, date, achieved: false });
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
    state.deposits.push({ id: uid(), amount, period, date: toISODate() });
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
    
    document.getElementById('balance').textContent = money(totalIncome - totalExpense);
    document.getElementById('totalIncome').textContent = money(totalIncome);
    document.getElementById('totalExpense').textContent = money(totalExpense);
    document.getElementById('bankBalance').textContent = money(bankBalance);

    // 목록 렌더링
    renderList('incomeList', state.incomes, 'incomes', item => {
      const li = document.createElement('li');
      li.className = 'p-2 bg-blue-50 rounded-lg flex justify-between items-center';
      li.innerHTML = `<span>${item.source} • ${money(item.amount)}</span>`;
      return li;
    });
    renderList('expenseList', state.expenses, 'expenses', item => {
      const li = document.createElement('li');
      li.className = 'p-2 bg-red-50 rounded-lg flex justify-between items-center';
      li.innerHTML = `<span>${item.isDonation ? '💖 ' : ''}${item.source} • ${money(item.amount)}</span>`;
      return li;
    });
    renderList('goalList', state.goals, 'goals', item => {
      const div = document.createElement('div');
      div.className = `p-2 rounded-lg flex justify-between items-center ${item.achieved ? 'bg-gray-100' : 'bg-green-50'}`;
      div.innerHTML = `<span>🎯 ${item.item} • ${money(item.amount)}</span>`;
      return div;
    });
    renderList('depositList', state.deposits, 'deposits', item => {
      const div = document.createElement('div');
      div.className = 'p-2 bg-indigo-50 rounded-lg flex justify-between items-center';
      div.innerHTML = `<span>💼 ${money(item.amount)} • ${item.period}일</span>`;
      return div;
    });
  }

  // 초기화
  renderAll();
  setActiveTab(goalTab);
})();
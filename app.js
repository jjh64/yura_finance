// HTML 코드는 모두 제거하고 아래의 순수 JavaScript 코드만 남겨주세요.
(() => {
  // 상수 및 유틸리티
  const STORAGE_KEY = 'yura_finance_v1';
  const uid = () => Math.random().toString(36).slice(2, 10);
  const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
  const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

  // 초기 상태
  const defaultState = () => ({
    incomes: [],
    expenses: [],
    deposits: [],
    goals: [],
    goalLogs: [],
    bankBalance: 0,
    evaluationScore: 0
  });

  // 상태 로드
  let state = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? {...defaultState(), ...JSON.parse(stored)} : defaultState();
    } catch (e) {
      return defaultState();
    }
  })();

  // 상태 저장
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // DOM 요소 참조
  const goalTab = document.getElementById('goalTab');
  const incomeTab = document.getElementById('incomeTab');
  const expenseTab = document.getElementById('expenseTab');

  const goalSection = document.getElementById('goalSection');
  const incomeSection = document.getElementById('incomeSection');
  const expenseSection = document.getElementById('expenseSection');

  const listViewTab = document.getElementById('listViewTab');
  const graphViewTab = document.getElementById('graphViewTab');
  const listViewContainer = document.getElementById('listViewContainer');
  const graphViewContainer = document.getElementById('graphViewContainer');

  // 탭 활성화 함수
  function setActiveTab(tab) {
    [goalTab, incomeTab, expenseTab].forEach(t => {
      if (t) t.classList.remove('active');
    });
    if (tab) tab.classList.add('active');
    
    if (goalSection) goalSection.classList.add('hidden');
    if (incomeSection) incomeSection.classList.add('hidden');
    if (expenseSection) expenseSection.classList.add('hidden');
    
    if (tab === goalTab && goalSection) goalSection.classList.remove('hidden');
    if (tab === incomeTab && incomeSection) incomeSection.classList.remove('hidden');
    if (tab === expenseTab && expenseSection) expenseSection.classList.remove('hidden');
  }

  // 뷰 전환 함수
  function setActiveView(viewTab) {
    [listViewTab, graphViewTab].forEach(t => {
      if (t) t.classList.remove('active');
    });
    if (viewTab) viewTab.classList.add('active');
    
    const isGraphView = viewTab === graphViewTab;
    if (listViewContainer) listViewContainer.classList.toggle('hidden', isGraphView);
    if (graphViewContainer) graphViewContainer.classList.toggle('hidden', !isGraphView);
    
    if (isGraphView && window.Chart) renderChart();
  }

  // 탭 이벤트 리스너
  if (goalTab) goalTab.addEventListener('click', () => setActiveTab(goalTab));
  if (incomeTab) incomeTab.addEventListener('click', () => setActiveTab(incomeTab));
  if (expenseTab) expenseTab.addEventListener('click', () => setActiveTab(expenseTab));

  // 뷰 이벤트 리스너
  if (listViewTab) listViewTab.addEventListener('click', () => setActiveView(listViewTab));
  if (graphViewTab) graphViewTab.addEventListener('click', () => setActiveView(graphViewTab));

  // 수입 폼
  const incomeForm = document.getElementById('incomeForm');
  if (incomeForm) {
    incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const source = document.getElementById('incomeSource').value.trim();
      const amount = parseFloat(document.getElementById('incomeAmount').value || '0');
      if (!source || amount <= 0) return;
      
      state.incomes.push({ id: uid(), source, amount, date: toISODate() });
      saveState();
      renderAll();
      e.target.reset();
    });
  }

  // 지출 폼
  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const source = document.getElementById('expenseSource').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value || '0');
      const evalElement = document.querySelector('input[name="evaluation"]:checked');
      const evalValue = evalElement ? Number(evalElement.value) : 0;
      
      if (!source || amount <= 0) return;
      
      state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: evalValue, isDonation: false });
      saveState();
      renderAll();
      e.target.reset();
    });
  }

  // 기부 버튼
  const donationBtn = document.getElementById('addDonationButton');
  if (donationBtn) {
    donationBtn.addEventListener('click', () => {
      const source = document.getElementById('donationSource').value.trim();
      const amount = parseFloat(document.getElementById('donationAmount').value || '0');
      if (!source || amount <= 0) return;
      
      state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: 0, isDonation: true });
      saveState();
      renderAll();
      
      const sourceInput = document.getElementById('donationSource');
      const amountInput = document.getElementById('donationAmount');
      if (sourceInput) sourceInput.value = '';
      if (amountInput) amountInput.value = '';
    });
  }

  // 목표 폼
  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = document.getElementById('goalItem').value.trim();
      const amount = parseFloat(document.getElementById('goalAmount').value || '0');
      const date = document.getElementById('goalDate').value;
      if (!item || amount <= 0 || !date) return;
      
      const goal = { id: uid(), item, amount, date, achieved: false };
      state.goals.push(goal);
      logGoal('add', goal);
      saveState();
      renderAll();
      e.target.reset();
    });
  }

  // 목표 로그 기록
  function logGoal(action, goal) {
    state.goalLogs.unshift({ id: uid(), action, item: goal.item, amount: Number(goal.amount), targetDate: goal.date, at: new Date().toISOString() });
  }

  // 예금 계산 (단리 1%/일)
  const depositAmountInput = document.getElementById('depositAmount');
  const depositPeriodInput = document.getElementById('depositPeriod');
  const interestPreview = document.getElementById('interestPreview');
  
  function updateInterestPreview() {
    const amount = Number(depositAmountInput?.value || 0);
    const period = Number(depositPeriodInput?.value || 0);
    if (amount <= 0 || period <= 0) {
      if (interestPreview) interestPreview.textContent = '';
      return;
    }
    const interest = amount * 0.01 * period;
    const total = amount + interest;
    if (interestPreview) {
      interestPreview.textContent = `예상 이자(단리): ${money(interest)} → 만기: ${money(total)} (기간: ${period}일)`;
    }
  }
  
  if (depositAmountInput) depositAmountInput.addEventListener('input', updateInterestPreview);
  if (depositPeriodInput) depositPeriodInput.addEventListener('input', updateInterestPreview);
  
  // 예금하기 버튼
  const depositButton = document.getElementById('depositButton');
  if (depositButton) {
    depositButton.addEventListener('click', () => {
      const amount = Number(depositAmountInput?.value || 0);
      const period = Number(depositPeriodInput?.value || 0);
      if (amount <= 0 || period <= 0) return;
      
      state.deposits.push({ id: uid(), amount, period, date: toISODate() });
      state.bankBalance = state.deposits.reduce((sum, dep) => sum + Number(dep.amount || 0), 0);
      saveState();
      renderAll();
      
      if (depositAmountInput) depositAmountInput.value = '';
      if (depositPeriodInput) depositPeriodInput.value = '';
      if (interestPreview) interestPreview.textContent = '';
    });
  }

  // 렌더링 함수
  function renderAll() {
    renderSummary();
    renderIncomes();
    renderExpenses();
    renderDeposits();
    renderGoals();
    renderGoalLogs();
    
    if (graphViewContainer && !graphViewContainer.classList.contains('hidden')) {
      renderChart();
    }
  }
  
  function renderSummary() {
    const balanceEl = document.getElementById('balance');
    const bankBalanceEl = document.getElementById('bankBalance');
    const evaluationScoreEl = document.getElementById('evaluationScore');
    const totalDonationEl = document.getElementById('totalDonation');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const balanceSheetAmountEl = document.getElementById('balanceSheetAmount');
    
    const totalIncome = state.incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
    const totalExpense = state.expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const totalDonation = state.expenses.filter(exp => exp.isDonation).reduce((sum, don) => sum + Number(don.amount || 0), 0);
    const evalScore = state.expenses.reduce((sum, exp) => sum + Number(exp.evaluation || 0), 0);
    const netBalance = totalIncome - totalExpense;
    
    if (balanceEl) balanceEl.textContent = money(netBalance);
    if (bankBalanceEl) bankBalanceEl.textContent = money(state.bankBalance);
    if (evaluationScoreEl) evaluationScoreEl.textContent = evalScore.toString();
    if (totalDonationEl) totalDonationEl.textContent = money(totalDonation);
    if (totalIncomeEl) totalIncomeEl.textContent = money(totalIncome);
    if (totalExpenseEl) totalExpenseEl.textContent = money(totalExpense);
    if (balanceSheetAmountEl) balanceSheetAmountEl.textContent = money(netBalance);
  }
  
  function renderIncomes() {
    const incomeList = document.getElementById('incomeList');
    if (!incomeList) return;
    incomeList.innerHTML = state.incomes.map(income => `<li class="p-2 bg-blue-50 rounded-lg">${income.source} • ${money(income.amount)} • ${income.date || ''}</li>`).join('');
  }
  
  function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;
    expenseList.innerHTML = state.expenses.map(expense => `<li class="p-2 bg-red-50 rounded-lg">${expense.isDonation ? '💖 ' : ''}${expense.source} • ${money(expense.amount)} • ${expense.date || ''}</li>`).join('');
  }
  
  function renderDeposits() {
    const depositList = document.getElementById('depositList');
    if (!depositList) return;
    depositList.innerHTML = state.deposits.map(deposit => `<div class="p-2 bg-indigo-50 rounded-lg">💼 ${money(deposit.amount)} • ${deposit.period || 0}일 • ${deposit.date || ''}</div>`).join('');
  }
  
  function renderGoals() {
    const goalList = document.getElementById('goalList');
    if (!goalList) return;
    goalList.innerHTML = state.goals.map(goal => `<div class="p-2 rounded-lg ${goal.achieved ? 'bg-gray-100' : 'bg-green-50'}">🎯 ${goal.item} • ${money(goal.amount)} ${goal.date ? '• ' + goal.date : ''}</div>`).join('');
  }
  
  function renderGoalLogs() {
    const goalLogsList = document.getElementById('goalLogsList');
    if (!goalLogsList) return;
    if (!state.goalLogs.length) {
      goalLogsList.innerHTML = '<li class="text-center text-gray-500">기록이 없습니다.</li>';
      return;
    }
    goalLogsList.innerHTML = state.goalLogs.map(log => {
      const timestamp = new Date(log.at).toLocaleString();
      const targetDate = log.targetDate ? ` (목표일: ${log.targetDate})` : '';
      const action = log.action === 'add' ? '추가' : '기타';
      return `<li class="p-2 rounded-lg bg-green-50 text-sm">[${action}] ${log.item} - ${money(log.amount)}${targetDate} • ${timestamp}</li>`;
    }).join('');
  }
  
  // 차트 렌더링
  function renderChart() {
    const canvas = document.getElementById('transactionChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const transactions = [
      ...state.incomes.map(inc => ({ date: inc.date, amount: Number(inc.amount || 0) })),
      ...state.expenses.map(exp => ({ date: exp.date, amount: -Number(exp.amount || 0) }))
    ];
    
    if (!transactions.length) return;
    
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let cumulative = 0;
    const chartData = transactions.map(tx => {
      cumulative += tx.amount;
      return { x: new Date(tx.date), y: cumulative };
    });
    
    if (window.financeChart) window.financeChart.destroy();
    
    window.financeChart = new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [{
          label: '누적 잔액',
          data: chartData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.2,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { type: 'time', time: { unit: 'day' } } }
      }
    });
  }
  
  // 초기화
  renderAll();
  setActiveView(listViewTab);
  setTimeout(() => setActiveTab(goalTab), 0);
})();
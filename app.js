<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>유라의 가계부 (Yura's Piggy Bank)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Noto Sans KR', sans-serif;
        }
        .tab-button.active {
            background-color: #3B82F6;
            color: white;
        }
        .view-tab.active {
            border-bottom: 3px solid #3B82F6;
            color: #3B82F6;
        }
    </style>
</head>
<body class="bg-blue-50 text-gray-800">
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
        <header class="text-center mb-8">
            <h1 class="text-4xl md:text-5xl font-bold text-blue-600">🐷 유라의 가계부 (Yura's Piggy Bank) 🐷</h1>
            <p class="text-gray-500 mt-2">오늘의 똑똑한 선택이 내일의 멋진 유라를 만든다! Smart choices today create an amazing Yura tomorrow! Yura’s Dream Builder</p>
        </header>

        <!-- 잔액 및 요약 -->
        <section class="bg-white p-6 rounded-2xl shadow-lg mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div id="balanceDisplayContainer" class="cursor-pointer" title="초기 잔액 설정하기 (Set initial balance)">
                <h2 class="text-sm font-bold text-gray-500">현재 잔액 (Balance)</h2>
                <p id="balance" class="text-2xl font-bold text-blue-600">$0.00</p>
            </div>
            <div>
                <h2 class="text-sm font-bold text-gray-500">소비 점수 (Score)</h2>
                <p id="evaluationScore" class="text-2xl font-bold text-green-500">0</p>
            </div>
            <div>
                <h2 class="text-sm font-bold text-gray-500">은행 예금 (Savings)</h2>
                <p id="bankBalance" class="text-2xl font-bold text-indigo-500">$0.00</p>
            </div>
            <div>
                <h2 class="text-sm font-bold text-gray-500">총 기부액 (Donations)</h2>
                <p id="totalDonation" class="text-2xl font-bold text-pink-500">$0.00</p>
            </div>
        </section>

        <main class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 입력 폼 -->
            <div class="bg-white p-6 rounded-2xl shadow-lg">
                <!-- Tabs -->
                <div class="flex gap-2 mb-4">
                  <button id="goalTab" type="button" class="tab-btn px-3 py-2 rounded-lg bg-gray-100">🎯 목표</button>
                  <button id="incomeTab" type="button" class="tab-btn px-3 py-2 rounded-lg bg-gray-100">💰 수입</button>
                  <button id="expenseTab" type="button" class="tab-btn px-3 py-2 rounded-lg bg-gray-100">💸 지출</button>
                </div>

                <!-- 목표 폼 -->
                <div id="goalSection" class="">
                    <form id="goalForm">
                        <p class="text-center text-sm mb-4">갖고 싶은 것을 정하고 돈을 모아봐요!<br>(Set a goal and save up for it!)</p>
                        <div class="mb-3">
                            <label for="goalItem" class="font-bold">목표 항목 (Item)</label>
                            <input type="text" id="goalItem" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 레고 (e.g., LEGO)" required>
                        </div>
                        <div class="mb-3">
                            <label for="goalAmount" class="font-bold">목표 금액 (Amount)</label>
                            <input type="number" step="0.01" id="goalAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 75.00)" required>
                        </div>
                        <div class="mb-4">
                            <label for="goalDate" class="font-bold">목표 날짜 (Target Date)</label>
                            <input type="date" id="goalDate" class="w-full p-2 border rounded-lg mt-1" required>
                        </div>
                        <button type="submit" class="w-full bg-green-500 text-white font-bold p-3 rounded-lg hover:bg-green-600">목표 추가하기 (Add Goal)</button>
                    </form>
                    <div id="goalList" class="mt-4 space-y-2">
                        <!-- 목표 내역 -->
                    </div>
                    <div class="mt-6">
                        <h4 class="text-lg font-bold text-center text-green-700 mb-2">📒 목표 로그 (Goal Logs)</h4>
                        <ul id="goalLogsList" class="space-y-2"></ul>
                    </div>
                </div>

                <!-- 수입 폼 -->
                <div id="incomeSection" class="hidden">
                    <form id="incomeForm">
                        <div class="mb-4">
                            <label for="incomeSource" class="font-bold">어디서 생긴 돈인가요? (Source)</label>
                            <input type="text" id="incomeSource" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 할머니 용돈 (e.g., From Grandma)" required>
                        </div>
                        <div class="mb-4">
                            <label for="incomeAmount" class="font-bold">얼마인가요? (Amount)</label>
                            <input type="number" step="0.01" id="incomeAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 10.50)" required>
                        </div>
                        <button type="submit" class="w-full bg-blue-500 text-white font-bold p-3 rounded-lg hover:bg-blue-600">수입 기록하기 (Add Income)</button>
                    </form>
                    <hr class="my-6">
                    <div id="allowanceSection">
                        <h3 class="text-xl font-bold mb-4 text-center text-yellow-600">⚙️ 용돈 설정 (Allowance) ⚙️</h3>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <div class="mb-4">
                                <label for="allowanceAmount" class="font-bold">매주 받을 용돈 (Weekly Allowance)</label>
                                <input type="number" step="0.01" id="allowanceAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 5.00)">
                            </div>
                            <button id="setAllowanceButton" class="w-full bg-yellow-500 text-white font-bold p-3 rounded-lg hover:bg-yellow-600">용돈 설정하기 (Set Allowance)</button>
                        </div>
                    </div>
                </div>

                <!-- 지출 폼 -->
                <div id="expenseSection" class="hidden">
                    <form id="expenseForm">
                        <div class="mb-4">
                            <label for="expenseSource" class="font-bold">어디에 쓴 돈인가요? (Source)</label>
                            <input type="text" id="expenseSource" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 문구점 (e.g., Stationery Store)" required>
                        </div>
                        <div class="mb-4">
                            <label for="expenseAmount" class="font-bold">얼마인가요? (Amount)</label>
                            <input type="number" step="0.01" id="expenseAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 2.75)" required>
                        </div>
                        <div class="mb-4">
                            <label class="font-bold">어떤 지출이었나요? (Evaluation)</label>
                            <div class="flex justify-around mt-2">
                                <label class="text-center cursor-pointer"><input type="radio" name="evaluation" value="3" class="mr-1" checked>🤔 계획 (Planned)<br>(+3 pts)</label>
                                <label class="text-center cursor-pointer"><input type="radio" name="evaluation" value="0" class="mr-1">🏠 고정 (Fixed)<br>(0 pts)</label>
                                <label class="text-center cursor-pointer"><input type="radio" name="evaluation" value="-3" class="mr-1">😲 충동 (Impulse)<br>(-3 pts)</label>
                            </div>
                        </div>
                        <button type="submit" class="w-full bg-red-500 text-white font-bold p-3 rounded-lg hover:bg-red-600">지출 기록하기 (Add Expense)</button>
                    </form>
                </div>

                <!-- 기부 폼 (통합) -->
                <div id="donationSection" class="mt-4">
                     <h3 class="text-xl font-bold mb-4 text-center text-pink-600">💖 기부 (Donation) 💖</h3>
                    <div class="mb-4">
                        <label for="donationSource" class="font-bold">어디에 기부했나요? (To)</label>
                        <input type="text" id="donationSource" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 유니세프 (e.g., UNICEF)">
                    </div>
                    <div class="mb-4">
                        <label for="donationAmount" class="font-bold">얼마를 기부했나요? (Amount)</label>
                        <input type="number" step="0.01" id="donationAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 1.00)">
                    </div>
                    <button type="button" id="addDonationButton" class="w-full bg-pink-500 text-white font-bold p-3 rounded-lg hover:bg-pink-600">기부 기록하기 (Add Donation)</button>
                </div>
            </div>

            <!-- 거래 내역 -->
            <section class="mt-8 bg-white p-6 rounded-2xl shadow-lg md:col-span-2">
                <div class="flex justify-center border-b mb-4">
                    <button id="listViewTab" class="view-tab flex-1 p-2 font-bold focus:outline-none active">📋 목록 (List)</button>
                    <button id="graphViewTab" class="view-tab flex-1 p-2 font-bold focus:outline-none">📊 그래프 (Graph)</button>
                </div>
                <!-- 목록 보기 -->
                <div id="listViewContainer">
                    <h3 class="text-xl font-bold mb-4 text-center">💰 돈의 흐름 (Cash Flow) 💸</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <h4 class="text-lg font-bold text-center text-blue-600 mb-2">수입 (Income)</h4>
                            <ul id="incomeList" class="space-y-2"></ul>
                            <div class="mt-2 pt-2 border-t font-bold text-right">
                                총 수입: <span id="totalIncome" class="text-blue-600">$0.00</span>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-center text-red-600 mb-2">지출 및 기부 (Expenses)</h4>
                            <ul id="expenseList" class="space-y-2"></ul>
                             <div class="mt-2 pt-2 border-t font-bold text-right">
                                총 지출: <span id="totalExpense" class="text-red-600">$0.00</span>
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <h4 class="text-lg font-bold text-center text-gray-700 mb-2">남은 돈 (Net)</h4>
                            <div id="balanceSheet" class="flex flex-col items-center justify-center flex-grow bg-gray-100 rounded-lg">
                                <p id="balanceSheetAmount" class="text-2xl font-bold text-purple-600">$0.00</p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 그래프 보기 -->
                <div id="graphViewContainer" class="hidden">
                     <h3 class="text-xl font-bold mb-4 text-center">📈 돈의 흐름 그래프 (Cash Flow Graph) 📉</h3>
                    <div class="h-80">
                        <canvas id="transactionChart"></canvas>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Password Modal -->
    <div id="passwordModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <h2 class="text-2xl font-bold mb-4 text-center">관리자 메뉴 (Admin Menu)</h2>
            <form id="passwordForm">
                <input type="password" id="passwordInput" class="w-full p-3 border rounded-lg" placeholder="Password" required>
                <div class="flex justify-between mt-6">
                    <button type="button" id="closePasswordModalButton" class="bg-gray-300 text-gray-800 font-bold p-3 rounded-lg w-1/2 mr-2 hover:bg-gray-400">닫기 (Close)</button>
                    <button type="submit" class="bg-blue-500 text-white font-bold p-3 rounded-lg w-1/2 ml-2 hover:bg-blue-600">확인 (Submit)</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Amount Modal -->
    <div id="amountModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <h2 class="text-2xl font-bold mb-4 text-center">초기 잔액 입력 (Enter Initial Balance)</h2>
            <form id="amountForm">
                <input type="number" step="0.01" id="amountInput" class="w-full p-3 border rounded-lg" placeholder="금액 (e.g., 100.00)" required>
                <div class="flex justify-between mt-6">
                    <button type="button" id="closeAmountModalButton" class="bg-gray-300 text-gray-800 font-bold p-3 rounded-lg w-1/2 mr-2 hover:bg-gray-400">닫기 (Close)</button>
                    <button type="submit" class="bg-green-500 text-white font-bold p-3 rounded-lg w-1/2 ml-2 hover:bg-green-600">설정 (Set)</button>
                </div>
            </form>
        </div>
    </div>

    <script>
// Clean JS only (no HTML). Handles tabs, views, forms, deposits (simple interest), and optional cloud sync.

(() => {
  // Utilities
  const STORAGE_KEY = 'yura_finance_state_v1';
  const uid = () => Math.random().toString(36).slice(2, 10);
  const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
  const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

  const defaultState = () => ({
    incomes: [],
    expenses: [],
    deposits: [],
    goals: [],
    goalLogs: [],
    bankBalance: 0,
    evaluationScore: 0
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      return {
        ...defaultState(),
        ...s,
        incomes: s.incomes || [],
        expenses: s.expenses || [],
        deposits: s.deposits || [],
        goals: s.goals || [],
        goalLogs: s.goalLogs || [],
        bankBalance: typeof s.bankBalance === 'number' ? s.bankBalance : 0,
        evaluationScore: typeof s.evaluationScore === 'number' ? s.evaluationScore : 0
      };
    } catch {
      return defaultState();
    }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    cloudSave();
  }

  // DOM
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

  const balanceEl = document.getElementById('balance');
  const bankBalanceEl = document.getElementById('bankBalance');
  const evaluationScoreEl = document.getElementById('evaluationScore');
  const totalDonationEl = document.getElementById('totalDonation');
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const balanceSheetAmountEl = document.getElementById('balanceSheetAmount');

  const incomeList = document.getElementById('incomeList');
  const expenseList = document.getElementById('expenseList');
  const depositList = document.getElementById('depositList');
  const goalList = document.getElementById('goalList');
  const goalLogsList = document.getElementById('goalLogsList');

  // Safety: ensure tab/view buttons never submit forms
  goalTab?.setAttribute('type', 'button');
  incomeTab?.setAttribute('type', 'button');
  expenseTab?.setAttribute('type', 'button');
  listViewTab?.setAttribute('type', 'button');
  graphViewTab?.setAttribute('type', 'button');

  // Tabs
  function setActiveTab(tabBtn) {
    [goalTab, incomeTab, expenseTab].forEach(b => b?.classList.remove('active'));
    tabBtn?.classList.add('active');
    goalSection?.classList.add('hidden');
    incomeSection?.classList.add('hidden');
    expenseSection?.classList.add('hidden');
    if (tabBtn === goalTab) goalSection?.classList.remove('hidden');
    if (tabBtn === incomeTab) incomeSection?.classList.remove('hidden');
    if (tabBtn === expenseTab) expenseSection?.classList.remove('hidden');
  }
  goalTab?.addEventListener('click', () => setActiveTab(goalTab));
  incomeTab?.addEventListener('click', () => setActiveTab(incomeTab));
  expenseTab?.addEventListener('click', () => setActiveTab(expenseTab));

  // Views
  function setActiveView(viewBtn) {
    [listViewTab, graphViewTab].forEach(b => b?.classList.remove('active'));
    viewBtn?.classList.add('active');
    const showGraph = viewBtn === graphViewTab;
    listViewContainer?.classList.toggle('hidden', showGraph);
    graphViewContainer?.classList.toggle('hidden', !showGraph);
    if (showGraph) renderChart();
  }
  listViewTab?.addEventListener('click', () => setActiveView(listViewTab));
  graphViewTab?.addEventListener('click', () => setActiveView(graphViewTab));

  // Forms
  document.getElementById('incomeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.getElementById('incomeSource').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value || '0');
    if (!source || !amount || amount <= 0) return;
    state.incomes.push({ id: uid(), source, amount, date: toISODate() });
    saveState(); renderAll(); e.target.reset();
  });

  document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.getElementById('expenseSource').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value || '0');
    const evalVal = Number((document.querySelector('input[name="evaluation"]:checked') || {}).value || 0);
    if (!source || !amount || amount <= 0) return;
    state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: evalVal, isDonation: false });
    saveState(); renderAll(); e.target.reset();
  });

  document.getElementById('addDonationButton')?.addEventListener('click', () => {
    const source = document.getElementById('donationSource').value.trim();
    const amount = parseFloat(document.getElementById('donationAmount').value || '0');
    if (!source || !amount || amount <= 0) return;
    state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: 0, isDonation: true });
    saveState(); renderAll();
    document.getElementById('donationSource').value = '';
    document.getElementById('donationAmount').value = '';
  });

  document.getElementById('goalForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const item = document.getElementById('goalItem').value.trim();
    const amount = parseFloat(document.getElementById('goalAmount').value || '0');
    const date = document.getElementById('goalDate').value;
    if (!item || !amount || amount <= 0 || !date) return;
    const g = { id: uid(), item, amount, date, achieved: false };
    state.goals.push(g);
    logGoal('add', g);
    saveState(); renderAll(); e.target.reset();
  });

  // Deposits (simple interest 1% per day)
  const depositAmountInput = document.getElementById('depositAmount');
  const depositPeriodInput = document.getElementById('depositPeriod');
  const interestPreview = document.getElementById('interestPreview');
  const toIntDays = (v) => {
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? Math.max(1, Math.round(n)) : 1;
  };
  function updateInterestPreview() {
    const amt = Number(depositAmountInput?.value || 0);
    const days = toIntDays(depositPeriodInput?.value || 0);
    if (!amt || !days) { if (interestPreview) interestPreview.textContent=''; return; }
    const interest = amt * 0.01 * days;
    const finalAmt = amt + interest;
    if (interestPreview) interestPreview.textContent = `예상 이자(단리): ${money(interest)} → 만기: ${money(finalAmt)} (기간: ${days}일)`;
  }
  depositAmountInput?.addEventListener('input', updateInterestPreview);
  depositPeriodInput?.addEventListener('input', updateInterestPreview);
  document.getElementById('depositButton')?.addEventListener('click', () => {
    const amt = Number(depositAmountInput?.value || 0);
    const days = toIntDays(depositPeriodInput?.value || 0);
    if (amt <= 0 || days <= 0) return;
    state.deposits.push({ id: uid(), amount: amt, period: days, date: toISODate() });
    state.bankBalance = state.deposits.reduce((a, c) => a + Number(c.amount || 0), 0);
    saveState(); renderAll();
    if (depositAmountInput) depositAmountInput.value = '';
    if (depositPeriodInput) depositPeriodInput.value = '';
    if (interestPreview) interestPreview.textContent = '';
  });

  // Goal logs render
  function logGoal(action, payload) {
    state.goalLogs.unshift({
      id: uid(),
      action,
      item: payload.item,
      amount: Number(payload.amount) || 0,
      targetDate: payload.date || null,
      at: new Date().toISOString()
    });
  }
  function renderGoalLogs() {
    if (!goalLogsList) return;
    if (!state.goalLogs.length) { goalLogsList.innerHTML = '<li class="text-center text-gray-500">기록이 없습니다.</li>'; return; }
    goalLogsList.innerHTML = state.goalLogs.map(log => {
      const ts = new Date(log.at).toLocaleString();
      const td = log.targetDate ? ` (목표일: ${log.targetDate})` : '';
      const label = log.action === 'add' ? '추가' : log.action === 'achieve' ? '획득' : '삭제';
      return `<li class="p-2 rounded-lg bg-green-50 text-sm">[${label}] ${log.item} - ${money(log.amount)}${td} • ${ts}</li>`;
    }).join('');
  }

  // Rendering
  function recalc() {
    const totalIncome = state.incomes.reduce((a, c) => a + Number(c.amount || 0), 0);
    const totalExpense = state.expenses.reduce((a, c) => a + Number(c.amount || 0), 0);
    const totalDonation = state.expenses.filter(x => x.isDonation).reduce((a, c) => a + Number(c.amount || 0), 0);
    const evalScore = state.expenses.reduce((a, c) => a + (Number(c.evaluation) || 0), 0);

    if (evaluationScoreEl) evaluationScoreEl.textContent = evalScore;
    if (totalDonationEl) totalDonationEl.textContent = money(totalDonation);
    if (totalIncomeEl) totalIncomeEl.textContent = money(totalIncome);
    if (totalExpenseEl) totalExpenseEl.textContent = money(totalExpense);
    if (bankBalanceEl) bankBalanceEl.textContent = money(state.bankBalance);

    const net = totalIncome - totalExpense;
    if (balanceEl) balanceEl.textContent = money(net);
    if (balanceSheetAmountEl) balanceSheetAmountEl.textContent = money(net);
  }
  function renderIncomes() {
    if (!incomeList) return;
    incomeList.innerHTML = state.incomes.map(x => `<li class="p-2 bg-blue-50 rounded-lg">${x.source} • ${money(x.amount)} • ${x.date||''}</li>`).join('');
  }
  function renderExpenses() {
    if (!expenseList) return;
    expenseList.innerHTML = state.expenses.map(x => `<li class="p-2 bg-red-50 rounded-lg">${x.isDonation?'💖 ':''}${x.source} • ${money(x.amount)} • ${x.date||''}</li>`).join('');
  }
  function renderDeposits() {
    if (!depositList) return;
    depositList.innerHTML = state.deposits.map(x => `<div class="p-2 bg-indigo-50 rounded-lg">💼 ${money(x.amount)} • ${x.period||0}일 • ${x.date||''}</div>`).join('');
  }
  function renderGoals() {
    if (!goalList) return;
    goalList.innerHTML = state.goals.map(g => `<div class="p-2 rounded-lg ${g.achieved?'bg-gray-100':'bg-green-50'}">🎯 ${g.item} • ${money(g.amount)}${g.date?' • '+g.date:''}</div>`).join('');
  }
  function renderAll() {
    recalc(); renderIncomes(); renderExpenses(); renderDeposits(); renderGoals(); renderGoalLogs();
    if (graphViewContainer && !graphViewContainer.classList.contains('hidden')) renderChart();
  }

  // Chart
  let chart;
  function datasetFromTransactions() {
    const txs = [];
    state.incomes.forEach(x => txs.push({ date: x.date, delta: Number(x.amount)||0 }));
    state.expenses.forEach(x => txs.push({ date: x.date, delta: -1*(Number(x.amount)||0) }));
    if (!txs.length) return [];
    txs.sort((a,b) => new Date(a.date) - new Date(b.date));
    let cum = 0;
    return txs.map(t => { cum += t.delta; return { x: new Date(t.date), y: cum }; });
  }
  function renderChart() {
    const canvas = document.getElementById('transactionChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const data = datasetFromTransactions();
    if (chart) { chart.destroy(); chart = null; }
    if (!data.length) return;
    chart = new Chart(canvas, {
      type: 'line',
      data: { datasets: [{ label: '누적 잔액', data, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)', fill: true, tension: 0.2, pointRadius: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, parsing: false, scales: { x: { type: 'time', time: { unit: 'day' } } } }
    });
  }

  // Init
  renderAll();
  setActiveView(listViewTab);
  // Always start on Goals tab
  setTimeout(() => setActiveTab(goalTab), 0);

  // ===== Optional: Cloud sync (Firestore) =====
  const ENABLE_CLOUD_SYNC = false; // true 로 바꾸고 firebaseConfig 채우면 기기간 동기화
  const firebaseConfig = {
    // apiKey: "", authDomain: "", projectId: ""
  };
  let _cloudReady = false, _docRef = null;
  function loadScript(src) {
    return new Promise((res, rej) => { const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
  }
  async function initCloudSync() {
    if (!ENABLE_CLOUD_SYNC) return;
    try {
      await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
      const app = firebase.initializeApp(firebaseConfig);
      const db = firebase.firestore();
      _docRef = db.collection('yura_finance').doc('state');
      const snap = await _docRef.get();
      if (snap.exists && snap.data()) {
        state = { ...defaultState(), ...snap.data() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        renderAll();
      } else {
        await _docRef.set(state);
      }
      _docRef.onSnapshot(doc => {
        if (!doc.exists) return;
        const remote = doc.data();
        if (JSON.stringify(remote) === JSON.stringify(state)) return;
        state = { ...defaultState(), ...remote };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        renderAll();
      });
      _cloudReady = true;
    } catch (e) { console.warn('Cloud sync init failed:', e); }
  }
  function cloudSave() {
    if (!_cloudReady || !_docRef) return;
    _docRef.set(state).catch(err => console.warn('Cloud save failed:', err));
  }
  initCloudSync();
})();
    </script>
</body>
</html>

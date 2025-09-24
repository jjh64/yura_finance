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
        .tab-btn.active {
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
            <p class="text-gray-500 mt-2">오늘의 똑똑한 선택이 내일의 멋진 유라를 만든다! Smart choices today create an amazing Yura tomorrow! Yura's Dream Builder</p>
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
            <!-- 왼쪽 패널: 입력 폼 -->
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
            </div>

            <!-- 오른쪽 패널: 저축 은행 섹션 -->
            <div class="bg-white p-6 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4 text-center text-indigo-600">🏦 저축 은행 (Savings Bank)</h3>
                <div class="bg-indigo-50 p-4 rounded-lg mb-4">
                    <p class="text-center mb-2">단리 1%/일 (Simple Interest)</p>
                    <div class="my-4">
                        <label for="depositAmount" class="font-bold">맡길 금액 (Amount)</label>
                        <input id="depositAmount" type="number" step="0.01" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 50.00">
                    </div>
                    <div class="mb-4">
                        <label for="depositPeriod" class="font-bold">맡길 기간(일) (Days)</label>
                        <input id="depositPeriod" type="number" min="1" step="1" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 30">
                    </div>
                    <p id="interestPreview" class="text-center mb-4 font-bold text-indigo-600 min-h-[1.5rem]"></p>
                    <button id="depositButton" type="button" class="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg hover:bg-indigo-600">예금하기 (Deposit)</button>
                </div>
                <div id="depositList" class="space-y-2 max-h-60 overflow-y-auto"></div>
            </div>

            <!-- 거래 내역 (전체 넓이) -->
            <section class="bg-white p-6 rounded-2xl shadow-lg md:col-span-2">
                <div class="flex justify-center border-b mb-4">
                    <button id="listViewTab" type="button" class="view-tab flex-1 p-2 font-bold focus:outline-none active">📋 목록 (List)</button>
                    <button id="graphViewTab" type="button" class="view-tab flex-1 p-2 font-bold focus:outline-none">📊 그래프 (Graph)</button>
                </div>
                <!-- 목록 보기 -->
                <div id="listViewContainer">
                    <h3 class="text-xl font-bold mb-4 text-center">💰 돈의 흐름 (Cash Flow) 💸</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <h4 class="text-lg font-bold text-center text-blue-600 mb-2">수입 (Income)</h4>
                            <ul id="incomeList" class="space-y-2 max-h-60 overflow-y-auto"></ul>
                            <div class="mt-2 pt-2 border-t font-bold text-right">
                                총 수입: <span id="totalIncome" class="text-blue-600">$0.00</span>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-center text-red-600 mb-2">지출 및 기부 (Expenses)</h4>
                            <ul id="expenseList" class="space-y-2 max-h-60 overflow-y-auto"></ul>
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

    <!-- app.js 스크립트 참조 -->
    <script src="app.js"></script>
</body>
</html>
<script>
// 순수 JavaScript 코드만 포함 - HTML 코드 없음
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
      
      state.incomes.push({
        id: uid(),
        source,
        amount,
        date: toISODate()
      });
      
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
      
      state.expenses.push({
        id: uid(),
        source,
        amount,
        date: toISODate(),
        evaluation: evalValue,
        isDonation: false
      });
      
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
      
      state.expenses.push({
        id: uid(),
        source,
        amount,
        date: toISODate(),
        evaluation: 0,
        isDonation: true
      });
      
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
      
      const goal = {
        id: uid(),
        item,
        amount,
        date,
        achieved: false
      };
      
      state.goals.push(goal);
      logGoal('add', goal);
      
      saveState();
      renderAll();
      e.target.reset();
    });
  }

  // 목표 로그 기록
  function logGoal(action, goal) {
    state.goalLogs.unshift({
      id: uid(),
      action,
      item: goal.item,
      amount: Number(goal.amount),
      targetDate: goal.date,
      at: new Date().toISOString()
    });
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
    
    // 단리: 원금 × 이율 × 기간
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
      
      state.deposits.push({
        id: uid(),
        amount,
        period,
        date: toISODate()
      });
      
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
    const totalDonation = state.expenses
      .filter(exp => exp.isDonation)
      .reduce((sum, don) => sum + Number(don.amount || 0), 0);
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
    
    incomeList.innerHTML = state.incomes.map(income => `
      <li class="p-2 bg-blue-50 rounded-lg">
        ${income.source} • ${money(income.amount)} • ${income.date || ''}
      </li>
    `).join('');
  }
  
  function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;
    
    expenseList.innerHTML = state.expenses.map(expense => `
      <li class="p-2 bg-red-50 rounded-lg">
        ${expense.isDonation ? '💖 ' : ''}${expense.source} • ${money(expense.amount)} • ${expense.date || ''}
      </li>
    `).join('');
  }
  
  function renderDeposits() {
    const depositList = document.getElementById('depositList');
    if (!depositList) return;
    
    depositList.innerHTML = state.deposits.map(deposit => `
      <div class="p-2 bg-indigo-50 rounded-lg">
        💼 ${money(deposit.amount)} • ${deposit.period || 0}일 • ${deposit.date || ''}
      </div>
    `).join('');
  }
  
  function renderGoals() {
    const goalList = document.getElementById('goalList');
    if (!goalList) return;
    
    goalList.innerHTML = state.goals.map(goal => `
      <div class="p-2 rounded-lg ${goal.achieved ? 'bg-gray-100' : 'bg-green-50'}">
        🎯 ${goal.item} • ${money(goal.amount)} ${goal.date ? '• ' + goal.date : ''}
      </div>
    `).join('');
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
      const action = log.action === 'add' ? '추가' : 
                    log.action === 'achieve' ? '획득' : '삭제';
      
      return `
        <li class="p-2 rounded-lg bg-green-50 text-sm">
          [${action}] ${log.item} - ${money(log.amount)}${targetDate} • ${timestamp}
        </li>
      `;
    }).join('');
  }
  
  // 차트 렌더링
  function renderChart() {
    const canvas = document.getElementById('transactionChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // 차트 데이터 준비
    const transactions = [];
    state.incomes.forEach(inc => transactions.push({
      date: inc.date,
      amount: Number(inc.amount || 0)
    }));
    
    state.expenses.forEach(exp => transactions.push({
      date: exp.date,
      amount: -Number(exp.amount || 0)
    }));
    
    if (!transactions.length) return;
    
    // 날짜순 정렬
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 누적 계산
    let cumulative = 0;
    const chartData = transactions.map(tx => {
      cumulative += tx.amount;
      return {
        x: new Date(tx.date),
        y: cumulative
      };
    });
    
    // 기존 차트 파괴
    if (window.financeChart) {
      window.financeChart.destroy();
    }
    
    // 새 차트 생성
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
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        }
      }
    });
  }
  
  // 초기화
  renderAll();
  setActiveView(listViewTab);
  setTimeout(() => setActiveTab(goalTab), 0);
})();
</script>

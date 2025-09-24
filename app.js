<!DOCTYPE html>ntListener('DOMContentLoaded', () => {
<html lang="ko"> persistence
<head>nst STORAGE_KEY = 'yura_finance_state_v1';
    <meta charset="UTF-8"> 'Wjsdbfk!2';
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>유라의 가계부 (Yura's Piggy Bank)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <style>oney = (n) => `$${(Number(n) || 0).toFixed(2)}`;
        body {
            font-family: 'Noto Sans KR', sans-serif;
        }urn {
        .tab-button.active { // {id, source, amount, date}
            background-color: #3B82F6;ource, amount, date, evaluation, isDonation}
            color: white;    // {id, amount, period, date}
        }oals: [],           // {id, item, amount, date, achieved, achievedAt}
        .view-tab.active {   // {id, action, item, amount, targetDate, at}
            border-bottom: 3px solid #3B82F6;
            color: #3B82F6;
        }
    </style>
</head>ction loadState() {
<body class="bg-blue-50 text-gray-800">
        const raw = localStorage.getItem(STORAGE_KEY);
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
        <header class="text-center mb-8">
            <h1 class="text-4xl md:text-5xl font-bold text-blue-600">🐷 유라의 가계부 (Yura's Piggy Bank) 🐷</h1>
            <p class="text-gray-500 mt-2">오늘의 똑똑한 선택이 내일의 멋진 유라를 만든다! Smart choices today create an amazing Yura tomorrow! Yura’s Dream Builder</p>
        </header>s = s.expenses || [];
        s.deposits = s.deposits || [];
        <!-- 잔액 및 요약 -->s || [];
        <section class="bg-white p-6 rounded-2xl shadow-lg mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div id="balanceDisplayContainer" class="cursor-pointer" title="초기 잔액 설정하기 (Set initial balance)">
                <h2 class="text-sm font-bold text-gray-500">현재 잔액 (Balance)</h2>Score : 0;
                <p id="balance" class="text-2xl font-bold text-blue-600">$0.00</p>
            </div>
            <div>faultState();
                <h2 class="text-sm font-bold text-gray-500">소비 점수 (Score)</h2>
                <p id="evaluationScore" class="text-2xl font-bold text-green-500">0</p>
            </div>tate() {
            <div>e.setItem(STORAGE_KEY, JSON.stringify(state));
                <h2 class="text-sm font-bold text-gray-500">은행 예금 (Savings)</h2>
                <p id="bankBalance" class="text-2xl font-bold text-indigo-500">$0.00</p>
            </div>esetState() {
            <div>aultState();
                <h2 class="text-sm font-bold text-gray-500">총 기부액 (Donations)</h2>
                <p id="totalDonation" class="text-2xl font-bold text-pink-500">$0.00</p>
            </div>
        </section>
    const incomeTab = document.getElementById('incomeTab');
        <main class="grid grid-cols-1 md:grid-cols-2 gap-8">;
            <!-- 입력 폼 -->ent.getElementById('goalTab');
            <div class="bg-white p-6 rounded-2xl shadow-lg">
                <!-- Tabs -->ument.getElementById('incomeSection');
                <div class="flex gap-2 mb-4">Id('expenseForm');
                  <button id="goalTab" type="button" class="tab-btn px-3 py-2 rounded-lg bg-gray-100">🎯 목표</button>
                  <button id="incomeTab" type="button" class="tab-btn px-3 py-2 rounded-lg bg-gray-100">💰 수입</button>
                  <button id="expenseTab" type="button" class="tab-btn px-3 py-2 rounded-lg bg-gray-100">💸 지출</button>
                </div> = document.getElementById('graphViewTab');
    const listViewContainer = document.getElementById('listViewContainer');
                <!-- 목표 폼 -->= document.getElementById('graphViewContainer');
                <div id="goalSection" class="">
                    <form id="goalForm">tById('balance');
                        <p class="text-center text-sm mb-4">갖고 싶은 것을 정하고 돈을 모아봐요!<br>(Set a goal and save up for it!)</p>
                        <div class="mb-3">ElementById('evaluationScore');
                            <label for="goalItem" class="font-bold">목표 항목 (Item)</label>
                            <input type="text" id="goalItem" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 레고 (e.g., LEGO)" required>
                        </div>ument.getElementById('totalExpense');
                        <div class="mb-3">getElementById('balanceSheetAmount');
                            <label for="goalAmount" class="font-bold">목표 금액 (Amount)</label>
                            <input type="number" step="0.01" id="goalAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 75.00)" required>
                        </div>nt.getElementById('expenseList');
                        <div class="mb-4">tById('depositList');
                            <label for="goalDate" class="font-bold">목표 날짜 (Target Date)</label>
                            <input type="date" id="goalDate" class="w-full p-2 border rounded-lg mt-1" required>
                        </div>
                        <button type="submit" class="w-full bg-green-500 text-white font-bold p-3 rounded-lg hover:bg-green-600">목표 추가하기 (Add Goal)</button>
                    </form>cument.getElementById('passwordForm');
                    <div id="goalList" class="mt-4 space-y-2">ut');
                        <!-- 목표 내역 -->ocument.getElementById('closePasswordModalButton');
                    </div>ocument.getElementById('adminActions');
                    <div class="mt-6">
                        <h4 class="text-lg font-bold text-center text-green-700 mb-2">📒 목표 로그 (Goal Logs)</h4>
                        <ul id="goalLogsList" class="space-y-2"></ul>
                    </div>cument.getElementById('amountInput');
                </div>odalButton = document.getElementById('closeAmountModalButton');

                <!-- 수입 폼 -->iner = document.getElementById('balanceDisplayContainer');
                <div id="incomeSection" class="hidden">
                    <form id="incomeForm">
                        <div class="mb-4">
                            <label for="incomeSource" class="font-bold">어디서 생긴 돈인가요? (Source)</label>
                            <input type="text" id="incomeSource" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 할머니 용돈 (e.g., From Grandma)" required>
                        </div>
                        <div class="mb-4">
                            <label for="incomeAmount" class="font-bold">얼마인가요? (Amount)</label>
                            <input type="number" step="0.01" id="incomeAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 10.50)" required>
                        </div>nseSection, some use expenseForm
                        <button type="submit" class="w-full bg-blue-500 text-white font-bold p-3 rounded-lg hover:bg-blue-600">수입 기록하기 (Add Income)</button>
                    </form>t.add('hidden');
                    <hr class="my-6">
                    <div id="allowanceSection">
                        <h3 class="text-xl font-bold mb-4 text-center text-yellow-600">⚙️ 용돈 설정 (Allowance) ⚙️</h3>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <div class="mb-4">n');
                                <label for="allowanceAmount" class="font-bold">매주 받을 용돈 (Weekly Allowance)</label>
                                <input type="number" step="0.01" id="allowanceAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 5.00)">
                            </div>
                            <button id="setAllowanceButton" class="w-full bg-yellow-500 text-white font-bold p-3 rounded-lg hover:bg-yellow-600">용돈 설정하기 (Set Allowance)</button>
                        </div>r('click', () => setActiveTab(incomeTab));
                    </div>stener('click', () => setActiveTab(expenseTab));
                </div>istener('click', () => setActiveTab(goalTab));

                <!-- 지출 폼 -->
                <div id="expenseSection" class="hidden">
                    <form id="expenseForm">tn => btn.classList.remove('active'));
                        <div class="mb-4">
                            <label for="expenseSource" class="font-bold">어디에 쓴 돈인가요? (Source)</label>
                            <input type="text" id="expenseSource" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 문구점 (e.g., Stationery Store)" required>
                        </div>ist.toggle('hidden', showGraph);
                        <div class="mb-4">'hidden', !showGraph);
                            <label for="expenseAmount" class="font-bold">얼마인가요? (Amount)</label>
                            <input type="number" step="0.01" id="expenseAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 2.75)" required>
                        </div>ner('click', () => setActiveView(listViewTab));
                        <div class="mb-4">, () => setActiveView(graphViewTab));
                            <label class="font-bold">어떤 지출이었나요? (Evaluation)</label>
                            <div class="flex justify-around mt-2">
                                <label class="text-center cursor-pointer"><input type="radio" name="evaluation" value="3" class="mr-1" checked>🤔 계획 (Planned)<br>(+3 pts)</label>
                                <label class="text-center cursor-pointer"><input type="radio" name="evaluation" value="0" class="mr-1">🏠 고정 (Fixed)<br>(0 pts)</label>
                                <label class="text-center cursor-pointer"><input type="radio" name="evaluation" value="-3" class="mr-1">😲 충동 (Impulse)<br>(-3 pts)</label>
                            </div>ove('hidden');
                        </div>
                        <button type="submit" class="w-full bg-red-500 text-white font-bold p-3 rounded-lg hover:bg-red-600">지출 기록하기 (Add Expense)</button>
                    .classList.add('hidden');
                        <hr class="my-6 border-t-2 border-dashed border-gray-200">
    function openAmountModal() {
                        <!-- 기부 폼 (통합) -->
                        <div id="donationSection" class="mt-4">
                             <h3 class="text-xl font-bold mb-4 text-center text-pink-600">💖 기부 (Donation) 💖</h3>
                            <div class="mb-4">
                                <label for="donationSource" class="font-bold">어디에 기부했나요? (To)</label>
                                <input type="text" id="donationSource" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 유니세프 (e.g., UNICEF)">
                            </div>ventListener('click', closePasswordModal);
                            <div class="mb-4">click', closeAmountModal);
                                <label for="donationAmount" class="font-bold">얼마를 기부했나요? (Amount)</label>
                                <input type="number" step="0.01" id="donationAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 1.00)">
                            </div>
                            <button type="button" id="addDonationButton" class="w-full bg-pink-500 text-white font-bold p-3 rounded-lg hover:bg-pink-600">기부 기록하기 (Add Donation)</button>
                        </div>
                    </form>
                </div>put.value !== ADMIN_PASSWORD) {
            </div>밀번호가 올바르지 않습니다.');
          return;
            <!-- 은행 및 설정 -->
            <div class="bg-white p-6 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4 text-center text-indigo-600">🏦 저축 은행 (Savings Bank) 🏦</h3>
                <div class="bg-indigo-50 p-4 rounded-lg">
                    <p class="text-center">돈을 맡기면 이자가 붙어요! (매일 1%)<br>(Earn interest on your deposits! 1% per day)</p>
                    <div class="my-4">ubmit', handler);
                        <label for="depositAmount" class="font-bold">맡길 금액 (Deposit Amount)</label>
                        <input type="number" step="0.01" id="depositAmount" class="w-full p-2 border rounded-lg mt-1" placeholder="금액 (e.g., 50.00)">
                    </div>initial balance when tapping current balance
                    <div class="mb-4">istener('click', () => {
                        <label for="depositPeriod" class="font-bold">맡길 기간 (일) (Period in Days)</label>
                        <input type="number" id="depositPeriod" class="w-full p-2 border rounded-lg mt-1"
       placeholder="예: 30 (e.g., 30)" min="1" step="1" inputmode="numeric" pattern="[0-9]*">
                    </div>value !== ADMIN_PASSWORD) {
                    <p id="interestPreview" class="text-center mb-4 font-bold text-indigo-600 min-h-[1.5rem]"></p>
                    <button id="depositButton" class="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg hover:bg-indigo-600">은행에 돈 맡기기 (Deposit)</button>
                </div>
                <div id="depositList" class="mt-4 space-y-2">
                    <!-- 예금 내역 -->든 데이터를 초기화하고 초기 잔액을 다시 설정할까요?');
                </div>
            </div>            <!-- 거래 내역 -->
            <section class="mt-8 bg-white p-6 rounded-2xl shadow-lg md:col-span-2">
                <div class="flex justify-center border-b mb-4">
                    <button id="listViewTab" class="view-tab flex-1 p-2 font-bold focus:outline-none active">📋 목록 (List)</button>
                    <button id="graphViewTab" class="view-tab flex-1 p-2 font-bold focus:outline-none">📊 그래프 (Graph)</button>
                </div>
          // Optional: show admin actions instead
                <!-- 목록 보기 -->ist.remove('hidden');
                <div id="listViewContainer">
                    <h3 class="text-xl font-bold mb-4 text-center">💰 돈의 흐름 (Cash Flow) 💸</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <h4 class="text-lg font-bold text-center text-blue-600 mb-2">수입 (Income)</h4>
                            <ul id="incomeList" class="space-y-2"></ul>
                            <div class="mt-2 pt-2 border-t font-bold text-right"> => {
                                총 수입: <span id="totalIncome" class="text-blue-600">$0.00</span>
                            </div>
                        </div>xportDataBtn')?.addEventListener('click', () => {
                        <div>
                            <h4 class="text-lg font-bold text-center text-red-600 mb-2">지출 및 기부 (Expenses)</h4>
                            <ul id="expenseList" class="space-y-2"></ul>
                             <div class="mt-2 pt-2 border-t font-bold text-right">
                                총 지출: <span id="totalExpense" class="text-red-600">$0.00</span>
                            </div>
                        </div>href);
                        <div class="flex flex-col">
                            <h4 class="text-lg font-bold text-center text-gray-700 mb-2">남은 돈 (Net)</h4>
                            <div id="balanceSheet" class="flex flex-col items-center justify-center flex-grow bg-gray-100 rounded-lg">
                                <p id="balanceSheetAmount" class="text-2xl font-bold text-purple-600">$0.00</p>
                            </div>
                        </div>mportFile')?.addEventListener('change', async (e) => {
                    </div>t.files?.[0];
                </div>n;
                
                <!-- 그래프 보기 -->.text();
                <div id="graphViewContainer" class="hidden">
                     <h3 class="text-xl font-bold mb-4 text-center">📈 돈의 흐름 그래프 (Cash Flow Graph) 📉</h3>
                    <div class="h-80">
                        <canvas id="transactionChart"></canvas>
                    </div>osits || [];
                </div>als || [];
            </section>.goalLogs || [];
        </main>alance = typeof s.bankBalance === 'number' ? s.bankBalance : 0;
    </div>evaluationScore = typeof s.evaluationScore === 'number' ? s.evaluationScore : 0;
        state = s;
    <!-- Password Modal -->
    <div id="passwordModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <h2 class="text-2xl font-bold mb-4 text-center">관리자 메뉴 (Admin Menu)</h2>
            <form id="passwordForm">세요.');
                <input type="password" id="passwordInput" class="w-full p-3 border rounded-lg" placeholder="Password" required>
                <div class="flex justify-between mt-6">
                    <button type="button" id="closePasswordModalButton" class="bg-gray-300 text-gray-800 font-bold p-3 rounded-lg w-1/2 mr-2 hover:bg-gray-400">닫기 (Close)</button>
                    <button type="submit" class="bg-blue-500 text-white font-bold p-3 rounded-lg w-1/2 ml-2 hover:bg-blue-600">확인 (Submit)</button>
                </div>
            </form> submit: set initial balance as an income entry
            <div id="adminActions" class="hidden mt-6">
                <h3 class="text-xl font-bold mb-4 text-center border-t pt-4">데이터 관리 (Data Management)</h3>
                <p class="text-center text-sm text-gray-600 mb-4">데이터를 파일로 저장하거나, 파일에서 불러올 수 있습니다.<br>(You can save data to a file or load it from a file.)</p>
                <div class="flex flex-col space-y-3">
                    <button id="setInitialBalanceBtn" class="w-full bg-green-500 text-white font-bold p-3 rounded-lg hover:bg-green-600">초기 잔액 설정 (Set Initial Balance)</button>
                    <button id="exportDataBtn" class="w-full bg-purple-500 text-white font-bold p-3 rounded-lg hover:bg-purple-600">데이터 내보내기 (Export Data)</button>
                    <button id="importDataBtn" class="w-full bg-orange-500 text-white font-bold p-3 rounded-lg hover:bg-orange-600">데이터 가져오기 (Import Data)</button>
                    <input type="file" id="importFile" class="hidden" accept=".json">
                </div>
            </div>
        </div>
    </div>owance
    document.getElementById('setAllowanceButton')?.addEventListener('click', () => {
    <!-- Amount Modal -->oat(document.getElementById('allowanceAmount')?.value || '0');
    <div id="amountModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <h2 class="text-2xl font-bold mb-4 text-center">초기 잔액 입력 (Enter Initial Balance)</h2>
            <form id="amountForm">
                <input type="number" step="0.01" id="amountInput" class="w-full p-3 border rounded-lg" placeholder="금액 (e.g., 100.00)" required>
                <div class="flex justify-between mt-6">
                    <button type="button" id="closeAmountModalButton" class="bg-gray-300 text-gray-800 font-bold p-3 rounded-lg w-1/2 mr-2 hover:bg-gray-400">닫기 (Close)</button>
                    <button type="submit" class="bg-green-500 text-white font-bold p-3 rounded-lg w-1/2 ml-2 hover:bg-green-600">설정 (Set)</button>
                </div>
            </form>= document.getElementById('incomeSource').value.trim();
        </div>ount = parseFloat(document.getElementById('incomeAmount').value || '0');
    </div>!source || isNaN(amount) || amount <= 0) return;
      state.incomes.push({ id: uid(), source, amount, date: toISODate() });
    <!-- 항목 수정 Modal -->rAll(); e.target.reset();
    <div id="editItemModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <h2 class="text-2xl font-bold mb-4 text-center">항목 수정 (Edit Item)</h2>
        <form id="editItemForm" class="space-y-4"> {
          <input type="hidden" id="editItemType">
          <input type="hidden" id="editItemId">xpenseSource').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value || '0');
          <div>lVal = Number((document.querySelector('input[name="evaluation"]:checked') || {}).value || 0);
            <label class="font-bold" for="editSource">항목/출처</label>
            <input type="text" id="editSource" class="w-full p-2 border rounded-lg mt-1">lVal, isDonation: false });
          </div>); renderAll(); e.target.reset();
    });
          <div>
            <label class="font-bold" for="editAmount">금액</label>
            <input type="number" step="0.01" id="editAmount" class="w-full p-2 border rounded-lg mt-1">
          </div>ce = document.getElementById('donationSource').value.trim();
      const amount = parseFloat(document.getElementById('donationAmount').value || '0');
          <div>ce || isNaN(amount) || amount <= 0) return;
            <label class="font-bold" for="editDate">날짜</label>oISODate(), evaluation: 0, isDonation: true });
            <input type="date" id="editDate" class="w-full p-2 border rounded-lg mt-1">
          </div>etElementById('donationSource').value = '';
      document.getElementById('donationAmount').value = '';
          <div id="editEvaluationGroup" class="hidden">
            <label class="font-bold" for="editEvaluation">지출 평가</label>
            <div class="flex justify-around mt-2">
              <label class="text-center cursor-pointer"><input type="radio" name="editEvaluation" value="3" class="mr-1">🤔 계획</label>
              <label class="text-center cursor-pointer"><input type="radio" name="editEvaluation" value="0" class="mr-1">🏠 고정</label>
              <label class="text-center cursor-pointer"><input type="radio" name="editEvaluation" value="-3" class="mr-1">😲 충동</label>
            </div> = parseFloat(document.getElementById('goalAmount').value || '0');
          </div> = document.getElementById('goalDate').value;
      if (!item || isNaN(amount) || amount <= 0 || !date) return;
          <div id="editPeriodGroup" class="hidden">hieved: false };
            <label class="font-bold" for="editPeriod">예금 기간 (일)</label>
            <input type="number" id="editPeriod" class="w-full p-2 border rounded-lg mt-1" placeholder="예: 30">
          </div>); renderAll(); e.target.reset();
    });
          <div class="flex justify-between pt-2">
            <button type="button" id="closeEditItemModalButton" class="bg-gray-300 text-gray-800 font-bold p-3 rounded-lg w-1/2 mr-2 hover:bg-gray-400">닫기</button>
            <button type="submit" class="bg-blue-600 text-white font-bold p-3 rounded-lg w-1/2 ml-2 hover:bg-blue-700">수정 완료</button>
          </div>typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''));
        </form>mber.isFinite(n) ? Math.max(1, Math.round(n)) : 1;
      </div>
    </div>
    // === Deposits (simple interest 1% per day) — keep this single block only ===
    <script src="app.js" defer></script>getElementById('depositAmount');
</body>st depositPeriodInput = document.getElementById('depositPeriod');
</html>st interestPreview = document.getElementById('interestPreview');

    function updateInterestPreview() {
      const amt = Number(depositAmountInput?.value || 0);
      const period = toIntDays(depositPeriodInput?.value || 0);
      if (!amt || !period) {
        if

document.addEventListener('DOMContentLoaded', () => {
    // State and persistence
    const STORAGE_KEY = 'yura_finance_state_v1';
    const ADMIN_PASSWORD = 'Wjsdbfk!2';

    let state = loadState();

    // Utilities
    const uid = () => Math.random().toString(36).slice(2, 10);
    const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
    const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

    function defaultState() {
      return {
        incomes: [],         // {id, source, amount, date}
        expenses: [],        // {id, source, amount, date, evaluation, isDonation}
        deposits: [],        // {id, amount, period, date}
        goals: [],           // {id, item, amount, date, achieved, achievedAt}
        goalLogs: [],        // {id, action, item, amount, targetDate, at}
        bankBalance: 0,
        evaluationScore: 0
      };
    }
    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        const s = JSON.parse(raw);
        // migration defaults
        s.incomes = s.incomes || [];
        s.expenses = s.expenses || [];
        s.deposits = s.deposits || [];
        s.goals = s.goals || [];
        s.goalLogs = s.goalLogs || [];
        s.bankBalance = typeof s.bankBalance === 'number' ? s.bankBalance : 0;
        s.evaluationScore = typeof s.evaluationScore === 'number' ? s.evaluationScore : 0;
        return s;
      } catch {
        return defaultState();
      }
    }
    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      cloudSave(); // no-op unless cloud sync enabled
    }
    function hardResetState() {
      state = defaultState();
      localStorage.removeItem(STORAGE_KEY);
    }

    // DOM refs
    const incomeTab = document.getElementById('incomeTab');
    const expenseTab = document.getElementById('expenseTab');
    const goalTab = document.getElementById('goalTab');

    const incomeSection = document.getElementById('incomeSection');
    const expenseForm = document.getElementById('expenseForm');
    const goalSection = document.getElementById('goalSection');

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

    const passwordModal = document.getElementById('passwordModal');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('passwordInput');
    const closePasswordModalButton = document.getElementById('closePasswordModalButton');
    const adminActions = document.getElementById('adminActions');

    const amountModal = document.getElementById('amountModal');
    const amountForm = document.getElementById('amountForm');
    const amountInput = document.getElementById('amountInput');
    const closeAmountModalButton = document.getElementById('closeAmountModalButton');

    const balanceDisplayContainer = document.getElementById('balanceDisplayContainer');

    // Tabs
    function setActiveTab(tab) {
      [incomeTab, expenseTab, goalTab].forEach(btn => btn?.classList.remove('active'));
      tab?.classList.add('active');

      // Hide all sections safely
      incomeSection?.classList.add('hidden');
      goalSection?.classList.add('hidden');
      // Some layouts use expenseSection, some use expenseForm
      document.getElementById('expenseSection')?.classList.add('hidden');
      expenseForm?.classList.add('hidden');

      if (tab === goalTab) {
        goalSection?.classList.remove('hidden');
      } else if (tab === incomeTab) {
        incomeSection?.classList.remove('hidden');
      } else if (tab === expenseTab) {
        (document.getElementById('expenseSection') || expenseForm)?.classList.remove('hidden');
      }
    }
    incomeTab?.addEventListener('click', () => setActiveTab(incomeTab));
    expenseTab?.addEventListener('click', () => setActiveTab(expenseTab));
    goalTab?.addEventListener('click', () => setActiveTab(goalTab));

    // Views
    function setActiveView(viewTab) {
      [listViewTab, graphViewTab].forEach(btn => btn.classList.remove('active'));
      viewTab.classList.add('active');

      const showGraph = viewTab === graphViewTab;
      listViewContainer.classList.toggle('hidden', showGraph);
      graphViewContainer.classList.toggle('hidden', !showGraph);
      if (showGraph) renderChart();
    }
    listViewTab?.addEventListener('click', () => setActiveView(listViewTab));
    graphViewTab?.addEventListener('click', () => setActiveView(graphViewTab));

    // Password modal helpers
    function openPasswordModal() {
      passwordInput.value = '';
      adminActions?.classList.add('hidden');
      passwordModal?.classList.remove('hidden');
    }
    function closePasswordModal() {
      passwordModal?.classList.add('hidden');
    }
    function openAmountModal() {
      amountInput.value = '';
      amountModal?.classList.remove('hidden');
    }
    function closeAmountModal() {
      amountModal?.classList.add('hidden');
    }
    closePasswordModalButton?.addEventListener('click', closePasswordModal);
    closeAmountModalButton?.addEventListener('click', closeAmountModal);

    // Password guard
    function passwordGuard(onOk) {
      openPasswordModal();
      const handler = (e) => {
        e.preventDefault();
        if (passwordInput.value !== ADMIN_PASSWORD) {
          alert('비밀번호가 올바르지 않습니다.');
          return;
        }
        passwordForm.removeEventListener('submit', handler);
        closePasswordModal();
        onOk && onOk();
      };
      passwordForm.addEventListener('submit', handler);
    }

    // Integrated reset + initial balance when tapping current balance
    balanceDisplayContainer?.addEventListener('click', () => {
      openPasswordModal();
      const onSubmit = (e) => {
        e.preventDefault();
        if (passwordInput.value !== ADMIN_PASSWORD) {
          alert('비밀번호가 올바르지 않습니다.');
          return;
        }
        passwordForm.removeEventListener('submit', onSubmit);
        const doReset = confirm('모든 데이터를 초기화하고 초기 잔액을 다시 설정할까요?');
        if (doReset) {
          hardResetState();
          saveState();
          renderAll();
          closePasswordModal();
          openAmountModal();
        } else {
          // Optional: show admin actions instead
          adminActions?.classList.remove('hidden');
        }
      };
      passwordForm.addEventListener('submit', onSubmit);
    });

    // Admin actions
    document.getElementById('setInitialBalanceBtn')?.addEventListener('click', () => {
      passwordGuard(() => openAmountModal());
    });
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
      passwordGuard(() => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `yura_finance_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    });
    document.getElementById('importDataBtn')?.addEventListener('click', () => {
      passwordGuard(() => document.getElementById('importFile').click());
    });
    document.getElementById('importFile')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const s = JSON.parse(text);
        // migration defaults
        s.incomes = s.incomes || [];
        s.expenses = s.expenses || [];
        s.deposits = s.deposits || [];
        s.goals = s.goals || [];
        s.goalLogs = s.goalLogs || [];
        s.bankBalance = typeof s.bankBalance === 'number' ? s.bankBalance : 0;
        s.evaluationScore = typeof s.evaluationScore === 'number' ? s.evaluationScore : 0;
        state = s;
        saveState();
        renderAll();
        alert('데이터를 불러왔습니다.');
      } catch (err) {
        alert('가져오기에 실패했습니다. 파일을 확인하세요.');
      } finally {
        e.target.value = '';
      }
    });

    // Amount modal submit: set initial balance as an income entry
    amountForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = parseFloat(amountInput.value || '0');
      if (!isNaN(v) && v >= 0) {
        state.incomes.push({ id: uid(), source: '초기 잔액', amount: v, date: toISODate() });
        saveState();
        renderAll();
        closeAmountModal();
      }
    });

    // Allowance
    document.getElementById('setAllowanceButton')?.addEventListener('click', () => {
      const amt = parseFloat(document.getElementById('allowanceAmount')?.value || '0');
      if (isNaN(amt) || amt <= 0) { alert('올바른 금액을 입력하세요.'); return; }
      state.allowanceWeekly = amt;
      saveState();
      alert('용돈 금액이 설정되었습니다.');
    });

    // Income form
    document.getElementById('incomeForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const source = document.getElementById('incomeSource').value.trim();
      const amount = parseFloat(document.getElementById('incomeAmount').value || '0');
      if (!source || isNaN(amount) || amount <= 0) return;
      state.incomes.push({ id: uid(), source, amount, date: toISODate() });
      saveState(); renderAll(); e.target.reset();
    });

    // Expense form
    expenseForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const source = document.getElementById('expenseSource').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value || '0');
      const evalVal = Number((document.querySelector('input[name="evaluation"]:checked') || {}).value || 0);
      if (!source || isNaN(amount) || amount <= 0) return;
      state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: evalVal, isDonation: false });
      saveState(); renderAll(); e.target.reset();
    });

    // Donation (integrated in Expense)
    document.getElementById('addDonationButton')?.addEventListener('click', () => {
      const source = document.getElementById('donationSource').value.trim();
      const amount = parseFloat(document.getElementById('donationAmount').value || '0');
      if (!source || isNaN(amount) || amount <= 0) return;
      state.expenses.push({ id: uid(), source, amount, date: toISODate(), evaluation: 0, isDonation: true });
      saveState(); renderAll();
      document.getElementById('donationSource').value = '';
      document.getElementById('donationAmount').value = '';
    });

    // Goals
    document.getElementById('goalForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = document.getElementById('goalItem').value.trim();
      const amount = parseFloat(document.getElementById('goalAmount').value || '0');
      const date = document.getElementById('goalDate').value;
      if (!item || isNaN(amount) || amount <= 0 || !date) return;
      const g = { id: uid(), item, amount, date, achieved: false };
      state.goals.push(g);
      logGoal('add', g);
      saveState(); renderAll(); e.target.reset();
    });

    // Helper to coerce integer days safely
    const toIntDays = (v) => {
      const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? Math.max(1, Math.round(n)) : 1;
    };

    // Deposit refs
    const depositAmountInput = document.getElementById('depositAmount');
    const depositPeriodInput = document.getElementById('depositPeriod');
    const interestPreview = document.getElementById('interestPreview');

    function updateInterestPreview() {
      const amt = Number(depositAmountInput?.value || 0);
      const period = toIntDays(depositPeriodInput?.value || 0);
      if (!amt || !period) {
        if (interestPreview) interestPreview.textContent = '';
        return;
      }
      // Simple interest: 1% per day
      const interest = amt * 0.01 * period;
      const finalAmt = amt + interest;
      if (interestPreview) {
        interestPreview.textContent = `예상 이자(단리): $${interest.toFixed(2)} → 만기: $${finalAmt.toFixed(2)} (기간: ${period}일)`;
      }
    }

    depositAmountInput?.addEventListener('input', updateInterestPreview);
    depositPeriodInput?.addEventListener('input', updateInterestPreview);

    document.getElementById('depositButton')?.addEventListener('click', () => {
      const amt = Number(depositAmountInput?.value || 0);
      const period = toIntDays(depositPeriodInput?.value || 0);
      if (amt <= 0 || period <= 0) return;

      // Save exactly the entered integer days
      state.deposits.push({ id: uid(), amount: amt, period, date: toISODate() });

      // Recompute bank balance from deposits
      state.bankBalance = state.deposits.reduce((a, c) => a + Number(c.amount || 0), 0);

      saveState();
      renderAll();

      // Reset inputs and preview
      if (depositAmountInput) depositAmountInput.value = '';
      if (depositPeriodInput) depositPeriodInput.value = '';
      if (interestPreview) interestPreview.textContent = '';
    });

    // If you render deposits elsewhere, ensure period is shown as saved:
    // renderDeposits() should use: ${x.period}일 without any math.

    // Goals
    document.getElementById('goalForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = document.getElementById('goalItem').value.trim();
      const amount = parseFloat(document.getElementById('goalAmount').value || '0');
      const date = document.getElementById('goalDate').value;
      if (!item || isNaN(amount) || amount <= 0 || !date) return;
      const g = { id: uid(), item, amount, date, achieved: false };
      state.goals.push(g);
      logGoal('add', g);
      saveState(); renderAll(); e.target.reset();
    });

    // Deposits
    const depositAmountInput = document.getElementById('depositAmount');
    const depositPeriodInput = document.getElementById('depositPeriod');
    const interestPreview = document.getElementById('interestPreview');

    function updateInterestPreview() {
      const amt = Number(depositAmountInput?.value || 0);
      const period = toIntDays(depositPeriodInput?.value || 0);
      if (!amt || !period) {
        if (interestPreview) interestPreview.textContent = '';
        return;
      }
      // Simple interest: 1% per day
      const interest = amt * 0.01 * period;
      const finalAmt = amt + interest;
      if (interestPreview) {
        interestPreview.textContent = `예상 이자(단리): $${interest.toFixed(2)} → 만기: $${finalAmt.toFixed(2)} (기간: ${period}일)`;
      }
    }

    depositAmountInput?.addEventListener('input', updateInterestPreview);
    depositPeriodInput?.addEventListener('input', updateInterestPreview);

    document.getElementById('depositButton')?.addEventListener('click', () => {
      const amt = Number(depositAmountInput?.value || 0);
      const period = toIntDays(depositPeriodInput?.value || 0);
      if (amt <= 0 || period <= 0) return;

      // Save exactly the entered integer days
      state.deposits.push({ id: uid(), amount: amt, period, date: toISODate() });

      // Recompute bank balance from deposits
      state.bankBalance = state.deposits.reduce((a, c) => a + Number(c.amount || 0), 0);

      saveState();
      renderAll();

      // Reset inputs and preview
      if (depositAmountInput) depositAmountInput.value = '';
      if (depositPeriodInput) depositPeriodInput.value = '';
      if (interestPreview) interestPreview.textContent = '';
    });

    // Goal logs
    function logGoal(action, payload) {
      state.goalLogs.unshift({
        id: uid(),
        action, // add | achieve | delete
        item: payload.item,
        amount: Number(payload.amount) || 0,
        targetDate: payload.date || payload.targetDate || null,
        at: new Date().toISOString()
      });
    }
    function renderGoalLogs() {
      if (!goalLogsList) return;
      if (!state.goalLogs.length) {
        goalLogsList.innerHTML = '<li class="text-center text-gray-500">기록이 없습니다.</li>';
        return;
      }
      goalLogsList.innerHTML = state.goalLogs.map(log => {
        const ts = new Date(log.at).toLocaleString();
        const td = log.targetDate ? ` (목표일: ${log.targetDate})` : '';
        const label = log.action === 'add' ? '추가' : log.action === 'achieve' ? '획득' : '삭제';
        return `<li class="p-2 rounded-lg bg-green-50 text-sm">[${label}] ${log.item} - ${money(log.amount)}${td} • ${ts}</li>`;
      }).join('');
    }

    // Renderers and recalc
    function recalc() {
      const totalIncome = state.incomes.reduce((a, c) => a + Number(c.amount || 0), 0);
      const totalExpense = state.expenses.reduce((a, c) => a + Number(c.amount || 0), 0);
      const totalDonation = state.expenses.filter(x => x.isDonation).reduce((a, c) => a + Number(c.amount || 0), 0);
      const evalScore = state.expenses.reduce((a, c) => a + (Number(c.evaluation) || 0), 0);

      evaluationScoreEl.textContent = evalScore;
      totalDonationEl.textContent = money(totalDonation);
      totalIncomeEl.textContent = money(totalIncome);
      totalExpenseEl.textContent = money(totalExpense);
      bankBalanceEl.textContent = money(state.bankBalance);

      const net = totalIncome - totalExpense; // bank is shown separately
      balanceEl.textContent = money(net);
      balanceSheetAmountEl.textContent = money(net);
    }

    function renderIncomes() {
      if (!incomeList) return;
      incomeList.innerHTML = state.incomes.map(x => `
        <li class="p-2 bg-blue-50 rounded-lg flex justify-between items-center" data-id="${x.id}">
          <span>${x.source} • ${money(x.amount)} • ${x.date || ''}</span>
          <span class="flex gap-2">
            <button class="text-blue-700" data-action="edit" data-type="income" aria-label="edit">✏️</button>
            <button class="text-red-600" data-action="delete" data-type="income" aria-label="delete">🗑️</button>
          </span>
        </li>
      `).join('');
    }
    function renderExpenses() {
      if (!expenseList) return;
      expenseList.innerHTML = state.expenses.map(x => `
        <li class="p-2 bg-red-50 rounded-lg flex justify-between items-center" data-id="${x.id}">
          <span>${x.isDonation ? '💖 ' : ''}${x.source} • ${money(x.amount)} • ${x.date || ''}</span>
          <span class="flex gap-2">
            <button class="text-blue-700" data-action="edit" data-type="expense" aria-label="edit">✏️</button>
            <button class="text-red-600" data-action="delete" data-type="expense" aria-label="delete">🗑️</button>
          </span>
        </li>
      `).join('');
    }
    function renderDeposits() {
      if (!depositList) return;
      depositList.innerHTML = state.deposits.map(x => `
        <div class="p-3 bg-indigo-50 rounded-lg flex justify-between items-center" data-id="${x.id}">
          <span>💼 ${money(x.amount)} • ${x.period || 0}일 • ${x.date || ''}</span>
          <span class="flex gap-2">
            <button class="text-blue-700" data-action="edit" data-type="deposit" aria-label="edit">✏️</button>
            <button class="text-red-600" data-action="delete" data-type="deposit" aria-label="delete">🗑️</button>
          </span>
        </div>
      `).join('');
    }
    function renderGoals() {
      if (!goalList) return;
      goalList.innerHTML = state.goals.map(g => `
        <div class="p-3 rounded-lg ${g.achieved ? 'bg-gray-100' : 'bg-green-50'} flex justify-between items-center" data-id="${g.id}">
          <span class="${g.achieved ? 'opacity-60 line-through' : ''}">🎯 ${g.item} • ${money(g.amount)}${g.date ? ' • ' + g.date : ''}</span>
          <span class="flex gap-2">
            ${g.achieved ? '' : '<button class="text-green-700" data-action="achieve" data-type="goal" aria-label="achieve">✅</button>'}
            <button class="text-blue-700" data-action="edit" data-type="goal" aria-label="edit">✏️</button>
            <button class="text-red-600" data-action="delete" data-type="goal" aria-label="delete">🗑️</button>
          </span>
        </div>
      `).join('');
    }

    function renderAll() {
      recalc();
      renderIncomes();
      renderExpenses();
      renderDeposits();
      renderGoals();
      renderGoalLogs();
    }

    // Edit modal
    const editItemModal = document.getElementById('editItemModal');
    const editItemForm = document.getElementById('editItemForm');
    const editItemTypeEl = document.getElementById('editItemType');
    const editItemIdEl = document.getElementById('editItemId');
    const editSourceEl = document.getElementById('editSource');
    const editAmountEl = document.getElementById('editAmount');
    const editDateEl = document.getElementById('editDate');
    const editEvaluationGroup = document.getElementById('editEvaluationGroup');
    const editPeriodGroup = document.getElementById('editPeriodGroup');
    const editPeriodEl = document.getElementById('editPeriod');
    const closeEditItemModalButton = document.getElementById('closeEditItemModalButton');

    // Make openEditModalFor safe if modal not present
    function openEditModalFor(type, id) {
      if (!editItemModal) {
        console.warn('Edit modal markup (#editItemModal) is missing in index.html');
        return;
      }
      editItemTypeEl.value = type;
      editItemIdEl.value = id;
      editEvaluationGroup.classList.add('hidden');
      editPeriodGroup.classList.add('hidden');

      let item;
      if (type === 'income') item = state.incomes.find(x => x.id === id);
      if (type === 'expense') item = state.expenses.find(x => x.id === id);
      if (type === 'deposit') item = state.deposits.find(x => x.id === id);
      if (type === 'goal') item = state.goals.find(x => x.id === id);
      if (!item) return;

      if (type === 'income' || type === 'expense') {
        editSourceEl.value = item.source || '';
      } else if (type === 'goal') {
        editSourceEl.value = item.item || '';
      } else if (type === 'deposit') {
        editSourceEl.value = '예금';
        editPeriodGroup.classList.remove('hidden');
        editPeriodEl.value = item.period || 0;
      }
      editAmountEl.value = Number(item.amount || 0);
      editDateEl.value = (item.date && item.date.length === 10) ? item.date : toISODate(item.date);

      if (type === 'expense') {
        editEvaluationGroup.classList.remove('hidden');
        const radios = editItemForm.querySelectorAll('input[name="editEvaluation"]');
        radios.forEach(r => r.checked = (String(item.evaluation ?? 0) === r.value));
      }
      editItemModal.classList.remove('hidden');
    }
    function closeEditModal() { editItemModal.classList.add('hidden'); }
    closeEditItemModalButton?.addEventListener('click', closeEditModal);

    editItemForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = editItemTypeEl.value;
      const id = editItemIdEl.value;

      passwordGuard(() => {
        let coll;
        if (type === 'income') coll = state.incomes;
        if (type === 'expense') coll = state.expenses;
        if (type === 'deposit') coll = state.deposits;
        if (type === 'goal') coll = state.goals;

        const idx = coll.findIndex(x => x.id === id);
        if (idx < 0) return;

        if (type === 'income') {
          coll[idx] = { ...coll[idx], source: editSourceEl.value.trim(), amount: parseFloat(editAmountEl.value || '0'), date: editDateEl.value || toISODate() };
        } else if (type === 'expense') {
          const evalVal = Number((editItemForm.querySelector('input[name="editEvaluation"]:checked') || {}).value || 0);
          coll[idx] = { ...coll[idx], source: editSourceEl.value.trim(), amount: parseFloat(editAmountEl.value || '0'), date: editDateEl.value || toISODate(), evaluation: evalVal };
        } else if (type === 'deposit') {
          const period = parseInt(editPeriodEl.value || '0', 10);
          coll[idx] = { ...coll[idx], amount: parseFloat(editAmountEl.value || '0'), period, date: editDateEl.value || toISODate() };
          state.bankBalance = state.deposits.reduce((a, c) => a + Number(c.amount || 0), 0);
        } else if (type === 'goal') {
          const old = coll[idx];
          coll[idx] = { ...coll[idx], item: editSourceEl.value.trim(), amount: parseFloat(editAmountEl.value || '0'), date: editDateEl.value || toISODate() };
          // Log as an edit (reuse 'add' label for simplicity)
          logGoal('add', coll[idx]);
          // If already achieved, keep achieved flags
          if (old.achieved) { coll[idx].achieved = true; coll[idx].achievedAt = old.achievedAt; }
        }

        saveState();
        renderAll();
        closeEditModal();
      });
    });

    // Delegation for edit/delete/achieve
    function attachDelegation(root, type) {
      if (!root) return;
      root.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.closest('[data-id]')?.dataset.id;
        if (!id) return;

        if (action === 'edit') { openEditModalFor(type, id); return; }

        if (action === 'delete') {
          passwordGuard(() => {
            const coll = type === 'income' ? state.incomes
                        : type === 'expense' ? state.expenses
                        : type === 'deposit' ? state.deposits
                        : state.goals;
            const item = coll.find(x => x.id === id);
            if (!item) return;
            if (!confirm('정말로 삭제하시겠습니까?')) return;
            if (type === 'goal') logGoal('delete', item);
            const idx = coll.findIndex(x => x.id === id);
            coll.splice(idx, 1);
            if (type === 'deposit') state.bankBalance = state.deposits.reduce((a, c) => a + Number(c.amount || 0), 0);
            saveState(); renderAll();
          });
          return;
        }

        if (action === 'achieve' && type === 'goal') {
          passwordGuard(() => {
            const g = state.goals.find(x => x.id === id);
            if (!g || g.achieved) return;
            g.achieved = true;
            g.achievedAt = new Date().toISOString();
            logGoal('achieve', g);
            // Also record as expense (planned)
            state.expenses.push({ id: uid(), source: `목표 획득: ${g.item}`, amount: Number(g.amount) || 0, date: toISODate(), evaluation: 3, isDonation: false });
            saveState(); renderAll();
          });
          return;
        }
      });
    }
    attachDelegation(incomeList, 'income');
    attachDelegation(expenseList, 'expense');
    attachDelegation(depositList, 'deposit');
    attachDelegation(goalList, 'goal');

    // Chart.js: cumulative net with first/mid/last x-axis labels
    let chart;
    function datasetFromTransactions() {
      const txs = [];
      state.incomes.forEach(x => txs.push({ date: x.date, delta: Number(x.amount) || 0 }));
      state.expenses.forEach(x => txs.push({ date: x.date, delta: -1 * (Number(x.amount) || 0) }));
      if (!txs.length) return [];
      txs.sort((a, b) => new Date(a.date) - new Date(b.date));
      let cum = 0;
      return txs.map(t => {
        cum += t.delta;
        return { x: new Date(t.date), y: cum };
      });
    }
    function renderChart() {
      const ctx = document.getElementById('transactionChart');
      if (!ctx || graphViewContainer.classList.contains('hidden')) return;

      const data = datasetFromTransactions();
      if (!data.length) {
        if (chart) { chart.destroy(); chart = null; }
        return;
      }
      const first = data[0].x;
      const last = data[data.length - 1].x;
      const mid = new Date((first.getTime() + last.getTime()) / 2);

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: '누적 잔액 (Net)',
            data,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.15)',
            fill: true,
            tension: 0.2,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          parsing: false,
          scales: {
            x: {
              type: 'time',
              time: { unit: 'day' },
              ticks: {
                callback: (val, index, ticks) => {
                  const v = ticks[index].value; // timestamp
                  const d = new Date(v);
                  const fmt = (dt) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
                  const isSameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
                  if (isSameDay(d, first) || isSameDay(d, mid) || isSameDay(d, last)) return fmt(d);
                  return '';
                }
              },
              min: first,
              max: last
            },
            y: {
              beginAtZero: false
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // Initial draw (remove previous duplicate calls)
    renderAll();

    // Optional: cross-device sync via Firebase (fill config and set ENABLE_CLOUD_SYNC=true)
    const ENABLE_CLOUD_SYNC = false; // set to true after adding your Firebase config
    const firebaseConfig = {
      // TODO: fill with your Firebase config
      // apiKey: "", authDomain: "", projectId: "", ...
    };
    let _cloudReady = false;
    let _docRef = null;

    function loadScript(src) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }

    async function initCloudSync() {
      if (!ENABLE_CLOUD_SYNC) return;
      try {
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        _docRef = db.collection('yura_finance').doc('state');

        // Pull remote; if empty, push local
        const snap = await _docRef.get();
        if (snap.exists && snap.data()) {
          state = { ...defaultState(), ...snap.data() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          renderAll();
        } else {
          await _docRef.set(state);
        }

        // Live updates
        _docRef.onSnapshot((doc) => {
          if (!doc.exists) return;
          const remote = doc.data();
          // Skip if identical
          if (JSON.stringify(remote) === JSON.stringify(state)) return;
          state = { ...defaultState(), ...remote };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          renderAll();
        });

        _cloudReady = true;
      } catch (e) {
        console.warn('Cloud sync init failed:', e);
      }
    }

    function cloudSave() {
      if (!_cloudReady || !_docRef) return;
      // Push current state to cloud
      _docRef.set(state).catch(err => console.warn('Cloud save failed:', err));
    }

    // Kick off cloud sync after first render
    renderAll();
    initCloudSync();

    // Always start on Goals and List view
    setActiveView(listViewTab);
    // Defer to ensure any late layout code won’t override it
    setTimeout(() => setActiveTab(goalTab), 0);
});

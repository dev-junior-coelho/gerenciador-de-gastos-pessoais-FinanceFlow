import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMonthKey, monthOrdinal, monthStartIso, parseMoney, roundMoney,
  billingMonthForPurchase, paidMonthsBefore, projectExpensesForMonth,
  upcomingDueNotifications, dueDateForMonth
} from '../src/utils/finance.js';

test('troca de mês não pula fevereiro ao partir do dia 31', () => {
  const january = new Date(2026, 0, 31);
  const nextMonth = new Date(january);
  nextMonth.setDate(1);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  assert.equal(nextMonth.getMonth(), 1);
});

test('interpreta moeda pt-BR e rejeita entradas inválidas', () => {
  assert.equal(parseMoney('1.234,56'), 1234.56);
  assert.equal(parseMoney('1234.56'), 1234.56);
  assert.equal(parseMoney('-10'), null);
  assert.equal(parseMoney('12ab'), null);
});

test('recorrente só aparece a partir de seu início', () => {
  const expenses = [{ id: 'fixed', type: 'fixed', value: 100, date: monthStartIso(2026 * 12 + 3) }];
  assert.equal(projectExpensesForMonth(expenses, new Date(2026, 2, 1)).length, 0);
  assert.equal(projectExpensesForMonth(expenses, new Date(2026, 3, 1)).length, 1);
});

test('parcelamento encerra na quantidade contratada', () => {
  const expenses = [{ id: 'i', type: 'installment', current: 1, total: 3, value: 50, date: monthStartIso(2026 * 12 + 3) }];
  assert.equal(projectExpensesForMonth(expenses, new Date(2026, 3, 1))[0].current, 1);
  assert.equal(projectExpensesForMonth(expenses, new Date(2026, 5, 1))[0].current, 3);
  assert.equal(projectExpensesForMonth(expenses, new Date(2026, 6, 1)).length, 0);
});

test('centavos residuais são aplicados à última parcela', () => {
  const expenses = [{ id: 'i', type: 'installment', current: 1, total: 3, value: roundMoney(100 / 3), totalValue: 100, date: monthStartIso(2026 * 12 + 3) }];
  const vals = [3, 4, 5].map(month => projectExpensesForMonth(expenses, new Date(2026, month, 1))[0].value);
  assert.deepEqual(vals, [33.33, 33.33, 33.34]);
});

test('dia de vencimento 31 ajusta para último dia do mês', () => {
  assert.equal(dueDateForMonth(2026, 1, 31).getDate(), 28);
});

test('fechamento de fatura considera o mês anterior', () => {
  assert.equal(billingMonthForPurchase(new Date(2026, 9, 2), 5), monthOrdinal(new Date(2026, 10, 1)));
  assert.equal(billingMonthForPurchase(new Date(2026, 9, 2), 20), monthOrdinal(new Date(2026, 9, 1)));
});

test('parcelas antigas podem ser inicialmente marcadas como pagas', () => {
  const paid = paidMonthsBefore(2026 * 12, 2);
  assert.equal(paid['2026-0'], true);
  assert.equal(paid['2026-1'], true);
  assert.equal(getMonthKey(new Date(2026, 1, 1)), '2026-1');
});

test('notificações ignoram contas pagas e projetam mês seguinte', () => {
  const today = new Date(2026, 9, 30);
  const expenses = [
    {id:'one', name:'A', type:'fixed', value:50, date:monthStartIso(2026*12+9), dueDay:'1', paidMonths:{}},
    {id:'two', name:'B', type:'fixed', value:50, date:monthStartIso(2026*12+9), dueDay:'1', paidMonths:{'2026-10':true}}
  ];
  assert.deepEqual(upcomingDueNotifications(expenses, today).map(n=>n.expense.id), ['one']);
});

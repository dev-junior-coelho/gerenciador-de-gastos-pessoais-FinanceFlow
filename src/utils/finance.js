// Funções puras para cálculos financeiros e projeções mensais.
// As chaves de mês mantêm o formato YYYY-M (mês iniciado em zero),
// compatível com os dados já existentes no Firestore.

export function monthOrdinal(date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function monthKeyFromOrdinal(ordinal) {
  const year = Math.floor(ordinal / 12);
  const month = ((ordinal % 12) + 12) % 12;
  return year + '-' + month;
}

export function getMonthKey(date) {
  return monthKeyFromOrdinal(monthOrdinal(date));
}

export function storedMonthOrdinal(value) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})/.exec(value);
    if (match) {
      const month = Number(match[2]);
      if (month >= 1 && month <= 12) return Number(match[1]) * 12 + month - 1;
    }
  }
  const date = value && typeof value.toDate === 'function'
    ? value.toDate()
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : monthOrdinal(date);
}

export function monthStartIso(ordinal) {
  return new Date(Date.UTC(
    Math.floor(ordinal / 12),
    ((ordinal % 12) + 12) % 12,
    1, 12
  )).toISOString();
}

export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function parseMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? roundMoney(value) : null;
  const cleaned = String(value ?? '').replace(/\s|R\$/gi, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? roundMoney(amount) : null;
}

export function billingMonthForPurchase(date, dueDay) {
  const day = Number(dueDay);
  const base = monthOrdinal(date);
  if (!Number.isInteger(day) || day < 1 || day > 31) return base;
  // Fechamento 10 dias antes do vencimento, inclusive quando cai no mês anterior.
  const closing = new Date(date.getFullYear(), date.getMonth(), day - 10);
  const purchasedOn = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return purchasedOn > closing ? base + 1 : base;
}

export function paidMonthsBefore(startOrdinal, count) {
  const paid = {};
  for (let i = 0; i < count; i++) {
    paid[monthKeyFromOrdinal(startOrdinal + i)] = true;
  }
  return paid;
}

export function projectExpensesForMonth(expenses, selectedDate) {
  const targetMonth = monthOrdinal(selectedDate);
  return expenses.flatMap(item => {
    const startMonth = storedMonthOrdinal(item.date || item.createdAt);
    if (startMonth === null) return [];
    const difference = targetMonth - startMonth;

    if (item.type === 'fixed') return difference >= 0 ? [item] : [];
    if (item.type === 'one-time') return difference === 0 ? [item] : [];

    if (item.type === 'installment') {
      const total = Number(item.total);
      const current = (Number(item.current) || 1) + difference;
      if (!Number.isInteger(total) || total < 1 || current < 1 || current > total) return [];
      const regularValue = roundMoney(item.value);
      const finalValue = item.totalValue != null && Number.isFinite(Number(item.totalValue))
        ? roundMoney(Number(item.totalValue) - regularValue * (total - 1))
        : regularValue;
      return [{
        ...item,
        current,
        value: current === total ? finalValue : regularValue
      }];
    }
    return [item];
  });
}

export function dueDateForMonth(year, month, dueDay) {
  const day = Number(dueDay);
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

export function upcomingDueNotifications(expenses, today) {
  const beginning = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthStarts = [
    new Date(today.getFullYear(), today.getMonth(), 1),
    new Date(today.getFullYear(), today.getMonth() + 1, 1)
  ];
  const reminders = [];
  for (const target of monthStarts) {
    const key = getMonthKey(target);
    const projected = projectExpensesForMonth(expenses, target);
    for (const expense of projected) {
      if (expense.paidMonths?.[key]) continue;
      const dueDate = dueDateForMonth(target.getFullYear(), target.getMonth(), expense.dueDay);
      if (!dueDate) continue;
      const days = Math.round((Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()) -
        Date.UTC(beginning.getFullYear(), beginning.getMonth(), beginning.getDate())) / 86400000);
      if (days < 0 || days > 3) continue;
      reminders.push({
        id: 'notif-' + expense.id + '-' + key,
        title: 'Vencimento Próximo',
        message: 'A fatura de "' + expense.name + '" vence em ' +
          String(dueDate.getDate()).padStart(2, '0') + '/' +
          String(dueDate.getMonth() + 1).padStart(2, '0') + '.',
        expense
      });
    }
  }
  return reminders;
}

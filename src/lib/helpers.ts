// https://twitter.com/mweststrate
const currency = Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  currencyDisplay: 'narrowSymbol',
});

function formatCurrency(amount: number): string {
  return currency.format(amount);
}

export { formatCurrency };

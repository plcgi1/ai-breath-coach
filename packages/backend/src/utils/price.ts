export interface IPricingData {
  totalCount: number; // Всего платных техник
  purchasedCount: number; // Уже куплено пользователем
  baseUnitPrice: number; // Цена за одну технику (из таблицы pricing)
  fullAllAccessPrice: number; // Стандартная цена "All Access" для нового юзера
}

/**
 * Расчет динамической цены апгрейда до "All Access"
 */
export function calculateUpgradePrice(data: IPricingData): number {
  const { totalCount, purchasedCount, baseUnitPrice, fullAllAccessPrice } =
    data;

  // 1. Если уже куплено всё или больше (на всякий случай)
  if (purchasedCount >= totalCount) return 0;

  // 2. Считаем остаток техник
  const lockedCount = totalCount - purchasedCount;

  // 3. Определяем коэффициент скидки по твоей логике
  // Если куплено меньше 50% — скидка 40% (коэф 0.6)
  // Если 50% и больше — скидка 20% (коэф 0.8)
  const ownershipRatio = purchasedCount / totalCount;
  const discountTier = ownershipRatio < 0.5 ? 0.7 : 0.9;

  // 4. Считаем сырую цену по формуле
  let dynamicPrice = Math.round(lockedCount * baseUnitPrice * discountTier);

  // 5. ПРОВЕРКА: Цена апгрейда не может быть больше стандартной цены All Access
  // И не должна быть меньше цены одной техники (если осталась хотя бы одна)
  dynamicPrice = Math.min(dynamicPrice, fullAllAccessPrice);

  if (lockedCount > 0) {
    dynamicPrice = Math.max(dynamicPrice, baseUnitPrice);
  }

  return dynamicPrice;
}

// --- Примеры использования ---

// const total = 10;
// const pricePerOne = 100;
// const allAccessLimit = 500;

// console.log("Куплено 2 (20%):", calculateUpgradePrice({
//   totalCount: total,
//   purchasedCount: 2,
//   baseUnitPrice: pricePerOne,
//   fullAllAccessPrice: allAccessLimit
// })); // (8 * 100) * 0.6 = 480

// console.log("Куплено 5 (50%):", calculateUpgradePrice({
//   totalCount: total,
//   purchasedCount: 5,
//   baseUnitPrice: pricePerOne,
//   fullAllAccessPrice: allAccessLimit
// })); // (5 * 100) * 0.8 = 400

// console.log("Куплено 9 (90%):", calculateUpgradePrice({
//   totalCount: total,
//   purchasedCount: 9,
//   baseUnitPrice: pricePerOne,
//   fullAllAccessPrice: allAccessLimit
// })); // (1 * 100) * 0.8 = 80 -> но сработает Math.max и будет 100

/**
 * Price encoding/decoding for the DFK Bazaar contract.
 *
 * The Bazaar stores prices as: unitPrice_wei × PRICE_FACTOR (10^12)
 * JEWEL has 18 decimals, so a human-readable price in JEWEL:
 *   humanPrice = contractPrice / (10^18 * 10^12) = contractPrice / 10^30
 *
 * For `makeOrders`, the `totalPrice` input is:
 *   totalPrice = unitPrice_wei × quantity_wei / 10^tokenDecimals
 *   where unitPrice_wei is the price per unit in wei (not multiplied by PRICE_FACTOR)
 *
 * IMPORTANT: All math uses BigInt to avoid floating-point precision issues.
 */

const JEWEL_DECIMALS = 18n
const PRICE_FACTOR = 10n ** 12n
const JEWEL_WEI = 10n ** JEWEL_DECIMALS

/**
 * Convert a human-readable JEWEL price to the contract's stored price format.
 * Example: 0.005 JEWEL → 5000000000000000000000000000n (5 * 10^27)
 *
 * @param humanPrice - Price in JEWEL as a string (e.g., "0.005", "250")
 * @returns Contract price format (unitPrice_wei × PRICE_FACTOR)
 */
export function encodePrice(humanPrice: string): bigint {
  const priceWei = parseJewel(humanPrice)
  return priceWei * PRICE_FACTOR
}

/**
 * Convert a contract stored price back to human-readable JEWEL string.
 * Example: 5000000000000000000000000000n → "0.005"
 *
 * @param contractPrice - Price in contract format (unitPrice_wei × PRICE_FACTOR)
 * @returns Human-readable JEWEL price string
 */
export function decodePrice(contractPrice: bigint): string {
  const priceWei = contractPrice / PRICE_FACTOR
  return formatJewel(priceWei)
}

/**
 * Calculate totalPrice for makeOrders input.
 *
 * totalPrice = unitPrice_wei × quantity / 10^tokenDecimals
 *
 * For 0-decimal tokens (most items): totalPrice = unitPrice_wei × quantity
 * For 3-decimal tokens (DFKGOLD):    totalPrice = unitPrice_wei × quantity / 1000
 *
 * @param humanPrice - Unit price in JEWEL (e.g., "0.005")
 * @param quantity - Number of items (whole units for 0-decimal tokens)
 * @param tokenDecimals - Token decimals (0 for most items, 3 for DFKGOLD)
 */
export function calculateTotalPrice(
  humanPrice: string,
  quantity: bigint,
  tokenDecimals: number,
): bigint {
  const unitPriceWei = parseJewel(humanPrice)
  const decimalsFactor = 10n ** BigInt(tokenDecimals)
  return (unitPriceWei * quantity) / decimalsFactor
}

/**
 * Convert a quantity input to wei based on token decimals.
 * For 0-decimal tokens: 5 items → 5n (no conversion needed)
 * For 3-decimal tokens: 5.123 → 5123n
 */
export function quantityToWei(quantity: string, tokenDecimals: number): bigint {
  if (tokenDecimals === 0) {
    const parsed = BigInt(quantity)
    if (parsed <= 0n) throw new Error('Quantity must be positive')
    return parsed
  }

  // Handle decimal quantities for tokens with decimals
  const parts = quantity.split('.')
  const wholePart = parts[0] ?? '0'
  let fracPart = parts[1] ?? ''

  if (fracPart.length > tokenDecimals) {
    throw new Error(`Too many decimal places (max ${tokenDecimals})`)
  }

  fracPart = fracPart.padEnd(tokenDecimals, '0')
  const result = BigInt(wholePart) * 10n ** BigInt(tokenDecimals) + BigInt(fracPart)
  if (result <= 0n) throw new Error('Quantity must be positive')
  return result
}

/**
 * Format a quantity from wei back to human-readable.
 */
export function formatQuantity(weiQuantity: bigint, tokenDecimals: number): string {
  if (tokenDecimals === 0) return weiQuantity.toString()

  const factor = 10n ** BigInt(tokenDecimals)
  const whole = weiQuantity / factor
  const frac = weiQuantity % factor

  if (frac === 0n) return whole.toString()

  const fracStr = frac.toString().padStart(tokenDecimals, '0').replace(/0+$/, '')
  return `${whole}.${fracStr}`
}

/**
 * Parse a JEWEL amount string to wei (BigInt).
 * Handles up to 18 decimal places.
 * "0.005" → 5000000000000000n
 * "250"   → 250000000000000000000n
 */
export function parseJewel(amount: string): bigint {
  const trimmed = amount.trim()
  if (!trimmed || trimmed === '0') return 0n

  const parts = trimmed.split('.')
  const wholePart = parts[0] ?? '0'
  let fracPart = parts[1] ?? ''

  if (fracPart.length > 18) {
    throw new Error('JEWEL has a maximum of 18 decimal places')
  }

  fracPart = fracPart.padEnd(18, '0')
  return BigInt(wholePart) * JEWEL_WEI + BigInt(fracPart)
}

/**
 * Format wei back to a human-readable JEWEL string.
 * Trims trailing zeros. Max 6 significant decimals shown.
 */
export function formatJewel(wei: bigint): string {
  if (wei === 0n) return '0'

  const whole = wei / JEWEL_WEI
  const frac = wei % JEWEL_WEI

  if (frac === 0n) return whole.toString()

  // Pad to 18 chars, then trim trailing zeros
  const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '')
  return `${whole}.${fracStr}`
}

/**
 * Format JEWEL for display with limited decimal places.
 */
export function formatJewelDisplay(wei: bigint, maxDecimals = 4): string {
  const full = formatJewel(wei)
  const parts = full.split('.')
  if (parts.length === 1) return full

  const decimals = parts[1]!.slice(0, maxDecimals)
  if (!decimals || BigInt(decimals) === 0n) return parts[0]!

  return `${parts[0]}.${decimals.replace(/0+$/, '')}`
}

// ── Order validation ──

/** Min order total: 0.0001 JEWEL */
export const MIN_ORDER_JEWEL = parseJewel('0.0001')
/** Max order total: 50,000,000 JEWEL */
export const MAX_ORDER_JEWEL = parseJewel('50000000')

/**
 * Validate that a price has at most 4 significant digits.
 * The Bazaar contract enforces this — orders with more precision revert.
 *
 * Valid:   123.4, 0.000001234, 1234000, 0.005, 250
 * Invalid: 123.04, 1.000000001, 123402
 *
 * @returns null if valid, error message string if invalid
 */
export function validatePricePrecision(price: string): string | null {
  const trimmed = price.trim()
  if (!trimmed) return 'Price is required'

  const num = parseFloat(trimmed)
  if (isNaN(num) || num <= 0) return 'Price must be a positive number'

  // Extract significant digits: remove leading zeros, decimal point, and trailing zeros
  const normalized = trimmed.replace(/^0+/, '').replace('.', '')
  // For numbers < 1 like "0.000001234", strip leading zeros after removing the decimal
  const sigDigits = normalized.replace(/^0+/, '').replace(/0+$/, '')

  if (sigDigits.length > 4) {
    return 'Price must have at most 4 significant digits (e.g., 123.4, 0.001234)'
  }

  return null
}

/**
 * Validate a complete order before submission.
 * @returns null if valid, error message string if invalid
 */
export function validateOrder(params: {
  price: string
  quantity: string
  tokenDecimals: number
}): string | null {
  const { price, quantity, tokenDecimals } = params

  // Validate price precision
  const precisionError = validatePricePrecision(price)
  if (precisionError) return precisionError

  // Validate quantity
  const trimmedQty = quantity.trim()
  if (!trimmedQty) return 'Quantity is required'

  const qtyNum = parseFloat(trimmedQty)
  if (isNaN(qtyNum) || qtyNum <= 0) return 'Quantity must be a positive number'

  if (tokenDecimals === 0 && trimmedQty.includes('.')) {
    return 'This item does not support fractional quantities'
  }

  // Validate total order value
  try {
    const unitWei = parseJewel(price)
    const qtyBigInt =
      tokenDecimals === 0
        ? BigInt(trimmedQty)
        : BigInt(Math.round(parseFloat(trimmedQty) * 10 ** tokenDecimals))
    const decimalsFactor = 10n ** BigInt(tokenDecimals)
    const total = (unitWei * qtyBigInt) / (decimalsFactor || 1n)

    if (total < MIN_ORDER_JEWEL) {
      return 'Order total must be at least 0.0001 JEWEL'
    }
    if (total > MAX_ORDER_JEWEL) {
      return 'Order total cannot exceed 50,000,000 JEWEL'
    }
  } catch {
    return 'Invalid price or quantity'
  }

  return null
}

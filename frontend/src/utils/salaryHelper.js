/**
 * Centralized utility functions for parsing, formatting, validating,
 * and storing job compensation in Indian Lakhs Per Annum (LPA).
 */

/**
 * Parses any salary value (raw INR, K thousands, or LPA) into clean LPA number.
 * Examples:
 *   300000 -> 3
 *   450000 -> 4.5
 *   600000 -> 6
 *   800000 -> 8
 *   1200000 -> 12
 *   1275000 -> 12.75
 *   600 (entered as K) -> 6
 *   3.5 (entered as LPA) -> 3.5
 */
export const parseToLakhs = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  if (isNaN(num) || num <= 0) return null;

  // Stored in raw INR (>= 100,000) e.g. 600,000 INR -> 6 LPA
  if (num >= 100000) {
    const lpa = num / 100000;
    // Format up to 2 decimal places without trailing zeros (e.g. 4.5, 12.75, 6)
    return Number(lpa.toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1"));
  }

  // Stored in legacy Thousands / K (100 to 99,999) e.g. 600 -> 6 LPA, 1200 -> 12 LPA
  if (num >= 100) {
    const lpa = num / 100;
    return Number(lpa.toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1"));
  }

  // Stored or entered directly in LPA (< 100) e.g. 3.5 -> 3.5 LPA
  return Number(Number(num).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1"));
};

/**
 * Formats a salary range object or number for UI display.
 * Outputs format:
 *   { min: 700000, max: 800000 } -> "₹7–8 LPA"
 *   { min: 600000, max: 1200000 } -> "₹6–12 LPA"
 *   { min: 300000, max: 300000 } -> "₹3 LPA"
 *   { min: 350000, max: 800000 } -> "₹3.5–8 LPA"
 */
export const formatSalaryRange = (salary, fallback = "₹6–12 LPA") => {
  if (!salary && !fallback) return "₹6–12 LPA";

  if (typeof salary === "string") {
    if (salary.includes("LPA") || salary.includes("₹")) return salary;
    return `₹${salary} LPA`;
  }

  if (typeof salary === "number") {
    const lpa = parseToLakhs(salary);
    return lpa !== null ? `₹${lpa} LPA` : (fallback || "Competitive");
  }

  if (typeof salary === "object") {
    if (salary.hidden) return "Competitive";
    const minLakh = parseToLakhs(salary.min);
    const maxLakh = parseToLakhs(salary.max);

    if (minLakh !== null && maxLakh !== null) {
      if (minLakh === maxLakh) return `₹${minLakh} LPA`;
      return `₹${minLakh}–${maxLakh} LPA`;
    }
    if (minLakh !== null) return `₹${minLakh} LPA+`;
    if (maxLakh !== null) return `Up to ₹${maxLakh} LPA`;
  }

  return fallback || "Competitive";
};

/**
 * Formats a single value into LPA display string.
 * Example: 300000 -> "₹3 LPA", 450000 -> "₹4.5 LPA"
 */
export const formatLPA = (val, fallback = "") => {
  const lpa = parseToLakhs(val);
  if (lpa === null) return fallback;
  return `₹${lpa} LPA`;
};

/**
 * Converts form input (in LPA) to raw INR for database storage.
 * e.g.
 *   3.5 -> 350,000 INR
 *   8.0 -> 800,000 INR
 *   12.75 -> 1,275,000 INR
 */
export const toRupeesStorage = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const num = Number(val);
  if (isNaN(num) || num <= 0) return 0;

  // Entered as LPA (e.g. 3.5, 8, 12.75)
  if (num < 100) {
    return Math.round(num * 100000);
  }
  // Entered as legacy K (e.g. 600, 1200)
  if (num < 100000) {
    return Math.round(num * 1000);
  }
  // Entered as raw INR (e.g. 600000)
  return Math.round(num);
};

/**
 * Converts stored raw INR or K into clean LPA string for edit inputs.
 * e.g.
 *   350,000 INR -> "3.5"
 *   600,000 INR -> "6"
 *   1,200,000 INR -> "12"
 */
export const toLakhsInput = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const lpa = parseToLakhs(val);
  return lpa !== null ? String(lpa) : "";
};

/**
 * Validates minimum and maximum salary input in LPA.
 * Ensures:
 *  - Minimum salary is greater than 0
 *  - Maximum salary is greater than or equal to minimum salary
 *  - Both are valid non-negative numbers
 */
export const validateSalaryLPA = (minInput, maxInput) => {
  if (minInput === "" && maxInput === "") {
    return { isValid: true };
  }

  const minNum = minInput !== "" && minInput !== null && minInput !== undefined ? parseFloat(minInput) : null;
  const maxNum = maxInput !== "" && maxInput !== null && maxInput !== undefined ? parseFloat(maxInput) : null;

  if (minNum !== null) {
    if (isNaN(minNum) || minNum <= 0) {
      return { isValid: false, error: "Minimum salary must be greater than 0 LPA." };
    }
  }

  if (maxNum !== null) {
    if (isNaN(maxNum) || maxNum <= 0) {
      return { isValid: false, error: "Maximum salary must be greater than 0 LPA." };
    }
    if (minNum !== null && maxNum < minNum) {
      return { isValid: false, error: "Maximum salary must be greater than or equal to Minimum salary." };
    }
  }

  return { isValid: true };
};

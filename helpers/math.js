const OPERATORS = ["+", "-", "*", "/"];
const MATH_FUNCTIONS_REGEX = new RegExp(/Math.*\(/);

/**
 * Calculate the gamma function for a given number.
 *
 * @param {number} n - The input number for which gamma function is calculated. Must be >= 0.
 * @returns {number} The gamma value of the input number.
 */
function gamma(n) {
  var g = 7,
    p = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

  // If n is less than 0.5, use the reflection formula for gamma function
  if (n < 0.5) return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));

  // Otherwise, use the Lanczos approximation
  n--;

  var x = p[0];
  for (var i = 1; i < g + 2; i++) {
    x += p[i] / (n + i);
  }

  var t = n + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}

/**
 * Calculate the factorial of a non-negative integer or use gamma function for non-integer input.
 *
 * @param {number} num - The number for which factorial is calculated. Must be >= 0.
 * @returns {number} The factorial value of the input number.
 */
function factorial(num) {
  let result = 1;

  // If num is not an integer, use gamma function
  if (num % 1 !== 0) return gamma(num + 1);
  if (num === 0 || num === 1) return result;

  for (let i = 2; i <= num; i++) {
    result *= i;

    if (result === Infinity) return Infinity;
  }

  return result;
}

/**
 * Get all indexes of a value in an array.
 *
 * @param {Array} arr - The input array to search through.
 * @param {*} val - The value to search for in the array.
 * @returns {Array} An array containing all indexes where the value was found. If value is not found, returns an empty array.
 */
function getAllIndexes(arr, val) {
  let indexes = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      indexes.push(i);
    }
  }

  return indexes;
}

/**
 * Insert multiplication operators (*) into a given mathematical expression to ensure correct parsing.
 * Handles specific cases where multiplication might be implicit.
 *
 * @param {string} expression - The mathematical expression to modify.
 * @returns {string} The modified expression with multiplication operators inserted where necessary.
 */
function insertMultiplicationOperators(expression) {
  const modifiedExpression = expression
    // Number followed by (
    .replace(/(\d+)\s*(?=\()/g, "$1*")
    // ) followed by number
    .replace(/\)\s*(?=\d+)/g, ")*")
    // Number followed by Math.*
    .replace(/(\d+)\s*(?=Math\.(PI|E|cos|sin|tan|pow|log|sqrt))/g, "$1*")
    // Math.PI or Math.E followed by (
    .replace(/(Math\.(PI|E))\s*(?=\()/g, "$1*")
    // ) followed by Math.*
    .replace(/\)\s*(?=Math\.(PI|E|cos|sin|tan|pow|log|sqrt))/g, ")*")
    // Math.* followed by Math.* or number
    .replace(/(Math\.(PI|E))\s*(?=Math\.(PI|E|cos|sin|tan|pow|log|sqrt)|\d)/g, "$1*")
    // ) followed by ( to handle cases like (5)(5)
    .replace(/\)\s*(?=\()/g, ")*")
    // Math.log10 followed by *( to handle cases like Math.log10*(6)
    .replace(/Math\.log10\*\(/g, "Math.log10(");

  return modifiedExpression;
}

/**
 * Extract power bases from a mathematical formula based on given power indexes.
 *
 * @param {string} formula - The mathematical formula string.
 * @param {Array<number>} powerIndexes - Array of indexes in the formula where power operations occur.
 * @returns {Array<string>} Array of substrings representing the bases of power operations.
 */
function powerBaseGetter(formula, powerIndexes) {
  let powerBases = [];

  // Iterate through each index where power operations occur
  for (let i = 0; i < powerIndexes.length; i++) {
    let base = [];
    let paranthesesCount = 0;
    let prevIndex = powerIndexes[i] - 1;

    // Traverse backwards to capture the base of the power operation
    while (prevIndex >= 0) {
      if (formula[prevIndex] === "(") paranthesesCount--;
      if (formula[prevIndex] === ")") paranthesesCount++;

      let isOperator = false;
      [...OPERATORS, "Math.sqrt("].forEach((operator) => {
        if (formula[prevIndex] === operator) isOperator = true;
      });

      // Break if an operator or the "POWER(" function is encountered
      if (((isOperator || MATH_FUNCTIONS_REGEX.test(formula[prevIndex])) && paranthesesCount === 0) || formula[prevIndex] === "POWER(") break;

      // Prepend characters to form the base string
      base.unshift(formula[prevIndex]);
      prevIndex--;
    }

    powerBases.push(base.join(""));
  }

  return powerBases;
}

/**
 * Extracts factorial numbers from a mathematical formula based on given factorial indexes.
 *
 * @param {string} formula - The mathematical formula string.
 * @param {Array<number>} factorialIndexes - Array of indexes in the formula where factorial operations occur.
 * @returns {Array<Object>} Array of objects containing information about each factorial number found.
 */
function factorialNumberGetter(formula, factorialIndexes) {
  let numbers = []; 
  let factorialSequence = 0;

  factorialIndexes.forEach((factorialIndex) => {
    let num = [];
    let nextIndex = factorialIndex + 1;

    // Check if the next character after factorialIndex is "FACTORIAL"
    if (formula[nextIndex] === "FACTORIAL") {
      factorialSequence += 1;
      return;
    }

    // Calculate the start index of the number considering factorial sequences
    let firstFactorialIndex = factorialIndex - factorialSequence;
    let prevIndex = firstFactorialIndex - 1;
    let paranthesesCount = 0;

    // Traverse backwards to capture the number preceding the factorial sequence
    while (prevIndex >= 0) {
      if (formula[prevIndex] === "(") paranthesesCount--;
      if (formula[prevIndex] === ")") paranthesesCount++;

      let isOperator = false;
      OPERATORS.forEach((operator) => {
        if (formula[prevIndex] === operator) isOperator = true;
      });

      // Break if an operator is encountered at the top level or parentheses are unbalanced
      if ((isOperator || MATH_FUNCTIONS_REGEX.test(formula[prevIndex])) && paranthesesCount === 0) break;

      // Prepend characters to form the number string
      num.unshift(formula[prevIndex]);
      prevIndex--;
    }

    // Convert array of characters to string representing the number
    let numString = num.join("");

    // Determine the number of factorial symbols (e.g., !! for two factorials)
    let times = factorialSequence + 1;

    // Strings used for replacement in the formula
    let toReplace = numString + "!".repeat(times);
    let replacement = "factorial(".repeat(times) + numString + ")".repeat(times);

    numbers.push({
      toReplace,
      replacement,
    });

    factorialSequence = 0;
  });

  return numbers;
}

/**
 * Calculate the count of left and right parentheses in an array of operations.
 *
 * @param {Array<any>} operation - The array of operations to analyze.
 * @returns {Object} An object containing the count of left and right parentheses.
 */
function calculateMissingParenthesis (operation) {
  const leftParenthesisCount = operation.filter((o) => o.toString().includes("(")).length;
  const rightParenthesisCount = operation.filter((o) => o.toString().includes(")")).length;

  return { leftParenthesisCount, rightParenthesisCount };
};

/**
 * Check if there is a dot (.) in the formula after the last operator or parenthesis.
 *
 * @param {Array<string>} formula - The array representing the formula to check.
 * @returns {boolean} Returns true if there is a dot after the last operator or parenthesis, otherwise false.
 */
function isDotAfterLastOperatorOrParenthesis (formula) {
  const allOperators = [...OPERATORS, "(", ")"]
  let hasSeenDot = false;

  for (let i = formula.length - 1; i > 0; i--) {
    if (allOperators.includes(formula[i]))
      break;
    else if (formula[i] === ".")
      hasSeenDot = true
  }

  return hasSeenDot
} 

export {
  gamma,
  factorial,
  factorialNumberGetter,
  powerBaseGetter,
  insertMultiplicationOperators,
  getAllIndexes,
  calculateMissingParenthesis,
  isDotAfterLastOperatorOrParenthesis
}

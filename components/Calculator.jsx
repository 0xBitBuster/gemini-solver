import { useRef, useState } from "react";
import { Image, Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { icons } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";
import { gamma, factorial, factorialNumberGetter, powerBaseGetter, getAllIndexes, insertMultiplicationOperators, calculateMissingParenthesis, isDotAfterLastOperatorOrParenthesis } from "../helpers/math"

const OPERATORS = ["+", "-", "*", "/"];
const calculatorButtons = {
  e: {
    name: "e",
    symbol: "e",
    formula: "Math.E",
    type: "number",
  },
  ln: {
    name: "ln",
    symbol: "ln",
    formula: "Math.log",
    type: "math_function",
  },
  log: {
    name: "log",
    symbol: "log",
    formula: "Math.log10",
    type: "math_function",
  },
  factorial: {
    name: "factorial",
    symbol: "x!",
    formula: "!",
    type: "math_function",
  },
  power: {
    name: "power",
    symbol: (
      <View className="flex-row items-start">
        <Text className="text-xl">x</Text>
        <Text className="text-xs">y</Text>
      </View>
    ),
    formula: "POWER(",
    type: "math_function",
  },
  squareroot: {
    name: "squareroot",
    symbol: "√",
    formula: "Math.sqrt",
    type: "math_function",
  },
  sin: {
    name: "sin",
    symbol: "sin",
    formula: "Math.sin(",
    type: "trigo_function",
  },
  cos: {
    name: "cos",
    symbol: "cos",
    formula: "Math.cos(",
    type: "trigo_function",
  },
  tan: {
    name: "tan",
    symbol: "tan",
    formula: "Math.tan(",
    type: "trigo_function",
  },
  pi: {
    name: "pi",
    symbol: "π",
    formula: "Math.PI",
    type: "number",
  },
  openparenthesis: {
    name: "openparenthesis",
    symbol: "(",
    formula: "(",
    type: "number",
  },
  closeparenthesis: {
    name: "closeparenthesis",
    symbol: ")",
    formula: ")",
    type: "number",
  },
  clear: {
    name: "clear",
    symbol: "AC",
    formula: false,
    type: "key",
  },
  delete: {
    name: "delete",
    symbol: "⌫",
    formula: false,
    type: "key",
  },
  answer: {
    name: "answer",
    symbol: "ANS",
    formula: false,
    type: "key"
  },
  division: {
    name: "division",
    symbol: "÷",
    formula: "/",
    type: "operator",
  },
  multiplication: {
    name: "multiplication",
    symbol: "×",
    formula: "*",
    type: "operator",
  },
  subtraction: {
    name: "subtraction",
    symbol: "–",
    formula: "-",
    type: "operator",
  },
  percent: {
    name: "percent",
    symbol: "%",
    formula: "/100",
    type: "number",
  },
  comma: {
    name: "comma",
    symbol: ".",
    formula: ".",
    type: "number",
  },
  calculate: {
    name: "calculate",
    symbol: "=",
    formula: "=",
    type: "calculate",
  },
  addition: {
    name: "addition",
    symbol: "+",
    formula: "+",
    type: "operator",
  },
  0: {
    name: "0",
    symbol: 0,
    formula: 0,
    type: "number",
  },
  1: {
    name: "1",
    symbol: 1,
    formula: 1,
    type: "number",
  },
  2: {
    name: "2",
    symbol: 2,
    formula: 2,
    type: "number",
  },
  3: {
    name: "3",
    symbol: 3,
    formula: 3,
    type: "number",
  },
  4: {
    name: "4",
    symbol: 4,
    formula: 4,
    type: "number",
  },
  5: {
    name: "5",
    symbol: 5,
    formula: 5,
    type: "number",
  },
  6: {
    name: "6",
    symbol: 6,
    formula: 6,
    type: "number",
  },
  7: {
    name: "7",
    symbol: 7,
    formula: 7,
    type: "number",
  },
  8: {
    name: "8",
    symbol: 8,
    formula: 8,
    type: "number",
  },
  9: {
    name: "9",
    symbol: 9,
    formula: 9,
    type: "number",
  },
};

export default function Calculator({ open, onClose }) {
  const [answer, setAnswer] = useState(0);
  const [operation, setOperation] = useState([0]);
  const [formula, setFormula] = useState([0]);
  const [parenthesisCompletion, setParenthesisCompletion] = useState("");
  const resultScrollRef = useRef(null);

  const handleButtonPress = (value) => {
    const button = calculatorButtons[value]; 
    const lastFormula = formula[formula?.length - 1];
  
    if (button.type === "operator") {
      if (OPERATORS.includes(lastFormula)) {
        // If the last formula item is an operator, replace it
        setOperation((prev) => [...prev.slice(0, prev.length - 1), button.symbol]);
        setFormula((prev) => [...prev.slice(0, prev.length - 1), button.formula]);
        return;
      } else if (lastFormula === ".") {
        // Prevent consecutive dots in the formula
        return;
      }
  
      // Append operator
      setOperation((prev) => [...prev, button.symbol]);
      setFormula((prev) => [...prev, button.formula]);

    } else if (button.type === "number") {
      if (button.formula === "(" || button.formula === ")") {
        // Manage parentheses completion
        const { leftParenthesisCount, rightParenthesisCount } = calculateMissingParenthesis([...operation, button.symbol]);
        if (leftParenthesisCount < rightParenthesisCount) return;
        updateParenthesisCompletion([...operation, button.symbol]);

      } else if (button.formula === "." &&
        (lastFormula === "." || OPERATORS.includes(lastFormula) || lastFormula === "Math.E" || lastFormula[lastFormula.length - 1] === "(" || lastFormula[lastFormula.length - 1] === ")" || (lastFormula.toString().includes(".") && !lastFormula.toString().includes("Math.")) || isDotAfterLastOperatorOrParenthesis(formula))
      ) {
        // Prevent invalid dot placement
        return;
      }
  
      // Replace "0" formula with number instead of appending number
      if (formula?.length === 1 && lastFormula === 0 && button.formula !== "." && button.formula !== "(") {
        setOperation([button.symbol]);
        setFormula([button.formula]);
        return;
      }
  
      // Append number
      setOperation((prev) => [...prev, button.symbol]);
      setFormula((prev) => [...prev, button.formula]);

    } else if (button.type === "trigo_function") {
      if (formula?.length === 1 && lastFormula === 0) {
        setOperation([button.symbol + "("]);
        setFormula([button.formula]);
        updateParenthesisCompletion([...operation, button.symbol + "("]);
        return;
      }
  
      // Append trigonometric function
      setOperation((prev) => [...prev, button.symbol + "("]);
      setFormula((prev) => [...prev, button.formula]);
      updateParenthesisCompletion([...operation, button.symbol + "("]);

    } else if (button.type === "math_function") {
      if (button.name === "factorial") {
        // Append factorial symbol
        setOperation((prev) => [...prev, "!"]);
        setFormula((prev) => [...prev, button.formula]);

      } else if (button.name === "power") {
        // Append power function symbol
        setOperation((prev) => [...prev, "^("]);
        setFormula((prev) => [...prev, button.formula]);
        updateParenthesisCompletion([...operation, "^("]);

      } else {
        // For other mathematical functions, append function symbol followed by "("
        const concatSymbol = button.symbol + "(";
        const concatFormula = button.formula + "(";
        setOperation((prev) => [...prev, concatSymbol]);
        setFormula((prev) => [...prev, concatFormula]);
        updateParenthesisCompletion([...operation, concatSymbol]);
      }

    } else if (button.type === "key") {
      if (button.name === "clear") {
        setParenthesisCompletion("");
        setOperation([0]);
        setFormula([0]);

      } else if (button.name === "delete") {
        if (formula.length === 1) {
          updateParenthesisCompletion(operation);
          setOperation([0]);
          setFormula([0]);
          return;
        }

        // Remove last formula
        updateParenthesisCompletion(operation.slice(0, operation.length - 1));
        setOperation((prev) => prev.slice(0, prev.length - 1));
        setFormula((prev) => prev.slice(0, prev.length - 1));
      } else if (button.name === "answer") {
        if (formula.length === 1 && lastFormula === 0) {
          setOperation([answer]);
          setFormula([answer]);
          return;
        }

        setOperation(prev => [...prev, answer])
        setFormula(prev => [...prev, answer])
      }

    } else if (button.type === "calculate") {
      let formulaString = formula.join("");
      const powerIndexes = getAllIndexes(formula, "POWER(");
      const factorialIndexes = getAllIndexes(formula, "!");

      // Replace POWER bases in the formula
      const BASES = powerBaseGetter(formula, powerIndexes);
      BASES.forEach((base) => {
        let toReplace = base + "POWER(";
        let replacement = "Math.pow(" + base + ",";
        formulaString = formulaString.replace(toReplace, replacement);
      });
  
      // Replace factorial numbers in the formula
      const NUMBERS = factorialNumberGetter(formula, factorialIndexes);
      NUMBERS.forEach((fact) => {
        formulaString = formulaString.replace(fact.toReplace, fact.replacement);
      });
  
      // Insert multiplication operators in the formula
      formulaString = insertMultiplicationOperators(formulaString);
  
      // Calculate result using eval 
      let result;
      try {
        result = eval(`(factorial, gamma) => ${formulaString}`)(factorial, gamma);
      } catch (error) {
        if (error instanceof SyntaxError) {
          result = "Syntax Error!";
          setAnswer(result);
          return;
        }
      }
  
      setOperation([result]);
      setFormula([result]);
      setAnswer(result);
    }
  };

  const updateParenthesisCompletion = (operation) => {
    const { leftParenthesisCount, rightParenthesisCount } = calculateMissingParenthesis(operation);
    const completion = ")".repeat(leftParenthesisCount - rightParenthesisCount);
    setParenthesisCompletion(completion);
  };
  
  const Button = ({ calcKey, backgroundColor = "bg-white", textClassName = "text-primary", small }) => (
    <TouchableWithoutFeedback onPressIn={() => handleButtonPress(calcKey)}>
      <View className={`flex-1 aspect-square flex justify-center items-center shadow ${
        small ? "rounded-xl" : "rounded-3xl"
      } ${backgroundColor}`}>
        <Text className={twMerge(`${small ? "text-lg" : "text-2xl"} font-pregular`, textClassName)}>
          {calculatorButtons[calcKey].symbol}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <Modal visible={open} animationType={"slide"} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 flex-row bg-cloud justify-between p-4">
        <View className="mx-auto flex w-full max-w-2xl">
          <View className="flex ml-4 mb-4">
            <TouchableOpacity className="self-start" activeOpacity={0.6} onPress={onClose}>
              <Image source={icons.chevronLeft} className="w-6 h-6" resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View className="mt-auto self-end">
            <Text className="text-right font-pregular">{answer}</Text>
            <ScrollView
              className="max-h-20"
              ref={resultScrollRef}
              onContentSizeChange={() => resultScrollRef.current?.scrollToEnd({ animated: true })}
            >
              <Text className="text-right text-2xl font-pregular" selectable selectionColor="#ff013f">
                {operation.join("")}
                <Text className="text-gray-300 font-pregular">{parenthesisCompletion}</Text>
              </Text>
            </ScrollView>
          </View>

          <View className="flex mt-auto items-end mx-4 mb-2" style={{ gap: 10 }}>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="e" small={true} />
              <Button calcKey="ln" small={true} />
              <Button calcKey="log" small={true} />
              <Button calcKey="factorial" small={true} />
              <Button calcKey="power" small={true} />
              <Button calcKey="squareroot" small={true} />
            </View>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="sin" small={true} />
              <Button calcKey="cos" small={true} />
              <Button calcKey="tan" small={true} />
              <Button calcKey="pi" small={true} />
              <Button calcKey="openparenthesis" small={true} />
              <Button calcKey="closeparenthesis" small={true} />
            </View>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="clear" backgroundColor="bg-gray-500" textClassName="text-white" />
              <Button calcKey="answer" backgroundColor="bg-gray-500" textClassName="text-white" />
              <Button calcKey="percent" backgroundColor="bg-gray-500" textClassName="text-white" />
              <Button calcKey="division" backgroundColor="bg-apple" textClassName="text-white" />
            </View>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="7" />
              <Button calcKey="8" />
              <Button calcKey="9" />
              <Button calcKey="multiplication" backgroundColor="bg-apple" textClassName="text-white" />
            </View>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="4" />
              <Button calcKey="5" />
              <Button calcKey="6" />
              <Button calcKey="subtraction" backgroundColor="bg-apple" textClassName="text-white" />
            </View>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="1" />
              <Button calcKey="2" />
              <Button calcKey="3" />
              <Button calcKey="addition" backgroundColor="bg-apple" textClassName="text-white" />
            </View>
            <View className="flex flex-row justify-evenly" style={{ gap: 10 }}>
              <Button calcKey="comma" />
              <Button calcKey="0" />
              <Button calcKey="delete" />
              <Button calcKey="calculate" backgroundColor="bg-apple" textClassName="text-white" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

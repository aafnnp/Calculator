import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [expression, setExpression] = useState('');

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setExpression(expression + num);
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === '0' ? String(num) : display + num;
      setDisplay(newDisplay);
      if (display === '0') {
        setExpression(expression + num);
      } else {
        setExpression(expression + num);
      }
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setExpression(expression + '0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      if (nextOperation !== '=') {
        setExpression(expression + ' ' + nextOperation + ' ');
      }
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      if (nextOperation === '=') {
        setExpression(expression + ' = ' + newValue);
      } else {
        setExpression(newValue + ' ' + nextOperation + ' ');
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performScientificOperation = (func) => {
    const inputValue = parseFloat(display);
    let result;

    switch (func) {
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        setExpression(`sin(${inputValue}) = ${result}`);
        break;
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        setExpression(`cos(${inputValue}) = ${result}`);
        break;
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        setExpression(`tan(${inputValue}) = ${result}`);
        break;
      case 'ln':
        result = Math.log(inputValue);
        setExpression(`ln(${inputValue}) = ${result}`);
        break;
      case 'log':
        result = Math.log10(inputValue);
        setExpression(`log(${inputValue}) = ${result}`);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        setExpression(`√(${inputValue}) = ${result}`);
        break;
      case 'x²':
        result = inputValue * inputValue;
        setExpression(`(${inputValue})² = ${result}`);
        break;
      case 'x³':
        result = inputValue * inputValue * inputValue;
        setExpression(`(${inputValue})³ = ${result}`);
        break;
      case '1/x':
        result = 1 / inputValue;
        setExpression(`1/(${inputValue}) = ${result}`);
        break;
      case 'π':
        result = Math.PI;
        setExpression(`π = ${result}`);
        break;
      case 'e':
        result = Math.E;
        setExpression(`e = ${result}`);
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const Button = ({ onPress, text, style, textStyle }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );

  const renderBasicButtons = () => (
    <View style={styles.buttonContainer}>
      <View style={styles.row}>
        <Button onPress={clear} text="C" style={styles.functionButton} textStyle={styles.functionButtonText} />
        <Button onPress={() => setIsScientific(!isScientific)} text="Sci" style={styles.functionButton} textStyle={styles.functionButtonText} />
        <Button onPress={() => {
          const newDisplay = display.slice(0, -1) || '0';
          setDisplay(newDisplay);
          if (expression.length > 0) {
            setExpression(expression.slice(0, -1));
          }
        }} text="⌫" style={styles.functionButton} textStyle={styles.functionButtonText} />
        <Button onPress={() => performOperation('÷')} text="÷" style={styles.operatorButton} textStyle={styles.operatorButtonText} />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(7)} text="7" />
        <Button onPress={() => inputNumber(8)} text="8" />
        <Button onPress={() => inputNumber(9)} text="9" />
        <Button onPress={() => performOperation('×')} text="×" style={styles.operatorButton} textStyle={styles.operatorButtonText} />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(4)} text="4" />
        <Button onPress={() => inputNumber(5)} text="5" />
        <Button onPress={() => inputNumber(6)} text="6" />
        <Button onPress={() => performOperation('-')} text="-" style={styles.operatorButton} textStyle={styles.operatorButtonText} />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(1)} text="1" />
        <Button onPress={() => inputNumber(2)} text="2" />
        <Button onPress={() => inputNumber(3)} text="3" />
        <Button onPress={() => performOperation('+')} text="+" style={styles.operatorButton} textStyle={styles.operatorButtonText} />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(0)} text="0" style={styles.zeroButton} />
        <Button onPress={inputDecimal} text="." />
        <Button onPress={() => performOperation('=')} text="=" style={styles.equalsButton} textStyle={styles.equalsButtonText} />
      </View>
    </View>
  );

  const renderScientificButtons = () => (
    <View style={styles.scientificContainer}>
      <View style={styles.scientificRow}>
        <Button onPress={() => performScientificOperation('sin')} text="sin" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('cos')} text="cos" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('tan')} text="tan" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('ln')} text="ln" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
      </View>
      <View style={styles.scientificRow}>
        <Button onPress={() => performScientificOperation('log')} text="log" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('sqrt')} text="√" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('x²')} text="x²" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('x³')} text="x³" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
      </View>
      <View style={styles.scientificRow}>
        <Button onPress={() => performScientificOperation('1/x')} text="1/x" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('π')} text="π" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => performScientificOperation('e')} text="e" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
        <Button onPress={() => setIsScientific(false)} text="Basic" style={styles.scientificButton} textStyle={styles.scientificButtonText} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.displayContainer}>
        <Text style={styles.expression}>{expression || ' '}</Text>
        <Text style={styles.display}>{display}</Text>
      </View>
      {isScientific ? renderScientificButtons() : null}
      {renderBasicButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    minHeight: 120,
  },
  expression: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
    textAlign: 'right',
    maxWidth: '100%',
    marginBottom: 8,
    minHeight: 24,
  },
  display: {
    fontSize: 56,
    color: '#fff',
    fontWeight: '300',
    textAlign: 'right',
    maxWidth: '100%',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    width: (width - 60) / 4,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '400',
  },
  functionButton: {
    backgroundColor: '#a6a6a6',
  },
  functionButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  operatorButton: {
    backgroundColor: '#ff9500',
  },
  operatorButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  equalsButton: {
    backgroundColor: '#ff9500',
    width: (width - 60) / 4,
  },
  equalsButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  zeroButton: {
    width: (width - 60) / 2 - 6,
    paddingLeft: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scientificContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  scientificRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
  },
  scientificButton: {
    width: (width - 80) / 4,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4a4a4a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  scientificButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});

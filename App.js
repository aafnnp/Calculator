import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import { useState, useCallback } from 'react'

const { width } = Dimensions.get('window')

export default function App() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [isScientific, setIsScientific] = useState(false)
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState([])
  const [isRadians, setIsRadians] = useState(false)
  const [error, setError] = useState('')

  const inputNumber = useCallback(
    (num) => {
      if (error) {
        clear()
      }
      if (waitingForOperand) {
        setDisplay(String(num))
        setExpression(String(num))
        setWaitingForOperand(false)
      } else {
        setDisplay((prev) => {
          const newDisplay = prev === '0' ? String(num) : prev + num
          setExpression((prevExpr) => (prev === '0' ? String(num) : prevExpr + num))
          return newDisplay
        })
      }
    },
    [error, waitingForOperand, clear]
  )

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setExpression('0.')
      setWaitingForOperand(false)
    } else {
      setDisplay((prev) => {
        if (prev.indexOf('.') === -1) {
          setExpression((prevExpr) => prevExpr + '.')
          return prev + '.'
        }
        return prev
      })
    }
  }, [waitingForOperand])

  const clear = useCallback(() => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
    setExpression('')
    setError('')
  }, [])

  const performOperation = useCallback(
    (nextOperation) => {
      setDisplay((prev) => {
        const inputValue = parseFloat(prev)

        if (previousValue === null) {
          setPreviousValue(inputValue)
          if (nextOperation !== '=') {
            setExpression((prevExpr) => prevExpr + ' ' + nextOperation + ' ')
          }
        } else if (operation) {
          const currentValue = previousValue || 0
          const newValue = calculate(currentValue, inputValue, operation)

          setPreviousValue(newValue)

          if (nextOperation === '=') {
            setExpression((prevExpr) => prevExpr + ' = ' + newValue)
          } else {
            setExpression(newValue + ' ' + nextOperation + ' ')
          }
          return String(newValue)
        }

        setWaitingForOperand(true)
        setOperation(nextOperation)
        return prev
      })
    },
    [previousValue, operation, calculate]
  )

  const calculate = useCallback((firstValue, secondValue, operation) => {
    try {
      switch (operation) {
        case '+':
          return firstValue + secondValue
        case '-':
          return firstValue - secondValue
        case '×':
          return firstValue * secondValue
        case '÷':
          if (secondValue === 0) {
            throw new Error('不能除以零')
          }
          return firstValue / secondValue
        case '=':
          return secondValue
        default:
          return secondValue
      }
    } catch (err) {
      setError(err.message)
      return 0
    }
  }, [])

  const performScientificOperation = (func) => {
    if (error) {
      clear()
    }

    const inputValue = parseFloat(display)
    let result

    try {
      switch (func) {
        case 'sin':
          result = Math.sin(isRadians ? inputValue : (inputValue * Math.PI) / 180)
          setExpression(`sin(${inputValue}) = ${result}`)
          break
        case 'cos':
          result = Math.cos(isRadians ? inputValue : (inputValue * Math.PI) / 180)
          setExpression(`cos(${inputValue}) = ${result}`)
          break
        case 'tan':
          result = Math.tan(isRadians ? inputValue : (inputValue * Math.PI) / 180)
          setExpression(`tan(${inputValue}) = ${result}`)
          break
        case 'asin':
          if (inputValue < -1 || inputValue > 1) {
            throw new Error('反正弦值超出范围')
          }
          result = isRadians ? Math.asin(inputValue) : (Math.asin(inputValue) * 180) / Math.PI
          setExpression(`arcsin(${inputValue}) = ${result}`)
          break
        case 'acos':
          if (inputValue < -1 || inputValue > 1) {
            throw new Error('反余弦值超出范围')
          }
          result = isRadians ? Math.acos(inputValue) : (Math.acos(inputValue) * 180) / Math.PI
          setExpression(`arccos(${inputValue}) = ${result}`)
          break
        case 'atan':
          result = isRadians ? Math.atan(inputValue) : (Math.atan(inputValue) * 180) / Math.PI
          setExpression(`arctan(${inputValue}) = ${result}`)
          break
        case 'ln':
          if (inputValue <= 0) {
            throw new Error('自然对数需要正数')
          }
          result = Math.log(inputValue)
          setExpression(`ln(${inputValue}) = ${result}`)
          break
        case 'log':
          if (inputValue <= 0) {
            throw new Error('常用对数需要正数')
          }
          result = Math.log10(inputValue)
          setExpression(`log(${inputValue}) = ${result}`)
          break
        case 'sqrt':
          if (inputValue < 0) {
            throw new Error('负数不能开平方根')
          }
          result = Math.sqrt(inputValue)
          setExpression(`√(${inputValue}) = ${result}`)
          break
        case 'cbrt':
          result = Math.cbrt(inputValue)
          setExpression(`∛(${inputValue}) = ${result}`)
          break
        case 'x²':
          result = inputValue * inputValue
          setExpression(`(${inputValue})² = ${result}`)
          break
        case 'x³':
          result = inputValue * inputValue * inputValue
          setExpression(`(${inputValue})³ = ${result}`)
          break
        case 'x^y':
          setExpression(`${inputValue}^`)
          setWaitingForOperand(true)
          return
        case '1/x':
          if (inputValue === 0) {
            throw new Error('不能除以零')
          }
          result = 1 / inputValue
          setExpression(`1/(${inputValue}) = ${result}`)
          break
        case 'x!':
          if (inputValue < 0 || inputValue !== Math.floor(inputValue)) {
            throw new Error('阶乘需要非负整数')
          }
          if (inputValue > 170) {
            throw new Error('数值过大')
          }
          result = factorial(inputValue)
          setExpression(`(${inputValue})! = ${result}`)
          break
        case 'π':
          result = Math.PI
          setExpression(`π = ${result}`)
          break
        case 'e':
          result = Math.E
          setExpression(`e = ${result}`)
          break
        case '±':
          result = -inputValue
          setExpression(`±(${inputValue}) = ${result}`)
          break
        case '10^x':
          result = Math.pow(10, inputValue)
          setExpression(`10^(${inputValue}) = ${result}`)
          break
        case 'e^x':
          result = Math.exp(inputValue)
          setExpression(`e^(${inputValue}) = ${result}`)
          break
        case '2^x':
          result = Math.pow(2, inputValue)
          setExpression(`2^(${inputValue}) = ${result}`)
          break
        default:
          return
      }

      if (isFinite(result)) {
        setDisplay(String(result))
        setWaitingForOperand(true)
        // 添加到历史记录
        setHistory((prev) => [...prev.slice(-9), `${expression} = ${result}`])
      } else {
        throw new Error('计算结果无效')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const factorial = (n) => {
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  // 键盘输入处理 - 暂时禁用以避免错误
  // useEffect(() => {
  //   const handleKeyPress = (event) => {
  //     const key = event.key
  //     // 键盘处理逻辑
  //   }
  //   if (typeof window !== 'undefined') {
  //     window.addEventListener('keydown', handleKeyPress)
  //     return () => {
  //       window.removeEventListener('keydown', handleKeyPress)
  //     }
  //   }
  // }, [])

  const Button = ({ onPress, text, style, textStyle }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  )

  const renderBasicButtons = () => (
    <View style={styles.buttonContainer}>
      <View style={styles.row}>
        <Button onPress={clear} text="C" style={styles.functionButton} textStyle={styles.functionButtonText} />
        <Button
          onPress={() => setIsScientific(!isScientific)}
          text="Sci"
          style={styles.functionButton}
          textStyle={styles.functionButtonText}
        />
        <Button
          onPress={() => {
            const newDisplay = display.slice(0, -1) || '0'
            setDisplay(newDisplay)
            if (expression.length > 0) {
              setExpression(expression.slice(0, -1))
            }
          }}
          text="⌫"
          style={styles.functionButton}
          textStyle={styles.functionButtonText}
        />
        <Button
          onPress={() => performOperation('÷')}
          text="÷"
          style={styles.operatorButton}
          textStyle={styles.operatorButtonText}
        />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(7)} text="7" />
        <Button onPress={() => inputNumber(8)} text="8" />
        <Button onPress={() => inputNumber(9)} text="9" />
        <Button
          onPress={() => performOperation('×')}
          text="×"
          style={styles.operatorButton}
          textStyle={styles.operatorButtonText}
        />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(4)} text="4" />
        <Button onPress={() => inputNumber(5)} text="5" />
        <Button onPress={() => inputNumber(6)} text="6" />
        <Button
          onPress={() => performOperation('-')}
          text="-"
          style={styles.operatorButton}
          textStyle={styles.operatorButtonText}
        />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(1)} text="1" />
        <Button onPress={() => inputNumber(2)} text="2" />
        <Button onPress={() => inputNumber(3)} text="3" />
        <Button
          onPress={() => performOperation('+')}
          text="+"
          style={styles.operatorButton}
          textStyle={styles.operatorButtonText}
        />
      </View>
      <View style={styles.row}>
        <Button onPress={() => inputNumber(0)} text="0" style={styles.zeroButton} />
        <Button onPress={inputDecimal} text="." />
        <Button
          onPress={() => performOperation('=')}
          text="="
          style={styles.equalsButton}
          textStyle={styles.equalsButtonText}
        />
      </View>
    </View>
  )

  const renderScientificButtons = () => (
    <View style={styles.scientificContainer}>
      <View style={styles.scientificRow}>
        <Button
          onPress={() => performScientificOperation('sin')}
          text="sin"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('cos')}
          text="cos"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('tan')}
          text="tan"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('ln')}
          text="ln"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
      </View>
      <View style={styles.scientificRow}>
        <Button
          onPress={() => performScientificOperation('asin')}
          text="arcsin"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('acos')}
          text="arccos"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('atan')}
          text="arctan"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('log')}
          text="log"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
      </View>
      <View style={styles.scientificRow}>
        <Button
          onPress={() => performScientificOperation('sqrt')}
          text="√"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('cbrt')}
          text="∛"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('x²')}
          text="x²"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('x³')}
          text="x³"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
      </View>
      <View style={styles.scientificRow}>
        <Button
          onPress={() => performScientificOperation('x^y')}
          text="x^y"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('x!')}
          text="x!"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('1/x')}
          text="1/x"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('±')}
          text="±"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
      </View>
      <View style={styles.scientificRow}>
        <Button
          onPress={() => performScientificOperation('π')}
          text="π"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('e')}
          text="e"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('10^x')}
          text="10^x"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => performScientificOperation('e^x')}
          text="e^x"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
      </View>
      <View style={styles.scientificRow}>
        <Button
          onPress={() => performScientificOperation('2^x')}
          text="2^x"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => setIsRadians(!isRadians)}
          text={isRadians ? 'RAD' : 'DEG'}
          style={[styles.scientificButton, isRadians && styles.activeButton]}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => setHistory([])}
          text="清除历史"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
        <Button
          onPress={() => setIsScientific(false)}
          text="Basic"
          style={styles.scientificButton}
          textStyle={styles.scientificButtonText}
        />
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.displayContainer}>
        <Text style={styles.expression}>{expression || ' '}</Text>
        <Text style={styles.display}>{error || display}</Text>
        {error && <Text style={styles.errorText}>按任意键继续</Text>}
      </View>
      {isScientific ? renderScientificButtons() : null}
      {renderBasicButtons()}
      {history.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>历史记录</Text>
          {history.slice(-5).map((item, index) => (
            <Text key={index} style={styles.historyItem}>
              {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
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
  activeButton: {
    backgroundColor: '#ff9500',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'right',
    marginTop: 8,
  },
  historyContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    maxWidth: 200,
    maxHeight: 200,
  },
  historyTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyItem: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
})

function decimalCutoff(decimalNum, decimalCutoffNum) {
    decimalNum += "";
    return decimalNum.substring(0, decimalNum.indexOf('.') + decimalCutoffNum);
}
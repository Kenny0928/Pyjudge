# 解題核心：計算 A / B，四捨五入到小數點後兩位後，
# 若為整數則輸出整數，否則去除小數尾端多餘的 0。
import sys

values = list(map(int, sys.stdin.read().split()))
a, b = values[0], values[1]
quotient = round(a / b, 2)

if quotient == int(quotient):
    print(int(quotient))
else:
    text = f"{quotient:.2f}".rstrip("0").rstrip(".")
    print(text)

# 解題核心：依序讀取兩個整數並輸出乘積。
# 積木對照：要求輸入 A → 要求輸入 B → 乘法積木 A×B → 說出結果。
import sys

values = list(map(int, sys.stdin.read().split()))
print(values[0] * values[1])

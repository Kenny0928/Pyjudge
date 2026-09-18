# 解題核心：依序讀取 A、B，直接輸出 A + B。
# 積木對照：要求輸入 A → 要求輸入 B → 加法積木 A+B → 說出結果。
import sys

values = list(map(int, sys.stdin.read().split()))
print(values[0] + values[1])

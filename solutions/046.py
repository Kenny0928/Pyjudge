# 解題核心：使用取餘數運算求 A 除以 B 後剩下的數量。
# 積木對照：要求輸入 A、B → 取餘數積木 → 說出結果。
import sys

values = list(map(int, sys.stdin.read().split()))
print(values[0] % values[1])

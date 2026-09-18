# 解題核心：讀取一行文字，使用 lower() 將英文字母全部轉為小寫。
# 積木對照：要求輸入文字 → 轉換為小寫積木 → 說出結果。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a.lower())

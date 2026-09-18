# 解題核心：讀取一行文字，使用 upper() 將英文字母全部轉為大寫。
# 積木對照：要求輸入文字 → 轉換為大寫積木 → 說出結果。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a.upper())

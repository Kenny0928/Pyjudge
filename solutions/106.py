# 解題核心：空字串視為不符合條件；非空時用 isdigit() 判斷是否全為數字字元。
import sys

s = sys.stdin.readline().rstrip("\n")
result = s != "" and s.isdigit()
print("true" if result else "false")

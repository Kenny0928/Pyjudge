# 解題核心：空字串視為不符合條件；非空時用 isalpha() 判斷是否全為英文字母。
import sys

s = sys.stdin.readline().rstrip("\n")
result = s != "" and s.isalpha()
print("true" if result else "false")

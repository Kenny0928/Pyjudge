# 解題核心：使用 str.startswith() 判斷字串開頭是否為固定字串 "Hello"，區分大小寫。
import sys

s = sys.stdin.readline().rstrip("\n")
print("true" if s.startswith("Hello") else "false")

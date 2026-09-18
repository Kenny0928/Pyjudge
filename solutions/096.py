# 解題核心：使用 in 運算子判斷 a 是否包含子字串 b，區分大小寫；空字串必定被視為包含在內。
import sys

a = sys.stdin.readline().rstrip("\n")
b = sys.stdin.readline().rstrip("\n")
print("true" if b in a else "false")

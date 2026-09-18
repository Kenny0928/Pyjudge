# 解題核心：使用 str.replace(b, c, 1) 只取代字串中第一個出現的 b。
import sys

a = sys.stdin.readline().rstrip("\n")
b = sys.stdin.readline().rstrip("\n")
c = sys.stdin.readline().rstrip("\n")
print(a.replace(b, c, 1))

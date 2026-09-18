# 解題核心：使用 str.endswith() 判斷字串結尾是否為驚嘆號 "!"。
import sys

s = sys.stdin.readline().rstrip("\n")
print("true" if s.endswith("!") else "false")

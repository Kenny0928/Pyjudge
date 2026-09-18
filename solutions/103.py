# 解題核心：使用切片 a[:-1] 移除最後一個字元；長度為 1 的字串會得到空字串。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a[:-1])

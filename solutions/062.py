# 解題核心：讀取整行字串後用切片 [::-1] 反轉字元順序。
import sys

text = sys.stdin.readline().rstrip("\n")
print(text[::-1])

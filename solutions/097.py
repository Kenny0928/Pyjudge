# 解題核心：使用切片 a[:3] 取出前三個字元；若原字串不足三個字元，切片會自動輸出整個字串。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a[:3])

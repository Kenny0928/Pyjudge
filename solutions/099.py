# 解題核心：讀入字串與兩個索引 m、n，使用切片 a[m:n]（0-indexed、不含 n）取出子字串。
import sys

a = sys.stdin.readline().rstrip("\n")
m = int(sys.stdin.readline())
n = int(sys.stdin.readline())
print(a[m:n])

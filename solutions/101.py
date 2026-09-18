# 解題核心：使用 str.replace(b, c) 由左至右依序取代所有不重疊出現的 b（與 Python 內建語意一致）。
import sys

a = sys.stdin.readline().rstrip("\n")
b = sys.stdin.readline().rstrip("\n")
c = sys.stdin.readline().rstrip("\n")
print(a.replace(b, c))

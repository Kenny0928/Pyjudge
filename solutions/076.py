# 解題核心：以空白切割成單字，逐一將字首轉大寫、其餘轉小寫，再以空白重新組合。
import sys

line = sys.stdin.readline().rstrip("\n")
words = line.split(" ")
result = " ".join(w[:1].upper() + w[1:].lower() for w in words)
print(result)

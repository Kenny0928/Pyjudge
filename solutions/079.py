# 解題核心：拆出百十個位數字，計算各位數字三次方和，比較是否等於原數。
n = int(input())
digits = [int(d) for d in str(n)]
total = sum(d ** 3 for d in digits)
print("true" if total == n else "false")

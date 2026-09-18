# 解題核心：走訪 1 到 N，依序檢查是否同為 3 與 5 的倍數、單一倍數，最後才輸出數字本身。
n = int(input())
results = []
for i in range(1, n + 1):
    if i % 15 == 0:
        results.append("FizzBuzz")
    elif i % 3 == 0:
        results.append("Fizz")
    elif i % 5 == 0:
        results.append("Buzz")
    else:
        results.append(str(i))
print(' '.join(results))

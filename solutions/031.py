# 解題核心：range(N, 0, -1) 產生從 N 遞減到 1 的倒序數列
# 積木對照解法：
#   ① [設定 n]
#   ② [重複 n 次，讓 i 從 n 倒數到 1] → [說出 i]
n = int(input())
for i in range(n, 0, -1):
    print(i)

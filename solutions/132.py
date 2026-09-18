# 解題核心（複製清單的獨立性）：一般判題只能比對標準輸出，無法直接觀察
# 「兩個名稱是否指向同一份記憶體」，因此本題把「複製」設計成可觀察的
# 行為：先用切片 a[:]（等同 list(a)）建立一份獨立的複製 b，接著才修改
# 原始清單 a 的其中一個元素。若複製正確（b 是新清單），修改 a 不會影響
# b，兩行輸出會分別呈現「複製 b（維持原值）」與「修改後的 a」。
# 錯誤示範：若寫成 b = a（沒有複製，只是多一個名稱指向同一份清單），
# 修改 a 之後 b 也會跟著改變，兩行輸出就會相同，這正是本題想避免的錯誤。
import sys

tokens = sys.stdin.read().split()
idx = 0
n = int(tokens[idx]); idx += 1
a = list(map(int, tokens[idx:idx + n])); idx += n

b = a[:]  # 建立獨立複製

if idx + 1 < len(tokens):
    i = int(tokens[idx])
    v = int(tokens[idx + 1])
    if 0 <= i < n:
        a[i] = v

print(" ".join(map(str, b)))
print(" ".join(map(str, a)))

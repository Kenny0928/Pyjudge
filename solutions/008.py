# 008. 智慧停車場管理員
# 難度：Easy

# 讀取樓層數 M 與每層車位數 N
M, N = map(int, input().split())

# 建立二維陣列，逐行讀取每層停車場的車位狀態
grid = []
for i in range(M):
    row = list(map(int, input().split()))
    grid.append(row)

# 初始化：總空位數、目前最多空位數、對應樓層編號
total_empty = 0
max_empty = -1
best_floor = 1

# 走訪每一層（列）
for i in range(M):
    floor_empty = 0

    # 走訪該層每個車位（行）
    for j in range(N):
        if grid[i][j] == 0:  # 0 代表空位
            floor_empty += 1

    total_empty += floor_empty

    # 僅在「嚴格大於」時更新，確保並列時保留編號最小的樓層
    if floor_empty > max_empty:
        max_empty = floor_empty
        best_floor = i + 1  # 樓層編號從 1 開始

# 輸出結果
print(total_empty)
print(best_floor, max_empty)

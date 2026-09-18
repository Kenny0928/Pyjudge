# 解題核心：固定的巢狀清單 [['a','b'],['c','d']]，用 idx1、idx2 兩層索引取值。
import sys

grid = [['a', 'b'], ['c', 'd']]

tokens = sys.stdin.read().split()
idx1, idx2 = int(tokens[0]), int(tokens[1])
print(grid[idx1][idx2])

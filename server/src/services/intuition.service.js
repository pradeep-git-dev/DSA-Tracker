const problemIntuition = {
  "two-sum": {
    triggerClues: "Find a pair of numbers in an array that sum up to a target value.",
    coreInvariant: "We can trade space for time by storing the complement (target - x) in a hash map as we iterate. This enables O(1) lookups instead of O(N) linear scans.",
    commonPitfalls: "Re-using the same element at the current index (make sure to store indices in the map and compare), or incorrect boundary checks."
  },
  "contains-duplicate": {
    triggerClues: "Determine if any value appears at least twice in an array.",
    coreInvariant: "A hash set stores unique visited elements. If the set already contains the current number, we have found a duplicate in O(1) average lookup time.",
    commonPitfalls: "Assuming the array is sorted when it isn't (sorting first is O(N log N) time, whereas a hash set achieves O(N) time but uses O(N) space)."
  },
  "reverse-linked-list": {
    triggerClues: "Reverse a singly linked list.",
    coreInvariant: "Pointer redirection: For each node, point its 'next' pointer to the 'prev' node. We must maintain a reference to the 'next' node before changing the link, otherwise we lose the rest of the list.",
    commonPitfalls: "Creating a cycle or losing the tail node, off-by-one errors with null termination, or not updating the head pointer."
  },
  "valid-parentheses": {
    triggerClues: "Check if a string containing parentheses is valid (nested correctly).",
    coreInvariant: "LIFO (Last-In-First-Out): When we see an opening bracket, we push it onto a stack. A closing bracket must match the top item of the stack and pop it off.",
    commonPitfalls: "Forgetting to check if the stack is empty before popping (causes crash), or forgetting to check if stack is empty at the end (means unclosed brackets)."
  },
  "binary-tree-level-order-traversal": {
    triggerClues: "Traverse a binary tree level by level (from top to bottom, left to right).",
    coreInvariant: "FIFO Queue (BFS): Process nodes level-by-level. The size of the queue at the start of a level tells us exactly how many nodes are on that level, preventing nodes from different levels from mixing.",
    commonPitfalls: "Using dynamic queue length in the loop condition (always capture 'queue.length' in a variable before iterating the level), or pushing null nodes."
  },
  "coin-change": {
    triggerClues: "Find the minimum number of coins needed to make up a given amount.",
    coreInvariant: "Subproblem optimality (DP): The min coins for 'amount' is 1 + min(coins needed for 'amount - coin') for each coin. Since greedy fails (e.g. denominations [1, 3, 4] for amount 6), we must compute all subproblems.",
    commonPitfalls: "Using a greedy approach (fails for non-canonical systems), initializing the DP array with 0 instead of infinity (or amount + 1), or array index out-of-bounds."
  },
  "number-of-islands": {
    triggerClues: "Count the number of contiguous groups of 1s in a grid.",
    coreInvariant: "Connected components (DFS/BFS): When we find a '1', increment the island count and use DFS/BFS to sink/visit all connected '1's. This prevents double counting.",
    commonPitfalls: "Not marking nodes as visited immediately (can cause infinite recursion or queue overflow), or not checking boundary limits (row >= 0 && row < R && col >= 0 && col < C)."
  }
};

const topicTemplates = {
  "Array": {
    triggerClues: "Operations on arrays, contiguous subsegments, prefix sums, or frequency counting.",
    coreInvariant: "Precomputing prefixes/suffixes or using hash maps allows queries to be processed in O(1) time without repeating O(N) subarray traversals.",
    commonPitfalls: "Out-of-bounds indices, off-by-one limits (especially index 0 or N-1), or modifying the array during iteration without tracking pointers."
  },
  "Two Pointers": {
    triggerClues: "Sorted array, searching pairs, or reversing subsegments.",
    coreInvariant: "Two pointers move towards each other or at different speeds. Sorting enables us to make optimal decisions on which pointer to move based on comparison with target.",
    commonPitfalls: "Infinite loops due to pointers not incrementing/decrementing, out-of-bounds steps, or missing boundary checks on empty arrays."
  },
  "Sliding Window": {
    triggerClues: "Contiguous subarray/substring, min/max length, constraints on elements.",
    coreInvariant: "Reuse subarray computation: Instead of recalculating the window from scratch, add the incoming element on the right and subtract the outgoing element on the left.",
    commonPitfalls: "Shrinking the window too early, off-by-one window boundaries, or not updating the global answer properly inside the contraction loop."
  },
  "Binary Search": {
    triggerClues: "Sorted array/range, optimal solution search, threshold constraint.",
    coreInvariant: "Halving the search space: Define a range `[L, R]`. Compute `mid = L + (R-L)/2`. Check if the answer lies to the left or right of `mid`, narrowing the search space by half.",
    commonPitfalls: "Integer overflow on `(L + R)/2` (always use `L + Math.floor((R-L)/2)`), infinite loops on division boundaries, or incorrect pointer updates (`L = mid` instead of `L = mid + 1`)."
  },
  "Stack": {
    triggerClues: "Nested structures, parsing, monotonic order requirement, or backtracking.",
    coreInvariant: "LIFO (Last-In-First-Out) order maintains history. Monotonic stacks preserve items in increasing/decreasing order to find the next greater/smaller element in O(N) total time.",
    commonPitfalls: "Popping from an empty stack, incorrect comparison operator in monotonic checks, or neglecting leftover items on the stack after processing."
  },
  "Linked List": {
    triggerClues: "Sequential traversal, insertion/deletion, merging nodes, or cycle detection.",
    coreInvariant: "Pointer manipulation: Use dummy heads to simplify boundary cases (like deleting the head). Use fast/slow pointers for middle detection and cycle detection.",
    commonPitfalls: "Dereferencing null pointers (e.g., trying to access `curr.next.next` without checking `curr.next`), losing node references during updates, or creating cycles."
  },
  "Tree": {
    triggerClues: "Hierarchical relationships, traversal, path optimization, or BST properties.",
    coreInvariant: "Divide and conquer (DFS): The solution for the root node is derived from recursively combining solutions of the left and right subtrees.",
    commonPitfalls: "Failing to handle the base case (empty/null node returns default values), not returning values from recursive calls, or mismatching BST boundaries."
  },
  "Graph": {
    triggerClues: "Network connectivity, shortest paths, cycles, topological dependencies.",
    coreInvariant: "Graph traversal: BFS finds the shortest path in unweighted networks. DFS explores depth. Topological sorting detects dependencies using node in-degrees.",
    commonPitfalls: "Infinite cycles because visited state is not tracked, queue/stack overflow on large graphs, or off-by-one index mapping for vertices."
  },
  "Dynamic Programming": {
    triggerClues: "Optimization, counting combinations, overlapping subproblems.",
    coreInvariant: "Memoization / Tabulation: Solve each subproblem exactly once and store its result. Build complex solutions from previously computed simpler states.",
    commonPitfalls: "Incorrect state transition formula, incorrect base cases, using greedy heuristics when they are suboptimal, or using excessive memory (not optimizing 2D DP to 1D)."
  }
};

export function getIntuition(slug, topic) {
  if (slug && problemIntuition[slug]) {
    return problemIntuition[slug];
  }
  
  if (topic && topicTemplates[topic]) {
    return topicTemplates[topic];
  }
  
  return {
    triggerClues: "Look for key constraints (e.g. N <= 10^5 indicates O(N log N) or O(N)), input sorting, or target requirements.",
    coreInvariant: "Identify the property that stays constant (e.g. sum, frequency, sorted order) and use it to prune search space or perform single-pass updates.",
    commonPitfalls: "Edge cases (empty input, single element, negative values), integer overflow, or off-by-one loop boundaries."
  };
}

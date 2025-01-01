import { NextRequest, NextResponse } from "next/server";
import * as acorn from "acorn";

export async function POST(req) {
  const { code } = await req.json();

  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    // Metrics to determine complexities
    let timeComplexity = "O(1)";
    let spaceComplexity = "O(1)";
    let recursiveCalls = 0;
    let loops = 0;
    let nestedLoops = 0;
    let largeArrays = 0;
    let matrixOps = 0;
    let graphTraversal = false;
    let divideAndConquer = false;

    // Helper to detect recursion
    function isRecursive(funcNode) {
      let isRecursive = false;
      traverse(funcNode.body, (node) => {
        if (
          node.type === "CallExpression" &&
          node.callee.type === "Identifier" &&
          node.callee.name === funcNode.id.name
        ) {
          isRecursive = true;
        }
      });
      return isRecursive;
    }

    // AST Traversal
    function traverse(node, callback) {
      if (!node || typeof node !== "object") return;
      callback(node);
      for (const key in node) {
        if (node[key] && typeof node[key] === "object") {
          if (Array.isArray(node[key])) {
            node[key].forEach((child) => traverse(child, callback));
          } else {
            traverse(node[key], callback);
          }
        }
      }
    }

    // Analyze AST for patterns
    traverse(ast, (node) => {
      // Detect recursive functions
      if (node.type === "FunctionDeclaration") {
        if (isRecursive(node)) {
          recursiveCalls += 1;
          divideAndConquer = true; // Assume divide-and-conquer if recursion is present
        }
      }

      // Count loops
      if (node.type === "ForStatement" || node.type === "WhileStatement") {
        loops += 1;
        if (node.body && (node.body.type === "ForStatement" || node.body.type === "WhileStatement")) {
          nestedLoops += 1; // Nested loops
        }
      }

      // Detect matrix operations (e.g., Matrix Multiplication)
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        ["mulMat", "matrixMultiply", "strassen"].includes(node.callee.name)
      ) {
        matrixOps += 1;
        timeComplexity = "O(n^3)"; // Default matrix multiplication complexity
      }

      // Detect graph traversal (e.g., DFS, BFS, Dijkstra, MST)
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        ["DFS", "BFS", "dijkstra", "kruskal", "prim"].includes(node.callee.name)
      ) {
        graphTraversal = true;
        timeComplexity = "O(V + E)"; // Default for graph traversal
        spaceComplexity = "O(V)"; // Space for visited nodes
      }

      // Detect dynamic memory allocations (e.g., large arrays, dynamic programming)
      if (
        node.type === "VariableDeclarator" &&
        node.init &&
        (node.init.type === "ArrayExpression" || node.init.type === "ObjectExpression")
      ) {
        largeArrays += 1;
      }

      // Detect Divide and Conquer structures
      if (
        node.type === "BinaryExpression" &&
        (node.operator === "+" || node.operator === "*") &&
        (node.left.type === "CallExpression" || node.right.type === "CallExpression")
      ) {
        divideAndConquer = true;
        timeComplexity = "O(n log n)"; // Typical for divide-and-conquer
      }
    });

    // Combine results for Time Complexity
    if (recursiveCalls > 0) {
      timeComplexity = divideAndConquer ? "O(n log n)" : "O(n)";
    } else if (nestedLoops > 0) {
      timeComplexity = `O(n^${nestedLoops + 1})`;
    } else if (loops > 0) {
      timeComplexity = `O(n${loops > 1 ? `^${loops}` : ""})`;
    }

    // Combine results for Space Complexity
    if (largeArrays > 0 || matrixOps > 0) {
      spaceComplexity = `O(n${largeArrays > 1 ? `^${largeArrays}` : ""})`;
    }

    return NextResponse.json({ timeComplexity, spaceComplexity });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JavaScript code." });
  }
}

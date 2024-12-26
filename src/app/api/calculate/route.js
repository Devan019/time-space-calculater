import { NextRequest, NextResponse } from "next/server";
import * as acorn from "acorn";

export async function POST(req) {
  const { code } = await req.json();
  
  const ast = acorn.parse(code, { ecmaVersion: 2020 });

  let timeComplexity = "O(1)";
  let recursiveCalls = 0;
  let loopsPerCall = 0;

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

  // Traverse AST
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

  // Analyze AST
  traverse(ast, (node) => {
    if (node.type === "FunctionDeclaration") {
      if (isRecursive(node)) {
        recursiveCalls += 1;
      }
    } else if (node.type === "ForStatement" || node.type === "WhileStatement") {
      loopsPerCall += 1;
    }
  });

  // Combine results for Time Complexity
  if (recursiveCalls > 0) {
    timeComplexity = `O(n log n)`; // Common for divide-and-conquer algorithms
  } else if (loopsPerCall > 0) {
    timeComplexity = `O(n${loopsPerCall > 1 ? `^${loopsPerCall}` : ""})`;
  }

  // Space Complexity analysis (detecting large arrays)
  let spaceComplexity = "O(1)";
  traverse(ast, (node) => {
    if (node.type === "VariableDeclarator" && node.init && node.init.type === "ArrayExpression") {
      spaceComplexity = "O(n)"; // Assuming arrays grow with input size
    }
  });

  return NextResponse.json({ timeComplexity, spaceComplexity });
}

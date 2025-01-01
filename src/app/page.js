"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [inputCode, setInputCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [btnstate, setbtnstate] = useState(false);
  const [first, setfirst] = useState(true);
  const [spaceComplexity , setspaceComplexity] = useState("");
  const [timeComplexity , settimeComplexity] = useState("");

  useEffect(() => {
    if (!first) {
      const obj = {
        inputCode: inputCode,
        convertType: "javascript",
      };
      async function main() {
        try {
          let response = await axios.post("/api/prompts", obj);
          console.log(response.data)
          let strippedCode = response.data.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
          strippedCode = strippedCode.replace('javascript', '');
          strippedCode = strippedCode.replace(/```|'''/g, '').trim();
          setConvertedCode(strippedCode);
          
          const obj2 = {
            code: strippedCode
          }
          const ans = await axios.post("/api/calculate", obj2);
          console.log(ans.data)
          setspaceComplexity(ans.data.spaceComplexity)
          settimeComplexity(ans.data.timeComplexity)
          // Update state with the response data
        } catch (error) {
          console.error("Error:", error);
          setConvertedCode("Error generating conversion");
        }
      }
      main();
    } else {
      setfirst(false);
    }
  }, [btnstate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>Time - Space Calculater</h1>
      <textarea
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
        className="text-black"
        id="input"
        rows="20"
        cols="100"
      ></textarea>
      <br />
      <button
        onClick={() => {
          setbtnstate((prev) => !prev);
        }}
        className="bg-green-600 p-2 rounded-md"
        id="convert"
      >
        Calculate
      </button>
      <div>
        <div>TimeComplexity : <span className="text-blue-500">{timeComplexity}</span> </div>
        <div>SpaceComplexity : <span className="text-blue-500">{spaceComplexity}</span></div>
         {/* Using <pre> for better formatting */}
      </div>
    </div>
  );
}

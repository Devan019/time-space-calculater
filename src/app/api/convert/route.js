import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req) {

    const { inputCode, convertType } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMEINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `pls convert code ${inputCode} to ${convertType} and only code and code remove comment`;

    const result = await model.generateContent(prompt);
    
    return NextResponse.json(result.response.text())

}

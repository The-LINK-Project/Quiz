import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserResult from "@/models/userResult";
import mongoose from "mongoose";

// creating fixed userId for testing purposes
const TEST_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Use the fixed test userId
    const userId = TEST_USER_ID;
    
    const data = await request.json();
    
    const { lessonId, quizId, score, answers } = data;
    
    if (!lessonId || !quizId || score === undefined || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const result = await UserResult.create({
      userId,
      lessonId: new mongoose.Types.ObjectId(lessonId),
      quizId: new mongoose.Types.ObjectId(quizId),
      score,
      answers
    });
    
    return NextResponse.json({
      message: "Quiz result saved successfully",
      result
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json(
      { error: "Failed to save quiz result" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Use fixed test userId
    const userId = TEST_USER_ID;
    
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    
    const query: any = { userId };
    
    if (lessonId) {
      query.lessonId = new mongoose.Types.ObjectId(lessonId);
    }
    
    const results = await UserResult.find(query)
      .sort({ completedAt: -1 })
      .limit(20);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz results" },
      { status: 500 }
    );
  }
}
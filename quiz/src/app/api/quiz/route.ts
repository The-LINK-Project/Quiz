import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/quiz";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Validate if lessonId is a valid ObjectID
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json(
        { error: "Invalid Lesson ID format" },
        { status: 400 }
      );
    }

    // Try to find quiz without converting lessonId to ObjectId
    // This will help diagnose if the issue is with the ObjectId conversion
    const quiz = await Quiz.findOne({ lessonId: lessonId });

    // Log details for debugging
    console.log("Searching for lessonId:", lessonId);
    console.log("Quiz found:", quiz);

    // If no quiz is found with string comparison, try a different approach
    if (!quiz) {
      // Try listing all quizzes to see what's available
      const allQuizzes = await Quiz.find({}).limit(5);
      console.log("Available quizzes:", JSON.stringify(allQuizzes, null, 2));

      return NextResponse.json(
        {
          error: "Quiz not found for this lesson",
          message: "Please check if the lessonId exists in the database",
          debug: {
            searchedId: lessonId,
            availableQuizCount: allQuizzes.length,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quiz",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
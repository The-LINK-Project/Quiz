import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/quiz";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    
    const lessonId = "60f8a8d5287f1e00203b5f9b";
    
    // Check if a quiz for this lesson already exists
    const existingQuiz = await Quiz.findOne({ 
      lessonId: new mongoose.Types.ObjectId(lessonId) 
    });
    
    if (existingQuiz) {
      // Delete existing quiz for testing purposes
      await Quiz.findByIdAndDelete(existingQuiz._id);
    }
    
    // Create a new quiz with 3 questions
    const testQuiz = {
      lessonId: new mongoose.Types.ObjectId(lessonId),
      title: "Simple Present Tense Quiz",
      questions: [
        {
          questionText: "What is the correct form of the verb in: She ___ to work at 8 AM?",
          options: ["go", "goes", "going", "gone"],
          correctAnswerIndex: 1
        },
        {
          questionText: "Which sentence is correct?",
          options: [
            "He play football",
            "He plays football", 
            "He playing football", 
            "He played football"
          ],
          correctAnswerIndex: 1
        },
        {
          questionText: "Choose the correct sentence:",
          options: [
            "They doesn't work here", 
            "They don't works here", 
            "They don't working here", 
            "They don't work here"
          ],
          correctAnswerIndex: 3
        }
      ]
    };
    
    const savedQuiz = await Quiz.create(testQuiz);
    
    return NextResponse.json({
      message: "Test quiz created successfully",
      quiz: savedQuiz
    });
  } catch (error) {
    console.error("Error in test:", error);
    return NextResponse.json(
      { 
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
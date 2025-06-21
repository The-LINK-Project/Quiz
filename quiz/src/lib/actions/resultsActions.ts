'use server'
import { revalidatePath } from "next/cache"
import connectToDatabase from "../mongodb"
import UserResult from "@/models/userResult"
import mongoose from "mongoose"

const TEST_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");
// submitting and sending over the quiz results to mongodb
export async function saveQuizResult(formData: FormData){
  try {
    await connectToDatabase();
    const lessonId = formData.get("lessonId") as string;
    const quizId = formData.get("quizId") as string;
    const score = parseInt(formData.get("score") as string);
    const answersJson = formData.get("answers") as string;
    const answers = JSON.parse(answersJson);

    if (!lessonId || !quizId || isNaN(score) || !answers) {
      throw new Error("Missing required fields");
    }
    const result = await UserResult.create({
      userId: TEST_USER_ID,
      lessonId: new mongoose.Types.ObjectId(lessonId),
      quizId: new mongoose.Types.ObjectId(quizId),
      score,
      answers
    });
    revalidatePath("/results");
    return result;


    
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
}

export async function getUserResults(lessonId?: string) {
  try {
    await connectToDatabase();
    const query: any = { userId: TEST_USER_ID };

    if (lessonId) {
      query.lessonId = new mongoose.Types.ObjectId(lessonId);
    }

    const results = await UserResult.find(query).populate("lessonId quizId").sort({ completedAt: -1 });
    return results;
  } catch (error) {
    console.error("Error fetching user results:", error);
    throw error;
  }
}
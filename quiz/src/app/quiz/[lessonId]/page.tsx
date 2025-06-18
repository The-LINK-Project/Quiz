// /app/quiz/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Document } from "mongoose";

interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface Quiz extends Document {
  lessonId: string;
  title: string;
  questions: Question[];
}

type QuizPageProps = {
  params: {
    lessonId: string;
  };
};

export default function QuizPage({ params }: QuizPageProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `/api/quiz?lessonId=${params.lessonId}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          console.error("Failed to fetch quiz, status:", res.status);
          setIsLoading(false);
          return;
        }

        const quizData = await res.json();
        setQuiz(quizData);
        setSelectedAnswers(new Array(quizData.questions.length).fill(-1));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [params.lessonId]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Calculate score
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    
    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    // Save result to database
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: params.lessonId,
          quizId: quiz._id,
          score: calculatedScore,
          answers: selectedAnswers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quiz result');
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="flex justify-center items-center min-h-screen">Quiz not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>
      
      {!isSubmitted ? (
        <>
          {quiz.questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-8 p-4 border rounded-lg shadow-sm">
              <p className="font-medium mb-4">{q.questionText}</p>
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <div 
                    key={optIndex}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedAnswers[qIndex] === optIndex 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(qIndex, optIndex)}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(-1)}
            className={`px-6 py-2 rounded-md ${
              selectedAnswers.includes(-1)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Submit Quiz
          </button>
        </>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
          <p className="text-4xl font-bold mb-6">{score}%</p>
          <p className="mb-6">
            You got {selectedAnswers.filter((ans, idx) => 
              ans === quiz.questions[idx].correctAnswerIndex
            ).length} out of {quiz.questions.length} questions correct.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
}
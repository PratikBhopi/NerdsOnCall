"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { QuestionList } from "@/components/questions/QuestionList"
import { useAuth } from "@/context/AuthContext"
import { PlusCircle, MessagesSquare } from "lucide-react"

export default function QuestionsPage() {
    const { user } = useAuth()
    const isTutor = user?.role === "TUTOR"

    const handleAskQuestion = () => {
        if (!user) {
            window.location.href = "/auth/login"
            return
        }
        window.location.href = "/questions/ask"
    }

    return (
        <div className="min-h-screen flex flex-col bg-yellow-100">
            <Navbar />
            <main className="flex-grow">
                {/* Hero */}
                <div className="bg-yellow-200 border-b-3 border-black">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 uppercase tracking-wide text-black">
                                <span className="inline-block bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] px-5 py-2.5 sm:px-7 sm:py-3.5 mb-10">
                                    <span className="inline-flex items-center gap-3">
                                        <MessagesSquare
                                            className="h-7 w-7 sm:h-9 sm:w-9"
                                            strokeWidth={2.5}
                                        />
                                        Community Questions
                                    </span>
                                </span>
                            </h1>

                            <button
                                onClick={handleAskQuestion}
                                className="inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 bg-pink-300 hover:bg-pink-400 text-black border-3 border-black shadow-[5px_5px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_black] font-black uppercase tracking-wide transition-all text-sm sm:text-base"
                            >
                                <PlusCircle
                                    className="h-5 w-5"
                                    strokeWidth={2.5}
                                />
                                Ask a Question
                            </button>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full">
                    <QuestionList isTutor={isTutor} />
                </div>
            </main>
            <Footer />
        </div>
    )
}

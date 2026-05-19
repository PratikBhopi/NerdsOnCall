"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-orange-200 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Image Section */}
                    <div className="flex justify-center items-center order-2 lg:order-1">
                        <div className="relative">
                            <img
                                src="/404-error.png"
                                alt="404 Error Illustration"
                                className="w-full max-w-lg h-auto"
                            />
                        </div>
                    </div>

                    {/* Error Content Section */}
                    <div className="w-full max-w-md mx-auto order-1 lg:order-2">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-black mb-4 leading-none uppercase tracking-wider">
                                404
                            </h1>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black mb-4 leading-tight uppercase tracking-wide">
                                Page Not Found
                            </h2>
                            <p className="text-black text-lg lg:text-xl font-bold mb-8">
                                Oops! The page you&apos;re looking for
                                doesn&apos;t exist.
                            </p>
                        </div>

                        {/* Action Card */}
                        <Card className="bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_black]">
                            <CardHeader className="bg-black text-white p-6">
                                <CardTitle className="text-white text-xl font-black uppercase tracking-wide text-center">
                                    What would you like to do?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {/* Go Home Button */}
                                <Link href="/" className="block">
                                    <Button className="w-full h-14 bg-green-500 border-4 border-black text-white font-black text-lg shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide">
                                        <Home className="h-6 w-6 mr-3" />
                                        Go Home
                                    </Button>
                                </Link>

                                {/* Go Back Button */}
                                <Button
                                    onClick={() => window.history.back()}
                                    className="w-full h-14 bg-blue-500 border-4 border-black text-white font-black text-lg shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide"
                                >
                                    <ArrowLeft className="h-6 w-6 mr-3" />
                                    Go Back
                                </Button>

                                {/* Browse Tutors Button */}
                                <Link href="/browse-tutors" className="block">
                                    <Button className="w-full h-14 bg-purple-500 border-4 border-black text-white font-black text-lg shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide">
                                        <Search className="h-6 w-6 mr-3" />
                                        Browse Tutors
                                    </Button>
                                </Link>

                                {/* Help Text */}
                                <div className="text-center pt-4">
                                    <p className="text-black font-bold text-sm">
                                        If you think this is a mistake, please{" "}
                                        <Link
                                            href="/contact"
                                            className="underline hover:no-underline font-black"
                                        >
                                            contact us
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

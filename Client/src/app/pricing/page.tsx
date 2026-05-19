import { Pricing } from "@/components/landing/Pricing"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function PricingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-yellow-100">
            <Navbar />
            <main className="flex-grow">
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}

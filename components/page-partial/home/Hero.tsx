import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Check, Zap, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit bg-blue-100 text-blue-700 border-blue-200"
              >
                <Star className="w-3 h-3 mr-1" />
                Trusted by 10,000+ teams
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Organize your work with{" "}
                <span className="text-blue-600">🧀 Kesllo</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                The visual way to manage any project, workflow, or team. Move
                work forward with boards, lists, and cards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 cursor-pointer"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Free forever
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Setup in minutes
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Project Board</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      To Do
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded border text-sm">
                        Design new logo
                      </div>
                      <div className="bg-white p-3 rounded border text-sm">
                        Update website
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      In Progress
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded border text-sm truncate">
                        Write documentation
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Done
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded border text-sm">
                        Setup project
                      </div>
                      <div className="bg-white p-3 rounded border text-sm">
                        Team meeting
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
              <Check className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

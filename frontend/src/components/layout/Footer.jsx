import Link from "next/link"
import { Code, Github, Twitter, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">CodeMaster</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              The ultimate platform for coding challenges, competitions, and skill development. 
              Master programming with our comprehensive problem sets and interactive learning environment.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/problems" className="text-slate-400 hover:text-white transition-colors">
                  Problems
                </Link>
              </li>
              <li>
                <Link href="/contests" className="text-slate-400 hover:text-white transition-colors">
                  Contests
                </Link>
              </li>              <li>
                <Link href="/leaderboard" className="text-slate-400 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/discussions" className="text-slate-400 hover:text-white transition-colors">
                  Discussions
                </Link>
              </li>
              <li>
                <Link href="/discussions" className="text-slate-400 hover:text-white transition-colors">
                  Discussions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-slate-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2024 CodeMaster. All rights reserved. Built with ❤️ for developers by Namanmeet Singh.
          </p>
        </div>
      </div>
    </footer>
  )
}
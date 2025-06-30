"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeMaster
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Authentication Error</h1>
          <p className="text-muted-foreground">Something went wrong during sign in</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Sign In Failed</CardTitle>
            <CardDescription>
              We encountered an issue while trying to sign you in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Please try again or use a different sign in method.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/register">
                  Create New Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

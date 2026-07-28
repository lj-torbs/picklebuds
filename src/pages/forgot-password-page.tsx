import { useState } from "react"
import { CalendarCheck, Mail } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { loginSchema, sanitizeEmail } from "@/lib/validation"

export function ForgotPasswordPage() {
  const toast = useToast()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = loginSchema.shape.email.safeParse(sanitizeEmail(email))

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ?? "Enter a valid email address."
      )
      return
    }

    setError("")
    setSent(true)
    toast.add({
      title: "Check your inbox",
      description: `If an account exists for ${result.data}, reset instructions are on the way.`,
      type: "success",
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto flex w-fit items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarCheck className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold">PickleBuddy</span>
          </Link>
          <CardTitle className="mt-2 text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the email on your account and we'll send you reset
            instructions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              If an account exists for that email, a reset link is on its way.
              It can take a few minutes to arrive.
            </p>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="forgot-email"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    className="pl-8"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(error)}
                    required
                  />
                </div>
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Remembered it after all?{" "}
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              to="/login"
            >
              Back to log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

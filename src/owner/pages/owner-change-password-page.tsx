import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"

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
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { PickleBuddyLogo } from "@/shared/components/brand/picklebuddy-logo"

function passwordIsValid(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

export function OwnerChangePasswordPage() {
  const { owner, changePassword, logout } = useOwnerAuth()
  const navigate = useNavigate()
  const isSubmittingRef = useRef(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const passwordHelp = useMemo(() => {
    if (!newPassword) return "Use at least 8 characters with a letter and a number."
    if (!passwordIsValid(newPassword)) return "Password must include at least 8 characters, one letter, and one number."
    if (confirmPassword && newPassword !== confirmPassword) return "Passwords do not match."
    return "Password strength looks acceptable."
  }, [confirmPassword, newPassword])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmittingRef.current) return

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormMessage("Complete all password fields.")
      return
    }
    if (!passwordIsValid(newPassword)) {
      setFormMessage("New password must include at least 8 characters, one letter, and one number.")
      return
    }
    if (newPassword !== confirmPassword) {
      setFormMessage("New password and confirmation must match.")
      return
    }
    if (currentPassword === newPassword) {
      setFormMessage("New password must be different from the temporary password.")
      return
    }

    setFormMessage(null)
    isSubmittingRef.current = true
    setIsSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword })
      navigate("/owner/dashboard", { replace: true })
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Unable to change password right now."
      )
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-sidebar px-4 py-10">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Change temporary password</CardTitle>
          <CardDescription>
            {owner?.email
              ? `Secure ${owner.email} before opening the owner console.`
              : "Secure this owner account before opening the owner console."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="owner-change-password-form" className="grid gap-4" onSubmit={handleSubmit}>
            {formMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formMessage}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="current-password">Temporary password</Label>
              <Input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-muted-foreground">{passwordHelp}</p>
            </div>

            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
              onClick={() => setShowPasswords((current) => !current)}
            >
              {showPasswords ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
              {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            type="submit"
            form="owner-change-password-form"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save new password"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              logout()
              navigate("/owner/login", { replace: true })
            }}
          >
            Use another account
          </Button>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <PickleBuddyLogo className="size-4 rounded-sm" />
            Powered by PickleBuddy
          </span>
        </CardFooter>
      </Card>
    </main>
  )
}

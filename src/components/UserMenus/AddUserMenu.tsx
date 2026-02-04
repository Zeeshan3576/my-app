import { useState, type SyntheticEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type AddUserMenuProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { name: string; email: string }) => string | null
}

export function AddUserMenu({ open, onClose, onSubmit }: AddUserMenuProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  if (!open) {
    return null
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) {
      return
    }

    const submitError = onSubmit({ name: trimmedName, email: trimmedEmail })
    if (submitError) {
      setError(submitError)
      return
    }

    setName("")
    setEmail("")
    setError("")
    onClose()
  }

  const handleClose = () => {
    setName("")
    setEmail("")
    setError("")
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Add user"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>Add User</FieldLegend>
            <FieldDescription>Enter the new user details.</FieldDescription>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <FieldDescription>Provide the full name</FieldDescription>
                </FieldContent>
                <Input
                  id="name"
                  placeholder="Username"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldDescription>Use a valid email address</FieldDescription>
                </FieldContent>
                <Input
                  id="email"
                  placeholder="asdf@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              {error ? (
                <div className="text-sm text-red-600" role="alert">
                  {error}
                </div>
              ) : null}
              <Field orientation="responsive">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div>
  )
}

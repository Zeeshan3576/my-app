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
import type { UserRecord } from "@/data/users"

type EditUserMenuProps = {
  open: boolean
  user: UserRecord | null
  onClose: () => void
  onSubmit: (payload: { id: string; name: string; email: string }) => string | null
}

export function EditUserMenu({
  open,
  user,
  onClose,
  onSubmit,
}: EditUserMenuProps) {
  const [name, setName] = useState(() => user?.name ?? "")
  const [email, setEmail] = useState(() => user?.email ?? "")
  const [error, setError] = useState("")

  if (!open || !user) {
    return null
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) {
      return
    }

    const submitError = onSubmit({
      id: user.id,
      name: trimmedName,
      email: trimmedEmail,
    })
    if (submitError) {
      setError(submitError)
      return
    }

    setError("")
    onClose()
  }

  const handleClose = () => {
    setError("")
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Edit user"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>Edit User</FieldLegend>
            <FieldDescription>Update the user details.</FieldDescription>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                  <FieldDescription>Provide the full name</FieldDescription>
                </FieldContent>
                <Input
                  id="edit-name"
                  placeholder="Username"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                  <FieldDescription>Use a valid email address</FieldDescription>
                </FieldContent>
                <Input
                  id="edit-email"
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
                <Button type="submit">Save</Button>
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

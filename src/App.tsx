import './App.css'
import { useState } from 'react'
import { AddUserMenu } from './components/UserMenus/AddUserMenu'
import { EditUserMenu } from './components/UserMenus/EditUserMenu'
import { Button } from './components/ui/button'
import { UserList } from './components/UserList/UserList'
import type { UserRecord } from './data/users'
import { users as initialUsers } from './data/users'

function App() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [userList, setUserList] = useState(initialUsers)

  const handleAddUser = (payload: { name: string; email: string }) => {
    const normalizedEmail = payload.email.trim().toLowerCase()
    const isDuplicate = userList.some(
      (user) => user.email.trim().toLowerCase() === normalizedEmail
    )
    if (isDuplicate) {
      return "A user with that email already exists."
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email,
    }
    setUserList((prev) => [newUser, ...prev])
    return null
  }

  const handleEditUser = (payload: {
    id: string
    name: string
    email: string
  }) => {
    const normalizedEmail = payload.email.trim().toLowerCase()
    const isDuplicate = userList.some(
      (user) =>
        user.id !== payload.id &&
        user.email.trim().toLowerCase() === normalizedEmail
    )
    if (isDuplicate) {
      return 'A user with that email already exists.'
    }

    setUserList((prev) =>
      prev.map((user) =>
        user.id === payload.id
          ? { ...user, name: payload.name, email: payload.email }
          : user
      )
    )
    return null
  }

  return (
    <main>
      <div className="m-1.5">
        <Button onClick={() => setIsAddUserOpen(true)}>Add User</Button>
      </div>
      <AddUserMenu
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleAddUser}
      />
      <EditUserMenu
        key={editingUser?.id ?? 'edit-user-menu'}
        open={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUser}
      />
      <UserList
        users={userList}
        title="User Management"
        onEdit={(user) => setEditingUser(user)}
      />
    </main>
  )
}

export default App

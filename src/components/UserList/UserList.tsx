import './UserList.css'
import { useDeferredValue, useMemo, useState } from 'react'
import type { UserRecord } from '../../data/users'
import { Button } from '../ui/button'

type UserListProps = {
  users: UserRecord[]
  title?: string
  onEdit: (user: UserRecord) => void
}

export function UserList({ users, title = 'Users', onEdit }: UserListProps) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return users
    }

    return users.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(normalizedQuery)
      const emailMatch = user.email.toLowerCase().includes(normalizedQuery)
      return nameMatch || emailMatch
    })
  }, [users, normalizedQuery])

  return (
    <section className="user-list">
      <div className="user-list__search">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="user-list__search-input"
          placeholder="Search by name or email"
          aria-label="Search users by name or email"
        />
      </div>
      <div className="user-list__header">
        <h2>{title}</h2>
        <span>
          {filteredUsers.length} of {users.length} total
        </span>
      </div>
      <div className="user-list__table">
        <div className="user-list__head">
          <span>Name</span>
          <span>Email</span>
          <span className="user-list__actions">Actions</span>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="user-list__empty">No users match that search.</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="user-list__row">
              <span className="user-list__name">{user.name}</span>
              <span className="user-list__email">{user.email}</span>
              <span className="user-list__action">
                <Button onClick={() => onEdit(user)}>Edit</Button>
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

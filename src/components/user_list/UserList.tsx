import { useEffect, useState } from 'react'
import './UserList.css'

type UserApiResponse = {
  results: User[]
}

type User = {
  login: {
    uuid: string
    username: string
  }
  name: {
    first: string
    last: string
  }
  email: string
  picture: {
    large: string
  }
  location: {
    city: string
    country: string
  }
}

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      try {
        const response = await fetch('https://randomuser.me/api/?results=9')
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`)
        }
        const data: UserApiResponse = await response.json()
        if (isMounted) {
          setUsers(data.results)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        <h1>Typed User List</h1>
        <p>Fetching user data with a typed API response.</p>
      </header>

      {loading && <div className="app__status">Loading users...</div>}
      {error && !loading && (
        <div className="app__status app__status--error">Error: {error}</div>
      )}

      {!loading && !error && (
        <div className="user-grid">
          {users.map((user) => (
            <article key={user.login.uuid} className="user-card">
              <img
                className="user-card__avatar"
                src={user.picture.large}
                alt={`${user.name.first} ${user.name.last}`}
              />
              <div className="user-card__content">
                <h2 className="user-card__name">
                  {user.name.first} {user.name.last}
                </h2>
                <div className="user-card__meta">@{user.login.username}</div>
                <div className="user-card__location">
                  {user.location.city}, {user.location.country}
                </div>
                <a className="user-card__email" href={`mailto:${user.email}`}>
                  {user.email}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserList

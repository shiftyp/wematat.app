import React from 'react'
import ContactCard from './ContactCard'
import './ContactGrid.css'

export default function ContactGrid({ contacts, loading, error }) {
  if (loading) {
    return (
      <div className="grid-state">
        <div className="spinner" />
        <p>Loading your network…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid-state grid-error">
        <p>⚠️ {error}</p>
      </div>
    )
  }

  if (!contacts.length) {
    return (
      <div className="grid-state grid-empty">
        <p className="empty-icon">🤝</p>
        <p className="empty-title">No contacts yet</p>
        <p className="empty-sub">Add your first connection to get started.</p>
      </div>
    )
  }

  return (
    <div className="contact-grid">
      {contacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  )
}

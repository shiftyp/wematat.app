import React from 'react'
import './ContactCard.css'

const CHANNEL_ICONS = {
  linkedin: '💼',
  email: '✉️',
  twitter: '🐦',
  phone: '📱',
  github: '🐙',
  slack: '💬',
}

const CHANNEL_LABELS = {
  linkedin: 'LinkedIn',
  email: 'Email',
  twitter: 'Twitter / X',
  phone: 'Phone',
  github: 'GitHub',
  slack: 'Slack',
}

function ContactChannel({ type, value }) {
  const icon = CHANNEL_ICONS[type] || '🔗'
  const label = CHANNEL_LABELS[type] || type

  const href =
    type === 'email' ? `mailto:${value}` :
    type === 'phone' ? `tel:${value}` :
    value.startsWith('http') ? value :
    type === 'linkedin' ? `https://linkedin.com/in/${value}` :
    type === 'github' ? `https://github.com/${value}` :
    null

  return href ? (
    <a className="contact-channel" href={href} target="_blank" rel="noopener noreferrer" title={label}>
      <span className="channel-icon">{icon}</span>
      <span className="channel-label">{label}</span>
    </a>
  ) : (
    <span className="contact-channel" title={label}>
      <span className="channel-icon">{icon}</span>
      <span className="channel-label">{value}</span>
    </span>
  )
}

function TagPill({ tag }) {
  return <span className="tag-pill">{tag}</span>
}

function InitialsAvatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  // Deterministic color from name
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <div
      className="initials-avatar"
      style={{ background: `hsl(${hue}, 55%, 35%)` }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

export default function ContactCard({ contact }) {
  const {
    name,
    role,
    company,
    how_met,
    date_met,
    notes,
    tags = [],
    contact_channels = {},
    follow_up_days,
    snoozed_until,
  } = contact

  const metDate = date_met
    ? new Date(date_met).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  const channelEntries = Object.entries(contact_channels).filter(([, v]) => v)
  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? JSON.parse(tags || '[]')
      : []

  return (
    <article className="contact-card">
      <div className="card-header">
        <InitialsAvatar name={name} />
        <div className="card-title">
          <h2 className="contact-name">{name}</h2>
          <p className="contact-role">
            {role}
            {company && <span className="contact-company"> · {company}</span>}
          </p>
        </div>
      </div>

      {how_met && (
        <div className="card-section">
          <span className="section-label">How we met</span>
          <p className="section-content">{how_met}</p>
        </div>
      )}

      {notes && (
        <div className="card-section">
          <span className="section-label">Context</span>
          <p className="section-content notes">{notes}</p>
        </div>
      )}

      {tagList.length > 0 && (
        <div className="tag-row">
          {tagList.map(tag => <TagPill key={tag} tag={tag} />)}
        </div>
      )}

      {channelEntries.length > 0 && (
        <div className="channels-row">
          {channelEntries.map(([type, value]) => (
            <ContactChannel key={type} type={type} value={value} />
          ))}
        </div>
      )}

      <div className="card-footer">
        {metDate && <span className="met-date">Met {metDate}</span>}
        {follow_up_days && (
          <span className="follow-up-badge">
            Follow up every {follow_up_days}d
          </span>
        )}
      </div>
    </article>
  )
}

import React, { useState, useEffect } from 'react'
import ContactGrid from './components/ContactGrid'
import './App.css'

// Sample contacts for demo / dev (replace with live API data)
const DEMO_CONTACTS = [
  {
    id: '1',
    name: 'Maya Patel',
    role: 'Senior Product Designer',
    company: 'Figma',
    how_met: 'Design Systems meetup, NYC — March 2025',
    date_met: '2025-03-14',
    notes: 'Working on an open-source design token library. Mentioned interest in AI-assisted design tooling. Would love to collaborate on a side project.',
    tags: ['design', 'open-source', 'AI tooling'],
    contact_channels: {
      linkedin: 'maya-patel-design',
      email: 'maya@example.com',
    },
    follow_up_days: 30,
  },
  {
    id: '2',
    name: 'Jordan Lee',
    role: 'Engineering Manager',
    company: 'Stripe',
    how_met: 'Referred by Alex Chen — coffee chat in SF',
    date_met: '2025-06-02',
    notes: 'Deep into platform engineering and developer experience. Building internal tools for reliability. Looking for senior IC hires.',
    tags: ['platform', 'devex', 'hiring'],
    contact_channels: {
      linkedin: 'jordan-lee-eng',
      twitter: 'jlee_eng',
    },
    follow_up_days: 45,
  },
  {
    id: '3',
    name: 'Priya Sharma',
    role: 'ML Research Lead',
    company: 'Hugging Face',
    how_met: 'NeurIPS poster session — December 2024',
    date_met: '2024-12-11',
    notes: 'Working on efficient fine-tuning methods (LoRA variants). Shared interest in on-device inference. Will be speaking at a workshop in spring.',
    tags: ['ML', 'LoRA', 'research'],
    contact_channels: {
      github: 'priyasharma-ml',
      email: 'priya@example.com',
    },
    follow_up_days: 60,
  },
  {
    id: '4',
    name: 'Carlos Rivera',
    role: 'Founder',
    company: 'Buildspace',
    how_met: 'Twitter DMs → virtual coffee',
    date_met: '2025-01-20',
    notes: 'Building community for indie hackers in LATAM. Wants to explore AI curriculum partnerships. Very well networked in startup/VC circles.',
    tags: ['founder', 'community', 'edtech'],
    contact_channels: {
      twitter: 'carlosbuilds',
      linkedin: 'carlos-rivera-founder',
    },
    follow_up_days: 21,
  },
  {
    id: '5',
    name: 'Sam Okonkwo',
    role: 'Staff Engineer',
    company: 'Vercel',
    how_met: 'Cloudflare Workers Discord server',
    date_met: '2025-04-08',
    notes: 'Expert in edge computing and server-side rendering at scale. Interested in WebAssembly experiments. Always worth asking about CF / Vercel trade-offs.',
    tags: ['edge', 'Vercel', 'Cloudflare', 'WASM'],
    contact_channels: {
      github: 'samokonkwo',
      linkedin: 'sam-okonkwo',
    },
    follow_up_days: 30,
  },
  {
    id: '6',
    name: 'Lena Fischer',
    role: 'Head of Data Science',
    company: 'N26',
    how_met: 'Data Leadership conference, Berlin',
    date_met: '2025-09-19',
    notes: 'Leading a team building real-time fraud models. Interested in LLM-assisted analytics. Possible collaboration on evaluation frameworks.',
    tags: ['data science', 'fintech', 'LLM eval'],
    contact_channels: {
      linkedin: 'lena-fischer-data',
      email: 'lena@example.com',
    },
    follow_up_days: 14,
  },
]

function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search by name, company, or tag…"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function FilterTag({ label, active, onClick }) {
  return (
    <button
      className={`filter-tag ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default function App() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await fetch('/api/contacts')
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        setContacts(data.contacts ?? data)
      } catch (err) {
        // Fall back to demo data in dev / before D1 is wired up
        console.warn('API unavailable, using demo data:', err.message)
        setContacts(DEMO_CONTACTS)
      } finally {
        setLoading(false)
      }
    }
    loadContacts()
  }, [])

  // Collect all unique tags
  const allTags = [...new Set(
    contacts.flatMap(c => {
      const tags = Array.isArray(c.tags)
        ? c.tags
        : typeof c.tags === 'string'
          ? JSON.parse(c.tags || '[]')
          : []
      return tags
    })
  )].sort()

  // Filter contacts
  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || [
      c.name,
      c.role,
      c.company,
      c.how_met,
      c.notes,
    ].some(f => f?.toLowerCase().includes(q))

    const tags = Array.isArray(c.tags)
      ? c.tags
      : typeof c.tags === 'string'
        ? JSON.parse(c.tags || '[]')
        : []
    const matchTag = !activeTag || tags.includes(activeTag)

    return matchSearch && matchTag
  })

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-mark">🤝</span>
            <div>
              <h1>wemetat</h1>
              <p className="brand-sub">Your professional network, in context</p>
            </div>
          </div>
          <div className="header-stat">
            <span className="stat-num">{contacts.length}</span>
            <span className="stat-label">connections</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="controls">
          <SearchBar value={search} onChange={setSearch} />
          {allTags.length > 0 && (
            <div className="tag-filters">
              <FilterTag
                label="All"
                active={!activeTag}
                onClick={() => setActiveTag(null)}
              />
              {allTags.map(tag => (
                <FilterTag
                  key={tag}
                  label={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                />
              ))}
            </div>
          )}
          {filtered.length !== contacts.length && (
            <p className="result-count">
              Showing {filtered.length} of {contacts.length}
            </p>
          )}
        </div>

        <ContactGrid contacts={filtered} loading={loading} error={error} />
      </main>
    </div>
  )
}
